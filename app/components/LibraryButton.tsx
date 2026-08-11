'use client'

import { useState, useEffect } from "react"
import AuthModal from "@/app/components/AuthModal"
import { useUser } from "@/app/components/UserContext"
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from "next/navigation"
import FilterSelect from "./FilterSelect"

export default function LibraryButton({ game_id }: { game_id: number }) {
    const { user } = useUser()
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false)
    const [libraryEntry, setLibraryEntry] = useState<{ id: string, status: string } | null>(null)
    const [currentStatus, setStatus] = useState<string>("")
    const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false)
    const [is100, setIs100] = useState(false)
    const [hours, setHours] = useState<number | null>(null)
    const [playedCount, setPlayedCount] = useState(1)
    const router = useRouter()

    useEffect(() => {

        async function checkEntry() {
            if (!user) return

            const supabase = createClient()
            const { data } = await supabase
                .from('library_entries')
                .select('id, status, completed_all_achievements, hours_played, play_count')
                .eq('user_id', user.id)
                .eq('game_id', game_id)
                .single()

            setLibraryEntry(data ?? null)
            setStatus(data?.status ?? "")
            setIs100(data?.completed_all_achievements ?? false)
            setHours(data?.hours_played ?? 0)
            setPlayedCount(data?.play_count ?? 1)
        }

        if (user) checkEntry()
    }, [user, game_id])

    async function addToLibrary() {
        if (!user) return

        const supabase = createClient()

        if (libraryEntry) {
            const { data } = await supabase
                .from('library_entries')
                .update({ status: currentStatus, completed_all_achievements: is100, hours_played: hours, play_count: playedCount })
                .eq("user_id", user.id)
                .eq("game_id", game_id)
                .select("id, status, completed_all_achievements, hours_played, play_count")
                .single()
            setLibraryEntry(data)
            setStatus(data?.status ?? "")
            setIs100(data?.completed_all_achievements ?? false)
            setHours(data?.hours_played ?? 0)
            setPlayedCount(data?.play_count ?? 1)
        }
        else {
            const { data } = await supabase
                .from('library_entries')
                .insert({ user_id: user.id, game_id: game_id, status: currentStatus, completed_all_achievements: is100, hours_played: hours, play_count: playedCount })
                .select("id, status, completed_all_achievements, hours_played, play_count")
                .single()
            setLibraryEntry(data)
            setStatus(data?.status ?? "")
            setIs100(data?.completed_all_achievements ?? false)
            setHours(data?.hours_played ?? 0)
            setPlayedCount(data?.play_count ?? 1)
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
                            onClick={() => setStatus(status)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl
                            border border-[#2a2a35] hover:border-[#00d4aa] hover:bg-[#00d4aa]/5
                            transition-all duration-200 group text-left ${status === currentStatus && "border-[#00d4aa] bg-[#00d4aa]/5"}`}
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
                        <button onClick={() => addToLibrary()} className="w-full rounded-xl bg-[#00d4aa] text-[#0e0e10] border mt-3 my-2 py-4">
                            {libraryEntry ? "Update Library Entry" : "Add to Library"}
                        </button>
                        {libraryEntry && 
                            <button onClick={() => removeFromLibrary()} className="w-full rounded-xl bg-[#e05555] text-[#f0f0f0] border border-[#d61515] my-2 py-4">
                                Remove From Library
                            </button>
                        }
                        <button
                            onClick={() => setAdvancedOptionsOpen(!advancedOptionsOpen)}
                            className="self-center justify-self-center bg-[#1a1a24] text-[#8b8b9a] placeholder:text-[#5a5a6e] border border-[#2a2a35] focus:outline-none rounded-lg my-2 px-4 py-2 whitespace-nowrap"
                        >
                            {advancedOptionsOpen ? '- Advanced Options' : '+ Advanced Options'}
                        </button>
                        {advancedOptionsOpen && (
                            <div className="flex flex-wrap flex-row gap-4 mb-4 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIs100(!is100)}
                                    className="flex items-center gap-3 text-left"
                                >
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center
                                        transition-all duration-200 shrink-0
                                        ${is100 
                                        ? 'bg-[#00d4aa] border-[#00d4aa]' 
                                        : 'bg-transparent border-[#2a2a35] hover:border-[#00d4aa]'}`}
                                    >
                                        {is100 && (
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                <path d="M1 4L3.5 6.5L9 1" stroke="#0e0e10" strokeWidth="2" 
                                                strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-sm font-semibold text-[#f0f0f0]">100% Achievements Completed</span>
                                </button>
                                <div className="flex gap-6 items-center justify-around w-full">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-[#8b8b9a] uppercase tracking-wider">
                                            Hours Played
                                        </label>
                                        <div className="flex items-center gap-2 bg-[#1a1a24] border border-[#2a2a35] 
                                            rounded-lg px-3 py-2 focus-within:border-[#00d4aa] transition-colors duration-200 w-32">
                                            <input
                                                type="number"
                                                min="0"
                                                max="99999"
                                                step="0.5"
                                                value={hours ?? ''}
                                                onChange={e => setHours(e.target.value === '' ? null : Number(e.target.value))}
                                                placeholder="0"
                                                className="bg-transparent text-[#f0f0f0] text-sm w-full outline-none
                                                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none 
                                                    [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <span className="text-xs text-[#8b8b9a] shrink-0">hrs</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-[#8b8b9a] uppercase tracking-wider">
                                            Times Played
                                        </label>
                                        <div className="flex items-center border border-[#2a2a35] rounded-lg 
                                            overflow-hidden focus-within:border-[#00d4aa] transition-colors duration-200">
                                            <button
                                                type="button"
                                                onClick={() => setPlayedCount(Math.max(1, (playedCount ?? 1) - 1))}
                                                className="px-3 py-2 bg-[#2a2a35] text-[#8b8b9a] hover:text-[#f0f0f0] 
                                                    hover:bg-[#3a3a45] transition-colors duration-200 text-sm font-bold"
                                            >
                                                −
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                max="99"
                                                value={playedCount ?? 1}
                                                onChange={e => setPlayedCount(Math.max(1, Number(e.target.value)))}
                                                className="bg-[#1a1a24] text-[#f0f0f0] text-sm text-center w-12 py-2 outline-none
                                                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none 
                                                    [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setPlayedCount((playedCount ?? 1) + 1)}
                                                className="px-3 py-2 bg-[#2a2a35] text-[#8b8b9a] hover:text-[#f0f0f0]
                                                    hover:bg-[#3a3a45] transition-colors duration-200 text-sm font-bold"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}