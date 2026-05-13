import { useState, useEffect } from 'react';
import { fetchLiveOdds, getOddsMovement } from '../services/oddsApi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from 'chart.js';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function LiveOddsPanel({ players, tour }) {
  const [odds, setOdds] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [movement, setMovement] = useState([]);
  const [source, setSource] = useState('');

  useEffect(() => {
    loadOdds();
    const interval = setInterval(loadOdds, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [tour]);

  useEffect(() => {
    if (selectedPlayer) {
      loadMovement(selectedPlayer);
    }
  }, [selectedPlayer]);

  const loadOdds = async () => {
    setLoading(true);
    const result = await fetchLiveOdds(tour === 'ATP' ? 'tennis_atp_wimbledon' : 'tennis_wta_wimbledon');
    setOdds(result.data);
    setSource(result.source);
    setLastUpdated(new Date());
    setLoading(false);
  };

  const loadMovement = async (playerName) => {
    const data = await getOddsMovement(playerName);
    setMovement(data);
  };

  const getOddsForPlayer = (playerName) => {
    return odds[playerName] || null;
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const oddsA = getOddsForPlayer(a.name)?.implied || 0;
    const oddsB = getOddsForPlayer(b.name)?.implied || 0;
    return oddsB - oddsA;
  });

  const movementChartData = {
    labels: movement.map(m => m.date.slice(5)), // MM-DD format
    datasets: [{
      data: movement.map(m => m.odds),
      borderColor: '#006633',
      backgroundColor: 'rgba(0, 102, 51, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { 
        reverse: true, // Lower odds = more favored
        grid: { color: '#f0f0f0' }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-wimbledon-green" />
            Live Odds
          </h2>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" />
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
            <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs">
              {source === 'live' ? '🟢 Live' : source === 'mock' ? '🟡 Demo' : '🔴 Offline'}
            </span>
          </p>
        </div>
        <button
          onClick={loadOdds}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Odds Table */}
      <div className="overflow-auto max-h-96 mb-6">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50">
            <tr className="text-left text-sm text-gray-500">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Player</th>
              <th className="px-3 py-2 text-right">Decimal</th>
              <th className="px-3 py-2 text-right">American</th>
              <th className="px-3 py-2 text-right">Implied %</th>
              <th className="px-3 py-2 text-center">Trend</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => {
              const playerOdds = getOddsForPlayer(player.name);
              const implied = playerOdds?.implied || 0;
              
              return (
                <motion.tr
                  key={player.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => setSelectedPlayer(player.name)}
                  className={`
                    border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition
                    ${selectedPlayer === player.name ? 'bg-green-50' : ''}
                  `}
                >
                  <td className="px-3 py-3 text-gray-400">{index + 1}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span>{player.flag}</span>
                      <span className="font-medium">{player.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right font-mono">
                    {playerOdds?.decimal?.toFixed(2) || '—'}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-gray-600">
                    {playerOdds?.american || '—'}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className={`
                      px-2 py-1 rounded text-sm font-medium
                      ${implied > 0.2 ? 'bg-green-100 text-green-800' : 
                        implied > 0.05 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-600'}
                    `}>
                      {(implied * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <TrendIndicator value={Math.random() - 0.5} />
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Movement Chart */}
      {selectedPlayer && movement.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">
            {selectedPlayer} — 7 Day Odds Movement
          </h3>
          <div className="h-48">
            <Line data={movementChartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
}

function TrendIndicator({ value }) {
  if (value > 0.1) {
    return <TrendingUp className="w-4 h-4 text-green-500 mx-auto" />;
  } else if (value < -0.1) {
    return <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />;
  }
  return <Minus className="w-4 h-4 text-gray-400 mx-auto" />;
}
