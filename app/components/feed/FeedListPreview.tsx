"use client"

import Link from "next/link"
import Image from "next/image"

export default function FeedListPreview({ listId, listName, listDescription, listOwnerUsername, listGameCount, listLikeCount, listCoverUrls } :
    { listId: string | null, listName: string | null, listDescription: string | null, listOwnerUsername: string | null, listGameCount: number | null, listLikeCount: number | null, listCoverUrls: string[] | null }) {

    return (
        <Link href={`/user/${listOwnerUsername}/lists/${listId}`}
            className="flex flex-col gap-2 p-2 rounded-lg hover:bg-[#2a2a35]/50 transition-colors duration-200 group">
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0 flex-1">
                    <p className="font-bold text-base text-[#f0f0f0] group-hover:text-[#00d4aa]
                        transition-colors duration-200 font-(family-name:--font-display)">
                        {listName}
                    </p>
                    {listDescription && (
                        <p className="text-sm text-[#8b8b9a] mt-1 line-clamp-2">
                            {listDescription}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-3 text-sm text-[#8b8b9a] shrink-0">
                    <span>♥ {listLikeCount ?? 0}</span>
                    <span>· {listGameCount ?? 0} games</span>
                </div>
            </div>
            {listCoverUrls && listCoverUrls.length > 0 && (
                <div className="flex gap-1">
                    {listCoverUrls.slice(0, 5).map((url, i) => (
                        <div key={i} className="relative w-24 h-32 rounded overflow-hidden shrink-0">
                            <Image src={url} alt="" fill className="object-cover" sizes="96px" />
                        </div>
                    ))}
                </div>
            )}
        </Link>
    )
}