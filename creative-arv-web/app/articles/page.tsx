'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiRequest } from '@/lib/api'
import { Card, CardTag, CardTitle, CardMeta } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Article, PaginatedResponse } from '@/lib/types'

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [nextUrl, setNextUrl] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest<PaginatedResponse<Article>>('/api/articles/?ordering=-created_at&page=1')
      .then(res => { setArticles(res.results); setNextUrl(res.next) })
      .catch(() => setError('İçerikler yüklenemedi.'))
      .finally(() => setLoading(false))
  }, [])

  async function loadMore() {
    setLoadingMore(true)
    const next = page + 1
    try {
      const res = await apiRequest<PaginatedResponse<Article>>(`/api/articles/?ordering=-created_at&page=${next}`)
      setArticles(prev => [...prev, ...res.results])
      setNextUrl(res.next)
      setPage(next)
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) return (
    <div className="py-6 px-4 space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-24 rounded-lg bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
      ))}
    </div>
  )

  if (error) return <p className="text-red-400 text-sm py-6 px-4">{error}</p>

  return (
    <div className="py-6 px-4">
      <h1 className="font-serif text-2xl text-[var(--text)] mb-6">Makaleler</h1>
      {articles.length === 0 ? (
        <p className="text-[var(--text3)] text-sm">Henüz makale yok.</p>
      ) : (
        <div className="space-y-3">
          {articles.map(article => (
            <Link key={article.id} href={`/articles/${article.slug}`}>
              <Card>
                <CardTag>{article.category?.name ?? 'Genel'}</CardTag>
                <CardTitle>{article.title}</CardTitle>
                <CardMeta>
                  <span>{article.author?.username}</span>
                  <span>·</span>
                  <span>{article.reading_time} dk</span>
                  {article.comment_count !== undefined && (
                    <><span>·</span><span>{article.comment_count} yorum</span></>
                  )}
                </CardMeta>
              </Card>
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
  )
}
