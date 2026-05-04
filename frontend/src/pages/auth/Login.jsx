import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Dumbbell, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect')

  const doLogin = async (e) => {
    if (e?.preventDefault) e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter email and password')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email: email.trim(), password })
      const { token, user } = res.data
      setAuth(user, token)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      if (redirectTo) navigate(redirectTo, { replace: true })
      else if (user.role === 'gym_admin') navigate('/admin')
      else if (user.role === 'trainer') navigate('/trainer')
      else navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed'
      toast.error(msg === 'Invalid credentials' ? 'Wrong email or password' : msg)
    } finally {
      setLoading(false)
    }
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
        <p className="text-sm text-gray-500 mb-6">Log in to your account to continue.</p>

        <form onSubmit={doLogin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            leftIcon={Mail}
            autoComplete="email"
          />
          <Input
            label="Password"
            type={showPwd ? 'text' : 'password'}
            placeholder="Your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            leftIcon={Lock}
            autoComplete="current-password"
            rightElement={
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-gray-400">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          <Button type="submit" className="w-full" loading={loading} size="lg">
            Sign in
          </Button>
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
