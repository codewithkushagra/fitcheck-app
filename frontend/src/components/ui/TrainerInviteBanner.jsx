import { useState, useEffect, useCallback } from 'react'
import { Dumbbell, X, CheckCircle, XCircle } from 'lucide-react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function TrainerInviteBanner() {
  const { user, refreshUser, setAuth, token } = useAuthStore()
  const navigate = useNavigate()
  const [invites, setInvites] = useState([])
  const [dismissed, setDismissed] = useState([])
  const [loading, setLoading] = useState(null) // inviteId being acted on

  const fetchInvites = useCallback(async () => {
    if (!user) return
    try {
      const res = await api.get('/trainers/invites')
      setInvites(res.data || [])
    } catch {
      // silently fail — not critical
    }
  }, [user])

  useEffect(() => {
    fetchInvites()
  }, [fetchInvites])

  const handleAccept = async (invite) => {
    setLoading(invite.id)
    try {
      const res = await api.post(`/trainers/invites/${invite.id}/accept`)
      toast.success('You are now a trainer! Welcome aboard.')
      // Update auth store with the new role/gymId
      if (res.data.user) {
        setAuth(res.data.user, token)
      } else {
        await refreshUser()
      }
      navigate('/trainer', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept invite')
    } finally {
      setLoading(null)
    }
  }

  const handleDecline = async (invite) => {
    setLoading(`decline-${invite.id}`)
    try {
      await api.post(`/trainers/invites/${invite.id}/decline`)
      toast.success('Invite declined')
      setInvites(prev => prev.filter(i => i.id !== invite.id))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to decline invite')
    } finally {
      setLoading(null)
    }
  }

  const visible = invites.filter(i => !dismissed.includes(i.id))
  if (visible.length === 0) return null

  return (
    <div className="space-y-3 px-4 pt-3 lg:px-6">
      {visible.map(invite => (
        <div
          key={invite.id}
          className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
              <Dumbbell className="w-5 h-5 text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">Trainer Invite</p>
              <p className="text-xs text-gray-600 mt-0.5">
                <span className="font-semibold">{invite.inviter?.name || 'Your gym admin'}</span> has invited you to join{' '}
                <span className="font-semibold text-teal-700">{invite.gym?.name}</span>
                {invite.gym?.city ? ` in ${invite.gym.city}` : ''} as a trainer.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleAccept(invite)}
                  disabled={!!loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-xl disabled:opacity-60 active:bg-teal-700 transition-colors"
                >
                  {loading === invite.id ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(invite)}
                  disabled={!!loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 text-xs font-semibold rounded-xl border border-gray-200 disabled:opacity-60 active:bg-gray-50 transition-colors"
                >
                  {loading === `decline-${invite.id}` ? (
                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  Decline
                </button>
              </div>
            </div>
            <button
              onClick={() => setDismissed(prev => [...prev, invite.id])}
              className="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
