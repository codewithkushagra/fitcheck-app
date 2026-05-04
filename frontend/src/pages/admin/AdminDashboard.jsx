import { Users, UserCheck, Calendar, AlertTriangle, DollarSign } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import { StatCard } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import { mockAdminStats, mockFollowUps, mockClients, mockTrainers } from '../../api/mockData'
import { formatDate, goalLabel } from '../../utils/format'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const attendanceWeek = [
  { day: 'Mon', present: 28, absent: 7 },
  { day: 'Tue', present: 32, absent: 3 },
  { day: 'Wed', present: 25, absent: 10 },
  { day: 'Thu', present: 30, absent: 5 },
  { day: 'Fri', present: 22, absent: 13 },
  { day: 'Sat', present: 18, absent: 17 },
  { day: 'Sun', present: 8, absent: 27 },
]

export default function AdminDashboard() {
  const openFollowUps = mockFollowUps.filter(f => f.status === 'open')

  return (
    <Layout title="Dashboard">
      <div className="space-y-4 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Overview</h1>
          <p className="text-xs text-gray-500 mt-0.5">FitZone Pro · Monday, May 4</p>
        </div>

        {/* Stats 2x2 on mobile */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard title="Total Clients" value={mockAdminStats.totalClients} subtitle="All trainers" icon={Users} color="teal" />
          <StatCard title="Active Trainers" value={mockAdminStats.activeTrainers} subtitle="Today" icon={UserCheck} color="blue" />
          <StatCard title="Attendance" value={mockAdminStats.todayAttendance} subtitle="Present today" icon={Calendar} color="green" />
          <StatCard title="Follow-ups" value={mockAdminStats.followUpAlerts} subtitle="Need attention" icon={AlertTriangle} color="amber" />
        </div>

        {/* Revenue card */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-200 text-xs">Revenue — May 2026</p>
              <p className="text-3xl font-bold mt-0.5">₹87.5K</p>
              <p className="text-emerald-300 text-xs font-semibold mt-0.5">↑ 12% vs April</p>
            </div>
            <div className="text-right">
              <p className="text-teal-200 text-xs">Premium clients</p>
              <p className="text-xl font-bold">18</p>
              <p className="text-teal-200 text-xs mt-1">Core clients</p>
              <p className="text-xl font-bold">17</p>
            </div>
          </div>
        </div>

        {/* Attendance chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Weekly Attendance</p>
            <Badge variant="teal">This week</Badge>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={attendanceWeek} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #f1f5f9', fontSize: 12 }} />
              <Bar dataKey="present" name="Present" fill="#0d9488" radius={[3, 3, 0, 0]} stackId="a" />
              <Bar dataKey="absent" name="Absent" fill="#f1f5f9" radius={[3, 3, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-teal-600 inline-block" /><span className="text-xs text-gray-500">Present</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gray-100 inline-block border border-gray-200" /><span className="text-xs text-gray-500">Absent</span></div>
            <span className="ml-auto text-xs text-gray-400">{mockAdminStats.avgAttendanceRate}% avg</span>
          </div>
        </div>

        {/* Follow-ups */}
        {openFollowUps.length > 0 && (
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Follow-ups needed
              </p>
              <Link to="/admin/followup">
                <span className="text-xs text-teal-600 font-semibold">View all</span>
              </Link>
            </div>
            <div className="space-y-2">
              {openFollowUps.map(fu => (
                <div key={fu.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                  <Avatar name={fu.client} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{fu.client}</p>
                    <p className="text-xs text-gray-500 truncate">{fu.reason}</p>
                  </div>
                  <Badge variant={fu.severity === 'high' ? 'red' : 'yellow'}>{fu.severity}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top trainers */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Trainers</p>
            <Link to="/admin/trainers"><span className="text-xs text-teal-600 font-semibold">View all</span></Link>
          </div>
          <div className="space-y-3">
            {mockTrainers.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                <Avatar name={t.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.specialisation}</p>
                </div>
                <span className="text-xs font-bold text-teal-600">{t.clientCount} clients</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent clients */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Recent Clients</p>
            <Link to="/admin/clients"><span className="text-xs text-teal-600 font-semibold">View all</span></Link>
          </div>
          <div className="space-y-2">
            {mockClients.slice(0, 4).map(c => (
              <div key={c.id} className="flex items-center gap-3">
                <Avatar name={c.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                  <p className="text-xs text-gray-500 truncate">{c.trainer}</p>
                </div>
                <Badge variant={c.subscription === 'premium' ? 'teal' : 'gray'}>
                  {c.subscription === 'premium' ? '⚡' : 'Core'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
