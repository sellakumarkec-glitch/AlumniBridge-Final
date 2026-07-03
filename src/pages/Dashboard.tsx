import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiUsers, FiBriefcase, FiCalendar, FiMessageSquare, FiAward, FiTrendingUp,
  FiCheckCircle, FiArrowRight, FiBookOpen,
} from 'react-icons/fi'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { StatCard, Loading, EmptyState, Avatar } from '../components/ui'
import { timeAgo } from '../lib/utils'

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Record<string, number>>({})
  const [recent, setRecent] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    let active = true
    const load = async () => {
      const [alumni, jobs, internships, eventsReq, mentorReq, stories, posts] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'alumni').eq('is_verified', true),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_approved', true),
        supabase.from('internships').select('*', { count: 'exact', head: true }).eq('is_approved', true),
        supabase.from('events').select('*').order('event_date', { ascending: true }).gte('event_date', new Date().toISOString()).limit(3),
        supabase.from('mentorship_requests').select('*', { count: 'exact', head: true }),
        supabase.from('success_stories').select('*, alumni:profiles!alumni_id(*)').order('created_at', { ascending: false }).limit(3),
        supabase.from('forum_posts').select('*, author:profiles!author_id(*)').order('created_at', { ascending: false }).limit(3),
      ])
      if (!active) return
      setStats({
        alumni: alumni.count ?? 0, jobs: jobs.count ?? 0, internships: internships.count ?? 0,
        mentorship: mentorReq.count ?? 0, stories: stories.count ?? 0,
      })
      setEvents(eventsReq.data ?? [])
      setRecent([
        ...(stories.data ?? []).map((s) => ({ kind: 'story', ...s })),
        ...(posts.data ?? []).map((p) => ({ kind: 'post', ...p })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5))
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [user])

  if (loading) return <Loading label="Loading your dashboard…" />
  if (!user) return null

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 lg:p-8 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-brand-100 text-sm">{greeting},</p>
            <h1 className="text-2xl md:text-3xl font-bold font-display mt-0.5">{user.full_name}</h1>
            <p className="text-brand-100 mt-2 max-w-lg">
              {user.role === 'student' && "Explore mentors, apply to opportunities, and grow your career with AI guidance."}
              {user.role === 'alumni' && "Mentor students, post opportunities, and share your journey with the community."}
              {user.role === 'placement' && "Verify alumni, manage placements, and track student outcomes."}
              {user.role === 'admin' && "Oversee the platform, moderate content, and keep the community thriving."}
            </p>
          </div>
          <div className="flex gap-2">
            {user.role === 'student' && <Link to="/app/directory" className="btn bg-white text-brand-700 hover:bg-brand-50"><FiUsers /> Find a mentor</Link>}
            {user.role === 'alumni' && <Link to="/app/jobs" className="btn bg-white text-brand-700 hover:bg-brand-50"><FiBriefcase /> Post a job</Link>}
            {user.role === 'placement' && <Link to="/app/admin" className="btn bg-white text-brand-700 hover:bg-brand-50"><FiCheckCircle /> Verify alumni</Link>}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Verified alumni" value={stats.alumni ?? 0} icon={<FiUsers />} accent="brand" />
        <StatCard label="Open jobs" value={stats.jobs ?? 0} icon={<FiBriefcase />} accent="success" />
        <StatCard label="Internships" value={stats.internships ?? 0} icon={<FiTrendingUp />} accent="warning" />
        <StatCard label="Mentorship requests" value={stats.mentorship ?? 0} icon={<FiMessageSquare />} accent="brand" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Upcoming events</h2>
            <Link to="/app/events" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">View all <FiArrowRight /></Link>
          </div>
          {events.length === 0 ? (
            <EmptyState icon={<FiCalendar />} title="No upcoming events" description="Check back soon for new webinars and meetups." />
          ) : (
            <div className="space-y-3">
              {events.map((e) => (
                <Link key={e.id} to="/app/events" className="flex items-center gap-4 p-3 rounded-xl hover:bg-ink-50 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-medium leading-none">{new Date(e.event_date).toLocaleString('en-US', { month: 'short' })}</span>
                    <span className="text-lg font-bold leading-none mt-0.5">{new Date(e.event_date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink-900 group-hover:text-brand-700 truncate">{e.title}</p>
                    <p className="text-sm muted truncate">{e.event_type} · {e.location}</p>
                  </div>
                  <span className="badge-brand capitalize hidden sm:inline-flex">{e.event_type}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="section-title mb-4">Recent activity</h2>
          {recent.length === 0 ? (
            <EmptyState icon={<FiBookOpen />} title="Nothing yet" description="Stories and discussions will appear here." />
          ) : (
            <div className="space-y-3">
              {recent.map((item) => (
                <Link key={item.id} to={item.kind === 'story' ? '/app/stories' : `/app/forum/${item.id}`} className="flex gap-3 p-2 rounded-lg hover:bg-ink-50 transition-colors">
                  {item.kind === 'story' ? (
                    <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><FiAward /></div>
                  ) : (
                    <Avatar name={item.author?.full_name ?? '?'} size={36} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">{item.title}</p>
                    <p className="text-xs muted">{timeAgo(item.created_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="section-title mb-4">Quick actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions(user.role).map((a) => (
            <Link key={a.label} to={a.to} className="p-4 rounded-xl border border-ink-100 hover:border-brand-300 hover:bg-brand-50/40 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform">{a.icon}</div>
              <p className="font-medium text-ink-900 text-sm">{a.label}</p>
              <p className="text-xs muted mt-0.5">{a.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function quickActions(role: string) {
  if (role === 'student') return [
    { to: '/app/ai-assistant', label: 'AI Career Assistant', desc: 'Get guidance', icon: <FiMessageSquare /> },
    { to: '/app/jobs', label: 'Apply for jobs', desc: 'Referral roles', icon: <FiBriefcase /> },
    { to: '/app/resume-analyzer', label: 'Analyze resume', desc: 'ATS score', icon: <FiTrendingUp /> },
    { to: '/app/interview-practice', label: 'Practice interview', desc: 'AI feedback', icon: <FiCheckCircle /> },
  ]
  if (role === 'alumni') return [
    { to: '/app/jobs', label: 'Post a job', desc: 'Hire from network', icon: <FiBriefcase /> },
    { to: '/app/mentorship', label: 'Mentor requests', desc: 'Accept students', icon: <FiMessageSquare /> },
    { to: '/app/stories', label: 'Share your story', desc: 'Inspire others', icon: <FiAward /> },
    { to: '/app/internships', label: 'Post internship', desc: 'Find talent', icon: <FiTrendingUp /> },
  ]
  if (role === 'placement') return [
    { to: '/app/admin', label: 'Verify alumni', desc: 'Review requests', icon: <FiCheckCircle /> },
    { to: '/app/jobs', label: 'Approve jobs', desc: 'Moderate posts', icon: <FiBriefcase /> },
    { to: '/app/events', label: 'Schedule webinar', desc: 'Create event', icon: <FiCalendar /> },
    { to: '/app/forum', label: 'Post announcement', desc: 'Reach students', icon: <FiBookOpen /> },
  ]
  return [
    { to: '/app/directory', label: 'Browse alumni', desc: 'Search the directory', icon: <FiUsers /> },
    { to: '/app/events', label: 'Browse events', desc: 'Register for webinars', icon: <FiCalendar /> },
    { to: '/app/forum', label: 'Ask the community', desc: 'Post a question', icon: <FiBookOpen /> },
    { to: '/app/stories', label: 'Read stories', desc: 'Get inspired', icon: <FiAward /> },
  ]
}
