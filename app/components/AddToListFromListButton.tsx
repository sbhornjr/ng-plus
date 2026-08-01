"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase-browser"

type Game = {
    id: string
    name: string
    slug: string
    cover_image_url: string | null
    metacritic_score: number | null
    released: string | null
}

export default function AddToListFromListButton({ listId, currentGames } : { listId: string, currentGames: Game[]}) {
    const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [results, setResults] = useState<Game[]>([])
    const [selectedGames, setSelectedGames] = useState(currentGames)
    const router = useRouter()

    useEffect(() => {        
        const timer = setTimeout(async () => {
            if (!searchQuery.trim()) {
                setResults([])
                return
            }   

            const supabase = createClient()
            const { data } = await supabase
            .from('games')
            .select('id, name, slug, cover_image_url, metacritic_score, released')
            .ilike('name', `%${searchQuery}%`)
            .limit(20)
            setResults(data ?? [])
        }, 300) // wait 300ms after user stops typing

        return () => clearTimeout(timer) // cancel if user types again before 300ms
    }, [searchQuery])  

    function gameSelected(game: Game) {
        if (selectedGames.find(g => g.id === game.id)) {
            setSelectedGames(selectedGames.filter(g => g.id !== game.id))
        } else {
            setSelectedGames([game, ...selectedGames])
        }
    }

    async function submitGames() {
        const supabase = createClient()

        const toBeDeleted = currentGames.filter(g => !selectedGames.some(s => s.id === g.id))
        const toBeAdded = selectedGames.filter(g => !currentGames.some(c => c.id === g.id))

        const { data: maxPosData } = await supabase
            .from('list_games')
            .select('position')
            .eq('list_id', listId)
            .order('position', { ascending: false })
            .limit(1)
            .single()

        const startPosition = (maxPosData?.position ?? -1) + 1

        await Promise.all([
            toBeDeleted.length > 0
            ? supabase
                .from('list_games')
                .delete()
                .in('game_id', toBeDeleted.map(g => g.id))
                .eq('list_id', listId)
            : Promise.resolve(),
            toBeAdded.length > 0
            ? supabase
                .from('list_games')
                .insert(toBeAdded.map((game, index) => ({
                    list_id: listId,
                    game_id: game.id,
                    position: startPosition + index
                })))
            : Promise.resolve(),
        ])

        setIsAddToListModalOpen(false)
        router.refresh()
    }

    const gameIds = selectedGames.map(g => g.id)
    
    return (
        <div>
            <div className="flex justify-end mb-4">
                <button className="px-4 py-2 rounded-lg text-sm font-semibold ml-auto
                    bg-[#00d4aa] text-[#0e0e10] hover:bg-[#00b894] transition-colors duration-200"
                    onClick={() => setIsAddToListModalOpen(true)}>
                    + Add Games
                </button>
                {isAddToListModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm w-full h-full flex items-center justify-center z-50 p-5">
                        <div className="bg-[#1a1a1f] border border-[#2a2a35] rounded-2xl w-full max-w-xl max-h-8/10 p-8 relative flex flex-col overflow-y-auto gap-4">
                            <button onClick={() => setIsAddToListModalOpen(false)} className="mb-4 self-end text-[#8b8b9a] border border-[#5a5a6e] bg-[#2a2a35] rounded-4xl px-2 py-1">X</button>
                            <h2 className="font-semibold text-3xl mb-2 self-center">
                                Manage List
                            </h2>
                            <div className="flex flex-row gap-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search games..."
                                    className="w-full px-6 py-2 pr-36 pl-5 rounded-xl text-base
                                        bg-[#1a1a1f] border border-[#2a2a35] text-[#f0f0f0]
                                        placeholder-[#8b8b9a] outline-none
                                        focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa]
                                        transition-all duration-200"
                                />
                                <button
                                    onClick={() => submitGames()}
                                    className="bg-[#00d4aa] text-[#0e0e10] hover:bg-[#00b894] self-center justify-self-center py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
                                >
                                    Lock
                                </button>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                {results.map(game => 
                                    <button key={game.id} onClick={() => gameSelected(game)} className={`border border-[#8b8b9a] hover:border-[#00d4aa] hover:bg-[#00b894] rounded-lg ${gameIds.find(g => g === game.id) && "border-[#00d4aa] bg-[#00b894]"}`}>
                                        <div className="relative aspect-square w-full overflow-hidden">
                                            {game.cover_image_url ? (
                                                <Image
                                                    src={game.cover_image_url}
                                                    alt={game.name}
                                                    fill
                                                    className="object-cover transition-all duration-100 group-hover:scale-105"
                                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-[#2a2a35] flex items-center justify-center">
                                                    <span className="text-[#8b8b9a] text-sm">No image</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h3
                                                className="font-semibold text-md leading-tight text-[#f0f0f0]
                                                group-hover:text-[#00d4aa] transition-colors duration-200
                                                font-(family-name:--font-display) line-clamp-1"
                                            >
                                                {game.name}
                                            </h3>
                                            {game.released && (
                                                <p className="text-[#8b8b9a] text-sm mt-1">
                                                    {new Date(game.released).getFullYear()}
                                                </p>
                                            )}
                                            </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}