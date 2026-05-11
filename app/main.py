from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import logging

from app.config import settings
from app.data_loader import DataLoader
from app.prediction_engine import PredictionEngine
from app.models import HealthResponse, MatchPrediction, TournamentResult

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered tennis prediction API for Wimbledon 2026",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
origins = settings.allowed_origins.split(",") if settings.allowed_origins != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize data loader and prediction engine
try:
    data_loader = DataLoader(settings.data_path)
    prediction_engine = PredictionEngine(data_loader)
    logger.info("Data loaded successfully")
except Exception as e:
    logger.error(f"Failed to load data: {e}")
    data_loader = None
    prediction_engine = None


@app.get("/", response_model=HealthResponse)
def root():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy" if data_loader else "degraded",
        version=settings.app_version,
        players_loaded=data_loader.total_players() if data_loader else 0
    )


@app.get("/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint."""
    return root()


@app.get("/api/players")
def get_players(
    tour: Optional[str] = Query(None, description="Filter by tour: ATP or WTA"),
    limit: int = Query(100, ge=1, le=100, description="Max results"),
    search: Optional[str] = Query(None, description="Search by player name")
):
    """Get all players with optional filtering."""
    
    if not data_loader:
        raise HTTPException(status_code=503, detail="Data not loaded")
    
    if tour:
        df = data_loader.get_players_by_tour(tour.upper())
    else:
        df = data_loader.get_all_players()
    
    if search:
        df = df[df['name'].str.lower().str.contains(search.lower())]
    
    players = df.head(limit).to_dict(orient='records')
    
    return {
        "players": players,
        "total": len(players),
        "tour": tour
    }


@app.get("/api/players/{player_name}")
def get_player(player_name: str):
    """Get detailed info for a single player."""
    
    if not data_loader:
        raise HTTPException(status_code=503, detail="Data not loaded")
    
    player = data_loader.get_player_by_name(player_name)
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    return player


@app.get("/api/h2h")
def get_head_to_head(
    player1: str = Query(..., description="First player name"),
    player2: str = Query(..., description="Second player name")
):
    """Get head-to-head record and win probability."""
    
    if not data_loader or not prediction_engine:
        raise HTTPException(status_code=503, detail="Service unavailable")
    
    p1 = data_loader.get_player_by_name(player1)
    p2 = data_loader.get_player_by_name(player2)
    
    if not p1:
        raise HTTPException(status_code=404, detail=f"Player not found: {player1}")
    if not p2:
        raise HTTPException(status_code=404, detail=f"Player not found: {player2}")
    
    if p1['tour'] != p2['tour']:
        raise HTTPException(status_code=400, detail="Players must be from same tour")
    
    h2h = data_loader.get_h2h(player1, player2, p1['tour'])
    p1_prob, p2_prob = prediction_engine.calculate_win_probability(p1, p2, h2h)
    
    return {
        'player1': {
            'name': player1,
            'model_score': p1.get('model_score'),
            'win_probability': p1_prob
        },
        'player2': {
            'name': player2,
            'model_score': p2.get('model_score'),
            'win_probability': p2_prob
        },
        'h2h': h2h or {'overall': 'N/A', 'grass': 'N/A', 'slam': 'N/A'},
        'predicted_winner': player1 if p1_prob > p2_prob else player2
    }


@app.post("/api/predict/match", response_model=MatchPrediction)
def predict_match(
    player1: str = Query(..., description="First player name"),
    player2: str = Query(..., description="Second player name")
):
    """Predict outcome of a single match."""
    
    if not prediction_engine:
        raise HTTPException(status_code=503, detail="Service unavailable")
    
    try:
        result = prediction_engine.predict_match(player1, player2)
        return MatchPrediction(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/predict/tournament", response_model=TournamentResult)
def predict_tournament(
    players: List[str],
    tour: str = Query(..., description="ATP or WTA"),
    simulations: int = Query(10000, ge=100, le=50000, description="Number of simulations")
):
    """Simulate tournament and predict champion."""
    
    if not prediction_engine:
        raise HTTPException(status_code=503, detail="Service unavailable")
    
    if len(players) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 players")
    
    if tour.upper() not in ["ATP", "WTA"]:
        raise HTTPException(status_code=400, detail="Tour must be ATP or WTA")
    
    try:
        result = prediction_engine.simulate_tournament(players, tour.upper(), simulations)
        return TournamentResult(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/rankings/{tour}")
def get_rankings(tour: str):
    """Get current rankings for a tour."""
    
    if not data_loader:
        raise HTTPException(status_code=503, detail="Data not loaded")
    
    if tour.upper() not in ["ATP", "WTA"]:
        raise HTTPException(status_code=400, detail="Tour must be ATP or WTA")
    
    df = data_loader.get_players_by_tour(tour.upper())
    
    rankings = df.sort_values('rank')[
        ['rank', 'name', 'country', 'flag', 'points', 'model_score', 'odds']
    ].to_dict(orient='records')
    
    return {'tour': tour.upper(), 'rankings': rankings}


@app.get("/api/stats/upset-factor")
def get_upset_factor(players: List[str] = Query(...)):
    """Calculate upset potential for given field."""
    
    if not prediction_engine:
        raise HTTPException(status_code=503, detail="Service unavailable")
    
    factor = prediction_engine.calculate_upset_factor(players)
    
    return {
        'players': players,
        'upset_factor': factor,
        'interpretation': 'High' if factor > 0.3 else 'Medium' if factor > 0.15 else 'Low'
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)