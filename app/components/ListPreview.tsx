"use client"

import { useState } from "react"
import Link from "next/link"

export default function ListPreview({ listName, gameCovers, isPinnable, description, lastUpdated, username, isPinned } : 
    { listName: string, gameCovers: (string | null)[] | undefined, isPinnable: boolean, description: string, lastUpdated: string, username: string, isPinned?: boolean }) {
    

    return (
        <div className="flex flex-col border border-[#8989ba] rounded-lg self-center w-1/2">
            <div className="flex flex-row justify-between mb-2 px-2 py-1">
                <Link href={`/user/${username}`} className="text-md font-semibold text-[#8b8b9a] hover:text-[#00d4aa] 
                    transition-colors duration-200 block">{username}</Link>
                <p className="text-md font-semibold text-[#8b8b9a]">Last Updated: {new Date(lastUpdated).getMonth() + 1}/{new Date(lastUpdated).getDate()}/{new Date(lastUpdated).getFullYear()}</p>
            </div>
            <div className="flex flex-row mb-2 px-2 py-1 gap-2 justify-between items-center">
                <h2 className="text-xl font-semibold whitespace-nowrap">{listName}</h2>
                <p className="text-sm text-[#8b8b9a] line-clamp-2">{description}</p>
            </div>
        </div>
    )
}