import Image from "next/image"
import Link from "next/link"

export default function Review({ rating_review, gameName, gameSlug } : { rating_review: { rating: number, review: string, user_id: string, created_at: string, updated_at: string, 
    users: { username: string, display_name: string, avatar_url: string }[]}, gameName: string, gameSlug: string}) {

    const ngScoreColor = rating_review.rating >= 8
    ? '#00d4aa'
    : rating_review.rating >= 6
    ? '#f0a500'
    : rating_review.rating >= 3
    ? '#e05555'
    : '#8b8b9a'

    console.log(rating_review)

    return (
        <div className="border border-[#2a2a35] rounded-xl px-4 py-4 mb-3 bg-[#1a1a1f]">
              {/* Game name as headline */}
            {gameName && gameSlug && (
                <Link 
                href={`/games/${gameSlug}`}
                className="text-sm font-semibold text-[#8b8b9a] hover:text-[#00d4aa] 
                    transition-colors duration-200 mb-2 block"
                >
                {gameName}
                </Link>
            )}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    {/* Avatar circle */}
                    <div className="w-8 h-8 rounded-full bg-[#2a2a35] flex items-center justify-center
                        text-xs font-bold text-[#00d4aa] relative">
                        {rating_review.users.avatar_url ? (
                            <Image
                                src={rating_review.users.avatar_url}
                                alt={rating_review.users.username}
                                fill
                                className="object-cover transition-all duration-100 group-hover:scale-105"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-[#2a2a35] border border-[#00d4aa]
                                flex items-center justify-center shrink-0">
                                <span className="text-2xl font-bold text-[#00d4aa] font-(family-name:--font-display)">
                                    {rating_review.users.username[0].toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-[#f0f0f0] mx-2">{rating_review.users.username}</p>
                        <p className="text-xs text-[#8b8b9a] mx-2">
                        {new Date(rating_review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                {/* Rating badge */}
                <span className="text-xl font-bold font-(family-name:--font-display) ml-auto"
                style={{ color: ngScoreColor }}>
                {rating_review.rating}<span className="text-sm text-[#8b8b9a] font-normal">/10</span>
                </span>
            </div>
            {rating_review.review && (
                <p className="text-sm text-[#8b8b9a] leading-relaxed">{rating_review.review}</p>
            )}
        </div>
    )
}