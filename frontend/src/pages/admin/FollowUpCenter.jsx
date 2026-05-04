import { useState, useEffect } from 'react'
import { AlertTriangle, Users } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import api from '../../api/axios'
import { format, subDays } from 'date-fns'

export default function FollowUpCenter() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Show clients who haven't attended in the last 7 days
    Promise.all([
      api.get('/gyms/clients'),
      api.get(`/attendance?date=${format(new Date(), 'yyyy-MM-dd')}`),
    ]).then(([c]) => {
      setClients(c.data || [])
    }).catch(() => setClients([])).finally(() => setLoading(false))
  }, [])

  // Clients without recent attendance (no data = needs follow-up)
  const needsFollowUp = clients.filter(c => {
    // For now show all clients as potential follow-ups — in production integrate with attendance history
    return true
  })

  return (
    <Layout title="Follow-up Centre">
      <div className="space-y-4 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Follow-up Centre</h1>
          <p className="text-xs text-gray-500 mt-0.5">Members who may need a check-in</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">{loading ? '—' : clients.length}</p>
            <p className="text-xs text-gray-400">Total Members</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <Users className="w-6 h-6 text-teal-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">{loading ? '—' : clients.filter(c => c.subscription?.status === 'active').length}</p>
            <p className="text-xs text-gray-400">Active Plans</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-bold text-gray-900">All Members</p>
          </div>
          {loading ? (
            <div className="py-12 text-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : clients.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400">No members yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {clients.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar name={c.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.email}</p>
                  </div>
                  <Badge variant={c.subscription?.status === 'active' ? 'green' : 'gray'}>
                    {c.subscription?.status || 'inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
