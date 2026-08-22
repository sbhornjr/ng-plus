import Link from "next/link"
import Image from "next/image"

const ROTATIONS = ['-9deg', '6deg', '-4deg', '8deg', '-7deg']

// imgSizes intentionally requests more than the rendered box (which is only
// ~80/112px wide) — these covers are rotated, and an exactly-matched fetch
// looks soft once it's resampled at an angle plus scaled up slightly on hover.
const SIZES = {
    md: { wrap: 'w-20 h-28', overlap: '-2.25rem', imgSizes: '140px' },
    lg: { wrap: 'w-28 h-40', overlap: '-1.5rem', imgSizes: '220px' },
}

export default function CoverFan({ covers, size = 'md' }: { covers: { src: string, href?: string, alt?: string, key: string }[], size?: 'md' | 'lg' }) {
    const { wrap, overlap, imgSizes } = SIZES[size]
    return (
        <div className="flex items-center">
            {covers.map((cover, i) => {
                const inner = (
                    <div
                        className={`relative ${wrap} rounded-[3px] overflow-hidden border-2 border-(--color-bg)
                            shadow-[0_4px_10px_rgba(0,0,0,0.4)] rotate-(--fan-rotate)
                            transition-transform duration-200 hover:rotate-0 hover:z-10 hover:scale-105`}
                        style={{ marginLeft: i === 0 ? 0 : overlap, ['--fan-rotate' as string]: ROTATIONS[i % ROTATIONS.length] }}
                    >
                        <Image src={cover.src} alt={cover.alt ?? ''} fill className="object-cover" sizes={imgSizes} />
                    </div>
                )
                return cover.href ? (
                    <Link key={cover.key} href={cover.href} className="relative block shrink-0" style={{ zIndex: covers.length - i }}>
                        {inner}
                    </Link>
                ) : (
                    <div key={cover.key} className="relative shrink-0" style={{ zIndex: covers.length - i }}>
                        {inner}
                    </div>
                )
            })}
        </div>
    )
}
