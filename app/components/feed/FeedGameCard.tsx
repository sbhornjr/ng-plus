"use client"

import Image from "next/image"
import Link from "next/link"

export default function FeedGameCard({ gameSlug, gameName, gameCoverImageUrl, gameReleased, gameDeveloper, userRating, avgRating, metacriticScore } : 
    { gameSlug: string | null, gameName: string | null, gameCoverImageUrl: string | null, gameReleased: string | null, gameDeveloper: string | null, userRating: number | null, avgRating: number | null, metacriticScore: number | null }) {

    const scoreColor = (score: number) => score >= 8 ? '#00d4aa' : score >= 6 ? '#f0a500' : '#e05555'

    return (
        <Link href={`/games/${gameSlug}`} 
            className="flex gap-4 p-3 rounded-lg hover:bg-[#2a2a35]/50 transition-colors duration-200 group">

            <div className="relative w-20 h-28 shrink-0 rounded-lg overflow-hidden">
                {gameCoverImageUrl ? (
                    <Image src={gameCoverImageUrl} alt={gameName ? gameName : "Game Cover"}
                        fill className="object-cover" sizes="80px" />
                ) : (
                    <div className="w-full h-full bg-[#2a2a35] rounded-lg" />
                )}
            </div>

            <div className="flex flex-col justify-center gap-1 flex-1 min-w-0">
                <p className="font-bold text-base text-[#f0f0f0] group-hover:text-[#00d4aa] 
                    transition-colors duration-200 font-(family-name:--font-display)">
                    {gameName}
                </p>
                <p className="text-sm text-[#8b8b9a]">
                    {gameReleased && new Date(gameReleased).getFullYear()}
                    {gameDeveloper && ` · ${gameDeveloper}`}
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                    {userRating && (
                        <span className="text-xs font-bold px-2 py-1 rounded"
                            style={{ color: scoreColor(userRating), border: `1px solid ${scoreColor(userRating)}` }}>
                            You: {userRating}
                        </span>
                    )}
                    {avgRating && (
                        <span className="text-xs font-bold px-2 py-1 rounded"
                            style={{ color: scoreColor(avgRating), border: `1px solid ${scoreColor(avgRating)}` }}>
                            NG+ {avgRating}
                        </span>
                    )}
                    {metacriticScore && (
                        <span className="text-xs font-bold px-2 py-1 rounded"
                            style={{ color: scoreColor(metacriticScore), border: `1px solid ${scoreColor(metacriticScore)}` }}>
                            MC {metacriticScore}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    )
}