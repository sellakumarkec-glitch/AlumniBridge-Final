import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiBell, FiCheck, FiMessageSquare, FiBriefcase, FiCalendar, FiAward, FiTrash2 } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Loading, EmptyState } from '../components/ui'
import { timeAgo, cn } from '../lib/utils'

type Notif = { id: string; type: string; title: string; body: string; link: string | null; is_read: boolean | null; created_at: string }

const typeIcon: Record<string, React.ReactNode> = {
  mentorship: <FiMessageSquare />, application: <FiBriefcase />, session: <FiCalendar />, story: <FiAward />, event: <FiCalendar />, system: <FiBell />,
}

export default function Notifications() {
  const { user } = useAuth()
  const [items, setItems] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!user) return
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setItems((data as any) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  const markRead = async (id: string) => { await supabase.from('notifications').update({ is_read: true }).eq('id', id); setItems((s) => s.map((n) => n.id === id ? { ...n, is_read: true } : n)) }
  const markAll = async () => { if (!user) return; await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false); setItems((s) => s.map((n) => ({ ...n, is_read: true }))) }
  const remove = async (id: string) => { await supabase.from('notifications').delete().eq('id', id); setItems((s) => s.filter((n) => n.id !== id)) }

  if (loading) return <Loading label="Loading notifications…" />
  const unread = items.filter((n) => !n.is_read).length

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-ink-900 font-display">Notifications</h1><p className="muted mt-1">{unread > 0 ? `${unread} unread` : "You're all caught up"}</p></div>
        {unread > 0 && <button onClick={markAll} className="btn-secondary btn-sm"><FiCheck /> Mark all read</button>}
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<FiBell />} title="No notifications" description="You'll see updates about mentorship, jobs, events, and more here." />
      ) : (
        <div className="space-y-2">
          {items.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.2) }} className={cn('card p-4 flex items-start gap-3', !n.is_read && 'border-brand-200 bg-brand-50/30')}>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', !n.is_read ? 'bg-brand-100 text-brand-600' : 'bg-ink-100 text-ink-500')}>{typeIcon[n.type] ?? <FiBell />}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className={cn('font-medium text-ink-900', !n.is_read && 'text-brand-900')}>{n.title}</p>{!n.is_read && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />}</div>
                {n.body && <p className="text-sm text-ink-700 mt-0.5">{n.body}</p>}
                <p className="text-xs muted mt-1">{timeAgo(n.created_at)}</p>
              </div>
              <div className="flex items-center gap-1">
                {n.link && <Link to={n.link} onClick={() => markRead(n.id)} className="btn-ghost btn-sm p-2">View</Link>}
                {!n.is_read && <button onClick={() => markRead(n.id)} className="btn-ghost btn-sm p-2" title="Mark read"><FiCheck /></button>}
                <button onClick={() => remove(n.id)} className="btn-ghost btn-sm p-2 text-ink-400 hover:text-error-600" title="Delete"><FiTrash2 /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
