"use client"

import { createClient } from "@/lib/supabase-browser";
import { useState } from "react";
import { getTitles } from "@/lib/titles";
import { useRouter } from "next/navigation";

export default function TitleSelectButton({ userId, currentTitle, topGames, topDevelopers } : { userId: number, currentTitle : string, topGames : string[], topDevelopers : string[] }) {
    const [isTitleSelectModalOpen, setIsTitleSelectModalOpen] = useState(false)
    const [selectedTitle, setSelectedTitle] = useState(currentTitle)
    const router = useRouter()

    async function handleTitleChange(title: string) {
        const supabase = createClient()
        const { data } = await supabase
            .from('users')
            .update({ selected_title: title })
            .eq("id", userId)
            .select("selected_title")
            .single()
        setSelectedTitle(data?.selected_title)
        setIsTitleSelectModalOpen(false)

        router.refresh()
    }

    return (
        <div className="mx-2">
            <button className="px-2 py-0.5 rounded-md text-xs font-semibold
                bg-[#2a2a35] text-[#8b8b9a] hover:bg-[#00d4aa]/10 hover:text-[#00d4aa]
                border border-[#2a2a35] hover:border-[#00d4aa]
                transition-all duration-200"
                onClick={() => setIsTitleSelectModalOpen(true)}>
                Edit
            </button>
            {isTitleSelectModalOpen && 
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm w-full h-full flex flex-col items-center justify-center z-50">
                    <div className="bg-[#1a1a1f] border border-[#2a2a35] rounded-2xl max-w-md max-h-8/10 p-8 relative flex flex-col overflow-scroll">
                        <button onClick={() => setIsTitleSelectModalOpen(false)} className="mb-4 self-end text-[#8b8b9a] border border-[#5a5a6e] bg-[#2a2a35] rounded-4xl px-2 py-1">X</button>
                        <h2 className="font-semibold text-3xl mb-6 self-center">
                            Select Title
                        </h2>
                        <div className="grid grid-cols-2 gap-4 items-center">
                            {getTitles({topGames, topDevelopers}).map(t =>
                                <button key={t} onClick={() => handleTitleChange(t)} 
                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl
                                        border border-[#2a2a35] hover:border-[#00d4aa] hover:bg-[#00d4aa]/5
                                        transition-all duration-200 group text-left
                                        ${selectedTitle === t && 'text-[#0e0e10] bg-[#00d4aa]'}`}>
                                    <span className="text-xs text-[#8b8b9a]">{t}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}