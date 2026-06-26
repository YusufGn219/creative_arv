'use client'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { LeftSidebar } from '@/components/layout/LeftSidebar'
import { RightSidebar } from '@/components/layout/RightSidebar'

const FULLSCREEN_PATHS = ['/login', '/register', '/articles/new', '/forums/new']

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isFullscreen =
    FULLSCREEN_PATHS.includes(pathname) ||
    pathname.endsWith('/edit') ||
    pathname.endsWith('/posts/new')

  const isReading =
    (pathname.startsWith('/articles/') && pathname !== '/articles') ||
    !!pathname.match(/\/forums\/[^/]+\/posts\/[^/]+/)

  const isThreeCol =
    pathname === '/' ||
    (pathname.startsWith('/forums/') && !pathname.match(/\/posts\//))

  if (isFullscreen) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[var(--bg)]">{children}</main>
      </>
    )
  }

  if (isReading) {
    return (
      <>
        <Navbar />
        <div className="flex h-[calc(100vh-48px)] overflow-hidden">
          <main className="flex-1 min-h-0 overflow-y-auto bg-[var(--read-bg)]">{children}</main>
        </div>
      </>
    )
  }

  if (isThreeCol) {
    return (
      <>
        <Navbar />
        <div className="flex h-[calc(100vh-48px)] overflow-hidden">
          <LeftSidebar />
          <main className="flex-1 min-h-0 overflow-y-auto bg-[var(--bg)]">{children}</main>
          <RightSidebar />
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-48px)] overflow-hidden">
        <LeftSidebar />
        <main className="flex-1 min-h-0 overflow-y-auto bg-[var(--bg)]">{children}</main>
      </div>
    </>
  )
}
