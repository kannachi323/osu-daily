import { Artwork } from '../../../shared/components/Artwork'
import { Check, Cross } from '../../../shared/components/icons'
import type { TriviaChoice } from '../domain/questions'

export type ChoiceState = 'idle' | 'correct' | 'wrong' | 'missed-answer' | 'dimmed'

const STATE_STYLES: Record<ChoiceState, string> = {
  idle: 'bg-surface ring-line hover:bg-raised hover:ring-white/20 hover:-translate-y-0.5',
  correct: 'bg-hit text-hit-ink ring-hit animate-pop',
  wrong: 'bg-miss text-miss-ink ring-miss animate-shake',
  'missed-answer': 'bg-hit/15 ring-hit text-fg',
  dimmed: 'bg-surface ring-line opacity-45',
}

interface ChoiceButtonProps {
  choice: TriviaChoice
  index: number
  state: ChoiceState
  answered: boolean
  onPick(): void
}

export function ChoiceButton({ choice, index, state, answered, onPick }: ChoiceButtonProps) {
  const icon = state === 'correct' || state === 'missed-answer' ? <Check /> : state === 'wrong' ? <Cross /> : null
  return (
    <button
      type="button"
      onClick={onPick}
      aria-disabled={answered}
      className={`group flex min-h-16 w-full items-center gap-4 rounded-2xl p-2 pr-4 text-left ring-1 transition-[transform,background-color,opacity] duration-200 ${STATE_STYLES[state]} ${answered ? 'cursor-default' : 'active:scale-[0.98]'}`}
    >
      {choice.setId ? (
        <Artwork setId={choice.setId} size="list@2x" className="size-12 shrink-0 rounded-xl" />
      ) : (
        <span
          aria-hidden="true"
          className={`tabular grid size-12 shrink-0 place-items-center rounded-xl text-lg font-semibold ${state === 'idle' || state === 'dimmed' ? 'bg-white/6 text-muted' : 'bg-black/15'}`}
        >
          {index + 1}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-medium leading-snug">{choice.label}</span>
        {answered && choice.reveal && <span className="mt-1 block text-sm font-medium opacity-80">{choice.reveal}</span>}
      </span>
      {icon && <span className="text-2xl">{icon}</span>}
    </button>
  )
}
