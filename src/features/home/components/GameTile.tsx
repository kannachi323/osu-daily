import type { ReactNode } from 'react'
import type { GameInfo } from '../../../app/games'
import { Link } from '../../../app/Link'
import { Artwork } from '../../../shared/components/Artwork'
import { ArrowRight, Check } from '../../../shared/components/icons'
import type { DayResult } from '../../../shared/progress/records'

interface GameTileProps {
  game: GameInfo
  artworkSetId: number
  glyph: ReactNode
  result?: DayResult
  inProgress: boolean
  index: number
}

function statusLabel(game: GameInfo, result: DayResult | undefined, inProgress: boolean): string {
  if (result) return game.id === 'backdrop' || game.id === 'mapper' ? (result.won ? 'Solved' : 'Missed') : `${result.score}/${result.maxScore}`
  return inProgress ? 'Continue' : 'Play'
}

export function GameTile({ game, artworkSetId, glyph, result, inProgress, index }: GameTileProps) {
  const done = result !== undefined
  const status = statusLabel(game, result, inProgress)
  return (
    <Link
      to={game.path}
      aria-label={`${game.name}: ${game.tagline}. ${status}`}
      className="group relative isolate flex min-h-52 animate-rise flex-col justify-between overflow-hidden rounded-[1.75rem] p-5 ring-1 ring-line transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgb(255_79_154/0.45)] hover:ring-white/20 active:scale-[0.985] sm:min-h-64 sm:p-7"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <Artwork
        setId={artworkSetId}
        eager
        className="absolute inset-0 -z-10 size-full transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-105"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/75 to-ink/20" />

      <div className="flex items-start justify-between">
        <span className="grid size-12 place-items-center rounded-2xl bg-black/45 text-2xl text-fg ring-1 ring-white/15 backdrop-blur-md">
          {glyph}
        </span>
        <span
          className={`tabular inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold backdrop-blur-md ${
            done ? 'bg-white/90 text-ink' : 'bg-black/45 text-fg ring-1 ring-white/15'
          }`}
        >
          {done && <Check />}
          {status}
        </span>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{game.name}</h2>
          <p className="mt-1 text-base text-white/75">{game.tagline}</p>
        </div>
        <span
          aria-hidden="true"
          className={`grid size-14 shrink-0 place-items-center rounded-full text-2xl transition-transform duration-300 group-hover:translate-x-1 ${
            done ? 'bg-white/15 text-fg' : 'bg-pink text-pink-ink'
          }`}
        >
          <ArrowRight />
        </span>
      </div>
    </Link>
  )
}
