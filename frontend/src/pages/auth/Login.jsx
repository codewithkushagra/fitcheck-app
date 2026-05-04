import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Dumbbell, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { mockUsers } from '../../api/mockData'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import toast from 'react-hot-toast'

const demoAccounts = [
  { role: 'gym_admin', label: 'Admin', emoji: '🏢', email: 'admin@fitdeck.app', color: 'bg-teal-50 border-teal-300 text-teal-700' },
  { role: 'trainer', label: 'Trainer', emoji: '🏋️', email: 'trainer@fitdeck.app', color: 'bg-blue-50 border-blue-300 text-blue-700' },
  { role: 'client', label: 'Client', emoji: '👤', email: 'ankit@example.com', color: 'bg-purple-50 border-purple-300 text-purple-700' },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const doLogin = async (targetEmail) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const userMap = {
      'admin@fitdeck.app': mockUsers.admin,
      'trainer@fitdeck.app': mockUsers.trainer,
      'ankit@example.com': mockUsers.client,
    }
    const user = userMap[targetEmail || email]
    if (!user) { toast.error('No account found.'); setLoading(false); return }
    setAuth(user, 'mock_jwt_' + user.role)
    toast.success(`Welcome, ${user.name.split(' ')[0]}!`)
    if (user.role === 'gym_admin') navigate('/admin')
    else if (user.role === 'trainer') navigate('/trainer')
    else navigate('/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top brand strip */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 pt-14 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">Fit Check by Anmol</p>
            <p className="text-teal-200 text-sm">Trained by Anmol Gupta</p>
          </div>
        </div>
        <p className="text-teal-100 text-sm leading-relaxed">
          Track macros, monitor progress, manage clients and grow your gym.
        </p>
      </div>

      {/* Main form card */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-4 px-5 pt-6 pb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h2>
        <p className="text-sm text-gray-500 mb-5">Log in to your account to continue.</p>

        {/* Quick demo login */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">Try a demo account</p>
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map(acc => (
              <button
                key={acc.role}
                onClick={() => doLogin(acc.email)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all active:scale-95 ${acc.color}`}
              >
                <span className="text-xl">{acc.emoji}</span>
                <span className="text-xs font-semibold">{acc.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or sign in with email</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={e => { e.preventDefault(); doLogin() }} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            leftIcon={Mail}
          />
          <Input
            label="Password"
            type={showPwd ? 'text' : 'password'}
            placeholder="Your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            leftIcon={Lock}
            rightElement={
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-gray-400">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          <div className="flex justify-end">
            <button type="button" className="text-sm text-teal-600 font-medium">Forgot password?</button>
          </div>
          <Button type="submit" className="w-full" loading={loading} size="lg">Sign in</Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">
            New gym?{' '}
            <Link to="/register" className="text-teal-600 font-semibold">Register your gym</Link>
          </p>
          <p className="text-sm text-gray-500">
            New member?{' '}
            <Link to="/signup" className="text-teal-600 font-semibold">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
