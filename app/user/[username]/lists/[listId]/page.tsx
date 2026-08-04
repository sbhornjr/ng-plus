import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import GameCard from "@/app/components/GameCard";
import AddToListFromListButton from "@/app/components/AddToListFromListButton";
import RemoveFromListButton from "@/app/components/RemoveFromListButton";
import LikeListButton from "@/app/components/LikeListButton";

type ListPageProps = {
    params: Promise<{ username: string, listId: string }>
}

type ListType = {
    id: string,
    name: string,
    description: string,
    is_public: boolean,
    is_default: boolean,
    created_at: string,
    updated_at: string
}

type GameType = {
    games: {
        id: string,
        name: string,
        slug: string,
        cover_image_url: string,
        released: string,
        metacritic_score: string
    }[]
}

type AvgRatingsData = {
    game_id: number
    avg_rating: number
}

export default async function ListPage({ params }: ListPageProps) {
    const { username, listId } = await params;
    const supabase = await createClient()
    const { data: { user: viewer } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url')
        .eq('username', username)
        .single()

    const { data: listData } = await supabase
        .from("lists")
        .select("id, name, description, is_public, is_default, created_at, updated_at")
        .eq("id", listId)
        .single()

    const list = listData as ListType

    if (!list || !profile) notFound()

    const isOwnProfile = viewer?.id === profile.id

    if (!isOwnProfile && !list.is_public) notFound()

    const { data: gamesData } = await supabase
        .from("list_games")
        .select("games(id, name, slug, cover_image_url, released, metacritic_score)")
        .eq("list_id", list.id)
        .order('position', { ascending: true })

    const games = gamesData as GameType[]

    let avgRatingMap = new Map()
    let userRatingMap = new Map()
    let developerMap = new Map()
    const gameIds = games.map(g => g.games.id)

    const { data: likesData } = await supabase
        .from('list_likes')
        .select('user_id')
        .eq('list_id', listId)

    const likeCount = likesData?.length ?? 0
    const userHasLiked = viewer ? likesData?.some(l => l.user_id === viewer.id) ?? false : false

    if (viewer) {
        const [
            { data: avgRatingsData },
            { data: userRatings },
            { data: developerLinks },
        ] = await Promise.all([
            supabase.rpc('get_avg_ratings_for_games', { p_game_ids: gameIds }),
            supabase
                .from('ratings_reviews')
                .select('game_id, rating')
                .eq('user_id', viewer?.id)
                .in('game_id', gameIds),
            supabase
                .from('game_developers')
                .select('game_id, developers(name)')
                .in('game_id', gameIds),
        ])

        const avgRatings = avgRatingsData as AvgRatingsData[]
        avgRatingMap = new Map(avgRatings?.map(r => [r.game_id, r.avg_rating]))
        userRatingMap = new Map(userRatings?.map(r => [r.game_id, r.rating]))
        developerMap = new Map(developerLinks?.reverse().map(d => [d.game_id, (d.developers as any)?.name ?? null]))
    }

    return (
        <main>
            <div className="flex flex-col gap-2 mt-6 items-center justify-center">
                <h2 className="text-5xl font-bold font-(family-name:--font-display) text-center mb-2">{list.name}</h2>
                <div className="flex items-center justify-center gap-4 text-sm text-[#8b8b9a] mb-4">
                    <div className="flex flex-row gap-2 items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-[#2a2a35] flex items-center justify-center
                            text-xs font-bold text-[#00d4aa] relative">
                            {profile.avatar_url ? (
                                <Image
                                    src={profile.avatar_url}
                                    alt={username}
                                    fill
                                    className="object-cover transition-all duration-100 group-hover:scale-105"
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-[#2a2a35] border border-[#00d4aa]
                                    flex items-center justify-center">
                                    <span className="text-2xl font-bold text-[#00d4aa] font-(family-name:--font-display)">
                                        {username[0].toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                        <Link href={`/user/${username}`} className="text-md font-semibold text-[#8b8b9a] hover:text-[#00d4aa] 
                            transition-colors duration-200">{username}</Link>
                    </div>
                    <span>·</span>
                    <span className="text-md font-semibold font-(family-name:--font-display) text-[#8b8b9a]">{games.length} games</span>
                    <span>·</span>
                    <span className="text-md font-semibold font-(family-name:--font-display) text-[#8b8b9a]">Updated {new Date(list.updated_at).getMonth() + 1}/{new Date(list.updated_at).getDate()}/{new Date(list.updated_at).getFullYear()}</span>
                    <span>·</span>
                    <LikeListButton listId={listId} initialLiked={userHasLiked} initialCount={likeCount} userId={viewer?.id ?? null} />
                </div>
                <p className="text-md text-[#8b8b9a] text-center max-w-3xl mb-4">{list.description}</p>
                <div className="w-full max-w-6xl mx-auto px-8">
                    {isOwnProfile && (
                        <AddToListFromListButton listId={listId} currentGames={games.map(g => g.games)} />
                    )}
                    {games && games.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {games.map(game => (
                                <div key={game.games.id} className="flex flex-col gap-1">
                                    <GameCard game={game.games} developer={developerMap.get(game.games.id)} userRating={userRatingMap.get(game.games.id)} ngplusRating={avgRatingMap.get(game.games.id) ?? null}/>
                                    {isOwnProfile && (
                                        <RemoveFromListButton listId={listId} gameId={game.games.id} />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <p className="text-4xl mb-4">🎮</p>
                            <h2 className="text-xl font-semibold mb-2 font-(family-name:--font-display)">
                                No games found
                            </h2>
                        </div>
                    )}
                </div>                
            </div>
        </main>
    )
}