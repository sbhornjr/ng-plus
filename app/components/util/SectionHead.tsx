import { ReactNode } from "react"

/** A menu-cursor into a tracked label, then a rule. The recurring section
 *  header across the app. */
export default function SectionHead({ children, count, className = "" }: {
    children: ReactNode
    count?: ReactNode
    className?: string
}) {
    return (
        <div className={`flex items-center gap-2.5 mt-10 mb-5 font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-(--color-muted) ${className}`}>
            <span className="text-(--color-accent)" aria-hidden="true">&#9656;</span>
            <b className="text-(--color-text) font-semibold whitespace-nowrap">{children}</b>
            {count != null && <span className="whitespace-nowrap">&middot; {count}</span>}
            <span className="flex-1 h-px bg-(--color-border)" />
        </div>
    )
}
