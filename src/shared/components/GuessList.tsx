import { Cross, Skip } from './icons'

/** Wrong guesses and skips so far, newest last. */
export function GuessList({ labels }: { labels: (string | null)[] }) {
  if (labels.length === 0) return null
  return (
    <ol className="space-y-2" aria-label="Your guesses">
      {labels.map((label, index) => (
        <li
          key={index}
          className={`flex animate-rise items-center gap-3 rounded-2xl px-4 py-3 ring-1 ${
            label === null ? 'bg-surface text-muted ring-line' : 'bg-miss/10 text-fg ring-miss/40'
          }`}
        >
          <span className={label === null ? 'text-muted' : 'text-miss'}>{label === null ? <Skip /> : <Cross />}</span>
          <span className="truncate">{label ?? 'Skipped'}</span>
        </li>
      ))}
    </ol>
  )
}
