import { Users, Calendar, MessageSquare, Phone, AlertCircle, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import { StatCard } from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ProgressBar from '../../components/ui/ProgressBar'
import { mockTrainerStats, mockClients, mockFollowUps } from '../../api/mockData'
import { goalLabel, formatDate } from '../../utils/format'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function TrainerDashboard() {
  const today = format(new Date('2026-05-04'), 'EEEE, MMMM d')
  const myClients = mockClients.filter(c => c.trainerId === 'usr_trainer_1')
  const presentToday = myClients.filter(c => c.lastVisit === '2026-05-04')
  const openFollowUps = mockFollowUps.filter(f => f.status === 'open' && f.trainer === 'Anmol Gupta')

  return (
    <Layout title="Dashboard">
      <div className="space-y-4 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Morning, Anmol 👋</h1>
          <p className="text-xs text-gray-500 mt-0.5">{today}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard title="My Clients" value={myClients.length} icon={Users} color="teal" />
          <StatCard title="Present Today" value={presentToday.length} subtitle={`of ${myClients.length}`} icon={Calendar} color="green" />
          <StatCard title="Check-ins Due" value={mockTrainerStats.pendingCheckIns} icon={Phone} color="amber" />
          <StatCard title="New Messages" value={mockTrainerStats.unreadMessages} icon={MessageSquare} color="blue" />
        </div>

        {/* Today's attendance quick view */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Today's Attendance</p>
            <Link to="/trainer/attendance">
              <span className="text-xs text-teal-600 font-semibold">Mark now</span>
            </Link>
          </div>
          <div className="mb-3">
            <ProgressBar
              value={presentToday.length}
              max={myClients.length}
              height="md"
              color="teal"
              label={`${presentToday.length} of ${myClients.length} present`}
              showLabel
            />
          </div>
          <div className="space-y-2">
            {myClients.slice(0, 5).map(client => {
              const present = client.lastVisit === '2026-05-04'
              return (
                <div key={client.id} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar name={client.name} size="sm" />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${present ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{client.name}</p>
                    <p className="text-xs text-gray-400">{goalLabel[client.goal]}</p>
                  </div>
                  <Badge variant={present ? 'green' : 'gray'} dot>{present ? 'In' : 'Out'}</Badge>
                </div>
              )
            })}
          </div>
          <Link to="/trainer/clients">
            <button className="w-full mt-3 py-2 text-xs font-semibold text-teal-600 hover:bg-teal-50 rounded-xl transition-colors flex items-center justify-center gap-1">
              View all clients <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>

        {/* Follow-up alerts */}
        {openFollowUps.length > 0 && (
          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-semibold text-gray-900">Follow-up needed</p>
            </div>
            <div className="space-y-2">
              {openFollowUps.map(fu => (
                <div key={fu.id} className="p-3 bg-amber-50 rounded-xl">
                  <p className="text-sm font-semibold text-gray-900">{fu.client}</p>
                  <p className="text-xs text-gray-600 mt-0.5 mb-2">{fu.reason}</p>
                  <Button size="xs" variant="secondary" onClick={() => toast.success(`Messaging ${fu.client}`)}>
                    <MessageSquare className="w-3 h-3" />
                    Send message
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Streak leaderboard */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">Client Streaks 🔥</p>
          <div className="space-y-3">
            {myClients
              .sort((a, b) => b.attendanceStreak - a.attendanceStreak)
              .slice(0, 4)
              .map((c, i) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-300 w-4">#{i + 1}</span>
                  <Avatar name={c.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{c.name}</p>
                    <ProgressBar value={c.attendanceStreak} max={30} height="xs" color="teal" />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{c.attendanceStreak}d</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
