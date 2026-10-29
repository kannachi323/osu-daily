import { formatLength } from '../../../shared/data/dataset'
import type { Beatmapset, Dataset } from '../../../shared/data/types'
import { createRng, pickInRotation } from '../../../shared/daily/random'
import { puzzleNumberOf, type DayKey } from '../../../shared/daily/day'

export const BACKDROP_GUESSES = 6

export interface BackdropPuzzle {
  day: DayKey
  answer: Beatmapset
  /** Where the zoomed view centres, as percentages of the artwork. */
  focus: { x: number; y: number }
  signature: string
}

export interface Hint {
  label: string
  value: string
}

export interface ArtworkView {
  /** CSS scale factor for the cropped artwork. */
  zoom: number
  /** Blur radius in pixels. */
  blur: number
}

/** One view per number of misses; the last one is the clear artwork. */
const VIEWS: ArtworkView[] = [
  { zoom: 3, blur: 16 },
  { zoom: 2.5, blur: 12 },
  { zoom: 2.1, blur: 9 },
  { zoom: 1.7, blur: 5 },
  { zoom: 1.35, blur: 2 },
  { zoom: 1.12, blur: 0 },
  { zoom: 1, blur: 0 },
]

export function createBackdropPuzzle(data: Dataset, day: DayKey): BackdropPuzzle {
  const answer = pickInRotation(data.beatmapsets, 'backdrop', puzzleNumberOf(day))
  const rng = createRng(`backdrop:${day}`)
  const focus = { x: 25 + rng.int(51), y: 30 + rng.int(41) }
  return { day, answer, focus, signature: `backdrop:${answer.id}` }
}

export function artworkView(misses: number, finished: boolean): ArtworkView {
  return finished ? VIEWS[VIEWS.length - 1] : VIEWS[Math.min(misses, VIEWS.length - 2)]
}

/** Hints in reveal order: one more appears after each miss. */
export function backdropHints(answer: Beatmapset): Hint[] {
  return [
    { label: 'Ranked', value: answer.rankedDate.slice(0, 4) },
    { label: 'Length', value: formatLength(answer.hardest.lengthSeconds) },
    { label: 'BPM', value: String(Math.round(answer.hardest.bpm)) },
    { label: 'Mapper', value: answer.creator },
    { label: 'Artist', value: answer.artist },
  ]
}

export function revealedHints(answer: Beatmapset, misses: number): Hint[] {
  return backdropHints(answer).slice(0, misses)
}
