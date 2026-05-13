import { useState } from 'react'
import { predictTournament } from '../services/api'
import { Trophy, Loader2, BarChart, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ChampionPredictor({ players, tour }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const runSimulation = async () => {
    if (players.length < 2) return
    
    setLoading(true)
    setError(null)
    
    try {
      const playerNames = players.map(p => p.name)
      const data = await predictTournament(playerNames, tour, 10000)
      setResult(data)
    } catch (err) {
      setError('Simulation failed. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-wimbledon-gold" />
          Champion Predictor
        </h2>
        <button
          onClick={runSimulation}
          disabled={loading || players.length < 2}
          className="bg-wimbledon-green text-white px-5 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-50 hover:bg-green-700 transition font-medium"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Zap className="w-5 h-5" />
          )}
          {loading ? 'Simulating...' : 'Run 10K Simulations'}
        </button>
      </div>

      {/* Players in field */}
      <div className="flex flex-wrap gap-2 mb-6">
        {players.map(p => (
          <span 
            key={p.id}
            className="bg-gray-100 px-3 py-1.5 rounded-full text-sm flex items-center gap-1"
          >
            {p.flag} {p.name}
          </span>
        ))}
        {players.length === 0 && (
          <span className="text-gray-400 italic">No players selected</span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Champion Banner */}
            <div className="bg-gradient-to-r from-wimbledon-green via-green-600 to-wimbledon-purple rounded-xl p-6 text-white text-center mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
              <Trophy className="w-14 h-14 mx-auto mb-3 text-wimbledon-gold" />
              <p className="text-sm opacity-80">🏆 Predicted Champion</p>
              <h3 className="text-3xl font-bold mt-1">{result.champion}</h3>
              <p className="text-xl mt-2">
                {(result.champion_probability * 100).toFixed(1)}% probability
              </p>
            </div>

            {/* Field Probabilities */}
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Field Win Probabilities
            </h3>
            <div className="space-y-3">
              {Object.entries(result.field_probabilities)
                .slice(0, 10)
                .map(([name, prob], i) => {
                  const player = players.find(p => p.name === name)
                  return (
                    <motion.div 
                      key={name} 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <span className="w-6 text-gray-400 text-sm font-medium">{i + 1}</span>
                      <span className="text-lg">{player?.flag || '🎾'}</span>
                      <span className="flex-1 font-medium">{name}</span>
                      <div className="w-40 bg-gray-200 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${prob * 100}%` }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                          className="bg-gradient-to-r from-wimbledon-green to-green-400 h-3 rounded-full"
                        />
                      </div>
                      <span className="w-16 text-right text-sm font-semibold">
                        {(prob * 100).toFixed(1)}%
                      </span>
                    </motion.div>
                  )
                })}
            </div>

            <p className="text-xs text-gray-400 mt-6 text-center">
              Based on {result.simulations_run?.toLocaleString()} Monte Carlo simulations
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
