import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import ProgressBar from '../../components/ui/ProgressBar'
import api from '../../api/axios'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const iconMap = { calories: '🥗', steps: '👟', workout: '💪', body: '⚖️', attendance: '📅' }
const colorConfig = {
  green: { bg: 'bg-emerald-50', border: 'border-emerald-200', score: 'text-emerald-600', bar: 'green' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', score: 'text-amber-600', bar: 'amber' },
  red: { bg: 'bg-red-50', border: 'border-red-200', score: 'text-red-600', bar: 'red' },
}

export default function WeeklyAnalysis() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async (showToast = false) => {
    if (showToast) setRefreshing(true)
    try {
      const res = await api.get('/analysis/weekly')
      setData(res.data)
      if (showToast) toast.success('Refreshed!')
    } catch {
      if (showToast) toast.error('Failed to refresh')
    } finally {
      setLoading(false); setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const overallScore = data?.insights?.length
    ? Math.round(data.insights.reduce((a, i) => a + i.score, 0) / data.insights.length)
    : 0

  const getLabel = s => s >= 90 ? 'Excellent week' : s >= 75 ? 'Strong week' : s >= 60 ? 'Good week' : 'Keep going!'

  return (
    <Layout title="Weekly Analysis">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Weekly Report</h1>
            {data && <p className="text-xs text-gray-500 mt-0.5">{format(new Date(data.weekStart + 'T00:00:00'), 'MMM d')} – {format(new Date(data.weekEnd + 'T00:00:00'), 'MMM d, yyyy')}</p>}
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-400 mt-3">Generating your report…</p>
          </div>
        ) : data ? (
          <>
            {/* Overall score */}
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
              <p className="text-teal-200 text-xs font-medium uppercase tracking-wide">Overall Score</p>
              <p className="text-5xl font-bold mt-1">{overallScore}<span className="text-2xl font-normal text-teal-300">/100</span></p>
              <p className="text-teal-200 text-sm mt-1">{getLabel(overallScore)}</p>
              <div className="mt-3 bg-white/20 rounded-full overflow-hidden h-2">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${overallScore}%` }} />
              </div>
            </div>

            {/* Insight cards */}
            <div className="space-y-3">
              {data.insights.map((insight, i) => {
                const cfg = colorConfig[insight.color] || colorConfig.amber
                return (
                  <div key={i} className={`rounded-2xl border p-4 ${cfg.bg} ${cfg.border}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0">{iconMap[insight.type] || '📊'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-gray-900">{insight.title}</p>
                          <span className={`text-sm font-bold shrink-0 ${cfg.score}`}>{insight.score}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{insight.detail}</p>
                        <div className="mt-2">
                          <ProgressBar value={insight.score} max={100} height="sm" color={cfg.bar} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center px-4">
            <span className="text-4xl">📊</span>
            <p className="text-sm font-semibold text-gray-900 mt-3">No data yet</p>
            <p className="text-xs text-gray-400 mt-1">Start logging food, steps, and body stats to see your report</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
