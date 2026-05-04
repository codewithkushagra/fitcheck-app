import { useState } from 'react'
import { Search, MessageSquare, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ProgressBar from '../../components/ui/ProgressBar'
import { mockClients } from '../../api/mockData'
import { formatDate, goalLabel } from '../../utils/format'
import toast from 'react-hot-toast'

export default function MyClients() {
  const [search, setSearch] = useState('')
  const clients = mockClients.filter(c => c.trainerId === 'usr_trainer_1')
  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <Layout title="My Clients">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Clients</h1>
            <p className="text-xs text-gray-500 mt-0.5">{clients.length} clients assigned</p>
          </div>
        </div>

        <Input placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={Search} />

        <div className="space-y-2">
          {filtered.map(client => {
            const isPresent = client.lastVisit === '2026-05-04'
            return (
              <Link key={client.id} to={`/trainer/clients/${client.id}`}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 active:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar name={client.name} size="md" />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${isPresent ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{client.name}</p>
                        {client.attendanceStreak >= 7 && <span className="text-sm">🔥</span>}
                        <Badge variant={client.subscription === 'premium' ? 'teal' : 'gray'} className="ml-auto">
                          {client.subscription === 'premium' ? '⚡' : 'Core'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{goalLabel[client.goal]} · {client.attendanceStreak}-day streak</p>
                      <div className="mt-2">
                        <ProgressBar value={client.attendanceStreak} max={30} height="xs" color="teal" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      <button
                        onClick={e => { e.preventDefault(); toast.success(`Chat with ${client.name}`) }}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 active:bg-gray-200"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
