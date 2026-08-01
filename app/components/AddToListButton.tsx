"use client"

import { createClient } from "@/lib/supabase-browser"
import { useState } from "react"
import { useUser } from "./UserContext"
import AuthModal from "@/app/components/AuthModal"
import CreateListFromGamePageButton from "./CreateListFromGamePageButton"

export default function AddToListButton({ gameId, lists, listIdsGameIsIn } : 
    { gameId : string, lists : { listId: string, listName: string, listCount: number }[], listIdsGameIsIn: Set<string> }) {
    const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [listIdsGameIsInState, setListIdsGameIsInState] = useState(new Set(listIdsGameIsIn))
    const { user } = useUser()

    async function handleListToggle(listId: string, alreadyInList: boolean) {
        const supabase = createClient()
        
        if (alreadyInList) {
            await supabase
            .from('list_games')
            .delete()
            .eq('list_id', listId)
            .eq('game_id', gameId)
        } else {
            const { data: maxPos } = await supabase
            .from('list_games')
            .select('position')
            .eq('list_id', listId)
            .order('position', { ascending: false })
            .limit(1)
            .single()

            await supabase
            .from('list_games')
            .insert({
                list_id: listId,
                game_id: gameId,
                position: (maxPos?.position ?? -1) + 1
            })
        }

        if (alreadyInList) {
            setListIdsGameIsInState(prev => { prev.delete(listId); return new Set(prev) })
        } else {
            setListIdsGameIsInState(prev => new Set(prev).add(listId))
        }
    }

    return (
        <div>
            {user == null ? (
                <button className="px-4 py-1 text-md text-[#00d4aa] border border-[#00d4aa] self-center justify-self-center
                    font-semibold rounded-lg hover:bg-[#00d4aa] hover:text-[#0e0e10] transition-colors duration-200"
                    onClick={() => setIsAuthModalOpen(true)}>
                    Sign in to Add to List
                </button>
            ) : (
                <button className="px-4 py-1 text-md text-[#00d4aa] border border-[#00d4aa] self-center justify-self-center
                    font-semibold rounded-lg hover:bg-[#00d4aa] hover:text-[#0e0e10] transition-colors duration-200"
                    onClick={() => setIsAddToListModalOpen(true)}>
                    Add to List
                </button>
            )}
            {isAuthModalOpen && (
                <AuthModal isOpen={true} defaultTab={"signin"} onClose={() => setIsAuthModalOpen(false)}></AuthModal>
            )}
            {isAddToListModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm w-full h-full flex items-center justify-center z-50 p-5">
                    <div className="bg-[#1a1a1f] border border-[#2a2a35] rounded-2xl w-full max-w-xl max-h-8/10 p-8 relative flex flex-col overflow-y-auto gap-4">
                        <button onClick={() => setIsAddToListModalOpen(false)} className="mb-4 self-end text-[#8b8b9a] border border-[#5a5a6e] bg-[#2a2a35] rounded-4xl px-2 py-1">X</button>
                        <h2 className="font-semibold text-3xl mb-2 self-center">
                            Add to List
                        </h2>
                        {lists.map(list => {
                            const alreadyInList = listIdsGameIsInState.has(list.listId)
                            return (
                                <button
                                    key={list.listId}
                                    onClick={() => handleListToggle(list.listId, alreadyInList)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg
                                        border transition-all duration-200 text-sm font-semibold
                                        ${alreadyInList
                                        ? 'border-[#00d4aa] text-[#00d4aa] bg-[#00d4aa]/5'
                                        : 'border-[#2a2a35] text-[#f0f0f0] hover:border-[#00d4aa] hover:bg-[#00d4aa]/5'}`}
                                >
                                    <span>{list.listName}</span>
                                    {alreadyInList && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.5"
                                        strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    )}
                                </button>
                            )
                        })}
                        {user && <CreateListFromGamePageButton gameId={gameId} userId={user.id} close={() => setIsAddToListModalOpen(false)}/>}
                    </div>
                </div>
            )}
        </div>
    )
}