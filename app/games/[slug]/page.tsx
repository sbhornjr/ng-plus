import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Image from 'next/image'
import Link from 'next/link'
import ScreenshotCarousel from "@/app/components/game/ScreenshotCarousel";
import LibraryButton from "@/app/components/library/LibraryButton";
import RateReviewButton from "@/app/components/game/RateReviewButton";
import GameReviewsFilters from "@/app/components/game/GameReviewsFilters";
import Pagination from "@/app/components/util/Pagination";
import StampVerdict from "@/app/components/game/StampVerdict";
import StickyGameActions from "@/app/components/game/StickyGameActions";
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

/** Stable 5-digit accession number for a game, so every entry has a filing ref. */
function accession(slug: string) {
    let h = 0
    for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0
    return String(Math.abs(h) % 100000).padStart(5, "0")
}

function tierInk(n: number) {
    return n >= 8 ? "var(--color-good)" : n >= 6 ? "var(--color-mid)" : "var(--color-bad)"
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
function stampDate(iso: string) {
    const d = new Date(iso)
    return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

type StatementRow = {
    rating: number
    review: string
    user_id: string
    created_at: string
    users: { username: string, avatar_url: string }
}

function Statement({ row, own = false }: { row: StatementRow, own?: boolean }) {
    return (
        <div className="paper statement">
            <div className="statement-head">
                <Avatar src={row.users?.avatar_url} alt={row.users?.username ?? "user"} size="sm" bordered />
                <Link
                    href={`/user/${row.users?.username}`}
                    className="text-sm font-semibold text-(--typed) hover:text-(--color-accent) transition-colors duration-200 font-(family-name:--font-display)"
                >
                    {own ? "You" : row.users?.username}
                </Link>
                <span className="statement-meta">Logged {stampDate(row.created_at)}</span>
                <span className="statement-score" style={{ color: tierInk(row.rating) }}>
                    {row.rating} / 10
                </span>
            </div>
            {row.review
                ? <p className="statement-body">&ldquo;{row.review}&rdquo;</p>
                : <p className="statement-body empty">Rating only — no statement on file.</p>}
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

    const rating_distribution = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(n => ({
        name: n,
        count: stats[`rating_${n}` as keyof GameRatingsStats] as number,
    }))
    const maxCount = Math.max(...rating_distribution.map(d => d.count), 1)

    const ngScoreColor = aggregate_rating >= 8 ? 'var(--color-good)'
        : aggregate_rating >= 6 ? 'var(--color-mid)'
        : aggregate_rating >= 3 ? 'var(--color-bad)'
        : 'var(--color-muted)'

    const lists = (await getUserLists(supabase, user?.id, true)) as ListSummary[]
    const listIdsGameIsIn = await getGameListMembership(supabase, game.id, lists.map(l => l.id))
    const userSettings = user ? await getAccountSettings(supabase, user.id) : null

    const ref = accession(game.slug)
    const year = game.released ? new Date(game.released).getFullYear() : null

    const fieldLink = `block text-sm text-(--typed) underline decoration-(--rule) underline-offset-2
        hover:decoration-(--color-accent) hover:text-(--color-accent) transition-colors duration-200`
    const genreTag = `inline-flex px-2 py-0.5 rounded-[3px] text-[0.7rem] font-mono uppercase tracking-[0.12em]
        border border-(--rule) text-(--carbon) hover:text-(--color-accent) hover:border-(--color-accent)
        transition-colors duration-200`

    return (
        <main className="file">
            <svg width="0" height="0" aria-hidden="true" className="absolute">
                <defs>
                    <filter id="stamp-rough">
                        <feTurbulence type="fractalNoise" baseFrequency="0.035 0.08" numOctaves="2" seed="7" result="n" />
                        <feDisplacementMap in="SourceGraphic" in2="n" scale="2" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                </defs>
            </svg>

            <div className="w-full max-w-5xl mx-auto px-6 md:px-10 pt-6 pb-24">

                <Link
                    href="/games"
                    className="inline-flex items-center gap-2 mb-6 font-mono text-[0.6875rem] uppercase tracking-[0.2em]
                        text-(--carbon) hover:text-(--color-accent) transition-colors duration-200 group"
                >
                    <span className="group-hover:-translate-x-0.5 transition-transform duration-200">&larr;</span>
                    Registry index
                </Link>

                {/* Document header */}
                <div className="masthead">
                    <span>NG+ Registry &nbsp;·&nbsp; Entry <b>&#8470;{ref}</b></span>
                    <span>
                        {year && <>Opened {year} &nbsp;·&nbsp; </>}
                        {libraryEntry
                            ? <span className="filed">&#10003; Filed &mdash; {libraryEntry.status}</span>
                            : <span className="unfiled">Unfiled</span>}
                    </span>
                </div>

                {/* The record */}
                <div className="grid gap-8 md:gap-12 mt-8 md:grid-cols-[17rem_1fr]">

                    {/* Left rail — mounted cover + typed metadata */}
                    <div>
                        <figure className="mount">
                            <span className="tape tl" aria-hidden="true" />
                            <span className="tape br" aria-hidden="true" />
                            <Image src={game.cover_image_url} alt={game.name} width={272} height={360} className="w-full h-auto object-cover" priority />
                        </figure>
                        <figcaption className="field" style={{ marginTop: "0.6rem" }}>Plate 1 &nbsp;·&nbsp; Cover</figcaption>

                        <div style={{ marginTop: "1.4rem" }}>
                            <p className="field">Platforms</p>
                            <div className="flex gap-1.5 flex-wrap">
                                {platformList.map(p => (
                                    <Link key={p.id} href={`/games?platform=${p.slug}`} className={genreTag}>{p.name}</Link>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: "1.4rem" }}>
                            <p className="field">Developed by</p>
                            <div className="flex flex-col gap-0.5">
                                {developerList.map(d => (
                                    <Link key={d.id} href={`/games?developer=${d.slug}`} className={fieldLink}>{d.name}</Link>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: "1.4rem" }}>
                            <p className="field">Published by</p>
                            <div className="flex flex-col gap-0.5">
                                {publisherList.map(p => (
                                    <Link key={p.id} href={`/games?publisher=${p.slug}`} className={fieldLink}>{p.name}</Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right — title block, verdict, actions */}
                    <div className="min-w-0">
                        <p className="field">Title of record</p>
                        <h1
                            className="font-(family-name:--font-display) text-(--typed) mt-1"
                            style={{ fontSize: "clamp(2.5rem, 6vw, 4.75rem)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 0.95, textWrap: "balance" }}
                        >
                            {game.name}
                        </h1>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {genreList.map(g => (
                                <Link key={g.id} href={`/games?genre=${g.slug}`} className={genreTag}>{g.name}</Link>
                            ))}
                            {game.esrb_rating && (
                                <Link href={`/games?esrb=${game.esrb_rating}`} className={genreTag}>[{game.esrb_rating}]</Link>
                            )}
                        </div>

                        <div className="mt-5">
                            <StampVerdict
                                metacritic={game.metacritic_score}
                                community={aggregate_rating || null}
                                user={userReview?.rating ?? null}
                            />
                        </div>

                        <div className="mt-4">
                            <StickyGameActions gameName={`№${ref} · ${game.name}`}>
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

                {/* Synopsis */}
                {game.description && (
                    <>
                        <div className="marker"><b>Synopsis</b></div>
                        <div className="paper dossier-note max-w-3xl">
                            <p className="abstract">{game.description}</p>
                        </div>
                    </>
                )}

                {/* Exhibits */}
                {game.screenshots.length > 1 && (
                    <>
                        <div className="marker"><b>Exhibits</b></div>
                        <div className="max-w-3xl">
                            <ScreenshotCarousel screenshots={game.screenshots.slice(1) ?? []} />
                        </div>
                    </>
                )}

                {/* The record — ratings */}
                <div className="marker">
                    <b>The Record</b>
                    <span>&middot;&nbsp;{count > 0 ? `${count} ${count === 1 ? "rating" : "ratings"} on file` : "nothing on file"}</span>
                </div>
                {count > 0 ? (
                    <div className="paper" style={{ padding: "1.25rem 1.35rem" }}>
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <p className="field">NG+ community rating</p>
                                <p className="font-(family-name:--font-display) mt-0.5" style={{ fontSize: "2rem", fontWeight: 600, color: ngScoreColor }}>
                                    {aggregate_rating}
                                    <span className="text-(--carbon) font-mono" style={{ fontSize: "0.8rem" }}> / 10</span>
                                </p>
                            </div>
                            <RateReviewButton game_id={game.id} existing_rating_review={userReview} />
                        </div>
                        <div>
                            {rating_distribution.map(({ name, count: c }) => (
                                <div key={name} className="tally-row">
                                    <span className="tally-n">{name}</span>
                                    <div className="tally-track">
                                        <div className="tally-fill" style={{ width: `${(c / maxCount) * 100}%`, backgroundColor: tierInk(name), minWidth: c > 0 ? "3px" : 0 }} />
                                    </div>
                                    <span className="tally-c">{c > 0 ? `${c} · ${Math.round((c / count) * 100)}%` : "—"}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="paper" style={{ padding: "1.35rem 1.5rem" }}>
                        <p className="text-(--typed)" style={{ maxWidth: "52ch", lineHeight: 1.7 }}>
                            No one on NG+ has filed a rating for {game.name} yet. Be the first to put it on the record.
                        </p>
                        <div className="mt-4">
                            <RateReviewButton game_id={game.id} existing_rating_review={userReview} />
                        </div>
                    </div>
                )}

                {/* Statements */}
                <div className="marker"><b>Statements on file</b><span>&middot;&nbsp;{reviewCount}</span></div>
                {reviewCount > 1 && (
                    <div className="mb-4">
                        <GameReviewsFilters gameSlug={game.slug} pageSize={String(pageSizeQuery)} sort={sortQuery} order={orderQuery} page={String(pageQuery)} />
                    </div>
                )}
                <div className="flex flex-col gap-3">
                    {userReview && user && userReview.review !== "" && (
                        <Statement row={userReview as unknown as StatementRow} own />
                    )}
                    {pagedReviews.map(r => (
                        <Statement key={r.user_id} row={r as unknown as StatementRow} />
                    ))}
                    {reviewCount === 0 && (
                        <p className="text-(--carbon) italic text-sm">No written statements yet.</p>
                    )}
                </div>
                {otherReviewsCount > 0 && (
                    <div className="mt-5">
                        <Pagination
                            page={pageQuery}
                            maxPages={otherReviewsTotalPages}
                            params={{ pageSize: String(pageSizeQuery), sort: sortQuery, order: orderQuery }}
                            url={`games/${game.slug}`}
                        />
                    </div>
                )}

                {/* Cross-references */}
                {game.reddit_url && (
                    <>
                        <div className="marker"><b>Cross-references</b></div>
                        <Link
                            href={game.reddit_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-sm text-(--typed) underline decoration-(--rule) underline-offset-2 hover:decoration-(--color-accent) hover:text-(--color-accent) transition-colors duration-200"
                        >
                            r/{game.reddit_url.replace(/https?:\/\/(www\.)?reddit\.com\/r\//, '').replace(/\/$/, '')}
                        </Link>
                    </>
                )}
            </div>
        </main>
    )
}
