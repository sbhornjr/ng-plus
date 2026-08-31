import { ReactNode } from "react"

/** A raised console surface with a faint top light. Shared card shell. */
export const panelClass =
    "bg-(--color-surface) border border-(--color-border) rounded-md shadow-[inset_0_1px_0_rgba(239,232,215,0.05)]"

export default function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
    return <div className={`${panelClass} ${className}`}>{children}</div>
}
