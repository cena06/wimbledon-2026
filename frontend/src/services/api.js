import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '[localhost](http://localhost:8000)'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
})

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const getPlayers = async (tour = null, search = null) => {
  const params = {}
  if (tour) params.tour = tour
  if (search) params.search = search
  
  const response = await api.get('/api/players', { params })
  return response.data.players
}

export const getPlayer = async (name) => {
  const response = await api.get(`/api/players/${encodeURIComponent(name)}`)
  return response.data
}

export const getH2H = async (player1, player2) => {
  const response = await api.get('/api/h2h', {
    params: { player1, player2 }
  })
  return response.data
}

export const predictMatch = async (player1, player2) => {
  const response = await api.post('/api/predict/match', null, {
    params: { player1, player2 }
  })
  return response.data
}

export const predictTournament = async (players, tour, simulations = 10000) => {
  const response = await api.post('/api/predict/tournament', players, {
    params: { tour, simulations }
  })
  return response.data
}

export const getRankings = async (tour) => {
  const response = await api.get(`/api/rankings/${tour}`)
  return response.data
}

export const getUpsetFactor = async (players) => {
  const response = await api.get('/api/stats/upset-factor', {
    params: { players }
  })
  return response.data
}

export default api