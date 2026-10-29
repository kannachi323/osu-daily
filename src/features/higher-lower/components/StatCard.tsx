import { Artwork } from '../../../shared/components/Artwork'
import { songLabel } from '../../../shared/data/dataset'
import type { Beatmapset } from '../../../shared/data/types'
import type { Stat } from '../domain/puzzle'

export type CardTone = 'neutral' | 'hit' | 'miss'

interface StatCardProps {
  set: Beatmapset
  stat: Stat
  showValue: boolean
  tone: CardTone
}

const TONES: Record<CardTone, string> = {
  neutral: 'ring-line',
  hit: 'ring-2 ring-hit',
  miss: 'ring-2 ring-miss animate-shake',
}

export function StatCard({ set, stat, showValue, tone }: StatCardProps) {
  return (
    <article
      className={`relative isolate flex min-h-44 bg-surface flex-col justify-end overflow-hidden rounded-3xl p-4 ring-1 transition-shadow sm:min-h-72 sm:p-6 ${TONES[tone]}`}
    >
      <Artwork setId={set.id} eager className="absolute inset-0 -z-10 size-full" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/95 via-black/65 to-black/25" />
      <h3 className="line-clamp-2 text-lg font-semibold leading-snug">{songLabel(set)}</h3>
      <p className="mt-1 truncate text-sm text-white/70">
        {set.hardest.name} · {set.creator}
      </p>
      <p className="mt-4 flex items-baseline gap-2" aria-live="off">
        {showValue ? (
          <span key="value" className="tabular animate-pop text-4xl font-bold tracking-tight sm:text-5xl">
            {stat.format(stat.value(set))}
          </span>
        ) : (
          <span className="text-4xl font-bold tracking-tight text-white/35 sm:text-5xl" aria-label="Hidden">
            ?
          </span>
        )}
        <span className="text-base font-medium text-white/70">{stat.name}</span>
      </p>
    </article>
  )
}
