"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-browser"
import Image from "next/image"
import GameCard from "./GameCard"
import { useRouter } from "next/navigation"

type Game = {
    id: string
    name: string
    slug: string
    cover_image_url: string | null
    metacritic_score: number | null
    released: string | null
}

export default function FavoriteGamePicker({ userId, currentGames } : { userId: number, currentGames: Game[]}) {
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState<Game[]>([])
    const [isGamePickerModalOpen, setIsGamePickerModalOpen] = useState(false)
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
        }
        if (selectedGames.length < 5) {
            setSelectedGames([game, ...selectedGames])
        }
    }
    
    async function submitGames() {
        const supabase = createClient()
        const { data } = await supabase
            .from('users')
            .update({ favorite_game_ids: selectedGames.map(g => g.id) })
            .eq("id", userId)
            .select("favorite_game_ids")
            .single()
        setIsGamePickerModalOpen(false)
        router.refresh()
    }

    const gameIds = selectedGames.map(g => g.id)

    return (
        <div className="self-center">
            <button className="px-2 py-0.5 rounded-md text-xs font-semibold
                bg-[#2a2a35] text-[#8b8b9a] hover:bg-[#00d4aa]/10 hover:text-[#00d4aa]
                border border-[#2a2a35] hover:border-[#00d4aa]
                transition-all duration-200"
                onClick={() => setIsGamePickerModalOpen(true)}>
                Edit
            </button>
            {isGamePickerModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm w-full h-full flex flex-col items-center justify-center z-50">
                    <div className="bg-[#1a1a1f] border border-[#2a2a35] rounded-2xl max-w-xl max-h-[75vh] p-8 relative flex flex-col overflow-scroll">
                        <button onClick={() => setIsGamePickerModalOpen(false)} className="mb-4 self-end text-[#8b8b9a] border border-[#5a5a6e] bg-[#2a2a35] rounded-4xl px-2 py-1">X</button>
                        <h2 className="font-semibold text-3xl mb-2 self-center">
                            Choose Favorite Games
                        </h2>
                        <p className="text-center text-md mb-4">You can only select 5 favorite games. Choose wisely.</p>
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
    )
}