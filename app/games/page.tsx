import { supabase } from "@/lib/supabase";
import GameCard from "@/app/components/GameCard";
import GameFilters from "@/app/components/GameFilters";
import Link from "next/link";

type SearchPageProps = {
  searchParams: Promise<{ q?: string, genre?: string, platform?: string, developer?: string, publisher?: string, esrb?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { q, genre, platform, developer, publisher, esrb } = await searchParams;
    const query = q?.trim() ?? '';
    const genreQuery = genre?.trim() ?? '';
    const platformQuery = platform?.trim() ?? '';
    const developerQuery = developer?.trim() ?? '';
    const publisherQuery = publisher?.trim() ?? '';
    let esrbQuery = esrb?.trim() ?? '';

    let gameIds: number[] = [];

    if (genreQuery) {
        const { data: genreId } = await supabase
            .from('genres')
            .select('id')
            .eq('slug', genreQuery)
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

    if (platformQuery) {
        const { data: platformId } = await supabase
            .from('platforms')
            .select('id')
            .eq('slug', platformQuery)
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

    if (developerQuery) {
        const { data: developerId } = await supabase
            .from('developers')
            .select('id')
            .eq('slug', developerQuery)
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

    if (publisherQuery) {
        const { data: publisherId } = await supabase
            .from('publishers')
            .select('id')
            .eq('slug', publisherQuery)
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

    let supabaseQuery = supabase
        .from('games')
        .select('id, name, slug, cover_image_url, metacritic_score, released')
        .order('metacritic_score', { ascending: false, nullsFirst: false })
        .limit(10)

    if (query) {
        supabaseQuery = supabaseQuery.ilike('name', `%${query}%`)
    }

    if (esrbQuery) {
        if (esrbQuery == "Everyone 10") {
            esrbQuery = "Everyone 10+";
        }
        supabaseQuery = supabaseQuery.eq('esrb_rating', esrbQuery.charAt(0).toUpperCase() + esrbQuery.slice(1))
    }

    if (gameIds.length > 0) {
        supabaseQuery = supabaseQuery.in('id', gameIds)
    }
    
    const { data: games } = await supabaseQuery

    const genres = await supabase.from('genres').select('id, name, slug')
    const platforms = await supabase.from('platforms').select('id, name, slug')
    const developers = await supabase.from('developers').select('id, name, slug')
    const publishers = await supabase.from('publishers').select('id, name, slug')
    const esrb_ratings_data = await supabase.from('games').select('esrb_rating')
    let esrb_ratings: string[] = [];
    if (esrb_ratings_data.data) {
        esrb_ratings = [...new Set(esrb_ratings_data.data.map(row => row.esrb_rating))].filter((rating): rating is string => rating !== null).sort();
    }

    return (
        <main>
            <nav className="h-14 border-b border-[#2a2a35]" />
            
            <div className="w-full max-w-6xl mx-auto px-8 py-12">
                {/* Filters */}
                <GameFilters
                    current={{query: query, genre: genreQuery, platform: platformQuery, developer: developerQuery, publisher: publisherQuery, esrb: esrbQuery}}
                    genres={genres.data ?? []}
                    platforms={platforms.data ?? []}
                    developers={developers.data ?? []}
                    publishers={publishers.data ?? []}
                    esrb_ratings={esrb_ratings ?? []}
                />

                {/* Game grid */}
                {games && games.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {games.map(game => (
                            <GameCard key={game.id} game={game} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <p className="text-4xl mb-4">🎮</p>
                        <h2 className="text-xl font-semibold mb-2 font-(family-name:--font-display)">
                            No games found
                        </h2>
                        <p className="text-[#8b8b9a] text-sm mb-6">
                            Try a different search, or browse <Link href="/games" className="text-[#00d4aa] hover:underline">our library</Link>.
                        </p>
                        <Link href="/" className="px-5 py-2.5 rounded-lg text-sm font-semibold
                            bg-[#00d4aa] text-[#0e0e10] hover:bg-[#00b894]
                            transition-colors duration-200
                            font-(family-name:--font-display)"
                        >
                            Back to Home
                        </Link>
                    </div>
                )}
            </div>
        </main>
    )
}