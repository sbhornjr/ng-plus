'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react';

export default function ScreenshotCarousel({ screenshots }: { screenshots: string[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    return (
        <div className="flex h-auto gap-4 py-4 items-center">
            <button onClick={() => setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : screenshots.length - 1)} 
                className="shrink-0 px-2 w-8 h-8 rounded-lg overflow-hidden border border-[#00d4aa] flex items-center justify-center bg-[#1a1a1f] text-[#00d4aa] text-lg font-semibold">
                ←
            </button>
            <div className="shrink-0 rounded-xl overflow-hidden border border-[#2a2a35] shadow-2xl aspect-video relative w-9/10 h-full">
                <Link href={screenshots[currentIndex] || '/placeholder.png'} target="_blank" rel="noopener noreferrer">
                    <Image
                        src={screenshots[currentIndex] || '/placeholder.png'}
                        alt="Screenshot"
                        fill
                        className="h-auto w-auto object-fill transition-all duration-100 hover:scale-105"
                    />
                </Link>
            </div>
            <button onClick={() => setCurrentIndex(currentIndex < screenshots.length - 1 ? currentIndex + 1 : 0)} 
                className="shrink-0 px-2 w-8 h-8 rounded-lg overflow-hidden border border-[#00d4aa] flex items-center justify-center bg-[#1a1a1f] text-[#00d4aa] text-lg font-semibold">
                →
            </button>
        </div>
    )
}