import Image from 'next/image'
import Link from 'next/link'
import { Game, AdvancedStats } from '@/types'
import Seal from '@/app/components/game/Seal'

export default function GameCard({ game, developer, ngplusRating, userRating, advancedStats } :
  { game: Game, developer?: string | null, ngplusRating?: number | null, userRating?: number | null, advancedStats?: AdvancedStats | null | undefined }) {
  const hasHours = !!advancedStats?.hoursPlayed && advancedStats.hoursPlayed > 0
  const hasPlayCount = !!advancedStats?.playCount && advancedStats.playCount > 1

  return (
    <Link href={`/games/${game.slug}`} className="group block">
      <div
        className="relative rounded-[3px] overflow-hidden border border-(--color-muted)/30
          bg-(--color-surface) transition-colors duration-200
          group-hover:border-(--color-accent)/60"
      >
        {/* Cover image */}
        <div className="relative aspect-square w-full overflow-hidden">
          {game.cover_image_url ? (
            <Image
              src={game.cover_image_url}
              alt={game.name}
              fill
              className="object-cover grayscale-15 contrast-[1.05] transition-all duration-300 group-hover:grayscale-0"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="relative w-full h-full bg-(--color-surface-light) flex items-center justify-center overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{ backgroundImage: 'repeating-linear-gradient(135deg, var(--color-muted) 0, var(--color-muted) 1px, transparent 1px, transparent 9px)' }}
              />
              <span className="relative text-(--color-muted) text-[10px] uppercase tracking-[0.2em] font-mono">
                No Cover
              </span>
            </div>
          )}

          {!ngplusRating && game.metacritic_score && (
            <Seal label="MC" score={game.metacritic_score} side="right" />
          )}
          {ngplusRating && (
            <Seal label="NG+" score={ngplusRating} side="right" />
          )}
          {userRating && (
            <Seal label="You" score={userRating} side="left" />
          )}
        </div>

        {/* Catalog label */}
        <div className="px-3 pt-2.5 pb-3">
          <h3
            className="font-medium text-[15px] leading-tight text-(--color-text)
              group-hover:text-(--color-accent) transition-colors duration-200
              font-(family-name:--font-display) line-clamp-1"
          >
            {game.name}
          </h3>
          <div className="border-t border-dotted border-(--color-muted)/40 mt-1.5 pt-1.5 flex items-baseline justify-between gap-2">
            <p className="text-(--color-muted) text-xs font-(family-name:--font-body) line-clamp-1">
              {developer ?? ' '}
            </p>
            {game.released && (
              <span className="text-(--color-muted) text-xs shrink-0 font-mono">
                {new Date(game.released).getFullYear()}
              </span>
            )}
          </div>
          {advancedStats && (
            <div className="mt-1.5 flex items-center gap-1.5">
              {/* Always rendered (even when empty) so every card in a row reserves
                  identical height — a conditional min-height would drift out of sync
                  the moment either slot's padding/border changes. */}
              <span className="text-(--color-muted) text-[11px] whitespace-nowrap font-mono tracking-tight">
                {hasHours && `${advancedStats.hoursPlayed}h`}
                {hasHours && hasPlayCount && ' · '}
                {hasPlayCount && `×${advancedStats.playCount}`}
                {!hasHours && !hasPlayCount && ' '}
              </span>
              <span
                className={`ml-auto inline-flex items-center gap-0.5 rounded-full border
                  px-1.5 py-[1px] text-[9px] font-semibold uppercase tracking-wider
                  ${advancedStats.is100
                    ? 'bg-(--color-accent)/15 border-(--color-accent)/50 text-(--color-accent)'
                    : 'invisible border-transparent'}`}
              >
                ✓ 100%
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}