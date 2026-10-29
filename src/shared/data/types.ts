/**
 * The bundled dataset. It is a frozen snapshot: play counts, favourites,
 * star ratings and mapper stats are true as of `snapshotDate` and drift later.
 */
export interface Dataset {
  version: number
  snapshotDate: string
  source: string
  beatmapsets: Beatmapset[]
  mappers: Mapper[]
}

export interface Beatmapset {
  id: number
  artist: string
  title: string
  /** Username of the set host at snapshot time. */
  creator: string
  creatorId: number
  status: 'ranked' | 'approved'
  /** `YYYY-MM-DD` the set was ranked or approved. */
  rankedDate: string
  playCount: number
  favouriteCount: number
  /** Anime, game or other media the song comes from; empty when none. */
  source: string
  /** Number of osu!standard difficulties. */
  difficultyCount: number
  /** The hardest osu!standard difficulty. */
  hardest: HardestDifficulty
}

export interface HardestDifficulty {
  name: string
  stars: number
  bpm: number
  lengthSeconds: number
}

export interface Mapper {
  id: number
  username: string
  countryCode: string
  countryName: string
  previousUsernames: string[]
  joinedYear: number
  /** Players subscribed to this mapper's new maps, at snapshot time. */
  mappingFollowers: number
}
