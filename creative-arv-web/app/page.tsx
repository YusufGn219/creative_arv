'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { apiRequest } from '@/lib/api'
import { Card, CardTag, CardTitle, CardMeta } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Article, Post, PaginatedResponse } from '@/lib/types'

type Tab = 'all' | 'articles' | 'forums'
type FeedItem = { type: 'article'; data: Article; sort_date: string } | { type: 'post'; data: Post; sort_date: string }

const tabs: { key: Tab; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'articles', label: 'Makaleler' },
  { key: 'forums', label: 'Forumlar' },
]

function HomePageContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') ?? ''
  const tag = searchParams.get('tag') ?? ''

  const [tab, setTab] = useState<Tab>('all')
  const [items, setItems] = useState<FeedItem[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)

  const buildQuery = useCallback((base: string, extra: Record<string, string> = {}) => {
    const params = new URLSearchParams(extra)
    const isPost = base.includes('/api/posts/')
    if (category) params.set(isPost ? 'forum__category__slug' : 'category__slug', category)
    if (tag) params.set(isPost ? 'forum__tags__slug' : 'tags__slug', tag)
    return `${base}?${params}`
  }, [category, tag])

  const fetchData = useCallback(async (currentTab: Tab, currentPage: number, reset: boolean) => {
    setLoading(true)
    try {
      if (currentTab === 'all') {
        const [artRes, postRes] = await Promise.all([
          apiRequest<PaginatedResponse<Article>>(buildQuery('/api/articles/', { ordering: '-created_at', page: String(currentPage) })),
          apiRequest<PaginatedResponse<Post>>(buildQuery('/api/posts/', { ordering: '-created_at', page: String(currentPage) })),
        ])
        const merged: FeedItem[] = [
          ...artRes.results.map(a => ({ type: 'article' as const, data: a, sort_date: a.created_at })),
          ...postRes.results.map(p => ({ type: 'post' as const, data: p, sort_date: p.created_at })),
        ].sort((a, b) => b.sort_date.localeCompare(a.sort_date))
        setItems(prev => reset ? merged : [...prev, ...merged])
        setHasMore(!!artRes.next || !!postRes.next)
      } else if (currentTab === 'articles') {
        const res = await apiRequest<PaginatedResponse<Article>>(buildQuery('/api/articles/', { ordering: '-created_at', page: String(currentPage) }))
        const mapped: FeedItem[] = res.results.map(a => ({ type: 'article' as const, data: a, sort_date: a.created_at }))
        setItems(prev => reset ? mapped : [...prev, ...mapped])
        setHasMore(!!res.next)
      } else {
        const res = await apiRequest<PaginatedResponse<Post>>(buildQuery('/api/posts/', { ordering: '-created_at', page: String(currentPage) }))
        const mapped: FeedItem[] = res.results.map(p => ({ type: 'post' as const, data: p, sort_date: p.created_at }))
        setItems(prev => reset ? mapped : [...prev, ...mapped])
        setHasMore(!!res.next)
      }
    } catch {
      // hata durumunda mevcut listeyi koru
    } finally {
      setLoading(false)
    }
  }, [buildQuery])

  useEffect(() => {
    setPage(1)
    fetchData(tab, 1, true)
  }, [tab, fetchData])

  function loadMore() {
    const next = page + 1
    setPage(next)
    fetchData(tab, next, false)
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {(category || tag) && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-[var(--text3)]">Filtre:</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--accent)] text-white">
            {category || `#${tag}`}
          </span>
          <Link href="/" className="text-xs text-[var(--text3)] hover:text-[var(--accent-light)]">× temizle</Link>
        </div>
      )}

      <div className="flex gap-1 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--text2)] hover:bg-[var(--surface)]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && items.length === 0 ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-[var(--text3)] text-sm text-center py-12">Henüz içerik yok.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) =>
            item.type === 'article' ? (
              <Link key={`a-${item.data.id}-${i}`} href={`/articles/${item.data.slug}`}>
                <Card>
                  <CardTag>{item.data.category?.name ?? 'Genel'}</CardTag>
                  <CardTitle>{item.data.title}</CardTitle>
                  <CardMeta>
                    <span>{item.data.author?.username}</span>
                    <span>·</span>
                    <span>{item.data.reading_time ?? '5'} dk okuma</span>
                    {item.data.comment_count !== undefined && (
                      <><span>·</span><span>{item.data.comment_count} yorum</span></>
                    )}
                  </CardMeta>
                </Card>
              </Link>
            ) : (
              <Link key={`p-${item.data.id}-${i}`} href={`/forums/${item.data.forum_slug ?? item.data.forum}/posts/${item.data.id}`}>
                <Card>
                  <CardTag>Forum</CardTag>
                  <CardTitle>{item.data.title}</CardTitle>
                  <CardMeta>
                    <span>{item.data.author?.username}</span>
                    {item.data.comments_count != null && (
                      <><span>·</span><span>{item.data.comments_count} yanıt</span></>
                    )}
                  </CardMeta>
                </Card>
              </Link>
            )
          )}
        </div>
      )}

      {hasMore && !loading && (
        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={loadMore}>Daha fazla yükle</Button>
        </div>
      )}
      {loading && items.length > 0 && (
        <div className="mt-6 text-center">
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto py-6 px-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
        ))}
      </div>
    }>
      <HomePageContent />
    </Suspense>
  )
}
