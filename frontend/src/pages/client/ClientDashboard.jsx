import { Plus, Flame, TrendingDown, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import { MacroRingChart, MacroBreakdownBar } from '../../components/charts/MacroRing'
import { mockClientProfile, mockFoodLog, mockStepLogs, mockWorkoutPlan } from '../../api/mockData'
import useAuthStore from '../../store/authStore'
import { format } from 'date-fns'

export default function ClientDashboard() {
  const { user } = useAuthStore()
  const today = format(new Date('2026-05-04'), 'EEEE, MMMM d')

  const totals = mockFoodLog.reduce((acc, item) => ({
    calories: acc.calories + item.calories,
    protein: acc.protein + item.protein,
    carbs: acc.carbs + item.carbs,
    fat: acc.fat + item.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  const targets = mockClientProfile.macroTargets
  const todaySteps = mockStepLogs[mockStepLogs.length - 1].steps
  const todayWorkout = mockWorkoutPlan.days.find(d => d.day === 'Monday')
  const completedExercises = todayWorkout?.exercises.filter(e => e.done).length || 0
  const totalExercises = todayWorkout?.exercises.length || 0
  const weekSteps = mockStepLogs.slice(-7)

  return (
    <Layout title="Home">
      <div className="space-y-4 animate-fade-in">
        {/* Greeting */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Morning, {user?.name?.split(' ')[0] || 'Ankit'} 👋
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">{today}</p>
        </div>

        {/* Calorie card — hero */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Today's Calories</p>
            <Link to="/food">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-xl">
                <Plus className="w-3.5 h-3.5" /> Log food
              </button>
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <MacroRingChart consumed={totals.calories} target={targets.calories} />
            <div className="flex-1">
              <p className="text-3xl font-bold text-gray-900">{totals.calories}</p>
              <p className="text-xs text-gray-500">of {targets.calories} kcal target</p>
              <p className="text-xs text-teal-600 font-semibold mt-1.5">
                {targets.calories - totals.calories} kcal remaining
              </p>
            </div>
          </div>
          <div className="mt-4">
            <MacroBreakdownBar
              protein={totals.protein} carbs={totals.carbs} fat={totals.fat}
              targetProtein={targets.protein} targetCarbs={targets.carbs} targetFat={targets.fat}
            />
          </div>
        </div>

        {/* Steps + Workout row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Steps */}
          <Link to="/steps">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-full">
              <p className="text-xs font-semibold text-gray-500 mb-1">Steps Today</p>
              <p className="text-2xl font-bold text-gray-900">{(todaySteps / 1000).toFixed(1)}k</p>
              <p className="text-xs text-gray-400">/ 10k goal</p>
              <div className="mt-2">
                <ProgressBar value={todaySteps} max={10000} height="xs" color={todaySteps >= 10000 ? 'green' : 'teal'} />
              </div>
              <div className="flex gap-0.5 mt-2">
                {weekSteps.map((s, i) => (
                  <div
                    key={s.date}
                    className={`flex-1 rounded-sm ${s.steps >= 10000 ? 'bg-teal-500' : s.steps >= 5000 ? 'bg-teal-300' : 'bg-gray-200'}`}
                    style={{ height: `${Math.max(4, Math.min(16, (s.steps / 10000) * 16))}px` }}
                  />
                ))}
              </div>
            </div>
          </Link>

          {/* Workout */}
          <Link to="/workout">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-full">
              <p className="text-xs font-semibold text-gray-500 mb-1">Today's Workout</p>
              <Badge variant="teal" className="text-xs mb-2">{todayWorkout?.label}</Badge>
              <p className="text-2xl font-bold text-gray-900">{completedExercises}<span className="text-base font-normal text-gray-400">/{totalExercises}</span></p>
              <p className="text-xs text-gray-400">exercises done</p>
              <div className="mt-2">
                <ProgressBar value={completedExercises} max={totalExercises} height="xs" color="teal" />
              </div>
            </div>
          </Link>
        </div>

        {/* Progress banner */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-200 text-xs">Weight progress</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-2xl font-bold">82kg</p>
                <div className="flex items-center gap-1 text-emerald-300 text-xs font-semibold">
                  <TrendingDown className="w-3.5 h-3.5" />
                  −6kg since Jan
                </div>
              </div>
              <p className="text-teal-200 text-xs mt-0.5">Goal: 78kg · 4kg to go</p>
            </div>
            <Link to="/body">
              <button className="flex items-center gap-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-semibold transition-colors">
                Track <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Attendance streak */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Attendance Streak</p>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-bold text-gray-900">{mockClientProfile.attendanceStreak} days</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: 14 }).map((_, i) => {
              const present = i < 8 && i !== 5
              const isToday = i === 13
              return (
                <div
                  key={i}
                  className={`flex-1 h-6 rounded-md ${present ? 'bg-teal-500' : 'bg-gray-100'} ${isToday ? 'ring-2 ring-teal-400' : ''}`}
                />
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2">Last 14 days</p>
        </div>

        {/* Quick actions grid */}
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/food', emoji: '🍽️', label: 'Log Food', desc: 'Add meals', color: 'bg-orange-50' },
              { to: '/body', emoji: '⚖️', label: 'Log Weight', desc: 'Update stats', color: 'bg-blue-50' },
              { to: '/explorer', emoji: '🥗', label: 'Food Explorer', desc: 'Browse & calculate', color: 'bg-green-50' },
              { to: '/analysis', emoji: '📊', label: 'Weekly Report', desc: 'View insights', color: 'bg-purple-50' },
            ].map(a => (
              <Link key={a.to} to={a.to}>
                <div className={`${a.color} rounded-2xl p-4 active:scale-95 transition-transform`}>
                  <span className="text-2xl">{a.emoji}</span>
                  <p className="text-sm font-semibold text-gray-900 mt-2">{a.label}</p>
                  <p className="text-xs text-gray-500">{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
