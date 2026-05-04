import { useState, useEffect } from 'react'
import { Plus, Flame, TrendingDown, ChevronRight, Footprints, Dumbbell } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import ProgressBar from '../../components/ui/ProgressBar'
import { MacroRingChart, MacroBreakdownBar } from '../../components/charts/MacroRing'
import useAuthStore from '../../store/authStore'
import api from '../../api/axios'
import { format } from 'date-fns'

const DEFAULT_TARGETS = { calories: 2000, protein: 150, carbs: 200, fat: 65 }

export default function ClientDashboard() {
  const { user } = useAuthStore()
  const today = format(new Date(), 'EEEE, MMMM d')
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const [foodLogs, setFoodLogs] = useState([])
  const [targets, setTargets] = useState(DEFAULT_TARGETS)
  const [stepLogs, setStepLogs] = useState([])
  const [workoutPlan, setWorkoutPlan] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/food/logs?date=${todayStr}`).catch(() => ({ data: [] })),
      api.get('/clients/profile').catch(() => ({ data: null })),
      api.get('/steps/logs?limit=7').catch(() => ({ data: [] })),
      api.get('/workouts/my-plan').catch(() => ({ data: null })),
    ]).then(([food, profile, steps, plan]) => {
      setFoodLogs(food.data || [])
      if (profile.data?.macroTargets) setTargets(profile.data.macroTargets)
      setStepLogs(steps.data || [])
      setWorkoutPlan(plan.data)
    }).finally(() => setLoading(false))
  }, [todayStr])

  const totals = foodLogs.reduce((acc, item) => ({
    calories: acc.calories + (item.calories || 0),
    protein: acc.protein + (item.proteinG || 0),
    carbs: acc.carbs + (item.carbsG || 0),
    fat: acc.fat + (item.fatG || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  const todaySteps = stepLogs[stepLogs.length - 1]?.stepCount || 0
  const stepTarget = 10000

  const dayName = format(new Date(), 'EEEE')
  const todayPlan = workoutPlan?.days?.find(d => d.day === dayName)
  const completedExercises = todayPlan?.exercises?.filter(e => e.done)?.length || 0
  const totalExercises = todayPlan?.exercises?.length || 0

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Morning'
    if (h < 17) return 'Afternoon'
    return 'Evening'
  }

  return (
    <Layout title="Home">
      <div className="space-y-4 animate-fade-in">
        {/* Greeting */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">{today}</p>
        </div>

        {/* Calorie card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Today's Calories</p>
            <Link to="/food">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-xl">
                <Plus className="w-3.5 h-3.5" /> Log food
              </button>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <MacroRingChart calories={totals.calories} target={targets.calories} size={80} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-bold text-gray-900">{Math.round(totals.calories)}</span>
                <span className="text-xs text-gray-400">/ {targets.calories} kcal</span>
              </div>
              <MacroBreakdownBar protein={totals.protein} carbs={totals.carbs} fat={totals.fat} />
              <div className="flex gap-3 mt-2 text-[10px] font-semibold">
                <span className="text-blue-600">P {Math.round(totals.protein)}g</span>
                <span className="text-amber-500">C {Math.round(totals.carbs)}g</span>
                <span className="text-rose-500">F {Math.round(totals.fat)}g</span>
              </div>
            </div>
          </div>
          {foodLogs.length === 0 && !loading && (
            <p className="text-xs text-gray-400 text-center mt-3 py-2 bg-gray-50 rounded-xl">No food logged today. <Link to="/food" className="text-teal-600 font-medium">Add your first meal →</Link></p>
          )}
        </div>

        {/* Quick stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Steps */}
          <Link to="/steps">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Footprints className="w-4 h-4 text-emerald-600" />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
              <p className="text-xl font-bold text-gray-900">{todaySteps.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400 font-medium">Steps today</p>
              <div className="mt-2">
                <ProgressBar value={todaySteps} max={stepTarget} height="sm" color="teal" />
                <p className="text-[10px] text-gray-400 mt-1">{Math.round((todaySteps / stepTarget) * 100)}% of {stepTarget.toLocaleString()}</p>
              </div>
            </div>
          </Link>

          {/* Workout */}
          <Link to="/workout">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center">
                  <Dumbbell className="w-4 h-4 text-violet-600" />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
              {workoutPlan ? (
                <>
                  <p className="text-xl font-bold text-gray-900">{completedExercises}/{totalExercises}</p>
                  <p className="text-[10px] text-gray-400 font-medium">Exercises done</p>
                  {totalExercises > 0 && (
                    <div className="mt-2">
                      <ProgressBar value={completedExercises} max={totalExercises} height="sm" color="violet" />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-xl font-bold text-gray-400">—</p>
                  <p className="text-[10px] text-gray-400 font-medium">No plan assigned</p>
                </>
              )}
            </div>
          </Link>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { to: '/body', icon: TrendingDown, label: 'Log Weight', color: 'text-teal-600 bg-teal-50' },
              { to: '/steps', icon: Flame, label: 'Log Steps', color: 'text-emerald-600 bg-emerald-50' },
              { to: '/food', icon: Plus, label: 'Food Log', color: 'text-amber-600 bg-amber-50' },
              { to: '/analysis', icon: ChevronRight, label: 'Weekly Report', color: 'text-violet-600 bg-violet-50' },
            ].map(({ to, icon: Icon, label, color }) => (
              <Link key={to} to={to}>
                <div className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
