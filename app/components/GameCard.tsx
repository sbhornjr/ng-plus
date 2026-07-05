import Image from 'next/image'
import Link from 'next/link'

type Game = {
  id: string
  name: string
  slug: string
  cover_image_url: string | null
  metacritic_score: number | null
  released: string | null
}

export default function GameCard({ game }: { game: Game }) {
  return (
    <Link href={`/games/${game.slug}`} className="group block">
      <div
        className="relative rounded-xl overflow-hidden border-3 border-[#2a2a35]
          bg-[#1a1a1f] transition-all duration-300 
          group-hover:border-[#00d4aa]/50
          group-hover:shadow-[0_0_20px_rgba(0,212,170,0.08)]"
      >
        {/* Cover image */}
        <div className="relative aspect-square w-full overflow-hidden">
          {game.cover_image_url ? (
            <Image
              src={game.cover_image_url}
              alt={game.name}
              fill
              className="object-cover transition-all duration-100 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="w-full h-full bg-[#2a2a35] flex items-center justify-center">
              <span className="text-[#8b8b9a] text-sm">No image</span>
            </div>
          )}

          {/* Metacritic badge */}
          {game.metacritic_score && (
            <div
              className="absolute top-2 right-2 min-w-[2rem] px-2 py-1 rounded-md text-sm font-bold text-center
                font-[family-name:var(--font-display)]"
              style={{
                backgroundColor: game.metacritic_score >= 80
                  ? '#00d4aa'
                  : game.metacritic_score >= 60
                  ? '#f0a500'
                  : '#e05555',
                color: '#0e0e10',
              }}
            >
              {game.metacritic_score}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3
            className="font-semibold text-md leading-tight text-[#f0f0f0]
              group-hover:text-[#00d4aa] transition-colors duration-200
              font-[family-name:var(--font-display)] line-clamp-1"
          >
            {game.name}
          </h3>
          {game.released && (
            <p className="text-[#8b8b9a] text-sm mt-1">
              {new Date(game.released).getFullYear()}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}