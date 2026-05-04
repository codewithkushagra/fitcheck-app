import { useState, useEffect } from 'react'
import { UserPlus, Search } from 'lucide-react'
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
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [email, setEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    api.get('/gyms/trainers').then(res => setTrainers(res.data || [])).catch(() => setTrainers([])).finally(() => setLoading(false))
  }, [])

  const filtered = trainers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()))

  const sendInvite = async () => {
    if (!email) return
    setInviting(true)
    try {
      await api.post('/gyms/invite-trainer', { email })
      toast.success(`Invite sent to ${email}!`)
      setEmail(''); setShowInvite(false)
    } catch { toast.error('Failed to send invite') } finally { setInviting(false) }
  }

  return (
    <Layout title="Trainers">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Trainers</h1>
            <p className="text-xs text-gray-500 mt-0.5">{trainers.length} trainers in your gym</p>
          </div>
          <Button size="sm" onClick={() => setShowInvite(true)}>
            <UserPlus className="w-4 h-4 mr-1" /> Invite
          </Button>
        </div>

        <Input placeholder="Search trainers…" value={search} onChange={e => setSearch(e.target.value)} leftIcon={Search} />

        {loading ? (
          <div className="py-16 text-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
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
                  <Badge variant="teal">Active</Badge>
                </div>
                {t.trainerProfile?.specialisation && (
                  <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-50">{t.trainerProfile.specialisation}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showInvite} onClose={() => setShowInvite(false)} title="Invite Trainer">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Send an invite link to onboard a new trainer to your gym.</p>
          <Input label="Trainer's Email" type="email" placeholder="trainer@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          <Button onClick={sendInvite} loading={inviting} className="w-full">Send Invite</Button>
        </div>
      </Modal>
    </Layout>
  )
}
