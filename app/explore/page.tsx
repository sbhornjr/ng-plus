import { createClient } from "@/lib/supabase-server";
import GameCard from "@/app/components/GameCard";
import Link from "next/link";
import ListPreview from "@/app/components/ListPreview";
import UserCard from "../components/UserCard";

type ExplorePageProps = {
    searchParams: Promise<{ range?: string }>
}

type TrendingGame = {
    game_id: string
    game_name: string
    game_slug: string
    game_cover_image_url: string | null
    game_released: string | null
    metacritic_score: number | null
    game_developer: string | null
    avg_rating: number | null
    user_rating: number | null
}

type TrendingList = {
    list_id: string
    list_name: string
    list_description: string | null
    owner_username: string
    last_activity: string
    game_count: number
    like_count: number
    recent_like_count: number
    user_has_liked: boolean
    cover_urls: string[] | null
}

type RecommendedGame = {
    game_id: string
    game_name: string
    game_slug: string
    game_cover_image_url: string | null
    game_released: string | null
    metacritic_score: number | null
    game_developer: string | null
    avg_follower_rating: number | null
    follower_count: number | null
    platform_avg_rating: number | null
    user_library_status: string | null
}

type RecommendedList = {
    list_id: string
    list_name: string
    list_description: string | null
    owner_username: string
    last_activity: string
    follower_like_count: number
    total_like_count: number
    user_has_liked: boolean
    cover_urls: string[] | null
    game_count: number
}

type RecommendedUser = {
    user_id: string
    username: string
    display_name: string | null
    avatar_url: string | null
    selected_title: string | null
    created_at: string
    mutual_follower_count: number
    follower_count: number
    following_count: number
    game_count: number
    avg_rating: number | null
}

