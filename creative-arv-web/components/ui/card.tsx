import { cn } from '@/lib/utils'

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg p-4 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTag({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] uppercase tracking-widest font-semibold text-[var(--accent2)] mb-1.5">{children}</p>
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-serif text-[var(--text)] font-medium leading-snug mb-1.5">{children}</h3>
}

export function CardMeta({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-3 text-xs text-[var(--text3)]">{children}</div>
}
