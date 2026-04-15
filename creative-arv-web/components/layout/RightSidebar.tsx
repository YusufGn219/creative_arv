export default function RightSidebar() {
  return (
    <aside className="w-64 shrink-0 hidden xl:block">
      <div className="sticky top-24 flex flex-col gap-4">

        {/* Trend İçerikler — v2'de API'den çekilecek */}
        <div className="bg-surface rounded-xl p-4 border border-border">
          <p className="text-xs text-foreground-muted uppercase tracking-wider mb-3">
            Trend
          </p>
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="h-3 bg-border rounded w-full animate-pulse" />
                <div className="h-3 bg-border rounded w-2/3 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Aktif Forumlar — v2'de API'den çekilecek */}
        <div className="bg-surface rounded-xl p-4 border border-border">
          <p className="text-xs text-foreground-muted uppercase tracking-wider mb-3">
            Aktif Forumlar
          </p>
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="h-3 bg-border rounded w-full animate-pulse" />
                <div className="h-3 bg-border rounded w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </aside>
  )
}