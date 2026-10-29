export type Variant = 'primary' | 'light' | 'secondary' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-pink text-pink-ink hover:bg-pink-bright shadow-[0_8px_24px_-8px_var(--color-pink)]',
  light: 'bg-fg text-ink hover:bg-white',
  secondary: 'bg-raised text-fg ring-1 ring-line hover:bg-[#28243a]',
  ghost: 'text-muted hover:text-fg hover:bg-white/5',
}

export const buttonClass = (variant: Variant = 'primary', extra = '') =>
  [
    'inline-flex min-h-14 select-none items-center justify-center gap-2.5 rounded-2xl px-6 text-lg font-semibold',
    'transition-[transform,background-color,box-shadow] duration-150 ease-out active:scale-[0.97]',
    'disabled:pointer-events-none disabled:opacity-40',
    VARIANTS[variant],
    extra,
  ].join(' ')
