import { useEffect, useMemo, useRef, useState } from 'react'
import type { GamePageProps } from '../../app/games'
import { nextDestination } from '../../app/todayProgress'
import { Artwork } from '../../shared/components/Artwork'
import { Button } from '../../shared/components/Button'
import { GameLayout, Pips } from '../../shared/components/GameLayout'
import { ArrowRight } from '../../shared/components/icons'
import { ResultPanel } from '../../shared/components/ResultPanel'
import { dataset } from '../../shared/data/dataset'
import { puzzleNumberOf } from '../../shared/daily/day'
import { createProgressStore } from '../../shared/progress/storage'
import { useDailyRecord } from '../../shared/progress/useDailyRecord'
import { ChoiceButton, type ChoiceState } from './components/ChoiceButton'
import { createTriviaPuzzle, QUESTION_COUNT } from './domain/puzzle'
import {
  answerQuestion,
  initialTriviaState,
  isTriviaFinished,
  isTriviaState,
  triviaMarks,
  triviaResult,
} from './domain/session'

const store = createProgressStore('trivia', isTriviaState)
const VERDICTS = ['Rough day', 'Warming up', 'Not bad', 'Solid', 'Sharp', 'Perfect']

export function TriviaPage({ day, today, isArchive }: GamePageProps) {
  const puzzle = useMemo(() => createTriviaPuzzle(dataset, day), [day])
  const { record, stats, save } = useDailyRecord(store, day, puzzle.signature, initialTriviaState, today, QUESTION_COUNT)
  const { answers } = record.state
  const [viewing, setViewing] = useState(() => answers.length)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const finished = isTriviaFinished(puzzle, record.state)
  const showResult = finished && viewing >= QUESTION_COUNT
  const question = puzzle.questions[Math.min(viewing, QUESTION_COUNT - 1)]
  const picked = answers[viewing]
  const answered = picked !== undefined
  const marks = triviaMarks(puzzle, record.state)

  function pick(choiceIndex: number) {
    if (answered) return
    const state = answerQuestion(puzzle, record.state, choiceIndex)
    save(state, isTriviaFinished(puzzle, state) ? triviaResult(puzzle, state, today) : undefined)
  }

  function advance() {
    setViewing((current) => current + 1)
  }

  useEffect(() => {
    if (viewing > 0) headingRef.current?.focus()
  }, [viewing])

  useEffect(() => {
    if (showResult) return
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.metaKey || event.ctrlKey || event.altKey) return
      const number = Number(event.key)
      if (!answered && number >= 1 && number <= question.choices.length) pick(number - 1)
      else if (answered && (event.key === 'Enter' || event.key === 'ArrowRight')) {
        event.preventDefault()
        advance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function choiceState(index: number): ChoiceState {
    if (!answered) return 'idle'
    if (index === picked) return index === question.answerIndex ? 'correct' : 'wrong'
    return index === question.answerIndex ? 'missed-answer' : 'dimmed'
  }

  const result = finished ? triviaResult(puzzle, record.state, today) : undefined
  const announcement = answered
    ? picked === question.answerIndex
      ? 'Correct.'
      : `Wrong. The answer was ${question.choices[question.answerIndex].label}.`
    : ''

  return (
    <GameLayout
      name="Trivia"
      puzzleNumber={puzzleNumberOf(day)}
      isArchive={isArchive}
      progress={<Pips marks={marks} current={showResult ? undefined : viewing} />}
    >
      {showResult && result ? (
        <ResultPanel
          gameName="Trivia"
          puzzleNumber={puzzleNumberOf(day)}
          scoreLabel={`${result.score}/${QUESTION_COUNT}`}
          verdict={VERDICTS[result.score]}
          marks={marks}
          stats={stats}
          next={isArchive ? { to: '/archive', label: 'Archive' } : nextDestination('trivia', day)}
        />
      ) : (
        <div key={viewing} className="animate-rise space-y-6">
          {question.subject && (
            <figure className="relative overflow-hidden rounded-3xl bg-raised ring-1 ring-line">
              <Artwork setId={question.subject.setId} eager className="aspect-[800/280] w-full" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-12 text-lg font-semibold leading-snug sm:px-6">
                {question.subject.label}
              </figcaption>
            </figure>
          )}
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-semibold leading-tight tracking-tight outline-none sm:text-3xl"
          >
            <span className="sr-only">
              Question {viewing + 1} of {QUESTION_COUNT}:{' '}
            </span>
            {question.prompt}
          </h2>
          <div className="grid gap-3" role="group" aria-label="Answers">
            {question.choices.map((choice, index) => (
              <ChoiceButton
                key={choice.label}
                choice={choice}
                index={index}
                state={choiceState(index)}
                answered={answered}
                onPick={() => pick(index)}
              />
            ))}
          </div>
          <p role="status" aria-live="polite" className="sr-only">
            {announcement}
          </p>
          {answered && (
            <Button variant="light" onClick={advance} className="w-full animate-rise" autoFocus>
              {viewing === QUESTION_COUNT - 1 ? 'See result' : 'Next'}
              <ArrowRight />
            </Button>
          )}
        </div>
      )}
    </GameLayout>
  )
}
