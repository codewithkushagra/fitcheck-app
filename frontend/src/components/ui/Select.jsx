import { cn } from '../../utils/cn'
import { ChevronDown } from 'lucide-react'

export default function Select({ label, error, options = [], className, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <div className="relative">
        <select
          className={cn(
            'w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-150 pr-10',
            error ? 'border-red-400' : 'border-gray-200',
            className
          )}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}
