import { describe, expect, it } from 'vitest'
import { dataset } from '../../../shared/data/dataset'
import { normalizeText } from '../../../shared/search/search'
import { daysFrom } from '../../../test/fixtures'
import { createTriviaPuzzle, QUESTION_COUNT } from './puzzle'
import { CHOICE_COUNT, namesOverlap } from './questions'
import { answerQuestion, initialTriviaState, isTriviaFinished, triviaMarks, triviaResult } from './session'

const YEAR = daysFrom('2026-10-28', 365)
const setById = new Map(dataset.beatmapsets.map((set) => [set.id, set]))

describe('createTriviaPuzzle', () => {
  it('is identical for everyone on the same day', () => {
    expect(createTriviaPuzzle(dataset, '2026-11-04')).toEqual(createTriviaPuzzle(dataset, '2026-11-04'))
  })

  it('changes from one day to the next', () => {
    expect(createTriviaPuzzle(dataset, '2026-11-04').signature).not.toBe(
      createTriviaPuzzle(dataset, '2026-11-05').signature,
    )
  })

  it.each(YEAR)('builds five fair questions on %s', (day) => {
    const puzzle = createTriviaPuzzle(dataset, day)
    expect(puzzle.questions).toHaveLength(QUESTION_COUNT)
    expect(new Set(puzzle.questions.map((question) => question.kind)).size).toBe(QUESTION_COUNT)

    for (const question of puzzle.questions) {
      expect(question.choices).toHaveLength(CHOICE_COUNT)
      expect(question.answerIndex).toBeGreaterThanOrEqual(0)
      expect(question.answerIndex).toBeLessThan(CHOICE_COUNT)
      const labels = question.choices.map((choice) => normalizeText(choice.label))
      expect(new Set(labels).size).toBe(CHOICE_COUNT)
    }
  })

  it('never reuses a beatmapset within one day', () => {
    for (const day of YEAR) {
      const ids = createTriviaPuzzle(dataset, day).questions.flatMap((question) => [
        ...(question.subject ? [question.subject.setId] : []),
        ...question.choices.flatMap((choice) => (choice.setId ? [choice.setId] : [])),
      ])
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('marks the right answer for questions computed from the data', () => {
    for (const day of YEAR) {
      for (const question of createTriviaPuzzle(dataset, day).questions) {
        const sets = question.choices.map((choice) => setById.get(choice.setId!)!)
        const answer = sets[question.answerIndex]
        const subject = question.subject && setById.get(question.subject.setId)!
        switch (question.kind) {
          case 'highestBpm':
            expect(Math.max(...sets.map((set) => set.hardest.bpm))).toBe(answer.hardest.bpm)
            break
          case 'longest':
            expect(Math.max(...sets.map((set) => set.hardest.lengthSeconds))).toBe(answer.hardest.lengthSeconds)
            break
          case 'mostPlayed':
            expect(Math.max(...sets.map((set) => set.playCount))).toBe(answer.playCount)
            break
          case 'hardestStars':
            expect(Math.max(...sets.map((set) => set.hardest.stars))).toBe(answer.hardest.stars)
            break
          case 'earliestRanked':
            expect([...sets].sort((a, b) => a.rankedDate.localeCompare(b.rankedDate))[0]).toBe(answer)
            break
          case 'source':
            expect(question.prompt).toContain(answer.source)
            sets.filter((set) => set !== answer).forEach((set) => expect(set.source).not.toBe(answer.source))
            break
          case 'creator':
            expect(question.choices[question.answerIndex].label).toBe(subject!.creator)
            break
          case 'artist':
            expect(question.choices[question.answerIndex].label).toBe(subject!.artist)
            question.choices
              .filter((_, index) => index !== question.answerIndex)
              .forEach((choice) => expect(namesOverlap(choice.label, subject!.artist)).toBe(false))
            break
          case 'rankedYear':
            expect(question.choices[question.answerIndex].label).toBe(subject!.rankedDate.slice(0, 4))
            break
        }
      }
    }
  })
})

describe('trivia session', () => {
  const puzzle = createTriviaPuzzle(dataset, '2026-11-04')
  const correct = puzzle.questions.map((question) => question.answerIndex)
  const wrong = (index: number) => (correct[index] + 1) % CHOICE_COUNT

  it('scores one point per correct answer', () => {
    let state = initialTriviaState
    ;[correct[0], wrong(1), correct[2], correct[3], wrong(4)].forEach((choice) => {
      state = answerQuestion(puzzle, state, choice)
    })
    expect(isTriviaFinished(puzzle, state)).toBe(true)
    expect(triviaMarks(puzzle, state)).toEqual(['hit', 'miss', 'hit', 'hit', 'miss'])
    expect(triviaResult(puzzle, state, '2026-11-04')).toEqual({
      score: 3,
      maxScore: 5,
      won: true,
      finishedOn: '2026-11-04',
    })
  })

  it('ignores answers after the last question and out-of-range choices', () => {
    let state = answerQuestion(puzzle, initialTriviaState, 9)
    expect(state.answers).toEqual([])
    correct.forEach((choice) => {
      state = answerQuestion(puzzle, state, choice)
    })
    expect(answerQuestion(puzzle, state, 0)).toBe(state)
  })

  it('reports unanswered questions in an interrupted session', () => {
    const state = answerQuestion(puzzle, initialTriviaState, correct[0])
    expect(isTriviaFinished(puzzle, state)).toBe(false)
    expect(triviaMarks(puzzle, state)).toEqual(['hit', 'unused', 'unused', 'unused', 'unused'])
  })
})
