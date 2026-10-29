import type { ReactNode } from 'react'
import { Artwork } from './Artwork'

interface AnswerCardProps {
  setId: number
  title: string
  subtitle: ReactNode
  href: string
  linkLabel: string
}

/** The revealed answer, linking out to osu! for the curious. */
export function AnswerCard({ setId, title, subtitle, href, linkLabel }: AnswerCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-raised p-3 ring-1 ring-line">
      <Artwork setId={setId} size="list@2x" className="size-16 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-semibold leading-tight">{title}</p>
        <p className="truncate text-sm text-muted">{subtitle}</p>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 rounded-xl px-3 py-2 text-sm font-semibold text-pink-bright transition-colors hover:bg-white/5"
      >
        {linkLabel}
        <span className="sr-only"> (opens osu! in a new tab)</span>
      </a>
    </div>
  )
}
