import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Image from 'next/image'
import Link from 'next/link'
import ScreenshotCarousel from "@/app/components/game/ScreenshotCarousel";
import LibraryButton from "@/app/components/library/LibraryButton";
import RateReviewButton from "@/app/components/game/RateReviewButton";
import Review from "@/app/components/game/Review";
import DistributionChart from "@/app/components/util/DistributionChart";
import AddToListButton from "@/app/components/lists/AddToListButton";
import ExpandableText from "@/app/components/util/ExpandableText";
import { ListSummary } from "@/types";
import { getViewer, getAccountSettings } from "@/lib/queries/user";
import { getGameBySlug, getGameTaxonomy } from "@/lib/queries/game";
import { getRatingsReviewsForGame, getGameAvgRating } from "@/lib/queries/review";
import { getUserLists, getGameListMembership } from "@/lib/queries/list";

type GamePageProps = {
    params: Promise<{ slug: string }>
}

export default async function GamePage({ params }: GamePageProps) {
    const { slug } = await params;
    const supabase = await createClient()

    const user = await getViewer(supabase)

    const game = await getGameBySlug(supabase, slug)

    if (!game) notFound()

    const {
        genres: genreList,
        platforms: platformList,
        developers: developerList,
        publishers: publisherList,
    } = await getGameTaxonomy(supabase, game.id)

    const scoreColor = !game.metacritic_score
        ? 'var(--color-muted)'
        : game.metacritic_score >= 80
        ? 'var(--color-good)'
        : game.metacritic_score >= 60
        ? 'var(--color-mid)'
        : 'var(--color-bad)'

    const { ratingsReviews, count } = await getRatingsReviewsForGame(supabase, game.id)

    const reviewCount = ratingsReviews.filter(r => r.review != "").length

    const userReview = user ? ratingsReviews.find(r => r.user_id === user.id) : null

    const aggregate_rating = await getGameAvgRating(supabase, game.id)

    const rating_distribution = [10,9,8,7,6,5,4,3,2,1].map(n => ({
        name: n,
        count: ratingsReviews.filter(r => r.rating === n).length
    }))

    const ngScoreColor = aggregate_rating >= 8
        ? 'var(--color-good)'
        : aggregate_rating >= 6
        ? 'var(--color-mid)'
        : aggregate_rating >= 3
        ? 'var(--color-bad)'
        : 'var(--color-muted)'

    const lists = (await getUserLists(supabase, user?.id, true)) as ListSummary[]

    const listIds = lists.map(l => l.id)

    const listIdsGameIsIn = await getGameListMembership(supabase, game.id, listIds)

    const userSettings = user ? await getAccountSettings(supabase, user.id) : null

    return (
        <main>
            <div className="w-full max-w-6xl mx-auto px-8 py-12">

                {/* Back to Games link */}
                <Link href="/games" className="inline-flex items-center gap-2 text-(--color-muted)
                    text-sm font-semibold mb-8 group hover:text-(--color-bad) transition-colors duration-200
                    font-(family-name:--font-display)"
                >
                    <span className="group-hover:-translate-x-0.5 transition-transform duration-200 text-lg">←</span> 
                    Back to Games
                </Link>
            
                <div className="flex gap-8 mb-4">

                    {/* Cover image */}
                    <div className="shrink-0 w-48 md:w-64 lg:w-80 rounded-[3px] overflow-hidden border border-(--color-border) shadow-2xl self-start">
                        <Image
                            src={game.cover_image_url}
                            alt={game.name}
                            width={256}
                            height={340}
                            className="w-full h-auto object-cover"
                        />
                    </div>

                    <div className="flex flex-col w-full">

                        {/* Genres */}
                        <div className="flex gap-2 mb-3 items-center">
                            {genreList.map((genre) => (
                                <Link
                                    key={genre.id}
                                    href={`/games?genre=${genre.slug}`}
                                    className="px-3 py-1 rounded-[3px] text-sm font-semibold
                                        text-(--color-accent) hover:bg-(--color-accent-hover) hover:text-(--color-bg) outline-(--color-accent) outline-1
                                        transition-colors duration-200
                                        font-(family-name:--font-display)"
                                >
                                    {genre.name}
                                </Link>
                            ))}
                            <span className="text-sm font-semibold items-center">
                                |
                            </span>
                            {/* ESRB Rating */}
                            {game.esrb_rating && (
                                <Link
                                    href={`/games?esrb=${game.esrb_rating}`}
                                    className="text-sm font-semibold text-(--color-accent) hover:bg-(--color-accent-hover) hover:text-(--color-bg) outline-(--color-accent) outline-1 rounded-[3px] px-2 py-1"
                                >
                                    {game.esrb_rating}
                                </Link>
                            )}   
                        </div>

                        {/* Game title */}
                        <h1 className="text-5xl font-bold font-(family-name:--font-display)">
                            {game?.name}
                        </h1>

                        {/* Meta Row */}
                        <div className="flex gap-6 items-center mt-3 mb-4">
                            {/* Release Date */}
                            {game.released && (
                                <p className="text-sm font-semibold">
                                    {new Date(game.released).getFullYear()}
                                </p>
                            )}        
                            {/* Metacritic Score */}
                            {game.metacritic_score && (
                                <p className="text-sm font-semibold px-2 py-1 rounded-[3px]" style={{ outline: `1px solid ${scoreColor}` }}>
                                    <span style={{ color: scoreColor }}>{game.metacritic_score}</span>
                                </p>
                            )}          
                            {/* NG+ Score */}
                            {aggregate_rating ? (
                                <p className="text-sm font-semibold">
                                    NG+ Rating: <span style={{ color: ngScoreColor }}>{aggregate_rating}</span>
                                </p>
                            ) : (
                                <p className="text-sm font-semibold text-(--color-muted)">
                                    Be the first to rate this game on NG+!
                                </p>
                            )}    
                        </div>
                        {/* Button Row */}
                        <div className="flex gap-4 flex-wrap mb-6 w-full justify-start">
                            {/* Add to Library Button */}
                            <LibraryButton game_id={game.id}/>
                            {/* Add to List Button */}
                            <AddToListButton gameId={game.id} lists={lists.map(l => ({ listId: String(l.id), listName: l.name, listCount: l.game_count }))} listIdsGameIsIn={listIdsGameIsIn} defaultListPrivacy={userSettings?.default_list_public ?? true} />
                        </div>
                    </div>
                </div>
                {/* Platforms / Developers / Publishers */}
                <div className="grid grid-cols-3 mb-4 gap-2 items-start">
                    <p className="text-sm font-semibold text-(--color-muted)">Platforms:</p>
                    <p className="text-sm font-semibold text-(--color-muted)">Developers:</p>
                    <p className="text-sm font-semibold text-(--color-muted)">Publishers:</p>
                    <div className="flex gap-2 flex-wrap">
                        {platformList.map((platform) => (
                            <Link
                                key={platform.id}
                                href={`/games?platform=${platform.slug}`}
                                className="px-3 py-1 rounded-[3px] text-sm font-semibold
                                    text-(--color-accent) hover:bg-(--color-accent-hover) hover:text-(--color-bg) outline-(--color-accent) outline-1
                                    transition-colors duration-200
                                    font-(family-name:--font-display)"
                            >
                                {platform.name}
                            </Link>
                        ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {developerList.map((developer) => (
                            <Link
                                key={developer.id}
                                href={`/games?developer=${developer.slug}`}
                                className="px-3 py-1 rounded-[3px] text-sm font-semibold
                                    text-(--color-accent) hover:bg-(--color-accent-hover) hover:text-(--color-bg) outline-(--color-accent) outline-1
                                    transition-colors duration-200
                                    font-(family-name:--font-display)"
                            >
                                {developer.name}
                            </Link>
                        ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {publisherList.map((publisher) => (
                            <Link
                                key={publisher.id}
                                href={`/games?publisher=${publisher.slug}`}
                                className="px-3 py-1 rounded-[3px] text-sm font-semibold
                                    text-(--color-accent) hover:bg-(--color-accent-hover) hover:text-(--color-bg) outline-(--color-accent) outline-1
                                    transition-colors duration-200
                                    font-(family-name:--font-display)"
                            >
                                {publisher.name}
                            </Link>
                        ))}
                    </div>
                </div>
                {/* Description */}
                {game?.description && (
                    <div className="mb-4">
                        <ExpandableText text={game.description} lines={6} />
                    </div>
                )}
                {/* Screenshot Carousel */}
                {game.screenshots.length > 1 && (
                    <div className="mb-4 w-1/2 max-w-6xl mx-auto">
                        <ScreenshotCarousel screenshots={game.screenshots.slice(1) ?? []} />
                    </div>
                )}
                {/* Reviews */}
                <div className="mb-4">
                    <div className="flex items-center gap-4 justify-between mb-2">
                        {aggregate_rating ? (
                            <p className="text-2xl font-semibold mb-2">NG+ users rated {game.name} a <span style={{ color: ngScoreColor }}>{aggregate_rating}</span>/10 ({count} Ratings)</p>
                        ) : (
                            <p className="text-2xl font-semibold mb-2">Be the first NG+ user to rate {game.name}!</p>
                        )}
                        <RateReviewButton game_id={game.id} existing_rating_review={userReview}/>
                    </div>
                    <DistributionChart data={rating_distribution}/>
                    <h2 className="border-t border-(--color-border) text-2xl font-semibold mb-2 mt-2 pt-2">Reviews ({reviewCount})</h2>
                    {userReview && user && userReview.review != "" && <Review rating_review={userReview} gameName={game.name} gameSlug={game.slug}/>}
                    {ratingsReviews.filter(r => r.user_id != user?.id && r.review != "").map(r => 
                        <Review key={r.user_id} rating_review={r} gameName={game.name} gameSlug={game.slug}/>
                    )}
                </div>
                {/* Reddit Link */}
                {game?.reddit_url && (
                    <div className="mb-6">
                        <Link
                            href={game?.reddit_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-sm text-(--color-accent) font-semibold rounded-[3px] hover:bg-(--color-accent-hover) transition-colors duration-200 border border-(--color-accent) hover:text-(--color-bg)"
                        >
                            Visit Reddit: {game.reddit_url.replace(/https?:\/\/(www\.)?reddit\.com\//, '').replace(/\/$/, '')}
                        </Link>
                    </div>
                )}
            </div>
        </main>
    )
}