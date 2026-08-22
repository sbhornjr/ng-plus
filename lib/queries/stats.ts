import type { SupabaseClient } from '@supabase/supabase-js'
import { GenreStatType, DeveloperStatType, StatusStatType, HighlightType } from '@/types'

export async function getLoadoutGenreStats(supabase: SupabaseClient, userId: string): Promise<GenreStatType[]> {
    const { data } = await supabase.rpc('get_loadout_genre_stats', { p_user_id: userId })
    return data ?? []
}

export async function getLoadoutDeveloperStats(supabase: SupabaseClient, userId: string): Promise<DeveloperStatType[]> {
    const { data } = await supabase.rpc('get_loadout_developer_stats', { p_user_id: userId })
    return data ?? []
}

export async function getLoadoutStatusBreakdown(supabase: SupabaseClient, userId: string): Promise<StatusStatType[]> {
    const { data } = await supabase.rpc('get_loadout_status_breakdown', { p_user_id: userId })
    return data ?? []
}

export async function getLoadoutRatingHighlights(supabase: SupabaseClient, userId: string): Promise<HighlightType[]> {
    const { data } = await supabase.rpc('get_loadout_rating_highlights', { p_user_id: userId })
    return data ?? []
}
