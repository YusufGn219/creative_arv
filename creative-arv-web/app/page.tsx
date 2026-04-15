import RightSidebar from '@/components/layout/RightSidebar'

export default function Home() {
  return (
    <div className="flex gap-8">
      <div className="flex-1">
        <h1 className="font-serif text-4xl text-foreground mb-4">
          Keşfet
        </h1>
        <p className="text-foreground-muted">
          İçerikler burada listelenecek.
        </p>
      </div>
      <RightSidebar />
    </div>
  )
}