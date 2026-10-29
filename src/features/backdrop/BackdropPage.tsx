import { useMemo } from 'react'
import type { GamePageProps } from '../../app/games'
import { nextDestination } from '../../app/todayProgress'
import { AnswerCard } from '../../shared/components/AnswerCard'
import { GameLayout, Pips } from '../../shared/components/GameLayout'
import { GuessList } from '../../shared/components/GuessList'
import { GuessSearch } from '../../shared/components/GuessSearch'
import { HintChips } from '../../shared/components/HintChips'
import { ResultPanel } from '../../shared/components/ResultPanel'
import { beatmapsetUrl, dataset, findBeatmapset } from '../../shared/data/dataset'
import type { Beatmapset } from '../../shared/data/types'
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
import { MysteryArtwork } from './components/MysteryArtwork'
import { artworkView, BACKDROP_GUESSES, backdropHints, createBackdropPuzzle, revealedHints } from './domain/puzzle'

const store = createProgressStore('backdrop', isGuessState)
const VERDICTS = ['So close', 'Clutch', 'Got there', 'Nice read', 'Sharp eyes', 'Great eye', 'Instant']

const entries: SearchEntry<Beatmapset>[] = [...dataset.beatmapsets]
  .sort((a, b) => b.playCount - a.playCount)
  .map((set) => ({ item: set, text: `${set.title} ${set.artist}` }))

export function BackdropPage({ day, today, isArchive }: GamePageProps) {
  const puzzle = useMemo(() => createBackdropPuzzle(dataset, day), [day])
  const answerId = puzzle.answer.id
  const { record, stats, save } = useDailyRecord(store, day, puzzle.signature, initialGuessState, today, BACKDROP_GUESSES)
  const progress = guessProgress(record.state, answerId, BACKDROP_GUESSES)
  const marks = guessMarks(record.state, answerId, BACKDROP_GUESSES)

  function guess(id: number | null) {
    const state = makeGuess(record.state, answerId, BACKDROP_GUESSES, id)
    if (state === record.state) return
    const done = guessProgress(state, answerId, BACKDROP_GUESSES).finished
    save(state, done ? guessResult(state, answerId, BACKDROP_GUESSES, today) : undefined)
  }

  const wrongLabels = record.state.guesses
    .filter((id) => id !== answerId)
    .map((id) => (id === null ? null : findBeatmapset(dataset, id).title))
  const lastGuess = record.state.guesses.at(-1)
  const announcement =
    lastGuess === undefined
      ? ''
      : progress.solved
        ? `Correct! It was ${puzzle.answer.title}.`
        : progress.finished
          ? `Out of guesses. It was ${puzzle.answer.title}.`
          : `${lastGuess === null ? 'Skipped' : 'Not it'}. ${progress.remaining} guesses left. New hint: ${revealedHints(puzzle.answer, progress.misses).at(-1)?.value}.`

  return (
    <GameLayout
      name="Backdrop"
      puzzleNumber={puzzleNumberOf(day)}
      isArchive={isArchive}
      progress={<Pips marks={marks} current={progress.finished ? undefined : record.state.guesses.length} />}
    >
      <div className="space-y-5">
        <MysteryArtwork
          setId={answerId}
          view={artworkView(progress.misses, progress.finished)}
          focus={puzzle.focus}
          revealed={progress.finished}
        />
        <p role="status" aria-live="polite" className="sr-only">
          {announcement}
        </p>

        {progress.finished ? (
          <ResultPanel
            gameName="Backdrop"
            puzzleNumber={puzzleNumberOf(day)}
            scoreLabel={guessScoreLabel(record.state, answerId, BACKDROP_GUESSES)}
            verdict={progress.solved ? VERDICTS[BACKDROP_GUESSES - progress.misses] : 'Not this time'}
            marks={marks}
            stats={stats}
            showWinRate
            next={isArchive ? { to: '/archive', label: 'Archive' } : nextDestination('backdrop', day)}
          >
            <AnswerCard
              setId={answerId}
              title={puzzle.answer.title}
              subtitle={`${puzzle.answer.artist} · mapped by ${puzzle.answer.creator}`}
              href={beatmapsetUrl(answerId)}
              linkLabel="View set"
            />
          </ResultPanel>
        ) : (
          <>
            <HintChips hints={revealedHints(puzzle.answer, progress.misses)} total={backdropHints(puzzle.answer).length} />
            <GuessSearch
              entries={entries}
              getId={(set) => set.id}
              renderOption={(set) => (
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{set.title}</span>
                  <span className="block truncate text-sm text-muted">{set.artist}</span>
                </span>
              )}
              placeholder="Song title or artist"
              guessed={record.state.guesses}
              onGuess={guess}
              onSkip={() => guess(null)}
              skipLabel={`Skip · ${progress.remaining} left`}
            />
            <GuessList labels={wrongLabels} />
          </>
        )}
      </div>
    </GameLayout>
  )
}
