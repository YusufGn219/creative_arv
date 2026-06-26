'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiRequest } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Card, CardTag, CardTitle, CardMeta } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { User, Article, Post, PaginatedResponse } from '@/lib/types'

type Tab = 'articles' | 'posts'

export default function UserProfilePage() {
  const params = useParams()
  const username = params.username as string
  const { user: me } = useAuth()

  const [profile, setProfile] = useState<User | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [tab, setTab] = useState<Tab>('articles')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest<User>(`/api/users/${username}/`)
      .then(setProfile)
      .catch(() => setError('Kullanıcı bulunamadı.'))
      .finally(() => setLoading(false))
  }, [username])

  useEffect(() => {
    if (!profile) return
    if (tab === 'articles') {
      apiRequest<PaginatedResponse<Article>>(`/api/articles/?author=${username}&ordering=-created_at`)
        .then(res => setArticles(res.results))
        .catch(() => {})
    } else {
      apiRequest<PaginatedResponse<Post>>(`/api/posts/?author__username=${username}&ordering=-created_at`)
        .then(res => setPosts(res.results))
        .catch(() => {})
    }
  }, [tab, profile, username])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !profile) return (
    <div className="py-12 px-4 text-center">
      <p className="text-[var(--text3)]">{error || 'Kullanıcı bulunamadı.'}</p>
    </div>
  )

  const isMe = me?.username === username

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Profil Başlığı */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-[var(--accent)] shrink-0 overflow-hidden">
          {profile.avatar_url && (
            <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-xl text-[var(--text)]">
              {profile.first_name} {profile.last_name}
            </h1>
            {isMe && (
              <Link href="/users/me">
                <Button size="sm" variant="ghost">Profili Düzenle</Button>
              </Link>
            )}
          </div>
          <p className="text-sm text-[var(--text3)] mt-0.5">@{profile.username}</p>
          {profile.bio && <p className="text-sm text-[var(--text2)] mt-2 leading-relaxed">{profile.bio}</p>}
          {/* İstatistikler */}
          <div className="flex gap-4 mt-3 text-xs text-[var(--text3)]">
            {profile.article_count !== undefined && <span>{profile.article_count} makale</span>}
            {profile.post_count !== undefined && <span>{profile.post_count} post</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {([['articles', 'Makaleleri'], ['posts', 'Postları']] as [Tab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--text2)] hover:bg-[var(--surface)]'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* İçerik */}
      {tab === 'articles' ? (
        articles.length === 0 ? (
          <p className="text-[var(--text3)] text-sm">Henüz makale yok.</p>
        ) : (
          <div className="space-y-3">
            {articles.map(a => (
              <Link key={a.id} href={`/articles/${a.slug}`}>
                <Card>
                  <CardTag>{a.category?.name ?? 'Genel'}</CardTag>
                  <CardTitle>{a.title}</CardTitle>
                  <CardMeta>
                    <span>{a.reading_time} dk</span>
                    <span>·</span>
                    <span>{new Date(a.created_at).toLocaleDateString('tr-TR')}</span>
                  </CardMeta>
                </Card>
              </Link>
            ))}
          </div>
        )
      ) : (
        posts.length === 0 ? (
          <p className="text-[var(--text3)] text-sm">Henüz post yok.</p>
        ) : (
          <div className="space-y-3">
            {posts.map(p => (
              <Link key={p.id} href={`/forums/${p.forum_slug ?? p.forum}/posts/${p.id}`}>
                <Card>
                  <CardTitle>{p.title}</CardTitle>
                  <CardMeta>
                    <span>{new Date(p.created_at).toLocaleDateString('tr-TR')}</span>
                    {p.reply_count !== undefined && (
                      <><span>·</span><span>{p.reply_count} yanıt</span></>
                    )}
                  </CardMeta>
                </Card>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  )
}