export default async function Explore({ searchParams }: ExplorePageProps) {
    const { range } = await searchParams;
    const supabase = await createClient()

    const { data: { user: viewer } } = await supabase.auth.getUser()

    const rangeToDays: Record<string, number> = {
        week: 7,
        month: 30,
        year: 365,
        alltime: 3650
    }

    const rangeString = range ?? "week"
    const days = rangeToDays[rangeString] ?? 7

    const { data: trendingGamesData } = await supabase.rpc("get_trending_games", { p_user_id: viewer?.id ?? null, p_days: days })
    const trendingGames = trendingGamesData ? trendingGamesData as TrendingGame[] : []

    const { data: trendingListsData } = await supabase.rpc("get_trending_lists", { p_user_id: viewer?.id ?? null, p_days: days })
    const trendingLists = trendingListsData ? trendingListsData as TrendingList[] : []

    const [{ data: recommendedGamesData }, { data: recommendedListsData }, { data: recommendedUsersData }] = 
        await Promise.all([
            supabase.rpc("get_follow_recommendations", { p_user_id: viewer?.id ?? null }),
            supabase.rpc("get_recommended_lists", { p_user_id: viewer?.id ?? null }),
            supabase.rpc("get_who_to_follow", { p_user_id: viewer?.id ?? null })
        ])

    const recommendedGames = recommendedGamesData ? recommendedGamesData as RecommendedGame[] : []
    const recommendedLists = recommendedListsData ? recommendedListsData as RecommendedList[] : []
    const recommendedUsers = recommendedUsersData ? recommendedUsersData as RecommendedUser[] : []

    console.log("Recommended Games:", recommendedGames)
    console.log("Recommended Lists:", recommendedLists)
    console.log("Recommended Users:", recommendedUsers)

    return (
        <main>
            <div className="flex flex-col items-center justify-center pt-10 pb-4 text-center max-w-6xl mx-auto w-full">
                <p className="text-[#00d4aa] text-3xl font-semibold tracking-widest uppercase mb-1 font-(family-name:--font-display)">
                    Explore The Gaming World
                </p>
            </div>

            <div className="flex flex-col items-center justify-center pt-4 pb-8 w-full max-w-6xl mx-auto px-8">
                <div className="flex gap-1 mb-6 max-w-6xl mx-auto">
                    {["week", "month", "year", "alltime"].map(r => (
                        <Link
                            key={r}
                            href={`/explore?range=${r}`}
                            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors duration-200
                            ${range === r 
                            ? "bg-[#00d4aa] text-[#0e0e10]"
                            : "text-[#8b8b9a] hover:text-[#f0f0f0]"}`}
                        >
                            {r === "week" ? "This Week" : r === "month" ? "This Month" : r === "year" ? "This Year" : "All Time"}
                        </Link>
                    ))}
                </div>

                <h2 className="text-4xl font-bold mb-4 font-(family-name:--font-display) tracking-tight text-left w-full max-w-6xl mx-auto">
                    Trending Games
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
                    {trendingGames.map(game => (
                        <GameCard 
                            key={game.game_id} 
                            game={{ id: game.game_id, name: game.game_name, slug: game.game_slug, cover_image_url: game.game_cover_image_url, metacritic_score: game.metacritic_score, released: game.game_released }}
                            developer={game.game_developer} 
                            ngplusRating={game.avg_rating} 
                            userRating={game.user_rating} />
                    ))}
                </div>

                {viewer && (
                    <div className="flex flex-col items-center justify-center pt-8 pb-2 w-full">
                        <h2 className="text-4xl font-bold mb-4 font-(family-name:--font-display) tracking-tight text-left w-full max-w-6xl mx-auto">
                            Recommended For You
                        </h2>
                        <p className="text-sm text-[#8b8b9a] mb-2 text-left w-full max-w-6xl mx-auto">
                            Follow more users to get more recommendations.
                        </p>
                        {recommendedGames.length > 0 && (
                            <div className="flex flex-col items-center justify-center pt-4 pb-8 w-full max-w-6xl mx-auto">
                                <h2 className="text-2xl font-bold mb-4 font-(family-name:--font-display) tracking-tight text-left w-full max-w-6xl mx-auto">
                                    Recommended Games
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
                                    {recommendedGames.map(game => (
                                        <div key={game.game_id} className="flex flex-col gap-1">
                                            <p className="text-xs text-[#8b8b9a] text-center">
                                                <span className="text-[#00d4aa] font-semibold">{game.follower_count}</span>
                                                {game.follower_count === 1 ? ' follower' : ' followers'} completed · {game.avg_follower_rating}/10 avg
                                            </p>
                                            <GameCard 
                                                key={game.game_id} 
                                                game={{ id: game.game_id, name: game.game_name, slug: game.game_slug, cover_image_url: game.game_cover_image_url, metacritic_score: game.metacritic_score, released: game.game_released }}
                                                developer={game.game_developer} 
                                                ngplusRating={game.platform_avg_rating} 
                                                userRating={null} 
                                            />
                                            {game.user_library_status !== 'none' && (
                                                <p className="text-xs text-[#8b8b9a] text-center">
                                                {game.user_library_status === 'backlog' ? 'In your backlog' : 'On your wishlist'}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {recommendedLists.length > 0 && (
                            <div className="flex flex-col pt-4 pb-8 w-full max-w-6xl mx-auto">
                                <h2 className="text-2xl font-bold mb-4 font-(family-name:--font-display) tracking-tight text-left w-full max-w-6xl mx-auto">
                                    Recommended Lists
                                </h2>
                                <div className="flex flex-col gap-4 w-full">
                                    {recommendedLists.map(list => (
                                        <div key={list.list_id} className="flex flex-col gap-0.5 w-full">
                                            <div className="text-xs text-[#8b8b9a] mb-2 text-left">
                                                <span className="text-[#00d4aa] font-semibold">{list.follower_like_count}</span>
                                                {list.follower_like_count === 1 ? ' user' : ' users'} you follow liked this
                                            </div>                                            
                                            <ListPreview 
                                                listId={parseInt(list.list_id)} 
                                                listName={list.list_name} 
                                                description={list.list_description} 
                                                username={list.owner_username} 
                                                listCount={list.game_count} 
                                                likeCount={list.total_like_count} 
                                                gameCovers={list.cover_urls?.map(url => ({ coverImageUrl: url, slug: null }))}
                                                isPinnable={false}
                                                isLikable={true}
                                                isPinned={false}
                                                userHasLiked={list.user_has_liked}
                                                activeUserId={viewer?.id}
                                                lastUpdated={list.last_activity}
                                                fullLength={true}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {recommendedUsers.length > 0 && (
                            <div className="flex flex-col items-center justify-center pt-4 pb-8 w-full max-w-6xl mx-auto">
                                <h2 className="text-2xl font-bold mb-4 font-(family-name:--font-display) tracking-tight text-left w-full max-w-6xl mx-auto">
                                    Recommended Users
                                </h2>
                                <div className="grid grid-col grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl mx-auto">
                                    {recommendedUsers.map(user => (
                                        <div key={user.user_id} className="flex flex-col gap-2 w-full">
                                            <p className="text-sm text-left text-[#8b8b9a] mt-2">followed by
                                                <span className="text-[#00d4aa] font-semibold">{" " + user.mutual_follower_count}</span> users you follow</p>
                                            <UserCard 
                                                username={user.username} 
                                                avatarUrl={user.avatar_url}
                                                title={user.selected_title}
                                                createdAt={user.created_at}
                                                followerCount={user.follower_count}
                                                followingCount={user.following_count}
                                                gameCount={user.game_count ?? 0}
                                                avgRating={user.avg_rating ?? 0} 
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <h2 className="text-4xl font-bold mb-4 mt-8 font-(family-name:--font-display) tracking-tight text-left w-full max-w-6xl mx-auto">
                    Popular Lists
                </h2>
                <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto">
                    {trendingLists.map(list => (
                        <ListPreview 
                            key={list.list_id} 
                            listId={parseInt(list.list_id)} 
                            listName={list.list_name} 
                            gameCovers={list.cover_urls?.map(url => ({ coverImageUrl: url, slug: null }))} 
                            isPinnable={false} 
                            isLikable={true} 
                            description={list.list_description ?? ''} 
                            lastUpdated={list.last_activity ?? ''} 
                            username={list.owner_username ?? ''} 
                            listCount={list.game_count ?? 0} 
                            likeCount={list.like_count ?? 0} 
                            userHasLiked={list.user_has_liked ?? false} 
                            activeUserId={viewer?.id}
                            fullLength={true}
                        />
                    ))}
                </div>
            </div>
        </main>
    )
}