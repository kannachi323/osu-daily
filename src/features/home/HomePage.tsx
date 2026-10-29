import { useMemo, type ReactNode } from 'react'
import { GAMES, type GameId } from '../../app/games'
import { inProgressForDay, resultsForDay } from '../../app/todayProgress'
import { FrameGlyph, PenGlyph, QuestionGlyph, UpDownGlyph } from '../../shared/components/icons'
import { dataset } from '../../shared/data/dataset'
import { formatCountdown, puzzleNumberOf, type DayKey } from '../../shared/daily/day'
import { useCountdown } from '../../shared/daily/useToday'
import { GameTile } from './components/GameTile'
import { tileArtwork } from './domain/tileArt'

const GLYPHS: Record<GameId, ReactNode> = {
  trivia: <QuestionGlyph />,
  backdrop: <FrameGlyph />,
  'higher-lower': <UpDownGlyph />,
  mapper: <PenGlyph />,
}

function formatDay(day: DayKey): string {
  return new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${day}T00:00:00Z`),
  )
}

export function HomePage({ today }: { today: DayKey }) {
  const artwork = useMemo(() => tileArtwork(dataset, today, GAMES.length), [today])
  const results = resultsForDay(today)
  const inProgress = inProgressForDay(today)
  const doneCount = Object.keys(results).length
  const msLeft = useCountdown()

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
      <section aria-labelledby="today-heading" className="pb-6 pt-6 sm:pb-10 sm:pt-12">
        <p className="tabular text-sm font-semibold uppercase tracking-[0.2em] text-pink-bright">
          No. {puzzleNumberOf(today)}
        </p>
        <h1 id="today-heading" className="mt-2 text-4xl font-extrabold tracking-tight sm:text-6xl">
          {formatDay(today)}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <div
            className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 ring-1 ring-line"
            aria-label={`${doneCount} of ${GAMES.length} games played today`}
          >
            <span aria-hidden="true" className="flex gap-1">
              {GAMES.map((game) => (
                <span key={game.id} className={`size-2 rounded-full ${results[game.id] ? 'bg-pink' : 'bg-white/20'}`} />
              ))}
            </span>
            <span className="tabular text-sm font-semibold">
              {doneCount}/{GAMES.length}
            </span>
          </div>
          <p className="rounded-full bg-surface px-4 py-2 text-sm text-muted ring-1 ring-line">
            New in <span className="tabular font-semibold text-fg">{formatCountdown(msLeft)}</span>
          </p>
        </div>
      </section>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        {GAMES.map((game, index) => (
          <GameTile
            key={game.id}
            game={game}
            index={index}
            artworkSetId={artwork[index]}
            glyph={GLYPHS[game.id]}
            result={results[game.id]}
            inProgress={inProgress.has(game.id)}
          />
        ))}
      </div>
    </div>
  )
}
