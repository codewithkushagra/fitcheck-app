import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Phone, Zap, Lock, Image } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import useAuthStore from '../../store/authStore'
import api from '../../api/axios'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { io as socketIO } from 'socket.io-client'

export default function ConsultTrainer() {
  const { user } = useAuthStore()
  const isPremium = user?.subscription === 'premium' || user?.subscription?.planType === 'premium'
  const [trainer, setTrainer] = useState(null)
  const [trainerLoading, setTrainerLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [msgsLoading, setMsgsLoading] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const socketRef = useRef(null)

  // Load trainer info
  useEffect(() => {
    api.get('/clients/my-trainer')
      .then(res => setTrainer(res.data))
      .catch(() => setTrainer(null))
      .finally(() => setTrainerLoading(false))
  }, [])

  // Load messages & connect socket when trainer is known
  useEffect(() => {
    if (!trainer?.id) return
    setMsgsLoading(true)
    api.get(`/chat/messages/${trainer.id}`)
      .then(res => setMessages(res.data || []))
      .catch(() => {})
      .finally(() => setMsgsLoading(false))

    // Socket.io real-time
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000'
    const socket = socketIO(baseUrl, { transports: ['websocket'], reconnectionAttempts: 3 })
    socketRef.current = socket
    socket.on('connect', () => socket.emit('join_room', user.id))
    socket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg])
    })
    return () => socket.disconnect()
  }, [trainer?.id, user?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!text.trim() || !trainer?.id) return
    setSending(true)
    const content = text.trim()
    setText('')
    try {
      const res = await api.post('/chat/messages', { recipientUserId: trainer.id, content })
      setMessages(prev => [...prev, res.data])
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message')
      setText(content) // restore
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dt) => {
    try { return format(new Date(dt), 'h:mm a') } catch { return '' }
  }

  // No trainer assigned
  if (!trainerLoading && !trainer) {
    return (
      <Layout title="Consult Trainer">
        <div className="flex flex-col items-center justify-center min-h-96 text-center px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Phone className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Trainer Assigned</h2>
          <p className="text-gray-500 max-w-sm">
            You'll be able to chat with your trainer once your gym admin assigns one to you.
          </p>
        </div>
      </Layout>
    )
  }

  // Premium gate
  if (!isPremium) {
    return (
      <Layout title="Consult Trainer">
        <div className="flex flex-col items-center justify-center min-h-96 text-center px-4">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Premium Feature</h2>
          <p className="text-gray-500 max-w-sm mb-6">
            Upgrade to Premium to unlock 1:1 chat and voice calls with your trainer.
          </p>
          <Button onClick={() => toast.success('Upgrade flow coming soon!')}>
            <Zap className="w-4 h-4" /> Upgrade to Premium
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Consult Trainer">
      <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
        {/* Trainer header */}
        <div className="bg-white rounded-t-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar name={trainer?.name || '?'} size="md" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{trainer?.name || 'Your Trainer'}</p>
              <p className="text-xs text-emerald-600 font-medium">
                {trainer?.trainerProfile?.specialisation || 'Personal Trainer'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="teal">⚡ Premium</Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast.success('Voice call feature coming soon!')}
            >
              <Phone className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 space-y-4">
          {msgsLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-sm font-semibold text-gray-700">Start the conversation</p>
              <p className="text-xs text-gray-400 mt-1">Say hi to {trainer?.name?.split(' ')[0] || 'your trainer'}!</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isOwn = msg.senderUserId === user?.id
              const showDate = i === 0 ||
                format(new Date(messages[i - 1].sentAt), 'yyyy-MM-dd') !==
                format(new Date(msg.sentAt), 'yyyy-MM-dd')
              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex items-center gap-3 my-3">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-400 font-medium">
                        {format(new Date(msg.sentAt), 'EEEE, MMM d')}
                      </span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}
                  <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    {!isOwn && <Avatar name={msg.sender?.name || trainer?.name || '?'} size="xs" />}
                    <div className={`max-w-xs lg:max-w-md flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isOwn
                          ? 'bg-teal-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-900 border border-gray-100 shadow-sm rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                      <p className="text-xs text-gray-400 px-1">{formatTime(msg.sentAt)}</p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white rounded-b-2xl border border-gray-100 border-t-0 shadow-sm px-4 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Type a message…"
              className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
            />
            <button
              onClick={send}
              disabled={!text.trim() || sending}
              className="w-9 h-9 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors"
            >
              {sending
                ? <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
