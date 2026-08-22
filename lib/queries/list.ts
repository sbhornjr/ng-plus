import type { SupabaseClient } from '@supabase/supabase-js'
import { GameCover, ListDetail, ListGameEntry } from '@/types'

export async function getUserLists(supabase: SupabaseClient, userId: string | null | undefined, includePrivate: boolean) {
    const { data } = await supabase.rpc('get_user_lists', { p_user_id: userId, p_include_private: includePrivate })
    return data ?? []
}

export async function getLikedLists(supabase: SupabaseClient, userId: string) {
    const { data } = await supabase.rpc('get_liked_lists', { p_user_id: userId })
    return data ?? []
}

export async function getListById(supabase: SupabaseClient, listId: string): Promise<ListDetail | null> {
    const { data } = await supabase
        .from('lists')
        .select('id, name, description, is_public, is_pinned, is_default, created_at, updated_at')
        .eq('id', listId)
        .single()

    return data
}

export async function getListGames(supabase: SupabaseClient, listId: string): Promise<ListGameEntry[]> {
    const { data } = await supabase
        .from('list_games')
        .select('games(id, name, slug, cover_image_url, released, metacritic_score)')
        .eq('list_id', listId)
        .order('position', { ascending: true })

    return (data ?? []) as unknown as ListGameEntry[]
}

// Up to 5 cover images per list, ordered by position — used for list preview cards.
export async function getListCoverMap(supabase: SupabaseClient, listIds: (string | number)[]): Promise<Map<string, GameCover[]>> {
    const { data: listGames } = await supabase
        .from('list_games')
        .select('list_id, position, games(cover_image_url, slug)')
        .in('list_id', listIds)
        .order('position', { ascending: true })

    const coversByList = new Map<string, GameCover[]>()

    for (const entry of listGames ?? []) {
        const existing = coversByList.get(entry.list_id) ?? []
        if (existing.length < 5) {
            const game = entry.games as unknown as { cover_image_url: string | null, slug: string } | null
            existing.push({
                coverImageUrl: game?.cover_image_url ?? null,
                slug: game?.slug ?? null
            })
            coversByList.set(entry.list_id, existing)
        }
    }

    return coversByList
}

export async function getListLikes(supabase: SupabaseClient, listIds: (string | number)[]) {
    const { data } = await supabase
        .from('list_likes')
        .select('list_id, user_id')
        .in('list_id', listIds)

    return data ?? []
}

export async function getGameListMembership(supabase: SupabaseClient, gameId: string, listIds: (string | number)[]): Promise<Set<string>> {
    const { data } = await supabase
        .from('list_games')
        .select('list_id')
        .eq('game_id', gameId)
        .in('list_id', listIds)

    return new Set(data?.map(g => g.list_id) ?? [])
}

export async function addGameToList(supabase: SupabaseClient, listId: string, gameId: string) {
    const { data: maxPos } = await supabase
        .from('list_games')
        .select('position')
        .eq('list_id', listId)
        .order('position', { ascending: false })
        .limit(1)
        .single()

    await supabase
        .from('list_games')
        .insert({ list_id: listId, game_id: gameId, position: (maxPos?.position ?? -1) + 1 })
}

export async function removeGameFromList(supabase: SupabaseClient, listId: string, gameId: string) {
    await supabase
        .from('list_games')
        .delete()
        .eq('list_id', listId)
        .eq('game_id', gameId)
}

type ListFields = {
    name: string
    description: string
    isPublic: boolean
    isPinned: boolean
}

export async function createList(supabase: SupabaseClient, userId: string, fields: ListFields) {
    const { data } = await supabase
        .from('lists')
        .insert({ user_id: userId, name: fields.name, description: fields.description, is_public: fields.isPublic, is_pinned: fields.isPinned })
        .select('id')
        .single()

    return data
}

export async function updateList(supabase: SupabaseClient, listId: string, fields: ListFields) {
    await supabase
        .from('lists')
        .update({ name: fields.name, description: fields.description, is_public: fields.isPublic, is_pinned: fields.isPinned })
        .eq('id', listId)
}

export async function syncListGames(supabase: SupabaseClient, listId: string, { toAdd, toRemove }: { toAdd: { id: string }[], toRemove: { id: string }[] }) {
    const { data: maxPosData } = await supabase
        .from('list_games')
        .select('position')
        .eq('list_id', listId)
        .order('position', { ascending: false })
        .limit(1)
        .single()

    const startPosition = (maxPosData?.position ?? -1) + 1

    await Promise.all([
        toRemove.length > 0
            ? supabase
                .from('list_games')
                .delete()
                .in('game_id', toRemove.map(g => g.id))
                .eq('list_id', listId)
            : Promise.resolve(),
        toAdd.length > 0
            ? supabase
                .from('list_games')
                .insert(toAdd.map((game, index) => ({
                    list_id: listId,
                    game_id: game.id,
                    position: startPosition + index
                })))
            : Promise.resolve(),
    ])
}

export async function likeList(supabase: SupabaseClient, listId: string, userId: string) {
    await supabase.from('list_likes').insert({ list_id: listId, user_id: userId })
}

export async function unlikeList(supabase: SupabaseClient, listId: string, userId: string) {
    await supabase
        .from('list_likes')
        .delete()
        .eq('list_id', listId)
        .eq('user_id', userId)
}

export async function setListPinned(supabase: SupabaseClient, listId: string | number, pinned: boolean) {
    const { data } = await supabase
        .from('lists')
        .update({ is_pinned: pinned })
        .eq('id', listId)
        .select('is_pinned')
        .single()

    return data?.is_pinned
}
