import pandas as pd
import numpy as np
import re
from typing import Dict, Tuple, Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class DataLoader:
    """Loads and processes Wimbledon 2026 prediction data from Excel."""
    
    SCORE_WEIGHTS = {
        'grass_score': 0.25,
        'age_peak_score': 0.15,
        'slam_pressure_score': 0.25,
        'surface_fit_score': 0.20,
        'momentum_score': 0.15
    }
    
    def __init__(self, excel_path: str):
        self.excel_path = Path(excel_path)
        if not self.excel_path.exists():
            raise FileNotFoundError(f"Data file not found: {excel_path}")
        
        self.atp_players: pd.DataFrame = pd.DataFrame()
        self.wta_players: pd.DataFrame = pd.DataFrame()
        self.men_h2h: Dict[Tuple[str, str], Dict] = {}
        self.women_h2h: Dict[Tuple[str, str], Dict] = {}
        self._load_data()
        
        logger.info(f"Loaded {len(self.atp_players)} ATP and {len(self.wta_players)} WTA players")
    
    def _load_data(self):
        """Load all data from Excel file."""
        try:
            # Load ATP players
            atp_df = pd.read_excel(
                self.excel_path, 
                sheet_name="ATP Top 50 Raw Input", 
                skiprows=2,
                engine='openpyxl'
            )
            self.atp_players = self._process_players(atp_df, "ATP")
            
            # Load WTA players
            wta_df = pd.read_excel(
                self.excel_path, 
                sheet_name="WTA Top 50 Raw Input", 
                skiprows=2,
                engine='openpyxl'
            )
            self.wta_players = self._process_players(wta_df, "WTA")
            
            # Load H2H matrices
            try:
                men_h2h_df = pd.read_excel(
                    self.excel_path, 
                    sheet_name="H2H Matrix - Men Top 20", 
                    skiprows=1,
                    engine='openpyxl'
                )
                self.men_h2h = self._process_h2h_matrix(men_h2h_df)
            except Exception as e:
                logger.warning(f"Could not load men's H2H: {e}")
            
            try:
                women_h2h_df = pd.read_excel(
                    self.excel_path, 
                    sheet_name="H2H Matrix - Women Top 15", 
                    skiprows=1,
                    engine='openpyxl'
                )
                self.women_h2h = self._process_h2h_matrix(women_h2h_df)
            except Exception as e:
                logger.warning(f"Could not load women's H2H: {e}")
                
        except Exception as e:
            logger.error(f"Failed to load data: {e}")
            raise
    
    def _process_players(self, df: pd.DataFrame, tour: str) -> pd.DataFrame:
        """Process and clean player data."""
        df = df.copy()
        
        # Expected columns by position
        expected_cols = [
            'id', 'name', 'country', 'flag', 'age', 'rank', 'points', 'odds',
            'grass_score', 'age_peak_score', 'slam_pressure_score', 
            'surface_fit_score', 'momentum_score', 'model_score',
            'grass_notes', 'age_notes', 'slam_notes', 'surface_notes',
            'momentum_notes', 'strengths', 'key_risk'
        ]
        
        # Rename columns by position
        col_mapping = {df.columns[i]: expected_cols[i] for i in range(min(len(df.columns), len(expected_cols)))}
        df = df.rename(columns=col_mapping)
        
        # Add tour
        df['tour'] = tour
        
        # Clean numeric columns
        numeric_cols = ['id', 'age', 'rank', 'points', 'grass_score', 'age_peak_score', 
                       'slam_pressure_score', 'surface_fit_score', 'momentum_score', 'model_score']
        
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        # Calculate model score if missing
        df['model_score'] = df.apply(
            lambda row: self._calculate_model_score(row) 
            if pd.isna(row.get('model_score')) or row.get('model_score') == 0 
            else row['model_score'],
            axis=1
        )
        
        # Convert ID to int
        if 'id' in df.columns:
            df['id'] = df['id'].astype(int)
        
        # Fill missing strings
        string_cols = ['name', 'country', 'flag', 'odds', 'grass_notes', 'age_notes', 
                      'slam_notes', 'surface_notes', 'momentum_notes', 'strengths', 'key_risk']
        for col in string_cols:
            if col in df.columns:
                df[col] = df[col].fillna('').astype(str)
        
        # Remove invalid rows
        if 'name' in df.columns:
            df = df[df['name'].str.strip() != '']
        
        return df.head(50)  # Top 50 only
    
    def _calculate_model_score(self, row) -> float:
        """Calculate composite model score from dimensions."""
        score = 0
        for col, weight in self.SCORE_WEIGHTS.items():
            val = row.get(col, 0)
            if pd.notna(val):
                score += float(val) * weight
        return round(score * 5, 2)  # Scale to ~100
    
    def _process_h2h_matrix(self, df: pd.DataFrame) -> Dict[Tuple[str, str], Dict]:
        """Process H2H matrix from Excel."""
        h2h = {}
        
        if df.empty:
            return h2h
        
        # First column contains player names
        players = df.iloc[:, 0].dropna().tolist()
        
        for i, p1 in enumerate(players):
            p1_clean = re.sub(r'^\d+\.\s*', '', str(p1)).strip()
            
            for j in range(1, len(df.columns)):
                if j - 1 >= len(players):
                    continue
                    
                p2_clean = re.sub(r'^\d+\.\s*', '', str(players[j - 1])).strip()
                
                if p1_clean == p2_clean:
                    continue
                
                cell_value = df.iloc[i, j]
                
                if pd.notna(cell_value) and str(cell_value) not in ['—', 'N/A', '-']:
                    record = self._parse_h2h_cell(str(cell_value))
                    h2h[(p1_clean, p2_clean)] = record
        
        return h2h
    
    def _parse_h2h_cell(self, cell: str) -> Dict[str, str]:
        """Parse H2H cell content."""
        record = {'overall': '0-0', 'grass': '0-0', 'slam': '0-0'}
        
        patterns = {
            'overall': r'All:(\d+-\d+)',
            'grass': r'Grass:(\d+-\d+)',
            'slam': r'Slam:(\d+-\d+)'
        }
        
        for key, pattern in patterns.items():
            match = re.search(pattern, cell)
            if match:
                record[key] = match.group(1)
        
        return record
    
    def get_all_players(self) -> pd.DataFrame:
        """Get combined ATP and WTA players."""
        return pd.concat([self.atp_players, self.wta_players], ignore_index=True)
    
    def get_players_by_tour(self, tour: str) -> pd.DataFrame:
        """Get players by tour."""
        if tour.upper() == "ATP":
            return self.atp_players
        elif tour.upper() == "WTA":
            return self.wta_players
        return self.get_all_players()
    
    def get_player_by_name(self, name: str) -> Optional[Dict]:
        """Get player by name."""
        all_players = self.get_all_players()
        mask = all_players['name'].str.lower() == name.lower()
        
        if mask.any():
            return all_players[mask].iloc[0].to_dict()
        return None
    
    def get_h2h(self, player1: str, player2: str, tour: str) -> Optional[Dict[str, str]]:
        """Get H2H record between two players."""
        h2h_matrix = self.men_h2h if tour.upper() == "ATP" else self.women_h2h
        
        if (player1, player2) in h2h_matrix:
            return h2h_matrix[(player1, player2)]
        elif (player2, player1) in h2h_matrix:
            original = h2h_matrix[(player2, player1)]
            return {k: self._flip_record(v) for k, v in original.items()}
        
        return None
    
    def _flip_record(self, record: str) -> str:
        """Flip a W-L record."""
        parts = record.split('-')
        if len(parts) == 2:
            return f"{parts[1]}-{parts[0]}"
        return record
    
    def total_players(self) -> int:
        """Get total player count."""
        return len(self.atp_players) + len(self.wta_players)