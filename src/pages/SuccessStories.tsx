import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiAward, FiPlus, FiTrendingUp, FiBriefcase, FiBookOpen, FiStar } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Loading, EmptyState, Modal, Avatar } from '../components/ui'
import { timeAgo, cn } from '../lib/utils'

type Story = { id: string; title: string; story_type: string; content: string; image_url: string | null; created_at: string; alumni_id: string; alumni?: { full_name: string; avatar_url: string | null; graduation_year: number | null } | null }

const typeIcon: Record<string, React.ReactNode> = { achievement: <FiAward />, career: <FiTrendingUp />, startup: <FiBriefcase />, studies: <FiBookOpen />, testimonial: <FiStar /> }

export default function SuccessStories() {
  const { user } = useAuth()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('')

  const load = async () => {
    const { data } = await supabase.from('success_stories').select('*, alumni:profiles!alumni_id(full_name, avatar_url, graduation_year)').order('created_at', { ascending: false })
    setStories((data as any) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const canPost = user?.role === 'alumni' || user?.role === 'admin'
  const filtered = filter ? stories.filter((s) => s.story_type === filter) : stories

  if (loading) return <Loading label="Loading stories…" />

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-ink-900 font-display">Success Stories</h1><p className="muted mt-1">Alumni achievements, career journeys, and startup stories.</p></div>
        {canPost && <button onClick={() => setShowForm(true)} className="btn-primary"><FiPlus /> Share your story</button>}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'achievement', 'career', 'startup', 'studies', 'testimonial'].map((t) => (
          <button key={t} onClick={() => setFilter(t)} className={cn('badge capitalize', filter === t ? 'badge-brand' : 'badge-neutral hover:bg-ink-200')}>{t || 'All stories'}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<FiAward />} title="No stories yet" description="Be the first to share your journey." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }} className="card p-6">
              <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">{typeIcon[s.story_type] ?? <FiAward />}</div><span className="badge-warning capitalize">{s.story_type}</span></div>
              <h3 className="font-semibold text-ink-900 text-lg">{s.title}</h3>
              <p className="text-sm text-ink-700 mt-2 line-clamp-4 leading-relaxed">{s.content}</p>
              {s.alumni && (
                <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-ink-100">
                  <Avatar name={s.alumni.full_name} src={s.alumni.avatar_url} size={32} />
                  <div><p className="text-sm font-medium text-ink-900">{s.alumni.full_name}</p>{s.alumni.graduation_year && <p className="text-xs muted">Class of {s.alumni.graduation_year} · {timeAgo(s.created_at)}</p>}</div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <StoryFormModal open={showForm} onClose={() => setShowForm(false)} onDone={load} />
    </div>
  )
}

function StoryFormModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ title: '', story_type: 'achievement', content: '', image_url: '' })
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!user || !form.title || !form.content) return
    setBusy(true)
    await supabase.from('success_stories').insert({ alumni_id: user.id, title: form.title, story_type: form.story_type, content: form.content, image_url: form.image_url || null })
    setBusy(false); setForm({ title: '', story_type: 'achievement', content: '', image_url: '' })
    onClose(); onDone()
  }

  return (
    <Modal open={open} onClose={onClose} title="Share your story" size="lg">
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="From campus to founding a startup" /></div>
          <div><label className="label">Story type</label><select className="input" value={form.story_type} onChange={(e) => setForm({ ...form, story_type: e.target.value })}><option value="achievement">Achievement</option><option value="career">Career Journey</option><option value="startup">Startup Story</option><option value="studies">Higher Studies</option><option value="testimonial">Testimonial</option></select></div>
        </div>
        <div><label className="label">Your story</label><textarea rows={6} className="input" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Share your journey, challenges, and wins…" /></div>
        <div><label className="label">Image URL (optional)</label><input className="input" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" /></div>
        <div className="flex justify-end gap-2 pt-2"><button onClick={onClose} className="btn-secondary">Cancel</button><button onClick={submit} disabled={busy} className="btn-primary">{busy ? 'Publishing…' : 'Publish story'}</button></div>
      </div>
    </Modal>
  )
}
