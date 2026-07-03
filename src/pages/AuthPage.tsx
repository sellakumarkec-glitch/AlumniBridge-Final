import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { FiArrowLeft, FiMail, FiLock, FiUser, FiBriefcase, FiUserCheck, FiShield, FiCpu } from 'react-icons/fi'
import { useAuth } from '../lib/auth'
import { UserRole } from '../lib/supabase'
import { Spinner } from '../components/ui'
import { cn } from '../lib/utils'

type FormValues = {
  email: string
  password: string
  full_name?: string
  role?: UserRole
  department?: string
  graduation_year?: number
}

const roles: { value: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'student', label: 'Student', icon: <FiUserCheck />, desc: 'Find mentors, jobs, and grow your career' },
  { value: 'alumni', label: 'Alumni', icon: <FiBriefcase />, desc: 'Mentor students, post jobs, share stories' },
  { value: 'placement', label: 'Placement Officer', icon: <FiShield />, desc: 'Verify alumni, manage placements' },
  { value: 'admin', label: 'Administrator', icon: <FiCpu />, desc: 'Full platform oversight' },
]

export default function AuthPage() {
  const [params] = useSearchParams()
  const isSignup = params.get('mode') === 'signup'
  const [mode, setMode] = useState<'signin' | 'signup'>(isSignup ? 'signup' : 'signin')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>()
  const selectedRole = watch('role', 'student')

  useEffect(() => { setError(null) }, [mode])

  const onSubmit = async (data: FormValues) => {
    setError(null); setBusy(true)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(data.email, data.password)
        if (error) setError(error)
        else navigate('/app')
      } else {
        if (!data.full_name || !data.role) { setError('Please complete all fields.'); setBusy(false); return }
        const { error } = await signUp({
          email: data.email, password: data.password, full_name: data.full_name,
          role: data.role, department: data.department, graduation_year: data.graduation_year,
        })
        if (error) setError(error)
        else navigate('/app')
      }
    } finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center font-bold">A</div>
            <span className="font-display font-bold text-xl">AlumniBridge</span>
          </Link>
          <div>
            <h1 className="text-4xl font-bold font-display leading-tight">
              {mode === 'signin' ? 'Welcome back to your network' : 'Join 16,000+ students and alumni'}
            </h1>
            <p className="text-brand-100 mt-4 text-lg max-w-md">Connect, mentor, and grow with a community built for career success.</p>
            <div className="mt-10 space-y-3">
              {['Verified alumni mentors', 'AI-powered career guidance', 'Jobs, internships & events'].map((t) => (
                <div key={t} className="flex items-center gap-3 text-brand-50">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</div>
                  {t}
                </div>
              ))}
            </div>
          </div>
          <p className="text-brand-200 text-sm">© 2026 AlumniBridge</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-ink-50">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 text-ink-600 mb-6 text-sm"><FiArrowLeft /> Back to home</Link>
          <h2 className="text-2xl font-bold text-ink-900 font-display">{mode === 'signin' ? 'Sign in to your account' : 'Create your account'}</h2>
          <p className="muted mt-1">{mode === 'signin' ? "Welcome back. Let's pick up where you left off." : 'Choose your role and start connecting.'}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                  <div>
                    <label className="label">Full name</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                      <input className="input pl-10" placeholder="Jane Doe" {...register('full_name', { required: 'Name is required' })} />
                    </div>
                    {errors.full_name && <p className="text-xs text-red-600 mt-1">{errors.full_name.message}</p>}
                  </div>
                  <div>
                    <label className="label">I am a…</label>
                    <div className="grid grid-cols-2 gap-2">
                      {roles.map((r) => (
                        <button type="button" key={r.value} onClick={() => setValue('role', r.value, { shouldValidate: true })} className={cn('text-left p-3 rounded-xl border transition-all', selectedRole === r.value ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20' : 'border-ink-200 hover:border-ink-300 bg-white')}>
                          <div className="flex items-center gap-2 text-brand-600 text-lg">{r.icon}</div>
                          <p className="font-medium text-ink-900 text-sm mt-1">{r.label}</p>
                          <p className="text-xs muted mt-0.5 leading-snug">{r.desc}</p>
                        </button>
                      ))}
                    </div>
                    <input type="hidden" {...register('role')} />
                  </div>
                  {selectedRole === 'student' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3">
                      <div><label className="label">Department</label><input className="input" placeholder="Computer Science" {...register('department')} /></div>
                      <div><label className="label">Graduation year</label><input type="number" className="input" placeholder="2027" {...register('graduation_year', { valueAsNumber: true })} /></div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input type="email" className="input pl-10" placeholder="you@example.com" {...register('email', { required: 'Email is required' })} />
              </div>
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input type="password" className="input pl-10" placeholder="••••••••" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
            </div>

            {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}

            <button type="submit" disabled={busy} className="btn-primary btn-lg w-full">
              {busy ? <Spinner /> : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm muted mt-6">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-brand-600 font-medium hover:text-brand-700">
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <div className="mt-6 p-3 rounded-lg bg-ink-100/60 text-xs muted text-center">
            Try a demo account: <span className="font-medium text-ink-700">student@alumni.edu</span> / <span className="font-medium text-ink-700">AlumniBridge2026!</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
