import { cn } from '../../utils/cn'

const variants = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  red: 'bg-red-50 text-red-700 border-red-100',
  yellow: 'bg-amber-50 text-amber-700 border-amber-100',
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  teal: 'bg-teal-50 text-teal-700 border-teal-100',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-100',
  orange: 'bg-orange-50 text-orange-700 border-orange-100',
}

export default function Badge({ children, variant = 'gray', className, dot }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border',
      variants[variant],
      className
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', {
        'bg-emerald-500': variant === 'green',
        'bg-red-500': variant === 'red',
        'bg-amber-500': variant === 'yellow',
        'bg-blue-500': variant === 'blue',
        'bg-teal-500': variant === 'teal',
        'bg-gray-400': variant === 'gray',
        'bg-purple-500': variant === 'purple',
        'bg-orange-500': variant === 'orange',
      })} />}
      {children}
    </span>
  )
}
