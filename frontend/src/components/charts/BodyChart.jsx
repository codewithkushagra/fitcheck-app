import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import { format, parseISO } from 'date-fns'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3">
        <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.dataKey} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.value} {p.unit || ''}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function WeightChart({ data, goalWeight }) {
  const chartData = data.map(d => ({
    ...d,
    date: format(parseISO(d.date), 'MMM d'),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
        <Tooltip content={<CustomTooltip />} />
        {goalWeight && (
          <ReferenceLine y={goalWeight} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5}
            label={{ value: `Goal: ${goalWeight}kg`, position: 'insideTopRight', fontSize: 11, fill: '#10b981' }}
          />
        )}
        <Area type="monotone" dataKey="weight" stroke="#0d9488" strokeWidth={2} fill="url(#weightGrad)"
          dot={{ r: 3, fill: '#0d9488', strokeWidth: 0 }} activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function MacroTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="protein" stroke="#3b82f6" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function StepsBarChart({ data }) {
  const chartData = data.map(d => ({
    ...d,
    date: format(parseISO(d.date), 'EEE'),
  }))

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={10000} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5} />
        <Bar dataKey="steps" fill="#0d9488" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
