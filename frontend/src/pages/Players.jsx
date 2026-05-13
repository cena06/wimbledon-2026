import { useState, useEffect } from 'react'
import { getPlayers } from '../services/api'
import PlayerCard from '../components/PlayerCard'
import ExportMenu from '../components/ExportMenu'
import { Search, Filter } from 'lucide-react'

export default function Players() {
  const [tour, setTour] = useState('ATP')
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    setLoading(true)
    getPlayers(tour)
      .then(setPlayers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [tour])

  const filtered = players.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.country?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">🎾 Player Database</h1>
        <ExportMenu 
          data={filtered}
          type="players"
          filename={`wimbledon-2026-${tour.toLowerCase()}-players`}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="flex gap-2">
          {['ATP', 'WTA'].map(t => (
            <button
              key={t}
              onClick={() => setTour(t)}
              className={`px-6 py-2.5 rounded-full font-semibold transition ${
                tour === t 
                  ? 'bg-wimbledon-green text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t} Top 50
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="flex items-center gap-2 bg-white border rounded-lg px-4 py-2.5 shadow-sm">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players..."
              className="outline-none flex-1"
            />
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {filtered.length} players
        </div>
      </div>

      {/* Player Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-12 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(player => (
            <PlayerCard 
              key={player.id}
              player={player} 
              expanded={expandedId === player.id}
              onClick={() => setExpandedId(expandedId === player.id ? null : player.id)}
            />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Filter className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No players found matching your search</p>
        </div>
      )}
    </div>
  )
}
