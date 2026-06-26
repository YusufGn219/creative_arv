'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiRequest } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Card, CardTitle, CardMeta } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Forum, PaginatedResponse } from '@/lib/types'

export default function ForumsPage() {
  const [forums, setForums] = useState<Forum[]>([])
  const [nextUrl, setNextUrl] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    apiRequest<PaginatedResponse<Forum>>('/api/forums/?ordering=-created_at&page=1')
      .then(res => { setForums(res.results); setNextUrl(res.next) })
      .catch(() => setError('Forumlar yüklenemedi.'))
      .finally(() => setLoading(false))
  }, [])

  async function loadMore() {
    setLoadingMore(true)
    const next = page + 1
    try {
      const res = await apiRequest<PaginatedResponse<Forum>>(`/api/forums/?ordering=-created_at&page=${next}`)
      setForums(prev => [...prev, ...res.results])
      setNextUrl(res.next)
      setPage(next)
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) return (
    <div className="py-6 px-4 space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 rounded-lg bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
      ))}
    </div>
  )

  if (error) return <p className="text-red-400 text-sm py-6 px-4">{error}</p>

  return (
    <div className="py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-[var(--text)]">Forumlar</h1>
        {user && (
          <Link href="/forums/new">
            <Button size="sm">Forum Aç</Button>
          </Link>
        )}
      </div>
      {forums.length === 0 ? (
        <p className="text-[var(--text3)] text-sm">Henüz forum yok.</p>
      ) : (
        <div className="space-y-3">
          {forums.map(forum => (
            <Link key={forum.id} href={`/forums/${forum.slug}`}>
              <Card>
                <CardTitle>{forum.title}</CardTitle>
                {forum.description && (
                  <p className="text-xs text-[var(--text2)] mt-1 line-clamp-2">{forum.description}</p>
                )}
                <CardMeta>
                  <span>{forum.post_count} post</span>
                  <span>·</span>
                  <span>{forum.category?.name ?? 'Genel'}</span>
                  <span>·</span>
                  <span>{new Date(forum.updated_at).toLocaleDateString('tr-TR')}</span>
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
