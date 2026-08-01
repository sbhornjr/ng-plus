"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"

type GameCover = {
    coverImageUrl: string | null
    slug: string | null
}

export default function ListPreview({ listId, listName, gameCovers, isPinnable, description, lastUpdated, username, listCount, isPinned } : 
    { listId: number, listName: string, gameCovers: GameCover[] | undefined, isPinnable: boolean, description: string, lastUpdated: string, username: string, listCount: number, isPinned?: boolean }) {
    const [isPinnedNow, setIsPinnedNow] = useState(isPinned)
    const router = useRouter()

    async function handlePinChange() {
        const supabase = await createClient()

        const { data: list } = await supabase
            .from("lists")
            .update({ is_pinned: !isPinnedNow })
            .eq("id", listId)
            .select("is_pinned")
            .single()

        setIsPinnedNow(list?.is_pinned)
        router.refresh()
    }

    return (
        <div className="flex flex-col self-center w-1/2 relative border border-[#2a2a35] rounded-xl p-4 hover:border-[#00d4aa]/50 transition-all duration-200 group">
             <Link 
                href={`/user/${username}/lists/${listId}`}
                className="absolute inset-0 rounded-xl z-0"
                aria-label={listName}
            />
            <div className="flex flex-row justify-between mb-2 px-2 py-1">
                <Link href={`/user/${username}`} className="text-md font-semibold text-[#8b8b9a] hover:text-[#00d4aa] 
                    transition-colors duration-200 block relative z-10">{username}</Link>
                <p className="text-md font-semibold text-[#8b8b9a]">Last Updated: {new Date(lastUpdated).getMonth() + 1}/{new Date(lastUpdated).getDate()}/{new Date(lastUpdated).getFullYear()}</p>
            </div>
            <div className="flex flex-row mb-2 px-2 py-1 gap-2 justify-between items-center">
                <h2 className="text-xl font-semibold whitespace-nowrap">{listName} ({listCount})</h2>
                <p className="text-sm text-[#8b8b9a] line-clamp-2">{description}</p>
            </div>
            <div className="flex flex-row mb-2 px-2 py-2 gap-2">
                {gameCovers?.map(g => (
                    <Link key={g.slug} href={`/games/${g.slug ?? ''}`} className="relative w-30 h-30 shrink-0 block z-10 overflow-hidden rounded-lg">
                        {g.coverImageUrl && (
                            <Image
                                src={g.coverImageUrl}
                                alt={g.slug ?? ''}
                                fill
                                className="object-cover transition-all duration-200 hover:scale-105"
                                sizes="160px"
                            />
                        )}
                    </Link>
                ))}
                {isPinnable && (
                    <button
                        onClick={async (e) => {
                            e.stopPropagation() 
                            handlePinChange()
                        }}
                        className="relative z-10 shrink-0 w-10 h-10 rounded-lg border
                            flex items-center justify-center self-center
                            transition-all duration-200
                            group/pin ml-auto
                            border-[#2a2a35] hover:border-[#00d4aa]
                            bg-transparent hover:bg-[#00d4aa]/10"
                        title={isPinnedNow ? 'Unpin list' : 'Pin list'}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill={isPinnedNow ? '#00d4aa' : 'none'}
                            stroke={isPinnedNow ? '#00d4aa' : '#8b8b9a'}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-all duration-200 group-hover/pin:stroke-[#00d4aa]"
                        >
                            <line x1="12" y1="17" x2="12" y2="22"/>
                            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    )
}