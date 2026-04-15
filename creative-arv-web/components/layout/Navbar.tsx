'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PenLine, Compass } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">

        {/* Sol: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-xl text-foreground">
            Creative Arv
          </span>
        </Link>

        {/* Orta: Navigasyon */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            <Compass size={16} />
            Keşfet
          </Link>
          {user && (
            <Link
              href="/articles/new"
              className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
            >
              <PenLine size={16} />
              Yaz
            </Link>
          )}
        </nav>

        {/* Sağ: Auth */}
        <div className="flex items-center gap-3">
          {/* v2'de bildirim ikonu buraya eklenecek */}
          {/* v5'te mesaj ikonu buraya eklenecek */}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer border border-border hover:border-accent-light transition-colors">
                  <AvatarFallback className="bg-surface text-foreground-muted text-sm">
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-surface border-border text-foreground"
              >
                <DropdownMenuItem asChild>
                  <Link href={`/users/${user.username}`} className="cursor-pointer">
                    Profilim
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/users/me" className="cursor-pointer">
                    Ayarlar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/articles/new" className="cursor-pointer">
                    Makale Yaz
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-foreground-muted hover:text-foreground"
                >
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="text-foreground-muted hover:text-foreground">
                <Link href="/login">Giriş Yap</Link>
              </Button>
              <Button asChild className="bg-accent hover:bg-accent-hover text-foreground">
                <Link href="/register">Kayıt Ol</Link>
              </Button>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}