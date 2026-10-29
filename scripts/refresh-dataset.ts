/**
 * Refreshes the bundled dataset from the osu! API v2.
 *
 *   OSU_CLIENT_ID=… OSU_CLIENT_SECRET=… npm run data:refresh
 *   OSU_CLIENT_ID=… OSU_CLIENT_SECRET=… npm run data:refresh -- --top 2
 *
 * Without flags it re-fetches every set in data/curated-sets.json and its
 * host. `--top <pages>` also adds the most played ranked sets (50 per page)
 * and records their IDs in the curated list so later refreshes keep them.
 * Credentials come from an osu! OAuth application (osu.ppy.sh/home/account/edit).
 */
import { readFile, writeFile } from 'node:fs/promises'
import { createOsuApiClient } from './lib/osu-api.ts'
import { buildDataset, type ApiBeatmapset, type ApiUser } from './lib/transform.ts'

const CURATED_PATH = new URL('../data/curated-sets.json', import.meta.url)
const DATASET_PATH = new URL('../src/shared/data/dataset.json', import.meta.url)

interface CuratedSets {
  beatmapsetIds: number[]
}

function topPagesFlag(args: string[]): number {
  const index = args.indexOf('--top')
  if (index === -1) return 0
  const pages = Number(args[index + 1])
  if (!Number.isInteger(pages) || pages < 1 || pages > 10) throw new Error('--top expects a page count from 1 to 10')
  return pages
}

async function main() {
  const clientId = process.env.OSU_CLIENT_ID
  const clientSecret = process.env.OSU_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    console.error('Set OSU_CLIENT_ID and OSU_CLIENT_SECRET to refresh the dataset. The bundled one still works.')
    process.exit(1)
  }

  const curated = JSON.parse(await readFile(CURATED_PATH, 'utf8')) as CuratedSets
  const api = await createOsuApiClient(clientId, clientSecret)

  const sets = new Map<number, ApiBeatmapset>()
  for (const set of await api.mostPlayedRankedSets(topPagesFlag(process.argv.slice(2)))) sets.set(set.id, set)
  for (const id of curated.beatmapsetIds) {
    if (sets.has(id)) continue
    const set = await api.beatmapset(id)
    if (set) sets.set(id, set)
    else console.warn(`Beatmapset ${id} is gone; skipping it.`)
  }

  const users: ApiUser[] = []
  for (const userId of new Set([...sets.values()].map((set) => set.user_id))) {
    const user = await api.user(userId)
    if (user) users.push(user)
  }

  const snapshotDate = new Date().toISOString().slice(0, 10)
  const dataset = buildDataset([...sets.values()], users, snapshotDate, 'osu! API v2')
  await writeFile(DATASET_PATH, `${JSON.stringify(dataset, null, 1)}\n`)

  const beatmapsetIds = [...new Set([...curated.beatmapsetIds, ...dataset.beatmapsets.map((set) => set.id)])]
  await writeFile(CURATED_PATH, `${JSON.stringify({ beatmapsetIds }, null, 2)}\n`)

  console.log(`Wrote ${dataset.beatmapsets.length} sets and ${dataset.mappers.length} mappers (snapshot ${snapshotDate}).`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
