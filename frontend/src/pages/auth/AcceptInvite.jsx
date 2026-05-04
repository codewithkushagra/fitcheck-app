import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, CheckCircle, XCircle, MapPin, User } from 'lucide-react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function AcceptInvite() {
  const navigate = useNavigate()
  const { setAuth, token, refreshUser } = useAuthStore()
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)

  useEffect(() => {
    api.get('/trainers/invites')
      .then(res => setInvites(res.data || []))
      .catch(() => navigate('/dashboard', { replace: true }))
      .finally(() => setLoading(false))
  }, [navigate])

  // If no invites, go to dashboard
  useEffect(() => {
    if (!loading && invites.length === 0) {
      navigate('/dashboard', { replace: true })
    }
  }, [loading, invites, navigate])

  const accept = async (invite) => {
    setActing(`accept-${invite.id}`)
    try {
      const res = await api.post(`/trainers/invites/${invite.id}/accept`)
      toast.success('Welcome aboard! You are now a trainer.')
      if (res.data.user) {
        setAuth(res.data.user, token)
      } else {
        await refreshUser()
      }
      navigate('/trainer', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept invite')
      setActing(null)
    }
  }

  const decline = async (invite) => {
    setActing(`decline-${invite.id}`)
    try {
      await api.post(`/trainers/invites/${invite.id}/decline`)
      toast.success('Invite declined.')
      const remaining = invites.filter(i => i.id !== invite.id)
      setInvites(remaining)
      if (remaining.length === 0) navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to decline invite')
      setActing(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Brand header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 pt-14 pb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">Trainer Invitation</p>
            <p className="text-teal-200 text-sm">You've been invited to join as a trainer</p>
          </div>
        </div>
      </div>

      {/* Invite cards */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-4 px-5 pt-6 pb-8 space-y-4">
        <p className="text-sm text-gray-500">
          {invites.length > 1
            ? `You have ${invites.length} pending trainer invitations.`
            : 'You have a pending trainer invitation. Review it below.'}
        </p>

        {invites.map(invite => (
          <div
            key={invite.id}
            className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-5 space-y-4"
          >
            {/* Gym info */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center shrink-0">
                <Dumbbell className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold text-gray-900">{invite.gym?.name}</p>
                {invite.gym?.city && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" /> {invite.gym.city}
                  </p>
                )}
                {invite.inviter?.name && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <User className="w-3.5 h-3.5" /> Invited by {invite.inviter.name}
                  </p>
                )}
              </div>
            </div>

            {/* What you get */}
            <div className="bg-white rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">As a trainer you can</p>
              {[
                'View and manage clients in this gym',
                'Mark attendance and track progress',
                'Create and assign workout plans',
                'Chat with premium clients',
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => accept(invite)}
                loading={acting === `accept-${invite.id}`}
                disabled={!!acting}
              >
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Accept & Join
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => decline(invite)}
                loading={acting === `decline-${invite.id}`}
                disabled={!!acting}
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Decline
              </Button>
            </div>
          </div>
        ))}

        <button
          onClick={() => navigate('/dashboard', { replace: true })}
          className="w-full text-sm text-gray-400 py-2 hover:text-gray-600 transition-colors"
        >
          Skip for now →
        </button>
      </div>
    </div>
  )
}
