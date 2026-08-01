"use client"

import { createClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"

export default function RemoveFromListButton({ listId, gameId } : { listId: string, gameId: string }) {
    const router = useRouter()

    async function removeGame() {
        const supabase = await createClient()

        await supabase
            .from("list_games")
            .delete()
            .eq("list_id", listId)
            .eq("game_id", gameId)

        router.refresh()
    }

    return (
        <button
            className="text-xs text-[#8b8b9a] hover:text-[#e05555] 
                transition-colors duration-200 text-center py-1"
            onClick={() => removeGame()}
        >
            Remove
        </button>
    )
}