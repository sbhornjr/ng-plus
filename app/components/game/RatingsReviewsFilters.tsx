"use client"

import FilterSelect from "../util/FilterSelect"
import { useRouter } from "next/navigation"

export default function RatingsReviewsFilters({ filter, pageSize, sort, order, page, username } : 
    { filter: "all" | "ratings" | "reviews", pageSize: string, sort: "date" | "rating", order: "asc" | "desc", page: string, username: string }) {

    const router = useRouter()

    function buildParams(overrides: Record<string, string> = {}) {
        const values = {
            filter: filter,
            pageSize: pageSize,
            sort: sort,
            order: order,
            page: page,
            ...overrides
        }
        const params = new URLSearchParams()
        Object.entries(values).forEach(([key, val]) => {
            if (val) params.set(key, val)
        })
        return params
    }

    function handlePageSize(size: string) {
        router.push(`/user/${username}/ratings_reviews?${buildParams({ pageSize: size, page: "1"})}`)
    }

    function handleSort(sortChoice: string) {
        router.push(`/user/${username}/ratings_reviews?${buildParams({ sort: sortChoice }).toString()}`)
    }

    function handleFilter(filterChoice: string) {
        router.push(`/user/${username}/ratings_reviews?${buildParams({ filter: filterChoice }).toString()}`)
    }

    function handleSortToggle() {
        const newDirection = order === "desc" ? "asc" : "desc"
        router.push(`/user/${username}/ratings_reviews?${buildParams({ order: newDirection }).toString()}`)
    }

    return (
        <div className="flex gap-2 mb-4 items-center w-full">
            <FilterSelect value={pageSize} onChange={e => handlePageSize(e.target.value)}>
                <option value="10">Results: 10</option>
                <option value="25">Results: 25</option>
                <option value="50">Results: 50</option>
                <option value="100">Results: 100</option>
            </FilterSelect>
            <FilterSelect value={filter} onChange={e => handleFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="reviews">Reviews</option>
                <option value="ratings">Ratings</option>
            </FilterSelect>
            <FilterSelect value={sort} onChange={e => handleSort(e.target.value)}>
                <option value="date">Date</option>
                <option value="rating">Rating</option>
            </FilterSelect>
            <button
                onClick={() => handleSortToggle()}
                className="px-3 py-1.5 rounded-[3px] border border-(--color-border) bg-(--color-surface)
                    text-(--color-muted) hover:border-(--color-accent) hover:text-(--color-accent)
                    transition-all duration-200"
                >
                {order === 'desc' ? '↓' : '↑'}
            </button>
        </div>
    )
}