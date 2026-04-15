export default function Home() {
  return (
    <main className="min-h-screen bg-background p-12">

      {/* Renk Paleti Testi */}
      <div className="flex gap-3 mb-8">
        <div className="w-16 h-16 rounded bg-background border border-border" />
        <div className="w-16 h-16 rounded bg-surface" />
        <div className="w-16 h-16 rounded bg-accent" />
        <div className="w-16 h-16 rounded bg-accent-light" />
        <div className="w-16 h-16 rounded bg-foreground" />
      </div>

      {/* Tipografi Testi */}
      <h1 className="font-serif text-5xl text-foreground mb-4">
        Creative Arv
      </h1>
      <h2 className="font-serif text-3xl text-accent-light mb-4">
        Medya ve Teknoloji
      </h2>
      <p className="font-sans text-foreground-muted text-lg mb-4 max-w-xl">
        Yazılımcılar, edebiyatçılar ve akademisyenler için
        derin içerik platformu.
      </p>
      <code className="font-mono text-accent-light text-sm bg-surface px-3 py-1 rounded">
        npm run dev
      </code>

      {/* Buton Testi */}
      <div className="flex gap-3 mt-8">
        <button className="bg-accent hover:bg-accent-hover text-foreground px-6 py-2 rounded-lg font-sans transition-colors">
          Giriş Yap
        </button>
        <button className="border border-border text-foreground-muted hover:text-foreground px-6 py-2 rounded-lg font-sans transition-colors">
          Kayıt Ol
        </button>
      </div>

    </main>
  )
}