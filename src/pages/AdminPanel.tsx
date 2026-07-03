import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FiShield, FiCheckCircle, FiXCircle, FiUsers, FiBriefcase, FiAward, FiBookOpen, FiCalendar } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Loading, StatCard, Avatar, EmptyState } from '../components/ui'
import { cn, timeAgo, roleLabel, roleBadgeClass } from '../lib/utils'

type Job = { id: string; title: string; is_approved: boolean | null; posted_by: string | null; created_at: string; poster: { full_name: string } | null }
type Internship = { id: string; title: string; is_approved: boolean | null; posted_by: string | null; created_at: string; poster: { full_name: string } | null }
type Profile = { id: string; full_name: string; email: string; role: string; is_verified: boolean | null; department: string | null; graduation_year: number | null; created_at: string }

type Tab = 'overview' | 'jobs' | 'internships' | 'users'

export default function AdminPanel() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<Job[]>([])
  const [internships, setInternships] = useState<Internship[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [stats, setStats] = useState({ users: 0, jobs: 0, internships: 0, pendingJobs: 0 })

  const load = useCallback(async () => {
    const [jobsRes, internRes, profRes] = await Promise.all([
      supabase.from('jobs').select('*, poster:profiles!posted_by(full_name)').order('created_at', { ascending: false }),
      supabase.from('internships').select('*, poster:profiles!posted_by(full_name)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    ])
    setJobs((jobsRes.data as any) ?? [])
    setInternships((internRes.data as any) ?? [])
    setProfiles((profRes.data as any) ?? [])
    setStats({
      users: profRes.data?.length ?? 0,
      jobs: jobsRes.data?.length ?? 0,
      internships: internRes.data?.length ?? 0,
      pendingJobs: [...(jobsRes.data ?? []), ...(internRes.data ?? [])].filter((j: any) => !j.is_approved).length,
    })
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (!user || (user.role !== 'admin' && user.role !== 'placement')) {
    return <EmptyState icon={<FiShield />} title="Access denied" description="Only administrators and placement officers can access this panel." />
  }
  if (loading) return <Loading label="Loading admin panel…" />

  const approve = async (table: 'jobs' | 'internships', id: string, value: boolean) => {
    await supabase.from(table).update({ is_approved: value }).eq('id', id)
    load()
  }

  const toggleVerify = async (id: string, value: boolean) => {
    await supabase.from('profiles').update({ is_verified: value }).eq('id', id)
    load()
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'overview', label: 'Overview', icon: <FiShield /> },
    { key: 'jobs', label: 'Jobs', icon: <FiBriefcase />, count: jobs.filter((j) => !j.is_approved).length },
    { key: 'internships', label: 'Internships', icon: <FiBriefcase />, count: internships.filter((i) => !i.is_approved).length },
    { key: 'users', label: 'Users', icon: <FiUsers />, count: profiles.length },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 font-display flex items-center gap-2"><FiShield /> Admin Panel</h1>
        <p className="muted mt-1">Manage users, approve job postings, and monitor platform activity.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn('badge flex items-center gap-1.5', tab === t.key ? 'badge-brand' : 'badge-neutral hover:bg-ink-200')}>
            {t.icon} {t.label}
            {t.count !== undefined && t.count > 0 && <span className="ml-1 px-1.5 rounded-full bg-error-500 text-white text-[10px] font-bold">{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total users" value={stats.users} icon={<FiUsers />} accent="brand" />
          <StatCard label="Jobs posted" value={stats.jobs} icon={<FiBriefcase />} accent="success" />
          <StatCard label="Internships" value={stats.internships} icon={<FiBriefcase />} accent="warning" />
          <StatCard label="Pending approvals" value={stats.pendingJobs} icon={<FiAward />} accent="accent" />
        </motion.div>
      )}

      {tab === 'jobs' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {jobs.length === 0 ? <EmptyState icon={<FiBriefcase />} title="No jobs posted" /> : (
            jobs.map((j) => (
              <div key={j.id} className="card p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-semibold text-ink-900 truncate">{j.title}</h3>
                  <p className="text-xs muted mt-0.5">Posted by {j.poster?.full_name ?? 'Unknown'} · {timeAgo(j.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {j.is_approved ? (
                    <span className="badge-success flex items-center gap-1"><FiCheckCircle /> Approved</span>
                  ) : (
                    <span className="badge-warning">Pending</span>
                  )}
                  <button onClick={() => approve('jobs', j.id, !j.is_approved)} className={cn('btn-sm', j.is_approved ? 'btn-secondary' : 'btn-primary')}>
                    {j.is_approved ? <><FiXCircle /> Unapprove</> : <><FiCheckCircle /> Approve</>}
                  </button>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {tab === 'internships' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {internships.length === 0 ? <EmptyState icon={<FiBriefcase />} title="No internships posted" /> : (
            internships.map((i) => (
              <div key={i.id} className="card p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-semibold text-ink-900 truncate">{i.title}</h3>
                  <p className="text-xs muted mt-0.5">Posted by {i.poster?.full_name ?? 'Unknown'} · {timeAgo(i.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {i.is_approved ? (
                    <span className="badge-success flex items-center gap-1"><FiCheckCircle /> Approved</span>
                  ) : (
                    <span className="badge-warning">Pending</span>
                  )}
                  <button onClick={() => approve('internships', i.id, !i.is_approved)} className={cn('btn-sm', i.is_approved ? 'btn-secondary' : 'btn-primary')}>
                    {i.is_approved ? <><FiXCircle /> Unapprove</> : <><FiCheckCircle /> Approve</>}
                  </button>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {tab === 'users' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {profiles.map((p) => (
            <div key={p.id} className="card p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={p.full_name} size={40} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-ink-900 truncate">{p.full_name}</h3>
                    <span className={cn(roleBadgeClass(p.role))}>{roleLabel(p.role)}</span>
                    {p.is_verified && <FiCheckCircle className="text-emerald-500 shrink-0" />}
                  </div>
                  <p className="text-xs muted truncate">{p.email}{p.department && ` · ${p.department}`}{p.graduation_year && ` · ${p.graduation_year}`}</p>
                </div>
              </div>
              <button onClick={() => toggleVerify(p.id, !p.is_verified)} className={cn('btn-sm', p.is_verified ? 'btn-secondary' : 'btn-primary')}>
                {p.is_verified ? <><FiXCircle /> Unverify</> : <><FiCheckCircle /> Verify</>}
              </button>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
