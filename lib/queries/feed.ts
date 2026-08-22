import type { SupabaseClient } from '@supabase/supabase-js'
import { FeedItem } from '@/types'

export async function getFeed(supabase: SupabaseClient, userId: string | undefined): Promise<FeedItem[]> {
    const { data } = await supabase.rpc('get_feed', { p_user_id: userId })
    return data ?? []
}
