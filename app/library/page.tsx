import { createClient } from "@/lib/supabase-server";
import GameCard from "@/app/components/GameCard";
import { redirect } from "next/navigation"
import { queryGames } from "@/lib/queries";
import LibraryFilters from "../components/LibraryFilters";
import Link from "next/link";

type LibraryPageProps = {
  searchParams: Promise<{ q?: string,genre?: string, platform?: string, developer?: string, 
    publisher?: string, esrb?: string, sort?: string, order?: string, status?: string }>
}

type LibraryData = {
    id: number,
    name: string,
    slug: string
}

type EsrbRatingsData = {
    esrb_rating: string
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

export default async function LibraryPage({ searchParams } : LibraryPageProps) {
    const { q, genre, platform, developer, publisher, esrb, sort, order, status } = await searchParams;
    const query = q?.trim() ?? '';
    const genreQuery = genre?.trim() ?? '';
    const platformQuery = platform?.trim() ?? '';
    const developerQuery = developer?.trim() ?? '';
    const publisherQuery = publisher?.trim() ?? '';
    const esrbQuery = esrb?.trim() ?? '';
    const sortQuery = sort?.trim() ?? 'ngplus_rating';
    const orderQuery = order?.trim() ?? 'desc';
    const statusQuery = status?.trim() ?? ''
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/')

    const [
        { data: genresData },
        { data: platformsData },
        { data: developersData },
        { data: publishersData },
        { data: esrbRatingsData },
    ] = await Promise.all([
        supabase.rpc('get_library_genres', { p_user_id: user.id }),
        supabase.rpc('get_library_platforms', { p_user_id: user.id }),
        supabase.rpc('get_library_developers', { p_user_id: user.id }),
        supabase.rpc('get_library_publishers', { p_user_id: user.id }),
        supabase.rpc('get_library_esrb_ratings', { p_user_id: user.id }),
    ])

    const genres = genresData as LibraryData[]
    const platforms = platformsData as LibraryData[]
    const developers = developersData as LibraryData[]
    const publishers = publishersData as LibraryData[]
    const esrbRatingsList = esrbRatingsData as EsrbRatingsData[]
    const esrbRatings = esrbRatingsList.map((r) => r.esrb_rating)

    if (genreQuery != '' && !genres.map((g) => g.slug).includes(genreQuery)) {
        console.log("Genre " + genreQuery + " is not in the Library. Redirecting to home.")
        redirect('/')
    }

    if (platformQuery != '' && !platforms.map((p) => p.slug).includes(platformQuery)) {
        console.log("Platform " + platformQuery + " is not in the Library. Redirecting to home.")
        redirect('/')
    }

    if (developerQuery != '' && !developers.map((d) => d.slug).includes(developerQuery)) {
        console.log("Developer " + developerQuery + " is not in the Library. Redirecting to home.")
        redirect('/')
    }

    if (publisherQuery != '' && !publishers.map((p) => p.slug).includes(publisherQuery)) {
        console.log("Publisher " + publisherQuery + " is not in the Library. Redirecting to home.")
        redirect('/')
    }

    if (esrbQuery != '' && !esrbRatings.includes(esrbQuery)) {
        console.log("ESRB Rating " + esrbQuery + " is not in the Library. Redirecting to home.")
        redirect('/')
    }

    let supabaseLibraryQuery = supabase
        .from('library_entries')
        .select('game_id, status, created_at, completed_all_achievements, hours_played, play_count')
        .eq('user_id', user.id)

    if (status) supabaseLibraryQuery = supabaseLibraryQuery.eq('status', statusQuery)

    if (sortQuery === 'date_added') supabaseLibraryQuery = supabaseLibraryQuery.order('created_at', { ascending: orderQuery === 'asc' })
    
    const { data: libraryEntries } = await supabaseLibraryQuery
    const libraryGameIds = libraryEntries?.map(e => e.game_id) ?? []

    const { data: gamesData } = await supabase.rpc('query_games', {
        p_q: query || null,
        p_genre: genreQuery || null,
        p_platform: platformQuery || null,
        p_developer: developerQuery || null,
        p_publisher: publisherQuery || null,
        p_esrb: esrbQuery || null,
        p_sort: sortQuery,
        p_order: orderQuery,
        p_user_id: user ? user.id : null,
        p_game_ids: libraryGameIds,
        p_limit: 9999
    })

    const games = gamesData ? gamesData as GameData[] : []

    const finalGameIds = games?.map(g => g.id) ?? []
    const { data: developerLinks } = await supabase
        .from('game_developers')
        .select('game_id, developers(name)')
        .in('game_id', finalGameIds)
    
    const developerMap = new Map(developerLinks?.reverse().map(d => [d.game_id, (d.developers as any)?.name ?? null]))

    return (
        <main>
            <div className="w-full max-w-6xl mx-auto px-8 py-12">
                <h2 className="text-center text-5xl mb-6 font-bold">Library</h2>
                {/* Filters */}
                <LibraryFilters
                    current={{query: query, genre: genreQuery, platform: platformQuery, developer: developerQuery, publisher: publisherQuery, 
                        esrb: esrbQuery, sort: sortQuery, order: orderQuery, status: statusQuery}}
                    genres={genres ?? []}
                    platforms={platforms ?? []}
                    developers={developers ?? []}
                    publishers={publishers ?? []}
                    esrb_ratings={esrbRatings ?? []}
                />

                {/* Game grid */}
                {games && games.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {games.map(game => (
                            <GameCard 
                                key={game.id} 
                                game={{ id: String(game.id), name: game.name, slug: game.slug, cover_image_url: game.cover_image_url, metacritic_score: game.metacritic_score, released: game.released }} 
                                developer={developerMap.get(game.id)} 
                                userRating={game.user_rating} 
                                ngplusRating={game.avg_ngplus_rating}
                                advancedStats={{ is100: libraryEntries?.find(le => le.game_id == game.id)?.completed_all_achievements, hoursPlayed: libraryEntries?.find(le => le.game_id == game.id)?.hours_played, playCount: libraryEntries?.find(le => le.game_id == game.id)?.play_count }}
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
                            Try a different search, or browse <Link href="/games" className="text-[#00d4aa] hover:underline">all games</Link> and add to your Library.
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