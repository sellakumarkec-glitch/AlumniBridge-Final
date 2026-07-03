import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiHome, FiUsers, FiMessageSquare, FiBriefcase, FiCalendar, FiAward,
  FiBookOpen, FiBell, FiCpu, FiFileText, FiUser, FiShield, FiMenu, FiX, FiLogOut, FiSearch,
} from 'react-icons/fi'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { Avatar } from '../components/ui'
import { cn, roleLabel, roleBadgeClass } from '../lib/utils'

const navByRole: Record<string, { to: string; label: string; icon: React.ReactNode }[]> = {
  student: [
    { to: '/app', label: 'Dashboard', icon: <FiHome /> },
    { to: '/app/directory', label: 'Alumni Directory', icon: <FiUsers /> },
    { to: '/app/mentorship', label: 'Mentorship', icon: <FiMessageSquare /> },
    { to: '/app/jobs', label: 'Jobs', icon: <FiBriefcase /> },
    { to: '/app/internships', label: 'Internships', icon: <FiBriefcase /> },
    { to: '/app/events', label: 'Events', icon: <FiCalendar /> },
    { to: '/app/stories', label: 'Success Stories', icon: <FiAward /> },
    { to: '/app/forum', label: 'Community', icon: <FiBookOpen /> },
    { to: '/app/ai-assistant', label: 'AI Assistant', icon: <FiCpu /> },
    { to: '/app/resume-analyzer', label: 'Resume Analyzer', icon: <FiFileText /> },
    { to: '/app/interview-practice', label: 'Interview Practice', icon: <FiCpu /> },
  ],
  alumni: [
    { to: '/app', label: 'Dashboard', icon: <FiHome /> },
    { to: '/app/directory', label: 'Alumni Directory', icon: <FiUsers /> },
    { to: '/app/mentorship', label: 'Mentorship', icon: <FiMessageSquare /> },
    { to: '/app/jobs', label: 'Jobs', icon: <FiBriefcase /> },
    { to: '/app/internships', label: 'Internships', icon: <FiBriefcase /> },
    { to: '/app/events', label: 'Events', icon: <FiCalendar /> },
    { to: '/app/stories', label: 'Success Stories', icon: <FiAward /> },
    { to: '/app/forum', label: 'Community', icon: <FiBookOpen /> },
  ],
  placement: [
    { to: '/app', label: 'Dashboard', icon: <FiHome /> },
    { to: '/app/directory', label: 'Alumni Directory', icon: <FiUsers /> },
    { to: '/app/jobs', label: 'Jobs', icon: <FiBriefcase /> },
    { to: '/app/internships', label: 'Internships', icon: <FiBriefcase /> },
    { to: '/app/events', label: 'Events', icon: <FiCalendar /> },
    { to: '/app/forum', label: 'Community', icon: <FiBookOpen /> },
    { to: '/app/admin', label: 'Admin Panel', icon: <FiShield /> },
  ],
  admin: [
    { to: '/app', label: 'Dashboard', icon: <FiHome /> },
    { to: '/app/directory', label: 'Alumni Directory', icon: <FiUsers /> },
    { to: '/app/jobs', label: 'Jobs', icon: <FiBriefcase /> },
    { to: '/app/internships', label: 'Internships', icon: <FiBriefcase /> },
    { to: '/app/events', label: 'Events', icon: <FiCalendar /> },
    { to: '/app/stories', label: 'Success Stories', icon: <FiAward /> },
    { to: '/app/forum', label: 'Community', icon: <FiBookOpen /> },
    { to: '/app/admin', label: 'Admin Panel', icon: <FiShield /> },
  ],
}

export default function AppLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  useEffect(() => {
    if (!user) return
    let active = true
    const load = async () => {
      const { count } = await supabase
        .from('notifications').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id).eq('is_read', false)
      if (active) setUnread(count ?? 0)
    }
    load()
    const t = setInterval(load, 30000)
    return () => { active = false; clearInterval(t) }
  }, [user, location.pathname])

  if (!user) return null
  const nav = navByRole[user.role] ?? navByRole.student

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-ink-50 flex">
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-ink-100 fixed h-screen">
        <SidebarContent user={user} nav={nav} unread={unread} onSignOut={handleSignOut} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="lg:hidden fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.aside
              className="absolute left-0 top-0 h-full w-72 bg-white border-r border-ink-100 flex flex-col"
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              <SidebarContent user={user} nav={nav} unread={unread} onSignOut={handleSignOut} onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-ink-100">
          <div className="px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
            <button className="lg:hidden p-2 rounded-lg hover:bg-ink-100" onClick={() => setMobileOpen(true)}>
              <FiMenu size={22} />
            </button>
            <div className="hidden sm:flex flex-1 max-w-md">
              <div className="relative w-full">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  placeholder="Search alumni, jobs, events…"
                  className="input pl-10 py-2 text-sm bg-ink-50 border-ink-100"
                  onFocus={(e) => { e.target.blur(); navigate('/app/directory') }}
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <NavLink to="/app/notifications" className="relative p-2.5 rounded-lg text-ink-600 hover:bg-ink-100 hover:text-ink-900 transition-colors">
                <FiBell size={20} />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-error-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </NavLink>
              <Link to="/app/profile" className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-lg hover:bg-ink-100 transition-colors">
                <Avatar name={user.full_name} src={user.avatar_url} size={34} />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-ink-900 leading-tight">{user.full_name}</p>
                  <span className={cn(roleBadgeClass(user.role), 'mt-0.5')}>{roleLabel(user.role)}</span>
                </div>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ user, nav, unread, onSignOut, onClose }: {
  user: { full_name: string; role: string; avatar_url: string | null; email: string }
  nav: { to: string; label: string; icon: React.ReactNode }[]
  unread: number
  onSignOut: () => void
  onClose?: () => void
}) {
  return (
    <>
      <div className="h-16 px-5 flex items-center justify-between border-b border-ink-100">
        <Link to="/app" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold">A</div>
          <span className="font-display font-bold text-ink-900">AlumniBridge</span>
        </Link>
        {onClose && <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ink-100"><FiX /></button>}
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.to === '/app/notifications' && unread > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-error-500 text-white text-[10px] font-bold flex items-center justify-center">{unread}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-ink-100">
        <button onClick={onSignOut} className="nav-link w-full text-ink-600 hover:text-error-600 hover:bg-red-50">
          <FiLogOut /> Sign out
        </button>
      </div>
    </>
  )
}
