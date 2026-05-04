import Sidebar from './Sidebar'
import Topbar from './Topbar'
import BottomNav from './BottomNav'
import MobileHeader from './MobileHeader'
import TrainerInviteBanner from '../ui/TrainerInviteBanner'
import useAppStore from '../../store/appStore'
import useAuthStore from '../../store/authStore'
import { cn } from '../../utils/cn'

export default function Layout({ children, title, showBack, onBack }) {
  const { sidebarOpen } = useAppStore()
  const { user } = useAuthStore()

  // Show invite banner only for end_users (who could become trainers)
  const showInviteBanner = user?.role === 'end_user'

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className={cn(
        'flex-1 flex flex-col min-h-screen overflow-x-hidden w-0 transition-all duration-200',
        sidebarOpen ? 'lg:ml-60' : 'lg:ml-16'
      )}>
        {/* Desktop topbar */}
        <div className="hidden lg:block">
          <Topbar title={title} />
        </div>

        {/* Mobile header */}
        <div className="lg:hidden">
          <MobileHeader title={title} showBack={showBack} onBack={onBack} />
        </div>

        {/* Trainer invite banner — shown to end_users with pending invites */}
        {showInviteBanner && <TrainerInviteBanner />}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  )
}
