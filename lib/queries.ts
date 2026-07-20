import { createClient } from '@/lib/supabase-server'

type GameQueryParams = {
    genre?: string
    platform?: string
    developer?: string
    publisher?: string
    limitToGameIds?: string[]
}

export async function queryGames(params: GameQueryParams) {
    const supabase = await createClient()

    let gameIds = params.limitToGameIds || []

    if (params.genre) {
        const { data: genreId } = await supabase
            .from('genres')
            .select('id')
            .eq('slug', params.genre)
            .single()

        if (genreId) {
            const { data: genreData } = await supabase
                .from('game_genres')
                .select('game_id')
                .eq('genre_id', genreId.id)

            const genreGameIds = genreData?.map(g => g.game_id) ?? []
            if (gameIds.length === 0) {
                gameIds.push(...genreGameIds)
            } else {
                gameIds = gameIds.filter(id => genreGameIds.includes(id))
            }
        }
    }

    if (params.platform) {
        const { data: platformId } = await supabase
            .from('platforms')
            .select('id')
            .eq('slug', params.platform)
            .single()

        if (platformId) {
            const { data: platformData } = await supabase
                .from('game_platforms')
                .select('game_id')
                .eq('platform_id', platformId.id)

            const platformGameIds = platformData?.map(g => g.game_id) ?? []
            if (gameIds.length === 0) {
                gameIds.push(...platformGameIds)
            } else {
                gameIds = gameIds.filter(id => platformGameIds.includes(id))
            }
        }
    }

    if (params.developer) {
        const { data: developerId } = await supabase
            .from('developers')
            .select('id')
            .eq('slug', params.developer)
            .single()

        if (developerId) {
            const { data: developerData } = await supabase
                .from('game_developers')
                .select('game_id')
                .eq('developer_id', developerId.id)

            const developerGameIds = developerData?.map(g => g.game_id) ?? []
            if (gameIds.length === 0) {
                gameIds.push(...developerGameIds)
            } else {
                gameIds = gameIds.filter(id => developerGameIds.includes(id))
            }
        }
    }

    if (params.publisher) {
        const { data: publisherId } = await supabase
            .from('publishers')
            .select('id')
            .eq('slug', params.publisher)
            .single()

        if (publisherId) {
            const { data: publisherData } = await supabase
                .from('game_publishers')
                .select('game_id')
                .eq('publisher_id', publisherId.id)

            const publisherGameIds = publisherData?.map(g => g.game_id) ?? []
            if (gameIds.length === 0) {
                gameIds.push(...publisherGameIds)
            } else {
                gameIds = gameIds.filter(id => publisherGameIds.includes(id))
            }
        }
    }

    return gameIds
}