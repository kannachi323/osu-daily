import { useState } from 'react'
import type { Mapper } from '../../../shared/data/types'

/** A mystery avatar ring that turns into the mapper's osu! avatar once the round ends. */
export function MapperHero({ mapper, revealed }: { mapper: Mapper; revealed: boolean }) {
  const [avatarFailed, setAvatarFailed] = useState(false)
  return (
    <div className="flex items-center gap-5 py-2">
      <div className="relative size-24 shrink-0 sm:size-28">
        <div
          className={`absolute inset-0 rounded-full border-[5px] ${revealed ? 'border-pink' : 'border-pink/70 motion-safe:animate-pulse'}`}
        />
        <div className="absolute inset-[9px] grid place-items-center overflow-hidden rounded-full bg-raised">
          {revealed && !avatarFailed ? (
            <img
              src={`https://a.ppy.sh/${mapper.id}`}
              alt={`${mapper.username}’s avatar`}
              referrerPolicy="no-referrer"
              onError={() => setAvatarFailed(true)}
              className="size-full animate-pop object-cover"
            />
          ) : (
            <span aria-hidden="true" className="text-4xl font-extrabold text-muted">
              {revealed ? mapper.username[0] : '?'}
            </span>
          )}
        </div>
      </div>
      <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight sm:text-3xl">
        {revealed ? mapper.username : 'Who’s the mapper?'}
      </h2>
    </div>
  )
}
