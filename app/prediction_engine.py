import numpy as np
from typing import Dict, List, Tuple, Optional
import random

class PredictionEngine:
    """Tennis match and tournament prediction engine."""
    
    def __init__(self, data_loader):
        self.data = data_loader
    
    def calculate_win_probability(
        self, 
        player1: Dict, 
        player2: Dict, 
        h2h: Optional[Dict] = None
    ) -> Tuple[float, float]:
        """Calculate win probability for player1 vs player2."""
        
        # Base probability from model scores
        score1 = player1.get('model_score', 50)
        score2 = player2.get('model_score', 50)
        score_diff = score1 - score2
        base_prob = self._sigmoid(score_diff / 15)
        
        # Adjust for H2H if available
        if h2h:
            h2h_factor = self._calculate_h2h_factor(h2h)
            final_prob = (base_prob * 0.6) + (h2h_factor * 0.4)
        else:
            final_prob = base_prob
        
        # Clamp between 0.05 and 0.95
        final_prob = max(0.05, min(0.95, final_prob))
        
        return round(final_prob, 3), round(1 - final_prob, 3)
    
    def _sigmoid(self, x: float) -> float:
        """Sigmoid function."""
        return 1 / (1 + np.exp(-x))
    
    def _calculate_h2h_factor(self, h2h: Dict) -> float:
        """Convert H2H record to probability factor."""
        factors = []
        weights = {'overall': 0.3, 'grass': 0.4, 'slam': 0.3}
        
        for key, weight in weights.items():
            record = h2h.get(key, '0-0')
            try:
                wins, losses = map(int, record.split('-'))
                total = wins + losses
                if total > 0:
                    # Laplace smoothing
                    factor = (wins + 1) / (total + 2)
                    factors.append(factor * weight)
                else:
                    factors.append(0.5 * weight)
            except:
                factors.append(0.5 * weight)
        
        return sum(factors)
    
    def predict_match(self, player1_name: str, player2_name: str) -> Dict:
        """Predict a single match outcome."""
        
        p1 = self.data.get_player_by_name(player1_name)
        p2 = self.data.get_player_by_name(player2_name)
        
        if not p1 or not p2:
            raise ValueError("Player not found")
        
        if p1['tour'] != p2['tour']:
            raise ValueError("Players must be from same tour")
        
        h2h = self.data.get_h2h(player1_name, player2_name, p1['tour'])
        p1_prob, p2_prob = self.calculate_win_probability(p1, p2, h2h)
        
        winner = player1_name if p1_prob > p2_prob else player2_name
        confidence = max(p1_prob, p2_prob)
        
        return {
            'player1': player1_name,
            'player2': player2_name,
            'p1_probability': p1_prob,
            'p2_probability': p2_prob,
            'winner': winner,
            'confidence': confidence,
            'h2h': h2h
        }
    
    def simulate_tournament(
        self, 
        players: List[str], 
        tour: str,
        simulations: int = 10000
    ) -> Dict:
        """Monte Carlo simulation of tournament."""
        
        # Get player data
        player_data = {}
        for name in players:
            p = self.data.get_player_by_name(name)
            if p:
                player_data[name] = p
        
        if len(player_data) < 2:
            raise ValueError("Need at least 2 valid players")
        
        # Run simulations
        win_counts = {name: 0 for name in player_data.keys()}
        
        for _ in range(simulations):
            winner = self._simulate_single_tournament(
                list(player_data.keys()), 
                player_data, 
                tour
            )
            win_counts[winner] += 1
        
        # Calculate probabilities
        probabilities = {
            name: round(count / simulations, 4) 
            for name, count in win_counts.items()
        }
        
        # Sort by probability
        sorted_probs = dict(sorted(
            probabilities.items(), 
            key=lambda x: x[1], 
            reverse=True
        ))
        
        champion = max(probabilities, key=probabilities.get)
        
        return {
            'champion': champion,
            'champion_probability': probabilities[champion],
            'field_probabilities': sorted_probs,
            'simulations_run': simulations
        }
    
    def _simulate_single_tournament(
        self, 
        players: List[str], 
        player_data: Dict,
        tour: str
    ) -> str:
        """Simulate a single tournament run."""
        
        remaining = players.copy()
        random.shuffle(remaining)
        
        while len(remaining) > 1:
            next_round = []
            
            for i in range(0, len(remaining), 2):
                if i + 1 < len(remaining):
                    p1, p2 = remaining[i], remaining[i + 1]
                    
                    h2h = self.data.get_h2h(p1, p2, tour)
                    p1_prob, _ = self.calculate_win_probability(
                        player_data[p1], 
                        player_data[p2], 
                        h2h
                    )
                    
                    winner = p1 if random.random() < p1_prob else p2
                    next_round.append(winner)
                else:
                    next_round.append(remaining[i])
            
            remaining = next_round
        
        return remaining[0]
    
    def calculate_upset_factor(self, players: List[str]) -> float:
        """Calculate upset potential for field."""
        
        if len(players) < 2:
            return 0.0
        
        scores = []
        for name in players:
            p = self.data.get_player_by_name(name)
            if p:
                scores.append(p.get('model_score', 0))
        
        if len(scores) < 2:
            return 0.0
        
        variance = np.var(scores)
        mean_score = np.mean(scores)
        
        upset_factor = min(1.0, variance / (mean_score + 1))
        
        return round(upset_factor, 3)