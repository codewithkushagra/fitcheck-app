import { cn } from '../../utils/cn'

export default function Card({ children, className, hover = false, onClick }) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-sm',
        hover && 'hover:shadow-md hover:border-gray-200 cursor-pointer transition-all duration-150',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('px-5 pt-5 pb-4 border-b border-gray-50', className)}>
      {children}
    </div>
  )
}

export function CardBody({ children, className }) {
  return (
    <div className={cn('p-5', className)}>
      {children}
    </div>
  )
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'teal', className }) {
  const colorMap = {
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 shadow-sm p-4', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          {trend && (
            <p className={cn('text-xs font-medium mt-1.5', trend > 0 ? 'text-emerald-600' : 'text-red-600')}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', colorMap[color])}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  )
}
