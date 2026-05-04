import { cn } from '../../utils/cn'

export default function ProgressBar({ value, max = 100, color = 'teal', height = 'sm', showLabel = false, label }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  
  const colorMap = {
    teal: 'bg-teal-500',
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  }

  const bgMap = {
    teal: 'bg-teal-100',
    blue: 'bg-blue-100',
    green: 'bg-emerald-100',
    amber: 'bg-amber-100',
    red: 'bg-red-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100',
  }

  const heightMap = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3',
  }

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-gray-600">{label}</span>}
          {showLabel && <span className="text-xs font-semibold text-gray-700">{pct}%</span>}
        </div>
      )}
      <div className={cn('w-full rounded-full overflow-hidden', bgMap[color], heightMap[height])}>
        <div
          className={cn('rounded-full transition-all duration-500', colorMap[color], heightMap[height])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
