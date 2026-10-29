import { GAMES } from '../../app/games'
import { Link } from '../../app/Link'
import { createProgressStore } from '../../shared/progress/storage'
import { addDays, dayKeyOfPuzzle, puzzleNumberOf, type DayKey } from '../../shared/daily/day'

const anyState = (state: unknown): state is unknown => state !== undefined

/** Every past puzzle, newest first. Archive plays are saved but don't count toward streaks. */
export function ArchivePage({ today }: { today: DayKey }) {
  const latestPast = puzzleNumberOf(addDays(today, -1))
  const numbers = Array.from({ length: Math.max(0, latestPast) }, (_, index) => latestPast - index)

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6">
      <h1 className="pb-8 pt-8 text-4xl font-bold tracking-tight sm:pb-12 sm:pt-12 sm:text-5xl">Archive</h1>
      {numbers.length === 0 ? (
        <p className="rounded-3xl bg-surface p-8 text-center text-lg text-muted ring-1 ring-line">
          Past puzzles show up here from tomorrow.
        </p>
      ) : (
        <div className="space-y-8">
          {GAMES.map((game) => {
            const records = createProgressStore(game.id, anyState).load()
            return (
              <section key={game.id} aria-labelledby={`archive-${game.id}`}>
                <h2 id={`archive-${game.id}`} className="mb-4 text-xl font-semibold">
                  {game.name}
                </h2>
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-2">
                  {numbers.map((number) => {
                    const result = records[dayKeyOfPuzzle(number)]?.result
                    return (
                      <li key={number}>
                        <Link
                          to={`${game.path}/${number}`}
                          aria-label={`${game.name} #${number}${result ? `, scored ${result.score} of ${result.maxScore}` : ''}`}
                          className={`tabular flex h-16 flex-col items-center justify-center rounded-2xl text-lg font-semibold ring-1 transition-transform hover:-translate-y-0.5 ${
                            result ? 'bg-pink/15 ring-pink/40' : 'bg-surface ring-line hover:bg-raised'
                          }`}
                        >
                          #{number}
                          {result && (
                            <span className="text-sm font-medium text-pink-bright">
                              {result.score}/{result.maxScore}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
