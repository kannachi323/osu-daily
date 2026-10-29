import { useEffect, useMemo, useRef, useState } from 'react'
import type { GamePageProps } from '../../app/games'
import { nextDestination } from '../../app/todayProgress'
import { Button } from '../../shared/components/Button'
import { GameLayout, Pips } from '../../shared/components/GameLayout'
import { ArrowDown, ArrowUp } from '../../shared/components/icons'
import { ResultPanel } from '../../shared/components/ResultPanel'
import { dataset } from '../../shared/data/dataset'
import { puzzleNumberOf } from '../../shared/daily/day'
import { createProgressStore } from '../../shared/progress/storage'
import { useDailyRecord } from '../../shared/progress/useDailyRecord'
import { StatCard, type CardTone } from './components/StatCard'
import { createHigherLowerPuzzle, ROUNDS, type StatKey } from './domain/puzzle'
import {
  higherLowerMarks,
  higherLowerResult,
  initialHigherLowerState,
  isCallCorrect,
  isHigherLowerFinished,
  isHigherLowerState,
  makeCall,
  streakOf,
  type Call,
} from './domain/session'

const store = createProgressStore('higher-lower', isHigherLowerState)
const REVEAL_MS = 1100

const QUESTIONS: Record<StatKey, string> = {
  playCount: 'More plays or fewer?',
  favouriteCount: 'More favourites or fewer?',
  bpm: 'Higher BPM or lower?',
  length: 'Longer or shorter?',
  stars: 'More stars or fewer?',
}

function verdict(score: number): string {
  if (score === ROUNDS) return 'Flawless'
  if (score >= 7) return 'Huge run'
  if (score >= 4) return 'Good run'
  return score > 0 ? 'Short run' : 'Unlucky'
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function HigherLowerPage({ day, today, isArchive }: GamePageProps) {
  const puzzle = useMemo(() => createHigherLowerPuzzle(dataset, day), [day])
  const { record, stats, save } = useDailyRecord(store, day, puzzle.signature, initialHigherLowerState, today, ROUNDS)
  const { calls } = record.state
  // Round whose answer is on screen; null while waiting for a call.
  const [revealing, setRevealing] = useState<number | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const finished = isHigherLowerFinished(puzzle, record.state)
  const round = revealing ?? calls.length
  const showResult = finished && revealing === null
  const marks = higherLowerMarks(puzzle, record.state)
  const pips = Array.from({ length: ROUNDS }, (_, index) => marks[index] ?? 'unused')

  function call(direction: Call) {
    if (revealing !== null || finished) return
    const state = makeCall(puzzle, record.state, direction)
    save(state, isHigherLowerFinished(puzzle, state) ? higherLowerResult(puzzle, state, today) : undefined)
    setRevealing(calls.length)
    timer.current = window.setTimeout(() => setRevealing(null), prefersReducedMotion() ? 600 : REVEAL_MS)
  }

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    if (showResult) return
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'h') {
        event.preventDefault()
        call('higher')
      } else if (event.key === 'ArrowDown' || event.key.toLowerCase() === 'l') {
        event.preventDefault()
        call('lower')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const current = puzzle.chain[Math.min(round, ROUNDS - 1)]
  const next = puzzle.chain[Math.min(round + 1, ROUNDS)]
  const revealedCorrect = revealing !== null && isCallCorrect(puzzle, revealing, calls[revealing])
  const nextTone: CardTone = revealing === null ? 'neutral' : revealedCorrect ? 'hit' : 'miss'
  const announcement =
    revealing === null
      ? ''
      : `${revealedCorrect ? 'Correct' : 'Wrong'}: ${puzzle.stat.format(puzzle.stat.value(next))} ${puzzle.stat.name}.`

  const result = finished ? higherLowerResult(puzzle, record.state, today) : undefined

  return (
    <GameLayout
      name="Higher or Lower"
      puzzleNumber={puzzleNumberOf(day)}
      isArchive={isArchive}
      progress={<Pips marks={pips} current={showResult ? undefined : round} />}
    >
      {showResult && result ? (
        <ResultPanel
          gameName="Higher or Lower"
          puzzleNumber={puzzleNumberOf(day)}
          scoreLabel={`${streakOf(puzzle, record.state)}/${ROUNDS}`}
          verdict={verdict(result.score)}
          marks={higherLowerMarks(puzzle, record.state)}
          stats={stats}
          next={isArchive ? { to: '/archive', label: 'Archive' } : nextDestination('higher-lower', day)}
        />
      ) : (
        <div className="space-y-5">
          <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight sm:text-3xl">{QUESTIONS[puzzle.stat.key]}</h2>
          <div key={round} className="grid animate-rise gap-3 sm:grid-cols-2">
            <StatCard set={current} stat={puzzle.stat} showValue tone="neutral" />
            <StatCard set={next} stat={puzzle.stat} showValue={revealing !== null} tone={nextTone} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => call('higher')}
              disabled={revealing !== null}
              icon={<ArrowUp />}
              aria-keyshortcuts="ArrowUp H"
              className="min-h-16 text-xl"
            >
              Higher
            </Button>
            <Button
              onClick={() => call('lower')}
              disabled={revealing !== null}
              icon={<ArrowDown />}
              aria-keyshortcuts="ArrowDown L"
              className="min-h-16 text-xl"
            >
              Lower
            </Button>
          </div>
          <p role="status" aria-live="polite" className="sr-only">
            {announcement}
          </p>
          {puzzle.stat.isSnapshot && (
            <p className="text-center text-sm text-muted">Counts as of {dataset.snapshotDate}</p>
          )}
        </div>
      )}
    </GameLayout>
  )
}
