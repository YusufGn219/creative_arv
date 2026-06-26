'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { apiRequest } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Post, Forum, Comment, PaginatedResponse } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'

function CollapsibleSection({ title, children, defaultOpen = true }: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 w-full text-left mb-2 group"
      >
        <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors flex-1">
          {title}
        </p>
        <span className="text-[var(--text3)] text-[10px]">{open ? '▾' : '▸'}</span>
      </button>
      {open && children}
    </div>
  )
}

function ReplyInput({ parentId, onDone }: { parentId: number; onDone: () => void }) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  async function submit() {
    if (!text.trim() || !user) return
    setSubmitting(true)
    try {
      await apiRequest('/api/comments/', {
        method: 'POST',
        auth: true,
        body: { body: text, parent: parentId },
      })
      setText('')
      onDone()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-2 flex gap-2">
      <input
        className="flex-1 px-3 py-1.5 text-xs rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[var(--accent)]"
        placeholder="Yanıtını yaz..."
        value={text}
        onChange={e => setText(e.target.value)}
        maxLength={500}
      />
      <Button size="sm" onClick={submit} disabled={submitting || !text.trim()}>Gönder</Button>
    </div>
  )
}

function CommentItem({ comment, depth = 0, onRefresh }: { comment: Comment; depth: number; onRefresh: () => void }) {
  const [showReply, setShowReply] = useState(false)
  const { user } = useAuth()

  return (
    <div className={depth > 0 ? 'border-l-2 border-[var(--border)] pl-4 mt-3' : 'mt-4'}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex-shrink-0" />
        <span className="text-xs font-medium text-[var(--text)]">{comment.author?.username ?? 'Silindi'}</span>
        <span className="text-xs text-[var(--text3)]">{new Date(comment.created_at).toLocaleDateString('tr-TR')}</span>
      </div>
      {comment.is_deleted ? (
        <p className="text-xs text-[var(--text3)] italic">Bu yorum silindi.</p>
      ) : (
        <p className="text-sm text-[var(--text2)] leading-relaxed">{comment.body}</p>
      )}
      {user && (
        <button onClick={() => setShowReply(!showReply)} className="text-xs text-[var(--text3)] hover:text-[var(--accent-light)] mt-1">
          Yanıtla
        </button>
      )}
      {showReply && (
        <ReplyInput parentId={comment.id} onDone={() => { setShowReply(false); onRefresh() }} />
      )}
      {comment.replies?.map(reply => (
        <CommentItem key={reply.id} comment={reply} depth={depth + 1} onRefresh={onRefresh} />
      ))}
    </div>
  )
}

const TREND_ITEMS = [
  { title: 'Rust ile Sistem Programlama', cat: 'Teknoloji' },
  { title: 'Postmodern Roman Nedir?', cat: 'Edebiyat' },
  { title: 'Kuantum Hesaplama', cat: 'Bilim' },
]

const ACTIVE_FORUMS = [
  { title: 'AI ve Etik', posts: 12 },
  { title: 'Web Güvenliği', posts: 8 },
]

