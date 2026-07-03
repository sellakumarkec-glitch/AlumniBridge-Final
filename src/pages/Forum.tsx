import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiBookOpen, FiPlus, FiSearch, FiMessageSquare, FiArrowRight } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Loading, EmptyState, Modal, Avatar } from '../components/ui'
import { timeAgo, cn } from '../lib/utils'

type Post = { id: string; title: string; content: string; category: string; created_at: string; author: { full_name: string; avatar_url: string | null } | null; forum_comments: { id: string }[] }

const categories = [
  { value: 'career', label: 'Career Advice' },
  { value: 'technical', label: 'Technical Discussions' },
  { value: 'placement', label: 'Placement Tips' },
  { value: 'general', label: 'General' },
]

export default function Forum() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('forum_posts').select('*, author:profiles!author_id(full_name, avatar_url), forum_comments(id)').order('created_at', { ascending: false })
    setPosts((data as any) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (cat && p.category !== cat) return false
      if (q && !(`${p.title} ${p.content}`.toLowerCase().includes(q.toLowerCase()))) return false
      return true
    })
  }, [posts, q, cat])

  if (loading) return <Loading label="Loading forum…" />

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-ink-900 font-display">Community Forum</h1><p className="muted mt-1">Ask questions, share advice, and discuss with the community.</p></div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><FiPlus /> New post</button>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search discussions…" className="input pl-11" /></div>
        <select className="input sm:w-48" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>{categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setCat('')} className={cn('badge', !cat ? 'badge-brand' : 'badge-neutral hover:bg-ink-200')}>All</button>
        {categories.map((c) => <button key={c.value} onClick={() => setCat(c.value)} className={cn('badge', cat === c.value ? 'badge-brand' : 'badge-neutral hover:bg-ink-200')}>{c.label}</button>)}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<FiBookOpen />} title="No discussions yet" description="Start the conversation by creating a post." action={<button onClick={() => setShowForm(true)} className="btn-primary">New post</button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}>
              <Link to={`/app/forum/${p.id}`} className="card p-5 hover:shadow-card hover:-translate-y-0.5 transition-all block">
                <div className="flex items-start gap-3">
                  <Avatar name={p.author?.full_name ?? '?'} src={p.author?.avatar_url} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap"><span className="badge-brand capitalize">{p.category}</span><span className="text-xs muted">{p.author?.full_name} · {timeAgo(p.created_at)}</span></div>
                    <h3 className="font-semibold text-ink-900 mt-1.5">{p.title}</h3>
                    <p className="text-sm text-ink-700 mt-1 line-clamp-2">{p.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm muted">
                      <span className="flex items-center gap-1.5"><FiMessageSquare /> {p.forum_comments?.length ?? 0} comments</span>
                      <span className="flex items-center gap-1.5 text-brand-600">Read more <FiArrowRight /></span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <PostFormModal open={showForm} onClose={() => setShowForm(false)} onDone={load} />
    </div>
  )
}

function PostFormModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ title: '', content: '', category: 'career' })
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!user || !form.title || !form.content) return
    setBusy(true)
    await supabase.from('forum_posts').insert({ author_id: user.id, ...form })
    setBusy(false); setForm({ title: '', content: '', category: 'career' })
    onClose(); onDone()
  }

  return (
    <Modal open={open} onClose={onClose} title="New discussion post" size="lg">
      <div className="space-y-4">
        <div><label className="label">Category</label><select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
        <div><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="How do I transition from QA to SDE?" /></div>
        <div><label className="label">Content</label><textarea rows={6} className="input" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
        <div className="flex justify-end gap-2 pt-2"><button onClick={onClose} className="btn-secondary">Cancel</button><button onClick={submit} disabled={busy} className="btn-primary">{busy ? 'Posting…' : 'Post'}</button></div>
      </div>
    </Modal>
  )
}
