import { useState, useEffect } from 'react'
import { Search, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import api from '../../api/axios'
import { goalLabel } from '../../utils/format'

export default function MyClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/trainers/my-clients').then(res => setClients(res.data || [])).catch(() => setClients([])).finally(() => setLoading(false))
  }, [])

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))

  return (
    <Layout title="My Clients">
      <div className="space-y-4 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Clients</h1>
          <p className="text-xs text-gray-500 mt-0.5">{clients.length} clients assigned</p>
        </div>

        <Input placeholder="Search clients…" value={search} onChange={e => setSearch(e.target.value)} leftIcon={Search} />

        {loading ? (
          <div className="py-16 text-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center">
            <p className="text-sm font-semibold text-gray-700">{search ? 'No results' : 'No clients yet'}</p>
            <p className="text-xs text-gray-400 mt-1">{search ? `No client matches "${search}"` : 'Clients will appear here once assigned'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(client => (
              <Link key={client.id} to={`/trainer/clients/${client.id}`}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 active:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar name={client.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{client.name}</p>
                      <p className="text-xs text-gray-400 truncate">{client.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant={client.subscription?.planType === 'premium' ? 'amber' : 'gray'}>
                        {client.subscription?.planType || 'core'}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                  {client.clientProfile && (
                    <div className="flex gap-3 mt-2 pt-2 border-t border-gray-50 text-xs text-gray-500">
                      <span>{goalLabel(client.clientProfile.goal)}</span>
                      {client.clientProfile.weightKg && <span>· {client.clientProfile.weightKg}kg</span>}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