export default function PostDetailPage() {
  const params = useParams()
  const forumSlug = params.slug as string
  const postId = params.id as string
  const router = useRouter()
  const { user } = useAuth()

  const [post, setPost] = useState<Post | null>(null)
  const [forum, setForum] = useState<Forum | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const bodyContent = (() => {
    if (!post) return null
    if (typeof post.body === 'object') return post.body
    try { return JSON.parse(post.body as string) } catch { return null }
  })()

  const editor = useEditor({
    extensions: [StarterKit],
    editable: false,
    content: bodyContent,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none outline-none text-[var(--text)] leading-relaxed',
      },
    },
  })

  function loadComments() {
    apiRequest<PaginatedResponse<Comment> | Comment[]>(`/api/comments/?post=${postId}`)
      .then(res => setComments(Array.isArray(res) ? res : res.results))
      .catch(() => {})
  }

  useEffect(() => {
    apiRequest<Post>(`/api/posts/${postId}/`)
      .then(p => {
        setPost(p)
        const slug = p.forum_slug ?? forumSlug
        return apiRequest<Forum>(`/api/forums/${slug}/`)
      })
      .then(f => setForum(f))
      .catch(() => setError('Post bulunamadı.'))
      .finally(() => setLoading(false))
    loadComments()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forumSlug, postId])

  useEffect(() => {
    if (editor && bodyContent) {
      editor.commands.setContent(bodyContent)
    }
  }, [editor, bodyContent])

  async function deletePost() {
    if (!confirm('Bu postu silmek istediğine emin misin?')) return
    try {
      await apiRequest(`/api/posts/${postId}/`, { method: 'DELETE', auth: true })
      router.push(`/forums/${forumSlug}`)
    } catch {
      alert('Silinemedi.')
    }
  }

  async function submitComment() {
    if (!commentText.trim() || !user) return
    setSubmitting(true)
    try {
      await apiRequest('/api/comments/', {
        method: 'POST',
        auth: true,
        body: { body: commentText, content_type: 'forums.post', object_id: post?.id },
      })
      setCommentText('')
      loadComments()
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !post) return (
    <div className="py-12 px-4 text-center">
      <p className="text-[var(--text3)]">{error || 'Post bulunamadı.'}</p>
    </div>
  )

  return (
    <div className="flex min-h-full">
      {/* Ana içerik */}
      <div className="flex-1 min-w-0">
        <article className="max-w-3xl mx-auto py-10 px-6">
          {post.article_ref && (
            <Link href={`/articles/${post.article_ref.slug}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--accent)] text-xs text-[var(--accent-light)] mb-6 hover:bg-[var(--surface)] transition-colors">
              📄 {post.article_ref.title}
            </Link>
          )}

          <div className="flex items-center gap-3 mb-4 text-sm text-[var(--text3)]">
            <div className="w-7 h-7 rounded-full bg-[var(--accent)]" />
            <span className="text-[var(--text2)] font-medium">{post.author?.username}</span>
            <span>·</span>
            <span>{new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
            {user?.username === post.author?.username && (
              <div className="flex gap-2 ml-auto">
                <Link href={`/forums/${forumSlug}/posts/${postId}/edit`}>
                  <Button variant="ghost" size="sm">Düzenle</Button>
                </Link>
                <Button variant="danger" size="sm" onClick={deletePost}>Sil</Button>
              </div>
            )}
          </div>

          <h1 className="font-serif text-2xl text-[var(--text)] font-medium mb-4">{post.title}</h1>

          {forum && (forum.category || forum.tags?.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {forum.category && <Badge variant="accent">{forum.category.name}</Badge>}
              {forum.tags?.map(tag => <Badge key={tag.id} variant="muted">#{tag.name}</Badge>)}
            </div>
          )}

          {bodyContent ? (
            <EditorContent editor={editor} />
          ) : (
            <p className="text-[var(--text2)] leading-relaxed">{post.body as string}</p>
          )}

          <div className="mt-10 pt-6 border-t border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--text2)] mb-4">{comments.length} Yorum</h3>
            {user && (
              <div className="mb-6 flex gap-2">
                <input
                  className="flex-1 px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[var(--accent)]"
                  placeholder="Yorumunu yaz..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  maxLength={500}
                />
                <Button size="sm" onClick={submitComment} disabled={submitting || !commentText.trim()}>
                  Gönder
                </Button>
              </div>
            )}
            {comments.map(c => (
              <CommentItem key={c.id} comment={c} depth={0} onRefresh={loadComments} />
            ))}
          </div>
        </article>
      </div>

      {/* Overlay — panel açıkken */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/20 z-10" />
      )}

      {/* Toggle butonu — fixed, viewport sağ kenarında, top-16 */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-16 w-6 h-10 rounded-l-md bg-[var(--surface)] border border-[var(--border)] border-r-0 flex items-center justify-center text-[var(--text3)] hover:text-[var(--text)] transition-all duration-300 text-sm z-30 ${
          sidebarOpen ? 'right-64' : 'right-0'
        }`}
        aria-label={sidebarOpen ? 'Paneli kapat' : 'Paneli aç'}
      >
        {sidebarOpen ? '›' : '‹'}
      </button>

      {/* Fixed sağ panel */}
      <div className={`fixed top-12 right-0 h-[calc(100vh-48px)] w-64 bg-[var(--bg)] border-l border-[var(--border)] overflow-y-auto p-4 z-20 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>

          {/* FORUM BİLGİSİ — sabit */}
          {forum && (
            <div className="mb-5 pb-5 border-b border-[var(--border)]">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text3)] mb-3">Forum</p>
              <Link
                href={`/forums/${forum.slug}`}
                className="text-sm font-medium text-[var(--text)] hover:text-[var(--accent-light)] transition-colors leading-snug block mb-2"
              >
                {forum.title}
              </Link>
              {forum.description && (
                <p className="text-xs text-[var(--text2)] leading-relaxed mb-3">{forum.description}</p>
              )}
              {forum.category && (
                <Badge variant="accent">{forum.category.name}</Badge>
              )}
              <p className="text-[10px] text-[var(--text3)] mt-2">
                <span className="font-medium text-[var(--text2)]">{forum.post_count}</span> post
              </p>
            </div>
          )}

          {/* TREND — açılır/kapanır */}
          <CollapsibleSection title="Trend">
            <div className="space-y-2">
              {TREND_ITEMS.map((item, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors cursor-pointer">
                  <p className="text-xs text-[var(--text)] font-medium leading-snug">{item.title}</p>
                  <p className="text-[10px] text-[var(--text3)] mt-1">{item.cat}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* AKTİF FORUMLAR — açılır/kapanır */}
          <CollapsibleSection title="Aktif Forumlar">
            <div className="space-y-2">
              {ACTIVE_FORUMS.map((item, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors cursor-pointer">
                  <p className="text-xs text-[var(--text)]">{item.title}</p>
                  <p className="text-[10px] text-[var(--text3)] mt-1">{item.posts} yeni post</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>

      </div>
    </div>
  )
}
