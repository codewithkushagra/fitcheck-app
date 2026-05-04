import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Dumbbell, Building2, Phone, MapPin, User, Mail, Lock } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import useAuthStore from '../../store/authStore'
import { mockUsers } from '../../api/mockData'
import toast from 'react-hot-toast'

const steps = ['Gym Details', 'Owner Details', 'Subscription']

const plans = [
  {
    id: 'basic',
    name: 'Starter',
    price: '₹4,999/mo',
    trainers: '5 trainers',
    clients: '100 clients',
    features: ['Core tracking for all clients', 'Attendance management', 'Basic reports', 'Email support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹9,999/mo',
    trainers: 'Unlimited trainers',
    clients: 'Unlimited clients',
    features: ['Everything in Starter', 'Premium consultations', 'Voice calls', 'CSV exports', 'Priority support', 'Custom branding'],
    popular: true,
  },
]

export default function GymRegister() {
  const [step, setStep] = useState(0)
  const [plan, setPlan] = useState('pro')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    gymName: '', city: '', address: '', phone: '',
    ownerName: '', email: '', password: '',
  })
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    const user = { ...mockUsers.admin, name: form.ownerName || mockUsers.admin.name, email: form.email || mockUsers.admin.email, gym: { id: 'gym_new', name: form.gymName || 'FitZone Pro', city: form.city || 'Mumbai' } }
    setAuth(user, 'mock_admin_token')
    toast.success('Gym registered successfully!')
    navigate('/admin')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-white" />
          </div>
          <p className="text-xl font-bold text-gray-900">Fit Check</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i <= step ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i + 1}
              </div>
              <span className={`text-xs font-medium truncate ${i === step ? 'text-teal-700' : 'text-gray-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-teal-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tell us about your gym</h2>
              <Input label="Gym name" placeholder="FitZone Pro" value={form.gymName} onChange={e => update('gymName', e.target.value)} leftIcon={Building2} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" placeholder="Mumbai" value={form.city} onChange={e => update('city', e.target.value)} leftIcon={MapPin} />
                <Input label="Phone" placeholder="+91 98765 43210" value={form.phone} onChange={e => update('phone', e.target.value)} leftIcon={Phone} />
              </div>
              <Input label="Address" placeholder="123, Fitness Street, Andheri West" value={form.address} onChange={e => update('address', e.target.value)} />
              <Button className="w-full mt-2" onClick={() => setStep(1)}>Continue</Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create your admin account</h2>
              <Input label="Your full name" placeholder="Rahul Sharma" value={form.ownerName} onChange={e => update('ownerName', e.target.value)} leftIcon={User} />
              <Input label="Email address" type="email" placeholder="you@fitzone.com" value={form.email} onChange={e => update('email', e.target.value)} leftIcon={Mail} />
              <Input label="Password" type="password" placeholder="Create a strong password" value={form.password} onChange={e => update('password', e.target.value)} leftIcon={Lock} helperText="Minimum 8 characters" />
              <div className="flex gap-3 mt-2">
                <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
                <Button className="flex-1" onClick={() => setStep(2)}>Continue</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Choose a plan</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {plans.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPlan(p.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${plan === p.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    {p.popular && <span className="inline-block px-2 py-0.5 bg-teal-600 text-white text-xs font-semibold rounded-full mb-2">Popular</span>}
                    <p className="font-bold text-gray-900">{p.name}</p>
                    <p className="text-teal-600 font-semibold text-lg mt-1">{p.price}</p>
                    <p className="text-xs text-gray-500 mt-1">{p.trainers} · {p.clients}</p>
                    <ul className="mt-3 space-y-1">
                      {p.features.map(f => (
                        <li key={f} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <span className="text-teal-500 mt-0.5">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" onClick={handleSubmit} loading={loading}>
                  Register Gym
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
