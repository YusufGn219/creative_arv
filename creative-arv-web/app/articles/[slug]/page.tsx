'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { apiRequest } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Article, Comment, PaginatedResponse } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'

function extractHeadings(content: object) {
  const headings: { level: number; text: string; id: string }[] = []
  const c = content as { content?: { type: string; attrs?: { level: number }; content?: { text?: string }[] }[] }
  c?.content?.forEach(node => {
    if (node.type === 'heading') {
      const text = node.content?.[0]?.text || ''
      headings.push({ level: node.attrs?.level ?? 2, text, id: text.toLowerCase().replace(/\s+/g, '-') })
    }
  })
  return headings
}

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

function CommentItem({ comment, depth = 0 }: { comment: Comment; depth: number }) {
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  async function submitReply() {
    if (!replyText.trim() || !user) return
    setSubmitting(true)
    try {
      await apiRequest('/api/comments/', {
        method: 'POST',
        auth: true,
        body: { body: replyText, parent: comment.id },
      })
      setReplyText('')
      setShowReply(false)
    } finally {
      setSubmitting(false)
    }
  }

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
      {user && depth < 3 && (
        <button onClick={() => setShowReply(!showReply)} className="text-xs text-[var(--text3)] hover:text-[var(--accent-light)] mt-1">
          Yanıtla
        </button>
      )}
      {showReply && (
        <div className="mt-2 flex gap-2">
          <input
            className="flex-1 px-3 py-1.5 text-xs rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[var(--accent)]"
            placeholder="Yanıtını yaz..."
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            maxLength={500}
          />
          <Button size="sm" onClick={submitReply} disabled={submitting}>Gönder</Button>
        </div>
      )}
      {comment.replies?.map(reply => (
        <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
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

export default function ArticleDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { user } = useAuth()

  const [article, setArticle] = useState<Article | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [commentCount, setCommentCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit],
    editable: false,
    content: article?.content ?? null,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none outline-none text-[var(--text)] leading-relaxed',
      },
    },
  })

  useEffect(() => {
    Promise.all([
      apiRequest<Article>(`/api/articles/${slug}/`),
      apiRequest<PaginatedResponse<Comment> | Comment[]>(`/api/comments/?article=${slug}`),
    ]).then(([art, cmts]) => {
      setArticle(art)
      const list = Array.isArray(cmts) ? cmts : cmts.results
      setComments(list)
      setCommentCount(list.length)
    }).catch(() => setError('Makale bulunamadı.')).finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (editor && article?.content) {
      editor.commands.setContent(article.content)
    }
  }, [editor, article])

  async function submitComment() {
    if (!commentText.trim() || !user) return
    setSubmitting(true)
    try {
      const newComment = await apiRequest<Comment>('/api/comments/', {
        method: 'POST',
        auth: true,
        body: { body: commentText, content_type: 'articles.article', object_id: article?.id },
      })
      setComments(prev => [newComment, ...prev])
      setCommentText('')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !article) return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <p className="text-[var(--text3)]">{error || 'Makale bulunamadı.'}</p>
    </div>
  )

  const headings = extractHeadings(article.content)

  return (
    <div className="flex min-h-full">
      {/* Ana içerik */}
      <div className="flex-1 min-w-0">
        <article className="max-w-3xl mx-auto py-10 px-6">
          <div className="flex items-center gap-3 mb-4 text-sm text-[var(--text3)]">
            <div className="w-8 h-8 rounded-full bg-[var(--accent)]" />
            <span className="text-[var(--text2)] font-medium">{article.author?.username}</span>
            <span>·</span>
            <span>{new Date(article.created_at).toLocaleDateString('tr-TR')}</span>
            <span>·</span>
            <span>{article.reading_time} dk okuma</span>
            {user?.username === article.author?.username && (
              <Link href={`/articles/${slug}/edit`} className="ml-auto text-xs text-[var(--accent-light)] hover:underline">
                Düzenle
              </Link>
            )}
          </div>

          <h1 className="font-serif text-3xl text-[var(--text)] font-medium leading-tight mb-4">{article.title}</h1>

          {(article.category || article.tags?.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-8">
              {article.category && <Badge variant="accent">{article.category.name}</Badge>}
              {article.tags?.map(tag => <Badge key={tag.id} variant="muted">#{tag.name}</Badge>)}
            </div>
          )}

          <EditorContent editor={editor} />

          <div className="mt-10 pt-6 border-t border-[var(--border)]">
            <Button variant="secondary" onClick={() => router.push(`/forums/new?article=${slug}`)}>
              Forumda Tartış
            </Button>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-[var(--text2)] mb-4">{commentCount} Yorum</h3>
            {user && (
              <div className="mb-6">
                <div className="flex gap-2 items-start">
                  <textarea
                    className="flex-1 px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[var(--accent)] resize-none"
                    placeholder="Yorumunu yaz... (max 100 karakter)"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value.slice(0, 100))}
                    rows={2}
                  />
                  <Button size="sm" onClick={submitComment} disabled={submitting || !commentText.trim()}>
                    Gönder
                  </Button>
                </div>
                <p className="text-xs text-[var(--text3)] mt-1">{commentText.length}/100</p>
              </div>
            )}
            {comments.map(c => <CommentItem key={c.id} comment={c} depth={0} />)}
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

      {/* Fixed sağ panel — içerik alanını kapatmaz, üstüne gelir */}
      <div className={`fixed top-12 right-0 h-[calc(100vh-48px)] w-64 bg-[var(--bg)] border-l border-[var(--border)] overflow-y-auto p-4 z-20 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>

          {/* YAZAR — sabit */}
          <div className="mb-5 pb-5 border-b border-[var(--border)]">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text3)] mb-3">Yazar</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] shrink-0" />
              <Link href={`/users/${article.author?.username}`} className="text-sm text-[var(--text2)] hover:text-[var(--text)] truncate transition-colors">
                {article.author?.username}
              </Link>
            </div>
            {article.author?.bio && (
              <p className="text-xs text-[var(--text3)] mt-2 leading-relaxed">{article.author.bio}</p>
            )}
          </div>

          {/* İÇİNDEKİLER — başlık varsa */}
          {headings.length > 0 && (
            <div className="mb-5 pb-5 border-b border-[var(--border)]">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text3)] mb-3">İçindekiler</p>
              <nav className="space-y-1">
                {headings.map((h, i) => (
                  <a key={i} href={`#${h.id}`}
                    className={`block text-xs text-[var(--text2)] hover:text-[var(--text)] transition-colors ${h.level === 3 ? 'pl-3' : ''}`}>
                    {h.text}
                  </a>
                ))}
              </nav>
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
