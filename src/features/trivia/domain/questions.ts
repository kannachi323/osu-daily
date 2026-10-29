import { formatCount, formatLength, songLabel } from '../../../shared/data/dataset'
import type { Beatmapset, Dataset } from '../../../shared/data/types'
import type { Rng } from '../../../shared/daily/random'
import { normalizeText } from '../../../shared/search/search'

export type QuestionKind =
  | 'creator'
  | 'artist'
  | 'rankedYear'
  | 'highestBpm'
  | 'longest'
  | 'mostPlayed'
  | 'earliestRanked'
  | 'source'
  | 'hardestStars'

export interface TriviaChoice {
  label: string
  /** Shown once the question is answered, e.g. the BPM of each option. */
  reveal?: string
  /** Artwork for choices that are beatmapsets. */
  setId?: number
}

export interface TriviaQuestion {
  kind: QuestionKind
  prompt: string
  /** The featured beatmapset, if the question is about one set. */
  subject?: { setId: number; label: string }
  choices: TriviaChoice[]
  answerIndex: number
}

export const CHOICE_COUNT = 4

/** Every generator returns undefined when the dataset can't support a fair question. */
type Generator = (rng: Rng, data: Dataset, used: Set<number>) => TriviaQuestion | undefined

const unused = (data: Dataset, used: Set<number>) => data.beatmapsets.filter((set) => !used.has(set.id))

function withShuffledChoices(
  rng: Rng,
  question: Omit<TriviaQuestion, 'choices' | 'answerIndex'>,
  answer: TriviaChoice,
  others: TriviaChoice[],
): TriviaQuestion {
  const choices = rng.shuffle([answer, ...others])
  return { ...question, choices, answerIndex: choices.indexOf(answer) }
}

const wordsOf = (value: string) => normalizeText(value).split(' ').filter((word) => word !== 'feat')

/** True when two names share a word, e.g. "Kenshi Yonezu" and "Yonezu Kenshi". */
export function namesOverlap(a: string, b: string): boolean {
  const words = new Set(wordsOf(a))
  return wordsOf(b).some((word) => words.has(word))
}

/** Distinct values that can't be confused with `answer`, drawn in random order. */
function distractors(rng: Rng, values: string[], answer: string, count = CHOICE_COUNT - 1): string[] | undefined {
  const seen = new Set([normalizeText(answer)])
  const picked: string[] = []
  for (const value of rng.shuffle(values)) {
    const key = normalizeText(value)
    if (seen.has(key) || namesOverlap(value, answer)) continue
    seen.add(key)
    picked.push(value)
    if (picked.length === count) return picked
  }
  return undefined
}

const creator: Generator = (rng, data, used) => {
  const subject = rng.pick(unused(data, used))
  const others = distractors(rng, data.beatmapsets.map((set) => set.creator), subject.creator)
  if (!others) return undefined
  used.add(subject.id)
  return withShuffledChoices(
    rng,
    { kind: 'creator', prompt: 'Who hosted this set?', subject: { setId: subject.id, label: songLabel(subject) } },
    { label: subject.creator },
    others.map((label) => ({ label })),
  )
}

const artist: Generator = (rng, data, used) => {
  const subject = rng.pick(unused(data, used))
  const sameTitle = data.beatmapsets.filter((set) => normalizeText(set.title) === normalizeText(subject.title))
  if (sameTitle.length > 1) return undefined
  const others = distractors(rng, data.beatmapsets.map((set) => set.artist), subject.artist)
  if (!others) return undefined
  used.add(subject.id)
  return withShuffledChoices(
    rng,
    { kind: 'artist', prompt: 'Who made this song?', subject: { setId: subject.id, label: subject.title } },
    { label: subject.artist },
    others.map((label) => ({ label })),
  )
}

const rankedYear: Generator = (rng, data, used) => {
  const subject = rng.pick(unused(data, used))
  const year = Number(subject.rankedDate.slice(0, 4))
  const latestYear = Math.max(...data.beatmapsets.map((set) => Number(set.rankedDate.slice(0, 4))))
  const nearby = [-3, -2, -1, 1, 2, 3].map((offset) => year + offset).filter((y) => y >= 2007 && y <= latestYear)
  const years = [year, ...rng.shuffle(nearby).slice(0, CHOICE_COUNT - 1)].sort((a, b) => a - b)
  if (years.length < CHOICE_COUNT) return undefined
  used.add(subject.id)
  const verb = subject.status === 'approved' ? 'approved' : 'ranked'
  return {
    kind: 'rankedYear',
    prompt: `When was this set ${verb}?`,
    subject: { setId: subject.id, label: songLabel(subject) },
    choices: years.map((y) => ({ label: String(y), reveal: y === year ? subject.rankedDate : undefined })),
    answerIndex: years.indexOf(year),
  }
}

