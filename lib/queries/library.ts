import type { SupabaseClient } from '@supabase/supabase-js'
import { LibraryData, EsrbRatingsData } from '@/types'
import { SteamLinkEntry } from '@/types'

export async function getLibraryEntry(supabase: SupabaseClient, userId: string, gameId: number) {
    const { data } = await supabase
        .from('library_entries')
        .select('id, status, completed_all_achievements, hours_played, play_count')
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .single()

    return data
}

type LibraryEntryFields = {
    status: string
    is100: boolean
    hours: number | null
    playedCount: number
}

export async function createLibraryEntry(supabase: SupabaseClient, userId: string, gameId: number, fields: LibraryEntryFields) {
    const { data } = await supabase
        .from('library_entries')
        .insert({ user_id: userId, game_id: gameId, status: fields.status, completed_all_achievements: fields.is100, hours_played: fields.hours, play_count: fields.playedCount })
        .select('id, status, completed_all_achievements, hours_played, play_count')
        .single()

    return data
}

export async function updateLibraryEntry(supabase: SupabaseClient, userId: string, gameId: number, fields: LibraryEntryFields) {
    const { data } = await supabase
        .from('library_entries')
        .update({ status: fields.status, completed_all_achievements: fields.is100, hours_played: fields.hours, play_count: fields.playedCount })
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .select('id, status, completed_all_achievements, hours_played, play_count')
        .single()

    return data
}

export async function upsertLibraryEntries(supabase: SupabaseClient, userId: string, entries: SteamLinkEntry[]) {
    const toUpsert = entries.map(sle => ({ user_id: userId, game_id: sle.gameId, status: sle.status, hours_played: sle.playtimeSelected, play_count: sle.timesPlayed ?? 0}))

    const { data, error } = await supabase
        .from("library_entries")
        .upsert(toUpsert, { onConflict: "user_id,game_id"})
        .select('id, status, completed_all_achievements, hours_played, play_count')

    if (error) {
        console.error("Failed to import library entries from Steam:", error)
        throw error
    }

    return data
}

export async function deleteLibraryEntry(supabase: SupabaseClient, entryId: string) {
    await supabase.from('library_entries').delete().eq('id', entryId)
}

type LibraryEntriesFilter = {
    status?: string
    is100?: boolean
    sort?: string
    order?: string
}

export async function getLibraryEntries(supabase: SupabaseClient, userId: string, filter: LibraryEntriesFilter) {
    let query = supabase
        .from('library_entries')
        .select('game_id, status, created_at, completed_all_achievements, hours_played, play_count')
        .eq('user_id', userId)

    if (filter.status) query = query.eq('status', filter.status)
    if (filter.is100) query = query.eq('completed_all_achievements', true)
    if (filter.sort === 'date_added') query = query.order('created_at', { ascending: filter.order === 'asc' })

    const { data } = await query
    return data ?? []
}

export async function getLibraryFacets(supabase: SupabaseClient, userId: string) {
    const [
        { data: genresData },
        { data: platformsData },
        { data: developersData },
        { data: publishersData },
        { data: esrbRatingsData },
    ] = await Promise.all([
        supabase.rpc('get_library_genres', { p_user_id: userId }),
        supabase.rpc('get_library_platforms', { p_user_id: userId }),
        supabase.rpc('get_library_developers', { p_user_id: userId }),
        supabase.rpc('get_library_publishers', { p_user_id: userId }),
        supabase.rpc('get_library_esrb_ratings', { p_user_id: userId }),
    ])

    return {
        genres: genresData as LibraryData[],
        platforms: platformsData as LibraryData[],
        developers: developersData as LibraryData[],
        publishers: publishersData as LibraryData[],
        esrbRatings: (esrbRatingsData as EsrbRatingsData[]).map(r => r.esrb_rating),
    }
}

export async function getLibraryStatusBreakdown(supabase: SupabaseClient, userId: string) {
    const { data: entries, count: totalCount } = await supabase
        .from('library_entries')
        .select('status', { count: 'exact' })
        .eq('user_id', userId)

    return { entries: entries ?? [], totalCount: totalCount ?? 0 }
}
