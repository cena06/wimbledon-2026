import { useState } from 'react'
import PlayerSelector from '../components/PlayerSelector'
import PlayerCard from '../components/PlayerCard'
import H2HComparison from '../components/H2HComparison'
import ExportMenu from '../components/ExportMenu'
import ExportableView from '../components/ExportableView'

export default function Matchup() {
  const [tour, setTour] = useState('ATP')
  const [player1, setPlayer1] = useState(null)
  const [player2, setPlayer2] = useState(null)

  const exportData = player1 && player2 ? {
    player1: player1.name,
    player2: player2.name,
    tour,
    timestamp: new Date().toISOString()
  } : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">⚔️ Head-to-Head</h1>
        {exportData && (
          <ExportMenu 
            data={exportData}
            type="predictions"
            elementId="matchup-export"
            filename={`h2h-${player1.name}-vs-${player2.name}`}
          />
        )}
      </div>

      {/* Tour Toggle */}
      <div className="flex justify-center gap-2 mb-8">
        {['ATP', 'WTA'].map(t => (
          <button
            key={t}
            onClick={() => { 
              setTour(t)
              setPlayer1(null)
              setPlayer2(null)
            }}
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

      <ExportableView id="matchup-export">
        {/* Player Selectors */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Player 1
            </label>
            <PlayerSelector 
              tour={tour}
              selectedPlayer={player1}
              onSelect={setPlayer1}
              placeholder="Select first player..."
            />
            {player1 && (
              <div className="mt-4">
                <PlayerCard player={player1} expanded />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Player 2
            </label>
            <PlayerSelector 
              tour={tour}
              selectedPlayer={player2}
              onSelect={setPlayer2}
              placeholder="Select second player..."
            />
            {player2 && (
              <div className="mt-4">
                <PlayerCard player={player2} expanded />
              </div>
            )}
          </div>
        </div>

        {/* H2H Comparison */}
        <H2HComparison player1={player1} player2={player2} />
      </ExportableView>
    </div>
  )
}
