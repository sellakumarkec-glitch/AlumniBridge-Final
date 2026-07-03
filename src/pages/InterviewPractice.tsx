import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCpu, FiZap, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiChevronRight } from 'react-icons/fi'
import { SectionHeader, Tag } from '../components/ui'
import { interviewQuestions, evaluateAnswer } from '../lib/ai'
import { cn } from '../lib/utils'

type Category = 'hr' | 'technical' | 'behavioral'

const categoryMeta: Record<Category, { label: string; description: string }> = {
  hr: { label: 'HR Round', description: 'General & behavioral HR questions' },
  technical: { label: 'Technical', description: 'System design & engineering' },
  behavioral: { label: 'Behavioral', description: 'Past experiences & scenarios' },
}

export default function InterviewPractice() {
  const [category, setCategory] = useState<Category | null>(null)
  const [qIndex, setQIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<ReturnType<typeof evaluateAnswer> | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  const start = (cat: Category) => {
    setCategory(cat)
    setQIndex(0)
    setAnswer('')
    setResult(null)
    setShowAnswer(false)
  }

  const currentQ = category ? interviewQuestions[category][qIndex] : ''

  const evaluate = () => {
    if (!answer.trim()) return
    setResult(evaluateAnswer(currentQ, answer))
  }

  const next = () => {
    if (!category) return
    setQIndex((i) => (i + 1) % interviewQuestions[category].length)
    setAnswer('')
    setResult(null)
    setShowAnswer(false)
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="AI Interview Practice" subtitle="Practice common interview questions and get instant AI feedback." />

      <AnimatePresence mode="wait">
        {!category ? (
          <motion.div key="select" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid sm:grid-cols-3 gap-4">
            {(Object.keys(categoryMeta) as Category[]).map((cat) => (
              <button key={cat} onClick={() => start(cat)} className="card p-6 text-left hover:shadow-card hover:-translate-y-0.5 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center text-xl mb-4"><FiCpu /></div>
                <h3 className="font-semibold text-ink-900 text-lg">{categoryMeta[cat].label}</h3>
                <p className="text-sm muted mt-1">{categoryMeta[cat].description}</p>
                <p className="text-xs text-brand-600 mt-3 flex items-center gap-1 group-hover:gap-2 transition-all">Start practicing <FiChevronRight /></p>
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div key="practice" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="badge-brand">{categoryMeta[category].label}</span>
                <span className="text-sm muted">Question {qIndex + 1} of {interviewQuestions[category].length}</span>
              </div>
              <button onClick={() => setCategory(null)} className="btn-ghost btn-sm"><FiRefreshCw /> Change category</button>
            </div>

            <div className="card p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 text-lg"><FiZap /></div>
                <div>
                  <p className="text-xs muted uppercase tracking-wide font-medium">Question</p>
                  <h2 className="text-xl font-semibold text-ink-900 mt-1">{currentQ}</h2>
                </div>
              </div>

              <textarea
                rows={6}
                className="input"
                placeholder="Type your answer here. Use the STAR method (Situation, Task, Action, Result) for best results…"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />

              <div className="flex items-center gap-3 mt-3">
                <button onClick={evaluate} disabled={!answer.trim()} className="btn-primary"><FiZap /> Evaluate answer</button>
                <button onClick={() => setShowAnswer(!showAnswer)} className="btn-secondary"><FiCheckCircle /> {showAnswer ? 'Hide tips' : 'Show tips'}</button>
              </div>

              {showAnswer && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 rounded-xl bg-ink-50">
                  <h3 className="text-sm font-semibold text-ink-700 mb-2">How to approach this</h3>
                  <ul className="space-y-1.5 text-sm text-ink-700">
                    <li>Structure with STAR: Situation (context), Task (your role), Action (what you did), Result (outcome with metrics).</li>
                    <li>Be specific — name technologies, team sizes, timelines, and quantifiable results.</li>
                    <li>Aim for 60-120 seconds spoken (~100-180 words).</li>
                    <li>End with what you learned or would do differently.</li>
                  </ul>
                </motion.div>
              )}
            </div>

            {result && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-4">
                <div className="flex items-center gap-5">
                  <div className="relative w-24 h-24 shrink-0">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-ink-100" />
                      <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="round" className={result.confidence >= 70 ? 'stroke-emerald-500' : result.confidence >= 40 ? 'stroke-amber-500' : 'stroke-red-500'} strokeDasharray={`${(result.confidence / 100) * 264} 264`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={cn('text-2xl font-bold font-display', result.confidence >= 70 ? 'text-emerald-600' : result.confidence >= 40 ? 'text-amber-600' : 'text-red-600')}>{result.confidence}</span>
                      <span className="text-xs muted">confidence</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-ink-700">{result.confidence >= 70 ? 'Strong answer! You covered structure, specificity, and metrics.' : result.confidence >= 40 ? 'Decent answer. Work on the tips below to strengthen it.' : 'Needs improvement. Review the tips and try again.'}</p>
                    <p className="text-xs muted mt-1">{result.wordCount} words</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-ink-700 mb-2">Feedback</h3>
                  <ul className="space-y-2">
                    {result.tips.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink-700">
                        {i === 0 && result.confidence >= 70 ? <FiCheckCircle className="text-emerald-500 mt-0.5 shrink-0" /> : <FiAlertCircle className="text-amber-500 mt-0.5 shrink-0" />}
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-ink-100">
                  <button onClick={next} className="btn-primary"><FiChevronRight /> Next question</button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
