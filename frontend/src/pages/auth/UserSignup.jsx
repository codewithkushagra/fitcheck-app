import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Dumbbell, Mail, Lock, User, Hash, AlertCircle } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import useAuthStore from '../../store/authStore'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const steps = ['Account', 'Body Profile', 'Goal']

const goals = [
  { id: 'fat_loss', label: 'Fat Loss', desc: 'Burn fat and improve body composition', icon: '🔥', color: 'border-orange-300 bg-orange-50' },
  { id: 'muscle_gain', label: 'Muscle Gain', desc: 'Build strength and add lean muscle mass', icon: '💪', color: 'border-blue-300 bg-blue-50' },
  { id: 'maintenance', label: 'Maintenance', desc: 'Maintain current weight and improve fitness', icon: '⚖️', color: 'border-green-300 bg-green-50' },
  { id: 'custom', label: 'Custom', desc: 'Set your own targets and milestones', icon: '🎯', color: 'border-purple-300 bg-purple-50' },
]

const macrosByGoal = {
  fat_loss: { calories: 1800, protein: 160, carbs: 160, fat: 55 },
  muscle_gain: { calories: 2800, protein: 180, carbs: 320, fat: 80 },
  maintenance: { calories: 2200, protein: 140, carbs: 250, fat: 65 },
  custom: { calories: 2000, protein: 150, carbs: 200, fat: 65 },
}

export default function UserSignup() {
  const [step, setStep] = useState(0)
  const [goal, setGoal] = useState('')
  const [soloMode, setSoloMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    gymCode: '',
    age: '', gender: 'male', height: '', weight: '',
    medicalConditions: '',
  })
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleFinish = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    if (!form.email.trim()) { toast.error('Email is required'); return }
    if (!form.password || form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (!form.height || !form.weight || !form.age) { toast.error('Please fill in your body profile'); return }
    if (!goal) { toast.error('Please select a goal'); return }
    setLoading(true)
    try {
      const res = await api.post('/auth/register-client', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        gymCode: form.gymCode.trim() || undefined,
        age: parseInt(form.age),
        gender: form.gender,
        heightCm: parseFloat(form.height),
        weightKg: parseFloat(form.weight),
        goal,
        medicalConditions: form.medicalConditions
          ? form.medicalConditions.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      })
      const { user, token } = res.data
      setAuth(user, token)
      toast.success('Account created! Welcome to Fit Check.')
      // Check for pending trainer invites right after signup
      try {
        const { data: invites } = await api.get('/trainers/invites', {
          headers: { Authorization: `Bearer ${token}` }
        })
        navigate(invites?.length > 0 ? '/accept-invite' : '/dashboard', { replace: true })
      } catch {
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const macros = macrosByGoal[goal]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-white" />
          </div>
          <p className="text-xl font-bold text-gray-900">Fit Check</p>
        </div>

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
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create your account</h2>
              <Input label="Full name" placeholder="Ankit Mehta" value={form.name} onChange={e => update('name', e.target.value)} leftIcon={User} />
              <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} leftIcon={Mail} />
              <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => update('password', e.target.value)} leftIcon={Lock} />
              
              <div className="pt-2 border-t border-gray-100">
                <Input
                  label="Gym code (optional)"
                  placeholder="e.g. FZPRO2024"
                  value={form.gymCode}
                  onChange={e => update('gymCode', e.target.value)}
                  leftIcon={Hash}
                  helperText="Ask your trainer for the gym code to connect with them."
                />
                {!form.gymCode && (
                  <button
                    type="button"
                    onClick={() => setSoloMode(!soloMode)}
                    className="mt-2 text-sm text-teal-600 hover:underline"
                  >
                    {soloMode ? '✓ Continuing in solo mode' : 'Continue without a gym code (solo mode)'}
                  </button>
                )}
              </div>

              {!form.gymCode && !soloMode && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700">Without a gym code, trainer features won't be available. You can add one later from your profile.</p>
                </div>
              )}

              <Button className="w-full mt-2" onClick={() => setStep(1)}>Continue</Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your body profile</h2>
              <p className="text-sm text-gray-500 -mt-3 mb-2">This helps us personalise your macro targets and workout plan.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Age" type="number" placeholder="25" value={form.age} onChange={e => update('age', e.target.value)} />
                <Select
                  label="Gender"
                  value={form.gender}
                  onChange={e => update('gender', e.target.value)}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Height (cm)" type="number" placeholder="175" value={form.height} onChange={e => update('height', e.target.value)} />
                <Input label="Weight (kg)" type="number" placeholder="75" value={form.weight} onChange={e => update('weight', e.target.value)} />
              </div>
              <div>
                <label className="label">Medical conditions (optional)</label>
                <textarea
                  className="input resize-none h-20"
                  placeholder="e.g. Diabetes, hypertension, knee injury..."
                  value={form.medicalConditions}
                  onChange={e => update('medicalConditions', e.target.value)}
                />
              </div>
              <div className="flex gap-3 mt-2">
                <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
                <Button className="flex-1" onClick={() => setStep(2)}>Continue</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">What's your primary goal?</h2>
              <p className="text-sm text-gray-500 mb-5">We'll personalise your macros and workout plan around this.</p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {goals.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${goal === g.id ? g.color + ' border-opacity-100' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <p className="font-semibold text-gray-900 mt-2">{g.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{g.desc}</p>
                  </button>
                ))}
              </div>

              {goal && macros && (
                <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 mb-4">
                  <p className="text-sm font-semibold text-teal-800 mb-3">Your daily targets</p>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Calories', value: macros.calories, unit: 'kcal', color: 'text-orange-600' },
                      { label: 'Protein', value: macros.protein, unit: 'g', color: 'text-blue-600' },
                      { label: 'Carbs', value: macros.carbs, unit: 'g', color: 'text-amber-600' },
                      { label: 'Fat', value: macros.fat, unit: 'g', color: 'text-purple-600' },
                    ].map(m => (
                      <div key={m.label} className="text-center">
                        <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                        <p className="text-xs text-gray-500">{m.unit}</p>
                        <p className="text-xs text-gray-400">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-teal-600 mt-3">These are auto-generated from your body data. Your trainer can adjust them.</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" onClick={handleFinish} loading={loading} disabled={!goal}>
                  Start my journey
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
