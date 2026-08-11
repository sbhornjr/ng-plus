import { createClient } from "@/lib/supabase-server";
import GameCard from "@/app/components/GameCard";
import GameFilters from "@/app/components/GameFilters";
import Link from "next/link";
import Pagination from "../components/Pagination";

type SearchPageProps = {
    searchParams: Promise<{ q?: string, genre?: string, platform?: string, developer?: string, publisher?: string, esrb?: string, page?: number, pageSize?: string, sort?: string, order?: string }>
}

type GameData = {
    id: number
    name: string
    slug: string
    cover_image_url: string
    metacritic_score: number
    released: string
    avg_ngplus_rating: number
    user_rating: number
    total_count: number
}

export default async function SearchPage({ searchParams } : SearchPageProps) {
    const { q, genre, platform, developer, publisher, esrb, page, pageSize, sort, order } = await searchParams;
    const query = q?.trim() ?? '';
    const genreQuery = genre?.trim() ?? '';
    const platformQuery = platform?.trim() ?? '';
    const developerQuery = developer?.trim() ?? '';
    const publisherQuery = publisher?.trim() ?? '';
    const pageQuery = page ? Number(page) : 1
    const pageSizeQuery = pageSize ? Number(pageSize) : 10
    const sortQuery = sort?.trim() ?? '';
    const orderQuery = order?.trim() ?? "desc";
    const esrbQuery = esrb?.trim() ?? '';
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: gamesData } = await supabase.rpc('query_games', {
        p_q: query || null,
        p_genre: genreQuery || null,
        p_platform: platformQuery || null,
        p_developer: developerQuery || null,
        p_publisher: publisherQuery || null,
        p_esrb: esrbQuery || null,
        p_sort: sortQuery,
        p_order: orderQuery,
        p_limit: pageSizeQuery,
        p_offset: (pageQuery - 1) * pageSizeQuery,
        p_user_id: user ? user.id : null,
        p_game_ids: null
    })

    const games = gamesData ? gamesData as GameData[] : []
    const totalCount = games[0]?.total_count ?? 0
    const totalPages = Math.ceil(totalCount / pageSizeQuery)

    const genres = await supabase.from('genres').select('id, name, slug')
    const platforms = await supabase.from('platforms').select('id, name, slug')
    const developers = await supabase.from('developers').select('id, name, slug')
    const publishers = await supabase.from('publishers').select('id, name, slug')
    const esrb_ratings_data = await supabase.from('games').select('esrb_rating')
    let esrb_ratings: string[] = [];
    if (esrb_ratings_data.data) {
        esrb_ratings = [...new Set(esrb_ratings_data.data.map(row => row.esrb_rating))].filter((rating): rating is string => rating !== null).sort();
    }

    const finalGameIds = games?.map(g => g.id) ?? []
    const { data: developerLinks } = await supabase
        .from('game_developers')
        .select('game_id, developers(name)')
        .in('game_id', finalGameIds)

    const developerMap = new Map(developerLinks?.reverse().map(d => [d.game_id, (d.developers as any)?.name ?? null]))

    return (
        <main>
            <div className="w-full max-w-6xl mx-auto px-8 py-12">
                {/* Filters */}
                <GameFilters
                    current={{query: query, genre: genreQuery, platform: platformQuery, developer: developerQuery, publisher: publisherQuery, esrb: esrbQuery, pageSize: String(pageSizeQuery), order: orderQuery, sort: sortQuery}}
                    genres={genres.data ?? []}
                    platforms={platforms.data ?? []}
                    developers={developers.data ?? []}
                    publishers={publishers.data ?? []}
                    esrb_ratings={esrb_ratings ?? []}
                />

                {/* Game grid */}
                {games && games.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
                        {games.map(game => (
                            <GameCard 
                                key={game.id} 
                                game={{ id: String(game.id), name: game.name, slug: game.slug, cover_image_url: game.cover_image_url, metacritic_score: game.metacritic_score, released: game.released }} 
                                developer={developerMap.get(game.id)} 
                                userRating={game.user_rating} 
                                ngplusRating={game.avg_ngplus_rating}
                            />
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

                {!!totalCount && totalCount > 0 && 
                    <Pagination 
                        page={pageQuery}
                        maxPages={totalPages}
                        params={{ q: query, genre: genreQuery, platform: platformQuery, developer: developerQuery, publisher: publisherQuery, esrb: esrbQuery, pageSize: String(pageSizeQuery) }}
                    />
                }
            </div>
        </main>
    )
}