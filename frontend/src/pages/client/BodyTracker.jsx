import { useState } from 'react'
import { Plus, Camera, TrendingDown, TrendingUp } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { WeightChart } from '../../components/charts/BodyChart'
import { mockBodyLogs } from '../../api/mockData'
import { formatDate } from '../../utils/format'
import toast from 'react-hot-toast'

export default function BodyTracker() {
  const [logs, setLogs] = useState(mockBodyLogs)
  const [showLog, setShowLog] = useState(false)
  const [form, setForm] = useState({ weight: '', waist: '', chest: '', arms: '' })
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const latest = logs[logs.length - 1]
  const prev = logs[logs.length - 2]
  const weightDelta = latest && prev ? (latest.weight - prev.weight).toFixed(1) : 0
  const totalDelta = logs.length > 1 ? (latest.weight - logs[0].weight).toFixed(1) : 0

  const addLog = () => {
    if (!form.weight) return
    setLogs(prev => [...prev, {
      date: '2026-05-04',
      weight: parseFloat(form.weight),
      waist: form.waist ? parseFloat(form.waist) : latest.waist,
      chest: form.chest ? parseFloat(form.chest) : latest.chest,
      arms: form.arms ? parseFloat(form.arms) : latest.arms,
    }])
    toast.success('Logged!'); setShowLog(false); setForm({ weight: '', waist: '', chest: '', arms: '' })
  }

  return (
    <Layout title="Body Tracker">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Body Tracker</h1>
            <p className="text-xs text-gray-500 mt-0.5">Track your physique progress</p>
          </div>
          <button onClick={() => setShowLog(true)} className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl">
            <Plus className="w-4 h-4" /> Log today
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Current Weight</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{latest?.weight}kg</p>
            <div className="flex items-center gap-1 mt-1">
              {parseFloat(weightDelta) < 0
                ? <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                : <TrendingUp className="w-3.5 h-3.5 text-red-500" />
              }
              <p className={`text-xs font-semibold ${parseFloat(weightDelta) < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {parseFloat(weightDelta) > 0 ? '+' : ''}{weightDelta}kg
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Total Change</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalDelta}kg</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Since {formatDate(logs[0]?.date, 'MMM d')}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Goal Weight</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">78kg</p>
            <p className="text-xs text-gray-400 mt-1">4kg to go</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Est. Time</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">~8wk</p>
            <p className="text-xs text-teal-600 font-semibold mt-1">At current rate</p>
          </div>
        </div>

        {/* Weight chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">Weight Over Time</p>
          <WeightChart data={logs} goalWeight={78} />
        </div>

        {/* Measurements */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">Measurements</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Waist', initial: logs[0]?.waist, current: latest?.waist, good: 'down' },
              { label: 'Chest', initial: logs[0]?.chest, current: latest?.chest, good: 'down' },
              { label: 'Arms', initial: logs[0]?.arms, current: latest?.arms, good: 'up' },
            ].map(m => {
              const delta = m.current - m.initial
              const positive = (m.good === 'down' && delta <= 0) || (m.good === 'up' && delta >= 0)
              return (
                <div key={m.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">{m.label}</p>
                  <p className="text-xl font-bold text-gray-900">{m.current}</p>
                  <p className="text-xs text-gray-400">cm</p>
                  <p className={`text-xs font-semibold mt-1 ${positive ? 'text-emerald-600' : delta > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {delta > 0 ? '+' : ''}{delta}cm
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Log history */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-900">History</p>
          </div>
          <div className="divide-y divide-gray-50">
            {[...logs].reverse().slice(0, 6).map((log, i, arr) => {
              const next = arr[i + 1]
              const delta = next ? (log.weight - next.weight).toFixed(1) : null
              return (
                <div key={log.date} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatDate(log.date, 'MMM d, yyyy')}</p>
                    <p className="text-xs text-gray-400 mt-0.5">W:{log.waist}  C:{log.chest}  A:{log.arms} cm</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{log.weight}kg</p>
                    {delta !== null && (
                      <p className={`text-xs font-semibold ${parseFloat(delta) < 0 ? 'text-emerald-600' : parseFloat(delta) > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {parseFloat(delta) > 0 ? '+' : ''}{delta}kg
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <Modal open={showLog} onClose={() => setShowLog(false)} title="Log Today">
          <div className="space-y-4">
            <Input label="Weight (kg) *" type="number" step="0.1" placeholder="e.g. 81.5" value={form.weight} onChange={e => update('weight', e.target.value)} />
            <div className="grid grid-cols-3 gap-3">
              <Input label="Waist" type="number" placeholder={latest?.waist} value={form.waist} onChange={e => update('waist', e.target.value)} />
              <Input label="Chest" type="number" placeholder={latest?.chest} value={form.chest} onChange={e => update('chest', e.target.value)} />
              <Input label="Arms" type="number" placeholder={latest?.arms} value={form.arms} onChange={e => update('arms', e.target.value)} />
            </div>
            <button className="w-full py-6 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 flex flex-col items-center gap-1.5 active:border-teal-300">
              <Camera className="w-5 h-5" />
              Add progress photo
            </button>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowLog(false)}>Cancel</Button>
              <Button className="flex-1" onClick={addLog} disabled={!form.weight}>Save</Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}
