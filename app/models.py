from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

class Tour(str, Enum):
    ATP = "ATP"
    WTA = "WTA"

class Player(BaseModel):
    id: int
    name: str
    country: str
    flag: str
    age: int
    rank: int
    points: float
    odds: str
    grass_score: float = Field(..., ge=0, le=20)
    age_peak_score: float = Field(..., ge=0, le=20)
    slam_pressure_score: float = Field(..., ge=0, le=20)
    surface_fit_score: float = Field(..., ge=0, le=20)
    momentum_score: float = Field(..., ge=0, le=20)
    model_score: float
    grass_notes: Optional[str] = None
    age_notes: Optional[str] = None
    slam_notes: Optional[str] = None
    surface_notes: Optional[str] = None
    momentum_notes: Optional[str] = None
    strengths: Optional[str] = None
    key_risk: Optional[str] = None
    tour: Tour

class H2HRecord(BaseModel):
    overall: str = "0-0"
    grass: str = "0-0"
    slam: str = "0-0"

class MatchPrediction(BaseModel):
    player1: str
    player2: str
    p1_probability: float
    p2_probability: float
    winner: str
    confidence: float
    h2h: Optional[Dict[str, str]] = None

class TournamentResult(BaseModel):
    champion: str
    champion_probability: float
    field_probabilities: Dict[str, float]
    simulations_run: int

class HealthResponse(BaseModel):
    status: str
    version: str
    players_loaded: int