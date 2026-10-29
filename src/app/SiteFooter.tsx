import { dataset } from '../shared/data/dataset'

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 text-sm text-muted sm:px-6">
      <div className="border-t border-line pt-6 leading-relaxed">
        <p>
          <strong className="font-semibold text-fg">Unofficial fan project.</strong> Not affiliated with or endorsed by
          ppy Pty Ltd. Beatmap artwork belongs to its creators and loads from the osu! servers.
        </p>
        <p className="mt-1">
          New puzzles at 00:00 UTC. Data as of {dataset.snapshotDate}. Progress stays in this browser.
        </p>
      </div>
    </footer>
  )
}
