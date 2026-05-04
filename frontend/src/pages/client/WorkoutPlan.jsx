import { useState, useEffect } from 'react'
import { Dumbbell, Clock, CheckCircle2, Circle, Flame, Trophy, ChevronRight } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import api from '../../api/axios'
import { format } from 'date-fns'

export default function WorkoutPlan() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkedExercises, setCheckedExercises] = useState({})

  const dayName = format(new Date(), 'EEEE')
  const [activeDay, setActiveDay] = useState(dayName)

  useEffect(() => {
    api.get('/workouts/my-plan').then(res => {
      setPlan(res.data)
    }).catch(() => setPlan(null)).finally(() => setLoading(false))
  }, [])

  const toggleExercise = (dayName, exIndex) => {
    const key = `${dayName}_${exIndex}`
    setCheckedExercises(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const isExDone = (dayName, exIndex) => !!checkedExercises[`${dayName}_${exIndex}`]

  if (loading) {
    return (
      <Layout title="My Plan">
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  if (!plan) {
    return (
      <Layout title="My Plan">
        <div className="space-y-4 animate-fade-in">
          <h1 className="page-title">My Workout Plan</h1>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center px-4">
            <span className="text-5xl">🏋️</span>
            <p className="text-base font-semibold text-gray-900 mt-4">No plan assigned yet</p>
            <p className="text-sm text-gray-400 mt-2">Your trainer will assign a workout plan once you're set up.</p>
          </div>
        </div>
      </Layout>
    )
  }

  // Normalise plan.days — backend stores as JSON
  const days = Array.isArray(plan.days) ? plan.days : []

  const weeklyDone = days.reduce((acc, d, di) =>
    acc + (d.exercises?.filter((_, ei) => isExDone(d.day, ei)).length || 0), 0)
  const weeklyTotal = days.reduce((acc, d) => acc + (d.exercises?.length || 0), 0)
  const weeklyPct = weeklyTotal > 0 ? Math.round((weeklyDone / weeklyTotal) * 100) : 0

  const activeDayData = days.find(d => d.day === activeDay) || days[0]
  const doneCount = activeDayData?.exercises?.filter((_, i) => isExDone(activeDayData.day, i)).length || 0
  const totalCount = activeDayData?.exercises?.length || 0

  return (
    <Layout title="My Plan">
      <div className="space-y-4 animate-fade-in">
        <div>
          <h1 className="page-title">My Workout Plan</h1>
          <p className="text-xs text-gray-500 mt-0.5">{plan.name} · by trainer</p>
        </div>

        {/* Weekly progress hero */}
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-4 text-white w-full">
          <div className="flex items-center justify-between mb-3 gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-teal-200 uppercase tracking-wide">Weekly Progress</p>
              <p className="text-2xl font-bold mt-0.5">{weeklyPct}%</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
          <ProgressBar value={weeklyDone} max={weeklyTotal} height="sm" color="white" />
          <p className="text-xs text-teal-200 mt-2">{weeklyDone} of {weeklyTotal} exercises completed</p>
        </div>

        {/* Day selector */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 overflow-hidden">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {days.map(day => {
              const doneCt = day.exercises?.filter((_, i) => isExDone(day.day, i)).length || 0
              const totalCt = day.exercises?.length || 0
              const isRest = totalCt === 0
              const isActive = activeDay === day.day
              const allDone = doneCt === totalCt && totalCt > 0

              return (
                <button key={day.day} onClick={() => setActiveDay(day.day)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all shrink-0 min-w-[52px] ${isActive ? 'bg-teal-600 text-white shadow-sm' : 'hover:bg-gray-50 text-gray-500'}`}
                >
                  <span className="text-[10px] font-semibold uppercase">{day.day?.slice(0, 3)}</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isRest ? isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                    : allDone ? 'bg-emerald-500 text-white'
                    : doneCt > 0 ? 'bg-amber-400 text-white'
                    : isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isRest ? '–' : allDone ? '✓' : doneCt || '0'}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Exercise list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-gray-900">{activeDayData?.day}</h2>
                <Badge variant={totalCount === 0 ? 'gray' : 'teal'} className="text-[10px]">
                  {activeDayData?.label || (totalCount === 0 ? 'Rest' : 'Training')}
                </Badge>
              </div>
              {totalCount > 0 && <p className="text-xs text-gray-400 mt-0.5">{doneCount}/{totalCount} done</p>}
            </div>
            {totalCount > 0 && doneCount > 0 && doneCount < totalCount && (
              <div className="w-16"><ProgressBar value={doneCount} max={totalCount} height="sm" /></div>
            )}
          </div>

          {totalCount === 0 ? (
            <div className="py-10 text-center px-4">
              <span className="text-4xl">🛋️</span>
              <p className="text-sm font-semibold text-gray-900 mt-3">Rest Day</p>
              <p className="text-xs text-gray-500 mt-1">Recovery is part of the plan. Rest up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {activeDayData?.exercises?.map((ex, i) => {
                const done = isExDone(activeDayData.day, i)
                return (
                  <button key={i} onClick={() => toggleExercise(activeDayData.day, i)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors text-left"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${done ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-300'}`}>
                      {done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate transition-colors ${done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{ex.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Dumbbell className="w-3 h-3 shrink-0" />{ex.sets}×{ex.reps}
                        </span>
                        {ex.rest && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 shrink-0" />{ex.rest}
                          </span>
                        )}
                      </div>
                    </div>
                    {done ? <Badge variant="green" className="text-[10px] shrink-0">Done</Badge>
                          : <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />}
                  </button>
                )
              })}
            </div>
          )}

          {doneCount === totalCount && totalCount > 0 && (
            <div className="mx-4 my-3 p-3 bg-teal-50 rounded-xl border border-teal-200 flex items-center gap-2">
              <Flame className="w-4 h-4 text-teal-600 shrink-0" />
              <p className="text-sm text-teal-700 font-semibold">Workout complete! Excellent session 🎉</p>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Exercises', value: totalCount, icon: Dumbbell, color: 'text-teal-600 bg-teal-50' },
            { label: 'Completed', value: doneCount, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Remaining', value: totalCount - doneCount, icon: Circle, color: 'text-amber-600 bg-amber-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-1.5 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold text-gray-900">{value}</p>
              <p className="text-[10px] text-gray-400 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
