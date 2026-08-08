"use client"

import Image from "next/image"
import Link from "next/link"

export default function UserCard({ username, avatarUrl, title, createdAt, followerCount, followingCount, gameCount, avgRating } : 
    { username: string, avatarUrl: string | null, title: string | null, createdAt: string, followerCount: number, followingCount: number, gameCount: number, avgRating: number }) {

    return (
        <Link href={`/user/${username}`}
            className="border border-[#2a2a35] hover:border-[#00d4aa]/50 rounded-xl 
                flex items-center gap-4 p-4 transition-all duration-200 group">
            
            <div className="w-14 h-14 rounded-full bg-[#2a2a35] border border-[#00d4aa]
                flex items-center justify-center overflow-hidden relative shrink-0">
                {avatarUrl ? (
                    <Image src={avatarUrl} alt={username} fill className="object-cover" sizes="56px" />
                ) : (
                    <span className="text-xl font-bold text-[#00d4aa] font-(family-name:--font-display)">
                        {username[0].toUpperCase()}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <p className="font-bold text-[#f0f0f0] group-hover:text-[#00d4aa] 
                    transition-colors duration-200 font-(family-name:--font-display) truncate">
                    {username}
                </p>
                <p className="text-xs text-[#00d4aa] font-semibold font-(family-name:--font-display)">
                    {title ?? "Title-less Noob"}
                </p>
                <p className="text-xs text-[#8b8b9a]">
                    Member since {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-[#8b8b9a]">
                    {followerCount} followers · {followingCount} following
                </p>
            </div>

            <div className="flex gap-3 shrink-0">
                <div className="text-center">
                    <p className="text-lg font-bold text-[#00d4aa] font-(family-name:--font-display)">{gameCount}</p>
                    <p className="text-xs text-[#8b8b9a]">Games</p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-[#00d4aa] font-(family-name:--font-display)">{avgRating ?? '—'}</p>
                    <p className="text-xs text-[#8b8b9a]">Avg</p>
                </div>
            </div>
        </Link>
    )
} 