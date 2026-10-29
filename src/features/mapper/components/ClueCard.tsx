import { Artwork } from '../../../shared/components/Artwork'
import type { Clue } from '../domain/puzzle'

export function ClueCard({ clue }: { clue: Clue }) {
  if (clue.kind === 'artwork') {
    return (
      <li className="relative animate-rise overflow-hidden rounded-2xl bg-raised ring-1 ring-line">
        <Artwork setId={clue.setId} eager className="aspect-[800/280] w-full" alt="Background of a set this mapper hosted" />
        <p className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-sm font-medium backdrop-blur">
          {clue.label}
        </p>
      </li>
    )
  }

  return (
    <li className="animate-rise rounded-2xl bg-surface px-4 py-3 ring-1 ring-line">
      <p className="text-sm text-muted">{clue.label}</p>
      <p className="truncate text-xl font-semibold">{clue.value}</p>
    </li>
  )
}
