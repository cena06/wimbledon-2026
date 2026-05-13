import { Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
} from 'chart.js'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

export default function PlayerCard({ player, expanded = false, onClick }) {
  const radarData = {
    labels: ['Grass', 'Age Peak', 'Slam Pressure', 'Surface Fit', 'Momentum'],
    datasets: [{
      data: [
        player.grass_score || 0,
        player.age_peak_score || 0,
        player.slam_pressure_score || 0,
        player.surface_fit_score || 0,
        player.momentum_score || 0
      ],
      backgroundColor: 'rgba(0, 102, 51, 0.3)',
      borderColor: '#006633',
      borderWidth: 2,
      pointBackgroundColor: '#006633'
    }]
  }

  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 20,
        ticks: { stepSize: 5, display: false },
        pointLabels: { font: { size: 10 } }
      }
    },
    plugins: { legend: { display: false } },
    maintainAspectRatio: true
  }

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : ''
      }`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{player.flag || '🎾'}</span>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{player.name}</h3>
              <p className="text-sm text-gray-500">{player.country} · {player.tour}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-wimbledon-green">
              {player.model_score?.toFixed(1) || '—'}
            </div>
            <p className="text-xs text-gray-500">Score</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Rank', value: `#${player.rank}` },
            { label: 'Age', value: player.age },
            { label: 'Pts', value: player.points?.toLocaleString() },
            { label: 'Odds', value: player.odds || '—' }
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-sm font-semibold text-gray-800">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="animate-fade-in">
            {/* Radar Chart */}
            <div className="h-48 mb-4">
              <Radar data={radarData} options={radarOptions} />
            </div>

            {/* Score Bars */}
            <div className="space-y-2 mb-4">
              {[
                { label: '🌿 Grass', value: player.grass_score },
                { label: '📈 Age Peak', value: player.age_peak_score },
                { label: '🏆 Slam', value: player.slam_pressure_score },
                { label: '⚡ Surface', value: player.surface_fit_score },
                { label: '🔥 Momentum', value: player.momentum_score }
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-24 text-xs">{label}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-wimbledon-green h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((value || 0) / 20) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-xs text-right">{value || 0}</span>
                </div>
              ))}
            </div>

            {/* Strengths & Risks */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-green-50 rounded-lg p-3">
                <h4 className="font-semibold text-green-800 mb-1">💪 Strengths</h4>
                <p className="text-green-700 line-clamp-3">{player.strengths || 'N/A'}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <h4 className="font-semibold text-red-800 mb-1">⚠️ Key Risk</h4>
                <p className="text-red-700 line-clamp-3">{player.key_risk || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
