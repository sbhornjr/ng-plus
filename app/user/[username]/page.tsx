import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Image from "next/image";
import TitleSelectButton from "@/app/components/TitleSelectButton";
import AvatarUploader from "@/app/components/AvatarUploader";
import FavoriteGamePicker from "@/app/components/FavoriteGamePicker";
import GameCard from "@/app/components/GameCard";
import Review from "@/app/components/Review";
import Link from "next/link";
import FollowButton from "@/app/components/FollowButton";

type ProfilePageProps = {
    params: Promise<{ username: string }>
}

type DeveloperStatType = {
    developer_name: string,
    avg_rating: number,
    weighted_rating: number,
    game_count: number,
    rated_count: number
}

type Game = {
    id: string
    name: string
    slug: string
    cover_image_url: string | null
    metacritic_score: number | null
    released: string | null
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { username } = await params;
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, bio, created_at, selected_title, favorite_game_ids')
        .eq('username', username)
        .single()

    if (!profile) notFound()

    const { data: { user: viewer } } = await supabase.auth.getUser()
    const isOwnProfile = viewer?.id === profile.id

    const { data: libraryEntries, count: totalGames } = await supabase
        .from('library_entries')
        .select('status', { count: 'exact' })
        .eq('user_id', profile.id)

    const { data: favoriteGamesData } = profile.favorite_game_ids?.length > 0
        ? await supabase
            .from('games')
            .select('id, name, slug, cover_image_url, metacritic_score, released')
            .in('id', profile.favorite_game_ids)
        : { data: [] }
    const favoriteGames = favoriteGamesData ? favoriteGamesData as Game[] : []
    const orderedFavorites = profile.favorite_game_ids.map((id: string) => favoriteGames?.find(g => g.id === id)).filter(Boolean).reverse()

    const { data: recentReviews } = await supabase
        .from('ratings_reviews')
        .select('user_id, rating, review, created_at, updated_at, users(username, display_name, avatar_url), games(name, slug)')
        .eq('user_id', profile.id)
        .neq('review', '')
        .order('created_at', { ascending: false })
        .limit(3)

    const { data: developer_stats_data } = await supabase.rpc('get_loadout_developer_stats', { p_user_id: profile.id })
    const developerStats = developer_stats_data ? developer_stats_data as DeveloperStatType[] : []
    const topDeveloperNames = developerStats.slice(0, 6).map(d => d.developer_name)

    const { data: ratingStats } = await supabase
        .from('ratings_reviews')
        .select('rating')
        .eq('user_id', profile.id)

    const avgRating = ratingStats ? ratingStats.reduce((acc, r) => { return acc + r.rating }, 0) / ratingStats.length : 0

    const currentTitle = profile.selected_title ? profile.selected_title : "Title-less Noob"

    const { data: followersData } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", profile.id)
    const followersCount = followersData ? followersData.length : 0

    const { data: followingData } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", profile.id)
    const followingCount = followingData ? followingData.length : 0

    return (
        <main>
            <div className="w-full max-w-6xl mx-auto px-8 py-12">
                <div className="flex gap-8 mb-4">
                    {isOwnProfile ? (
                        <AvatarUploader userId={profile.id} username={username} currentAvatarUrl={profile.avatar_url} />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-[#2a2a35] flex items-center justify-center
                            text-xs font-bold text-[#00d4aa] overflow-hidden relative">
                            {profile.avatar_url ? (
                                <Image
                                    src={profile.avatar_url}
                                    alt={username}
                                    fill
                                    className="object-cover transition-all duration-100 group-hover:scale-105"
                                    sizes="160px"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-[#2a2a35] border border-[#00d4aa]
                                    flex items-center justify-center">
                                    <span className="text-2xl font-bold text-[#00d4aa] font-(family-name:--font-display)">
                                        {username[0].toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex flex-col">
                        <h2 className="text-3xl font-semibold font-(family-name:--font-display)">{username}</h2>
                        <div className="flex">
                            <p className="text-lg font-semibold font-(family-name:--font-display)">{currentTitle}</p>
                            {isOwnProfile && <TitleSelectButton userId={profile.id} currentTitle={currentTitle} topGames={favoriteGames ? favoriteGames.map(g => g.name) : []} topDevelopers={topDeveloperNames} />}
                        </div>
                        <p className="text-md font-semibold font-(family-name:--font-display) text-[#8b8b9a]">Member since {new Date(profile.created_at).getMonth() + 1}/{new Date(profile.created_at).getDate()}/{new Date(profile.created_at).getFullYear()}</p>
                        <p className="text-md font-semibold font-(family-name:--font-display) text-[#8b8b9a]">{followersCount} Followers | {followingCount} Following</p>
                    </div>
                    {isOwnProfile ? (
                        <div className="flex flex-row gap-2 items-center ml-auto">
                            <Link href="/library" className="px-6 py-2 rounded-lg text-sm font-semibold bg-[#00d4aa] text-[#0e0e10]
                                hover:bg-[#00b894] transition-colors duration-200 font-(family-name:--font-display)">Library</Link>
                            <Link href="/loadout" className="px-6 py-2 rounded-lg text-sm font-semibold bg-[#00d4aa] text-[#0e0e10]
                                hover:bg-[#00b894] transition-colors duration-200 font-(family-name:--font-display)">Loadout</Link>
                            <Link href={`/user/${username}/lists`} className="px-6 py-2 rounded-lg text-sm font-semibold bg-[#00d4aa] text-[#0e0e10]
                                hover:bg-[#00b894] transition-colors duration-200 font-(family-name:--font-display)">Lists</Link>
                        </div>
                    ) : (
                        <div className="flex flex-row gap-2 items-center ml-auto">
                            {viewer && <FollowButton userId={viewer.id} targetUserId={profile.id} initialIsFollowing={!!followersData?.find(f => f.follower_id === viewer?.id)} />}
                            <Link href={`/user/${username}/lists`} className="px-6 py-2 rounded-lg text-sm font-semibold bg-[#00d4aa] text-[#0e0e10]
                                hover:bg-[#00b894] transition-colors duration-200 font-(family-name:--font-display)">Lists</Link>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 mt-4">
                    {[
                        { label: 'Games', value: totalGames },
                        { label: 'Completed', value: libraryEntries?.filter(l => l.status === "completed").length },
                        { label: 'Rated', value: ratingStats?.length },
                        { label: 'Avg Rating', value: avgRating },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-[#1a1a1f] border border-[#2a2a35] rounded-xl p-5 text-center">
                            <p className="text-3xl font-bold font-(family-name:--font-display) text-[#00d4aa]">{value}</p>
                            <p className="text-sm text-[#8b8b9a] mt-1">{label}</p>
                        </div>
                    ))}
                </div>
                <div className="flex flex-row gap-2 mb-2 mt-4">
                    <h2 className="text-3xl font-semibold font-(family-name:--font-display)">Favorite Games</h2>
                    {isOwnProfile && <FavoriteGamePicker userId={profile.id} currentGames={favoriteGames}/>}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {orderedFavorites.map((g: Game) => <GameCard key={g.id} game={g}/>)}
                </div>
                <div className="mt-6 flex flex-col">
                    <p className="text-md italic text-center w-1/2 self-center max-w-2xl mx-auto mb-8 mt-8">{profile.bio}</p>
                    <div className="flex flex-row justify-between">
                        <h2 className="text-3xl font-semibold font-(family-name:--font-display) mb-2">Recent Reviews</h2>
                        <Link className="hover:text-[#00d4aa] transition-colors duration-200" href={`/user/${username}/ratings_reviews`}>View All</Link>
                    </div>
                    {recentReviews?.map(r => <Review key={r.games.name} gameName={r.games.name} gameSlug={r.games.slug} rating_review={r}/>)}
                </div>
            </div>
        </main>
    )
}