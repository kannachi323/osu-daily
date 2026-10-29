import { Artwork } from '../../../shared/components/Artwork'
import type { ArtworkView } from '../domain/puzzle'

interface MysteryArtworkProps {
  setId: number
  view: ArtworkView
  focus: { x: number; y: number }
  revealed: boolean
}

/**
 * The beatmap background, cropped and blurred less with every miss. Every
 * blurred view is also zoomed in, which hides the soft edge blur leaves.
 */
export function MysteryArtwork({ setId, view, focus, revealed }: MysteryArtworkProps) {
  return (
    <div
      role="img"
      aria-label={revealed ? 'The full beatmap background' : 'Mystery beatmap background, zoomed in and blurred'}
      className="relative aspect-video overflow-hidden rounded-3xl bg-raised ring-1 ring-line"
    >
      <Artwork
        setId={setId}
        size="fullsize"
        eager
        className="absolute inset-0 size-full transition-[transform,filter] duration-700 ease-[var(--ease-out-soft)]"
        style={{
          transform: `scale(${view.zoom})`,
          transformOrigin: `${focus.x}% ${focus.y}%`,
          filter: view.blur ? `blur(${view.blur}px) saturate(1.1)` : 'none',
        }}
      />
      {!revealed && <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />}
    </div>
  )
}
