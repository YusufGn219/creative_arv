import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'accent' | 'pink' | 'muted'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'accent', children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      variant === 'accent' && 'bg-[var(--surface)] text-[var(--accent-light)] border-[var(--border)]',
      variant === 'pink' && 'bg-[#c0389a18] text-[var(--accent2)] border-[#c0389a44]',
      variant === 'muted' && 'bg-[var(--surface)] text-[var(--text2)] border-[var(--border)]',
      className
    )}>
      {children}
    </span>
  )
}
