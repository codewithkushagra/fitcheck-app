import { useState } from 'react'
import { Dumbbell, Clock, CheckCircle2, Circle, Flame, Trophy, ChevronRight } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import { mockWorkoutPlan } from '../../api/mockData'
import toast from 'react-hot-toast'

export default function WorkoutPlan() {
  const today = 'Monday'
  const [activeDay, setActiveDay] = useState(today)
  const [exercises, setExercises] = useState(mockWorkoutPlan)

  const toggleExercise = (dayIndex, exIndex) => {
    setExercises(prev => {
      const updated = { ...prev }
      updated.days = [...prev.days]
      updated.days[dayIndex] = {
        ...prev.days[dayIndex],
        exercises: prev.days[dayIndex].exercises.map((ex, i) =>
          i === exIndex ? { ...ex, done: !ex.done } : ex
        )
      }
      return updated
    })
  }

  const activeIndex = exercises.days.findIndex(d => d.day === activeDay)
  const activeDayData = exercises.days[activeIndex]
  const doneCount = activeDayData?.exercises.filter(e => e.done).length || 0
  const totalCount = activeDayData?.exercises.length || 0

  const weeklyDone = exercises.days.reduce((acc, d) => acc + d.exercises.filter(e => e.done).length, 0)
  const weeklyTotal = exercises.days.reduce((acc, d) => acc + d.exercises.length, 0)
  const weeklyPct = weeklyTotal > 0 ? Math.round((weeklyDone / weeklyTotal) * 100) : 0

  return (
    <Layout title="My Plan">
      <div className="space-y-4 animate-fade-in">

        {/* Header */}
        <div>
          <h1 className="page-title">My Workout Plan</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {exercises.name} · by {exercises.assignedBy}
          </p>
        </div>

        {/* Weekly summary hero */}
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

        {/* Day selector — scrollable pill row */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 overflow-hidden">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {exercises.days.map((day) => {
              const done = day.exercises.filter(e => e.done).length
              const total = day.exercises.length
              const isToday = day.day === today
              const isRest = total === 0
              const isActive = activeDay === day.day
              const allDone = done === total && total > 0

              return (
                <button
                  key={day.day}
                  onClick={() => setActiveDay(day.day)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all shrink-0 min-w-[52px] ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'hover:bg-gray-50 text-gray-500'
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase">{day.day.slice(0, 3)}</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isRest
                      ? isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                      : allDone
                      ? 'bg-emerald-500 text-white'
                      : done > 0
                      ? 'bg-amber-400 text-white'
                      : isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isRest ? '–' : allDone ? '✓' : `${done}`}
                  </div>
                  {isToday && (
                    <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-white' : 'bg-teal-500'}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Exercise list for active day */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
          {/* Day header */}
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-gray-900">{activeDay}</h2>
                <Badge variant={activeDayData?.exercises.length === 0 ? 'gray' : 'teal'} className="text-[10px]">
                  {activeDayData?.label}
                </Badge>
              </div>
              {totalCount > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">{doneCount}/{totalCount} done</p>
              )}
            </div>
            {totalCount > 0 && doneCount > 0 && doneCount < totalCount && (
              <div className="w-16">
                <ProgressBar value={doneCount} max={totalCount} height="sm" />
              </div>
            )}
          </div>

          {activeDayData?.exercises.length === 0 ? (
            <div className="py-10 text-center px-4">
              <span className="text-4xl">🛋️</span>
              <p className="text-sm font-semibold text-gray-900 mt-3">Rest Day</p>
              <p className="text-xs text-gray-500 mt-1">Recovery is part of the plan. Rest up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {activeDayData?.exercises.map((ex, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors text-left"
                  onClick={() => toggleExercise(activeIndex, i)}
                >
                  {/* Check circle */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    ex.done
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-gray-300'
                  }`}>
                    {ex.done
                      ? <CheckCircle2 className="w-4 h-4" />
                      : <Circle className="w-4 h-4" />
                    }
                  </div>

                  {/* Exercise info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate transition-colors ${
                      ex.done ? 'text-gray-400 line-through' : 'text-gray-900'
                    }`}>
                      {ex.name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Dumbbell className="w-3 h-3 shrink-0" />
                        {ex.sets}×{ex.reps}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 shrink-0" />
                        {ex.rest}
                      </span>
                    </div>
                  </div>

                  {/* Done badge or chevron */}
                  {ex.done
                    ? <Badge variant="green" className="text-[10px] shrink-0">Done</Badge>
                    : <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                  }
                </button>
              ))}
            </div>
          )}

          {/* Completion banner */}
          {doneCount === totalCount && totalCount > 0 && (
            <div className="mx-4 my-3 p-3 bg-teal-50 rounded-xl border border-teal-200 flex items-center gap-2">
              <Flame className="w-4 h-4 text-teal-600 shrink-0" />
              <p className="text-sm text-teal-700 font-semibold">Workout complete! Excellent session 🎉</p>
            </div>
          )}
        </div>

        {/* Per-day mini stats row */}
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
