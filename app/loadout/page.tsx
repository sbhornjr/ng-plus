import { createClient } from "@/lib/supabase-server";
import GameCard from "@/app/components/game/GameCard";
import { redirect } from "next/navigation";
import { generateLoadoutIdentity } from "@/lib/loadout";
import SubmitBioButton from "../components/user/SubmitBioButton";
import { getViewer } from "@/lib/queries/user";
import { getLoadoutGenreStats, getLoadoutDeveloperStats, getLoadoutStatusBreakdown, getLoadoutRatingHighlights } from "@/lib/queries/stats";
import { getUserRatings } from "@/lib/queries/review";

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-[11px] tracking-[0.3em] uppercase text-(--color-muted)
            font-mono border-t border-(--color-muted)/25
            pt-3 mb-5">
            {children}
        </h2>
    )
}

function tierColor(rating: number) {
    return rating >= 8 ? 'var(--color-good)' : rating >= 6 ? 'var(--color-mid)' : 'var(--color-bad)'
}

export default async function LoadoutPage() {
    const supabase = await createClient()
    const user = await getViewer(supabase)
    if (!user) redirect('/')

    const [genreStats, developerStats, statusStats, highlights, ratingsReviews] = await Promise.all([
        getLoadoutGenreStats(supabase, user.id),
        getLoadoutDeveloperStats(supabase, user.id),
        getLoadoutStatusBreakdown(supabase, user.id),
        getLoadoutRatingHighlights(supabase, user.id),
        getUserRatings(supabase, user.id),
    ])

    const backlogStat = statusStats.find(s => s.status == "backlog")
    const playingStat = statusStats.find(s => s.status == "playing")
    const abandonedStat = statusStats.find(s => s.status == "abandoned")
    const completedStat = statusStats.find(s => s.status == "completed")
    const totalGames = statusStats.reduce((acc, s) => { return acc + s.count}, 0)

    const avgRating = ratingsReviews.length > 0 ? ratingsReviews.reduce((acc, r) => { return acc + r.rating}, 0) / ratingsReviews.length : 0
    const ratingDistribution = [10,9,8,7,6,5,4,3,2,1].map(n => ({
        name: n,
        count: ratingsReviews.filter(r => r.rating === n).length
    }))
    const maxDistCount = Math.max(...ratingDistribution.map(d => d.count), 1)

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
        <main className="bg-(--color-bg)">
            <div className="w-full max-w-5xl mx-auto px-6 md:px-10 py-14 font-(family-name:--font-body)">
                <header className="mb-10 text-center">
                    <p className="text-[11px] tracking-[0.35em] uppercase text-(--color-muted)
                        font-mono mb-3">
                        Player Dossier
                    </p>
                    <h1 className="text-5xl md:text-6xl text-(--color-text)
                        font-(family-name:--font-display)">
                        Loadout
                    </h1>
                </header>

                {loadoutIdentity ? (
                    <div className="max-w-2xl mx-auto mb-14 rotate-[-0.5deg]">
                        <div className="border border-(--color-muted)/30 bg-(--color-surface)
                            rounded-[3px] px-7 py-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                            <p className="text-[10px] tracking-[0.3em] uppercase text-(--color-accent)
                                font-mono mb-3">
                                Analyst&apos;s Note
                            </p>
                            <p className="text-lg leading-relaxed text-(--color-text)
                                font-(family-name:--font-display) italic">
                                &ldquo;{loadoutIdentity}&rdquo;
                            </p>
                            <div className="mt-4 flex justify-end">
                                <SubmitBioButton userId={user.id} bio={loadoutIdentity} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-md mx-auto mb-14 text-center">
                        <p className="text-sm text-(--color-muted)">
                            Rate at least 5 games to unlock your dossier entry.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14">
                    {[
                        { label: 'Games Logged', value: totalGames },
                        { label: 'Completed', value: completedStat?.count ?? 0 },
                        { label: 'Rated', value: ratingsReviews.length },
                        { label: 'Avg Rating', value: Math.trunc(avgRating * 100) / 100 },
                    ].map(s => (
                        <div key={s.label} className="border border-(--color-muted)/25
                            bg-(--color-surface) rounded-[3px] py-5 text-center">
                            <p className="text-3xl text-(--color-good) font-mono">
                                {s.value}
                            </p>
                            <p className="text-[11px] mt-1 uppercase tracking-[0.15em] text-(--color-muted)
                                font-mono">
                                {s.label}
                            </p>
                        </div>
                    ))}
                </div>

                <SectionLabel>Rating Style</SectionLabel>
                <div className="flex flex-col gap-1.5 max-w-sm mb-14">
                    {ratingDistribution.map(({ name, count }) => (
                        <div key={name} className="flex items-center gap-2 font-mono">
                            <span className="text-xs text-(--color-muted) w-4 text-right shrink-0">{name}</span>
                            <div className="flex-1 bg-(--color-surface-light) h-2 overflow-hidden rounded-[1px]">
                                <div
                                    className="h-full"
                                    style={{
                                        width: `${(count / maxDistCount) * 100}%`,
                                        backgroundColor: tierColor(name),
                                        minWidth: count > 0 ? '4px' : '0'
                                    }}
                                />
                            </div>
                            <span className="text-xs text-(--color-muted) w-4 shrink-0">{count}</span>
                        </div>
                    ))}
                </div>

                <SectionLabel>Favorite Genres</SectionLabel>
                {genreStats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-14">
                        {genreStats.filter(g => g.rated_count > 1).slice(0, 6).map(g => (
                            <div key={g.genre_name} className="border border-(--color-muted)/25
                                bg-(--color-surface) rounded-[3px] p-4 flex flex-col gap-2">
                                <h3 className="text-base text-(--color-text) font-(family-name:--font-display)">
                                    {g.genre_name}
                                </h3>
                                <div className="flex items-baseline gap-1.5">
                                    <span
                                        className="text-2xl font-mono"
                                        style={{ color: tierColor(g.weighted_rating) }}
                                    >
                                        {g.weighted_rating}
                                    </span>
                                    <span className="text-xs text-(--color-muted)">avg</span>
                                </div>
                                <p className="text-xs text-(--color-muted)">
                                    {g.rated_count} rated · {g.completed_count} completed
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <SectionLabel>Favorite Developers</SectionLabel>
                {developerStats && (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-14">
                        {developerStats.filter(d => d.rated_count > 1).slice(0, 6).map(d => (
                            <div key={d.developer_name} className="border border-(--color-muted)/25
                                bg-(--color-surface) rounded-[3px] p-4 flex flex-col gap-2">
                                <h3 className="text-base text-(--color-text) font-(family-name:--font-display)">
                                    {d.developer_name}
                                </h3>
                                <div className="flex items-baseline gap-1.5">
                                    <span
                                        className="text-2xl font-mono"
                                        style={{ color: tierColor(d.weighted_rating) }}
                                    >
                                        {d.weighted_rating}
                                    </span>
                                    <span className="text-xs text-(--color-muted)">avg</span>
                                </div>
                                <p className="text-xs text-(--color-muted)">
                                    {d.rated_count} rated · {d.game_count} total
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <SectionLabel>Perfect Games</SectionLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-14">
                    {highlights.filter(h => h.highlight_type == "top").map(h =>
                        <GameCard key={h.game_id} game={{ id: h.game_id, name: h.game_name, slug: h.game_slug, cover_image_url: h.cover_image_url, metacritic_score: null, released: null }} />
                    )}
                </div>

                <SectionLabel>Lowest Rated</SectionLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {highlights.filter(h => h.highlight_type == "bottom").map(h =>
                        <GameCard key={h.game_id} game={{ id: h.game_id, name: h.game_name, slug: h.game_slug, cover_image_url: h.cover_image_url, metacritic_score: null, released: null }} />
                    )}
                </div>
            </div>
        </main>
    )
}