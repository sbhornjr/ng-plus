'use client'

import { useState, useEffect } from "react"
import AuthModal from "@/app/components/AuthModal"
import { useUser } from "@/app/components/UserContext"
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from "next/navigation"

export default function LibraryButton({ game_id }: { game_id: number }) {
    const { user } = useUser()
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false)
    const [libraryEntry, setLibraryEntry] = useState<{ id: string, status: string } | null>(null)
    const router = useRouter()

    useEffect(() => {

        async function checkEntry() {
            if (!user) return

            const supabase = createClient()
            const { data } = await supabase
                .from('library_entries')
                .select('id, status')
                .eq('user_id', user.id)
                .eq('game_id', game_id)
                .single()

            setLibraryEntry(data ?? null)
        }

        if (user) checkEntry()
    }, [user, game_id])

    async function addToLibrary(status: string) {
        if (!user) return

        const supabase = createClient()

        if (libraryEntry) {
            const { data } = await supabase
                .from('library_entries')
                .update({ status: status })
                .eq("user_id", user.id)
                .eq("game_id", game_id)
                .select("id, status")
                .single()
            setLibraryEntry(data)
        }
        else {
            const { data } = await supabase
                .from('library_entries')
                .insert({ user_id: user.id, game_id: game_id, status: status })
                .select("id, status")
                .single()
            setLibraryEntry(data)
        }

        setIsLibraryModalOpen(false)
        router.refresh()
    }

    async function removeFromLibrary() {
        if (!user || !libraryEntry) return

        const supabase = createClient()
        await supabase
            .from('library_entries')
            .delete()
            .eq("id", libraryEntry.id)

        setLibraryEntry(null)
        setIsLibraryModalOpen(false)
        router.refresh()
    }

    return (
        <div>
            { user == null ? (
                <button onClick={() => setIsAuthModalOpen(true)} className="px-4 py-1 text-md bg-[#00d4aa] text-[#0e0e10] font-semibold rounded-lg hover:bg-[#00b894] transition-colors duration-200">
                    Sign in to Add to Library
                </button>
            ) : libraryEntry == null ? (
                <button onClick={() => setIsLibraryModalOpen(true)} className="px-4 py-1 text-md bg-[#00d4aa] text-[#0e0e10] font-semibold rounded-lg hover:bg-[#00b894] transition-colors duration-200">
                    Add to Library
                </button>
            ) : <div className="group">
                    <button onClick={() => setIsLibraryModalOpen(true)} className=" w-32 px-4 py-1 text-md bg-[#2a2a35] text-[#f0f0f0] font-semibold rounded-lg transition-all duration-200 group-hover:bg-[#e05555]">
                        <span className="group-hover:hidden">
                            {libraryEntry.status.charAt(0).toUpperCase() + libraryEntry.status.slice(1)}
                        </span>
                        <span className="hidden group-hover:inline">
                            Manage
                        </span>
                    </button>
                </div>
            }
            {isAuthModalOpen && (
                <AuthModal isOpen={true} defaultTab={"signin"} onClose={() => setIsAuthModalOpen(false)}></AuthModal>
            )}
            {isLibraryModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm w-full h-full flex flex-col items-center justify-center z-50">
                    <div className="bg-[#1a1a1f] border border-[#2a2a35] rounded-2xl w-full max-w-md p-8 relative flex flex-col">
                        <button onClick={() => setIsLibraryModalOpen(false)} className="mb-4 self-end text-[#8b8b9a] border border-[#5a5a6e] bg-[#2a2a35] rounded-4xl px-2 py-1">X</button>
                        <h2 className="font-semibold text-3xl mb-6 self-center">
                            {libraryEntry ? "Manage Game" : "Add to Library"}
                        </h2>
                        <div className="grid grid-cols-2 gap-4 items-center">
                        {[
                        { status: 'backlog', icon: '📚', label: 'Backlog', description: "I'll get to it..." },
                        { status: 'playing', icon: '▶', label: 'Playing', description: 'Currently playing it' },
                        { status: 'completed', icon: '✓', label: 'Completed', description: 'Done and satisfied' },
                        { status: 'abandoned', icon: '✕', label: 'Abandoned', description: "Couldn't get into it" },
                        ].map(({ status, icon, label, description }) => (
                        <button
                            key={status}
                            onClick={() => addToLibrary(status)}
                            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl
                            border border-[#2a2a35] hover:border-[#00d4aa] hover:bg-[#00d4aa]/5
                            transition-all duration-200 group text-left"
                        >
                            <span className="text-lg w-6 text-center shrink-0">{icon}</span>
                            <div className="flex flex-col">
                            <span className="text-sm font-semibold text-[#f0f0f0] 
                                group-hover:text-[#00d4aa] transition-colors duration-200
                                font-(family-name:--font-display)">
                                {label}
                            </span>
                            <span className="text-xs text-[#8b8b9a]">{description}</span>
                            </div>
                        </button>
                        ))}
                        </div>
                        {libraryEntry && 
                            <button onClick={() => removeFromLibrary()} className="w-full rounded-xl bg-[#e05555] text-[#f0f0f0] border border-[#d61515] my-6 py-4">
                                Remove From Library
                            </button>
                        }
                    </div>
                </div>
            )}
        </div>
    )
}