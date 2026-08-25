import type { SupabaseClient } from '@supabase/supabase-js'
import { Game, GameData } from '@/types'

export async function getGameBySlug(supabase: SupabaseClient, slug: string) {
    const { data } = await supabase
        .from('games')
        .select('*')
        .eq('slug', slug)
        .single()

    return data
}

export async function getGameTaxonomy(supabase: SupabaseClient, gameId: string) {
    const [{ data: genres }, { data: platforms }, { data: developers }, { data: publishers }] =
        await Promise.all([
            supabase
                .from('game_genres')
                .select('genres(id, name, slug)')
                .eq('game_id', gameId),
            supabase
                .from('game_platforms')
                .select('platforms(id, name, slug)')
                .eq('game_id', gameId),
            supabase
                .from('game_developers')
                .select('developers(id, name, slug)')
                .eq('game_id', gameId),
            supabase
                .from('game_publishers')
                .select('publishers(id, name, slug)')
                .eq('game_id', gameId),
        ])

    return {
        genres: (genres ?? []).flatMap((g) => g.genres ?? []),
        platforms: (platforms ?? []).flatMap((p) => p.platforms ?? []),
        developers: (developers ?? []).flatMap((d) => d.developers ?? []),
        publishers: (publishers ?? []).flatMap((p) => p.publishers ?? []),
    }
}

export async function searchGamesByName(supabase: SupabaseClient, query: string, limit = 20): Promise<Game[]> {
    const { data } = await supabase
        .from('games')
        .select('id, name, slug, cover_image_url, metacritic_score, released')
        .ilike('name', `%${query}%`)
        .limit(limit)

    return data ?? []
}

// Maps game_id -> developer name for a set of games. Used anywhere a game grid needs to show its developer.
export async function getDeveloperNameMap(supabase: SupabaseClient, gameIds: (string | number)[]): Promise<Map<string | number, string | null>> {
    const { data: developerLinks } = await supabase
        .from('game_developers')
        .select('game_id, developers(name)')
        .in('game_id', gameIds)

    return new Map(developerLinks?.reverse().map(d => [d.game_id, (d.developers as unknown as { name: string } | null)?.name ?? null]))
}

type QueryGamesParams = {
    q?: string | null
    genre?: string | null
    platform?: string | null
    developer?: string | null
    publisher?: string | null
    esrb?: string | null
    sort?: string
    order?: string
    limit?: number
    offset?: number
    userId?: string | null
    gameIds?: (string | number)[] | null
}

export async function queryGames(supabase: SupabaseClient, params: QueryGamesParams): Promise<GameData[]> {
    const { data } = await supabase.rpc('query_games', {
        p_q: params.q,
        p_genre: params.genre,
        p_platform: params.platform,
        p_developer: params.developer,
        p_publisher: params.publisher,
        p_esrb: params.esrb,
        p_sort: params.sort,
        p_order: params.order,
        p_limit: params.limit,
        p_offset: params.offset,
        p_user_id: params.userId,
        p_game_ids: params.gameIds,
    })

    return data ?? []
}

export async function getAllGenres(supabase: SupabaseClient) {
    const { data } = await supabase.from('genres').select('id, name, slug')
    return data ?? []
}

export async function getAllPlatforms(supabase: SupabaseClient) {
    const { data } = await supabase.from('platforms').select('id, name, slug')
    return data ?? []
}

export async function getDistinctEsrbRatings(supabase: SupabaseClient): Promise<string[]> {
    const { data } = await supabase.from('games').select('esrb_rating')
    if (!data) return []
    return [...new Set(data.map(row => row.esrb_rating))].filter((rating): rating is string => rating !== null).sort()
}

type TaxonomyTable = 'developers' | 'publishers'

export async function searchTaxonomyTable(supabase: SupabaseClient, table: TaxonomyTable, query: string, limitToIds?: string[]) {
    let q = supabase
        .from(table)
        .select('id, name, slug')
        .ilike('name', `%${query}%`)
        .order('name')
        .limit(20)

    if (limitToIds && limitToIds.length > 0) {
        q = q.in('id', limitToIds)
    }

    const { data } = await q
    return data ?? []
}

export async function getTaxonomyNameBySlug(supabase: SupabaseClient, table: TaxonomyTable, slug: string) {
    const { data } = await supabase
        .from(table)
        .select('name')
        .eq('slug', slug)
        .single()

    return data?.name ?? ''
}
