"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation'
import FilterSelect from "@/app/components/util/FilterSelect"
import SearchInput from '../util/SearchInput';
import SearchableDropdown from '../util/SearchableDropdown';

export default function LibraryFilters({ current, genres, platforms, developers, publishers, esrb_ratings }: 
    { current: {query: string, genre: string, platform: string, developer: string, publisher: string, esrb: string, sort: string, order: string, status: string},
        genres: { id: number, name: string, slug: string }[], platforms: { id: number, name: string, slug: string }[], 
        developers: { id: number, name: string, slug: string }[], publishers: { id: number, name: string, slug: string }[], 
        esrb_ratings: string[]}) {

    const [searchQuery, setSearchQuery] = useState(current.query)
    const [selectedGenre, setSelectedGenre] = useState(current.genre)
    const [selectedPlatform, setSelectedPlatform] = useState(current.platform)
    const [selectedDeveloper, setSelectedDeveloper] = useState(current.developer)
    const [selectedPublisher, setSelectedPublisher] = useState(current.publisher)
    const [selectedEsrb, setSelectedEsrb] = useState(current.esrb)
    const [selectedSort, setSelectedSort] = useState(current.sort)
    const [selectedOrder, setSelectedOrder] = useState(current.order)
    const [selectedStatus, setSelectedStatus] = useState(current.status)
    const [filtersOpen, setFiltersOpen] = useState(false)
    const router = useRouter()

    function buildParams(overrides: Record<string, string> = {}) {
        const values = {
            q: searchQuery,
            genre: selectedGenre,
            platform: selectedPlatform,
            developer: selectedDeveloper,
            publisher: selectedPublisher,
            esrb: selectedEsrb,
            sort: selectedSort,
            order: selectedOrder,
            status: selectedStatus,
            ...overrides
        }
        const params = new URLSearchParams()
        Object.entries(values).forEach(([key, val]) => {
            if (val) params.set(key, val)
        })
        return params
    }

    function handleStatus(status: string) {
        setSelectedStatus(status)
        router.push(`/library?${buildParams({ status: status }).toString()}`)
    }

    function handleSort(sortChoice: string) {
        setSelectedSort(sortChoice)
        router.push(`/library?${buildParams({ sort: sortChoice }).toString()}`)
    }

    function handleSortToggle() {
        const newDirection = selectedOrder === "desc" ? "asc" : "desc"
        setSelectedOrder(newDirection)
        router.push(`/library?${buildParams({ order: newDirection }).toString()}`)
    }

    function handleSubmit() {
    router.push(`/library?${buildParams().toString()}`)
    }

    return (
        <div>
            <div className="flex gap-4 items-center justify-center w-full mb-6">
                <button
                    onClick={() => handleStatus("")}
                    className={`text-xl px-2 py-1 rounded-[3px] transition-all duration-200 ${selectedStatus == "" ? "border border-(--color-accent) text-(--color-accent)" : "hover:border hover:border-(--color-accent) hover:text-(--color-accent)"}`}
                >
                    All
                </button>
                <button
                    onClick={() => handleStatus("completed")}
                    className={`text-xl px-2 py-1 rounded-[3px] transition-all duration-200 ${selectedStatus == "completed" ? "border border-(--color-accent) text-(--color-accent)" : "hover:border hover:border-(--color-accent) hover:text-(--color-accent)"}`}
                >
                    Completed
                </button>
                <button
                    onClick={() => handleStatus("playing")}
                    className={`text-xl px-2 py-1 rounded-[3px] transition-all duration-200 ${selectedStatus == "playing" ? "border border-(--color-accent) text-(--color-accent)" : "hover:border hover:border-(--color-accent) hover:text-(--color-accent)"}`}
                >
                    Playing
                </button>
                <button
                    onClick={() => handleStatus("backlog")}
                    className={`text-xl px-2 py-1 rounded-[3px] transition-all duration-200 ${selectedStatus == "backlog" ? "border border-(--color-accent) text-(--color-accent)" : "hover:border hover:border-(--color-accent) hover:text-(--color-accent)"}`}
                >
                    Backlog
                </button>
                <button
                    onClick={() => handleStatus("abandoned")}
                    className={`text-xl px-2 py-1 rounded-[3px] transition-all duration-200 ${selectedStatus == "abandoned" ? "border border-(--color-accent) text-(--color-accent)" : "hover:border hover:border-(--color-accent) hover:text-(--color-accent)"}`}
                >
                    Abandoned
                </button>
            </div>
            <div className="flex gap-2 mb-4 items-center w-full">
                <FilterSelect value={selectedSort} onChange={e => handleSort(e.target.value)}>
                    <option value="date_added">Date Added</option>
                    <option value="name">Name</option>
                    <option value="metacritic_score">Metacritic Rating</option>
                    <option value="ngplus_rating">NG+ Rating</option>
                    <option value="your_rating">Your Rating</option>
                </FilterSelect>
                <button
                    onClick={() => handleSortToggle()}
                    className="px-3 py-1.5 rounded-[3px] border border-(--color-border) bg-(--color-surface)
                        text-(--color-muted) hover:border-(--color-accent) hover:text-(--color-accent)
                        transition-all duration-200"
                    >
                    {selectedOrder === 'desc' ? '↓' : '↑'}
                </button>
                <SearchInput searchQuery={searchQuery} onChange={setSearchQuery} onSubmit={handleSubmit} />
                <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="self-center justify-self-center bg-(--color-surface) text-(--color-muted) placeholder:text-(--color-muted) border border-(--color-border) focus:outline-none rounded-[3px] px-4 py-2 whitespace-nowrap"
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
                    <SearchableDropdown table={"developers"} value={selectedDeveloper} onChange={slug => setSelectedDeveloper(slug)} placeholder={"All Developers"} limit={developers.map(d => String(d.id))} />
                    <SearchableDropdown table={"publishers"} value={selectedPublisher} onChange={slug => setSelectedPublisher(slug)} placeholder={"All Publishers"} limit={publishers.map(p => String(p.id))}/>
                    <FilterSelect value={selectedEsrb} onChange={e => setSelectedEsrb(e.target.value)}>
                        <option value="">All ESRB Ratings</option>
                        {esrb_ratings.map(r => <option key={r} value={r}>{r}</option>)}
                    </FilterSelect>
                </div>
            )}
        </div>
    )
}