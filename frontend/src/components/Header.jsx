import { Link, useLocation } from 'react-router-dom'
import { Trophy, Users, Swords, BarChart3, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/players', label: 'Players', icon: Users },
    { path: '/matchup', label: 'Matchup', icon: Swords },
    { path: '/tournament', label: 'Tournament', icon: BarChart3 },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <header className="bg-wimbledon-green text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <Trophy className="w-8 h-8 text-wimbledon-gold" />
            <div>
              <h1 className="text-xl font-bold leading-tight">Wimbledon 2026</h1>
              <p className="text-xs text-green-200 leading-tight">AI Predictor</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  isActive(path)
                    ? 'bg-white/20 text-white'
                    : 'hover:bg-white/10 text-green-100 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-white/20">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive(path)
                    ? 'bg-white/20'
                    : 'hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
