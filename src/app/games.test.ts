import { describe, expect, it } from 'vitest'
import { parseRoute } from './games'

describe('parseRoute', () => {
  it('maps paths to pages', () => {
    expect(parseRoute('/')).toEqual({ page: 'home' })
    expect(parseRoute('/archive')).toEqual({ page: 'archive' })
    expect(parseRoute('/trivia')).toEqual({ page: 'game', gameId: 'trivia' })
    expect(parseRoute('/higher-lower/12/')).toEqual({ page: 'game', gameId: 'higher-lower', puzzleNumber: 12 })
  })

  it('rejects unknown games and bad puzzle numbers', () => {
    expect(parseRoute('/chess')).toEqual({ page: 'not-found' })
    expect(parseRoute('/trivia/0')).toEqual({ page: 'not-found' })
    expect(parseRoute('/trivia/1.5')).toEqual({ page: 'not-found' })
    expect(parseRoute('/trivia/1/extra')).toEqual({ page: 'not-found' })
  })
})
