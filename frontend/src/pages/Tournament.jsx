import { useState, useEffect } from 'react'
import { getPlayers } from '../services/api'
import PlayerSelector from '../components/PlayerSelector'
import ChampionPredictor from '../components/ChampionPredictor'
import ExportMenu from '../components/ExportMenu'
import ExportableView from '../components/ExportableView'
import { Plus, X, Users, Trophy } from 'lucide-react'

export default function Tournament() {
  const [tour, setTour] = useState('ATP')
  const [allPlayers, setAllPlayers] = useState([])
  const [selectedPlayers, setSelectedPlayers] = useState([])
  const [showSelector, setShowSelector] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getPlayers(tour)
      .then(players => {
        setAllPlayers(players)
        setSelectedPlayers([])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [tour])

  const addPlayer = (player) => {
    if (!selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers([...selectedPlayers, player])
    }
    setShowSelector(false)
  }

  const removePlayer = (playerId) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId))
  }

  const loadTopN = (n) => {
    const topN = allPlayers.slice(0, n)
    setSelectedPlayers(topN)
  }

  const clearAll = () => {
    setSelectedPlayers([])
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy className="w-8 h-8 text-wimbledon-gold" />
          Tournament Simulator
        </h1>
        <ExportMenu 
          data={selectedPlayers}
          type="predictions"
          elementId="tournament-export"
          filename={`wimbledon-2026-${tour.toLowerCase()}-simulation`}
        />
      </div>

      {/* Tour Toggle */}
      <div className="flex justify-center gap-2 mb-6">
        {['ATP', 'WTA'].map(t => (
          <button
            key={t}
            onClick={() => setTour(t)}
            className={`px-6 py-2.5 rounded-full font-semibold transition ${
              tour === t 
                ? 'bg-wimbledon-green text-white shadow-lg' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Quick Load Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {[8, 16, 32].map(n => (
          <button
            key={n}
            onClick={() => loadTopN(n)}
            disabled={loading}
            className="bg-gray-100 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Users className="w-4 h-4" />
            Top {n}
          </button>
        ))}
        {selectedPlayers.length > 0 && (
          <button
            onClick={clearAll}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-100 transition"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Selected Players */}
      <div className="bg-white rounded-xl shadow-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">
            Tournament Field ({selectedPlayers.length} players)
          </h3>
          <button
            onClick={() => setShowSelector(true)}
            className="bg-wimbledon-green text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-green-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Player
          </button>
        </div>

        {selectedPlayers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedPlayers.map(player => (
              <span
                key={player.id}
                className="bg-gray-100 pl-3 pr-2 py-1.5 rounded-full text-sm flex items-center gap-2 hover:bg-gray-200 transition"
              >
                <span>{player.flag}</span>
                <span className="font-medium">{player.name}</span>
                <button
                  onClick={() => removePlayer(player.id)}
                  className="text-gray-400 hover:text-red-500 transition p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">
            Add players to simulate the tournament
          </p>
        )}
      </div>

      {/* Champion Predictor */}
      <ExportableView id="tournament-export">
        <ChampionPredictor players={selectedPlayers} tour={tour} />
      </ExportableView>

      {/* Player Selector Modal */}
      {showSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Add Player</h3>
              <button 
                onClick={() => setShowSelector(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <PlayerSelector
              tour={tour}
              selectedPlayer={null}
              onSelect={addPlayer}
              placeholder="Search and select player..."
            />
          </div>
        </div>
      )}
    </div>
  )
}
