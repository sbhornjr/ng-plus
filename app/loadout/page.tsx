import { createClient } from "@/lib/supabase-server";
import GameCard from "@/app/components/GameCard";
import { redirect } from "next/navigation";
import DistributionChart from "../components/DistributionChart";
import { generateLoadoutIdentity } from "@/lib/loadout";
import SubmitBioButton from "../components/SubmitBioButton";

type HighlightType = {
    cover_image_url: string,
    game_id: string,
    game_name: string,
    game_slug: string,
    highlight_type: string,
    rating: number
}

type GenreStatType = {
    avg_rating: number,
    completed_count: number,
    genre_id: string,
    genre_name: string,
    rated_count: number,
    total_count: number,
    weighted_rating: number
}

type DeveloperStatType = {
    developer_name: string,
    avg_rating: number,
    weighted_rating: number,
    game_count: number,
    rated_count: number
}

type StatusStatType = {
    status: string,
    count: number
}

type RatingReviewType = {
    game_id: number,
    rating: number,
    review: string
}

export default async function LoadoutPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/')

    const [
        { data: genre_stats_data }, 
        { data: developer_stats_data },
        { data: status_stats_data }, 
        { data: highlights_data },
        { data: ratings_reviews }
    ] = await Promise.all([
        supabase.rpc('get_loadout_genre_stats', { p_user_id: user.id }),
        supabase.rpc('get_loadout_developer_stats', { p_user_id: user.id }),
        supabase.rpc('get_loadout_status_breakdown', { p_user_id: user.id }),
        supabase.rpc('get_loadout_rating_highlights', { p_user_id: user.id }),
        supabase
            .from('ratings_reviews')
            .select('game_id, rating, review')
            .eq('user_id', user.id)
    ])

    const genreStats = genre_stats_data ? genre_stats_data as GenreStatType[] : []
    const developerStats = developer_stats_data ? developer_stats_data as DeveloperStatType[] : []
    const statusStats = status_stats_data ? status_stats_data as StatusStatType[] : []
    const highlights = highlights_data ? highlights_data as HighlightType[] : []
    const ratingsReviews = ratings_reviews ? ratings_reviews as RatingReviewType[] : []

    const backlogStat = statusStats.find(s => s.status == "backlog")
    const playingStat = statusStats.find(s => s.status == "playing")
    const abandonedStat = statusStats.find(s => s.status == "abandoned")
    const completedStat = statusStats.find(s => s.status == "completed")
    const totalGames = statusStats.reduce((acc, s) => { return acc + s.count}, 0)

    const avgRating = ratingsReviews.reduce((acc, r) => { return acc + r.rating}, 0) / ratingsReviews.length
    const ratingDistribution = [10,9,8,7,6,5,4,3,2,1].map(n => ({
        name: n,
        count: ratingsReviews.filter(r => r.rating === n).length
    }))

    let loadoutIdentity = ''
    if (ratingsReviews.length >= 5) {
        loadoutIdentity = await generateLoadoutIdentity({
            username: user.id,
            totalGames: totalGames,
            completedGames: completedStat ? completedStat.count : 0,
            totalRatings: ratingsReviews.length,
            avgRating,
            topGenres: genreStats ?? [],
            topDevelopers: developerStats ?? []
        })
    }

    return (
        <main>
            <div className="w-full max-w-6xl mx-auto px-8 py-12">
                <h2 className="text-center text-5xl mb-6 font-bold">Loadout</h2>
                <div className="flex flex-col gap-4">
                    {loadoutIdentity ? (
                        <div className="mb-12 max-w-2xl mx-auto text-center">
                            <p className="text-xs font-semibold text-[#8b8b9a] uppercase tracking-widest mb-3
                            font-(family-name:--font-display)">
                                Your Gaming Identity
                            </p>
                            <p className="text-lg text-[#f0f0f0] leading-relaxed italic">
                                "{loadoutIdentity}"
                            </p>
                            <SubmitBioButton userId={user.id} bio={loadoutIdentity} />
                        </div>
                    ) : (
                        <div className="mb-12 max-w-2xl mx-auto text-center">
                            <p className="text-sm text-[#8b8b9a]">
                            Rate at least 5 games to unlock your Gaming Identity.
                            </p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        {[
                            { label: 'Games', value: totalGames },
                            { label: 'Completed', value: completedStat?.count },
                            { label: 'Rated', value: ratingsReviews.length },
                            { label: 'Avg Rating', value: avgRating },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-[#1a1a1f] border border-[#2a2a35] rounded-xl p-5 text-center">
                            <p className="text-3xl font-bold font-(family-name:--font-display) text-[#00d4aa]">{value}</p>
                            <p className="text-sm text-[#8b8b9a] mt-1">{label}</p>
                            </div>
                        ))}
                    </div>
                    <h2 className="text-xl border-t font-semibold text-[#8b8b9a] uppercase tracking-widest mb-6 font-(family-name:--font-display)">Your Rating Style</h2>
                    <DistributionChart data={ratingDistribution}/>
                    <h2 className="text-xl border-t font-semibold text-[#8b8b9a] uppercase tracking-widest mb-6 font-(family-name:--font-display)">Your Favorite Genres</h2>
                    {genreStats && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                            {genreStats.filter(g => g.rated_count > 1).slice(0, 6).map(g => (
                                <div key={g.genre_name} className="bg-[#1a1a1f] border border-[#2a2a35] rounded-xl p-5 flex flex-col gap-2">
                                    <h3 className="text-xl font-bold font-(family-name:--font-display) px-4 py-2">{g.genre_name}</h3>
                                    <div className="flex items-baseline gap-1 px-4">
                                        <span className="text-3xl font-bold rounded-lg px-1" style={{
                                            backgroundColor: g.weighted_rating >= 8
                                            ? '#00d4aa'
                                            : g.weighted_rating >= 6
                                            ? '#f0a500'
                                            : '#e05555',
                                            color: '#0e0e10',
                                        }}>{g.weighted_rating}</span>
                                        <span className="text-sm text-[#8b8b9a]">avg</span>
                                    </div>
                                    <p className="text-xs text-[#8b8b9a] px-4 py-2">{g.rated_count} games rated · {g.completed_count} completed</p>
                                </div>
                            ))}             
                        </div>
                    )}
                    <h2 className="text-xl border-t font-semibold text-[#8b8b9a] uppercase tracking-widest mb-6 font-(family-name:--font-display)">Your Favorite Developers</h2>
                    {developerStats && (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {developerStats.filter(d => d.rated_count > 1).slice(0, 6).map(d => (
                                <div key={d.developer_name} className="bg-[#1a1a1f] border border-[#2a2a35] rounded-xl p-5 flex flex-col gap-2">
                                    <h3 className="text-xl font-bold font-(family-name:--font-display) px-4 py-2">{d.developer_name}</h3>
                                    <div className="flex items-baseline gap-1 px-4">
                                        <span className="text-3xl font-bold rounded-lg px-1" style={{
                                            backgroundColor: d.weighted_rating >= 8
                                            ? '#00d4aa'
                                            : d.weighted_rating >= 6
                                            ? '#f0a500'
                                            : '#e05555',
                                            color: '#0e0e10',
                                        }}>{d.weighted_rating}</span>
                                        <span className="text-sm text-[#8b8b9a]">avg</span>
                                    </div>
                                    <p className="text-xs text-[#8b8b9a] px-4 py-2">{d.rated_count} games rated · {d.game_count} total</p>
                                </div>
                            ))}             
                        </div>
                    )}
                    <h2 className="text-xl border-t font-semibold text-[#8b8b9a] uppercase tracking-widest mb-6 font-(family-name:--font-display)">Your Perfect Games</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                        {highlights.filter(h => h.highlight_type == "top").map(h => 
                            <GameCard key={h.game_id} game={{id: h.game_id, name: h.game_name, slug: h.game_slug, cover_image_url: h.cover_image_url, metacritic_score: null, released: null}}/>
                        )}
                    </div>
                    <h2 className="text-xl border-t font-semibold text-[#8b8b9a] uppercase tracking-widest mb-6 font-(family-name:--font-display)">Your Lowest Rated</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                        {highlights.filter(h => h.highlight_type == "bottom").map(h => 
                            <GameCard key={h.game_id} game={{id: h.game_id, name: h.game_name, slug: h.game_slug, cover_image_url: h.cover_image_url, metacritic_score: null, released: null}}/>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}