'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function ScreenshotCarousel({ screenshots }: { screenshots: string[] }) {
    const [index, setIndex] = useState(0)
    if (screenshots.length === 0) return null

    const go = (next: number) => setIndex((next + screenshots.length) % screenshots.length)

    return (
        <div>
            <div className="relative aspect-video w-full rounded-[3px] overflow-hidden border border-(--color-border) shadow-2xl bg-(--color-surface)">
                <a href={screenshots[index]} target="_blank" rel="noopener noreferrer" aria-label="Open screenshot full size">
                    <Image
                        key={screenshots[index]}
                        src={screenshots[index]}
                        alt={`Screenshot ${index + 1} of ${screenshots.length}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 768px"
                        className="object-cover"
                    />
                </a>

                {screenshots.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => go(index - 1)}
                            aria-label="Previous screenshot"
                            className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center size-9 rounded-full
                                bg-(--color-bg)/70 text-(--color-text) backdrop-blur-[2px] border border-(--color-border)
                                hover:bg-(--color-bg)/90 transition-colors duration-200
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => go(index + 1)}
                            aria-label="Next screenshot"
                            className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center size-9 rounded-full
                                bg-(--color-bg)/70 text-(--color-text) backdrop-blur-[2px] border border-(--color-border)
                                hover:bg-(--color-bg)/90 transition-colors duration-200
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-[2px] bg-(--color-bg)/75 backdrop-blur-[2px]
                            font-mono text-[11px] tabular-nums text-(--color-muted)">
                            {index + 1} / {screenshots.length}
                        </span>
                    </>
                )}
            </div>

            {screenshots.length > 1 && screenshots.length <= 12 && (
                <div className="flex justify-center gap-1.5 mt-3">
                    {screenshots.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setIndex(i)}
                            aria-label={`Go to screenshot ${i + 1}`}
                            aria-current={i === index}
                            className={`h-1.5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)
                                ${i === index ? 'w-5 bg-(--color-accent)' : 'w-1.5 bg-(--color-border) hover:bg-(--color-muted)'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
