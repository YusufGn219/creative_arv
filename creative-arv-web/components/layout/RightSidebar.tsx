export function RightSidebar() {
  return (
    <aside className="w-72 shrink-0 py-4 px-3 border-l border-[var(--border)]">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text3)] mb-3 px-2">Trend</p>
      <div className="space-y-2">
        {['Rust ile Sistem Programlama', 'Postmodern Roman Nedir?', 'Kuantum Hesaplama'].map((title, i) => (
          <div key={i} className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] cursor-pointer hover:border-[var(--accent)] transition-colors">
            <p className="text-sm text-[var(--text)] font-medium">{title}</p>
            <p className="text-xs text-[var(--text3)] mt-1">Teknoloji</p>
          </div>
        ))}
      </div>
      <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text3)] mt-5 mb-3 px-2">Aktif Forumlar</p>
      <div className="space-y-2">
        {['AI ve Etik', 'Web Güvenliği'].map((title, i) => (
          <div key={i} className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] cursor-pointer hover:border-[var(--accent)] transition-colors">
            <p className="text-sm text-[var(--text)]">{title}</p>
            <p className="text-xs text-[var(--text3)] mt-1">12 yeni post</p>
          </div>
        ))}
      </div>
    </aside>
  )
}

export default RightSidebar
