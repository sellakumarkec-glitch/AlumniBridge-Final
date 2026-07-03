import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiMessageSquare, FiSend } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Loading, EmptyState, Avatar } from '../components/ui'
import { timeAgo } from '../lib/utils'

type Comment = { id: string; content: string; created_at: string; author: { full_name: string; avatar_url: string | null } | null }
type Post = { id: string; title: string; content: string; category: string; created_at: string; author: { full_name: string; avatar_url: string | null } | null; forum_comments: Comment[] }

export default function ForumThread() {
  const { id } = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    if (!id) return
    const { data } = await supabase.from('forum_posts').select('*, author:profiles!author_id(full_name, avatar_url), forum_comments(*, author:profiles!author_id(full_name, avatar_url))').eq('id', id).maybeSingle()
    setPost((data as any) ?? null)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const addComment = async () => {
    if (!user || !id || !comment.trim()) return
    setBusy(true)
    await supabase.from('forum_comments').insert({ post_id: id, author_id: user.id, content: comment })
    setComment(''); setBusy(false); load()
  }

  if (loading) return <Loading label="Loading thread…" />
  if (!post) return <EmptyState icon={<FiMessageSquare />} title="Post not found" action={<Link to="/app/forum" className="btn-primary">Back to forum</Link>} />

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <Link to="/app/forum" className="inline-flex items-center gap-2 text-sm text-ink-600 hover:text-ink-900"><FiArrowLeft /> Back to forum</Link>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <span className="badge-brand capitalize">{post.category}</span>
        <h1 className="text-2xl font-bold text-ink-900 font-display mt-3">{post.title}</h1>
        <div className="flex items-center gap-2.5 mt-4 pb-4 border-b border-ink-100">
          <Avatar name={post.author?.full_name ?? '?'} src={post.author?.avatar_url} size={36} />
          <div><p className="text-sm font-medium text-ink-900">{post.author?.full_name}</p><p className="text-xs muted">{timeAgo(post.created_at)}</p></div>
        </div>
        <p className="text-ink-800 leading-relaxed mt-4 whitespace-pre-wrap">{post.content}</p>
      </motion.div>

      <div className="card p-6">
        <h2 className="section-title mb-4">{post.forum_comments?.length ?? 0} comments</h2>
        {post.forum_comments && post.forum_comments.length > 0 ? (
          <div className="space-y-4">
            {post.forum_comments.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.2) }} className="flex gap-3">
                <Avatar name={c.author?.full_name ?? '?'} src={c.author?.avatar_url} size={36} />
                <div className="flex-1">
                  <div className="flex items-center gap-2"><p className="text-sm font-medium text-ink-900">{c.author?.full_name}</p><span className="text-xs muted">{timeAgo(c.created_at)}</span></div>
                  <p className="text-sm text-ink-800 mt-1 bg-ink-50 rounded-lg p-3">{c.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : <p className="muted text-sm">Be the first to comment.</p>}

        {user && (
          <div className="mt-5 pt-5 border-t border-ink-100">
            <div className="flex gap-3">
              <Avatar name={user.full_name} src={user.avatar_url} size={36} />
              <div className="flex-1">
                <textarea rows={3} className="input" placeholder="Add a comment…" value={comment} onChange={(e) => setComment(e.target.value)} />
                <div className="flex justify-end mt-2"><button onClick={addComment} disabled={busy || !comment.trim()} className="btn-primary btn-sm"><FiSend /> {busy ? 'Posting…' : 'Comment'}</button></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
