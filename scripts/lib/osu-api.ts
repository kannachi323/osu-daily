import type { ApiBeatmapset, ApiUser } from './transform.ts'

const BASE_URL = 'https://osu.ppy.sh'
/** The API documentation asks for at most 60 requests a minute. */
const REQUEST_SPACING_MS = 1100

export interface OsuApiClient {
  beatmapset(id: number): Promise<ApiBeatmapset | undefined>
  user(id: number): Promise<ApiUser | undefined>
  mostPlayedRankedSets(pages: number): Promise<ApiBeatmapset[]>
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Client-credentials token with the `public` scope: read-only, no user data. */
async function requestToken(clientId: string, clientSecret: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: Number(clientId),
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: 'public',
    }),
  })
  if (!response.ok) throw new Error(`Token request failed: HTTP ${response.status}`)
  const body = (await response.json()) as { access_token: string }
  return body.access_token
}

export async function createOsuApiClient(clientId: string, clientSecret: string): Promise<OsuApiClient> {
  const token = await requestToken(clientId, clientSecret)
  let lastRequestAt = 0

  async function get<T>(path: string, attempt = 1): Promise<T | undefined> {
    const wait = lastRequestAt + REQUEST_SPACING_MS - Date.now()
    if (wait > 0) await sleep(wait)
    lastRequestAt = Date.now()

    const response = await fetch(`${BASE_URL}/api/v2${path}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
    if (response.status === 404) return undefined
    if (response.status === 429 && attempt < 4) {
      await sleep(30_000 * attempt)
      return get<T>(path, attempt + 1)
    }
    if (!response.ok) throw new Error(`GET ${path} failed: HTTP ${response.status}`)
    return (await response.json()) as T
  }

  return {
    beatmapset: (id) => get<ApiBeatmapset>(`/beatmapsets/${id}`),
    user: (id) => get<ApiUser>(`/users/${id}/osu`),
    async mostPlayedRankedSets(pages) {
      const sets: ApiBeatmapset[] = []
      let cursor: string | null = null
      for (let page = 0; page < pages; page++) {
        const query = new URLSearchParams({ m: '0', s: 'ranked', sort: 'plays_desc' })
        if (cursor) query.set('cursor_string', cursor)
        const result = await get<{ beatmapsets: ApiBeatmapset[]; cursor_string: string | null }>(
          `/beatmapsets/search?${query}`,
        )
        if (!result) break
        sets.push(...result.beatmapsets)
        cursor = result.cursor_string
        if (!cursor) break
      }
      return sets
    },
  }
}
