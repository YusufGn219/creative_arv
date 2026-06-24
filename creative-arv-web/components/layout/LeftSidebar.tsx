'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiRequest } from '@/lib/api'

interface Category { id: number; name: string; slug: string }
interface Tag { id: number; name: string; slug: string }

export function LeftSidebar() {
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiRequest<{ results?: Category[] } | Category[]>('/api/categories/'),
      apiRequest<{ results?: Tag[] } | Tag[]>('/api/tags/'),
    ]).then(([cats, tgs]) => {
      setCategories((cats as { results?: Category[] }).results ?? (cats as Category[]))
      setTags((tgs as { results?: Tag[] }).results ?? (tgs as Tag[]))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <aside className="w-60 shrink-0 py-4 px-3 border-r border-[var(--border)] space-y-1">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-8 rounded-md bg-[var(--surface)] animate-pulse" />
      ))}
    </aside>
  )

  return (
    <aside className="w-60 shrink-0 py-4 px-3 border-r border-[var(--border)]">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text3)] mb-2 px-2">Kategoriler</p>
      {categories.map(cat => (
        <Link key={cat.id} href={`/?category=${cat.slug}`}
          className="block px-3 py-2 rounded-md text-sm text-[var(--text2)] hover:bg-[var(--surface)] hover:text-[var(--text)] transition-colors">
          {cat.name}
        </Link>
      ))}
      {tags.length > 0 && (
        <>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text3)] mt-4 mb-2 px-2">Etiketler</p>
          {tags.slice(0, 8).map(tag => (
            <Link key={tag.id} href={`/?tag=${tag.slug}`}
              className="block px-3 py-2 rounded-md text-sm text-[var(--text2)] hover:bg-[var(--surface)] hover:text-[var(--text)] transition-colors">
              #{tag.name}
            </Link>
          ))}
        </>
      )}
    </aside>
  )
}

export default LeftSidebar
