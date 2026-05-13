import { useState } from 'react'
import { Download, FileSpreadsheet, FileJson, FileImage, Share2, Copy, Check, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { exportToCSV, exportToJSON, exportBracketToImage, copyToClipboard } from '../services/exportService'

export default function ExportMenu({ data, type = 'players', elementId = null, filename = 'wimbledon-2026-export' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(null)

  const handleExportCSV = async () => {
    setExporting('csv')
    try {
      const csvData = Array.isArray(data) ? data.map(p => ({
        Name: p.name,
        Country: p.country,
        Rank: p.rank,
        Points: p.points,
        'Model Score': p.model_score,
        Odds: p.odds
      })) : [data]
      exportToCSV(csvData, filename)
    } finally {
      setExporting(null)
      setIsOpen(false)
    }
  }

  const handleExportJSON = () => {
    setExporting('json')
    exportToJSON(data, filename)
    setExporting(null)
    setIsOpen(false)
  }

  const handleExportImage = async () => {
    if (!elementId) return
    setExporting('image')
    try {
      await exportBracketToImage(elementId, filename)
    } finally {
      setExporting(null)
      setIsOpen(false)
    }
  }

  const handleShare = async () => {
    const text = `Check out my Wimbledon 2026 predictions! 🎾🏆`
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const options = [
    { id: 'csv', label: 'Export CSV', icon: FileSpreadsheet, action: handleExportCSV },
    { id: 'json', label: 'Export JSON', icon: FileJson, action: handleExportJSON },
    ...(elementId ? [{ id: 'image', label: 'Save as Image', icon: FileImage, action: handleExportImage }] : []),
    { id: 'share', label: copied ? 'Copied!' : 'Copy Share Text', icon: copied ? Check : Share2, action: handleShare }
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium"
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border z-50 py-2 min-w-[180px]"
            >
              {options.map((option) => {
                const Icon = option.icon
                const isLoading = exporting === option.id
                return (
                  <button
                    key={option.id}
                    onClick={option.action}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-left disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="text-sm">{option.label}</span>
                  </button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
