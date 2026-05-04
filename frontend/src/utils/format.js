import { format, formatDistanceToNow, parseISO } from 'date-fns'

export const formatDate = (date, fmt = 'MMM d, yyyy') => {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt)
}

export const formatRelative = (date) => {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export const formatNumber = (n, decimals = 0) => {
  if (n === null || n === undefined) return '-'
  return n.toLocaleString('en-IN', { maximumFractionDigits: decimals })
}

export const formatMacro = (val, unit = 'g') => {
  if (val === null || val === undefined) return '-'
  return `${Math.round(val)}${unit}`
}

export const macroColor = {
  calories: '#f97316',
  protein: '#3b82f6',
  carbs: '#f59e0b',
  fat: '#8b5cf6',
}

export const goalLabel = {
  fat_loss: 'Fat Loss',
  muscle_gain: 'Muscle Gain',
  maintenance: 'Maintenance',
  custom: 'Custom',
}

export const subscriptionLabel = {
  core: 'Core',
  premium: 'Premium',
}
