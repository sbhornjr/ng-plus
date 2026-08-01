"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"

export default function CreateListFromGamePageButton({ userId, gameId, close } : { userId: string, gameId: string, close: () => void }) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [isPinned, setIsPinned] = useState(false)
    const [isPublic, setIsPublic] = useState(true)
    const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false)
    const router = useRouter()

    async function submitList() {
        const supabase = await createClient()

        const { data: list } = await supabase
            .from("lists")
            .insert({ user_id: userId, name: name, description: description, is_public: isPublic, is_pinned: isPinned })
            .select("id")
            .single()

        const { data: listGame } = await supabase
            .from("list_games")
            .insert({ game_id: gameId, list_id: list?.id, position: 0})

        setIsCreateListModalOpen(false)
        close()
        router.refresh()
    }

    return (
        <div className="mb-4 self-center">
            <button onClick={() => setIsCreateListModalOpen(true)} className="px-4 py-1 text-md bg-[#00d4aa] text-[#0e0e10] font-semibold rounded-lg hover:bg-[#00b894] transition-colors duration-200">
                New List
            </button>
            {isCreateListModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm w-full h-full flex items-center justify-center z-50 p-5">
                    <div className="bg-[#1a1a1f] border border-[#2a2a35] rounded-2xl w-full max-w-xl max-h-8/10 p-8 relative flex flex-col overflow-y-auto gap-4">
                        <button onClick={() => setIsCreateListModalOpen(false)} className="mb-4 self-end text-[#8b8b9a] border border-[#5a5a6e] bg-[#2a2a35] rounded-4xl px-2 py-1">X</button>
                        <h2 className="font-semibold text-3xl mb-2 self-center">
                            Create a List
                        </h2>
                        <div>
                            <h2 className="font-semibold text-md px-1">List Name</h2>
                            <input
                                type="text"
                                placeholder="List Name..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#1a1a24] text-[#8b8b9a] placeholder:text-[#5a5a6e] self-center justify-self-center border border-[#2a2a35] focus:outline-none rounded-lg px-2 py-1"
                            />
                        </div>
                        <div>
                            <h2 className="font-semibold text-md px-1">Description (Optional)</h2>
                            <textarea
                                placeholder="Description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full bg-[#1a1a24] text-[#8b8b9a] placeholder:text-[#5a5a6e] 
                                    border border-[#2a2a35] focus:outline-none focus:border-[#00d4aa]
                                    rounded-lg px-3 py-2 resize-none"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            {[
                                { label: 'Public', value: isPublic, setter: setIsPublic },
                                { label: 'Pinned', value: isPinned, setter: setIsPinned },
                            ].map(({ label, value, setter }) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => setter(!value)}
                                    className="flex items-center gap-3 text-left"
                                >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center
                                    transition-all duration-200 shrink-0
                                    ${value 
                                    ? 'bg-[#00d4aa] border-[#00d4aa]' 
                                    : 'bg-transparent border-[#2a2a35] hover:border-[#00d4aa]'}`}
                                >
                                    {value && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                        <path d="M1 4L3.5 6.5L9 1" stroke="#0e0e10" strokeWidth="2" 
                                        strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    )}
                                </div>
                                <span className="text-sm font-semibold text-[#f0f0f0]">{label}</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => submitList()} className="px-4 py-1 text-md bg-[#00d4aa] text-[#0e0e10] font-semibold rounded-lg hover:bg-[#00b894] transition-colors duration-200">
                            Create List
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}