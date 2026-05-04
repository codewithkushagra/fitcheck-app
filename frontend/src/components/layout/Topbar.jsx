import { Bell, Menu } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import useAppStore from '../../store/appStore'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'

export default function Topbar({ title }) {
  const { user } = useAuthStore()
  const { toggleSidebar, notifications } = useAppStore()
  const unread = notifications.filter(n => !n.read).length

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        {user?.subscription === 'premium' && (
          <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
            ⚡ Premium
          </span>
        )}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
          <Avatar name={user?.name} size="sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.gym?.name}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
