import type { SupabaseClient } from '@supabase/supabase-js'

export async function getSteamAccount(supabase: SupabaseClient, userId: string) {
    const { data } = await supabase
        .from('steam_accounts')
        .select('steam_id, linked_at, last_synced_at, profile_public')
        .eq('user_id', userId)
        .maybeSingle()

    return data
}

export async function upsertSteamAccount(supabase: SupabaseClient, userId: string, steamId64: string) {
    const { data, error } = await supabase
        .from('steam_accounts')
        .upsert({ user_id: userId, steam_id: steamId64, linked_at: new Date().toISOString() }, { onConflict: 'user_id' })
        .select('steam_id, linked_at')
        .single()

    return { data, error }
}

export async function unlinkSteamAccount(supabase: SupabaseClient, userId: string) {
    const { error } = await supabase.from('steam_accounts').delete().eq('user_id', userId)

    if (error) {
        console.error("Failed to unlink Steam account:", error)
        throw error
    }
}
