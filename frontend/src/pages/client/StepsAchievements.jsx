import { useState, useEffect } from 'react'
import { Plus, Trophy, Flame } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import ProgressBar from '../../components/ui/ProgressBar'
import { StepsBarChart } from '../../components/charts/BodyChart'
import api from '../../api/axios'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const STEP_TARGET = 10000

// Local achievements computed from real step data
function computeAchievements(logs) {
  const total = logs.reduce((a, l) => a + l.stepCount, 0)
  const streak = (() => {
    let s = 0
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i].stepCount >= STEP_TARGET) s++
      else break
    }
    return s
  })()
  return [
    { id: 'first', label: 'First Steps', desc: 'Log your first day', icon: '👣', unlocked: logs.length > 0 },
    { id: '10k', label: '10K Club', desc: 'Hit 10,000 steps in a day', icon: '🏅', unlocked: logs.some(l => l.stepCount >= 10000) },
    { id: 'streak3', label: '3-Day Streak', desc: '3 consecutive goal days', icon: '🔥', unlocked: streak >= 3 },
    { id: 'streak7', label: 'Week Warrior', desc: '7 consecutive goal days', icon: '⚡', unlocked: streak >= 7 },
    { id: '100k', label: '100K Steps', desc: '100,000 total steps', icon: '💎', unlocked: total >= 100000 },
    { id: '500k', label: '500K Legend', desc: '500,000 total steps', icon: '🏆', unlocked: total >= 500000 },
  ]
}

export default function StepsAchievements() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLog, setShowLog] = useState(false)
  const [steps, setSteps] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/steps/logs?limit=30').then(res => setLogs(res.data || [])).catch(() => setLogs([])).finally(() => setLoading(false))
  }, [])

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const todayLog = logs.find(l => l.date === todayStr)
  const todaySteps = todayLog?.stepCount || 0
  const weekLogs = logs.slice(-7)
  const weekAvg = weekLogs.length ? Math.round(weekLogs.reduce((a, l) => a + l.stepCount, 0) / weekLogs.length) : 0
  const achievements = computeAchievements(logs)
  const unlocked = achievements.filter(a => a.unlocked)
  const locked = achievements.filter(a => !a.unlocked)

  const chartData = weekLogs.map(l => ({
    date: l.date,
    steps: l.stepCount,
  }))

  const updateSteps = async () => {
    if (!steps || isNaN(Number(steps))) { toast.error('Enter valid steps'); return }
    setSaving(true)
    try {
      const res = await api.post('/steps/logs', { date: todayStr, stepCount: parseInt(steps) })
      setLogs(prev => {
        const filtered = prev.filter(l => l.date !== todayStr)
        return [...filtered, res.data].sort((a, b) => a.date.localeCompare(b.date))
      })
      toast.success('Steps updated!')
      setShowLog(false); setSteps('')
    } catch { toast.error('Failed to save') } finally { setSaving(false) }
  }

  return (
    <Layout title="Steps">
      <div className="space-y-4 animate-fade-in">
        {/* Hero */}
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <p className="text-teal-200 text-sm">Today's steps</p>
            <button
              onClick={() => setShowLog(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Update
            </button>
          </div>
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <p className="text-5xl font-bold">{todaySteps.toLocaleString()}</p>
              <p className="text-teal-200 text-sm mt-1">/ {STEP_TARGET.toLocaleString()} goal</p>
              <div className="mt-4 bg-white/20 rounded-full overflow-hidden h-2.5">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(100, (todaySteps / STEP_TARGET) * 100)}%` }} />
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-teal-200">
                <span>{Math.round((todaySteps / STEP_TARGET) * 100)}% of goal</span>
                <span>7-day avg: {weekAvg.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        {/* Week chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm font-bold text-gray-900 mb-3">Last 7 Days</p>
            <StepsBarChart data={chartData} target={STEP_TARGET} />
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'This Week', value: weekLogs.reduce((a, l) => a + l.stepCount, 0).toLocaleString(), sub: 'total steps' },
            { label: 'Daily Avg', value: weekAvg.toLocaleString(), sub: 'last 7 days' },
            { label: 'Goal Days', value: weekLogs.filter(l => l.stepCount >= STEP_TARGET).length, sub: 'this week' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-bold text-gray-900">Achievements</p>
            <span className="ml-auto text-xs text-gray-400">{unlocked.length}/{achievements.length} unlocked</span>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            {achievements.map(a => (
              <div key={a.id} className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${a.unlocked ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                <span className="text-xl shrink-0">{a.icon}</span>
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${a.unlocked ? 'text-amber-700' : 'text-gray-400'}`}>{a.label}</p>
                  <p className="text-[10px] text-gray-400 truncate">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={showLog} onClose={() => setShowLog(false)} title="Update Steps">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Enter your total step count for today</p>
          <input
            type="number" min="0" max="100000"
            className="w-full px-4 py-3 text-xl font-bold text-center border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50"
            placeholder="0"
            value={steps}
            onChange={e => setSteps(e.target.value)}
            autoFocus
          />
          {todaySteps > 0 && <p className="text-xs text-gray-400 text-center">Current: {todaySteps.toLocaleString()} steps</p>}
          <Button onClick={updateSteps} className="w-full" loading={saving}>Save Steps</Button>
        </div>
      </Modal>
    </Layout>
  )
}
