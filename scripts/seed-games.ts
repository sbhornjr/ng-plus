import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

const RAWG_KEY = process.env.RAWG_API_KEY!
const RAWG_BASE = 'https://api.rawg.io/api'

// -------------------------------------------------------
// In-memory caches — avoids re-upserting the same genre,
// platform, developer, or publisher over and over
// -------------------------------------------------------
const genreCache = new Map<number, string>()    // rawg_id → our uuid
const platformCache = new Map<number, string>()
const developerCache = new Map<number, string>()
const publisherCache = new Map<number, string>()

// -------------------------------------------------------
// Generic upsert helper for the four "lookup" tables
// -------------------------------------------------------
async function upsertLookup(
  cache: Map<number, string>,
  table: 'genres' | 'platforms' | 'developers' | 'publishers',
  rawgId: number,
  name: string,
  slug: string
): Promise<string | null> {
  // Return cached uuid if we've already upserted this one
  if (cache.has(rawgId)) return cache.get(rawgId)!

  const { data, error } = await supabase
    .from(table)
    .upsert({ rawg_id: rawgId, name, slug }, { onConflict: 'rawg_id' })
    .select('id')
    .single()

  if (error || !data) {
    console.error(`Failed to upsert ${table} "${name}":`, error)
    return null
  }

  cache.set(rawgId, data.id)
  return data.id
}

// -------------------------------------------------------
// Upsert a join table row (game_genres, game_platforms, etc)
// -------------------------------------------------------
async function upsertJoin(
  table: 'game_genres' | 'game_platforms' | 'game_developers' | 'game_publishers',
  gameId: string,
  foreignKey: string,
  foreignValue: string
) {
  await supabase
    .from(table)
    .upsert(
      { game_id: gameId, [foreignKey]: foreignValue },
      { onConflict: `game_id,${foreignKey}` }
    )
}

// -------------------------------------------------------
// Fetch a page of games from RAWG
// -------------------------------------------------------
async function fetchGames(page: number) {
  const params = new URLSearchParams({
    key: RAWG_KEY,
    page: String(page),
    page_size: '40',
    ordering: '-rating',
    metacritic: '60,100',
    exclude_additions: 'true',  // filters out DLCs, GOTY editions, etc
  })
  const res = await fetch(`${RAWG_BASE}/games?${params}`)
  const data = await res.json()
  return data.results as any[]
}

// -------------------------------------------------------
// Fetch full game details from RAWG (includes description,
// developers, publishers, reddit_url — not in list response)
// -------------------------------------------------------
async function fetchGameDetails(slug: string) {
  const res = await fetch(`${RAWG_BASE}/games/${slug}?key=${RAWG_KEY}`)
  return res.json()
}

// -------------------------------------------------------
// Seed a single game: upsert core data, then all relations
// -------------------------------------------------------
async function seedGame(rawgGame: any) {
  const details = await fetchGameDetails(rawgGame.slug)

  // Upsert the game itself
  const { data: game, error } = await supabase
    .from('games')
    .upsert({
      rawg_id: rawgGame.id,
      name: rawgGame.name,
      slug: rawgGame.slug,
      cover_image_url: rawgGame.background_image ?? null,
      released: rawgGame.released ?? null,
      metacritic_score: rawgGame.metacritic ?? null,
      description: details.description_raw ?? null,
      esrb_rating: rawgGame.esrb_rating?.name ?? null,
      reddit_url: details.reddit_url ?? null,
      screenshots: (rawgGame.short_screenshots ?? [])
        .map((s: any) => s.image)
        .filter(Boolean),
    }, { onConflict: 'rawg_id' })
    .select('id')
    .single()

  if (error || !game) {
    console.error(`Failed to upsert game "${rawgGame.name}":`, error)
    return
  }

  const gameId = game.id

  // Genres
  for (const g of rawgGame.genres ?? []) {
    const id = await upsertLookup(genreCache, 'genres', g.id, g.name, g.slug)
    if (id) await upsertJoin('game_genres', gameId, 'genre_id', id)
  }

  // Platforms
  for (const p of rawgGame.platforms ?? []) {
    const { id: rawgPlatformId, name, slug } = p.platform
    const id = await upsertLookup(platformCache, 'platforms', rawgPlatformId, name, slug)
    if (id) await upsertJoin('game_platforms', gameId, 'platform_id', id)
  }

  // Developers (from detail response)
  for (const d of details.developers ?? []) {
    const id = await upsertLookup(developerCache, 'developers', d.id, d.name, d.slug)
    if (id) await upsertJoin('game_developers', gameId, 'developer_id', id)
  }

  // Publishers (from detail response)
  for (const p of details.publishers ?? []) {
    const id = await upsertLookup(publisherCache, 'publishers', p.id, p.name, p.slug)
    if (id) await upsertJoin('game_publishers', gameId, 'publisher_id', id)
  }

  console.log(`✓ ${rawgGame.name}`)
}

// -------------------------------------------------------
// Main — fetch N pages and seed each game
// -------------------------------------------------------
async function main() {
  console.log('Starting seed...')

  for (let page = 1; page <= 3; page++) {
    console.log(`\nFetching page ${page}...`)
    const games = await fetchGames(page)

    for (const game of games) {
      await seedGame(game)
    }
  }

  console.log('\nDone!')
  console.log(`Cached: ${genreCache.size} genres, ${platformCache.size} platforms, ${developerCache.size} developers, ${publisherCache.size} publishers`)
}

main()