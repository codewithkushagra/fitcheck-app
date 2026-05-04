import { useState } from 'react'
import { Plus, Trophy, Lock } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import ProgressBar from '../../components/ui/ProgressBar'
import { StepsBarChart } from '../../components/charts/BodyChart'
import { mockStepLogs, mockAchievements } from '../../api/mockData'
import { formatDate } from '../../utils/format'
import toast from 'react-hot-toast'

export default function StepsAchievements() {
  const [logs, setLogs] = useState(mockStepLogs)
  const [showLog, setShowLog] = useState(false)
  const [steps, setSteps] = useState('')

  const today = logs[logs.length - 1]
  const weekAvg = Math.round(logs.slice(-7).reduce((a, l) => a + l.steps, 0) / 7)
  const target = 10000

  const addSteps = () => {
    if (!steps) return
    setLogs(prev => {
      const updated = [...prev]
      updated[updated.length - 1] = { ...updated[updated.length - 1], steps: parseInt(steps) }
      return updated
    })
    toast.success('Steps updated!'); setShowLog(false); setSteps('')
  }

  const unlocked = mockAchievements.filter(a => a.unlocked)
  const locked = mockAchievements.filter(a => !a.unlocked)

  return (
    <Layout title="Steps">
      <div className="space-y-4 animate-fade-in">
        {/* Hero */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <p className="text-teal-200 text-sm">Today's steps</p>
            <button onClick={() => setShowLog(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-semibold">
              <Plus className="w-3.5 h-3.5" /> Update
            </button>
          </div>
          <p className="text-5xl font-bold">{today.steps.toLocaleString()}</p>
          <p className="text-teal-200 text-sm mt-1">/ {target.toLocaleString()} goal</p>
          <div className="mt-4 bg-white/20 rounded-full overflow-hidden h-2.5">
            <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, (today.steps / target) * 100)}%` }} />
          </div>
          <p className="text-teal-200 text-xs mt-2">
            {Math.max(0, target - today.steps).toLocaleString()} steps to go · {Math.min(100, Math.round((today.steps / target) * 100))}%
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
            <p className="text-lg font-bold text-gray-900">{(weekAvg / 1000).toFixed(1)}k</p>
            <p className="text-xs text-gray-500">7-day avg</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
            <p className="text-lg font-bold text-gray-900">{logs.filter(l => l.steps >= 10000).length}</p>
            <p className="text-xs text-gray-500">10k+ days</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
            <p className="text-lg font-bold text-gray-900">{(logs.reduce((a, l) => a + l.steps, 0) / 1000).toFixed(0)}k</p>
            <p className="text-xs text-gray-500">Total steps</p>
          </div>
        </div>

        {/* Weekly chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Last 7 Days</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-6 h-0.5 bg-emerald-500 inline-block rounded" /> 10k goal
            </div>
          </div>
          <StepsBarChart data={logs.slice(-7)} />
        </div>

        {/* Weekly streak circles */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">Weekly Streak</p>
          <div className="flex gap-2">
            {logs.slice(-7).map(l => (
              <div key={l.date} className="flex-1 flex flex-col items-center gap-1.5">
                <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold ${
                  l.steps >= 10000 ? 'bg-teal-500 text-white' :
                  l.steps >= 5000 ? 'bg-teal-200 text-teal-700' : 'bg-gray-100 text-gray-400'
                }`}>
                  {l.steps >= 10000 ? '✓' : l.steps >= 5000 ? '~' : '–'}
                </div>
                <p className="text-xs text-gray-400">{formatDate(l.date, 'EEE')[0]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <p className="text-sm font-semibold text-gray-900">Achievements</p>
            </div>
            <span className="text-xs text-gray-500">{unlocked.length}/{mockAchievements.length}</span>
          </div>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Unlocked</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {unlocked.map(a => (
              <div key={a.key} className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2.5">
                <span className="text-2xl shrink-0">{a.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{formatDate(a.unlockedAt, 'MMM d')}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">In Progress</p>
          <div className="space-y-3">
            {locked.map(a => (
              <div key={a.key} className="flex items-center gap-3">
                <div className="relative w-10 h-10 shrink-0">
                  <span className="text-2xl opacity-30">{a.icon}</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700">{a.title}</p>
                  <div className="mt-1">
                    <ProgressBar value={a.progress} max={a.target} height="xs" color="amber" showLabel />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Modal open={showLog} onClose={() => setShowLog(false)} title="Update Steps">
          <div className="space-y-4">
            <Input label="Step count" type="number" placeholder="e.g. 8500" value={steps} onChange={e => setSteps(e.target.value)} />
            <div className="grid grid-cols-3 gap-2">
              {[3000, 5000, 8000, 10000, 12000, 15000].map(n => (
                <button key={n} onClick={() => setSteps(n)}
                  className={`py-2 text-xs font-semibold rounded-xl border ${parseInt(steps) === n ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 text-gray-600'}`}>
                  {(n / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowLog(false)}>Cancel</Button>
              <Button className="flex-1" onClick={addSteps} disabled={!steps}>Save</Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}
