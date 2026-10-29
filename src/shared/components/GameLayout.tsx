import type { ReactNode } from 'react'
import { Link } from '../../app/Link'
import { ArrowLeft } from './icons'

interface GameLayoutProps {
  name: string
  puzzleNumber: number
  isArchive: boolean
  /** Small progress indicator on the right, e.g. pips. */
  progress?: ReactNode
  children: ReactNode
}

export function GameLayout({ name, puzzleNumber, isArchive, progress, children }: GameLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 pb-16 sm:px-6">
      <div className="sticky top-0 z-20 -mx-4 mb-2 flex h-16 items-center gap-2 bg-ink/85 px-4 backdrop-blur-md sm:-mx-6 sm:mb-4 sm:h-20 sm:gap-3 sm:px-6">
        <Link
          to={isArchive ? '/archive' : '/'}
          aria-label={isArchive ? 'Back to archive' : 'Back to all games'}
          className="-ml-2 grid size-11 place-items-center rounded-full text-2xl text-muted transition-colors hover:bg-white/5 hover:text-fg"
        >
          <ArrowLeft />
        </Link>
        <h1 className="flex min-w-0 items-baseline gap-2 text-lg font-semibold tracking-tight">
          <span className="truncate">{name}</span>
          <span className="tabular font-normal text-muted">#{puzzleNumber}</span>
        </h1>
        <div className="ml-auto">{progress}</div>
      </div>
      {isArchive && (
        <p className="mb-6 rounded-2xl bg-surface px-4 py-3 text-sm text-muted ring-1 ring-line">
          Archive puzzle. Doesn’t count toward your streak.
        </p>
      )}
      {children}
    </div>
  )
}

/** A row of dots showing finished, current and upcoming steps. */
export function Pips({ marks, current }: { marks: ('hit' | 'miss' | 'skip' | 'unused')[]; current?: number }) {
  return (
    <ol className="flex items-center gap-1 sm:gap-2" aria-hidden="true">
      {marks.map((mark, index) => (
        <li
          key={index}
          className={[
            'h-2 rounded-full transition-all duration-300',
            index === current ? 'w-4 bg-fg sm:w-6' : 'w-2',
            mark === 'hit' ? 'bg-hit' : mark === 'miss' ? 'bg-miss' : mark === 'skip' ? 'bg-muted' : index === current ? '' : 'bg-white/15',
          ].join(' ')}
        />
      ))}
    </ol>
  )
}
