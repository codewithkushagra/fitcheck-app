import { cn } from '../../utils/cn'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  ghost: 'hover:bg-gray-100 text-gray-600',
  outline: 'border border-teal-600 text-teal-600 hover:bg-teal-50',
}

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs gap-1',
  sm: 'px-3 py-2 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-5 py-3 text-base gap-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}
