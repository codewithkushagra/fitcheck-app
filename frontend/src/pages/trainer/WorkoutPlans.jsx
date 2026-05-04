import { useState } from 'react'
import { Plus, Dumbbell, Users, ChevronDown, ChevronUp } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { mockWorkoutPlan, mockClients } from '../../api/mockData'
import toast from 'react-hot-toast'

const plans = [
  { ...mockWorkoutPlan, assignedTo: ['c1', 'c4'], assignedCount: 2 },
  { id: 'wp_2', name: 'Muscle Gain — 4 Day Push/Pull', assignedTo: ['c2', 'c8'], assignedCount: 2, assignedBy: 'Anmol Gupta', assignedAt: '2026-04-10', days: [] },
  { id: 'wp_3', name: 'Beginner Full Body — 3 Day', assignedTo: [], assignedCount: 0, assignedBy: 'Anmol Gupta', assignedAt: '2026-03-20', days: [] },
]

export default function WorkoutPlans() {
  const [expanded, setExpanded] = useState('wp_1')
  const [showCreate, setShowCreate] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')

  const myClients = mockClients.filter(c => c.trainerId === 'usr_trainer_1')

  return (
    <Layout title="Workout Plans">
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Workout Plans</h1>
            <p className="text-sm text-gray-500 mt-0.5">{plans.length} plans in your library</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" />
            New Plan
          </Button>
        </div>

        <div className="space-y-4">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === plan.id ? null : plan.id)}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                    <Dumbbell className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{plan.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">By {plan.assignedBy}</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        {plan.assignedCount} clients
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={e => { e.stopPropagation(); toast.success(`Assigning ${plan.name}`) }}
                  >
                    Assign to client
                  </Button>
                  {expanded === plan.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {expanded === plan.id && plan.days?.length > 0 && (
                <div className="border-t border-gray-100 p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plan.days.map(day => (
                      <div key={day.day} className="border border-gray-100 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-gray-900">{day.day}</p>
                          <Badge variant={day.exercises.length === 0 ? 'gray' : 'teal'}>
                            {day.label}
                          </Badge>
                        </div>
                        {day.exercises.length > 0 ? (
                          <div className="space-y-2">
                            {day.exercises.map((ex, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <p className="text-xs text-gray-700">{ex.name}</p>
                                <p className="text-xs text-gray-500">{ex.sets}×{ex.reps}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Rest day</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {plan.assignedTo.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2">Assigned to</p>
                      <div className="flex gap-2 flex-wrap">
                        {plan.assignedTo.map(id => {
                          const client = myClients.find(c => c.id === id)
                          return client ? (
                            <Badge key={id} variant="teal">{client.name}</Badge>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Plan">
          <div className="space-y-4">
            <Input
              label="Plan name"
              placeholder="e.g. Strength — 5 Day Powerlifting"
              value={newPlanName}
              onChange={e => setNewPlanName(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              After creating, you'll be able to add days, exercises, sets, and reps to the plan.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button className="flex-1" onClick={() => { toast.success(`Plan "${newPlanName}" created`); setShowCreate(false) }} disabled={!newPlanName}>
                Create Plan
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}