/**
 * Picks sets whose values are clearly apart, so the answer is unambiguous and
 * survives small changes since the snapshot.
 */
function pickSpreadSets(
  rng: Rng,
  pool: Beatmapset[],
  value: (set: Beatmapset) => number,
  isApart: (a: number, b: number) => boolean,
): Beatmapset[] | undefined {
  const picked: Beatmapset[] = []
  for (const set of rng.shuffle(pool)) {
    if (picked.every((other) => isApart(value(set), value(other)))) picked.push(set)
    if (picked.length === CHOICE_COUNT) return picked
  }
  return undefined
}

function superlative(
  kind: QuestionKind,
  prompt: string,
  value: (set: Beatmapset) => number,
  isApart: (a: number, b: number) => boolean,
  reveal: (set: Beatmapset) => string,
  pickLowest = false,
): Generator {
  return (rng, data, used) => {
    const sets = pickSpreadSets(rng, unused(data, used), value, isApart)
    if (!sets) return undefined
    const best = sets.reduce((top, set) => ((pickLowest ? value(set) < value(top) : value(set) > value(top)) ? set : top))
    sets.forEach((set) => used.add(set.id))
    return {
      kind,
      prompt,
      choices: sets.map((set) => ({ label: songLabel(set), reveal: reveal(set), setId: set.id })),
      answerIndex: sets.indexOf(best),
    }
  }
}

const daysOf = (set: Beatmapset) => Date.parse(set.rankedDate) / 86_400_000

/**
 * Sources players would recognise in Latin script. "BMS" names a format, and
 * Touhou arrangements often leave the source blank, so both would be unfair.
 */
const isLatinSource = (value: string) => /^[\x20-\x7e]+$/.test(value)
const isQuotableSource = (value: string) => isLatinSource(value) && !['bms', 'touhou'].includes(normalizeText(value))

const source: Generator = (rng, data, used) => {
  const candidates = unused(data, used).filter((set) => isQuotableSource(set.source))
  if (candidates.length === 0) return undefined
  const subject = rng.pick(candidates)
  const sourceKey = normalizeText(subject.source)
  // Distractors with a non-Latin source could name the same work in another script.
  const others = rng
    .shuffle(
      unused(data, used).filter(
        (set) => set.id !== subject.id && isLatinSource(set.source || ' ') && normalizeText(set.source) !== sourceKey,
      ),
    )
    .filter((set, index, list) => list.findIndex((other) => other.title === set.title) === index)
    .slice(0, CHOICE_COUNT - 1)
  if (others.length < CHOICE_COUNT - 1) return undefined
  ;[subject, ...others].forEach((set) => used.add(set.id))
  const toChoice = (set: Beatmapset) => ({ label: songLabel(set), setId: set.id, reveal: set.source || 'No source' })
  return withShuffledChoices(
    rng,
    { kind: 'source', prompt: `Which song is from ${subject.source}?` },
    toChoice(subject),
    others.map(toChoice),
  )
}

export const GENERATORS: Record<QuestionKind, Generator> = {
  creator,
  artist,
  rankedYear,
  source,
  highestBpm: superlative(
    'highestBpm',
    'Which top difficulty has the highest BPM?',
    (set) => set.hardest.bpm,
    (a, b) => Math.abs(a - b) >= 10,
    (set) => `${Math.round(set.hardest.bpm)} BPM`,
  ),
  longest: superlative(
    'longest',
    'Which top difficulty is the longest?',
    (set) => set.hardest.lengthSeconds,
    (a, b) => Math.abs(a - b) >= 15,
    (set) => formatLength(set.hardest.lengthSeconds),
  ),
  mostPlayed: superlative(
    'mostPlayed',
    'Which set has the most plays?',
    (set) => set.playCount,
    (a, b) => Math.max(a, b) / Math.min(a, b) >= 1.5,
    (set) => `${formatCount(set.playCount)} plays`,
  ),
  earliestRanked: superlative(
    'earliestRanked',
    'Which set was ranked first?',
    daysOf,
    (a, b) => Math.abs(a - b) >= 365,
    (set) => set.rankedDate.slice(0, 4),
    true,
  ),
  hardestStars: superlative(
    'hardestStars',
    'Which top difficulty has the most stars?',
    (set) => set.hardest.stars,
    (a, b) => Math.abs(a - b) >= 0.4,
    (set) => `${set.hardest.stars.toFixed(2)}★`,
  ),
}
