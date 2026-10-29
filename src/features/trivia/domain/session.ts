import type { DayResult } from '../../../shared/progress/records'
import type { DayKey } from '../../../shared/daily/day'
import type { Mark } from '../../../shared/share/shareText'
import type { TriviaPuzzle } from './puzzle'

export interface TriviaState {
  /** Index of the chosen answer for each question answered so far. */
  answers: number[]
}

export const initialTriviaState: TriviaState = { answers: [] }

export function isTriviaState(value: unknown): value is TriviaState {
  const answers = (value as TriviaState | null)?.answers
  return Array.isArray(answers) && answers.every((answer) => Number.isInteger(answer))
}

export function answerQuestion(puzzle: TriviaPuzzle, state: TriviaState, choiceIndex: number): TriviaState {
  if (isTriviaFinished(puzzle, state)) return state
  const question = puzzle.questions[state.answers.length]
  if (choiceIndex < 0 || choiceIndex >= question.choices.length) return state
  return { answers: [...state.answers, choiceIndex] }
}

export function isTriviaFinished(puzzle: TriviaPuzzle, state: TriviaState): boolean {
  return state.answers.length >= puzzle.questions.length
}

export function triviaMarks(puzzle: TriviaPuzzle, state: TriviaState): Mark[] {
  return puzzle.questions.map((question, index) => {
    const answer = state.answers[index]
    if (answer === undefined) return 'unused'
    return answer === question.answerIndex ? 'hit' : 'miss'
  })
}

export function triviaResult(puzzle: TriviaPuzzle, state: TriviaState, finishedOn: DayKey): DayResult {
  const score = triviaMarks(puzzle, state).filter((mark) => mark === 'hit').length
  return { score, maxScore: puzzle.questions.length, won: score >= 3, finishedOn }
}
