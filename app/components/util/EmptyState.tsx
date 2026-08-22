import Link from "next/link"
import { ReactNode } from "react"

type EmptyStateProps = {
    icon?: string
    title: string
    description?: ReactNode
    actionHref?: string
    actionLabel?: string
}

export default function EmptyState({ icon = "🎮", title, description, actionHref, actionLabel }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-4xl mb-4">{icon}</p>
            <h2 className="text-xl font-semibold mb-2 font-(family-name:--font-display)">
                {title}
            </h2>
            {description && (
                <p className="text-(--color-muted) text-sm mb-6">
                    {description}
                </p>
            )}
            {actionHref && actionLabel && (
                <Link href={actionHref} className="px-5 py-2.5 rounded-[3px] text-sm font-semibold
                    bg-(--color-accent) text-(--color-bg) hover:bg-(--color-accent-hover)
                    transition-colors duration-200
                    font-(family-name:--font-display)"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    )
}
