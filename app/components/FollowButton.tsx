"use client"

import { createClient } from "@/lib/supabase-browser"
import { useState } from "react"
import { useRouter } from "next/navigation"

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
            await supabase
                .from('follows')
                .delete()
                .eq('follower_id', userId)
                .eq('following_id', targetUserId)
        } else {
            await supabase
                .from('follows')
                .insert({ follower_id: userId, following_id: targetUserId })
        }

        setIsFollowing(!isFollowing)
        setIsLoading(false)
        router.refresh()
    }

    return (
        <button className={`px-4 py-2 rounded-lg text-sm font-semibold ml-auto transition-colors duration-200 w-24
                    ${hovering 
                        ? isFollowing ? 'bg-[#e05555] text-[#f0f0f0] border border-[#e05555]' : 'bg-[#00d4aa] text-[#f0f0f0] border border-[#00d4aa]'
                        : 'bg-transparent text-[#00d4aa] border border-[#00d4aa]'}`}
                    onClick={() => handleFollow()}
                    onMouseEnter={() => setHovering(true)}
                    onMouseLeave={() => setHovering(false)}>
            {isLoading ? '...' : (isFollowing ? (hovering ? 'Unfollow' : 'Following') : 'Follow')}
        </button>
    )

}