import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'
import InstallPrompt from './components/ui/InstallPrompt'

// Auth pages
import Login from './pages/auth/Login'
import GymRegister from './pages/auth/GymRegister'
import UserSignup from './pages/auth/UserSignup'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import Trainers from './pages/admin/Trainers'
import ClientMasterList from './pages/admin/ClientMasterList'
import AttendanceReports from './pages/admin/AttendanceReports'
import FollowUpCenter from './pages/admin/FollowUpCenter'
import Billing from './pages/admin/Billing'

// Trainer pages
import TrainerDashboard from './pages/trainer/TrainerDashboard'
import MyClients from './pages/trainer/MyClients'
import ClientProfile from './pages/trainer/ClientProfile'
import MarkAttendance from './pages/trainer/MarkAttendance'
import WorkoutPlans from './pages/trainer/WorkoutPlans'

// Client pages
import ClientDashboard from './pages/client/ClientDashboard'
import FoodLogger from './pages/client/FoodLogger'
import BodyTracker from './pages/client/BodyTracker'
import StepsAchievements from './pages/client/StepsAchievements'
import WorkoutPlan from './pages/client/WorkoutPlan'
import FoodExplorer from './pages/client/FoodExplorer'
import WeeklyAnalysis from './pages/client/WeeklyAnalysis'
import ConsultTrainer from './pages/client/ConsultTrainer'
import MedicalPlan from './pages/client/MedicalPlan'

function RequireAuth({ children, roles }) {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) {
    if (user?.role === 'gym_admin') return <Navigate to="/admin" replace />
    if (user?.role === 'trainer') return <Navigate to="/trainer" replace />
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function RootRedirect() {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role === 'gym_admin') return <Navigate to="/admin" replace />
  if (user?.role === 'trainer') return <Navigate to="/trainer" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <InstallPrompt />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
          },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<GymRegister />} />
        <Route path="/signup" element={<UserSignup />} />

        {/* Admin */}
        <Route path="/admin" element={<RequireAuth roles={['gym_admin']}><AdminDashboard /></RequireAuth>} />
        <Route path="/admin/trainers" element={<RequireAuth roles={['gym_admin']}><Trainers /></RequireAuth>} />
        <Route path="/admin/clients" element={<RequireAuth roles={['gym_admin']}><ClientMasterList /></RequireAuth>} />
        <Route path="/admin/attendance" element={<RequireAuth roles={['gym_admin']}><AttendanceReports /></RequireAuth>} />
        <Route path="/admin/followup" element={<RequireAuth roles={['gym_admin']}><FollowUpCenter /></RequireAuth>} />
        <Route path="/admin/billing" element={<RequireAuth roles={['gym_admin']}><Billing /></RequireAuth>} />

        {/* Trainer */}
        <Route path="/trainer" element={<RequireAuth roles={['trainer']}><TrainerDashboard /></RequireAuth>} />
        <Route path="/trainer/clients" element={<RequireAuth roles={['trainer']}><MyClients /></RequireAuth>} />
        <Route path="/trainer/clients/:id" element={<RequireAuth roles={['trainer']}><ClientProfile /></RequireAuth>} />
        <Route path="/trainer/attendance" element={<RequireAuth roles={['trainer']}><MarkAttendance /></RequireAuth>} />
        <Route path="/trainer/plans" element={<RequireAuth roles={['trainer']}><WorkoutPlans /></RequireAuth>} />

        {/* Client */}
        <Route path="/dashboard" element={<RequireAuth roles={['end_user']}><ClientDashboard /></RequireAuth>} />
        <Route path="/food" element={<RequireAuth roles={['end_user']}><FoodLogger /></RequireAuth>} />
        <Route path="/body" element={<RequireAuth roles={['end_user']}><BodyTracker /></RequireAuth>} />
        <Route path="/steps" element={<RequireAuth roles={['end_user']}><StepsAchievements /></RequireAuth>} />
        <Route path="/workout" element={<RequireAuth roles={['end_user']}><WorkoutPlan /></RequireAuth>} />
        <Route path="/explorer" element={<RequireAuth roles={['end_user']}><FoodExplorer /></RequireAuth>} />
        <Route path="/analysis" element={<RequireAuth roles={['end_user']}><WeeklyAnalysis /></RequireAuth>} />
        <Route path="/medical" element={<RequireAuth roles={['end_user']}><MedicalPlan /></RequireAuth>} />
        <Route path="/consult" element={<RequireAuth roles={['end_user']}><ConsultTrainer /></RequireAuth>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
