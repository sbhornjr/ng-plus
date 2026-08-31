'use client'

import { useState } from 'react'
import FeedItem from './FeedItem'
import type { FeedItem as FeedItemType } from '@/types'

const PAGE = 12

export default function FeedList({ items }: { items: FeedItemType[] }) {
    const [shown, setShown] = useState(PAGE)

    return (
        <>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {items.slice(0, shown).map((item, i) => (
                    <FeedItem
                        key={`${item.activity_type}-${item.actor_id}-${item.game_id ?? item.list_id ?? 'x'}-${item.created_at}-${i}`}
                        item={item}
                    />
                ))}
            </section>

            {shown < items.length && (
                <div className="flex justify-center mt-8">
                    <button
                        type="button"
                        onClick={() => setShown((s) => s + PAGE)}
                        className="px-5 py-2 rounded-[3px] text-sm font-semibold border border-(--color-border)
                            text-(--color-muted) hover:text-(--color-accent) hover:border-(--color-accent)
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)
                            transition-colors duration-200"
                    >
                        Show more ({items.length - shown} left)
                    </button>
                </div>
            )}
        </>
    )
}
