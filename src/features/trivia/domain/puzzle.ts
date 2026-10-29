import type { Dataset } from '../../../shared/data/types'
import { createRng, hashString } from '../../../shared/daily/random'
import type { DayKey } from '../../../shared/daily/day'
import { GENERATORS, type QuestionKind, type TriviaQuestion } from './questions'

export const QUESTION_COUNT = 5

export interface TriviaPuzzle {
  day: DayKey
  questions: TriviaQuestion[]
  signature: string
}

/**
 * Five questions of different kinds, each about sets not used earlier that
 * day. Kinds the dataset can't support fairly are skipped.
 */
export function createTriviaPuzzle(data: Dataset, day: DayKey): TriviaPuzzle {
  const rng = createRng(`trivia:${day}`)
  const used = new Set<number>()
  const questions: TriviaQuestion[] = []
  const kinds = rng.shuffle(Object.keys(GENERATORS) as QuestionKind[])

  for (const kind of kinds) {
    if (questions.length === QUESTION_COUNT) break
    for (let attempt = 0; attempt < 5; attempt++) {
      const question = GENERATORS[kind](rng, data, used)
      if (question) {
        questions.push(question)
        break
      }
    }
  }
  if (questions.length < QUESTION_COUNT) throw new Error(`Only ${questions.length} trivia questions for ${day}`)

  const fingerprint = questions.map((question) => question.choices.map((choice) => choice.label).join('|')).join(';')
  return { day, questions, signature: `trivia:${hashString(fingerprint).toString(36)}` }
}
