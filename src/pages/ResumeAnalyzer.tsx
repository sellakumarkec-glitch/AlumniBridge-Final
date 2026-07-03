import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiFileText, FiTrendingUp, FiCheckCircle, FiAlertCircle, FiZap } from 'react-icons/fi'
import { SectionHeader, Tag } from '../components/ui'
import { analyzeResume, skillGapAnalysis } from '../lib/ai'
import { cn } from '../lib/utils'

export default function ResumeAnalyzer() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<ReturnType<typeof analyzeResume> | null>(null)
  const [skills, setSkills] = useState('')
  const [targetRole, setTargetRole] = useState('frontend developer')
  const [gap, setGap] = useState<ReturnType<typeof skillGapAnalysis> | null>(null)

  const analyze = () => { if (!text.trim()) return; setResult(analyzeResume(text)) }
  const analyzeGap = () => { const userSkills = skills.split(',').map((s) => s.trim()).filter(Boolean); setGap(skillGapAnalysis(userSkills, targetRole)) }

  const scoreColor = result ? (result.score >= 75 ? 'text-emerald-600' : result.score >= 50 ? 'text-amber-600' : 'text-red-600') : ''
  const ringColor = result ? (result.score >= 75 ? 'stroke-emerald-500' : result.score >= 50 ? 'stroke-amber-500' : 'stroke-red-500') : ''

  return (
    <div className="space-y-6">
      <SectionHeader title="AI Resume Analyzer" subtitle="Get an ATS score, keyword analysis, and improvement tips." />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="section-title mb-4 flex items-center gap-2"><FiFileText /> Paste your resume</h2>
          <textarea rows={10} className="input font-mono text-sm" placeholder="Paste your resume text here…" value={text} onChange={(e) => setText(e.target.value)} />
          <button onClick={analyze} disabled={!text.trim()} className="btn-primary w-full mt-3"><FiZap /> Analyze resume</button>

          {result && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
              <div className="flex items-center gap-5">
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-ink-100" />
                    <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="round" className={ringColor} strokeDasharray={`${(result.score / 100) * 264} 264`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn('text-2xl font-bold font-display', scoreColor)}>{result.score}</span>
                    <span className="text-xs muted">ATS score</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-ink-700">{result.score >= 75 ? 'Excellent! Your resume is well-optimized for ATS.' : result.score >= 50 ? 'Good start. A few improvements will boost your score.' : 'Needs work. Address the tips below.'}</p>
                  <p className="text-xs muted mt-1">{result.wordCount} words analyzed</p>
                </div>
              </div>

              <div><h3 className="text-sm font-semibold text-ink-700 mb-2">Found keywords</h3><div className="flex flex-wrap gap-1.5">{result.found.map((k) => <Tag key={k} className="badge-success"><FiCheckCircle /> {k}</Tag>)}</div></div>

              {result.missing.length > 0 && <div><h3 className="text-sm font-semibold text-ink-700 mb-2">Missing keywords</h3><div className="flex flex-wrap gap-1.5">{result.missing.map((k) => <Tag key={k} className="badge-error"><FiAlertCircle /> {k}</Tag>)}</div></div>}

              <div>
                <h3 className="text-sm font-semibold text-ink-700 mb-2">Improvement tips</h3>
                <ul className="space-y-2">{result.tips.map((t, i) => <li key={i} className="flex items-start gap-2 text-sm text-ink-700"><FiTrendingUp className="text-brand-500 mt-0.5 shrink-0" /> {t}</li>)}</ul>
              </div>
            </motion.div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="section-title mb-4 flex items-center gap-2"><FiTrendingUp /> Skill gap analysis</h2>
          <div className="space-y-3">
            <div><label className="label">Your skills (comma-separated)</label><input className="input" placeholder="React, JavaScript, Node.js, SQL" value={skills} onChange={(e) => setSkills(e.target.value)} /></div>
            <div><label className="label">Target role</label><select className="input" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}><option value="frontend developer">Frontend Developer</option><option value="backend developer">Backend Developer</option><option value="full stack developer">Full Stack Developer</option><option value="data scientist">Data Scientist</option><option value="devops engineer">DevOps Engineer</option><option value="product manager">Product Manager</option></select></div>
            <button onClick={analyzeGap} disabled={!skills.trim()} className="btn-primary w-full"><FiZap /> Analyze gap</button>
          </div>

          {gap && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5"><span className="text-sm font-medium text-ink-700">Match</span><span className={cn('text-sm font-bold', gap.matchPercent >= 70 ? 'text-emerald-600' : gap.matchPercent >= 40 ? 'text-amber-600' : 'text-red-600')}>{gap.matchPercent}%</span></div>
                <div className="h-2 bg-ink-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${gap.matchPercent}%` }} transition={{ duration: 0.6 }} className={cn('h-full rounded-full', gap.matchPercent >= 70 ? 'bg-emerald-500' : gap.matchPercent >= 40 ? 'bg-amber-500' : 'bg-red-500')} /></div>
              </div>
              <div><h3 className="text-sm font-semibold text-ink-700 mb-2">Skills you have</h3><div className="flex flex-wrap gap-1.5">{gap.have.length ? gap.have.map((s) => <Tag key={s} className="badge-success">{s}</Tag>) : <span className="text-sm muted">None yet</span>}</div></div>
              <div><h3 className="text-sm font-semibold text-ink-700 mb-2">Skills to develop</h3><div className="space-y-2">{gap.recommendations.map((r) => <div key={r.skill} className="p-3 rounded-lg bg-ink-50"><p className="text-sm font-medium text-ink-900">{r.skill}</p><p className="text-xs muted mt-0.5">{r.recommendation}</p></div>)}</div></div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
