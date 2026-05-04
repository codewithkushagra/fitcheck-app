import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import api from '../../api/axios'
import { format, subDays } from 'date-fns'

export default function AttendanceReports() {
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const [date, setDate] = useState(todayStr)
  const [records, setRecords] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/attendance?date=${date}`),
      api.get('/gyms/clients'),
    ]).then(([a, c]) => {
      setRecords(a.data || [])
      setClients(c.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [date])

  const present = records.filter(r => r.status === 'present').length
  const absent = records.filter(r => r.status === 'absent').length

  // Map records by clientId for quick lookup
  const recordMap = {}
  records.forEach(r => { recordMap[r.clientUserId] = r })

  return (
    <Layout title="Attendance">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Attendance Reports</h1>
            <p className="text-xs text-gray-500 mt-0.5">{format(new Date(date + 'T00:00:00'), 'MMM d, yyyy')}</p>
          </div>
          <input
            type="date" max={todayStr} value={date}
            onChange={e => setDate(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Present', value: present, color: 'text-emerald-600' },
            { label: 'Absent', value: absent, color: 'text-red-500' },
            { label: 'Total', value: clients.length, color: 'text-gray-700' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Client list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-bold text-gray-900">All Members</p>
          </div>
          {loading ? (
            <div className="py-12 text-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : clients.length === 0 ? (
            <div className="py-12 text-center"><p className="text-sm text-gray-400">No clients yet</p></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {clients.map(c => {
                const record = recordMap[c.id]
                return (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                    <Avatar name={c.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                      {c.trainer && <p className="text-xs text-gray-400 truncate">Trainer: {c.trainer.name}</p>}
                    </div>
                    <Badge variant={record?.status === 'present' ? 'green' : record?.status === 'absent' ? 'red' : 'gray'}>
                      {record?.status || 'Not marked'}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
