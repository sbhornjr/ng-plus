"use client"

import { createClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"
import { removeGameFromList } from "@/lib/queries/list"

export default function RemoveFromListButton({ listId, gameId } : { listId: string, gameId: string }) {
    const router = useRouter()

    async function removeGame() {
        const supabase = createClient()
        await removeGameFromList(supabase, listId, gameId)
        router.refresh()
    }

    return (
        <button
            className="text-xs text-(--color-muted) hover:text-(--color-bad) 
                transition-colors duration-200 text-center py-1"
            onClick={() => removeGame()}
        >
            Remove
        </button>
    )
}