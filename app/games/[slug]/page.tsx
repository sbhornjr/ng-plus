import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Image from 'next/image'
import Link from 'next/link'
import ScreenshotCarousel from "@/app/components/game/ScreenshotCarousel";
import LibraryButton from "@/app/components/library/LibraryButton";
import RateReviewButton from "@/app/components/game/RateReviewButton";
import GameReviewsFilters from "@/app/components/game/GameReviewsFilters";
import Pagination from "@/app/components/util/Pagination";
import RunComparison from "@/app/components/game/RunComparison";
import StickyGameActions from "@/app/components/game/StickyGameActions";
import Plus1Layer from "@/app/components/game/Plus1Layer";
import AddToListButton from "@/app/components/lists/AddToListButton";
import Avatar from "@/app/components/user/Avatar";
import { ListSummary, GameRatingsStats } from "@/types";
import { getViewer, getAccountSettings } from "@/lib/queries/user";
import { getGameBySlug, getGameTaxonomy } from "@/lib/queries/game";
import { getGameRatingsStats, getUserRatingReviewForGame, getGameReviewsForPage } from "@/lib/queries/review";
import { getUserLists, getGameListMembership } from "@/lib/queries/list";
import { getLibraryEntry } from "@/lib/queries/library";

type GamePageProps = {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ page?: string, pageSize?: string, sort?: string, order?: string }>
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
function relTime(iso: string) {
    const then = new Date(iso).getTime()
    const days = Math.floor((Date.now() - then) / 86_400_000)
    if (days < 1) return "today"
    if (days < 7) return `${days}d ago`
    if (days < 60) return `${Math.floor(days / 7)}w ago`
    if (days < 365) return `${Math.floor(days / 30)}mo ago`
    return `${Math.floor(days / 365)}y ago`
}
function logDate(iso: string) {
    const d = new Date(iso)
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

type LogRow = {
    rating: number
    review: string
    user_id: string
    created_at: string
    users: { username: string, avatar_url: string }
}

function Log({ row, own = false }: { row: LogRow, own?: boolean }) {
    return (
        <div className="panel log">
            <div className="log-head">
                <Avatar src={row.users?.avatar_url} alt={row.users?.username ?? "user"} size="sm" bordered />
                <Link href={`/user/${row.users?.username}`} className="text-sm font-semibold text-(--fg) hover:text-(--glow) transition-colors duration-200">
                    {own ? "You" : row.users?.username}
                </Link>
                <span className="log-meta">{relTime(row.created_at)}</span>
                <span className="log-score">{row.rating}<span> / 10</span></span>
            </div>
            {row.review
                ? <p className="log-body">&ldquo;{row.review}&rdquo;</p>
                : <p className="log-body empty">Logged a rating, no note.</p>}
        </div>
    )
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
    const libraryEntry = user ? await getLibraryEntry(supabase, user.id, game.id) : null

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

    const distribution = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(n => ({
        name: n,
        count: stats[`rating_${n}` as keyof GameRatingsStats] as number,
    }))
    const maxCount = Math.max(...distribution.map(d => d.count), 1)

    const lists = (await getUserLists(supabase, user?.id, true)) as ListSummary[]
    const listIdsGameIsIn = await getGameListMembership(supabase, game.id, lists.map(l => l.id))
    const userSettings = user ? await getAccountSettings(supabase, user.id) : null

    const year = game.released ? new Date(game.released).getFullYear() : null
    const inFile = !!(userReview || libraryEntry)
    const statusLabel = libraryEntry?.status
        ? libraryEntry.status.charAt(0).toUpperCase() + libraryEntry.status.slice(1)
        : null

    const link = `text-sm text-(--fg) underline decoration-(--line) underline-offset-2 hover:decoration-(--glow) hover:text-(--glow) transition-colors duration-200`

    return (
        <main
            className="ngplus"
            style={{
                background: "radial-gradient(120% 55% at 50% -8%, rgba(230,169,74,0.06), transparent 60%), var(--bg)",
            }}
        >
            <Plus1Layer />

            <div className="w-full max-w-5xl mx-auto px-6 md:px-10 pt-6 pb-24">

                <div className="flex items-center justify-between mb-8 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-(--dim)">
                    <Link href="/games" className="inline-flex items-center gap-2 hover:text-(--glow) transition-colors duration-200 group">
                        <span className="group-hover:-translate-x-0.5 transition-transform duration-200">&#9666;</span>
                        Library
                    </Link>
                    <span>NG+ &nbsp;·&nbsp; <span className="text-(--fg)">File</span></span>
                </div>

                <h1
                    className="font-(family-name:--font-display) text-(--fg) flex items-start gap-2 mb-3"
                    style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 0.97, textWrap: "balance" }}
                >
                    <span className="text-(--glow) not-italic" style={{ fontSize: "0.5em", lineHeight: 1.7, flex: "none" }}>&#9656;</span>
                    <span>{game.name}</span>
                </h1>
                <div className="mb-9 flex flex-wrap items-center gap-1.5">
                    {genreList.map(g => <Link key={g.id} href={`/games?genre=${g.slug}`} className="tag">{g.name}</Link>)}
                    {game.esrb_rating && <Link href={`/games?esrb=${game.esrb_rating}`} className="tag">{game.esrb_rating}</Link>}
                    {year && <span className="ml-1 font-mono text-xs text-(--dim) tracking-wider">&middot; {year}</span>}
                </div>

                <div className="grid gap-8 md:gap-12 md:grid-cols-[16rem_1fr]">

                    {/* Left rail — cover, your file, info */}
                    <div className="flex flex-col gap-6 order-2 md:order-1">
                        <div className="rounded-[6px] overflow-hidden border border-(--line) shadow-[0_10px_30px_-12px_rgba(0,0,0,0.7)]">
                            <Image src={game.cover_image_url} alt={game.name} width={256} height={340} className="w-full h-auto object-cover" priority />
                        </div>

                        <div className="panel p-4">
                            <p className="stat-label mb-2.5">Your file</p>
                            {inFile ? (
                                <ul className="yourfile flex flex-col">
                                    {statusLabel && <li><span className="k">Status</span> {statusLabel}</li>}
                                    {userReview?.rating != null && <li><span className="k">Your run</span> {userReview.rating} / 10</li>}
                                    {userReview?.updated_at && <li><span className="k">Rated</span> {relTime(userReview.updated_at)}</li>}
                                    {!statusLabel && !userReview && <li className="text-(--dim)">Tracked, no rating yet</li>}
                                </ul>
                            ) : (
                                <p className="text-sm text-(--dim) leading-relaxed">
                                    Not in your file yet. Hit <span className="text-(--glow) font-mono">+ Log</span> to start a run.
                                </p>
                            )}
                        </div>

                        <div>
                            <p className="stat-label mb-2">Platforms</p>
                            <div className="flex gap-1.5 flex-wrap">
                                {platformList.map(p => (
                                    <Link key={p.id} href={`/games?platform=${p.slug}`} className="tag">{p.name}</Link>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="stat-label mb-1.5">Developed by</p>
                            <div className="flex flex-col gap-0.5">
                                {developerList.map(d => <Link key={d.id} href={`/games?developer=${d.slug}`} className={link}>{d.name}</Link>)}
                            </div>
                        </div>
                        <div>
                            <p className="stat-label mb-1.5">Published by</p>
                            <div className="flex flex-col gap-0.5">
                                {publisherList.map(p => <Link key={p.id} href={`/games?publisher=${p.slug}`} className={link}>{p.name}</Link>)}
                            </div>
                        </div>
                    </div>

                    {/* Right — the run + actions */}
                    <div className="min-w-0 order-1 md:order-2">
                        <div className="head" style={{ marginTop: 0 }}><b>The Run</b></div>
                        <div className="flex flex-wrap items-start gap-x-6 gap-y-4">
                            <RunComparison
                                critic={game.metacritic_score}
                                community={aggregate_rating || null}
                                communityCount={count}
                                you={userReview?.rating ?? null}
                            />
                            <div className="flex flex-col gap-2.5">
                                <p className="stat-label">Your move</p>
                                <StickyGameActions gameName={game.name}>
                                    <LibraryButton game_id={game.id} />
                                    <AddToListButton
                                        gameId={game.id}
                                        lists={lists.map(l => ({ listId: String(l.id), listName: l.name, listCount: l.game_count }))}
                                        listIdsGameIsIn={listIdsGameIsIn}
                                        defaultListPrivacy={userSettings?.default_list_public ?? true}
                                    />
                                </StickyGameActions>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About */}
                {game.description && (
                    <>
                        <div className="head"><b>About</b></div>
                        <p className="text-(--fg) leading-relaxed" style={{ maxWidth: "68ch" }}>{game.description}</p>
                    </>
                )}

                {/* Gallery */}
                {game.screenshots.length > 1 && (
                    <>
                        <div className="head"><b>Gallery</b></div>
                        <div className="max-w-3xl">
                            <ScreenshotCarousel screenshots={game.screenshots.slice(1) ?? []} />
                        </div>
                    </>
                )}

                {/* The community's run */}
                <div className="head">
                    <b>The community&apos;s run</b>
                    <span className="count">&nbsp;·&nbsp;{count > 0 ? `${count} ${count === 1 ? "run" : "runs"}` : "no runs yet"}</span>
                </div>
                {count > 0 ? (
                    <div className="panel" style={{ padding: "1.1rem 1.3rem" }}>
                        <div className="flex items-start justify-between gap-4 mb-3.5">
                            <p className="font-(family-name:--font-display)" style={{ fontSize: "2rem", fontWeight: 600, color: "var(--run-community)" }}>
                                {aggregate_rating}<span className="font-mono text-(--dim)" style={{ fontSize: "0.8rem" }}> / 10</span>
                            </p>
                            <RateReviewButton game_id={game.id} existing_rating_review={userReview} />
                        </div>
                        {distribution.map(({ name, count: c }) => (
                            <div key={name} className="bar-row">
                                <span className="bar-n">{name}</span>
                                <div className="bar-track">
                                    <div className="bar-fill" style={{ width: `${(c / maxCount) * 100}%`, minWidth: c > 0 ? "3px" : 0 }} />
                                </div>
                                <span className="bar-c">{c > 0 ? `${c} · ${Math.round((c / count) * 100)}%` : "—"}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="panel" style={{ padding: "1.3rem 1.5rem" }}>
                        <p className="text-(--fg)" style={{ maxWidth: "50ch", lineHeight: 1.7 }}>
                            No one on NG+ has run {game.name} yet. Log the first rating and set the pace.
                        </p>
                        <div className="mt-3.5"><RateReviewButton game_id={game.id} existing_rating_review={userReview} /></div>
                    </div>
                )}

                {/* Logs */}
                <div className="head"><b>Logs</b><span className="count">&nbsp;·&nbsp;{reviewCount}</span></div>
                {reviewCount > 1 && (
                    <div className="mb-4">
                        <GameReviewsFilters gameSlug={game.slug} pageSize={String(pageSizeQuery)} sort={sortQuery} order={orderQuery} page={String(pageQuery)} />
                    </div>
                )}
                <div className="flex flex-col gap-3">
                    {userReview && user && userReview.review !== "" && <Log row={userReview as unknown as LogRow} own />}
                    {pagedReviews.map(r => <Log key={r.user_id} row={r as unknown as LogRow} />)}
                    {reviewCount === 0 && <p className="text-(--dim) italic text-sm">No written logs yet.</p>}
                </div>
                {otherReviewsCount > 0 && (
                    <div className="mt-5">
                        <Pagination page={pageQuery} maxPages={otherReviewsTotalPages} params={{ pageSize: String(pageSizeQuery), sort: sortQuery, order: orderQuery }} url={`games/${game.slug}`} />
                    </div>
                )}

                {/* Elsewhere */}
                {game.reddit_url && (
                    <>
                        <div className="head"><b>Elsewhere</b></div>
                        <Link href={game.reddit_url} target="_blank" rel="noopener noreferrer" className={`font-mono ${link}`}>
                            r/{game.reddit_url.replace(/https?:\/\/(www\.)?reddit\.com\/r\//, '').replace(/\/$/, '')}
                        </Link>
                    </>
                )}
            </div>
        </main>
    )
}
