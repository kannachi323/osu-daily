import { dataset } from '../shared/data/dataset'

/** `narrow` lines the footer up with the game column. */
export function SiteFooter({ narrow = false }: { narrow?: boolean }) {
  return (
    <footer className={`mx-auto w-full ${narrow ? 'max-w-2xl' : 'max-w-6xl'} px-4 pb-8 pt-8 text-sm leading-relaxed text-muted sm:px-6`}>
      <div className="space-y-1 border-t border-line pt-6">
        <p>Unofficial fan project, not affiliated with or endorsed by ppy Pty Ltd. Artwork belongs to its creators.</p>
        <p>New puzzles at 00:00 UTC · Data from {dataset.snapshotDate}</p>
      </div>
    </footer>
  )
}
