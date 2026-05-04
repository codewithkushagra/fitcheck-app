import { useState, useEffect } from 'react'
import { Users, UserCheck, Calendar, TrendingUp, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import { StatCard } from '../../components/ui/Card'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import { format } from 'date-fns'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const today = format(new Date(), 'EEEE, MMMM d')

  useEffect(() => {
    Promise.all([
      api.get('/gyms/stats').catch(() => ({ data: { totalClients: 0, trainers: 0, todayAttendance: 0 } })),
      api.get('/gyms/clients').catch(() => ({ data: [] })),
    ]).then(([s, c]) => {
      setStats(s.data)
      setClients(c.data || [])
    }).finally(() => setLoading(false))
  }, [])

  return (
    <Layout title="Dashboard">
      <div className="space-y-4 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hello, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-xs text-gray-500 mt-0.5">{today} · {user?.gym?.name || 'Your Gym'}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard title="Total Clients" value={loading ? '—' : stats?.totalClients ?? 0} icon={Users} color="teal" />
          <StatCard title="Trainers" value={loading ? '—' : stats?.trainers ?? 0} icon={UserCheck} color="blue" />
          <StatCard title="Present Today" value={loading ? '—' : stats?.todayAttendance ?? 0} icon={Calendar} color="green" />
          <StatCard title="Active Members" value={loading ? '—' : clients.filter(c => c.subscription?.status === 'active').length} icon={TrendingUp} color="amber" />
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-bold text-gray-900">Quick Actions</p>
          </div>
          {[
            { to: '/admin/trainers', label: 'Manage Trainers', sub: `${loading ? '…' : stats?.trainers ?? 0} trainers` },
            { to: '/admin/clients', label: 'All Clients', sub: `${loading ? '…' : stats?.totalClients ?? 0} members` },
            { to: '/admin/attendance', label: 'Attendance Reports', sub: `${loading ? '…' : stats?.todayAttendance ?? 0} present today` },
            { to: '/admin/billing', label: 'Billing & Plans', sub: 'Manage subscriptions' },
          ].map(item => (
            <Link key={item.to} to={item.to}>
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        {/* Recent clients */}
        {clients.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-900">Recent Members</p>
              <Link to="/admin/clients" className="text-xs text-teal-600 font-semibold">View all</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {clients.slice(0, 5).map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-teal-700">{c.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.email}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${c.subscription?.planType === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.subscription?.planType || 'core'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
