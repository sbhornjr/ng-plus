import Link from "next/link"
import { ReactNode } from "react"

type EmptyStateProps = {
    icon?: ReactNode
    title: string
    description?: ReactNode
    actionHref?: string
    actionLabel?: string
    /** Tighter spacing + smaller icon for use inside a page section rather than a full page. */
    dense?: boolean
}

/* Default mark: a stacked-cards / catalogue glyph, on-concept for the "ledger"
   direction and an SVG rather than an emoji (emoji render inconsistently across
   platforms and read as placeholder art). */
function DefaultIcon({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
            className="text-(--color-muted)">
            <rect x="3" y="7" width="18" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 7V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 12h8M8 15.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    )
}

export default function EmptyState({ icon, title, description, actionHref, actionLabel, dense = false }: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center text-center ${dense ? "py-10" : "py-24"}`}>
            <span className="mb-4">
                {icon ?? <DefaultIcon size={dense ? 28 : 40} />}
            </span>
            <h2 className={`font-semibold mb-2 font-(family-name:--font-display) ${dense ? "text-lg" : "text-xl"}`}>
                {title}
            </h2>
            {description && (
                <p className="text-(--color-muted) text-sm mb-6 max-w-sm">
                    {description}
                </p>
            )}
            {actionHref && actionLabel && (
                <Link href={actionHref} className="px-5 py-2.5 rounded-[3px] text-sm font-semibold
                    bg-(--color-accent) text-(--color-bg) hover:bg-(--color-accent-hover)
                    transition-colors duration-200
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)
                    font-(family-name:--font-display)"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    )
}
