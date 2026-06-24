'use client'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="h-12 bg-[var(--bg)] border-b border-[var(--border)] flex items-center px-4 gap-6 sticky top-0 z-50">
      <Link href="/" className="text-[var(--text)] font-semibold text-sm">
        Creative<span className="text-[var(--accent-light)]">Arv</span>
      </Link>
      <div className="flex gap-5 items-center">
        <Link href="/" className="text-[var(--text2)] text-sm hover:text-[var(--text)] transition-colors">Keşfet</Link>
        <Link href="/articles" className="text-[var(--text2)] text-sm hover:text-[var(--text)] transition-colors">Makaleler</Link>
        <Link href="/forums" className="text-[var(--text2)] text-sm hover:text-[var(--text)] transition-colors">Forumlar</Link>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {user ? (
          <>
            <Link href="/articles/new" className="text-xs px-3 py-1.5 bg-[var(--accent)] text-white rounded-md font-medium hover:bg-[var(--accent-light)] transition-colors">
              ✍️ Yaz
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text2)]">{user.username}</span>
              <Link href={`/users/${user.username}`}>
                <div className="w-8 h-8 rounded-full bg-[var(--accent)] border-2 border-[var(--border)] cursor-pointer" />
              </Link>
            </div>
            <button
              onClick={logout}
              className="text-xs text-[var(--text3)] hover:text-[var(--text2)] transition-colors"
            >
              Çıkış
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-xs px-3 py-1.5 border border-[var(--border)] text-[var(--text2)] rounded-md hover:border-[var(--accent)] hover:text-[var(--text)] transition-colors">
              Giriş Yap
            </Link>
            <Link href="/register" className="text-xs px-3 py-1.5 bg-[var(--accent)] text-white rounded-md font-medium hover:bg-[var(--accent-light)] transition-colors">
              Kayıt Ol
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
