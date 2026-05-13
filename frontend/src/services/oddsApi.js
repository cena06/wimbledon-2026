const MOCK_ODDS = {
  'Carlos Alcaraz': { decimal: 2.20, implied: 0.36, american: '+120' },
  'Jannik Sinner': { decimal: 2.20, implied: 0.36, american: '+120' },
  'Novak Djokovic': { decimal: 13.00, implied: 0.074, american: '+1200' },
  'Alexander Zverev': { decimal: 21.00, implied: 0.035, american: '+2000' },
  'Jack Draper': { decimal: 26.00, implied: 0.028, american: '+2500' },
  'Iga Swiatek': { decimal: 2.75, implied: 0.36, american: '+175' },
  'Aryna Sabalenka': { decimal: 3.75, implied: 0.27, american: '+275' },
  'Elena Rybakina': { decimal: 10.00, implied: 0.10, american: '+900' },
  'Coco Gauff': { decimal: 10.00, implied: 0.10, american: '+900' },
}

export const fetchLiveOdds = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  return { success: true, data: MOCK_ODDS, source: 'demo' }
}

export const fetchMatchOdds = async (player1, player2) => {
  const p1Score = MOCK_ODDS[player1]?.implied || 0.5
  const p2Score = MOCK_ODDS[player2]?.implied || 0.5
  const total = p1Score + p2Score
  
  return {
    success: true,
    data: {
      player1: {
        name: player1,
        decimal: (1 / (p1Score / total)).toFixed(2),
        implied: (p1Score / total).toFixed(3)
      },
      player2: {
        name: player2,
        decimal: (1 / (p2Score / total)).toFixed(2),
        implied: (p2Score / total).toFixed(3)
      }
    },
    source: 'calculated'
  }
}

export const getOddsMovement = async (playerName, days = 7) => {
  const baseOdds = MOCK_ODDS[playerName]?.decimal || 10
  const movement = []
  
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const variance = (Math.random() - 0.5) * 2
    movement.push({
      date: date.toISOString().split('T')[0],
      odds: Math.max(1.1, baseOdds + variance)
    })
  }

  return movement
}
