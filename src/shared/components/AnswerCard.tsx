import type { ReactNode } from 'react'
import { Artwork } from './Artwork'
import { ArrowUpRight } from './icons'

interface AnswerCardProps {
  setId: number
  title: string
  subtitle: ReactNode
  href: string
  /** Screen-reader name for the link, e.g. "View set". */
  linkLabel: string
}

/** The revealed answer, linking out to osu! for the curious. */
export function AnswerCard({ setId, title, subtitle, href, linkLabel }: AnswerCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-4 rounded-2xl bg-raised p-2 pr-4 ring-1 ring-line transition-colors hover:bg-[#28243a]"
    >
      <Artwork setId={setId} size="list@2x" className="size-16 shrink-0 rounded-xl" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-lg font-semibold leading-tight">{title}</span>
        <span className="mt-1 block truncate text-sm text-muted">{subtitle}</span>
      </span>
      <ArrowUpRight className="shrink-0 text-xl text-muted transition-colors group-hover:text-pink-bright" />
      <span className="sr-only">{linkLabel} on osu! (opens in a new tab)</span>
    </a>
  )
}
