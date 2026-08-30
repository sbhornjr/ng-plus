import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Image from 'next/image'
import Link from 'next/link'
import ScreenshotCarousel from "@/app/components/game/ScreenshotCarousel";
import LibraryButton from "@/app/components/library/LibraryButton";
import RateReviewButton from "@/app/components/game/RateReviewButton";
import Review from "@/app/components/game/Review";
import GameReviewsFilters from "@/app/components/game/GameReviewsFilters";
import Pagination from "@/app/components/util/Pagination";
import DistributionChart from "@/app/components/util/DistributionChart";
import ScoreVerdict from "@/app/components/game/ScoreVerdict";
import AddToListButton from "@/app/components/lists/AddToListButton";
import ExpandableText from "@/app/components/util/ExpandableText";
import { ListSummary, GameRatingsStats } from "@/types";
import { getViewer, getAccountSettings } from "@/lib/queries/user";
import { getGameBySlug, getGameTaxonomy } from "@/lib/queries/game";
import { getGameRatingsStats, getUserRatingReviewForGame, getGameReviewsForPage } from "@/lib/queries/review";
import { getUserLists, getGameListMembership } from "@/lib/queries/list";

type GamePageProps = {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ page?: string, pageSize?: string, sort?: string, order?: string }>
}

export default async function GamePage({ params, searchParams }: GamePageProps) {
    const { slug } = await params;
    const { page, pageSize, sort, order } = await searchParams;
    const pageQuery = page ? Number(page) : 1
    const pageSizeQuery = pageSize ? Number(pageSize) : 10
    const sortQuery: "date" | "rating" = sort === "rating" ? "rating" : "date"
    const orderQuery: "asc" | "desc" = order === "asc" ? "asc" : "desc"
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

    const stats = await getGameRatingsStats(supabase, game.id)

    const userReview = user ? await getUserRatingReviewForGame(supabase, game.id, user.id) : null

    const { reviews: pagedReviews, count: otherReviewsCount } = await getGameReviewsForPage(supabase, game.id, {
        limit: pageSizeQuery,
        offset: (pageQuery - 1) * pageSizeQuery,
        sort: sortQuery,
        order: orderQuery,
        excludeUserId: user?.id,
    })
    const otherReviewsTotalPages = Math.ceil(otherReviewsCount / pageSizeQuery)

    const count = stats.total_ratings
    const reviewCount = stats.total_reviews
    const aggregate_rating = stats.avg_rating ?? 0

    const rating_distribution = [10,9,8,7,6,5,4,3,2,1].map(n => ({
        name: n,
        count: stats[`rating_${n}` as keyof GameRatingsStats] as number
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

    // Browsable facets (genre / platform / ESRB) read as chips; credits
    // (developer / publisher) read as plain links so the page isn't a wall
    // of identical pills.
    const facetChip = `inline-flex px-2.5 py-1 rounded-[3px] text-sm border border-(--color-border)
        text-(--color-muted) hover:text-(--color-accent) hover:border-(--color-accent)
        transition-colors duration-200 font-(family-name:--font-display)`
    const metaLink = `text-sm text-(--color-text) underline decoration-(--color-border) underline-offset-2
        hover:decoration-(--color-accent) hover:text-(--color-accent) transition-colors duration-200`

    return (
        <main>
            <div className="w-full max-w-6xl mx-auto px-8 pt-8 pb-16">

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

                        {/* Genres + ESRB — browsable facets */}
                        <div className="flex gap-2 mb-3 items-center flex-wrap">
                            {genreList.map((genre) => (
                                <Link key={genre.id} href={`/games?genre=${genre.slug}`} className={facetChip}>
                                    {genre.name}
                                </Link>
                            ))}
                            {game.esrb_rating && (
                                <Link href={`/games?esrb=${game.esrb_rating}`} className={facetChip}>
                                    {game.esrb_rating}
                                </Link>
                            )}
                        </div>

                        {/* Game title */}
                        <h1 className="text-5xl font-bold font-(family-name:--font-display)">
                            {game?.name}
                        </h1>
                        {game.released && (
                            <p className="text-sm text-(--color-muted) mt-1 mb-4 font-mono">
                                {new Date(game.released).getFullYear()}
                            </p>
                        )}

                        {/* The three-source verdict — the whole point of NG+ */}
                        <div className="mb-6">
                            <ScoreVerdict
                                metacritic={game.metacritic_score}
                                community={aggregate_rating || null}
                                communityCount={count}
                                user={userReview?.rating ?? null}
                            />
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
                {/* Platforms — facets; Developers / Publishers — credits */}
                <div className="grid grid-cols-1 md:grid-cols-3 mb-6 gap-x-6 gap-y-4 items-start">
                    <div>
                        <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-(--color-muted) mb-2">Platforms</p>
                        <div className="flex gap-1.5 flex-wrap">
                            {platformList.map((platform) => (
                                <Link key={platform.id} href={`/games?platform=${platform.slug}`} className={facetChip}>
                                    {platform.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-(--color-muted) mb-2">Developers</p>
                        <div className="flex flex-col gap-1">
                            {developerList.map((developer) => (
                                <Link key={developer.id} href={`/games?developer=${developer.slug}`} className={metaLink}>
                                    {developer.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-(--color-muted) mb-2">Publishers</p>
                        <div className="flex flex-col gap-1">
                            {publisherList.map((publisher) => (
                                <Link key={publisher.id} href={`/games?publisher=${publisher.slug}`} className={metaLink}>
                                    {publisher.name}
                                </Link>
                            ))}
                        </div>
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
                    <div className="mb-8 max-w-3xl">
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
                    {reviewCount > 1 && (
                        <GameReviewsFilters gameSlug={game.slug} pageSize={String(pageSizeQuery)} sort={sortQuery} order={orderQuery} page={String(pageQuery)} />
                    )}
                    {userReview && user && userReview.review != "" && <Review rating_review={userReview} />}
                    {pagedReviews.map(r =>
                        <Review key={r.user_id} rating_review={r} />
                    )}
                    {otherReviewsCount > 0 &&
                        <div className="mt-4">
                            <Pagination
                                page={pageQuery}
                                maxPages={otherReviewsTotalPages}
                                params={{ pageSize: String(pageSizeQuery), sort: sortQuery, order: orderQuery }}
                                url={`games/${game.slug}`}
                            />
                        </div>
                    }
                </div>
                {/* External links footer */}
                {game?.reddit_url && (
                    <div className="mt-6 pt-4 border-t border-(--color-border) flex items-center gap-4 text-sm">
                        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-(--color-muted)">Elsewhere</span>
                        <Link
                            href={game.reddit_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-(--color-text) underline decoration-(--color-border) underline-offset-2 hover:decoration-(--color-accent) hover:text-(--color-accent) transition-colors duration-200"
                        >
                            r/{game.reddit_url.replace(/https?:\/\/(www\.)?reddit\.com\/r\//, '').replace(/\/$/, '')}
                        </Link>
                    </div>
                )}
            </div>
        </main>
    )
}