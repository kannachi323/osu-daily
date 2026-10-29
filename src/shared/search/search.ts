/** Lowercases, strips accents and punctuation so "Ievan Polkka" matches "ievan-polkka". */
export function normalizeText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export interface SearchEntry<T> {
  item: T
  /** Text the player is likely to type, e.g. "title artist". */
  text: string
}

/**
 * Every typed word must start a word in the entry. Entries whose first words
 * match the query rank first; ties keep their original order.
 */
export function searchEntries<T>(entries: readonly SearchEntry<T>[], query: string, limit = 6): T[] {
  const queryWords = normalizeText(query).split(' ').filter(Boolean)
  if (queryWords.length === 0) return []

  const scored: { item: T; rank: number; order: number }[] = []
  entries.forEach((entry, order) => {
    const words = normalizeText(entry.text).split(' ')
    const positions = queryWords.map((queryWord) => words.findIndex((word) => word.startsWith(queryWord)))
    if (positions.some((position) => position === -1)) return
    scored.push({ item: entry.item, rank: Math.min(...positions), order })
  })

  return scored
    .sort((a, b) => a.rank - b.rank || a.order - b.order)
    .slice(0, limit)
    .map((result) => result.item)
}
