import { Share2, TrendingUp, TrendingDown } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Button from '../../components/ui/Button'
import ProgressBar from '../../components/ui/ProgressBar'
import { mockWeeklyAnalysis } from '../../api/mockData'
import { formatDate } from '../../utils/format'
import toast from 'react-hot-toast'

const iconMap = { macro: '🥗', steps: '👟', workout: '💪', body: '⚖️', attendance: '📅' }

const colorConfig = {
  green: { bg: 'bg-emerald-50', border: 'border-emerald-200', score: 'text-emerald-600', bar: 'green' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', score: 'text-amber-600', bar: 'amber' },
  red: { bg: 'bg-red-50', border: 'border-red-200', score: 'text-red-600', bar: 'red' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', score: 'text-blue-600', bar: 'blue' },
}

export default function WeeklyAnalysis() {
  const { weekStart, weekEnd, insights } = mockWeeklyAnalysis
  const overallScore = Math.round(insights.reduce((a, i) => a + i.score, 0) / insights.length)

  const getLabel = (s) => s >= 90 ? 'Excellent week' : s >= 75 ? 'Strong week' : s >= 60 ? 'Decent week' : 'Needs work'

  return (
    <Layout title="Weekly Analysis">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Weekly Report</h1>
            <p className="text-xs text-gray-500 mt-0.5">{formatDate(weekStart, 'MMM d')} – {formatDate(weekEnd, 'MMM d, yyyy')}</p>
          </div>
          <button onClick={() => toast.success('Copied!')} className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600">
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Overall score */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                <circle cx="40" cy="40" r="32" fill="none" stroke="white" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 32 * overallScore / 100} ${2 * Math.PI * 32}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{overallScore}</span>
              </div>
            </div>
            <div>
              <p className="text-teal-200 text-xs">Overall score</p>
              <p className="text-2xl font-bold">{getLabel(overallScore)}</p>
              <p className="text-teal-200 text-xs mt-1">Generated every Monday</p>
            </div>
          </div>
        </div>

        {/* Numbers at a glance */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Avg. cal', value: '1,944', sub: 'target 2,100', icon: '🍽️' },
            { label: 'Avg. steps', value: '8.6k', sub: 'target 10k', icon: '👟' },
            { label: 'Weight', value: '−0.5kg', sub: 'this week', icon: '⚖️' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
              <span className="text-xl">{s.icon}</span>
              <p className="text-sm font-bold text-gray-900 mt-1">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Insight cards */}
        <div className="space-y-3">
          {insights.map(insight => {
            const c = colorConfig[insight.color] || colorConfig.green
            return (
              <div key={insight.type} className={`bg-white rounded-2xl border shadow-sm p-4 ${c.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${c.bg}`}>
                      {iconMap[insight.type]}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{insight.title}</p>
                  </div>
                  <p className={`text-lg font-bold ${c.score}`}>{insight.score}</p>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-2">{insight.detail}</p>
                <ProgressBar value={insight.score} max={100} color={c.bar} height="xs" />
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-gray-400 pb-2">
          Next analysis: Monday, May 11 · Covering May 5–11
        </p>
      </div>
    </Layout>
  )
}
