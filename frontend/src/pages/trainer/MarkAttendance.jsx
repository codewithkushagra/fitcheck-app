import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Save } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import api from '../../api/axios'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function MarkAttendance() {
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const [date, setDate] = useState(todayStr)
  const [clients, setClients] = useState([])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/trainers/my-clients'),
      api.get(`/attendance?date=${date}`),
    ]).then(([c, a]) => {
      const cls = c.data || []
      setClients(cls)
      const init = {}
      cls.forEach(cl => { init[cl.id] = null })
      ;(a.data || []).forEach(r => { init[r.clientUserId] = r.status })
      setAttendance(init)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [date])

  const mark = (id, status) => setAttendance(prev => ({ ...prev, [id]: prev[id] === status ? null : status }))
  const markAll = (status) => {
    const updated = {}; clients.forEach(c => { updated[c.id] = status }); setAttendance(updated)
  }

  const handleSave = async () => {
    const records = clients.map(c => ({ clientUserId: c.id, status: attendance[c.id] || 'absent' }))
    setSaving(true)
    try {
      await api.post('/attendance/bulk', { records, date })
      toast.success('Attendance saved!')
    } catch { toast.error('Failed to save') } finally { setSaving(false) }
  }

  const present = clients.filter(c => attendance[c.id] === 'present').length
  const absent = clients.filter(c => attendance[c.id] === 'absent').length
  const unmarked = clients.filter(c => !attendance[c.id]).length

  return (
    <Layout title="Attendance">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mark Attendance</h1>
            <p className="text-xs text-gray-500 mt-0.5">{clients.length} clients</p>
          </div>
          <input
            type="date" max={todayStr} value={date}
            onChange={e => setDate(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Present', value: present, color: 'text-emerald-600' },
            { label: 'Absent', value: absent, color: 'text-red-500' },
            { label: 'Unmarked', value: unmarked, color: 'text-gray-400' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mark all */}
        <div className="flex gap-2">
          <button onClick={() => markAll('present')} className="flex-1 py-2.5 text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-200 active:bg-emerald-100">✓ All Present</button>
          <button onClick={() => markAll('absent')} className="flex-1 py-2.5 text-sm font-semibold text-red-500 bg-red-50 rounded-xl border border-red-200 active:bg-red-100">✕ All Absent</button>
        </div>

        {/* Client list */}
        {loading ? (
          <div className="py-12 text-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : clients.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center">
            <p className="text-sm text-gray-400">No clients assigned yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            {clients.map(client => (
              <div key={client.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={client.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{client.name}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => mark(client.id, 'present')}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${attendance[client.id] === 'present' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-300 hover:text-emerald-500'}`}
                  ><CheckCircle className="w-5 h-5" /></button>
                  <button
                    onClick={() => mark(client.id, 'absent')}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${attendance[client.id] === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-300 hover:text-red-500'}`}
                  ><XCircle className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {clients.length > 0 && (
          <Button onClick={handleSave} loading={saving} className="w-full">
            <Save className="w-4 h-4 mr-2" /> Save Attendance
          </Button>
        )}
      </div>
    </Layout>
  )
}
