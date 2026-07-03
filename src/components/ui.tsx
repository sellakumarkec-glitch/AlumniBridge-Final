import { ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi'
import { cn, initials, avatarColor } from '../lib/utils'

export function Avatar({ name, src, size = 40, className }: { name: string; src?: string | null; size?: number; className?: string }) {
  if (src) {
    return <img src={src} alt={name} style={{ width: size, height: size }} className={cn('rounded-full object-cover', className)} />
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={cn('rounded-full flex items-center justify-center text-white font-semibold shrink-0', avatarColor(name), className)}
    >
      {initials(name)}
    </div>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('inline-block animate-spin rounded-full border-2 border-ink-200 border-t-brand-600', className)} style={{ width: 20, height: 20 }} />
  )
}

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Spinner className="w-7 h-7" />
      <p className="text-sm muted">{label}</p>
    </div>
  )
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon && <div className="text-ink-300 mb-4 text-4xl">{icon}</div>}
      <h3 className="text-lg font-semibold text-ink-800">{title}</h3>
      {description && <p className="muted mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Modal({ open, onClose, title, children, size = 'md' }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])

  const maxW = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg'
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className={cn('relative w-full bg-white rounded-2xl shadow-card max-h-[90vh] overflow-y-auto', maxW)}
            initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 sticky top-0 bg-white rounded-t-2xl z-10">
                <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-800 transition-colors">
                  <FiX size={20} />
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function StatCard({ label, value, icon, accent = 'brand' }: { label: string; value: ReactNode; icon?: ReactNode; accent?: 'brand' | 'success' | 'warning' | 'accent' }) {
  const bg = {
    brand: 'bg-brand-50 text-brand-600',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    accent: 'bg-amber-50 text-amber-600',
  }[accent]
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm muted">{label}</p>
          <p className="text-2xl font-bold text-ink-900 mt-1 font-display">{value}</p>
        </div>
        {icon && <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-xl', bg)}>{icon}</div>}
      </div>
    </div>
  )
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('badge-neutral', className)}>{children}</span>
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 font-display">{title}</h1>
        {subtitle && <p className="muted mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
