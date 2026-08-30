import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import TitleSelectButton from "@/app/components/user/TitleSelectButton";
import AvatarUploader from "@/app/components/user/AvatarUploader";
import Avatar from "@/app/components/user/Avatar";
import FavoriteGamePicker from "@/app/components/game/FavoriteGamePicker";
import GameCard from "@/app/components/game/GameCard";
import Review from "@/app/components/game/Review";
import Link from "next/link";
import FollowButton from "@/app/components/user/FollowButton";
import BioButton from "@/app/components/user/BioButton";
import StatGrid from "@/app/components/util/StatGrid";
import { GameData } from "@/types";
import { getViewer, getFullProfile, getFollowers, getFollowing } from "@/lib/queries/user";
import { queryGames, getDeveloperNameMap } from "@/lib/queries/game";
import { getLibraryStatusBreakdown } from "@/lib/queries/library";
import { getRecentReviews, getUserRatings } from "@/lib/queries/review";
import { getLoadoutDeveloperStats } from "@/lib/queries/stats";

type ProfilePageProps = {
    params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { username } = await params;
    const supabase = await createClient()

    const profile = await getFullProfile(supabase, username)

    if (!profile) notFound()

    const viewer = await getViewer(supabase)
    const isOwnProfile = viewer?.id === profile.id

    const { entries: libraryEntries, totalCount: totalGames } = await getLibraryStatusBreakdown(supabase, profile.id)

    const favoriteGamesData = profile.favorite_game_ids?.length > 0
        ? await queryGames(supabase, { userId: viewer ? viewer.id : null, gameIds: profile.favorite_game_ids })
        : []
    const favoriteGames = favoriteGamesData as GameData[]
    const orderedFavorites = profile.favorite_game_ids.map((id: string) => favoriteGames?.find(g => String(g.id) === id)).filter(Boolean).reverse() as GameData[]

    const developerMap = await getDeveloperNameMap(supabase, profile.favorite_game_ids)

    const recentReviews = await getRecentReviews(supabase, profile.id)

    const developerStats = await getLoadoutDeveloperStats(supabase, profile.id)
    const topDeveloperNames = developerStats.slice(0, 6).map(d => d.developer_name)

    const ratingStats = await getUserRatings(supabase, profile.id)

    const avgRating = ratingStats.length > 0 ? ratingStats.reduce((acc, r) => { return acc + r.rating }, 0) / ratingStats.length : 0

    const currentTitle = profile.selected_title ? profile.selected_title : "Title-less Noob"

    const followersData = await getFollowers(supabase, profile.id)
    const followersCount = followersData.length

    const followingData = await getFollowing(supabase, profile.id)
    const followingCount = followingData.length

    return (
        <main>
            <div className="w-full max-w-6xl mx-auto px-8 py-12">
                <div className="flex gap-8 mb-4">
                    {isOwnProfile ? (
                        <AvatarUploader userId={profile.id} username={username} currentAvatarUrl={profile.avatar_url} />
                    ) : (
                        <Avatar src={profile.avatar_url} alt={username} size="lg" />
                    )}
                    <div className="flex flex-col">
                        <h2 className="text-3xl font-semibold font-(family-name:--font-display)">{username}</h2>
                        <div className="flex">
                            <p className="text-lg font-semibold font-(family-name:--font-display)">{currentTitle}</p>
                            {isOwnProfile && <TitleSelectButton userId={profile.id} currentTitle={currentTitle} topGames={favoriteGames ? favoriteGames.map(g => g.name) : []} topDevelopers={topDeveloperNames} />}
                        </div>
                        <p className="text-md font-semibold font-(family-name:--font-display) text-(--color-muted)">Member since {new Date(profile.created_at).getMonth() + 1}/{new Date(profile.created_at).getDate()}/{new Date(profile.created_at).getFullYear()}</p>
                        <p className="text-md font-semibold font-(family-name:--font-display) text-(--color-muted)">{followersCount} Followers | {followingCount} Following</p>
                    </div>
                    {isOwnProfile ? (
                        <div className="flex flex-row gap-2 items-center ml-auto">
                            <Link href={`/user/${username}/library`} className="px-6 py-2 rounded-[3px] text-sm font-semibold bg-(--color-accent) text-(--color-bg)
                                hover:bg-(--color-accent-hover) transition-colors duration-200 font-(family-name:--font-display)">Library</Link>
                            <Link href={`/user/${username}/loadout`} className="px-6 py-2 rounded-[3px] text-sm font-semibold bg-(--color-accent) text-(--color-bg)
                                hover:bg-(--color-accent-hover) transition-colors duration-200 font-(family-name:--font-display)">Loadout</Link>
                            <Link href={`/user/${username}/lists`} className="px-6 py-2 rounded-[3px] text-sm font-semibold bg-(--color-accent) text-(--color-bg)
                                hover:bg-(--color-accent-hover) transition-colors duration-200 font-(family-name:--font-display)">Lists</Link>
                        </div>
                    ) : (
                        <div className="flex flex-row gap-2 items-center ml-auto">
                            {viewer && <FollowButton userId={viewer.id} targetUserId={profile.id} initialIsFollowing={!!followersData?.find(f => f.follower_id === viewer?.id)} />}
                            {profile.library_public && <Link href={`/user/${username}/library`} className="px-6 py-2 rounded-[3px] text-sm font-semibold bg-(--color-accent) text-(--color-bg)
                                hover:bg-(--color-accent-hover) transition-colors duration-200 font-(family-name:--font-display)">Library</Link>}
                            {profile.loadout_public && <Link href={`/user/${username}/loadout`} className="px-6 py-2 rounded-[3px] text-sm font-semibold bg-(--color-accent) text-(--color-bg)
                                hover:bg-(--color-accent-hover) transition-colors duration-200 font-(family-name:--font-display)">Loadout</Link>}
                            <Link href={`/user/${username}/lists`} className="px-6 py-2 rounded-[3px] text-sm font-semibold bg-(--color-accent) text-(--color-bg)
                                hover:bg-(--color-accent-hover) transition-colors duration-200 font-(family-name:--font-display)">Lists</Link>
                        </div>
                    )}
                </div>
                <StatGrid className="mt-4" stats={[
                    { label: 'Games', value: totalGames },
                    { label: 'Completed', value: libraryEntries?.filter(l => l.status === "completed").length },
                    { label: 'Rated', value: ratingStats?.length },
                    { label: 'Avg Rating', value: Math.trunc(avgRating * Math.pow(10, 2)) / Math.pow(10, 2) },
                ]} />
                <div className="flex flex-row gap-2 mb-2 rounded-[3px]">
                    <h2 className="text-3xl font-semibold font-(family-name:--font-display)">Bio</h2>
                    {isOwnProfile && <BioButton userId={profile.id} currentBio={profile.user_bio} />}
                </div>
                {profile.user_bio}
                <div className="flex flex-row gap-2 mb-2 mt-4">
                    <h2 className="text-3xl font-semibold font-(family-name:--font-display)">Favorite Games</h2>
                    {isOwnProfile && <FavoriteGamePicker userId={profile.id} currentGames={favoriteGames.map(g => ({ id: String(g.id), name: g.name, slug: g.slug, cover_image_url: g.cover_image_url, metacritic_score: g.metacritic_score, released: g.released }))}/>}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {orderedFavorites.map((g: GameData) => 
                        <GameCard 
                            key={g.id} 
                            game={{ id: String(g.id), name: g.name, slug: g.slug, cover_image_url: g.cover_image_url, metacritic_score: g.metacritic_score, released: g.released }} 
                            developer={developerMap.get(String(g.id))}
                            userRating={g.user_rating} 
                            ngplusRating={g.avg_ngplus_rating}
                        />
                    )}
                </div>
                <div className="mt-6 flex flex-col">
                    <p className="text-md italic text-center w-1/2 self-center max-w-2xl mx-auto mb-8 mt-8">{profile.bio}</p>
                    <div className="flex flex-row justify-between">
                        <h2 className="text-3xl font-semibold font-(family-name:--font-display) mb-2">Recent Reviews</h2>
                        <Link className="hover:text-(--color-accent) transition-colors duration-200" href={`/user/${username}/ratings_reviews`}>View All</Link>
                    </div>
                    {recentReviews?.map(r => <Review key={r.games.name} gameName={r.games.name} gameSlug={r.games.slug} rating_review={r}/>)}
                </div>
            </div>
        </main>
    )
}