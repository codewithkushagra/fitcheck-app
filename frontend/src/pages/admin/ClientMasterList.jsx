import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import api from '../../api/axios'
import { goalLabel } from '../../utils/format'

export default function ClientMasterList() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/gyms/clients').then(res => setClients(res.data || [])).catch(() => setClients([])).finally(() => setLoading(false))
  }, [])

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout title="All Clients">
      <div className="space-y-4 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-gray-900">All Clients</h1>
          <p className="text-xs text-gray-500 mt-0.5">{clients.length} total members</p>
        </div>

        <Input placeholder="Search clients…" value={search} onChange={e => setSearch(e.target.value)} leftIcon={Search} />

        {loading ? (
          <div className="py-16 text-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center">
            <p className="text-sm font-semibold text-gray-700">{search ? `No results for "${search}"` : 'No clients yet'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={c.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.email}</p>
                  </div>
                  <Badge variant={c.subscription?.planType === 'premium' ? 'amber' : 'gray'}>
                    {c.subscription?.planType || 'core'}
                  </Badge>
                </div>
                <div className="flex gap-4 mt-2 pt-2 border-t border-gray-50 text-xs text-gray-500">
                  {c.clientProfile?.goal && <span>{goalLabel(c.clientProfile.goal)}</span>}
                  {c.trainer && <span>· Trainer: {c.trainer.name}</span>}
                  {c.clientProfile?.weightKg && <span>· {c.clientProfile.weightKg}kg</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
