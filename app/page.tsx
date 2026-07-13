import { supabase } from '@/lib/supabase'
import SearchBar from '@/app/components/SearchBar'
import GameCard from '@/app/components/GameCard'

export default async function Home() {
  const { data: games } = await supabase
    .from('games')
    .select('id, name, slug, cover_image_url, metacritic_score, released')
    .order('metacritic_score', { ascending: false })
    .limit(10)

  return (
    <main>
      <section className="flex flex-col items-center justify-center px-6 pt-10 pb-8 text-center">
        <p className="text-[#00d4aa] text-xs font-semibold tracking-widest uppercase mb-3
          font-(family-name:--font-display)">
          Your gaming identity
        </p>
        <h1 className="text-7xl font-bold mb-4 font-(family-name:--font-display) tracking-tight">
          NG<span className="text-[#00d4aa]">+</span>
        </h1>
        <p className="text-[#8b8b9a] text-lg mb-10 max-w-md">
          Track every game. Own your taste. Show your Loadout.
        </p>
        <SearchBar />
      </section>

      <section className="w-full max-w-6xl mx-auto px-8 pb-24">
        <h2 className="text-md font-semibold mb-6 font-(family-name:--font-display)
          text-[#8b8b9a] uppercase tracking-widest">
          Top Rated
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {(games ?? []).map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
    </main>
  )
}