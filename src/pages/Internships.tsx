import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FiBriefcase, FiMapPin, FiPlus, FiSearch, FiBookmark, FiCheck, FiClock, FiTrendingUp } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Loading, EmptyState, Modal, Avatar } from '../components/ui'
import { cn, timeAgo } from '../lib/utils'

type Internship = {
  id: string; title: string; company: string; location: string; duration: string;
  stipend: string | null; description: string; eligibility: string;
  is_approved: boolean | null; created_at: string; posted_by: string;
  poster?: { full_name: string; avatar_url: string | null } | null
}

export default function Internships() {
  const { user } = useAuth()
  const [items, setItems] = useState<Internship[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [applyTo, setApplyTo] = useState<Internship | null>(null)
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [myApps, setMyApps] = useState<Set<string>>(new Set())

  const load = async () => {
    const [{ data }, { data: bks }, { data: apps }] = await Promise.all([
      supabase.from('internships').select('*, poster:profiles!posted_by(full_name, avatar_url)').order('created_at', { ascending: false }),
      user ? supabase.from('bookmarks').select('internship_id').eq('user_id', user.id) : Promise.resolve({ data: [] }),
      user ? supabase.from('applications').select('internship_id').eq('applicant_id', user.id) : Promise.resolve({ data: [] }),
    ])
    setItems((data as any) ?? [])
    setBookmarks(new Set((bks ?? []).map((b: any) => b.internship_id).filter(Boolean)))
    setMyApps(new Set((apps ?? []).map((a: any) => a.internship_id).filter(Boolean)))
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  const canPost = user?.role === 'alumni' || user?.role === 'placement' || user?.role === 'admin'

  const filtered = useMemo(() => {
    if (!q) return items
    return items.filter((j) => `${j.title} ${j.company} ${j.location}`.toLowerCase().includes(q.toLowerCase()))
  }, [items, q])

  const toggleBookmark = async (id: string) => {
    if (!user) return
    if (bookmarks.has(id)) { await supabase.from('bookmarks').delete().eq('internship_id', id).eq('user_id', user.id); setBookmarks((s) => { const n = new Set(s); n.delete(id); return n }) }
    else { await supabase.from('bookmarks').insert({ user_id: user.id, internship_id: id }); setBookmarks((s) => new Set(s).add(id)) }
  }

  if (loading) return <Loading label="Loading internships…" />

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-ink-900 font-display">Internship Portal</h1><p className="muted mt-1">Hands-on opportunities from alumni and partner companies.</p></div>
        {canPost && <button onClick={() => setShowForm(true)} className="btn-primary"><FiPlus /> Post an internship</button>}
      </div>

      <div className="card p-4"><div className="relative"><FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search internships…" className="input pl-11" /></div></div>

      {filtered.length === 0 ? (
        <EmptyState icon={<FiBriefcase />} title="No internships found" description="Try adjusting your search or check back later." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((j, i) => (
            <motion.div key={j.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }} className="card p-5 flex flex-col">
              <h3 className="font-semibold text-ink-900 text-lg">{j.title}</h3>
              <p className="text-ink-700 font-medium">{j.company}</p>
              <div className="flex flex-wrap gap-3 mt-3 text-sm muted">
                <span className="flex items-center gap-1.5"><FiMapPin /> {j.location}</span>
                <span className="flex items-center gap-1.5"><FiClock /> {j.duration}</span>
                <span className="flex items-center gap-1.5"><FiTrendingUp /> {timeAgo(j.created_at)}</span>
              </div>
              <p className="text-sm text-ink-700 mt-3 line-clamp-2">{j.description}</p>
              {j.stipend && <p className="text-sm font-medium text-ink-900 mt-2">Stipend: {j.stipend}</p>}
              {j.eligibility && <p className="text-xs muted mt-2">Eligibility: {j.eligibility}</p>}
              {j.poster && <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ink-100"><Avatar name={j.poster.full_name} src={j.poster.avatar_url} size={24} /><span className="text-xs muted">Posted by {j.poster.full_name}</span></div>}
              <div className="flex items-center gap-2 mt-4">
                {user?.role === 'student' && <button onClick={() => setApplyTo(j)} disabled={myApps.has(j.id)} className={cn('btn-primary btn-sm flex-1', myApps.has(j.id) && 'opacity-60 cursor-default')}>{myApps.has(j.id) ? <><FiCheck /> Applied</> : 'Apply now'}</button>}
                {user?.role === 'student' && <button onClick={() => toggleBookmark(j.id)} className={cn('btn-secondary btn-sm', bookmarks.has(j.id) && 'border-brand-500 text-brand-700 bg-brand-50')}><FiBookmark /></button>}
                {j.posted_by === user?.id && !j.is_approved && <span className="badge-warning ml-auto">Pending approval</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <InternshipFormModal open={showForm} onClose={() => setShowForm(false)} onDone={load} />
      <ApplyModal item={applyTo} onClose={() => setApplyTo(null)} onDone={load} />
    </div>
  )
}

function InternshipFormModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ title: '', company: '', location: 'Remote', duration: '3 months', stipend: '', description: '', eligibility: '' })
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!user || !form.title || !form.company || !form.description) return
    setBusy(true)
    await supabase.from('internships').insert({ posted_by: user.id, ...form, stipend: form.stipend || null, eligibility: form.eligibility || 'Open to all students' })
    setBusy(false); setForm({ title: '', company: '', location: 'Remote', duration: '3 months', stipend: '', description: '', eligibility: '' })
    onClose(); onDone()
  }

  return (
    <Modal open={open} onClose={onClose} title="Post an internship" size="lg">
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Frontend Intern" /></div>
          <div><label className="label">Company</label><input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div><label className="label">Location</label><input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div><label className="label">Duration</label><input className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
          <div><label className="label">Stipend</label><input className="input" value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} placeholder="₹15,000/mo" /></div>
        </div>
        <div><label className="label">Description</label><textarea rows={4} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div><label className="label">Eligibility</label><input className="input" value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} placeholder="3rd/4th year CS students" /></div>
        <div className="flex justify-end gap-2 pt-2"><button onClick={onClose} className="btn-secondary">Cancel</button><button onClick={submit} disabled={busy} className="btn-primary">{busy ? 'Posting…' : 'Post internship'}</button></div>
      </div>
    </Modal>
  )
}

function ApplyModal({ item, onClose, onDone }: { item: Internship | null; onClose: () => void; onDone: () => void }) {
  const { user } = useAuth()
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!user || !item) return
    setBusy(true)
    await supabase.from('applications').insert({ applicant_id: user.id, internship_id: item.id, cover_note: note })
    await supabase.from('notifications').insert({ user_id: item.posted_by, type: 'application', title: 'New internship application', body: `${user.full_name} applied for ${item.title}.`, link: '/app/internships' })
    setBusy(false); setNote(''); onClose(); onDone()
  }

  return (
    <Modal open={!!item} onClose={onClose} title={`Apply: ${item?.title ?? ''}`}>
      <div className="space-y-4">
        <p className="text-sm muted">Add a short note to the poster (optional).</p>
        <textarea rows={4} className="input" placeholder="Why you're a great fit…" value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="flex justify-end gap-2"><button onClick={onClose} className="btn-secondary">Cancel</button><button onClick={submit} disabled={busy} className="btn-primary">{busy ? 'Submitting…' : 'Submit application'}</button></div>
      </div>
    </Modal>
  )
}
