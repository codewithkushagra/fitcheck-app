import { useState } from 'react'
import { Bell, ChevronLeft, X, Menu, Dumbbell, LogOut, Search } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useAppStore from '../../store/appStore'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import {
  LayoutDashboard, Users, Calendar, AlertTriangle, CreditCard,
  UserCheck, UtensilsCrossed, Activity, Trophy, ClipboardList,
  BookOpen, BarChart3, MessageSquare, Stethoscope, Zap
} from 'lucide-react'
import { cn } from '../../utils/cn'

const allAdminNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Trainers', icon: UserCheck, path: '/admin/trainers' },
  { label: 'All Clients', icon: Users, path: '/admin/clients' },
  { label: 'Attendance', icon: Calendar, path: '/admin/attendance' },
  { label: 'Follow-up Centre', icon: AlertTriangle, path: '/admin/followup' },
  { label: 'Billing', icon: CreditCard, path: '/admin/billing' },
]

const allTrainerNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/trainer' },
  { label: 'My Clients', icon: Users, path: '/trainer/clients' },
  { label: 'Attendance', icon: Calendar, path: '/trainer/attendance' },
  { label: 'Workout Plans', icon: Dumbbell, path: '/trainer/plans' },
]

const allClientNav = [
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

export default function MobileHeader({ title, showBack, onBack }) {
  const { user, logout } = useAuthStore()
  const { notifications } = useAppStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const unread = notifications.filter(n => !n.read).length

  const navItems = user?.role === 'gym_admin'
    ? allAdminNav
    : user?.role === 'trainer'
      ? allTrainerNav
      : allClientNav

  const roleLabel = user?.role === 'gym_admin' ? 'Gym Admin' : user?.role === 'trainer' ? 'Trainer' : 'Member'

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            {showBack ? (
              <button onClick={handleBack} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-700 -ml-1">
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setDrawerOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-700 -ml-1"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            {title && <h1 className="text-base font-bold text-gray-900">{title}</h1>}
          </div>
          <div className="flex items-center gap-2">
            {user?.subscription === 'premium' && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                <Zap className="w-3 h-3" />
                Pro
              </span>
            )}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600">
              <Bell className="w-5 h-5" />
              {unread > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
            <Avatar name={user?.name} size="sm" />
          </div>
        </div>
      </header>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-72 bg-white h-full flex flex-col shadow-2xl animate-slide-in">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center shrink-0">
                  <Dumbbell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Fit Check</p>
                  <p className="text-xs text-gray-400">by Anmol</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User info */}
            <div className="px-4 py-3 bg-teal-50 mx-3 mt-3 rounded-xl">
              <div className="flex items-center gap-3">
                <Avatar name={user?.name} size="md" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500">{roleLabel}</p>
                </div>
                {user?.subscription === 'premium' && (
                  <span className="ml-auto shrink-0 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                    ⚡ Pro
                  </span>
                )}
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 mt-2">
              {navItems.map(item => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150',
                      isActive
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.premium && <Zap className="w-3.5 h-3.5 text-amber-400 ml-auto" />}
                  </Link>
                )
              })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={() => { logout(); setDrawerOpen(false) }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
