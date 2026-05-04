import { useState, useEffect } from 'react'
import { Users, Calendar, ChevronRight, Dumbbell } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import { StatCard } from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import { format } from 'date-fns'
import { goalLabel } from '../../utils/format'

export default function TrainerDashboard() {
  const { user } = useAuthStore()
  const today = format(new Date(), 'EEEE, MMMM d')
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const [clients, setClients] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/trainers/my-clients').catch(() => ({ data: [] })),
      api.get(`/attendance?date=${todayStr}`).catch(() => ({ data: [] })),
    ]).then(([c, a]) => {
      setClients(c.data || [])
      setAttendance(a.data || [])
    }).finally(() => setLoading(false))
  }, [todayStr])

  const presentToday = attendance.filter(a => a.status === 'present').length
  const greeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening'
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-4 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-xs text-gray-500 mt-0.5">{today}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard title="My Clients" value={loading ? '—' : clients.length} icon={Users} color="teal" />
          <StatCard title="Present Today" value={loading ? '—' : presentToday} subtitle={`of ${clients.length}`} icon={Calendar} color="green" />
        </div>

        {/* Today's attendance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Today's Attendance</p>
            <Link to="/trainer/attendance">
              <span className="text-xs text-teal-600 font-semibold">Mark now →</span>
            </Link>
          </div>
          {loading ? (
            <div className="py-4 text-center"><div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : clients.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No clients assigned yet</p>
          ) : (
            <div className="space-y-2">
              {clients.slice(0, 5).map(client => {
                const record = attendance.find(a => a.clientUserId === client.id)
                const status = record?.status
                return (
                  <div key={client.id} className="flex items-center gap-3">
                    <Avatar name={client.name} size="sm" />
                    <span className="flex-1 text-sm font-medium text-gray-900 truncate">{client.name}</span>
                    <Badge variant={status === 'present' ? 'green' : status === 'absent' ? 'red' : 'gray'}>
                      {status || 'Not marked'}
                    </Badge>
                  </div>
                )
              })}
              {clients.length > 5 && (
                <Link to="/trainer/attendance" className="text-xs text-teal-600 font-medium block text-center pt-1">
                  +{clients.length - 5} more →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Client list preview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">My Clients</p>
            <Link to="/trainer/clients"><span className="text-xs text-teal-600 font-semibold">View all →</span></Link>
          </div>
          {loading ? (
            <div className="py-4 text-center"><div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : clients.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No clients yet</p>
          ) : (
            <div className="space-y-2">
              {clients.slice(0, 4).map(client => (
                <Link key={client.id} to={`/trainer/clients/${client.id}`}>
                  <div className="flex items-center gap-3 py-1.5">
                    <Avatar name={client.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{client.name}</p>
                      <p className="text-xs text-gray-400">{client.clientProfile?.goal ? (goalLabel[client.clientProfile.goal] || client.clientProfile.goal) : 'No goal set'}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
