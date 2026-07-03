import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FiBriefcase, FiMapPin, FiPlus, FiSearch, FiBookmark, FiCheck, FiStar, FiClock, FiTrendingUp } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Loading, EmptyState, Modal, Avatar } from '../components/ui'
import { cn, timeAgo } from '../lib/utils'

type Job = {
  id: string; title: string; company: string; location: string; job_type: string;
  description: string; requirements: string; salary_range: string | null;
  referral_available: boolean | null; is_approved: boolean | null; created_at: string;
  posted_by: string; poster?: { full_name: string; avatar_url: string | null } | null
}

export default function Jobs() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [type, setType] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [applyTo, setApplyTo] = useState<Job | null>(null)
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [myApps, setMyApps] = useState<Set<string>>(new Set())

  const load = async () => {
    const [{ data }, { data: bks }, { data: apps }] = await Promise.all([
      supabase.from('jobs').select('*, poster:profiles!posted_by(full_name, avatar_url)').order('created_at', { ascending: false }),
      user ? supabase.from('bookmarks').select('job_id').eq('user_id', user.id) : Promise.resolve({ data: [] }),
      user ? supabase.from('applications').select('job_id').eq('applicant_id', user.id) : Promise.resolve({ data: [] }),
    ])
    setJobs((data as any) ?? [])
    setBookmarks(new Set((bks ?? []).map((b: any) => b.job_id).filter(Boolean)))
    setMyApps(new Set((apps ?? []).map((a: any) => a.job_id).filter(Boolean)))
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  const canPost = user?.role === 'alumni' || user?.role === 'placement' || user?.role === 'admin'

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (q) { const hay = `${j.title} ${j.company} ${j.location} ${j.job_type}`.toLowerCase(); if (!hay.includes(q.toLowerCase())) return false }
      if (type && j.job_type !== type) return false
      return true
    })
  }, [jobs, q, type])

  const toggleBookmark = async (jobId: string) => {
    if (!user) return
    if (bookmarks.has(jobId)) { await supabase.from('bookmarks').delete().eq('job_id', jobId).eq('user_id', user.id); setBookmarks((s) => { const n = new Set(s); n.delete(jobId); return n }) }
    else { await supabase.from('bookmarks').insert({ user_id: user.id, job_id: jobId }); setBookmarks((s) => new Set(s).add(jobId)) }
  }

  if (loading) return <Loading label="Loading jobs…" />

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-ink-900 font-display">Job Portal</h1><p className="muted mt-1">Referral-backed roles posted by alumni and placement officers.</p></div>
        {canPost && <button onClick={() => setShowForm(true)} className="btn-primary"><FiPlus /> Post a job</button>}
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jobs…" className="input pl-11" /></div>
        <select className="input sm:w-48" value={type} onChange={(e) => setType(e.target.value)}><option value="">All types</option><option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="contract">Contract</option><option value="internship">Internship</option></select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<FiBriefcase />} title="No jobs found" description="Try adjusting your search or check back later." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((j, i) => (
            <motion.div key={j.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }} className="card p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0"><h3 className="font-semibold text-ink-900 text-lg">{j.title}</h3><p className="text-ink-700 font-medium">{j.company}</p></div>
                {j.referral_available && <span className="badge-success"><FiStar /> Referral</span>}
              </div>
              <div className="flex flex-wrap gap-3 mt-3 text-sm muted">
                <span className="flex items-center gap-1.5"><FiMapPin /> {j.location}</span>
                <span className="flex items-center gap-1.5"><FiClock /> {j.job_type}</span>
                <span className="flex items-center gap-1.5"><FiTrendingUp /> {timeAgo(j.created_at)}</span>
              </div>
              <p className="text-sm text-ink-700 mt-3 line-clamp-2">{j.description}</p>
              {j.salary_range && <p className="text-sm font-medium text-ink-900 mt-2">{j.salary_range}</p>}
              {j.poster && <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ink-100"><Avatar name={j.poster.full_name} src={j.poster.avatar_url} size={24} /><span className="text-xs muted">Posted by {j.poster.full_name}</span></div>}
              <div className="flex items-center gap-2 mt-4 pt-1">
                {user?.role === 'student' && <button onClick={() => setApplyTo(j)} disabled={myApps.has(j.id)} className={cn('btn-primary btn-sm flex-1', myApps.has(j.id) && 'opacity-60 cursor-default')}>{myApps.has(j.id) ? <><FiCheck /> Applied</> : 'Apply now'}</button>}
                {user?.role === 'student' && <button onClick={() => toggleBookmark(j.id)} className={cn('btn-secondary btn-sm', bookmarks.has(j.id) && 'border-brand-500 text-brand-700 bg-brand-50')}><FiBookmark /></button>}
                {j.posted_by === user?.id && !j.is_approved && <span className="badge-warning ml-auto">Pending approval</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <JobFormModal open={showForm} onClose={() => setShowForm(false)} onDone={load} />
      <ApplyModal job={applyTo} onClose={() => setApplyTo(null)} onDone={load} />
    </div>
  )
}

function JobFormModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ title: '', company: '', location: 'Remote', job_type: 'full-time', description: '', requirements: '', salary_range: '', referral_available: false })
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!user || !form.title || !form.company || !form.description) return
    setBusy(true)
    await supabase.from('jobs').insert({ posted_by: user.id, ...form, requirements: form.requirements || 'See description', salary_range: form.salary_range || null })
    setBusy(false); setForm({ title: '', company: '', location: 'Remote', job_type: 'full-time', description: '', requirements: '', salary_range: '', referral_available: false })
    onClose(); onDone()
  }

  return (
    <Modal open={open} onClose={onClose} title="Post a job" size="lg">
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="label">Job title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Senior Software Engineer" /></div>
          <div><label className="label">Company</label><input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Corp" /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="label">Location</label><input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div><label className="label">Job type</label><select className="input" value={form.job_type} onChange={(e) => setForm({ ...form, job_type: e.target.value })}><option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="contract">Contract</option><option value="internship">Internship</option></select></div>
        </div>
        <div><label className="label">Salary range (optional)</label><input className="input" value={form.salary_range} onChange={(e) => setForm({ ...form, salary_range: e.target.value })} placeholder="₹12-18 LPA" /></div>
        <div><label className="label">Description</label><textarea rows={4} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div><label className="label">Requirements (optional)</label><textarea rows={3} className="input" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} /></div>
        <label className="flex items-center gap-2 text-sm text-ink-700"><input type="checkbox" checked={form.referral_available} onChange={(e) => setForm({ ...form, referral_available: e.target.checked })} className="rounded" /> I can offer a referral for this role</label>
        <div className="flex justify-end gap-2 pt-2"><button onClick={onClose} className="btn-secondary">Cancel</button><button onClick={submit} disabled={busy} className="btn-primary">{busy ? 'Posting…' : 'Post job'}</button></div>
      </div>
    </Modal>
  )
}

function ApplyModal({ job, onClose, onDone }: { job: Job | null; onClose: () => void; onDone: () => void }) {
  const { user } = useAuth()
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!user || !job) return
    setBusy(true)
    await supabase.from('applications').insert({ applicant_id: user.id, job_id: job.id, cover_note: note })
    await supabase.from('notifications').insert({ user_id: job.posted_by, type: 'application', title: 'New job application', body: `${user.full_name} applied for ${job.title}.`, link: '/app/jobs' })
    setBusy(false); setNote(''); onClose(); onDone()
  }

  return (
    <Modal open={!!job} onClose={onClose} title={`Apply: ${job?.title ?? ''}`}>
      <div className="space-y-4">
        <p className="text-sm muted">Add a short note to the poster (optional).</p>
        <textarea rows={4} className="input" placeholder="Why you're a great fit…" value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="flex justify-end gap-2"><button onClick={onClose} className="btn-secondary">Cancel</button><button onClick={submit} disabled={busy} className="btn-primary">{busy ? 'Submitting…' : 'Submit application'}</button></div>
      </div>
    </Modal>
  )
}
