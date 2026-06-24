'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md border border-[var(--border)] text-[var(--text2)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors"
      aria-label="Tema değiştir"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
