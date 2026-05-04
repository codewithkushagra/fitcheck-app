import { useState, useEffect } from 'react'
import { UserPlus, Search, Clock, Trash2, Mail } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function Trainers() {
  const [trainers, setTrainers] = useState([])
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [email, setEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [revoking, setRevoking] = useState(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/gyms/trainers').catch(() => ({ data: [] })),
      api.get('/gyms/trainer-invites').catch(() => ({ data: [] })),
    ]).then(([t, i]) => {
      setTrainers(t.data || [])
      setInvites((i.data || []).filter(inv => inv.status === 'pending'))
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = trainers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  )

  const sendInvite = async () => {
    if (!email.trim()) return
    setInviting(true)
    try {
      await api.post('/gyms/invite-trainer', { email: email.trim() })
      toast.success(`Invite sent to ${email}!`)
      setEmail('')
      setShowInvite(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invite')
    } finally {
      setInviting(false)
    }
  }

  const revokeInvite = async (inviteId) => {
    setRevoking(inviteId)
    try {
      await api.delete(`/gyms/trainer-invites/${inviteId}`)
      toast.success('Invite revoked')
      setInvites(prev => prev.filter(i => i.id !== inviteId))
    } catch {
      toast.error('Failed to revoke invite')
    } finally {
      setRevoking(null)
    }
  }

  return (
    <Layout title="Trainers">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Trainers</h1>
            <p className="text-xs text-gray-500 mt-0.5">{trainers.length} trainer{trainers.length !== 1 ? 's' : ''} in your gym</p>
          </div>
          <Button size="sm" onClick={() => setShowInvite(true)}>
            <UserPlus className="w-4 h-4 mr-1" /> Invite
          </Button>
        </div>

        <Input placeholder="Search trainers…" value={search} onChange={e => setSearch(e.target.value)} leftIcon={Search} />

        {/* Pending invites section */}
        {invites.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Pending Invites
            </p>
            {invites.map(inv => (
              <div key={inv.id} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-amber-100">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{inv.email}</p>
                  <p className="text-xs text-gray-400">Invite pending acceptance</p>
                </div>
                <button
                  onClick={() => revokeInvite(inv.id)}
                  disabled={revoking === inv.id}
                  className="text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                >
                  {revoking === inv.id
                    ? <div className="w-4 h-4 border border-gray-300 border-t-transparent rounded-full animate-spin" />
                    : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Active trainers */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center">
            <p className="text-sm font-semibold text-gray-700">{search ? 'No results' : 'No trainers yet'}</p>
            <p className="text-xs text-gray-400 mt-1">Invite your first trainer to get started</p>
            <Button className="mt-4" size="sm" onClick={() => setShowInvite(true)}>Invite Trainer</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(t => (
              <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={t.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{t.name}</p>
                    <p className="text-xs text-gray-400 truncate">{t.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="teal">Active</Badge>
                    {t._count?.clients != null && (
                      <span className="text-[10px] text-gray-400">{t._count.clients} client{t._count.clients !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
                {t.trainerProfile?.specialisation && (
                  <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-50">{t.trainerProfile.specialisation}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showInvite} onClose={() => { setShowInvite(false); setEmail('') }} title="Invite Trainer">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter the trainer's email. They'll see the invite in the app as soon as they log in.
          </p>
          <Input
            label="Trainer's Email"
            type="email"
            placeholder="trainer@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendInvite()}
            autoFocus
          />
          <Button onClick={sendInvite} loading={inviting} className="w-full" disabled={!email.trim()}>
            Send Invite
          </Button>
        </div>
      </Modal>
    </Layout>
  )
}
