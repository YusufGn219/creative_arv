'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiRequest } from '@/lib/api'

interface Category { id: number; name: string; slug: string }
interface Tag { id: number; name: string; slug: string }

export function LeftSidebar() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)

  useEffect(() => {
    const readParams = () => {
      const p = new URLSearchParams(window.location.search)
      setActiveCategory(p.get('category'))
      setActiveTag(p.get('tag'))
    }
    readParams()
    window.addEventListener('popstate', readParams)
    return () => window.removeEventListener('popstate', readParams)
  }, [])

  useEffect(() => {
    const fetchAll = async () => {
      const [catResult, tagResult] = await Promise.allSettled([
        apiRequest<{ results?: Category[] } | Category[]>('/api/categories/'),
        apiRequest<{ results?: Tag[] } | Tag[]>('/api/tags/'),
      ])

      if (catResult.status === 'fulfilled') {
        const cats = catResult.value
        setCategories((cats as { results?: Category[] }).results ?? (cats as Category[]))
      }
      if (tagResult.status === 'fulfilled') {
        const tgs = tagResult.value
        setTags((tgs as { results?: Tag[] }).results ?? (tgs as Tag[]))
      }

      setLoading(false)
    }
    fetchAll()
  }, [])

  function toggleCategory(slug: string) {
    const next = activeCategory === slug ? null : slug
    setActiveCategory(next)
    setActiveTag(null)
    router.push(next ? `/?category=${next}` : '/')
  }

  function toggleTag(slug: string) {
    const next = activeTag === slug ? null : slug
    setActiveTag(next)
    setActiveCategory(null)
    router.push(next ? `/?tag=${next}` : '/')
  }

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 h-full overflow-y-auto border-r border-[var(--border)] py-4 px-3">
      {loading ? (
        <div className="space-y-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 rounded-md bg-[var(--surface)] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text3)] mb-2 px-2">Kategoriler</p>
          {categories.length === 0 ? (
            <p className="text-xs text-[var(--text3)] px-2">Yükleniyor...</p>
          ) : (
            categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  activeCategory === cat.slug
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--text2)] hover:bg-[var(--surface)] hover:text-[var(--text)]'
                }`}
              >
                {cat.name}
              </button>
            ))
          )}

          {tags.length > 0 && (
            <>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text3)] mt-4 mb-2 px-2">Etiketler</p>
              {tags.slice(0, 8).map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.slug)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    activeTag === tag.slug
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--text2)] hover:bg-[var(--surface)] hover:text-[var(--text)]'
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </>
          )}
        </>
      )}
    </aside>
  )
}

export default LeftSidebar
