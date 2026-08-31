'use client'

import Image from 'next/image'
import { useState } from 'react'

const arrowBtn = `absolute top-1/2 -translate-y-1/2 grid place-items-center size-9 rounded-full
    bg-(--color-bg)/75 text-(--typed) backdrop-blur-[2px] border border-(--rule)
    hover:bg-(--color-bg)/95 transition-colors duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)`

export default function ScreenshotCarousel({ screenshots }: { screenshots: string[] }) {
    const [index, setIndex] = useState(0)
    if (screenshots.length === 0) return null

    const go = (next: number) => setIndex((next + screenshots.length) % screenshots.length)

    return (
        <div>
            <figure className="mount">
                <span className="tape tl" aria-hidden="true" />
                <span className="tape br" aria-hidden="true" />
                <div className="relative aspect-video w-full overflow-hidden bg-(--color-surface)">
                    <a href={screenshots[index]} target="_blank" rel="noopener noreferrer" aria-label="Open exhibit full size" className="absolute inset-0 block">
                        <Image
                            key={screenshots[index]}
                            src={screenshots[index]}
                            alt={`Exhibit ${index + 1} of ${screenshots.length}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 768px"
                            className="object-cover"
                        />
                    </a>

                    {screenshots.length > 1 && (
                        <>
                            <button type="button" onClick={() => go(index - 1)} aria-label="Previous exhibit" className={`left-2 ${arrowBtn}`}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <button type="button" onClick={() => go(index + 1)} aria-label="Next exhibit" className={`right-2 ${arrowBtn}`}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            </figure>

            <div className="flex items-center justify-between mt-2">
                <figcaption className="field" style={{ margin: 0 }}>
                    Plate {index + 1} of {screenshots.length}
                </figcaption>
                {screenshots.length > 1 && screenshots.length <= 12 && (
                    <div className="flex gap-1.5">
                        {screenshots.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setIndex(i)}
                                aria-label={`Go to exhibit ${i + 1}`}
                                aria-current={i === index}
                                className={`h-1.5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)
                                    ${i === index ? 'w-5 bg-(--color-accent)' : 'w-1.5 bg-(--rule) hover:bg-(--carbon)'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
