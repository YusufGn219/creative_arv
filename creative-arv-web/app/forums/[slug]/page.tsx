'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiRequest } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Forum, Post, PaginatedResponse } from '@/lib/types'

export default function ForumDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user } = useAuth()

  const [forum, setForum] = useState<Forum | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [nextUrl, setNextUrl] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      apiRequest<Forum>(`/api/forums/${slug}/`),
      apiRequest<PaginatedResponse<Post>>(`/api/posts/?forum__slug=${slug}&ordering=-created_at&page=1`),
    ]).then(([f, p]) => {
      setForum(f)
      setPosts(p.results)
      setNextUrl(p.next)
    }).catch(() => setError('Forum bulunamadı.')).finally(() => setLoading(false))
  }, [slug])

  async function loadMore() {
    setLoadingMore(true)
    const next = page + 1
    try {
      const res = await apiRequest<PaginatedResponse<Post>>(`/api/posts/?forum__slug=${slug}&ordering=-created_at&page=${next}`)
      setPosts(prev => [...prev, ...res.results])
      setNextUrl(res.next)
      setPage(next)
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !forum) return (
    <div className="py-12 px-4 text-center">
      <p className="text-[var(--text3)]">{error || 'Forum bulunamadı.'}</p>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 py-6 px-4">
        {/* Forum Başlık */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl text-[var(--text)]">{forum.title}</h1>
              {forum.description && (
                <p className="text-sm text-[var(--text2)] mt-1">{forum.description}</p>
              )}
            </div>
            {user && (
              <Link href={`/forums/${slug}/posts/new`} className="shrink-0">
                <Button size="sm">Post Yaz</Button>
              </Link>
            )}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-[var(--text3)]">
            <span>{forum.post_count} post</span>
            <span>{forum.category?.name ?? 'Genel'}</span>
          </div>
        </div>

        {/* Post Listesi */}
        {posts.length === 0 ? (
          <p className="text-[var(--text3)] text-sm">Henüz post yok.</p>
        ) : (
          <div className="space-y-2">
            {posts.map(post => (
              <Link key={post.id} href={`/forums/${slug}/posts/${post.id}`}>
                <div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors">
                  <p className="text-sm font-medium text-[var(--text)]">{post.title}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text3)]">
                    <span>{post.author?.username}</span>
                    <span>·</span>
                    <span>{new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                    {post.reply_count !== undefined && (
                      <><span>·</span><span>{post.reply_count} yanıt</span></>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {nextUrl && (
          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? 'Yükleniyor...' : 'Daha fazla yükle'}
            </Button>
          </div>
        )}
      </div>

      {/* Sağ Bilgi Paneli */}
      <aside className="w-64 shrink-0 py-6 px-4 border-l border-[var(--border)] hidden lg:block">
        <div className="sticky top-6 space-y-4">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text3)] mb-2">Forum Hakkında</p>
            <p className="text-xs text-[var(--text2)] leading-relaxed">{forum.description || '—'}</p>
          </div>
          {forum.rules && (
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text3)] mb-2">Kurallar</p>
              <p className="text-xs text-[var(--text2)] leading-relaxed whitespace-pre-line">{forum.rules}</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
