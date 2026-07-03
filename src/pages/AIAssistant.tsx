import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiCpu, FiUser, FiStar, FiZap } from 'react-icons/fi'
import { generateAIResponse } from '../lib/ai'
import { cn } from '../lib/utils'

type Msg = { role: 'user' | 'assistant'; content: string }

const suggestions = [
  'How do I write a strong resume?',
  'Tips for my first technical interview',
  'How to transition from QA to SDE?',
  'Roadmap to become a frontend developer',
  "Should I do a Master's or start working?",
  'How to find the right mentor?',
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "Hi! I'm your AI Career Assistant. I can help with career guidance, resume tips, interview prep, learning roadmaps, and finding mentors. What would you like to explore today?" },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  const send = (text: string) => {
    if (!text.trim()) return
    setMessages((m) => [...m, { role: 'user', content: text }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const reply = generateAIResponse(text)
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
      setTyping(false)
    }, 700 + Math.random() * 500)
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xl"><FiCpu /></div>
        <div>
          <h1 className="text-2xl font-bold text-ink-900 font-display flex items-center gap-2">AI Career Assistant <FiStar className="text-amber-500" /></h1>
          <p className="muted text-sm">Your personal AI guide for career planning, resumes, and interviews.</p>
        </div>
      </div>

      <div className="card flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm', m.role === 'assistant' ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white' : 'bg-ink-200 text-ink-700')}>{m.role === 'assistant' ? <FiCpu /> : <FiUser />}</div>
                <div className={cn('max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed', m.role === 'assistant' ? 'bg-ink-50 text-ink-800 rounded-tl-sm' : 'bg-brand-600 text-white rounded-tr-sm')}>{m.content}</div>
              </motion.div>
            ))}
          </AnimatePresence>
          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center"><FiCpu /></div>
              <div className="bg-ink-50 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
                {[0, 1, 2].map((i) => <motion.span key={i} className="w-2 h-2 rounded-full bg-ink-400" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />)}
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length <= 1 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {suggestions.map((s) => <button key={s} onClick={() => send(s)} className="badge-brand hover:bg-brand-100 transition-colors text-left"><FiZap className="text-xs" /> {s}</button>)}
          </div>
        )}

        <div className="p-4 border-t border-ink-100">
          <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything about your career…" className="input" />
            <button type="submit" disabled={!input.trim() || typing} className="btn-primary"><FiSend /></button>
          </form>
        </div>
      </div>
    </div>
  )
}
