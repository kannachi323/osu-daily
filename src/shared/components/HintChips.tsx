interface HintChipsProps {
  hints: { label: string; value: string }[]
  /** Total hint slots, so locked ones show as placeholders. */
  total: number
}

export function HintChips({ hints, total }: HintChipsProps) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Hints">
      {Array.from({ length: total }, (_, index) => {
        const hint = hints[index]
        return hint ? (
          <li
            key={index}
            className="flex h-11 min-w-0 max-w-full animate-pop items-baseline gap-2 rounded-full bg-surface px-4 py-3 leading-none ring-1 ring-pink/40"
          >
            <span className="shrink-0 text-sm text-muted">{hint.label}</span>
            <span className="truncate font-semibold">{hint.value}</span>
          </li>
        ) : (
          <li
            key={index}
            aria-label="Locked hint"
            className="grid size-11 place-items-center rounded-full border border-dashed border-white/15 font-semibold text-muted"
          >
            <span aria-hidden="true">?</span>
          </li>
        )
      })}
    </ul>
  )
}
