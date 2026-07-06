import { supabase } from "@/lib/supabase";
import GameCard from "@/app/components/GameCard";
import Link from "next/link";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { q } = await searchParams;
    const query = q?.trim() ?? '';

    const { data: games } = await supabase
        .from('games')
        .select('id, name, slug, cover_image_url, metacritic_score, released')
        .ilike('name', `%${query}%`)
        .order('metacritic_score', { ascending: false, nullsFirst: false })
        .limit(10)

    return (
        <main>
            <nav className="h-14 border-b border-[#2a2a35]" />
            
            <div className="w-full max-w-6xl mx-auto px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <p className="text-[#8b8b9a] text-md mb-1">Search results for</p>
                    <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
                        {query ? `"${query}"` : 'All Games'}
                    </h1>
                {games && (
                    <p className="text-[#8b8b9a] text-sm mt-2">
                        {games.length} game{games.length !== 1 ? 's' : ''} found
                    </p>
                )}
                </div>

                {/* Game grid */}
                {games && games.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {games.map(game => (
                            <GameCard key={game.id} game={game} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <p className="text-4xl mb-4">🎮</p>
                        <h2 className="text-xl font-semibold mb-2 font-[family-name:var(--font-display)]">
                            No games found
                        </h2>
                        <p className="text-[#8b8b9a] text-sm mb-6">
                            Try a different search, or browse <Link href="/games" className="text-[#00d4aa] hover:underline">our library</Link>.
                        </p>
                        <Link href="/" className="px-5 py-2.5 rounded-lg text-sm font-semibold
                            bg-[#00d4aa] text-[#0e0e10] hover:bg-[#00b894]
                            transition-colors duration-200
                            font-[family-name:var(--font-display)]"
                        >
                            Back to Home
                        </Link>
                    </div>
                )}
            </div>
        </main>
    )
}