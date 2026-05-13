import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Players from './pages/Players'
import Matchup from './pages/Matchup'
import Tournament from './pages/Tournament'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/players" element={<Players />} />
            <Route path="/matchup" element={<Matchup />} />
            <Route path="/tournament" element={<Tournament />} />
          </Routes>
        </main>
        <footer className="bg-gray-800 text-white py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-400">
              © 2026 Wimbledon Predictor · AI-Powered Tennis Analytics
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}