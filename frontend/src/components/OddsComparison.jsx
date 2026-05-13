import { useState, useEffect } from 'react';
import { fetchMatchOdds } from '../services/oddsApi';
import { Scale, DollarSign } from 'lucide-react';

export default function OddsComparison({ player1, player2 }) {
  const [odds, setOdds] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (player1 && player2) {
      loadMatchOdds();
    }
  }, [player1, player2]);

  const loadMatchOdds = async () => {
    setLoading(true);
    const result = await fetchMatchOdds(player1.name, player2.name);
    if (result.success) {
      setOdds(result.data);
    }
    setLoading(false);
  };

  if (!player1 || !player2) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mt-4">
      <h3 className="font-semibold flex items-center gap-2 mb-3">
        <DollarSign className="w-5 h-5 text-blue-600" />
        Betting Market Odds
      </h3>

      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading odds...</div>
      ) : odds ? (
        <div className="grid grid-cols-2 gap-4">
          <OddsCard 
            player={player1}
            odds={odds.player1}
          />
          <OddsCard 
            player={player2}
            odds={odds.player2}
          />
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">Odds unavailable</div>
      )}

      <p className="text-xs text-gray-500 mt-3 text-center">
        Odds are indicative and may differ from actual bookmaker prices
      </p>
    </div>
  );
}

function OddsCard({ player, odds }) {
  const implied = parseFloat(odds?.implied) || 0;
  
  return (
    <div className="bg-white rounded-lg p-3 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-xl">{player.flag}</span>
        <span className="font-medium">{player.name}</span>
      </div>
      
      <div className="text-3xl font-bold text-wimbledon-green mb-1">
        {odds?.decimal || '—'}
      </div>
      
      <div className="text-sm text-gray-500">
        {(implied * 100).toFixed(1)}% implied probability
      </div>
    </div>
  );
}
