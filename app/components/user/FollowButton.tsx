"use client"

import { createClient } from "@/lib/supabase-browser"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { followUser, unfollowUser } from "@/lib/queries/user"

export default function FollowButton({ userId, targetUserId, initialIsFollowing } : 
    { userId: string, targetUserId: string, initialIsFollowing: boolean }) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [isLoading, setIsLoading] = useState(false)
    const [hovering, setHovering] = useState(false)
    const router = useRouter()

    async function handleFollow() {
        setIsLoading(true)
        const supabase = createClient()

        if (isFollowing) {
            await unfollowUser(supabase, userId, targetUserId)
        } else {
            await followUser(supabase, userId, targetUserId)
        }

        setIsFollowing(!isFollowing)
        setIsLoading(false)
        router.refresh()
    }

    return (
        <button className={`px-4 py-2 rounded-[3px] text-sm font-semibold ml-auto transition-colors duration-200 w-24
                    ${hovering 
                        ? isFollowing ? 'bg-(--color-bad) text-(--color-text) border border-(--color-bad)' : 'bg-(--color-accent) text-(--color-text) border border-(--color-accent)'
                        : 'bg-transparent text-(--color-accent) border border-(--color-accent)'}`}
                    onClick={() => handleFollow()}
                    onMouseEnter={() => setHovering(true)}
                    onMouseLeave={() => setHovering(false)}>
            {isLoading ? '...' : (isFollowing ? (hovering ? 'Unfollow' : 'Following') : 'Follow')}
        </button>
    )

}