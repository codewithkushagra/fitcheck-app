import { useState } from 'react'
import { UserPlus, Mail, MoreVertical, Search } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { mockTrainers, mockClients } from '../../api/mockData'
import { formatDate } from '../../utils/format'
import toast from 'react-hot-toast'

export default function Trainers() {
  const [search, setSearch] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [sending, setSending] = useState(false)

  const filtered = mockTrainers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleInvite = async () => {
    setSending(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success(`Invite sent to ${inviteEmail}`)
    setShowInvite(false)
    setInviteEmail('')
    setSending(false)
  }

  const getClientCount = (id) => mockClients.filter(c => c.trainerId === id).length

  return (
    <Layout title="Trainers">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Trainers</h1>
            <p className="text-sm text-gray-500 mt-0.5">{mockTrainers.length} trainers in your gym</p>
          </div>
          <Button onClick={() => setShowInvite(true)}>
            <UserPlus className="w-4 h-4" />
            Invite Trainer
          </Button>
        </div>

        <div className="max-w-sm">
          <Input
            placeholder="Search trainers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            leftIcon={Search}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(trainer => {
            const clientCount = getClientCount(trainer.id)
            const clients = mockClients.filter(c => c.trainerId === trainer.id)
            return (
              <div key={trainer.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={trainer.name} size="lg" />
                    <div>
                      <p className="font-semibold text-gray-900">{trainer.name}</p>
                      <p className="text-sm text-gray-500">{trainer.specialisation}</p>
                    </div>
                  </div>
                  <Badge variant={trainer.status === 'active' ? 'green' : 'gray'} dot>
                    {trainer.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-gray-900">{clientCount}</p>
                    <p className="text-xs text-gray-500">Clients</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-gray-900">
                      {clients.filter(c => c.lastVisit === '2026-05-04').length}
                    </p>
                    <p className="text-xs text-gray-500">Present today</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {trainer.email}
                </p>

                {clients.length > 0 && (
                  <div className="flex -space-x-2 mb-4">
                    {clients.slice(0, 5).map(c => (
                      <Avatar key={c.id} name={c.name} size="xs" className="ring-2 ring-white" />
                    ))}
                    {clients.length > 5 && (
                      <div className="w-6 h-6 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center text-xs text-gray-600 font-medium">
                        +{clients.length - 5}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1">View clients</Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite a Trainer">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter the trainer's email address. They'll receive an invite link to set up their account.
            </p>
            <Input
              label="Email address"
              type="email"
              placeholder="trainer@example.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              leftIcon={Mail}
            />
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowInvite(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleInvite} loading={sending} disabled={!inviteEmail}>
                Send Invite
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}
