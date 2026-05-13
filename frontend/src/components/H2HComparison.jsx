import { useState, useEffect } from 'react'
import { getH2H } from '../services/api'
import { Swords, TrendingUp, Leaf, Trophy } from 'lucide-react'

export default function H2HComparison({ player1, player2 }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (player1 && player2) {
      setLoading(true)
      setError(null)
      getH2H(player1.name, player2.name)
        .then(setData)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    } else {
      setData(null)
    }
  }, [player1, player2])

  if (!player1 || !player2) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
        <Swords className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Select two players to compare</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-wimbledon-green border-t-transparent rounded-full mx-auto" />
        <p className="mt-3 text-gray-500">Analyzing matchup...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center text-red-500">
        <p>Error loading H2H data</p>
      </div>
    )
  }

  if (!data) return null

  const p1Prob = Math.round(data.player1.win_probability * 100)
  const p2Prob = Math.round(data.player2.win_probability * 100)

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="text-center">
          <span className="text-4xl">{player1.flag}</span>
          <h3 className="font-bold mt-1">{player1.name}</h3>
          <p className="text-sm text-gray-500">Score: {player1.model_score?.toFixed(1)}</p>
        </div>
        <div className="flex flex-col items-center">
          <Swords className="w-8 h-8 text-wimbledon-purple" />
          <span className="text-xs text-gray-400 mt-1">VS</span>
        </div>
        <div className="text-center">
          <span className="text-4xl">{player2.flag}</span>
          <h3 className="font-bold mt-1">{player2.name}</h3>
          <p className="text-sm text-gray-500">Score: {player2.model_score?.toFixed(1)}</p>
        </div>
      </div>

      {/* Win Probability Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-bold text-wimbledon-green">{p1Prob}%</span>
          <span className="text-gray-500">Win Probability</span>
          <span className="font-bold text-wimbledon-purple">{p2Prob}%</span>
        </div>
        <div className="flex h-4 rounded-full overflow-hidden shadow-inner">
          <div 
            className="bg-gradient-to-r from-wimbledon-green to-green-400 transition-all duration-700"
            style={{ width: `${p1Prob}%` }}
          />
          <div 
            className="bg-gradient-to-r from-purple-400 to-wimbledon-purple transition-all duration-700"
            style={{ width: `${p2Prob}%` }}
          />
        </div>
      </div>

      {/* H2H Records */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <RecordCard icon={<TrendingUp />} label="Overall" record={data.h2h?.overall} />
        <RecordCard icon={<Leaf />} label="On Grass" record={data.h2h?.grass} />
        <RecordCard icon={<Trophy />} label="At Slams" record={data.h2h?.slam} />
      </div>

      {/* Predicted Winner */}
      <div className="text-center bg-gradient-to-r from-wimbledon-green to-wimbledon-purple rounded-xl p-5 text-white">
        <p className="text-sm opacity-80 mb-1">🎯 Predicted Winner</p>
        <h3 className="text-2xl font-bold">{data.predicted_winner}</h3>
        <p className="text-sm opacity-80 mt-1">
          {Math.max(p1Prob, p2Prob)}% confidence
        </p>
      </div>
    </div>
  )
}

function RecordCard({ icon, label, record }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 text-center">
      <div className="flex justify-center text-gray-400 mb-2">{icon}</div>
      <div className="text-xl font-bold text-gray-800">{record || 'N/A'}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}
