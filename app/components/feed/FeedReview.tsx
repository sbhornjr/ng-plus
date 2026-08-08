"use client"

import Image from "next/image"
import Link from "next/link"

export default function FeedReview({ gameSlug, gameName, gameCoverImageUrl, rating, review } : 
    { gameSlug: string | null, gameName: string | null, gameCoverImageUrl: string | null, rating: number | null, review: string | null }) {

    const scoreColor = (score: number) => score >= 8 ? '#00d4aa' : score >= 6 ? '#f0a500' : '#e05555'

    return (
        <div className="flex gap-4 p-3 rounded-lg hover:bg-[#2a2a35]/50 transition-colors duration-200 group">
            <Link href={`/games/${gameSlug}`} 
                className="relative w-20 h-28 shrink-0 rounded-lg overflow-hidden">
                {gameCoverImageUrl ? (
                    <Image src={gameCoverImageUrl} alt={gameName!}
                        fill className="object-cover" sizes="80px" />
                ) : (
                    <div className="w-full h-full bg-[#2a2a35] rounded-lg" />
                )}
            </Link>
            <div className="flex flex-col gap-1 min-w-0 flex-1">
                <Link href={`/games/${gameSlug}`}
                    className="font-bold text-base text-[#f0f0f0] hover:text-[#00d4aa] transition-colors duration-200 font-(family-name:--font-display)">
                    {gameName}
                </Link>
                {rating && (
                    <span className="text-sm font-bold"
                        style={{ color: scoreColor(rating) }}>
                        {rating}/10
                    </span>
                )}
                {review && (
                    <p className="text-sm text-[#8b8b9a] leading-relaxed line-clamp-3">
                        {review}
                    </p>
                )}
            </div>
        </div>
    )
}