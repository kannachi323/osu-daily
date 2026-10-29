import type { Beatmapset, Dataset, Mapper } from '../../src/shared/data/types.ts'

/** The fields this project reads from an osu! API v2 `BeatmapsetExtended` with `beatmaps`. */
export interface ApiBeatmapset {
  id: number
  artist: string
  title: string
  creator: string
  user_id: number
  status: string
  ranked_date: string | null
  play_count: number
  favourite_count: number
  source: string
  nsfw?: boolean
  beatmaps?: ApiBeatmap[]
}

export interface ApiBeatmap {
  mode: string
  version: string
  difficulty_rating: number
  bpm: number
  total_length: number
  convert?: boolean
}

/** The fields this project reads from an osu! API v2 `UserExtended`. */
export interface ApiUser {
  id: number
  username: string
  join_date: string
  country: { code: string; name: string }
  mapping_follower_count: number
  previous_usernames?: string[]
}

const PLAYABLE_STATUSES = new Set(['ranked', 'approved'])

export function toBeatmapset(api: ApiBeatmapset): Beatmapset | undefined {
  // Artwork is shown unblurred on tiles, so explicit sets stay out.
  if (!PLAYABLE_STATUSES.has(api.status) || !api.ranked_date || api.nsfw) return undefined
  const standard = (api.beatmaps ?? []).filter((beatmap) => beatmap.mode === 'osu' && !beatmap.convert)
  if (standard.length === 0) return undefined
  const hardest = standard.reduce((top, beatmap) => (beatmap.difficulty_rating > top.difficulty_rating ? beatmap : top))

  return {
    id: api.id,
    artist: api.artist,
    title: api.title,
    creator: api.creator,
    creatorId: api.user_id,
    status: api.status as Beatmapset['status'],
    rankedDate: api.ranked_date.slice(0, 10),
    playCount: api.play_count,
    favouriteCount: api.favourite_count,
    source: api.source.trim(),
    difficultyCount: standard.length,
    hardest: {
      name: hardest.version,
      stars: Math.round(hardest.difficulty_rating * 100) / 100,
      bpm: Math.round(hardest.bpm * 100) / 100,
      lengthSeconds: hardest.total_length,
    },
  }
}

export function toMapper(api: ApiUser): Mapper {
  return {
    id: api.id,
    username: api.username,
    countryCode: api.country.code,
    countryName: api.country.name,
    previousUsernames: api.previous_usernames ?? [],
    joinedYear: Number(api.join_date.slice(0, 4)),
    mappingFollowers: api.mapping_follower_count,
  }
}

function songKey(set: Pick<Beatmapset, 'artist' | 'title'>): string {
  return `${set.artist}\u0000${set.title}`.toLowerCase()
}

/**
 * Builds the bundled dataset. When two sets share a song, the more played one
 * wins, so questions like "who mapped X" always have a single answer. Creator
 * names come from the mapper's current username when it is known.
 */
export function buildDataset(
  apiSets: ApiBeatmapset[],
  apiUsers: ApiUser[],
  snapshotDate: string,
  source: string,
): Dataset {
  const mappers = new Map(apiUsers.map((user) => [user.id, toMapper(user)]))
  const bySong = new Map<string, Beatmapset>()

  for (const apiSet of apiSets) {
    const set = toBeatmapset(apiSet)
    if (!set) continue
    const mapper = mappers.get(set.creatorId)
    if (mapper) set.creator = mapper.username
    const existing = bySong.get(songKey(set))
    if (!existing || existing.playCount < set.playCount) bySong.set(songKey(set), set)
  }

  const beatmapsets = [...bySong.values()].sort((a, b) => a.id - b.id)
  const usedMapperIds = new Set(beatmapsets.map((set) => set.creatorId))

  return {
    version: 1,
    snapshotDate,
    source,
    beatmapsets,
    mappers: [...mappers.values()].filter((mapper) => usedMapperIds.has(mapper.id)).sort((a, b) => a.id - b.id),
  }
}
