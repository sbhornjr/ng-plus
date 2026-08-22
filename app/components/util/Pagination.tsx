"use client"

import Link from 'next/link';

export default function Pagination( { page, maxPages, params, url } : { page: number, maxPages: number, params: Record<string, string>, url: string }) {

    function getPageNumbers(current: number, total: number): (number | null)[] {
        if (total <= 7) {
            // Show all pages if there aren't many
            return Array.from({ length: total }, (_, i) => i + 1)
        }

        const pages: (number | null)[] = []
        
        // Always include first page
        pages.push(1)
        
        // Ellipsis after 1 if current is far from start
        if (current > 3) pages.push(null)
        
        // Pages around current
        for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
            pages.push(i)
        }
        
        // Ellipsis before last if current is far from end
        if (current < total - 2) pages.push(null)
        
        // Always include last page
        pages.push(total)
        
        return pages
    }

    function handlePageClicked(newPage: number) {
        const p = new URLSearchParams(params)
        p.set('page', String(newPage))
        return `/${url}?${p.toString()}`
    }

    return (
        <div className="flex flex-row gap-2 items-center justify-center text-md">
            {page > 1 
                ? <Link href={handlePageClicked(page - 1)}>←</Link>
                : <span className="text-(--color-border)">←</span>
            }
            {getPageNumbers(page, maxPages).map((n, i) =>
                n === null
                ? <span key={`ellipsis-${i}`} className="text-(--color-muted) px-2">...</span>
                : <Link
                    key={n}
                    href={handlePageClicked(n)}
                    className={`px-3 py-1 rounded-[3px] text-sm font-semibold transition-colors duration-200
                    ${n === page 
                        ? 'bg-(--color-accent) text-(--color-bg)' 
                        : 'text-(--color-muted) hover:text-(--color-text) hover:bg-(--color-surface-light)'}`}
                >
                    {n}
                </Link>
            )}
            {page < maxPages
                ? <Link href={handlePageClicked(page + 1)}>→</Link>
                : <span className="text-(--color-border)">→</span>
            }
        </div>
    )
}