'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, MessageSquare, Tag, Grid } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Keşfet', icon: Grid },
  { href: '/articles', label: 'Makaleler', icon: BookOpen },
  { href: '/forums', label: 'Forumlar', icon: MessageSquare },
]

export default function LeftSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 hidden lg:block">
      <div className="sticky top-24 flex flex-col gap-1">

        {/* Ana Navigasyon */}
        <nav className="flex flex-col gap-1 mb-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-surface text-foreground'
                    : 'text-foreground-muted hover:text-foreground hover:bg-surface'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Kategoriler — v3'te API'den çekilecek */}
        <div className="mb-6">
          <p className="text-xs text-foreground-muted uppercase tracking-wider px-3 mb-2">
            Kategoriler
          </p>
          <div className="flex flex-col gap-1">
            {['Teknoloji', 'Edebiyat', 'Akademi'].map((cat) => (
              <span
                key={cat}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground-muted rounded-lg cursor-not-allowed opacity-50"
              >
                <Tag size={14} />
                {cat}
              </span>
            ))}
          </div>
        </div>

      </div>
    </aside>
  )
}