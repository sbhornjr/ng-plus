"use client"

import { createClient } from "@/lib/supabase-browser"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AddToListButton({ gameId, lists } : { gameId : string, lists : { listId: string, listName: string, listCount: number }[]}) {
    const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false)
    const router = useRouter()

    async function addToList(listId: string, listCount: number) {
        const supabase = await createClient()
        const { data: list } = await supabase
            .from("list_games")
            .insert({ list_id: listId, game_id: gameId, position: listCount})

            setIsAddToListModalOpen(false)
            router.refresh()
    }

    return (
        <div>
            <button className="px-4 py-1 text-md text-[#00d4aa] border border-[#00d4aa] self-center justify-self-center
                font-semibold rounded-lg hover:bg-[#00d4aa] hover:text-[#0e0e10] transition-colors duration-200">
                Add to List
            </button>
            {isAddToListModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm w-full h-full flex items-center justify-center z-50 p-5">
                    <div className="bg-[#1a1a1f] border border-[#2a2a35] rounded-2xl w-full max-w-xl max-h-8/10 p-8 relative flex flex-col overflow-y-auto gap-4">
                        <button onClick={() => setIsAddToListModalOpen(false)} className="mb-4 self-end text-[#8b8b9a] border border-[#5a5a6e] bg-[#2a2a35] rounded-4xl px-2 py-1">X</button>
                        <h2 className="font-semibold text-3xl mb-2 self-center">
                            Add to List
                        </h2>
                        {lists.map(l => (
                            <div key={l.listId} className="border border-[#8b8b9a]">
                                <button className="" onClick={() => addToList(l.listId, l.listCount)}>{l.listName}</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}