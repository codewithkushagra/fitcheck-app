import { useState } from 'react'
import { Download, ChevronLeft, ChevronRight } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import { mockClients, mockAttendanceData, mockTrainers } from '../../api/mockData'
import { format, parseISO, addDays, subDays } from 'date-fns'
import toast from 'react-hot-toast'

function generateDates(centerDate, count = 14) {
  const dates = []
  const start = subDays(parseISO(centerDate), Math.floor(count / 2))
  for (let i = 0; i < count; i++) {
    dates.push(format(addDays(start, i), 'yyyy-MM-dd'))
  }
  return dates
}

export default function AttendanceReports() {
  const [filterTrainer, setFilterTrainer] = useState('all')
  const [centerDate] = useState('2026-05-04')

  const dates = generateDates(centerDate, 14)
  const filteredClients = filterTrainer === 'all'
    ? mockClients
    : mockClients.filter(c => c.trainerId === filterTrainer)

  const getStatus = (clientId, date) => mockAttendanceData[date]?.[clientId] || 'absent'

  const getMonthCount = (clientId) => {
    return Object.keys(mockAttendanceData).filter(date =>
      date.startsWith('2026-05') && mockAttendanceData[date]?.[clientId] === 'present'
    ).length
  }

  const handleExport = () => {
    const rows = [['Client', 'Trainer', ...dates, 'Days this month']]
    filteredClients.forEach(c => {
      rows.push([c.name, c.trainer, ...dates.map(d => getStatus(c.id, d)), getMonthCount(c.id)])
    })
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fitdeck-attendance.csv'
    a.click()
    toast.success('Attendance exported')
  }

  return (
    <Layout title="Attendance Reports">
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Attendance Reports</h1>
            <p className="text-sm text-gray-500 mt-0.5">Last 14 days · {filteredClients.length} clients shown</p>
          </div>
          <Button variant="secondary" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-52">
            <Select
              value={filterTrainer}
              onChange={e => setFilterTrainer(e.target.value)}
              options={[
                { value: 'all', label: 'All trainers' },
                ...mockTrainers.map(t => ({ value: t.id, label: t.name }))
              ]}
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-teal-500 rounded-sm inline-block" /> Present</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gray-200 rounded-sm inline-block" /> Absent</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-4 table-header sticky left-0 bg-white min-w-48">Client</th>
                {dates.map(d => (
                  <th key={d} className="px-2 py-4 table-header text-center min-w-12">
                    <div>{format(parseISO(d), 'd')}</div>
                    <div className="font-normal normal-case text-gray-400">{format(parseISO(d), 'EEE')}</div>
                  </th>
                ))}
                <th className="px-4 py-4 table-header text-center">May days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 sticky left-0 bg-white">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={client.name} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900 text-xs">{client.name}</p>
                        <p className="text-xs text-gray-400">{client.trainer}</p>
                      </div>
                    </div>
                  </td>
                  {dates.map(d => {
                    const status = getStatus(client.id, d)
                    const isToday = d === '2026-05-04'
                    return (
                      <td key={d} className="px-2 py-3 text-center">
                        <div className={`w-7 h-7 rounded-lg mx-auto flex items-center justify-center ${
                          status === 'present'
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-100 text-gray-400'
                        } ${isToday ? 'ring-2 ring-teal-300' : ''}`}>
                          <span className="text-xs font-medium">{status === 'present' ? '✓' : '–'}</span>
                        </div>
                      </td>
                    )
                  })}
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-bold text-gray-900">{getMonthCount(client.id)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
