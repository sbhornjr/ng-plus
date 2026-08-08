"use client"

import Image from "next/image"
import Link from "next/link"
import FeedGameCard from "@/app/components/feed/FeedGameCard"
import FeedReview from "@/app/components/feed/FeedReview"
import FeedListPreview from "@/app/components/feed/FeedListPreview"

export function timeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

type FeedItem = {
	activity_type: string
	created_at: string
	actor_id: string
	actor_username: string
	actor_avatar_url: string | null
	game_id: string | null
	game_name: string | null
	game_slug: string | null
	game_cover_image_url: string | null
	game_released: string | null
	game_metacritic_score: number | null
	game_developer: string | null
	game_avg_rating: number | null
	viewer_game_rating: number | null
    list_cover_urls: string[] | null
	list_id: string | null
	list_name: string | null
	list_description: string | null
	list_owner_username: string | null
	list_game_count: number | null
	list_last_activity: string | null
	list_like_count: number | null
	viewer_liked_list: boolean | null
	rating: number | null
	review: string | null
	review_created_at: string | null
	review_updated_at: string | null
    library_status: string | null
}

export default function FeedItem({ item }: { item: FeedItem }) {

    const activity_text = item.activity_type === "library_add" 
        ? `added ${item.game_name} to their ${item.library_status === 'playing' ? 'currently playing' : item.library_status}` 
        : item.activity_type === "review" ? `reviewed ${item.game_name}` 
        : item.activity_type === "rating" ? `rated ${item.game_name} a ${item.rating}/10` 
        : item.activity_type === "list_created" ? `created the list "${item.list_name}"`
        : item.activity_type === "list_liked" ? `liked "${item.list_name}" by ${item.list_owner_username}` : ""

    return (
        <div key={item.created_at} className="p-4 bg-[#1a1a1f] rounded-xl border border-[#2a2a35] hover:border-[#2a2a35]/80 transition-colors duration-200">
            
            <div className="mb-2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#2a2a35] border border-[#00d4aa] flex items-center justify-center overflow-hidden relative">
                    {item.actor_avatar_url ? (
                        <Image
                            src={item.actor_avatar_url}
                            alt={item.actor_username}
                            fill
                            className="object-cover"
                            sizes="28px"
                        />
                    ) : (
                        <span className="text-xs font-bold text-[#00d4aa]">
                            {item.actor_username[0].toUpperCase()}
                        </span>
                    )}
                </div>
                <p className="text-sm text-[#8b8b9a] flex-1 min-w-0">
                    <Link href={`/user/${item.actor_username}`} 
                        className="text-[#f0f0f0] font-semibold hover:text-[#00d4aa] transition-colors duration-200">
                        {item.actor_username}
                    </Link>
                    {' '}{activity_text}
                    </p>
                <span className="text-xs text-[#8b8b9a] shrink-0">{timeAgo(item.created_at)}</span>
            </div>
            {(item.activity_type === "library_add" || item.activity_type === "rating") && 
                <FeedGameCard 
                    gameSlug={item.game_slug} 
                    gameName={item.game_name} 
                    gameCoverImageUrl={item.game_cover_image_url} 
                    gameReleased={item.game_released}
                    gameDeveloper={item.game_developer}
                    userRating={item.viewer_game_rating}
                    avgRating={item.game_avg_rating}
                    metacriticScore={item.game_metacritic_score}
                />
            }
            {item.activity_type === "review" &&
                <FeedReview 
                    gameSlug={item.game_slug}
                    gameName={item.game_name}
                    gameCoverImageUrl={item.game_cover_image_url}
                    rating={item.rating}
                    review={item.review}
                />
            }
            {(item.activity_type === "list_created" || item.activity_type === "list_liked") &&
                <FeedListPreview
                    listId={item.list_id}
                    listOwnerUsername={item.list_owner_username}
                    listName={item.list_name}
                    listDescription={item.list_description}
                    listGameCount={item.list_game_count}
                    listLikeCount={item.list_like_count}
                    listCoverUrls={item.list_cover_urls}
                />
            }
        </div>
    )
}