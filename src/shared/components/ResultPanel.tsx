import { useState, type ReactNode } from 'react'
import { Link } from '../../app/Link'
import { formatCountdown } from '../daily/day'
import { useCountdown } from '../daily/useToday'
import type { GameStats } from '../progress/records'
import { buildShareText, type Mark } from '../share/shareText'
import { Button } from './Button'
import { buttonClass } from './buttonClass'
import { ArrowRight, Check, Copy, Flame } from './icons'

interface ResultPanelProps {
  gameName: string
  puzzleNumber: number
  scoreLabel: string
  /** One word or two, e.g. "Perfect". */
  verdict: string
  marks: Mark[]
  stats: GameStats
  /** Shows win rate instead of average for solve-or-fail games. */
  showWinRate?: boolean
  /** The answer or other spoilers, shown above the stats. */
  children?: ReactNode
  next: { to: string; label: string }
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Older browsers or insecure contexts: fall back to a hidden textarea.
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const copied = document.execCommand('copy')
    area.remove()
    return copied
  }
}

function averageScore(distribution: number[]): string {
  const total = distribution.reduce((sum, count) => sum + count, 0)
  if (total === 0) return '0'
  const sum = distribution.reduce((acc, count, score) => acc + count * score, 0)
  return (sum / total).toFixed(1)
}

export function ResultPanel(props: ResultPanelProps) {
  const { gameName, puzzleNumber, scoreLabel, verdict, marks, stats, showWinRate, children, next } = props
  const [copied, setCopied] = useState<boolean | undefined>()
  const msLeft = useCountdown()

  async function share() {
    const url = window.location.origin
    setCopied(await copyText(buildShareText({ gameName, puzzleNumber, scoreLabel, marks, url })))
    window.setTimeout(() => setCopied(undefined), 2400)
  }

  const statItems = [
    { label: 'Played', value: String(stats.played) },
    showWinRate
      ? { label: 'Win %', value: stats.played ? String(Math.round((stats.wins / stats.played) * 100)) : '0' }
      : { label: 'Average', value: averageScore(stats.distribution) },
    { label: 'Streak', value: String(stats.currentStreak), icon: <Flame className="text-pink" /> },
    { label: 'Best', value: String(stats.maxStreak) },
  ]

  return (
    <section aria-labelledby="result-heading" className="animate-rise space-y-5">
      <div className="rounded-3xl bg-surface p-6 ring-1 ring-line sm:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">{verdict}</p>
        <h2 id="result-heading" className="tabular mt-1 text-6xl font-extrabold tracking-tight sm:text-7xl">
          {scoreLabel}
        </h2>
        <ol className="mt-5 flex flex-wrap gap-1.5" aria-label="Result by round">
          {marks.map((mark, index) => (
            <li
              key={index}
              aria-label={`Round ${index + 1}: ${mark === 'hit' ? 'correct' : mark === 'miss' ? 'wrong' : mark === 'skip' ? 'skipped' : 'not played'}`}
              className={`size-7 rounded-lg animate-pop ${
                mark === 'hit' ? 'bg-hit' : mark === 'miss' ? 'bg-miss' : mark === 'skip' ? 'bg-muted/60' : 'bg-white/10'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            />
          ))}
        </ol>
        {children && <div className="mt-6">{children}</div>}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button onClick={share} icon={copied ? <Check /> : <Copy />} aria-describedby="share-status">
            {copied ? 'Copied' : 'Share result'}
          </Button>
          <Link to={next.to} className={buttonClass('secondary')}>
            {next.label}
            <ArrowRight />
          </Link>
        </div>
        <p id="share-status" role="status" className="sr-only">
          {copied === true ? 'Result copied to clipboard' : copied === false ? 'Copy failed' : ''}
        </p>
      </div>

      <dl className="grid grid-cols-4 gap-2">
        {statItems.map((item) => (
          <div key={item.label} className="flex flex-col-reverse rounded-2xl bg-surface px-2 py-4 text-center ring-1 ring-line">
            <dt className="mt-0.5 text-xs text-muted">{item.label}</dt>
            <dd className="tabular flex items-center justify-center gap-1 text-2xl font-bold">
              {item.icon}
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="text-center text-muted">
        Next puzzle in <span className="tabular font-semibold text-fg">{formatCountdown(msLeft)}</span>
      </p>
    </section>
  )
}
