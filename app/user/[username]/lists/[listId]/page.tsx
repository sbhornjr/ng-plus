import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Avatar from "@/app/components/user/Avatar";
import GameCard from "@/app/components/game/GameCard";
import AddToListFromListButton from "@/app/components/lists/AddToListFromListButton";
import RemoveFromListButton from "@/app/components/lists/RemoveFromListButton";
import LikeListButton from "@/app/components/lists/LikeListButton";
import CreateListButton from "@/app/components/lists/CreateListButton";
import EmptyState from "@/app/components/util/EmptyState";
import { getViewer, getProfileSummaryByUsername } from "@/lib/queries/user";
import { getListById, getListGames, getListLikes } from "@/lib/queries/list";
import { getAvgRatingsForGames, getUserRatingsForGames } from "@/lib/queries/review";
import { getDeveloperNameMap } from "@/lib/queries/game";

type ListPageProps = {
    params: Promise<{ username: string, listId: string }>
}

export default async function ListPage({ params }: ListPageProps) {
    const { username, listId } = await params;
    const supabase = await createClient()
    const viewer = await getViewer(supabase)

    const profile = await getProfileSummaryByUsername(supabase, username)

    const list = await getListById(supabase, listId)

    if (!list || !profile) notFound()

    const isOwnProfile = viewer?.id === profile.id

    if (!isOwnProfile && !list.is_public) notFound()

    const games = await getListGames(supabase, list.id)

    let avgRatingMap = new Map()
    let userRatingMap = new Map()
    let developerMap = new Map()
    const gameIds = games.map(g => g.games.id)

    const likesData = await getListLikes(supabase, [listId])

    const likeCount = likesData?.length ?? 0
    const userHasLiked = viewer ? likesData?.some(l => l.user_id === viewer.id) ?? false : false

    if (viewer) {
        const [avgRatings, userRatings, developerMapResult] = await Promise.all([
            getAvgRatingsForGames(supabase, gameIds),
            getUserRatingsForGames(supabase, viewer.id, gameIds),
            getDeveloperNameMap(supabase, gameIds),
        ])

        avgRatingMap = new Map(avgRatings?.map(r => [r.game_id, r.avg_rating]))
        userRatingMap = new Map(userRatings?.map(r => [r.game_id, r.rating]))
        developerMap = developerMapResult
    }

    return (
        <main>
            <div className="flex flex-col gap-2 mt-6 items-center justify-center">
                <h2 className="text-5xl font-bold font-(family-name:--font-display) text-center mb-2">{list.name}</h2>
                <div className="flex items-center justify-center gap-4 text-sm text-(--color-muted) mb-4">
                    <div className="flex flex-row gap-2 items-center justify-center">
                        <Avatar src={profile.avatar_url} alt={username} size="sm" />
                        <Link href={`/user/${username}`} className="text-md font-semibold text-(--color-muted) hover:text-(--color-accent) 
                            transition-colors duration-200">{username}</Link>
                    </div>
                    <span>·</span>
                    <span className="text-md font-semibold font-(family-name:--font-display) text-(--color-muted)">{games.length} games</span>
                    <span>·</span>
                    <span className="text-md font-semibold font-(family-name:--font-display) text-(--color-muted)">Updated {new Date(list.updated_at).getMonth() + 1}/{new Date(list.updated_at).getDate()}/{new Date(list.updated_at).getFullYear()}</span>
                    <span>·</span>
                    <LikeListButton listId={listId} initialLiked={userHasLiked} initialCount={likeCount} userId={viewer?.id ?? null} />
                </div>
                <p className="text-md text-(--color-muted) text-center max-w-3xl mb-4">{list.description}</p>
                <div className="w-full max-w-6xl mx-auto px-8">
                    {isOwnProfile && (
                        <div className="flex flex-row justify-between">
                            <CreateListButton userId={profile.id} type="update" current={{ listId: listId, name: list.name, description: list.description, isPinned: list.is_pinned, isPublic: list.is_public}} />
                            <AddToListFromListButton listId={listId} currentGames={games.map(g => g.games)} />
                        </div>
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
                        <EmptyState title="No games found" />
                    )}
                </div>                
            </div>
        </main>
    )
}