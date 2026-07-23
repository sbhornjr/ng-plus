'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation'
import FilterSelect from "@/app/components/FilterSelect"
import SearchInput from './SearchInput';

export default function GameFilters({ current, genres, platforms, developers, publishers, esrb_ratings }: 
    { current: {query: string, genre: string, platform: string, developer: string, publisher: string, esrb: string, pageSize: string},
        genres: { id: number, name: string, slug: string }[], platforms: { id: number, name: string, slug: string }[], 
        developers: { id: number, name: string, slug: string }[], publishers: { id: number, name: string, slug: string }[], 
        esrb_ratings: string[]}) {

    const [searchQuery, setSearchQuery] = useState(current.query)
    const [selectedGenre, setSelectedGenre] = useState(current.genre)
    const [selectedPlatform, setSelectedPlatform] = useState(current.platform)
    const [selectedDeveloper, setSelectedDeveloper] = useState(current.developer)
    const [selectedPublisher, setSelectedPublisher] = useState(current.publisher)
    const [selectedEsrb, setSelectedEsrb] = useState(current.esrb)
    const [selectedPageSize, setSelectedPageSize] = useState(current.pageSize)
    const [filtersOpen, setFiltersOpen] = useState(false)
    const router = useRouter()

    function handleSubmit() {
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery)
        if (selectedGenre) params.set("genre", selectedGenre)
        if (selectedPlatform) params.set("platform", selectedPlatform)
        if (selectedDeveloper) params.set("developer", selectedDeveloper)
        if (selectedPublisher) params.set("publisher", selectedPublisher)
        if (selectedEsrb) params.set("esrb", selectedEsrb)
        if (selectedPageSize) params.set("pageSize", selectedPageSize)
        
        router.push(`/games?${params.toString()}`)
    }

    function handlePageSize(size: string) {
        setSelectedPageSize(size)
        const params = new URLSearchParams()
        if (searchQuery) params.set("q", searchQuery)
        if (selectedGenre) params.set("genre", selectedGenre)
        if (selectedPlatform) params.set("platform", selectedPlatform)
        if (selectedDeveloper) params.set("developer", selectedDeveloper)
        if (selectedPublisher) params.set("publisher", selectedPublisher)
        if (selectedEsrb) params.set("esrb", selectedEsrb)
        params.set("pageSize", size)
        params.set("page", "1")
        router.push(`/games?${params.toString()}`)
    }

    return (
        <div>
            <div className="flex gap-2 mb-4 items-center w-full">
                <FilterSelect value={selectedPageSize} onChange={e => handlePageSize(e.target.value)}>
                    <option value="10">Results: 10</option>
                    <option value="25">Results: 25</option>
                    <option value="50">Results: 50</option>
                    <option value="100">Results: 100</option>
                </FilterSelect>
                <SearchInput searchQuery={searchQuery} onChange={setSearchQuery} onSubmit={handleSubmit} />
                <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="self-center justify-self-center bg-[#1a1a24] text-[#8b8b9a] placeholder:text-[#5a5a6e] border border-[#2a2a35] focus:outline-none rounded-lg px-4 py-2 whitespace-nowrap"
                >
                    {filtersOpen ? '- Filters' : '+ Filters'}
                </button>
            </div>
            {filtersOpen && (
            <div className="flex flex-wrap flex-row gap-4 mb-4">
                <FilterSelect value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)}>
                    <option value="">All Genres</option>
                    {genres.map(g => <option key={g.id} value={g.slug}>{g.name}</option>)}
                </FilterSelect>
                <FilterSelect value={selectedPlatform} onChange={e => setSelectedPlatform(e.target.value)}>
                    <option value="">All Platforms</option>
                    {platforms.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
                </FilterSelect>
                <FilterSelect value={selectedDeveloper} onChange={e => setSelectedDeveloper(e.target.value)}>
                    <option value="">All Developers</option>
                    {developers.map(d => <option key={d.id} value={d.slug}>{d.name}</option>)}
                </FilterSelect>
                <FilterSelect value={selectedPublisher} onChange={e => setSelectedPublisher(e.target.value)}>
                    <option value="">All Publishers</option>
                    {publishers.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
                </FilterSelect>
                <FilterSelect value={selectedEsrb} onChange={e => setSelectedEsrb(e.target.value)}>
                    <option value="">All ESRB Ratings</option>
                    {esrb_ratings.map(r => <option key={r} value={r}>{r}</option>)}
                </FilterSelect>
            </div>
            )}
        </div>
    )
}
