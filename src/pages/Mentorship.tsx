import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMessageSquare, FiCheck, FiX, FiCalendar, FiStar } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Avatar, Loading, EmptyState, Modal, SectionHeader } from '../components/ui'
import { timeAgo, formatDateTime, cn } from '../lib/utils'

type Req = {
  id: string; status: string; message: string; created_at: string;
  student: { id: string; full_name: string; avatar_url: string | null; department: string | null } | null
  alumni: { id: string; full_name: string; avatar_url: string | null } | null
  mentor_sessions: { id: string; scheduled_at: string; status: string; topic: string; rating: number | null; feedback: string | null }[]
}

export default function Mentorship() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<Req[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'incoming' | 'outgoing'>(user?.role === 'alumni' ? 'incoming' : 'outgoing')
  const [scheduleFor, setScheduleFor] = useState<Req | null>(null)
  const [feedbackFor, setFeedbackFor] = useState<Req | null>(null)

  const load = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('mentorship_requests')
      .select('*, student:profiles!student_id(id, full_name, avatar_url, department), alumni:profiles!alumni_id(id, full_name, avatar_url), mentor_sessions(*)')
      .order('created_at', { ascending: false })
    if (error) { console.error(error); setLoading(false); return }
    setRequests((data as any) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  const updateStatus = async (id: string, status: 'accepted' | 'rejected') => {
    await supabase.from('mentorship_requests').update({ status }).eq('id', id)
    const req = requests.find((r) => r.id === id)
    if (req && status === 'accepted') {
      await supabase.from('notifications').insert({ user_id: req.student?.id, type: 'mentorship', title: 'Mentorship accepted', body: `${req.alumni?.full_name} accepted your mentorship request.`, link: '/app/mentorship' })
    }
    load()
  }

  if (loading) return <Loading label="Loading mentorship…" />

  const incoming = requests.filter((r) => r.alumni?.id === user?.id)
  const outgoing = requests.filter((r) => r.student?.id === user?.id)
  const list = tab === 'incoming' ? incoming : outgoing

  return (
    <div className="space-y-5">
      <SectionHeader title="Mentorship" subtitle="Connect with mentors, schedule sessions, and track your growth." />

      {user?.role === 'alumni' && (
        <div className="flex gap-1 p-1 bg-ink-100 rounded-lg w-fit">
          {(['incoming', 'outgoing'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn('px-4 py-1.5 rounded-md text-sm font-medium transition-colors', tab === t ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-600 hover:text-ink-900')}>
              {t === 'incoming' ? `Requests (${incoming.length})` : `My mentors (${outgoing.length})`}
            </button>
          ))}
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState icon={<FiMessageSquare />} title={tab === 'incoming' ? 'No mentorship requests yet' : "You haven't requested any mentors"} description={tab === 'incoming' ? 'When students reach out, they\'ll appear here.' : 'Browse the alumni directory to find a mentor.'} action={tab === 'outgoing' ? <Link to="/app/directory" className="btn-primary">Find a mentor</Link> : undefined} />
      ) : (
        <div className="space-y-3">
          {list.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }} className="card p-5">
              <div className="flex items-start gap-4">
                <Avatar name={tab === 'incoming' ? (r.student?.full_name ?? '?') : (r.alumni?.full_name ?? '?')} src={tab === 'incoming' ? r.student?.avatar_url : r.alumni?.avatar_url} size={48} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/app/alumni/${tab === 'incoming' ? r.student?.id : r.alumni?.id}`} className="font-semibold text-ink-900 hover:text-brand-700">{tab === 'incoming' ? r.student?.full_name : r.alumni?.full_name}</Link>
                    <StatusBadge status={r.status} />
                    <span className="text-xs muted">{timeAgo(r.created_at)}</span>
                  </div>
                  {r.student?.department && <p className="text-sm muted">{r.student.department}</p>}
                  {r.message && <p className="text-sm text-ink-700 mt-2 bg-ink-50 rounded-lg p-3">{r.message}</p>}

                  {r.mentor_sessions && r.mentor_sessions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {r.mentor_sessions.map((s) => (
                        <div key={s.id} className="flex items-center gap-3 text-sm bg-brand-50/50 rounded-lg p-2.5">
                          <FiCalendar className="text-brand-600" />
                          <div className="flex-1"><p className="font-medium text-ink-900">{s.topic || 'Mentoring session'}</p><p className="text-xs muted">{formatDateTime(s.scheduled_at)} · {s.status}</p></div>
                          {s.rating && <div className="flex items-center gap-1 text-amber-500"><FiStar /> {s.rating}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {tab === 'incoming' && r.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => updateStatus(r.id, 'accepted')} className="btn-primary btn-sm"><FiCheck /> Accept</button>
                      <button onClick={() => updateStatus(r.id, 'rejected')} className="btn-secondary btn-sm"><FiX /> Decline</button>
                    </div>
                  )}
                  {tab === 'incoming' && r.status === 'accepted' && <button onClick={() => setScheduleFor(r)} className="btn-secondary btn-sm mt-3"><FiCalendar /> Schedule session</button>}
                  {tab === 'outgoing' && r.status === 'accepted' && r.mentor_sessions?.some((s) => s.status === 'completed' && !s.feedback) && <button onClick={() => setFeedbackFor(r)} className="btn-secondary btn-sm mt-3"><FiStar /> Leave feedback</button>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ScheduleModal req={scheduleFor} onClose={() => setScheduleFor(null)} onDone={load} />
      <FeedbackModal req={feedbackFor} onClose={() => setFeedbackFor(null)} onDone={load} />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { pending: 'badge-warning', accepted: 'badge-success', rejected: 'badge-error', completed: 'badge-brand' }
  return <span className={cn(map[status] ?? 'badge-neutral', 'capitalize')}>{status}</span>
}

function ScheduleModal({ req, onClose, onDone }: { req: Req | null; onClose: () => void; onDone: () => void }) {
  const [when, setWhen] = useState('')
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState(45)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!req || !when) return
    setBusy(true)
    await supabase.from('mentor_sessions').insert({ request_id: req.id, scheduled_at: when, duration_minutes: duration, topic, status: 'scheduled' })
    await supabase.from('notifications').insert({ user_id: req.student?.id, type: 'session', title: 'Session scheduled', body: `Your mentor scheduled a session: ${topic || 'Mentoring'} on ${formatDateTime(when)}.`, link: '/app/mentorship' })
    setBusy(false); onClose(); onDone()
  }

  return (
    <Modal open={!!req} onClose={onClose} title="Schedule mentoring session">
      <div className="space-y-4">
        <div><label className="label">Topic</label><input className="input" placeholder="e.g. Career transition to product management" value={topic} onChange={(e) => setTopic(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Date & time</label><input type="datetime-local" className="input" value={when} onChange={(e) => setWhen(e.target.value)} /></div>
          <div><label className="label">Duration (min)</label><select className="input" value={duration} onChange={(e) => setDuration(Number(e.target.value))}><option value={30}>30</option><option value={45}>45</option><option value={60}>60</option></select></div>
        </div>
        <div className="flex justify-end gap-2"><button onClick={onClose} className="btn-secondary">Cancel</button><button onClick={submit} disabled={busy || !when} className="btn-primary">{busy ? 'Scheduling…' : 'Schedule'}</button></div>
      </div>
    </Modal>
  )
}

function FeedbackModal({ req, onClose, onDone }: { req: Req | null; onClose: () => void; onDone: () => void }) {
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!req) return
    setBusy(true)
    const session = req.mentor_sessions?.find((s) => s.status === 'completed' && !s.feedback)
    if (session) await supabase.from('mentor_sessions').update({ rating, feedback }).eq('id', session.id)
    setBusy(false); onClose(); onDone()
  }

  return (
    <Modal open={!!req} onClose={onClose} title="Rate your mentoring session">
      <div className="space-y-4">
        <div><label className="label">Rating</label><div className="flex gap-2">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setRating(n)} className={cn('p-2 rounded-lg border-2 transition-colors', n <= rating ? 'border-amber-400 text-amber-500' : 'border-ink-200 text-ink-300')}><FiStar /></button>)}</div></div>
        <div><label className="label">Feedback</label><textarea rows={4} className="input" placeholder="Share your experience…" value={feedback} onChange={(e) => setFeedback(e.target.value)} /></div>
        <div className="flex justify-end gap-2"><button onClick={onClose} className="btn-secondary">Cancel</button><button onClick={submit} disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Submit'}</button></div>
      </div>
    </Modal>
  )
}
