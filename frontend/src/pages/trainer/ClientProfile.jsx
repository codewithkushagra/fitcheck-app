import { useState } from 'react'
import { ArrowLeft, MessageSquare, Phone, Dumbbell, Pencil, Save } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { WeightChart } from '../../components/charts/BodyChart'
import { mockClients, mockClientProfile, mockBodyLogs, mockWeeklyAnalysis } from '../../api/mockData'
import { goalLabel, formatDate } from '../../utils/format'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const macroTrend = [
  { day: 'Mon', calories: 2050, target: 2100 },
  { day: 'Tue', calories: 1890, target: 2100 },
  { day: 'Wed', calories: 2210, target: 2100 },
  { day: 'Thu', calories: 1780, target: 2100 },
  { day: 'Fri', calories: 2100, target: 2100 },
  { day: 'Sat', calories: 1650, target: 2100 },
  { day: 'Sun', calories: 1920, target: 2100 },
]

export default function ClientProfile() {
  const { id } = useParams()
  const client = mockClients.find(c => c.id === id) || mockClients[0]
  const [note, setNote] = useState('')
  const [editNote, setEditNote] = useState(false)
  const [savedNote, setSavedNote] = useState('Client is doing well. Needs to improve protein intake consistency. Good workout adherence on push days. Consider increasing bench press by 2.5kg next session.')
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = ['overview', 'macros', 'progress', 'workouts', 'analysis']

  const insights = mockWeeklyAnalysis.insights

  return (
    <Layout title="Client Profile">
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/trainer/clients">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar name={client.name} size="xl" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{client.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={client.goal === 'fat_loss' ? 'orange' : 'blue'}>{goalLabel[client.goal]}</Badge>
                  <Badge variant={client.subscription === 'premium' ? 'teal' : 'gray'}>
                    {client.subscription === 'premium' ? '⚡ Premium' : 'Core'}
                  </Badge>
                  {client.attendanceStreak >= 7 && <Badge variant="green">🔥 {client.attendanceStreak}-day streak</Badge>}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => toast.success(`Opening chat with ${client.name}`)}>
                <MessageSquare className="w-4 h-4" />
                Chat
              </Button>
              {client.subscription === 'premium' && (
                <Button variant="secondary" size="sm" onClick={() => toast.success(`Calling ${client.name}`)}>
                  <Phone className="w-4 h-4" />
                  Call
                </Button>
              )}
              <Button size="sm" onClick={() => toast.success('Workout plan assigned')}>
                <Dumbbell className="w-4 h-4" />
                Assign Plan
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
            {[
              { label: 'Current weight', value: `${mockClientProfile.weight}kg` },
              { label: 'Goal weight', value: '78kg' },
              { label: 'Days attended (May)', value: '12' },
              { label: 'Streak', value: `${client.attendanceStreak} days` },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-all ${
                activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Weight Progress</h3>
                <WeightChart data={mockBodyLogs} goalWeight={78} />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Calorie Trend — Last 7 Days</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={macroTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9' }} />
                    <Bar dataKey="calories" name="Calories" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" name="Target" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Trainer Notes</h3>
                  <button onClick={() => setEditNote(!editNote)} className="text-teal-600 hover:text-teal-700">
                    {editNote ? <Save className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </button>
                </div>
                {editNote ? (
                  <div>
                    <textarea
                      className="input resize-none h-28 text-sm"
                      value={savedNote}
                      onChange={e => setSavedNote(e.target.value)}
                    />
                    <Button size="xs" className="mt-2 w-full" onClick={() => { setEditNote(false); toast.success('Note saved') }}>
                      Save note
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 leading-relaxed">{savedNote}</p>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Weekly Insight</h3>
                <div className="space-y-2">
                  {insights.slice(0, 3).map(insight => (
                    <div key={insight.type} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-xl">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        insight.color === 'green' ? 'bg-emerald-500' :
                        insight.color === 'red' ? 'bg-red-500' :
                        insight.color === 'amber' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{insight.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{insight.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map(insight => (
              <div key={insight.type} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">{insight.title}</h3>
                  <span className={`text-sm font-bold ${
                    insight.score >= 80 ? 'text-emerald-600' : insight.score >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>{insight.score}/100</span>
                </div>
                <p className="text-sm text-gray-600">{insight.detail}</p>
              </div>
            ))}
          </div>
        )}

        {(activeTab === 'macros' || activeTab === 'progress' || activeTab === 'workouts') && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-gray-500 text-sm">Full {activeTab} view available in the complete build.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
