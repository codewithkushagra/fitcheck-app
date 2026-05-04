import { useState, useRef, useEffect } from 'react'
import { Send, Phone, Zap, Lock, Image, Smile } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { mockChatMessages } from '../../api/mockData'
import useAuthStore from '../../store/authStore'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function ConsultTrainer() {
  const { user } = useAuthStore()
  const isPremium = user?.subscription === 'premium'
  const [messages, setMessages] = useState(mockChatMessages)
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!text.trim()) return
    const newMsg = {
      id: Date.now(),
      senderId: user?.id,
      senderName: user?.name,
      content: text.trim(),
      sentAt: new Date().toISOString(),
      isOwn: true,
    }
    setMessages(prev => [...prev, newMsg])
    setText('')

    // Simulate trainer response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        senderId: 'usr_trainer_1',
        senderName: 'Anmol Gupta',
        content: 'Got it! I\'ll check your progress and get back to you shortly.',
        sentAt: new Date().toISOString(),
        isOwn: false,
      }])
    }, 1500)
  }

  const formatTime = (dt) => format(new Date(dt), 'h:mm a')

  if (!isPremium) {
    return (
      <Layout title="Consult Trainer">
        <div className="flex flex-col items-center justify-center min-h-96 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Premium Feature</h2>
          <p className="text-gray-500 max-w-sm mb-6">
            Upgrade to Premium to unlock 1:1 chat and voice calls with your trainer.
            All your data and progress stays intact.
          </p>
          <Button onClick={() => toast.success('Upgrade flow coming soon!')}>
            <Zap className="w-4 h-4" />
            Upgrade to Premium
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
              <Avatar name="Anmol Gupta" size="md" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Anmol Gupta</p>
              <p className="text-xs text-emerald-600 font-medium">Online · Strength & Conditioning</p>
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
              Call
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-4 space-y-4">
          {messages.map((msg, i) => {
            const showDate = i === 0 || format(new Date(messages[i - 1].sentAt), 'dd') !== format(new Date(msg.sentAt), 'dd')
            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-medium">{format(new Date(msg.sentAt), 'EEEE, MMM d')}</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                )}
                <div className={`flex items-end gap-2 ${msg.isOwn ? 'flex-row-reverse' : ''}`}>
                  {!msg.isOwn && <Avatar name={msg.senderName} size="xs" />}
                  <div className={`max-w-xs lg:max-w-md ${msg.isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.isOwn
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
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white rounded-b-2xl border border-gray-100 border-t-0 shadow-sm px-4 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Image className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Type a message..."
              className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
            />
            <button
              onClick={send}
              disabled={!text.trim()}
              className="w-9 h-9 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
