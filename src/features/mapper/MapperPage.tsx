import { useMemo } from 'react'
import type { GamePageProps } from '../../app/games'
import { nextDestination } from '../../app/todayProgress'
import { AnswerCard } from '../../shared/components/AnswerCard'
import { GameLayout, Pips } from '../../shared/components/GameLayout'
import { GuessList } from '../../shared/components/GuessList'
import { GuessSearch } from '../../shared/components/GuessSearch'
import { ResultPanel } from '../../shared/components/ResultPanel'
import { dataset, findMapper, songLabel, userUrl } from '../../shared/data/dataset'
import type { Mapper } from '../../shared/data/types'
import { puzzleNumberOf } from '../../shared/daily/day'
import {
  guessMarks,
  guessProgress,
  guessResult,
  guessScoreLabel,
  initialGuessState,
  isGuessState,
  makeGuess,
} from '../../shared/guessing/guesses'
import { createProgressStore } from '../../shared/progress/storage'
import { useDailyRecord } from '../../shared/progress/useDailyRecord'
import type { SearchEntry } from '../../shared/search/search'
import { ClueCard } from './components/ClueCard'
import { MapperHero } from './components/MapperHero'
import { createMapperPuzzle, MAPPER_GUESSES, visibleClueCount } from './domain/puzzle'

const store = createProgressStore('mapper', isGuessState)
const VERDICTS = ['So close', 'Clutch', 'Got there', 'Nice', 'Big brain', 'Instant']

const entries: SearchEntry<Mapper>[] = [...dataset.mappers]
  .sort((a, b) => b.mappingFollowers - a.mappingFollowers)
  .map((mapper) => ({ item: mapper, text: [mapper.username, ...mapper.previousUsernames].join(' ') }))

export function MapperPage({ day, today, isArchive }: GamePageProps) {
  const puzzle = useMemo(() => createMapperPuzzle(dataset, day), [day])
  const answerId = puzzle.answer.id
  const { record, stats, save } = useDailyRecord(store, day, puzzle.signature, initialGuessState, today, MAPPER_GUESSES)
  const progress = guessProgress(record.state, answerId, MAPPER_GUESSES)
  const marks = guessMarks(record.state, answerId, MAPPER_GUESSES)
  const clues = puzzle.clues.slice(0, visibleClueCount(progress.misses, progress.finished))

  function guess(id: number | null) {
    const state = makeGuess(record.state, answerId, MAPPER_GUESSES, id)
    if (state === record.state) return
    const done = guessProgress(state, answerId, MAPPER_GUESSES).finished
    save(state, done ? guessResult(state, answerId, MAPPER_GUESSES, today) : undefined)
  }

  const wrongLabels = record.state.guesses
    .filter((id) => id !== answerId)
    .map((id) => (id === null ? null : (findMapper(dataset, id)?.username ?? 'Unknown')))
  const announcement =
    record.state.guesses.length === 0
      ? ''
      : progress.solved
        ? `Correct! It was ${puzzle.answer.username}.`
        : progress.finished
          ? `Out of guesses. It was ${puzzle.answer.username}.`
          : `Not them. New clue revealed. ${progress.remaining} guesses left.`

  return (
    <GameLayout
      name="Mapper"
      puzzleNumber={puzzleNumberOf(day)}
      isArchive={isArchive}
      progress={<Pips marks={marks} current={progress.finished ? undefined : record.state.guesses.length} />}
    >
      <div className="space-y-5">
        <MapperHero mapper={puzzle.answer} revealed={progress.finished} />
        <ol className="space-y-2" aria-label="Clues">
          {clues.map((clue, index) => (
            <ClueCard key={clue.kind} clue={clue} index={index} />
          ))}
        </ol>
        <p role="status" aria-live="polite" className="sr-only">
          {announcement}
        </p>

        {progress.finished ? (
          <ResultPanel
            gameName="Mapper"
            puzzleNumber={puzzleNumberOf(day)}
            scoreLabel={guessScoreLabel(record.state, answerId, MAPPER_GUESSES)}
            verdict={progress.solved ? VERDICTS[MAPPER_GUESSES - progress.misses] : 'Not this time'}
            marks={marks}
            stats={stats}
            showWinRate
            next={isArchive ? { to: '/archive', label: 'Archive' } : nextDestination('mapper', day)}
          >
            <AnswerCard
              setId={puzzle.featuredSet.id}
              title={puzzle.answer.username}
              subtitle={songLabel(puzzle.featuredSet)}
              href={userUrl(answerId)}
              linkLabel="Profile"
            />
          </ResultPanel>
        ) : (
          <>
            <GuessSearch
              entries={entries}
              getId={(mapper) => mapper.id}
              renderOption={(mapper) => (
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{mapper.username}</span>
                  {mapper.previousUsernames.length > 0 && (
                    <span className="block truncate text-sm text-muted">
                      formerly {mapper.previousUsernames.slice(0, 2).join(', ')}
                    </span>
                  )}
                </span>
              )}
              placeholder="Mapper name"
              guessed={record.state.guesses}
              onGuess={guess}
              onSkip={() => guess(null)}
              skipLabel={`Next clue · ${progress.remaining} left`}
            />
            <GuessList labels={wrongLabels} />
          </>
        )}
      </div>
    </GameLayout>
  )
}
