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

type AdvancedStats = {
  is100: boolean,
  hoursPlayed: number | null,
  playCount: number
}

export default function GameCard({ game, developer, ngplusRating, userRating, advancedStats } : 
  { game: Game, developer?: string | null, ngplusRating?: number | null, userRating?: number | null, advancedStats?: AdvancedStats | null | undefined }) {
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

          {/* Rating badge */}
          {!ngplusRating && game.metacritic_score && (
            <div
              className="absolute top-2 right-2 min-w-8 px-2 py-1 rounded-md text-sm font-bold text-center
                font-(family-name:--font-display) flex flex-col items-center gap-0.5"
              style={{
                backgroundColor: game.metacritic_score >= 80
                  ? '#00d4aa'
                  : game.metacritic_score >= 60
                  ? '#f0a500'
                  : '#e05555',
                color: '#0e0e10',
              }}
            >
              <span className="text-xs font-bold text-[#0e0e10] leading-none uppercase tracking-wider">MC</span>
              <span className="text-sm font-bold text-[#0e0e10] leading-none">{game.metacritic_score}</span>
            </div>
          )}
          {/* NGPlus badge */}
          {ngplusRating && (
            <div
              className="absolute top-2 right-2 min-w-8 px-2 py-1 rounded-md text-sm font-bold text-center
                font-(family-name:--font-display) flex flex-col items-center gap-0.5"
              style={{
                backgroundColor: ngplusRating >= 8
                  ? '#00d4aa'
                  : ngplusRating >= 6
                  ? '#f0a500'
                  : '#e05555',
                color: '#0e0e10',
              }}
            >
              <span className="text-xs font-bold text-[#0e0e10] leading-none uppercase tracking-wider">NG+</span>
              <span className="text-sm font-bold text-[#0e0e10] leading-none">{ngplusRating}</span>
            </div>
          )}
          {/* User Rating badge */}
          {userRating && (
            <div
              className="absolute top-2 left-2 min-w-8 px-2 py-1 mx-0.5 rounded-md text-sm font-bold text-center
                font-(family-name:--font-display) flex flex-col items-center gap-0.5"
              style={{
                backgroundColor: userRating >= 8
                  ? '#00d4aa'
                  : userRating >= 6
                  ? '#f0a500'
                  : '#e05555',
                color: '#0e0e10',
              }}
            >
              <span className="text-xs font-bold text-[#0e0e10] leading-none uppercase tracking-wider">You</span>
              <span className="text-sm font-bold text-[#0e0e10] leading-none">{userRating}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3
            className="font-semibold text-md leading-tight text-[#f0f0f0]
              group-hover:text-[#00d4aa] transition-colors duration-200
              font-(family-name:--font-display) line-clamp-1"
          >
            {game.name}
          </h3>
          {game.released && (
            <p className="text-[#8b8b9a] text-sm mt-1">
              {new Date(game.released).getFullYear()}
            </p>
          )}
          {developer && (
            <p className="text-[#8b8b9a] text-sm mt-1 line-clamp-1">
              {developer}
            </p>
          )}
          {advancedStats && (
            <p className="text-[#8b8b9a] text-sm mt-1 whitespace-nowrap">
              {advancedStats.hoursPlayed && `⏱ ${advancedStats.hoursPlayed}h · `} {advancedStats.playCount > 1 && `⟳ x${advancedStats.playCount}`} {advancedStats.is100 && "· ✓ 100%"}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}