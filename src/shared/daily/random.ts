/**
 * Small seeded random number generator. The same seed string always produces
 * the same sequence on every device, which is what keeps daily puzzles shared.
 */
export interface Rng {
  /** Float in [0, 1). */
  next(): number
  /** Integer in [0, max). */
  int(max: number): number
  pick<T>(items: readonly T[]): T
  shuffle<T>(items: readonly T[]): T[]
}

/** FNV-1a 32-bit hash. */
export function hashString(value: string): number {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** mulberry32: tiny, fast and good enough for picking puzzles. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createRng(seed: string): Rng {
  const next = mulberry32(hashString(seed))
  const int = (max: number) => Math.floor(next() * max)
  return {
    next,
    int,
    pick: (items) => {
      if (items.length === 0) throw new Error('Cannot pick from an empty list')
      return items[int(items.length)]
    },
    shuffle: (items) => {
      const copy = [...items]
      for (let index = copy.length - 1; index > 0; index--) {
        const swap = int(index + 1)
        ;[copy[index], copy[swap]] = [copy[swap], copy[index]]
      }
      return copy
    },
  }
}

/**
 * Picks one item per puzzle number by walking a fixed shuffled order, so an
 * item never repeats until every other item has had its day.
 */
export function pickInRotation<T>(items: readonly T[], salt: string, puzzleNumber: number): T {
  if (items.length === 0) throw new Error('Cannot rotate an empty list')
  const order = createRng(`rotation:${salt}`).shuffle(items)
  const index = (((puzzleNumber - 1) % order.length) + order.length) % order.length
  return order[index]
}
