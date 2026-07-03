import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiMapPin, FiBriefcase, FiCalendar, FiStar, FiCheckCircle, FiLink, FiMessageSquare, FiBookmark, FiUser } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Avatar, Loading, Modal, Tag, EmptyState } from '../components/ui'
import { cn, roleLabel, roleBadgeClass } from '../lib/utils'

export default function AlumniProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [alumni, setAlumni] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showMentor, setShowMentor] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [existingReq, setExistingReq] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let active = true
    const load = async () => {
      const [{ data: p }, { data: ap }, { data: bk }, { data: req }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).maybeSingle(),
        supabase.from('alumni_profiles').select('*').eq('id', id).maybeSingle(),
        user ? supabase.from('bookmarks').select('id').eq('alumni_id', id).eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
        user ? supabase.from('mentorship_requests').select('id,status').eq('alumni_id', id).eq('student_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
      ])
      if (!active) return
      setProfile(p); setAlumni(ap); setBookmarked(!!bk); setExistingReq(req?.status ?? null)
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [id, user])

  const sendRequest = async () => {
    if (!user || !id) return
    setBusy(true)
    const { error } = await supabase.from('mentorship_requests').insert({ student_id: user.id, alumni_id: id, message })
    if (!error) {
      await supabase.from('notifications').insert({ user_id: id, type: 'mentorship', title: 'New mentorship request', body: `${user.full_name} sent you a mentorship request.`, link: '/app/mentorship' })
      setShowMentor(false); setMessage(''); setExistingReq('pending'); navigate('/app/mentorship')
    }
    setBusy(false)
  }

  const toggleBookmark = async () => {
    if (!user || !id) return
    if (bookmarked) {
      await supabase.from('bookmarks').delete().eq('alumni_id', id).eq('user_id', user.id)
      setBookmarked(false)
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, alumni_id: id })
      setBookmarked(true)
    }
  }

  if (loading) return <Loading label="Loading profile…" />
  if (!profile) return <EmptyState icon={<FiUser />} title="Alumni not found" action={<Link to="/app/directory" className="btn-primary">Back to directory</Link>} />

  const isSelf = user?.id === profile.id
  const canRequestMentor = user?.role === 'student' && !isSelf

  return (
    <div className="space-y-5">
      <Link to="/app/directory" className="inline-flex items-center gap-2 text-sm text-ink-600 hover:text-ink-900"><FiArrowLeft /> Back to directory</Link>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
        <div className="h-28 bg-gradient-to-br from-brand-500 to-brand-700" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <Avatar name={profile.full_name} src={profile.avatar_url} size={96} className="ring-4 ring-white" />
            <div className="flex-1 sm:pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-ink-900 font-display">{profile.full_name}</h1>
                {profile.is_verified && <span className="badge-success"><FiCheckCircle /> Verified</span>}
                <span className={cn(roleBadgeClass(profile.role))}>{roleLabel(profile.role)}</span>
              </div>
              <p className="muted mt-1">{alumni?.job_title ?? 'Alumni'}{alumni?.company ? ` at ${alumni.company}` : ''}</p>
            </div>
            {!isSelf && (
              <div className="flex gap-2 sm:pb-2">
                <button onClick={toggleBookmark} className={cn('btn-secondary', bookmarked && 'border-brand-500 text-brand-700 bg-brand-50')}><FiBookmark /> {bookmarked ? 'Saved' : 'Save'}</button>
                {canRequestMentor && (
                  <button onClick={() => setShowMentor(true)} disabled={!!existingReq} className="btn-primary">
                    <FiMessageSquare /> {existingReq === 'accepted' ? 'Mentoring' : existingReq ? 'Request sent' : 'Request mentorship'}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            {profile.department && <Info icon={<FiBriefcase />} label="Department" value={profile.department} />}
            {profile.graduation_year && <Info icon={<FiCalendar />} label="Graduated" value={String(profile.graduation_year)} />}
            {profile.location && <Info icon={<FiMapPin />} label="Location" value={profile.location} />}
            {alumni?.industry && <Info icon={<FiStar />} label="Industry" value={alumni.industry} />}
          </div>

          {profile.bio && <div className="mt-6"><h3 className="text-sm font-semibold text-ink-700 mb-1.5">About</h3><p className="text-ink-800 leading-relaxed">{profile.bio}</p></div>}

          {alumni?.skills && alumni.skills.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-ink-700 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">{alumni.skills.map((s: string) => <Tag key={s} className="badge-brand">{s}</Tag>)}</div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            {alumni?.company && <Info icon={<FiBriefcase />} label="Company" value={alumni.company} />}
            {alumni?.experience_years != null && <Info icon={<FiStar />} label="Experience" value={`${alumni.experience_years} years`} />}
            {alumni?.linkedin_url && <a href={alumni.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-brand-600 hover:text-brand-700 text-sm font-medium"><FiLink /> LinkedIn profile</a>}
            {alumni?.willing_to_mentor && <div className="inline-flex items-center gap-1.5 text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full w-fit"><FiStar /> Open to mentoring students</div>}
          </div>
        </div>
      </motion.div>

      <Modal open={showMentor} onClose={() => setShowMentor(false)} title="Request mentorship">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar name={profile.full_name} src={profile.avatar_url} size={48} />
            <div><p className="font-medium text-ink-900">{profile.full_name}</p><p className="text-sm muted">{alumni?.job_title} · {alumni?.company}</p></div>
          </div>
          <div><label className="label">Message to mentor</label><textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="input" placeholder="Introduce yourself, your goals, and what you'd like help with…" /></div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowMentor(false)} className="btn-secondary">Cancel</button>
            <button onClick={sendRequest} disabled={busy || !message.trim()} className="btn-primary">{busy ? 'Sending…' : 'Send request'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-ink-50">
      <div className="text-ink-400 mt-0.5">{icon}</div>
      <div><p className="text-xs muted">{label}</p><p className="text-sm font-medium text-ink-900">{value}</p></div>
    </div>
  )
}
