import type { SupabaseClient } from '@supabase/supabase-js'
import { FeedItem } from '@/types'

export const FEED_PAGE_SIZE = 12

export async function getFeed(
    supabase: SupabaseClient,
    userId: string | undefined,
    limit?: number,
    offset?: number,
): Promise<FeedItem[]> {
    const { data } = await supabase.rpc('get_feed', {
        p_user_id: userId,
        ...(limit != null ? { p_limit: limit } : {}),
        ...(offset != null ? { p_offset: offset } : {}),
    })
    return data ?? []
}
