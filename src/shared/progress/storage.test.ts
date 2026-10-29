import { describe, expect, it } from 'vitest'
import { isGuessState, type GuessState } from '../guessing/guesses'
import { createProgressStore, type KeyValueStorage } from './storage'

function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage & { data: Record<string, string> } {
  const data = { ...initial }
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value
    },
  }
}

describe('createProgressStore', () => {
  it('saves each move so a reload resumes mid-game', () => {
    const storage = memoryStorage()
    const store = createProgressStore<GuessState>('backdrop', isGuessState, storage)
    store.save({ day: '2026-11-04', signature: 'backdrop:1', state: { guesses: [5] } })
    store.save({ day: '2026-11-04', signature: 'backdrop:1', state: { guesses: [5, null] } })

    const reloaded = createProgressStore<GuessState>('backdrop', isGuessState, storage)
    expect(reloaded.load()['2026-11-04'].state.guesses).toEqual([5, null])
  })

  it('keeps games and days separate', () => {
    const storage = memoryStorage()
    createProgressStore<GuessState>('a', isGuessState, storage).save({ day: '2026-11-03', signature: 's', state: { guesses: [1] } })
    createProgressStore<GuessState>('a', isGuessState, storage).save({ day: '2026-11-04', signature: 's', state: { guesses: [2] } })
    expect(Object.keys(createProgressStore('a', isGuessState, storage).load())).toEqual(['2026-11-03', '2026-11-04'])
    expect(createProgressStore('b', isGuessState, storage).load()).toEqual({})
  })

  it('ignores corrupted or tampered data', () => {
    const storage = memoryStorage({
      'osu-daily:v1:a': JSON.stringify({
        good: { day: '2026-11-04', signature: 's', state: { guesses: [1] } },
        badDay: { day: 'soon', signature: 's', state: { guesses: [] } },
        badState: { day: '2026-11-05', signature: 's', state: { guesses: ['x'] } },
      }),
      'osu-daily:v1:b': '{not json',
    })
    expect(Object.keys(createProgressStore('a', isGuessState, storage).load())).toEqual(['2026-11-04'])
    expect(createProgressStore('b', isGuessState, storage).load()).toEqual({})
  })

  it('keeps working when storage is unavailable or throws', () => {
    const throwing: KeyValueStorage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('quota')
      },
    }
    const store = createProgressStore<GuessState>('a', isGuessState, throwing)
    expect(() => store.save({ day: '2026-11-04', signature: 's', state: { guesses: [] } })).not.toThrow()
    expect(store.load()).toEqual({})
  })
})
