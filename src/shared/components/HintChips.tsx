interface HintChipsProps {
  hints: { label: string; value: string }[]
  /** Total hint slots, so locked ones show as placeholders. */
  total: number
}

export function HintChips({ hints, total }: HintChipsProps) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label="Hints">
      {Array.from({ length: total }, (_, index) => {
        const hint = hints[index]
        return hint ? (
          <li key={index} className="animate-pop rounded-2xl bg-surface px-3 py-2.5 ring-1 ring-pink/40">
            <span className="block text-xs font-medium uppercase tracking-wider text-muted">{hint.label}</span>
            <span className="block truncate text-base font-semibold">{hint.value}</span>
          </li>
        ) : (
          <li
            key={index}
            aria-label="Locked hint"
            className="grid place-items-center rounded-2xl border border-dashed border-white/12 px-3 py-2.5 text-muted/70"
          >
            <span aria-hidden="true" className="text-xl font-bold leading-[2.75rem]">
              ?
            </span>
          </li>
        )
      })}
    </ul>
  )
}
