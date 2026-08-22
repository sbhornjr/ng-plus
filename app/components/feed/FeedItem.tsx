"use client"

import Link from "next/link"
import FeedGameCard from "@/app/components/feed/FeedGameCard"
import FeedReview from "@/app/components/feed/FeedReview"
import FeedListPreview from "@/app/components/feed/FeedListPreview"
import Avatar from "@/app/components/user/Avatar"
import type { FeedItem as FeedItemType } from "@/types"

export function timeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function FeedItem({ item }: { item: FeedItemType }) {

    const activity_text = item.activity_type === "library_add" 
        ? `added ${item.game_name} to their ${item.library_status === 'playing' ? 'currently playing' : item.library_status}` 
        : item.activity_type === "review" ? `reviewed ${item.game_name}` 
        : item.activity_type === "rating" ? `rated ${item.game_name} a ${item.rating}/10` 
        : item.activity_type === "list_created" ? `created the list "${item.list_name}"`
        : item.activity_type === "list_liked" ? `liked "${item.list_name}" by ${item.list_owner_username}` : ""

    return (
        <div key={item.created_at} className="p-4 bg-(--color-surface) rounded-[3px] border border-(--color-border) hover:border-(--color-accent)/40 transition-colors duration-200">

            <div className="mb-2 flex items-center gap-2">
                <Avatar src={item.actor_avatar_url} alt={item.actor_username} size="sm" bordered />
                <p className="text-sm text-(--color-muted) flex-1 min-w-0">
                    <Link href={`/user/${item.actor_username}`}
                        className="text-(--color-text) font-semibold hover:text-(--color-accent) transition-colors duration-200">
                        {item.actor_username}
                    </Link>
                    {' '}{activity_text}
                    </p>
                <span className="text-xs text-(--color-muted) shrink-0 font-mono">{timeAgo(item.created_at)}</span>
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