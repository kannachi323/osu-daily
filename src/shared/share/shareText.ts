export type Mark = 'hit' | 'miss' | 'skip' | 'unused'

const MARK_SQUARES: Record<Mark, string> = {
  hit: '🟩',
  miss: '🟥',
  skip: '⬜',
  unused: '⬛',
}

export interface ShareInput {
  gameName: string
  puzzleNumber: number
  scoreLabel: string
  marks: Mark[]
  url: string
}

/** Spoiler-free result: only the score and a row of coloured squares. */
export function buildShareText({ gameName, puzzleNumber, scoreLabel, marks, url }: ShareInput): string {
  const squares = marks.map((mark) => MARK_SQUARES[mark]).join('')
  return `osu! daily · ${gameName} #${puzzleNumber} · ${scoreLabel}\n${squares}\n${url}`
}
