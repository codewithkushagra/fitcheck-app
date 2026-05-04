import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const MACRO_COLORS = {
  protein: '#3b82f6',
  carbs: '#f59e0b',
  fat: '#8b5cf6',
  remaining: '#f1f5f9',
}

export function MacroRingChart({ consumed, target }) {
  const pct = Math.min(100, Math.round((consumed / target) * 100))
  const remaining = Math.max(0, target - consumed)

  const data = [
    { name: 'Consumed', value: consumed },
    { name: 'Remaining', value: remaining },
  ]

  return (
    <div className="relative w-32 h-32">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={44}
            outerRadius={60}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill="#0d9488" />
            <Cell fill="#f1f5f9" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-gray-900">{pct}%</p>
        <p className="text-xs text-gray-500">of goal</p>
      </div>
    </div>
  )
}

export function FoodTypeChart({ junk, healthy }) {
  const total = junk + healthy
  const data = [
    { name: 'Healthy', value: healthy },
    { name: 'Junk', value: junk },
  ]

  return (
    <div className="relative w-24 h-24">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={28} outerRadius={44} dataKey="value" strokeWidth={0}>
            <Cell fill="#10b981" />
            <Cell fill="#f97316" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-xs font-bold text-gray-900">{total > 0 ? Math.round((healthy / total) * 100) : 0}%</p>
        <p className="text-xs text-gray-400">clean</p>
      </div>
    </div>
  )
}

export function MacroBreakdownBar({ protein, carbs, fat, targetProtein, targetCarbs, targetFat }) {
  const items = [
    { label: 'Protein', consumed: protein, target: targetProtein, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Carbs', consumed: carbs, target: targetCarbs, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Fat', consumed: fat, target: targetFat, color: '#8b5cf6', bg: '#f5f3ff' },
  ]

  return (
    <div className="space-y-3">
      {items.map(item => {
        const pct = Math.min(100, Math.round((item.consumed / item.target) * 100))
        return (
          <div key={item.label}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-600">{item.label}</span>
              <span className="text-xs text-gray-500">{Math.round(item.consumed)}g / {item.target}g</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: item.bg }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
