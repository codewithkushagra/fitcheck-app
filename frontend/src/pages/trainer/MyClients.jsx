import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronRight, UserPlus, X, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { goalLabel } from '../../utils/format'

export default function MyClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Gym-client browser modal
  const [showBrowse, setShowBrowse] = useState(false)
  const [gymClients, setGymClients] = useState([])
  const [browseSearch, setBrowseSearch] = useState('')
  const [browseLoading, setBrowseLoading] = useState(false)
  const [assigning, setAssigning] = useState(null)
  const [removing, setRemoving] = useState(null)

  const loadMyClients = useCallback(() => {
    setLoading(true)
    api.get('/trainers/my-clients')
      .then(res => setClients(res.data || []))
      .catch(() => setClients([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadMyClients() }, [loadMyClients])

  const openBrowse = async () => {
    setShowBrowse(true)
    setBrowseLoading(true)
    try {
      const res = await api.get('/trainers/gym-clients')
      setGymClients(res.data || [])
    } catch {
      toast.error('Could not load gym clients')
    } finally {
      setBrowseLoading(false)
    }
  }

  const assignClient = async (clientId) => {
    setAssigning(clientId)
    try {
      await api.post('/trainers/assign-client', { clientId })
      toast.success('Client added to your roster!')
      loadMyClients()
      // Update gym clients list in-place
      setGymClients(prev => prev.map(c =>
        c.id === clientId ? { ...c, trainerId: 'me' } : c
      ))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to assign client')
    } finally {
      setAssigning(null)
    }
  }

  const removeClient = async (clientId) => {
    setRemoving(clientId)
    try {
      await api.delete(`/trainers/client/${clientId}/assign`)
      toast.success('Client removed from your roster')
      setClients(prev => prev.filter(c => c.id !== clientId))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove client')
    } finally {
      setRemoving(null)
    }
  }

  const myClientIds = new Set(clients.map(c => c.id))
  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )
  const filteredGym = gymClients.filter(c =>
    c.name.toLowerCase().includes(browseSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(browseSearch.toLowerCase())
  )

  return (
    <Layout title="My Clients">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Clients</h1>
            <p className="text-xs text-gray-500 mt-0.5">{clients.length} client{clients.length !== 1 ? 's' : ''} assigned</p>
          </div>
          <Button size="sm" onClick={openBrowse}>
            <UserPlus className="w-4 h-4 mr-1" /> Add Client
          </Button>
        </div>

        <Input placeholder="Search clients…" value={search} onChange={e => setSearch(e.target.value)} leftIcon={Search} />

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center">
            <p className="text-sm font-semibold text-gray-700">
              {search ? 'No results' : 'No clients yet'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {search ? `No client matches "${search}"` : 'Add clients from your gym to get started'}
            </p>
            {!search && (
              <Button className="mt-4" size="sm" onClick={openBrowse}>
                <UserPlus className="w-4 h-4 mr-1" /> Add Client
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(client => (
              <div key={client.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <Link to={`/trainer/clients/${client.id}`} className="flex-1 flex items-center gap-3 min-w-0">
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
                  </Link>
                </div>
                {client.clientProfile && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>{goalLabel[client.clientProfile.goal] || client.clientProfile.goal}</span>
                      {client.clientProfile.weightKg && <span>· {client.clientProfile.weightKg}kg</span>}
                    </div>
                    <button
                      onClick={() => removeClient(client.id)}
                      disabled={removing === client.id}
                      className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                    >
                      {removing === client.id ? 'Removing…' : 'Remove'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Browse gym clients modal */}
      <Modal isOpen={showBrowse} onClose={() => { setShowBrowse(false); setBrowseSearch('') }} title="Add Client from Gym">
        <div className="space-y-3">
          <Input
            placeholder="Search by name or email…"
            value={browseSearch}
            onChange={e => setBrowseSearch(e.target.value)}
            leftIcon={Search}
            autoFocus
          />

          {browseLoading ? (
            <div className="py-8 text-center">
              <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredGym.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{browseSearch ? 'No results' : 'No clients in your gym yet'}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto -mx-1 px-1">
              {filteredGym.map(client => {
                const isMyClient = myClientIds.has(client.id)
                const hasOtherTrainer = client.trainerId && !isMyClient
                return (
                  <div key={client.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <Avatar name={client.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{client.name}</p>
                      <p className="text-xs text-gray-400 truncate">{client.email}</p>
                      {hasOtherTrainer && (
                        <p className="text-[10px] text-amber-600 mt-0.5">Assigned to {client.trainer?.name || 'another trainer'}</p>
                      )}
                    </div>
                    {isMyClient ? (
                      <Badge variant="teal">Added</Badge>
                    ) : (
                      <button
                        onClick={() => assignClient(client.id)}
                        disabled={assigning === client.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg disabled:opacity-60 active:bg-teal-700 transition-colors shrink-0"
                      >
                        {assigning === client.id
                          ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                          : <X className="w-3 h-3 rotate-45" />}
                        Add
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Modal>
    </Layout>
  )
}
