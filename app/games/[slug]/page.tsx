import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Image from 'next/image'
import Link from 'next/link'
import ScreenshotCarousel from "@/app/components/ScreenshotCarousel";

type GamePageProps = {
    params: Promise<{ slug: string }>
}

export default async function GamePage({ params }: GamePageProps) {
    const { slug } = await params;

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

    return (
        <main>
            {/* Header */}
            <nav className="h-14 border-b border-[#2a2a35]" />

            <div className="w-full max-w-6xl mx-auto px-8 py-12">

                {/* Back to Games link */}
                <Link href="/games" className="inline-flex items-center gap-2 text-[#8b8b9a]
                    text-sm font-semibold mb-8 group hover:text-[#00d4aa] transition-colors duration-200
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

                    <div className="flex flex-col">

                        {/* Genres */}
                        <div className="flex gap-2 flex-wrap mb-3 items-center">
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
                        </div>
                        {/* Button Row */}
                        <div className="flex gap-4 flex-wrap mb-6 w-48 md:w-64 lg:w-80 justify-start">
                            {/* Add to Library Button */}
                            <button className="px-4 py-1 text-md bg-[#00d4aa] text-[#0e0e10] font-semibold rounded-lg hover:bg-[#00b894] transition-colors duration-200">
                                Add to Library
                            </button>
                            {/* Add to List Button */}
                            <button className="px-4 py-1 text-md text-[#00d4aa] border border-[#00d4aa]
                                font-semibold rounded-lg hover:bg-[#00d4aa] hover:text-[#0e0e10] transition-colors duration-200">
                                Add to List
                            </button>
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
                        <h2 className="text-md font-semibold mb-2 font-(family-name:--font-display)
                            text-[#8b8b9a] uppercase tracking-widest text-center">
                            Screenshots:
                        </h2>
                        <ScreenshotCarousel screenshots={game.screenshots.slice(1) ?? []} />
                    </div>
                )}
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