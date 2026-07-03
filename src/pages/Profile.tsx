import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiSave, FiCheckCircle, FiBriefcase, FiMapPin, FiPhone, FiCalendar, FiAward } from 'react-icons/fi'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { Avatar } from '../components/ui'
import { cn, roleLabel, roleBadgeClass } from '../lib/utils'

type AlumniProfile = {
  company: string | null
  job_title: string | null
  industry: string | null
  experience_years: number | null
  linkedin_url: string | null
  skills: string[] | null
  willing_to_mentor: boolean | null
}

export default function Profile() {
  const { user, refresh } = useAuth()
  const [form, setForm] = useState({
    full_name: '', bio: '', phone: '', location: '', department: '', graduation_year: '', avatar_url: '',
  })
  const [alumni, setAlumni] = useState<AlumniProfile | null>(null)
  const [alumniForm, setAlumniForm] = useState({
    company: '', job_title: '', industry: '', experience_years: '', linkedin_url: '', skills: '', willing_to_mentor: true,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    setForm({
      full_name: user.full_name ?? '',
      bio: user.bio ?? '',
      phone: user.phone ?? '',
      location: user.location ?? '',
      department: user.department ?? '',
      graduation_year: user.graduation_year?.toString() ?? '',
      avatar_url: user.avatar_url ?? '',
    })
    if (user.role === 'alumni') {
      supabase.from('alumni_profiles').select('*').eq('id', user.id).maybeSingle().then(({ data }) => {
        if (data) {
          setAlumni(data as AlumniProfile)
          setAlumniForm({
            company: data.company ?? '',
            job_title: data.job_title ?? '',
            industry: data.industry ?? '',
            experience_years: data.experience_years?.toString() ?? '',
            linkedin_url: data.linkedin_url ?? '',
            skills: (data.skills as string[] | null)?.join(', ') ?? '',
            willing_to_mentor: data.willing_to_mentor ?? true,
          })
        }
      })
    }
  }, [user])

  if (!user) return null

  const save = async () => {
    setSaving(true)
    setSaved(false)
    await supabase.from('profiles').update({
      full_name: form.full_name,
      bio: form.bio || null,
      phone: form.phone || null,
      location: form.location || null,
      department: form.department || null,
      graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
      avatar_url: form.avatar_url || null,
    }).eq('id', user.id)

    if (user.role === 'alumni') {
      await supabase.from('alumni_profiles').upsert({
        id: user.id,
        company: alumniForm.company || null,
        job_title: alumniForm.job_title || null,
        industry: alumniForm.industry || null,
        experience_years: alumniForm.experience_years ? parseInt(alumniForm.experience_years) : null,
        linkedin_url: alumniForm.linkedin_url || null,
        skills: alumniForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
        willing_to_mentor: alumniForm.willing_to_mentor,
      })
    }

    await refresh()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 font-display">My Profile</h1>
        <p className="muted mt-1">Update your personal information and professional details.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={user.full_name} src={form.avatar_url || user.avatar_url} size={64} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-ink-900">{user.full_name}</h2>
              <span className={cn(roleBadgeClass(user.role))}>{roleLabel(user.role)}</span>
              {user.is_verified && <FiCheckCircle className="text-emerald-500" />}
            </div>
            <p className="text-sm muted">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name" icon={<FiUser />}>
              <input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </Field>
            <Field label="Avatar URL" icon={<FiUser />}>
              <input className="input" placeholder="https://…" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} />
            </Field>
          </div>

          <Field label="Bio">
            <textarea rows={3} className="input" placeholder="Tell the community about yourself…" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Phone" icon={<FiPhone />}>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="Location" icon={<FiMapPin />}>
              <input className="input" placeholder="City, Country" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Department" icon={<FiAward />}>
              <input className="input" placeholder="Computer Science" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </Field>
            <Field label="Graduation year" icon={<FiCalendar />}>
              <input type="number" className="input" placeholder="2024" value={form.graduation_year} onChange={(e) => setForm({ ...form, graduation_year: e.target.value })} />
            </Field>
          </div>
        </div>
      </motion.div>

      {user.role === 'alumni' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h2 className="section-title mb-4 flex items-center gap-2"><FiBriefcase /> Professional details</h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Company">
                <input className="input" placeholder="Google" value={alumniForm.company} onChange={(e) => setAlumniForm({ ...alumniForm, company: e.target.value })} />
              </Field>
              <Field label="Job title">
                <input className="input" placeholder="Software Engineer" value={alumniForm.job_title} onChange={(e) => setAlumniForm({ ...alumniForm, job_title: e.target.value })} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Industry">
                <input className="input" placeholder="Technology" value={alumniForm.industry} onChange={(e) => setAlumniForm({ ...alumniForm, industry: e.target.value })} />
              </Field>
              <Field label="Experience (years)">
                <input type="number" className="input" placeholder="5" value={alumniForm.experience_years} onChange={(e) => setAlumniForm({ ...alumniForm, experience_years: e.target.value })} />
              </Field>
            </div>
            <Field label="LinkedIn URL">
              <input className="input" placeholder="https://linkedin.com/in/…" value={alumniForm.linkedin_url} onChange={(e) => setAlumniForm({ ...alumniForm, linkedin_url: e.target.value })} />
            </Field>
            <Field label="Skills (comma-separated)">
              <input className="input" placeholder="React, Python, AWS, System Design" value={alumniForm.skills} onChange={(e) => setAlumniForm({ ...alumniForm, skills: e.target.value })} />
            </Field>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={alumniForm.willing_to_mentor} onChange={(e) => setAlumniForm({ ...alumniForm, willing_to_mentor: e.target.checked })} className="w-4 h-4 rounded accent-brand-600" />
              <span className="text-sm text-ink-700">Open to mentoring students</span>
            </label>
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="btn-primary"><FiSave /> {saving ? 'Saving…' : 'Save changes'}</button>
        {saved && <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 text-sm text-emerald-600"><FiCheckCircle /> Saved!</motion.span>}
      </div>
    </div>
  )
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="label flex items-center gap-1.5">{icon && <span className="text-ink-400">{icon}</span>}{label}</label>
      {children}
    </div>
  )
}
