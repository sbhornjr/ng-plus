import { createClient } from "@/lib/supabase-server";
import GameCard from "@/app/components/game/GameCard";
import { redirect } from "next/navigation"
import LibraryFilters from "../components/library/LibraryFilters";
import Link from "next/link";
import EmptyState from "../components/util/EmptyState";
import { getViewer } from "@/lib/queries/user";
import { queryGames, getDeveloperNameMap } from "@/lib/queries/game";
import { getLibraryFacets, getLibraryEntries } from "@/lib/queries/library";

type LibraryPageProps = {
  searchParams: Promise<{ q?: string,genre?: string, platform?: string, developer?: string, 
    publisher?: string, esrb?: string, sort?: string, order?: string, status?: string }>
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

    const user = await getViewer(supabase)
    if (!user) redirect('/')

    const { genres, platforms, developers, publishers, esrbRatings } = await getLibraryFacets(supabase, user.id)

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

    const libraryEntries = await getLibraryEntries(supabase, user.id, { status: statusQuery, sort: sortQuery, order: orderQuery })
    const libraryGameIds = libraryEntries?.map(e => e.game_id) ?? []

    const games = await queryGames(supabase, {
        q: query || null,
        genre: genreQuery || null,
        platform: platformQuery || null,
        developer: developerQuery || null,
        publisher: publisherQuery || null,
        esrb: esrbQuery || null,
        sort: sortQuery,
        order: orderQuery,
        userId: user ? user.id : null,
        gameIds: libraryGameIds,
        limit: 9999
    })

    const finalGameIds = games?.map(g => g.id) ?? []
    const developerMap = await getDeveloperNameMap(supabase, finalGameIds)

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
                    <EmptyState
                        title="No games found"
                        description={<>Try a different search, or browse <Link href="/games" className="text-(--color-accent) hover:underline">all games</Link> and add to your Library.</>}
                        actionHref="/"
                        actionLabel="Back to Home"
                    />
                )}
            </div>
        </main>
    )
}