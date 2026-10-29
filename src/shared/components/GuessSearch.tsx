import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { searchEntries, type SearchEntry } from '../search/search'
import { Button } from './Button'
import { Search, Skip } from './icons'

interface GuessSearchProps<T> {
  entries: SearchEntry<T>[]
  getId(item: T): number
  renderOption(item: T): ReactNode
  placeholder: string
  /** IDs already guessed; shown disabled. */
  guessed: (number | null)[]
  onGuess(id: number): void
  onSkip(): void
  skipLabel: string
}

/**
 * Search-as-you-type answer picker (ARIA combobox with a listbox popup).
 * Arrow keys move, Enter picks, Escape closes.
 */
export function GuessSearch<T>(props: GuessSearchProps<T>) {
  const { entries, getId, renderOption, placeholder, guessed, onGuess, onSkip, skipLabel } = props
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const results = useMemo(() => searchEntries(entries, query, 6), [entries, query])
  const showList = open && results.length > 0
  const optionId = (index: number) => `${listId}-option-${index}`

  function pick(item: T) {
    const id = getId(item)
    if (guessed.includes(id)) return
    onGuess(id)
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((current) => (results.length ? (current + step + results.length) % results.length : 0))
    } else if (event.key === 'Enter' && showList) {
      event.preventDefault()
      pick(results[Math.min(active, results.length - 1)])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl text-muted" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList ? optionId(active) : undefined}
          aria-label={placeholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKey}
          className="h-16 w-full rounded-2xl bg-surface pl-14 pr-4 text-lg text-fg ring-1 ring-line outline-none transition-shadow placeholder:text-muted/80 focus:ring-2 focus:ring-pink"
        />
        <ul
          id={listId}
          role="listbox"
          aria-label="Matches"
          hidden={!showList}
          className="absolute inset-x-0 top-full z-30 mt-2 max-h-[22rem] overflow-y-auto rounded-2xl bg-raised p-2 shadow-2xl shadow-black/60 ring-1 ring-line"
        >
          {results.map((item, index) => {
            const isGuessed = guessed.includes(getId(item))
            return (
              <li
                key={getId(item)}
                id={optionId(index)}
                role="option"
                aria-selected={index === active}
                aria-disabled={isGuessed}
                // mousedown keeps focus in the input so blur doesn't close the list first
                onMouseDown={(event) => {
                  event.preventDefault()
                  pick(item)
                }}
                onMouseMove={() => setActive(index)}
                className={[
                  'flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3',
                  index === active ? 'bg-white/8' : '',
                  isGuessed ? 'cursor-not-allowed opacity-40 line-through' : '',
                ].join(' ')}
              >
                {renderOption(item)}
              </li>
            )
          })}
        </ul>
      </div>
      <Button variant="ghost" onClick={onSkip} icon={<Skip />} className="w-full">
        {skipLabel}
      </Button>
    </div>
  )
}
