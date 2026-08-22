import type { SupabaseClient } from '@supabase/supabase-js'
import { TrendingGame, TrendingList, RecommendedGame, RecommendedList, RecommendedUser } from '@/types'

export async function getTrendingGames(supabase: SupabaseClient, viewerId: string | null | undefined, days: number): Promise<TrendingGame[]> {
    const { data } = await supabase.rpc('get_trending_games', { p_user_id: viewerId ?? null, p_days: days })
    return data ?? []
}

export async function getTrendingLists(supabase: SupabaseClient, viewerId: string | null | undefined, days: number): Promise<TrendingList[]> {
    const { data } = await supabase.rpc('get_trending_lists', { p_user_id: viewerId ?? null, p_days: days })
    return data ?? []
}

export async function getExploreRecommendations(supabase: SupabaseClient, viewerId: string | null | undefined) {
    const [{ data: recommendedGamesData }, { data: recommendedListsData }, { data: recommendedUsersData }] =
        await Promise.all([
            supabase.rpc('get_follow_recommendations', { p_user_id: viewerId ?? null }),
            supabase.rpc('get_recommended_lists', { p_user_id: viewerId ?? null }),
            supabase.rpc('get_who_to_follow', { p_user_id: viewerId ?? null })
        ])

    return {
        games: (recommendedGamesData ?? []) as RecommendedGame[],
        lists: (recommendedListsData ?? []) as RecommendedList[],
        users: (recommendedUsersData ?? []) as RecommendedUser[],
    }
}
