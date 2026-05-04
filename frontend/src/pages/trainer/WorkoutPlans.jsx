import { useState, useEffect } from 'react'
import { Plus, Dumbbell, ChevronDown, ChevronUp, Users } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function WorkoutPlans() {
  const [plans, setPlans] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/workouts/plans'),
      api.get('/trainers/my-clients'),
    ]).then(([p, c]) => {
      setPlans(p.data || [])
      setClients(c.data || [])
      if (p.data?.length) setExpanded(p.data[0].id)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const createPlan = async () => {
    if (!newPlanName.trim()) return
    setCreating(true)
    try {
      const res = await api.post('/workouts/plans', { name: newPlanName.trim(), days: [] })
      setPlans(prev => [res.data, ...prev])
      toast.success('Plan created!')
      setNewPlanName(''); setShowCreate(false)
    } catch { toast.error('Failed to create plan') } finally { setCreating(false) }
  }

  const assignPlan = async (planId, clientId) => {
    try {
      await api.post('/workouts/assign', { planId, clientUserId: clientId })
      toast.success('Plan assigned!')
    } catch { toast.error('Failed to assign') }
  }

  return (
    <Layout title="Workout Plans">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Workout Plans</h1>
            <p className="text-xs text-gray-500 mt-0.5">{plans.length} plans created</p>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Plan
          </Button>
        </div>

        {loading ? (
          <div className="py-16 text-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center">
            <Dumbbell className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700">No plans yet</p>
            <p className="text-xs text-gray-400 mt-1">Create your first workout plan</p>
            <Button className="mt-4" size="sm" onClick={() => setShowCreate(true)}>Create Plan</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 px-4 py-4 text-left"
                  onClick={() => setExpanded(expanded === plan.id ? null : plan.id)}
                >
                  <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                    <Dumbbell className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{plan.name}</p>
                    <p className="text-xs text-gray-400">{plan.days?.length || 0} days</p>
                  </div>
                  {expanded === plan.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </button>

                {expanded === plan.id && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
                    {plan.days?.length > 0 ? (
                      <div className="space-y-1 mt-3">
                        {plan.days.map((day, i) => (
                          <div key={i} className="flex items-center justify-between text-xs py-1.5">
                            <span className="font-medium text-gray-700">{day.day}</span>
                            <span className="text-gray-400">{day.exercises?.length || 0} exercises</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mt-3">No days configured yet</p>
                    )}
                    {clients.length > 0 && (
                      <div className="pt-2 border-t border-gray-50">
                        <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> Assign to client
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {clients.map(c => (
                            <button key={c.id} onClick={() => assignPlan(plan.id, c.id)}
                              className="text-xs px-2.5 py-1.5 bg-gray-100 hover:bg-teal-100 hover:text-teal-700 rounded-lg font-medium text-gray-600 transition-colors">
                              {c.name.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Workout Plan">
        <div className="space-y-4">
          <Input label="Plan Name" placeholder="e.g. Fat Loss — 5 Day Split" value={newPlanName} onChange={e => setNewPlanName(e.target.value)} />
          <Button onClick={createPlan} loading={creating} className="w-full">Create Plan</Button>
        </div>
      </Modal>
    </Layout>
  )
}
