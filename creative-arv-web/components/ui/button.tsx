import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'font-medium rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          size === 'md' && 'px-4 py-2 text-sm',
          size === 'sm' && 'px-3 py-1.5 text-xs',
          variant === 'primary' && 'bg-[var(--accent)] text-white hover:bg-[var(--accent-light)]',
          variant === 'secondary' && 'bg-transparent text-[var(--accent)] border border-[var(--accent)] hover:bg-[var(--surface2)]',
          variant === 'ghost' && 'bg-transparent text-[var(--text2)] border border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--text3)]',
          variant === 'danger' && 'bg-transparent text-red-400 border border-red-400 hover:bg-red-400/10',
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
