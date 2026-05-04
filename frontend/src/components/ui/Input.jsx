import { cn } from '../../utils/cn'
import { forwardRef } from 'react'

const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightElement,
  className,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-150',
            error ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500' : 'border-gray-200',
            LeftIcon && 'pl-10',
            rightElement && 'pr-10',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
