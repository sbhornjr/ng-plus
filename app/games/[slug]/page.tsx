import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Image from 'next/image'
import Link from 'next/link'
import ScreenshotCarousel from "@/app/components/ScreenshotCarousel";
import LibraryButton from "@/app/components/LibraryButton";
import RateReviewButton from "@/app/components/RateReviewButton";
import Review from "@/app/components/Review";
import DistributionChart from "@/app/components/DistributionChart";
import AddToListButton from "@/app/components/AddToListButton";

type GamePageProps = {
    params: Promise<{ slug: string }>
}

type RatingReview = {
    user_id: string
    rating: number
    review: string
    created_at: string
    updated_at: string
    users: {
        username: string
        display_name: string
        avatar_url: string
    }[]
}

type ListType = {
    id: number,
    name: string,
    description: string,
    is_public: boolean,
    is_default: boolean,
    is_pinned: boolean,
    created_at: string,
    last_activity: string,
    game_count: number
}

export default async function GamePage({ params }: GamePageProps) {
    const { slug } = await params;
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: game } = await supabase
        .from("games")
        .select("*")
        .eq("slug", slug)
        .single()

    if (!game) notFound()

    const [{ data: genres }, { data: platforms }, { data: developers }, { data: publishers }] =
        await Promise.all([
            supabase
                .from('game_genres')
                .select('genres(id, name, slug)')
                .eq('game_id', game.id),
            supabase
                .from('game_platforms')
                .select('platforms(id, name, slug)')
                .eq('game_id', game.id),
            supabase
                .from('game_developers')
                .select('developers(id, name, slug)')
                .eq('game_id', game.id),
            supabase
                .from('game_publishers')
                .select('publishers(id, name, slug)')
                .eq('game_id', game.id),
    ])

    const genreList = (genres ?? []).flatMap((g) => g.genres ?? [])
    const platformList = (platforms ?? []).flatMap((p) => p.platforms ?? [])
    const developerList = (developers ?? []).flatMap((d) => d.developers ?? [])
    const publisherList = (publishers ?? []).flatMap((p) => p.publishers ?? [])

    const scoreColor = !game.metacritic_score
        ? '#8b8b9a'
        : game.metacritic_score >= 80
        ? '#00d4aa'
        : game.metacritic_score >= 60
        ? '#f0a500'
        : '#e05555'

    const { data: ratings_reviews, count } = await supabase
        .from("ratings_reviews")
        .select("user_id, rating, review, created_at, updated_at, users(username, display_name, avatar_url)", { count: "exact" })
        .eq("game_id", game.id)

    const ratingsReviews = ratings_reviews as RatingReview[]

    const userReview = user && ratings_reviews ? ratingsReviews.find(r => r.user_id === user.id) : null

    const { data: aggregate_rating } = await supabase.rpc("get_game_avg_rating", { p_game_id: game.id})

    const rating_distribution = [10,9,8,7,6,5,4,3,2,1].map(n => ({
        name: n,
        count: ratingsReviews.filter(r => r.rating === n).length
    }))

    const ngScoreColor = aggregate_rating >= 8
        ? '#00d4aa'
        : aggregate_rating >= 6
        ? '#f0a500'
        : aggregate_rating >= 3
        ? '#e05555'
        : '#8b8b9a'

    const { data: listsData } = await supabase.rpc('get_user_lists', { p_user_id: user?.id, p_include_private: true })
    const lists = listsData ? listsData as ListType[] : []

    const listIds = lists.map(l => l.id)

    const { data: gameInLists } = await supabase
        .from('list_games')
        .select('list_id')
        .eq('game_id', game.id)
        .in('list_id', listIds)

    const listIdsGameIsIn = new Set(gameInLists?.map(g => g.list_id) ?? [])

    return (
        <main>
            <div className="w-full max-w-6xl mx-auto px-8 py-12">

                {/* Back to Games link */}
                <Link href="/games" className="inline-flex items-center gap-2 text-[#8b8b9a]
                    text-sm font-semibold mb-8 group hover:text-[#e05555] transition-colors duration-200
                    font-(family-name:--font-display)"
                >
                    <span className="group-hover:-translate-x-0.5 transition-transform duration-200 text-lg">←</span> 
                    Back to Games
                </Link>
            
                <div className="flex gap-8 mb-4">

                    {/* Cover image */}
                    <div className="shrink-0 w-48 md:w-64 lg:w-80 rounded-xl overflow-hidden border border-[#2a2a35] shadow-2xl self-start">
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
                                    className="px-3 py-1 rounded-lg text-sm font-semibold
                                        text-[#00d4aa] hover:bg-[#00b894] hover:text-[#0e0e10] outline-[#00d4aa] outline-1
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
                                    className="text-sm font-semibold text-[#00d4aa] hover:bg-[#00b894] hover:text-[#0e0e10] outline-[#00d4aa] outline-1 rounded-lg px-2 py-1"
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
                                <p className="text-sm font-semibold px-2 py-1 rounded-lg" style={{ outline: `1px solid ${scoreColor}` }}>
                                    <span style={{ color: scoreColor }}>{game.metacritic_score}</span>
                                </p>
                            )}          
                            {/* NG+ Score */}
                            {aggregate_rating ? (
                                <p className="text-sm font-semibold">
                                    NG+ Rating: <span style={{ color: ngScoreColor }}>{aggregate_rating}</span>
                                </p>
                            ) : (
                                <p className="text-sm font-semibold text-[#8b8b9a]">
                                    Be the first to rate this game on NG+!
                                </p>
                            )}    
                        </div>
                        {/* Button Row */}
                        <div className="flex gap-4 flex-wrap mb-6 w-full justify-start">
                            {/* Add to Library Button */}
                            <LibraryButton game_id={game.id}/>
                            {/* Add to List Button */}
                            <AddToListButton gameId={game.id} lists={lists.map(l => ({ listId: String(l.id), listName: l.name, listCount: l.game_count }))} listIdsGameIsIn={listIdsGameIsIn}/>
                        </div>
                    </div>
                </div>
                {/* Platforms / Developers / Publishers */}
                <div className="grid grid-cols-3 mb-4 gap-2 items-start">
                    <p className="text-sm font-semibold text-[#8b8b9a]">Platforms:</p>
                    <p className="text-sm font-semibold text-[#8b8b9a]">Developers:</p>
                    <p className="text-sm font-semibold text-[#8b8b9a]">Publishers:</p>
                    <div className="flex gap-2 flex-wrap">
                        {platformList.map((platform) => (
                            <Link
                                key={platform.id}
                                href={`/games?platform=${platform.slug}`}
                                className="px-3 py-1 rounded-lg text-sm font-semibold
                                    text-[#00d4aa] hover:bg-[#00b894] hover:text-[#0e0e10] outline-[#00d4aa] outline-1
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
                                className="px-3 py-1 rounded-lg text-sm font-semibold
                                    text-[#00d4aa] hover:bg-[#00b894] hover:text-[#0e0e10] outline-[#00d4aa] outline-1
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
                                className="px-3 py-1 rounded-lg text-sm font-semibold
                                    text-[#00d4aa] hover:bg-[#00b894] hover:text-[#0e0e10] outline-[#00d4aa] outline-1
                                    transition-colors duration-200
                                    font-(family-name:--font-display)"
                            >
                                {publisher.name}
                            </Link>
                        ))}
                    </div>
                </div>
                {/* Description */}
                <div className="mb-4">
                    <p className="text-sm text-[#8b8b9a] leading-relaxed line-clamp-6">
                        {game?.description}
                    </p>
                </div>
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
                            <p className="text-2xl font-semibold mb-2">NG+ users rated {game.name} a <span style={{ color: ngScoreColor }}>{aggregate_rating}</span>/10</p>
                        ) : (
                            <p className="text-2xl font-semibold mb-2">Be the first NG+ user to rate {game.name}!</p>
                        )}
                        <RateReviewButton game_id={game.id} existing_rating_review={userReview}/>
                    </div>
                    <DistributionChart data={rating_distribution}/>
                    <h2 className="border-t border-[#2a2a35] text-2xl font-semibold mb-2 mt-2 pt-2">Reviews ({count})</h2>
                    {userReview && user && <Review rating_review={userReview} gameName={game.name} gameSlug={game.slug}/>}
                    {ratings_reviews?.filter(r => r.user_id != user?.id).map(r => 
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
                            className="px-4 py-2 text-sm text-[#00d4aa] font-semibold rounded-lg hover:bg-[#00b894] transition-colors duration-200 border border-[#00d4aa] hover:text-[#0e0e10]"
                        >
                            Visit Reddit: {game.reddit_url.replace(/https?:\/\/(www\.)?reddit\.com\//, '').replace(/\/$/, '')}
                        </Link>
                    </div>
                )}
            </div>
        </main>
    )
}