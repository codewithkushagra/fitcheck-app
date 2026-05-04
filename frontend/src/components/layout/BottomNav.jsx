import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../utils/cn'
import useAuthStore from '../../store/authStore'
import {
  LayoutDashboard, Users, Calendar, AlertTriangle, CreditCard,
  UserCheck, Dumbbell, UtensilsCrossed, Activity, Trophy,
  ClipboardList, BookOpen, BarChart3, MessageSquare
} from 'lucide-react'

const adminNav = [
  { label: 'Home', icon: LayoutDashboard, path: '/admin' },
  { label: 'Clients', icon: Users, path: '/admin/clients' },
  { label: 'Trainers', icon: UserCheck, path: '/admin/trainers' },
  { label: 'Attendance', icon: Calendar, path: '/admin/attendance' },
  { label: 'Billing', icon: CreditCard, path: '/admin/billing' },
]

const trainerNav = [
  { label: 'Home', icon: LayoutDashboard, path: '/trainer' },
  { label: 'Clients', icon: Users, path: '/trainer/clients' },
  { label: 'Attendance', icon: Calendar, path: '/trainer/attendance' },
  { label: 'Plans', icon: Dumbbell, path: '/trainer/plans' },
]

const clientNav = [
  { label: 'Home', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Food', icon: UtensilsCrossed, path: '/food' },
  { label: 'Body', icon: Activity, path: '/body' },
  { label: 'Steps', icon: Trophy, path: '/steps' },
  { label: 'More', icon: BarChart3, path: '/workout' },
]

export default function BottomNav() {
  const { user } = useAuthStore()
  const location = useLocation()

  const navItems = user?.role === 'gym_admin'
    ? adminNav
    : user?.role === 'trainer'
      ? trainerNav
      : clientNav

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-100 safe-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && item.path !== '/admin' && item.path !== '/trainer' &&
             location.pathname.startsWith(item.path))
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-150 min-w-0 flex-1',
                isActive ? 'text-teal-600' : 'text-gray-400 active:text-gray-600'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150',
                isActive ? 'bg-teal-50' : ''
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className={cn('text-xs font-medium truncate', isActive ? 'text-teal-600' : 'text-gray-400')}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
      {/* Safe area spacer for iPhone home indicator */}
      <div className="h-safe-bottom" />
    </nav>
  )
}
