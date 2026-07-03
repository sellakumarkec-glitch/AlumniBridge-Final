import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth'
import { Loading } from './components/ui'
import AuthPage from './pages/AuthPage'
import AppLayout from './layout/AppLayout'
import Dashboard from './pages/Dashboard'
import AlumniDirectory from './pages/AlumniDirectory'
import AlumniProfile from './pages/AlumniProfile'
import Mentorship from './pages/Mentorship'
import Jobs from './pages/Jobs'
import Internships from './pages/Internships'
import Events from './pages/Events'
import SuccessStories from './pages/SuccessStories'
import Forum from './pages/Forum'
import ForumThread from './pages/ForumThread'
import Notifications from './pages/Notifications'
import AIAssistant from './pages/AIAssistant'
import ResumeAnalyzer from './pages/ResumeAnalyzer'
import InterviewPractice from './pages/InterviewPractice'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'
import Landing from './pages/Landing'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading label="Loading your workspace…" />
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

export default function App() {
  const { loading } = useAuth()
  if (loading) return <Loading label="Starting AlumniBridge…" />

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="directory" element={<AlumniDirectory />} />
        <Route path="alumni/:id" element={<AlumniProfile />} />
        <Route path="mentorship" element={<Mentorship />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="internships" element={<Internships />} />
        <Route path="events" element={<Events />} />
        <Route path="stories" element={<SuccessStories />} />
        <Route path="forum" element={<Forum />} />
        <Route path="forum/:id" element={<ForumThread />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="ai-assistant" element={<AIAssistant />} />
        <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
        <Route path="interview-practice" element={<InterviewPractice />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<AdminPanel />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
