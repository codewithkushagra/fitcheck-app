import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../utils/cn'
import useAuthStore from '../../store/authStore'
import useAppStore from '../../store/appStore'
import Avatar from '../ui/Avatar'
import {
  LayoutDashboard, Users, UserCheck, Calendar, AlertTriangle,
  CreditCard, Dumbbell, UtensilsCrossed, Activity, Trophy,
  BookOpen, Stethoscope, MessageSquare, ClipboardList,
  ChevronLeft, ChevronRight, LogOut, Zap, BarChart3
} from 'lucide-react'

const adminNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Trainers', icon: UserCheck, path: '/admin/trainers' },
  { label: 'All Clients', icon: Users, path: '/admin/clients' },
  { label: 'Attendance', icon: Calendar, path: '/admin/attendance' },
  { label: 'Follow-up Centre', icon: AlertTriangle, path: '/admin/followup' },
  { label: 'Billing', icon: CreditCard, path: '/admin/billing' },
]

const trainerNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/trainer' },
  { label: 'My Clients', icon: Users, path: '/trainer/clients' },
  { label: 'Attendance', icon: Calendar, path: '/trainer/attendance' },
  { label: 'Workout Plans', icon: Dumbbell, path: '/trainer/plans' },
]

const clientNav = [
  { label: 'Home', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Food Log', icon: UtensilsCrossed, path: '/food' },
  { label: 'Body Tracker', icon: Activity, path: '/body' },
  { label: 'Steps & Achievements', icon: Trophy, path: '/steps' },
  { label: 'My Plan', icon: ClipboardList, path: '/workout' },
  { label: 'Food Explorer', icon: BookOpen, path: '/explorer' },
  { label: 'Weekly Analysis', icon: BarChart3, path: '/analysis' },
  { label: 'Medical Plan', icon: Stethoscope, path: '/medical', premium: true },
  { label: 'Consult Trainer', icon: MessageSquare, path: '/consult', premium: true },
]

function NavItem({ item, collapsed }) {
  const location = useLocation()
  const isActive = location.pathname === item.path

  return (
    <Link
      to={item.path}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative group',
        isActive
          ? 'bg-teal-50 text-teal-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        collapsed && 'justify-center'
      )}
      title={collapsed ? item.label : undefined}
    >
      <item.icon className={cn('w-4.5 h-4.5 shrink-0', isActive ? 'text-teal-600' : '')} style={{ width: 18, height: 18 }} />
      {!collapsed && (
        <span className="text-sm font-medium truncate">{item.label}</span>
      )}
      {!collapsed && item.premium && (
        <span className="ml-auto">
          <Zap className="w-3 h-3 text-amber-500" />
        </span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {item.label}
        </div>
      )}
    </Link>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useAppStore()
  const collapsed = !sidebarOpen

  const navItems = user?.role === 'gym_admin'
    ? adminNav
    : user?.role === 'trainer'
      ? trainerNav
      : clientNav

  const roleLabel = user?.role === 'gym_admin'
    ? 'Gym Admin'
    : user?.role === 'trainer'
      ? 'Trainer'
      : 'Member'

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-200 z-30',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 h-16 border-b border-gray-50 shrink-0', collapsed && 'justify-center')}>
        <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center shrink-0">
          <Dumbbell className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-gray-900">Fit Check</p>
            <p className="text-xs text-gray-400">by Anmol</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map(item => (
          <NavItem key={item.path} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* User + Collapse */}
      <div className="p-3 border-t border-gray-50 space-y-1">
        <div className={cn('flex items-center gap-3 px-3 py-2 rounded-xl', collapsed && 'justify-center')}>
          <Avatar name={user?.name} size="sm" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">{roleLabel}</p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Log out' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
        <button
          onClick={toggleSidebar}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-colors',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
