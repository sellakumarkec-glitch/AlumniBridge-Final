import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiCalendar, FiMapPin, FiPlus, FiUsers, FiCheck, FiClock } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Loading, EmptyState, Modal } from '../components/ui'
import { cn, formatDateTime } from '../lib/utils'

type EventItem = { id: string; title: string; description: string; event_type: string; event_date: string; location: string; organizer_id: string; capacity: number | null; created_at: string; event_registrations: { id: string }[] }

export default function Events() {
  const { user } = useAuth()
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [registered, setRegistered] = useState<Set<string>>(new Set())

  const load = async () => {
    const { data, error } = await supabase.from('events').select('*, event_registrations(id)').order('event_date', { ascending: true })
    if (error) { console.error(error); setLoading(false); return }
    setEvents((data as any) ?? [])
    if (user) {
      const mine = ((data as any) ?? []).filter((e: EventItem) => e.event_registrations?.some((r) => r.id)).map((e: EventItem) => e.id)
      setRegistered(new Set(mine))
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  const canCreate = user?.role === 'alumni' || user?.role === 'placement' || user?.role === 'admin'

  const register = async (eventId: string) => { if (!user) return; await supabase.from('event_registrations').insert({ event_id: eventId, user_id: user.id }); setRegistered((s) => new Set(s).add(eventId)); load() }
  const unregister = async (eventId: string) => { if (!user) return; await supabase.from('event_registrations').delete().eq('event_id', eventId).eq('user_id', user.id); setRegistered((s) => { const n = new Set(s); n.delete(eventId); return n }); load() }

  const upcoming = events.filter((e) => new Date(e.event_date) >= new Date())
  const past = events.filter((e) => new Date(e.event_date) < new Date())

  if (loading) return <Loading label="Loading events…" />

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-ink-900 font-display">Events & Webinars</h1><p className="muted mt-1">Alumni meets, technical sessions, workshops, and webinars.</p></div>
        {canCreate && <button onClick={() => setShowForm(true)} className="btn-primary"><FiPlus /> Create event</button>}
      </div>

      {upcoming.length === 0 ? (
        <EmptyState icon={<FiCalendar />} title="No upcoming events" description="Check back soon for new events." />
      ) : (
        <div className="space-y-3">
          <h2 className="section-title">Upcoming</h2>
          {upcoming.map((e, i) => <EventCard key={e.id} event={e} registered={registered.has(e.id)} onRegister={register} onUnregister={unregister} index={i} />)}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-3">
          <h2 className="section-title">Past events</h2>
          {past.map((e, i) => <EventCard key={e.id} event={e} registered={registered.has(e.id)} onRegister={register} onUnregister={unregister} index={i} past />)}
        </div>
      )}

      <EventFormModal open={showForm} onClose={() => setShowForm(false)} onDone={load} />
    </div>
  )
}

function EventCard({ event, registered, onRegister, onUnregister, index, past }: { event: EventItem; registered: boolean; onRegister: (id: string) => void; onUnregister: (id: string) => void; index: number; past?: boolean }) {
  const regCount = event.event_registrations?.length ?? 0
  const full = event.capacity != null && regCount >= event.capacity
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }} className={cn('card p-5', past && 'opacity-75')}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-14 h-16 rounded-xl bg-brand-50 text-brand-600 flex flex-col items-center justify-center shrink-0">
          <span className="text-xs font-medium leading-none">{new Date(event.event_date).toLocaleString('en-US', { month: 'short' })}</span>
          <span className="text-2xl font-bold leading-none mt-1">{new Date(event.event_date).getDate()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap"><h3 className="font-semibold text-ink-900 text-lg">{event.title}</h3><span className="badge-brand capitalize">{event.event_type}</span></div>
          <div className="flex flex-wrap gap-3 mt-2 text-sm muted">
            <span className="flex items-center gap-1.5"><FiClock /> {formatDateTime(event.event_date)}</span>
            <span className="flex items-center gap-1.5"><FiMapPin /> {event.location}</span>
            <span className="flex items-center gap-1.5"><FiUsers /> {regCount}{event.capacity ? `/${event.capacity}` : ''} registered</span>
          </div>
          {event.description && <p className="text-sm text-ink-700 mt-2">{event.description}</p>}
        </div>
        <div className="sm:self-center">
          {past ? (registered && <span className="badge-success"><FiCheck /> Attended</span>)
            : registered ? <button onClick={() => onUnregister(event.id)} className="btn-secondary btn-sm w-full sm:w-auto"><FiCheck /> Registered — Cancel</button>
            : full ? <span className="badge-warning">Full</span>
            : <button onClick={() => onRegister(event.id)} className="btn-primary btn-sm w-full sm:w-auto">Register</button>}
        </div>
      </div>
    </motion.div>
  )
}

function EventFormModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ title: '', description: '', event_type: 'webinar', event_date: '', location: 'Online', capacity: '' })
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!user || !form.title || !form.event_date) return
    setBusy(true)
    await supabase.from('events').insert({ title: form.title, description: form.description, event_type: form.event_type, event_date: form.event_date, location: form.location, organizer_id: user.id, capacity: form.capacity ? Number(form.capacity) : null })
    setBusy(false); setForm({ title: '', description: '', event_type: 'webinar', event_date: '', location: 'Online', capacity: '' })
    onClose(); onDone()
  }

  return (
    <Modal open={open} onClose={onClose} title="Create event" size="lg">
      <div className="space-y-4">
        <div><label className="label">Event title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Alumni Tech Talk: Scaling to 1M users" /></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="label">Event type</label><select className="input" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })}><option value="webinar">Webinar</option><option value="meetup">Alumni Meet</option><option value="technical">Technical Session</option><option value="workshop">Workshop</option></select></div>
          <div><label className="label">Date & time</label><input type="datetime-local" className="input" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="label">Location</label><input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div><label className="label">Capacity (optional)</label><input type="number" className="input" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="100" /></div>
        </div>
        <div><label className="label">Description</label><textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="flex justify-end gap-2 pt-2"><button onClick={onClose} className="btn-secondary">Cancel</button><button onClick={submit} disabled={busy} className="btn-primary">{busy ? 'Creating…' : 'Create event'}</button></div>
      </div>
    </Modal>
  )
}
