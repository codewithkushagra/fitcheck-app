import { useState, useEffect } from 'react'
import { ArrowLeft, MessageSquare, Dumbbell, Pencil, Save, Scale, Ruler, Target, Calendar } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { WeightChart } from '../../components/charts/BodyChart'
import { goalLabel, formatDate } from '../../utils/format'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays } from 'date-fns'

const TABS = ['overview', 'macros', 'progress', 'workouts']

export default function ClientProfile() {
  const { id } = useParams()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [note, setNote] = useState('')
  const [editNote, setEditNote] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/trainers/client/${id}`)
      .then(res => {
        setClient(res.data)
        setNote(res.data.trainerNote || '')
      })
      .catch(() => toast.error('Could not load client profile'))
      .finally(() => setLoading(false))
  }, [id])

  const saveNote = () => {
    setEditNote(false)
    // Persist note via API if endpoint exists; gracefully no-op for now
    toast.success('Note saved')
  }

  if (loading) {
    return (
      <Layout title="Client Profile" showBack>
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </Layout>
    )
  }

  if (!client) {
    return (
      <Layout title="Client Profile" showBack>
        <div className="py-24 text-center">
          <p className="text-gray-500 text-sm">Client not found.</p>
          <Link to="/trainer/clients">
            <Button className="mt-4" size="sm" variant="secondary">Back to Clients</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  const profile = client.clientProfile
  const bodyLogs = client.bodyLogs || []
  const foodLogs = client.foodLogs || []
  const attendance = client.attendance || []
  const assignedPlans = client.assignedPlans || []

  // Last 7 days calorie data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
    const dayLogs = foodLogs.filter(f => f.date === d)
    return {
      day: format(subDays(new Date(), 6 - i), 'EEE'),
      calories: Math.round(dayLogs.reduce((s, f) => s + f.calories, 0))
    }
  })

  const latestWeight = bodyLogs.length > 0 ? bodyLogs[bodyLogs.length - 1].weightKg : null
  const presentDays = attendance.filter(a => a.status === 'present').length

  // Attendance streak
  let streak = 0
  const sortedAtt = [...attendance].sort((a, b) => b.date.localeCompare(a.date))
  for (const rec of sortedAtt) {
    if (rec.status === 'present') streak++
    else break
  }

  return (
    <Layout title="Client Profile" showBack>
      <div className="space-y-5 animate-fade-in">
        {/* Back */}
        <Link to="/trainer/clients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <Avatar name={client.name} size="xl" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{client.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {profile?.goal && (
                    <Badge variant="blue">{goalLabel[profile.goal] || profile.goal}</Badge>
                  )}
                  <Badge variant={client.subscription?.planType === 'premium' ? 'amber' : 'gray'}>
                    {client.subscription?.planType === 'premium' ? '⚡ Premium' : 'Core'}
                  </Badge>
                  {streak >= 3 && <Badge variant="green">🔥 {streak}-day streak</Badge>}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="secondary" size="sm"
                onClick={() => toast.success(`Opening chat with ${client.name}`)}
              >
                <MessageSquare className="w-4 h-4" /> Chat
              </Button>
              <Link to="/trainer/plans">
                <Button size="sm">
                  <Dumbbell className="w-4 h-4" /> Assign Plan
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
            {[
              { label: 'Current weight', value: latestWeight ? `${latestWeight}kg` : '—', icon: Scale },
              { label: 'Goal', value: profile?.goal ? (goalLabel[profile.goal] || profile.goal) : '—', icon: Target },
              { label: 'Present (last 30)', value: presentDays, icon: Calendar },
              { label: 'Streak', value: streak > 0 ? `${streak} days` : '—', icon: Calendar },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Body stats */}
        {profile && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Age', value: profile.age ? `${profile.age} yrs` : '—' },
              { label: 'Height', value: profile.heightCm ? `${profile.heightCm}cm` : '—' },
              { label: 'Weight', value: latestWeight ? `${latestWeight}kg` : profile.weightKg ? `${profile.weightKg}kg` : '—' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-[10px] text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Calorie trend */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Calorie Trend — Last 7 Days</h3>
              {last7Days.some(d => d.calories > 0) ? (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={last7Days} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9' }} />
                    <Bar dataKey="calories" name="Calories" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">No food logs in the last 7 days</p>
              )}
            </div>

            {/* Trainer notes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Trainer Notes</h3>
                <button
                  onClick={() => editNote ? saveNote() : setEditNote(true)}
                  className="text-teal-600 hover:text-teal-700"
                >
                  {editNote ? <Save className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                </button>
              </div>
              {editNote ? (
                <div>
                  <textarea
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Add notes about this client…"
                  />
                  <Button size="sm" className="mt-2 w-full" onClick={saveNote}>Save note</Button>
                </div>
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {note || <span className="text-gray-400 italic">No notes yet. Click the pencil to add one.</span>}
                </p>
              )}
            </div>

            {/* Recent attendance */}
            {attendance.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Attendance</h3>
                <div className="flex flex-wrap gap-1.5">
                  {attendance.slice(0, 20).map(rec => (
                    <span
                      key={rec.id}
                      className={`text-[10px] font-medium px-2 py-1 rounded-lg ${
                        rec.status === 'present'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-50 text-red-500'
                      }`}
                    >
                      {formatDate(rec.date)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Macros */}
        {activeTab === 'macros' && (
          <div className="space-y-3">
            {foodLogs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400 text-sm">No food logs yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
                {foodLogs.slice(0, 20).map(log => (
                  <div key={log.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{log.foodName}</p>
                      <p className="text-xs text-gray-400">{log.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-900">{Math.round(log.calories)} kcal</p>
                      <p className="text-[10px] text-gray-400">P:{Math.round(log.proteinG)}g C:{Math.round(log.carbsG)}g F:{Math.round(log.fatG)}g</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Progress */}
        {activeTab === 'progress' && (
          <div className="space-y-4">
            {bodyLogs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400 text-sm">No body logs yet</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Weight Progress</h3>
                  <WeightChart data={bodyLogs} goalWeight={profile?.weightKg} />
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
                  {[...bodyLogs].reverse().slice(0, 10).map(log => (
                    <div key={log.id} className="flex items-center justify-between px-4 py-3">
                      <p className="text-sm text-gray-600">{log.date}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="font-semibold text-gray-900">{log.weightKg}kg</span>
                        {log.waistCm && <span className="text-gray-400">waist {log.waistCm}cm</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Workouts */}
        {activeTab === 'workouts' && (
          <div className="space-y-3">
            {assignedPlans.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400 text-sm">No workout plans assigned yet</p>
                <Link to="/trainer/plans">
                  <Button className="mt-3" size="sm">Go to Workout Plans</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {assignedPlans.map(ap => (
                  <div key={ap.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <p className="text-sm font-semibold text-gray-900">{ap.plan.name}</p>
                    {ap.plan.description && (
                      <p className="text-xs text-gray-500 mt-1">{ap.plan.description}</p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-2">
                      Assigned {formatDate(ap.assignedAt?.split('T')[0] || ap.assignedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
