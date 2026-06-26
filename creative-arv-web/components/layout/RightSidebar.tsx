'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiRequest } from '@/lib/api'

interface Article { id: number; title: string; slug: string; category?: { name: string } }
interface Forum { id: number; title: string; slug: string; post_count: number }

export function RightSidebar() {
  const [articles, setArticles] = useState<Article[]>([])
  const [forums, setForums] = useState<Forum[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiRequest<{ results?: Article[] } | Article[]>('/api/articles/?ordering=-created_at&page_size=3'),
      apiRequest<{ results?: Forum[] } | Forum[]>('/api/forums/?ordering=-created_at&page_size=3'),
    ]).then(([arts, fors]) => {
      setArticles((arts as { results?: Article[] }).results ?? (arts as Article[]))
      setForums((fors as { results?: Forum[] }).results ?? (fors as Forum[]))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 h-full overflow-y-auto border-l border-[var(--border)] py-4 px-3">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text3)] mb-3 px-2">Trend</p>
      <div className="space-y-2">
        {loading
          ? [...Array(3)].map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-[var(--surface)] animate-pulse" />
            ))
          : articles.slice(0, 3).map(article => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="block p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
              >
                <p className="text-sm text-[var(--text)] font-medium leading-snug">{article.title}</p>
                {article.category && (
                  <p className="text-xs text-[var(--text3)] mt-1">{article.category.name}</p>
                )}
              </Link>
            ))}
      </div>

      <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text3)] mt-5 mb-3 px-2">Aktif Forumlar</p>
      <div className="space-y-2">
        {loading
          ? [...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-[var(--surface)] animate-pulse" />
            ))
          : forums.slice(0, 3).map(forum => (
              <Link
                key={forum.id}
                href={`/forums/${forum.slug}`}
                className="block p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
              >
                <p className="text-sm text-[var(--text)]">{forum.title}</p>
                <p className="text-xs text-[var(--text3)] mt-1">{forum.post_count} post</p>
              </Link>
            ))}
      </div>
    </aside>
  )
}

export default RightSidebar
