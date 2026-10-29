import { useState, type CSSProperties } from 'react'
import { coverUrl, type CoverSize } from '../data/dataset'

interface ArtworkProps {
  setId: number
  size?: CoverSize
  /** Empty for decorative artwork next to a text label. */
  alt?: string
  className?: string
  style?: CSSProperties
  eager?: boolean
}

/** Beatmap artwork that fades in once loaded and degrades to a plain panel. */
export function Artwork({ setId, size = 'card@2x', alt = '', className = '', style, eager }: ArtworkProps) {
  const src = coverUrl(setId, size)
  // Keyed by URL so a new set starts hidden again instead of flashing the old state.
  const [settled, setSettled] = useState<{ src: string; ok: boolean } | undefined>()
  const state = settled?.src !== src ? 'loading' : settled.ok ? 'loaded' : 'failed'
  if (state === 'failed') return <div className={`bg-raised ${className}`} style={style} role={alt ? 'img' : undefined} aria-label={alt || undefined} />
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      draggable={false}
      onLoad={() => setSettled({ src, ok: true })}
      onError={() => setSettled({ src, ok: false })}
      className={`bg-raised object-cover transition-opacity duration-500 ${state === 'loaded' ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={style}
    />
  )
}
