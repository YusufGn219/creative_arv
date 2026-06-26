'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { apiRequest } from '@/lib/api'

interface Category { id: number; name: string; slug: string }

export function Navbar() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    if (mobileOpen && categories.length === 0) {
      apiRequest<{ results?: Category[] } | Category[]>('/api/categories/')
        .then(res => setCategories((res as { results?: Category[] }).results ?? (res as Category[])))
        .catch(() => {})
    }
  }, [mobileOpen, categories.length])

  return (
    <>
      <nav className="h-12 bg-[var(--bg)] border-b border-[var(--border)] flex items-center px-4 gap-4 sticky top-0 z-50">
        <Link href="/" className="text-[var(--text)] font-semibold text-sm shrink-0">
          Creative<span className="text-[var(--accent-light)]">Arv</span>
        </Link>

        {/* Masaüstü nav linkleri */}
        <div className="hidden md:flex gap-5 items-center">
          <Link href="/" className="text-[var(--text2)] text-sm hover:text-[var(--text)] transition-colors">Keşfet</Link>
          <Link href="/articles" className="text-[var(--text2)] text-sm hover:text-[var(--text)] transition-colors">Makaleler</Link>
          <Link href="/forums" className="text-[var(--text2)] text-sm hover:text-[var(--text)] transition-colors">Forumlar</Link>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Masaüstü auth */}
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/articles/new" className="text-xs px-3 py-1.5 bg-[var(--accent)] text-white rounded-md font-medium hover:bg-[var(--accent-light)] transition-colors">
                ✍️ Yaz
              </Link>
              <Link href={`/users/${user.username}`}>
                <div className="w-8 h-8 rounded-full bg-[var(--accent)] border-2 border-[var(--border)] cursor-pointer" />
              </Link>
              <button onClick={logout} className="text-xs text-[var(--text3)] hover:text-[var(--text2)] transition-colors">
                Çıkış
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login" className="text-xs px-3 py-1.5 border border-[var(--border)] text-[var(--text2)] rounded-md hover:border-[var(--accent)] hover:text-[var(--text)] transition-colors">
                Giriş Yap
              </Link>
              <Link href="/register" className="text-xs px-3 py-1.5 bg-[var(--accent)] text-white rounded-md font-medium hover:bg-[var(--accent-light)] transition-colors">
                Kayıt Ol
              </Link>
            </div>
          )}

          {/* Hamburger — sadece mobil */}
          <button
            className="md:hidden flex flex-col gap-1 p-1.5"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menü"
          >
            <span className={`block w-5 h-0.5 bg-[var(--text2)] transition-transform duration-200 ${mobileOpen ? 'translate-y-1.5 rotate-45' : ''}`} />
            <span className={`block w-5 h-0.5 bg-[var(--text2)] transition-opacity duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-[var(--text2)] transition-transform duration-200 ${mobileOpen ? '-translate-y-1.5 -rotate-45' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobil menü */}
      {mobileOpen && (
        <div className="md:hidden fixed top-12 inset-x-0 bg-[var(--bg)] border-b border-[var(--border)] z-40 overflow-y-auto max-h-[calc(100vh-48px)]">
          <div className="px-4 py-3 space-y-1">
            {/* Ana linkler */}
            {[
              { href: '/', label: 'Keşfet' },
              { href: '/articles', label: 'Makaleler' },
              { href: '/forums', label: 'Forumlar' },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-md text-sm text-[var(--text2)] hover:bg-[var(--surface)] hover:text-[var(--text)] transition-colors">
                {label}
              </Link>
            ))}

            {/* Kategoriler */}
            {categories.length > 0 && (
              <>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text3)] px-3 pt-3 pb-1">Kategoriler</p>
                {categories.map(cat => (
                  <Link key={cat.id} href={`/?category=${cat.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm text-[var(--text2)] hover:bg-[var(--surface)] hover:text-[var(--text)] transition-colors">
                    {cat.name}
                  </Link>
                ))}
              </>
            )}

            {/* Auth */}
            <div className="pt-3 border-t border-[var(--border)] space-y-1">
              {user ? (
                <>
                  <Link href="/articles/new" onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 rounded-md text-sm text-white bg-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors">
                    ✍️ Yaz
                  </Link>
                  <Link href={`/users/${user.username}`} onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 rounded-md text-sm text-[var(--text2)] hover:bg-[var(--surface)] transition-colors">
                    {user.username}
                  </Link>
                  <button onClick={() => { logout(); setMobileOpen(false) }}
                    className="w-full text-left px-3 py-2.5 rounded-md text-sm text-[var(--text3)] hover:bg-[var(--surface)] transition-colors">
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 rounded-md text-sm text-[var(--text2)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors">
                    Giriş Yap
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 rounded-md text-sm text-white bg-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors">
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
