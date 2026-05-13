import { Link } from 'react-router-dom'
import { Users, Swords, Trophy, BarChart3, Zap, Database, Brain } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Home() {
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Player Database',
      description: '100 players with 5-dimension ratings, H2H records, and detailed analysis',
      link: '/players',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Swords className="w-8 h-8" />,
      title: 'Head-to-Head',
      description: 'Compare any two players with AI-powered win probability calculations',
      link: '/matchup',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Tournament Simulator',
      description: 'Monte Carlo simulation with 10,000 runs to predict the champion',
      link: '/tournament',
      color: 'from-wimbledon-green to-green-600'
    }
  ]

  const stats = [
    { value: '100', label: 'Players', icon: Users },
    { value: '5', label: 'Score Dimensions', icon: BarChart3 },
    { value: '35', label: 'H2H Records', icon: Database },
    { value: '10K', label: 'Simulations', icon: Brain }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-wimbledon-green via-green-700 to-wimbledon-purple text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <Trophy className="w-16 h-16 text-wimbledon-gold" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
              Wimbledon 2026 Predictor
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto mb-8">
              AI-powered predictions using grass court performance, slam pressure, 
              head-to-head records, and real-time form analysis
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/tournament"
                className="bg-white text-wimbledon-green px-8 py-3 rounded-full font-bold text-lg hover:bg-green-50 transition flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Start Predicting
              </Link>
              <Link
                to="/players"
                className="bg-white/20 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-white/30 transition"
              >
                Explore Players
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Prediction Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={feature.link}
                  className="block bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all hover:-translate-y-1 group h-full"
                >
                  <div className={`bg-gradient-to-br ${feature.color} text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Data Coverage</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-wimbledon-gold" />
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
