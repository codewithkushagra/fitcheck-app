import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader, Dumbbell, LogIn } from 'lucide-react'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import Button from '../components/ui/Button'

export default function ScanAttendance() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()

  const [status, setStatus] = useState('loading') // loading | success | error | unauthenticated
  const [message, setMessage] = useState('')
  const [gymName, setGymName] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      setStatus('unauthenticated')
      return
    }

    api.post(`/attendance/qr-scan/${token}`)
      .then(res => {
        setStatus('success')
        setMessage(res.data.message)
        setGymName(res.data.gym?.name || '')
      })
      .catch(err => {
        setStatus('error')
        setMessage(err.response?.data?.error || 'Something went wrong. Please try again.')
      })
  }, [token, isAuthenticated])

  const handleContinue = () => {
    if (user?.role === 'gym_admin') navigate('/admin/attendance')
    else if (user?.role === 'trainer') navigate('/trainer')
    else navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      {/* Brand */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900">FitCheck</span>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Loader className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Marking Attendance…</h2>
            <p className="text-sm text-gray-500 mt-2">Just a moment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">You're checked in!</h2>
            {gymName && (
              <p className="text-sm text-teal-600 font-semibold mt-1">{gymName}</p>
            )}
            <p className="text-sm text-gray-500 mt-3 leading-relaxed">{message}</p>

            {/* Animated confetti dots */}
            <div className="flex justify-center gap-1.5 mt-4">
              {['bg-teal-400', 'bg-emerald-400', 'bg-amber-400', 'bg-teal-500', 'bg-blue-400'].map((c, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${c} animate-bounce`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>

            <Button className="mt-6 w-full" onClick={handleContinue}>
              Continue to App
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-9 h-9 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Couldn't check in</h2>
            <p className="text-sm text-gray-500 mt-3 leading-relaxed">{message}</p>
            <Button className="mt-6 w-full" variant="secondary" onClick={handleContinue}>
              Go to App
            </Button>
          </>
        )}

        {status === 'unauthenticated' && (
          <>
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Log in first</h2>
            <p className="text-sm text-gray-500 mt-3 leading-relaxed">
              You need to be logged in to mark your attendance. Log in and scan the QR code again.
            </p>
            <Link to={`/login?redirect=/scan/${token}`}>
              <Button className="mt-6 w-full">
                <LogIn className="w-4 h-4 mr-2" /> Log In
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
