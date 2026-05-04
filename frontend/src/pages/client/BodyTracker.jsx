import { useState, useEffect } from 'react'
import { Plus, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { WeightChart } from '../../components/charts/BodyChart'
import api from '../../api/axios'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function BodyTracker() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLog, setShowLog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ weight: '', waist: '', chest: '', arms: '' })
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    api.get('/body/logs').then(res => setLogs(res.data || [])).catch(() => setLogs([])).finally(() => setLoading(false))
  }, [])

  const latest = logs[logs.length - 1]
  const prev = logs[logs.length - 2]
  const weightDelta = latest && prev ? (latest.weightKg - prev.weightKg).toFixed(1) : null
  const totalDelta = logs.length > 1 ? (latest.weightKg - logs[0].weightKg).toFixed(1) : null

  const addLog = async () => {
    if (!form.weight) { toast.error('Weight is required'); return }
    setSaving(true)
    try {
      const res = await api.post('/body/logs', {
        date: format(new Date(), 'yyyy-MM-dd'),
        weightKg: parseFloat(form.weight),
        waistCm: form.waist ? parseFloat(form.waist) : null,
        chestCm: form.chest ? parseFloat(form.chest) : null,
        armsCm: form.arms ? parseFloat(form.arms) : null,
      })
      setLogs(prev => [...prev, res.data])
      toast.success('Logged!')
      setShowLog(false)
      setForm({ weight: '', waist: '', chest: '', arms: '' })
    } catch { toast.error('Failed to save') } finally { setSaving(false) }
  }

  const chartData = logs.map(l => ({ date: l.date, weight: l.weightKg }))

  return (
    <Layout title="Body Tracker">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Body Tracker</h1>
            <p className="text-xs text-gray-500 mt-0.5">{logs.length} measurements recorded</p>
          </div>
          <Button size="sm" onClick={() => setShowLog(true)}>
            <Plus className="w-4 h-4 mr-1" /> Log
          </Button>
        </div>

        {/* Current stats */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : latest ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 font-medium mb-1">Current Weight</p>
                <p className="text-2xl font-bold text-gray-900">{latest.weightKg}<span className="text-sm font-normal text-gray-400"> kg</span></p>
                {weightDelta !== null && (
                  <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${Number(weightDelta) < 0 ? 'text-emerald-600' : Number(weightDelta) > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {Number(weightDelta) < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : Number(weightDelta) > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                    {weightDelta > 0 ? '+' : ''}{weightDelta} kg since last
                  </div>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 font-medium mb-1">Total Change</p>
                <p className="text-2xl font-bold text-gray-900">{totalDelta !== null ? `${Number(totalDelta) > 0 ? '+' : ''}${totalDelta}` : '—'}<span className="text-sm font-normal text-gray-400"> kg</span></p>
                <p className="text-xs text-gray-400 mt-1">since first log</p>
              </div>
            </div>

            {/* Measurements */}
            {(latest.waistCm || latest.chestCm || latest.armsCm) && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-sm font-bold text-gray-900 mb-3">Latest Measurements</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Waist', val: latest.waistCm },
                    { label: 'Chest', val: latest.chestCm },
                    { label: 'Arms', val: latest.armsCm },
                  ].filter(m => m.val).map(m => (
                    <div key={m.label} className="text-center bg-gray-50 rounded-xl py-3">
                      <p className="text-lg font-bold text-gray-900">{m.val}</p>
                      <p className="text-[10px] text-gray-400">cm · {m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chart */}
            {chartData.length > 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-sm font-bold text-gray-900 mb-3">Weight Trend</p>
                <WeightChart data={chartData} />
              </div>
            )}

            {/* History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-bold text-gray-900">History</p>
              </div>
              <div className="divide-y divide-gray-50">
                {[...logs].reverse().slice(0, 10).map((log, i) => (
                  <div key={log.id || i} className="flex items-center px-4 py-3 gap-3">
                    <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-teal-700">{log.weightKg}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{log.weightKg} kg</p>
                      <p className="text-xs text-gray-400">{format(new Date(log.date + 'T00:00:00'), 'MMM d, yyyy')}</p>
                    </div>
                    <div className="text-right text-xs text-gray-400 shrink-0">
                      {log.waistCm && <p>W {log.waistCm}cm</p>}
                      {log.chestCm && <p>C {log.chestCm}cm</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center px-4">
            <span className="text-4xl">⚖️</span>
            <p className="text-sm font-semibold text-gray-900 mt-3">No measurements yet</p>
            <p className="text-xs text-gray-400 mt-1">Log your first weight to start tracking</p>
            <Button className="mt-4" size="sm" onClick={() => setShowLog(true)}>Log Now</Button>
          </div>
        )}
      </div>

      <Modal isOpen={showLog} onClose={() => setShowLog(false)} title="Log Body Stats">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Weight (kg) *</label>
            <input type="number" step="0.1" min="1"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50"
              placeholder="e.g. 75.5"
              value={form.weight} onChange={e => update('weight', e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-400">Optional measurements (cm)</p>
          <div className="grid grid-cols-3 gap-2">
            {[['waist', 'Waist'], ['chest', 'Chest'], ['arms', 'Arms']].map(([k, label]) => (
              <div key={k}>
                <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                <input type="number" step="0.5"
                  className="w-full px-2 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-center bg-gray-50"
                  placeholder="—"
                  value={form[k]} onChange={e => update(k, e.target.value)}
                />
              </div>
            ))}
          </div>
          <Button onClick={addLog} className="w-full" loading={saving}>Save</Button>
        </div>
      </Modal>
    </Layout>
  )
}
