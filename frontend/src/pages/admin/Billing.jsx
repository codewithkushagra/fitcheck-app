import { useState, useEffect } from 'react'
import { CreditCard, Zap, TrendingUp, Users } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Badge from '../../components/ui/Badge'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

export default function Billing() {
  const { user } = useAuthStore()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/gyms/clients').then(res => setClients(res.data || [])).catch(() => setClients([])).finally(() => setLoading(false))
  }, [])

  const premium = clients.filter(c => c.subscription?.planType === 'premium' && c.subscription?.status === 'active').length
  const core = clients.filter(c => c.subscription?.planType === 'core' && c.subscription?.status === 'active').length

  return (
    <Layout title="Billing">
      <div className="space-y-4 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Billing</h1>
          <p className="text-xs text-gray-500 mt-0.5">{user?.gym?.name || 'Your Gym'}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">{loading ? '—' : premium}</p>
            <p className="text-xs text-gray-400">Premium Members</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <Users className="w-5 h-5 text-teal-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">{loading ? '—' : core}</p>
            <p className="text-xs text-gray-400">Core Members</p>
          </div>
        </div>

        {/* Subscription breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-bold text-gray-900">Member Subscriptions</p>
          </div>
          {loading ? (
            <div className="py-12 text-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : clients.length === 0 ? (
            <div className="py-12 text-center"><p className="text-sm text-gray-400">No members yet</p></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {clients.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-teal-700">{c.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant={c.subscription?.planType === 'premium' ? 'amber' : 'gray'}>
                      {c.subscription?.planType || 'core'}
                    </Badge>
                    <span className={`text-[10px] font-medium ${c.subscription?.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {c.subscription?.status || 'inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
