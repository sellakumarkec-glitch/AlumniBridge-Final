import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiUsers, FiMessageSquare, FiBriefcase, FiCalendar, FiAward, FiCpu, FiBookOpen } from 'react-icons/fi'

const features = [
  { icon: <FiUsers />, title: 'Alumni Directory', desc: 'Search verified alumni by company, skills, department, year, or location.' },
  { icon: <FiMessageSquare />, title: '1:1 Mentorship', desc: 'Request mentorship, schedule sessions, and track your career growth.' },
  { icon: <FiBriefcase />, title: 'Jobs & Internships', desc: 'Apply to referral-backed roles and internships posted by alumni.' },
  { icon: <FiCalendar />, title: 'Events & Webinars', desc: 'Register for alumni meets, technical sessions, and workshops.' },
  { icon: <FiAward />, title: 'Success Stories', desc: 'Read alumni achievements, career journeys, and startup stories.' },
  { icon: <FiCpu />, title: 'AI Career Tools', desc: 'AI assistant, resume analyzer, and interview practice with feedback.' },
]

const stats = [
  { value: '12K+', label: 'Alumni' },
  { value: '4.2K', label: 'Students' },
  { value: '850+', label: 'Jobs posted' },
  { value: '320+', label: 'Mentors' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold">A</div>
            <span className="font-display font-bold text-lg text-ink-900">AlumniBridge</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="btn-ghost">Sign in</Link>
            <Link to="/auth?mode=signup" className="btn-primary">Get started</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 badge-brand mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            AI-powered alumni networking
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="text-5xl md:text-6xl font-bold text-ink-900 font-display leading-[1.05] max-w-4xl mx-auto">
            Bridge the gap between <span className="bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">students and alumni</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-6 text-lg muted max-w-2xl mx-auto">
            Connect with verified alumni, find mentors, land internships and jobs, attend events, and get AI-powered career guidance — all in one platform.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="mt-9 flex items-center justify-center gap-3">
            <Link to="/auth?mode=signup" className="btn-primary btn-lg">Join the network <FiArrowRight /></Link>
            <Link to="/auth" className="btn-secondary btn-lg">I already have an account</Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="card-soft p-5">
                <p className="text-3xl font-bold text-brand-700 font-display">{s.value}</p>
                <p className="text-sm muted mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-ink-900 font-display">Everything you need to grow your career</h2>
          <p className="muted mt-3">A complete platform for students, alumni, faculty, and placement officers.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} className="card p-6 hover:shadow-card hover:-translate-y-0.5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center text-2xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-ink-900">{f.title}</h3>
              <p className="muted mt-2 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 px-8 py-16 text-center">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="relative">
            <FiBookOpen className="mx-auto text-white/80 text-3xl mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-white font-display max-w-2xl mx-auto">Start building your professional network today</h2>
            <p className="text-brand-100 mt-3 max-w-xl mx-auto">Join thousands of students and alumni already growing together.</p>
            <Link to="/auth?mode=signup" className="btn btn-lg bg-white text-brand-700 hover:bg-brand-50 mt-7">Create your free account <FiArrowRight /></Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-100 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-bold">A</div>
            <span className="font-display font-semibold text-ink-800">AlumniBridge</span>
          </div>
          <p className="text-sm muted">© 2026 AlumniBridge. Connecting futures, one mentor at a time.</p>
        </div>
      </footer>
    </div>
  )
}
