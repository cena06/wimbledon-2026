import { useState, useEffect, useRef } from 'react'
import { getPlayers } from '../services/api'
import { Search, X, ChevronDown } from 'lucide-react'

export default function PlayerSelector({ tour, onSelect, selectedPlayer, placeholder = "Select a player..." }) {
  const [players, setPlayers] = useState([])
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    getPlayers(tour)
      .then(setPlayers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [tour])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = players.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (player) => {
    onSelect(player)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {selectedPlayer ? (
        <div 
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-between bg-white border-2 border-wimbledon-green rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedPlayer.flag}</span>
            <div>
              <span className="font-semibold">{selectedPlayer.name}</span>
              <span className="text-sm text-gray-500 ml-2">#{selectedPlayer.rank}</span>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onSelect(null) }}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-wimbledon-green transition text-left"
        >
          <div className="flex items-center gap-2 text-gray-500">
            <Search className="w-5 h-5" />
            <span>{placeholder}</span>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      )}

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-2xl max-h-80 overflow-hidden">
          {/* Search */}
          <div className="sticky top-0 bg-white p-3 border-b">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search players..."
                className="bg-transparent outline-none flex-1 text-sm"
                autoFocus
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Player List */}
          <div className="overflow-y-auto max-h-60">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No players found</div>
            ) : (
              filtered.map(player => (
                <button
                  key={player.id}
                  onClick={() => handleSelect(player)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left border-b border-gray-50 last:border-0"
                >
                  <span className="text-xl">{player.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{player.name}</div>
                    <div className="text-xs text-gray-500">
                      Rank #{player.rank} · Score: {player.model_score?.toFixed(1)}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
