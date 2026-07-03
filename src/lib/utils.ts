export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export function initials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

export function timeAgo(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return d.toLocaleDateString()
}

export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', opts ?? { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function avatarColor(seed: string) {
  const colors = [
    'bg-brand-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
    'bg-violet-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500',
  ]
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return colors[h % colors.length]
}

export function roleLabel(role: string) {
  switch (role) {
    case 'student': return 'Student'
    case 'alumni': return 'Alumni'
    case 'placement': return 'Placement Officer'
    case 'admin': return 'Administrator'
    default: return role
  }
}

export function roleBadgeClass(role: string) {
  switch (role) {
    case 'student': return 'badge-brand'
    case 'alumni': return 'badge-success'
    case 'placement': return 'badge-warning'
    case 'admin': return 'badge-error'
    default: return 'badge-neutral'
  }
}
