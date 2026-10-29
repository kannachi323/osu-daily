import { Artwork } from '../../../shared/components/Artwork'
import type { Clue } from '../domain/puzzle'

export function ClueCard({ clue, index }: { clue: Clue; index: number }) {
  const number = (
    <span aria-hidden="true" className="tabular text-sm font-bold text-pink-bright">
      {String(index + 1).padStart(2, '0')}
    </span>
  )

  if (clue.kind === 'artwork') {
    return (
      <li className="relative animate-rise overflow-hidden rounded-2xl ring-1 ring-line">
        <Artwork setId={clue.setId} eager className="aspect-[800/280] w-full" alt="Background of a set this mapper hosted" />
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 backdrop-blur">
          {number}
          <span className="text-sm font-medium">{clue.label}</span>
        </div>
      </li>
    )
  }

  return (
    <li className="flex animate-rise items-center gap-4 rounded-2xl bg-surface px-4 py-3.5 ring-1 ring-line">
      {number}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted">{clue.label}</p>
        <p className="truncate text-xl font-semibold">
          {clue.kind === 'country' && (
            <span
              aria-hidden="true"
              className="mr-2 inline-block rounded-md bg-white/10 px-1.5 py-0.5 align-[0.15em] text-xs font-bold tracking-wider text-muted"
            >
              {clue.countryCode}
            </span>
          )}
          {clue.value}
        </p>
      </div>
    </li>
  )
}
