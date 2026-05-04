import { useState } from 'react'
import { CheckCircle, XCircle, Save } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import { mockClients } from '../../api/mockData'
import { goalLabel } from '../../utils/format'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function MarkAttendance() {
  const clients = mockClients.filter(c => c.trainerId === 'usr_trainer_1')
  const today = '2026-05-04'
  const [attendance, setAttendance] = useState(() => {
    const init = {}
    clients.forEach(c => { init[c.id] = c.lastVisit === today ? 'present' : null })
    return init
  })
  const [saving, setSaving] = useState(false)

  const mark = (id, status) => setAttendance(prev => ({ ...prev, [id]: prev[id] === status ? null : status }))
  const markAll = (status) => {
    const updated = {}; clients.forEach(c => { updated[c.id] = status }); setAttendance(updated)
  }
  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    toast.success('Attendance saved!'); setSaving(false)
  }

  const presentCount = Object.values(attendance).filter(v => v === 'present').length
  const absentCount = Object.values(attendance).filter(v => v === 'absent').length
  const unmarked = clients.length - presentCount - absentCount

  return (
    <Layout title="Attendance">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mark Attendance</h1>
            <p className="text-xs text-gray-500 mt-0.5">{format(new Date(today), 'EEEE, MMM d')}</p>
          </div>
          <Button onClick={handleSave} loading={saving} size="sm">
            <Save className="w-4 h-4" /> Save
          </Button>
        </div>

        {/* Summary bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <ProgressBar value={presentCount} max={clients.length} height="md" color="teal" label={`${presentCount} of ${clients.length} present`} showLabel />
          <div className="flex gap-3 mt-3">
            <div className="flex-1 text-center p-2 bg-emerald-50 rounded-xl">
              <p className="text-xl font-bold text-emerald-700">{presentCount}</p>
              <p className="text-xs text-emerald-600">Present</p>
            </div>
            <div className="flex-1 text-center p-2 bg-red-50 rounded-xl">
              <p className="text-xl font-bold text-red-700">{absentCount}</p>
              <p className="text-xs text-red-600">Absent</p>
            </div>
            <div className="flex-1 text-center p-2 bg-gray-100 rounded-xl">
              <p className="text-xl font-bold text-gray-600">{unmarked}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </div>

        {/* Bulk actions */}
        <div className="flex gap-2">
          <button onClick={() => markAll('present')} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 active:bg-emerald-100">
            <CheckCircle className="w-4 h-4" /> All present
          </button>
          <button onClick={() => markAll('absent')} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-xl border border-red-200 active:bg-red-100">
            <XCircle className="w-4 h-4" /> All absent
          </button>
        </div>

        {/* Client list */}
        <div className="space-y-2">
          {clients.map(client => {
            const status = attendance[client.id]
            return (
              <div key={client.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={client.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{client.name}</p>
                    <p className="text-xs text-gray-400">{goalLabel[client.goal]} · {client.attendanceStreak}d streak</p>
                  </div>
                  {status && (
                    <Badge variant={status === 'present' ? 'green' : 'red'} dot>{status}</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => mark(client.id, 'present')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      status === 'present' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 active:bg-emerald-50'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" /> Present
                  </button>
                  <button
                    onClick={() => mark(client.id, 'absent')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      status === 'absent' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 active:bg-red-50'
                    }`}
                  >
                    <XCircle className="w-4 h-4" /> Absent
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
