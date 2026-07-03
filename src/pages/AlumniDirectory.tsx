import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiSearch, FiSliders, FiMapPin, FiBriefcase, FiCalendar, FiStar, FiX, FiCheckCircle } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { Avatar, Loading, EmptyState, Tag } from '../components/ui'
import { cn } from '../lib/utils'

type Row = {
  id: string; full_name: string; avatar_url: string | null; department: string | null;
  graduation_year: number | null; location: string | null; is_verified: boolean;
  alumni_profiles: { company: string | null; job_title: string | null; industry: string | null; skills: string[] | null; willing_to_mentor: boolean | null }[]
}

export default function AlumniDirectory() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [company, setCompany] = useState('')
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')
  const [skill, setSkill] = useState('')
  const [location, setLocation] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, alumni_profiles(company, job_title, industry, skills, willing_to_mentor)')
        .eq('role', 'alumni').eq('is_verified', true)
        .order('created_at', { ascending: false })
      if (!active) return
      if (error) { console.error(error); setLoading(false); return }
      setRows((data as any) ?? [])
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [])

  const departments = useMemo(() => Array.from(new Set(rows.map((r) => r.department).filter(Boolean))) as string[], [rows])
  const years = useMemo(() => Array.from(new Set(rows.map((r) => r.graduation_year).filter(Boolean) as number[])).sort((a, b) => b - a), [rows])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const ap = r.alumni_profiles?.[0]
      if (q) {
        const hay = `${r.full_name} ${ap?.company ?? ''} ${ap?.job_title ?? ''} ${r.department ?? ''} ${(ap?.skills ?? []).join(' ')}`.toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }
      if (company && !(ap?.company ?? '').toLowerCase().includes(company.toLowerCase())) return false
      if (department && r.department !== department) return false
      if (year && String(r.graduation_year) !== year) return false
      if (skill && !(ap?.skills ?? []).some((s) => s.toLowerCase().includes(skill.toLowerCase()))) return false
      if (location && !(r.location ?? '').toLowerCase().includes(location.toLowerCase())) return false
      return true
    })
  }, [rows, q, company, department, year, skill, location])

  const clearFilters = () => { setCompany(''); setDepartment(''); setYear(''); setSkill(''); setLocation(''); setQ('') }
  const hasFilters = q || company || department || year || skill || location

  if (loading) return <Loading label="Loading alumni directory…" />

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 font-display">Alumni Directory</h1>
        <p className="muted mt-1">Search {rows.length} verified alumni by name, company, skills, department, year, or location.</p>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, company, role, or skill…" className="input pl-11" />
          </div>
          <button onClick={() => setShowFilters((v) => !v)} className={cn('btn-secondary', showFilters && 'border-brand-500 text-brand-700 bg-brand-50')}><FiSliders /> Filters</button>
        </div>

        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 pt-4 border-t border-ink-100">
            <div><label className="label">Company</label><input className="input" placeholder="e.g. Google" value={company} onChange={(e) => setCompany(e.target.value)} /></div>
            <div><label className="label">Department</label><select className="input" value={department} onChange={(e) => setDepartment(e.target.value)}><option value="">All departments</option>{departments.map((d) => <option key={d} value={d}>{d}</option>)}</select></div>
            <div><label className="label">Graduation year</label><select className="input" value={year} onChange={(e) => setYear(e.target.value)}><option value="">All years</option>{years.map((y) => <option key={y} value={String(y)}>{y}</option>)}</select></div>
            <div><label className="label">Skill</label><input className="input" placeholder="e.g. React" value={skill} onChange={(e) => setSkill(e.target.value)} /></div>
            <div><label className="label">Location</label><input className="input" placeholder="e.g. Bangalore" value={location} onChange={(e) => setLocation(e.target.value)} /></div>
            {hasFilters && <div className="flex items-end"><button onClick={clearFilters} className="btn-ghost text-error-600 hover:bg-red-50"><FiX /> Clear filters</button></div>}
          </motion.div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<FiSearch />} title={hasFilters ? 'No alumni match your filters' : 'No alumni yet'} description={hasFilters ? 'Try adjusting or clearing your filters.' : 'Verified alumni will appear here.'} action={hasFilters ? <button onClick={clearFilters} className="btn-secondary">Clear filters</button> : undefined} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => {
            const ap = r.alumni_profiles?.[0]
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}>
                <Link to={`/app/alumni/${r.id}`} className="card p-5 hover:shadow-card hover:-translate-y-0.5 transition-all block h-full">
                  <div className="flex items-start gap-3">
                    <Avatar name={r.full_name} src={r.avatar_url} size={52} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-ink-900 truncate">{r.full_name}</h3>
                        {r.is_verified && <FiCheckCircle className="text-brand-500 shrink-0" />}
                      </div>
                      <p className="text-sm muted truncate">{ap?.job_title ?? 'Alumni'}</p>
                      <p className="text-sm text-ink-700 truncate">{ap?.company ?? '—'}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5 text-sm">
                    {r.department && <div className="flex items-center gap-2 muted"><FiBriefcase className="text-ink-400" /> {r.department}</div>}
                    {r.graduation_year && <div className="flex items-center gap-2 muted"><FiCalendar className="text-ink-400" /> Class of {r.graduation_year}</div>}
                    {r.location && <div className="flex items-center gap-2 muted"><FiMapPin className="text-ink-400" /> {r.location}</div>}
                  </div>
                  {ap?.skills && ap.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {ap.skills.slice(0, 4).map((s) => <Tag key={s}>{s}</Tag>)}
                      {ap.skills.length > 4 && <Tag>+{ap.skills.length - 4}</Tag>}
                    </div>
                  )}
                  {ap?.willing_to_mentor && <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full"><FiStar /> Open to mentor</div>}
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
