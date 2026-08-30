'use client'

export default function EditTriggerButton({ onClick, label = "Edit" }: { onClick: () => void, label?: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="inline-flex items-center gap-1 self-center text-xs font-medium
                text-(--color-muted) hover:text-(--color-accent)
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) rounded-[3px]
                transition-colors duration-200"
        >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M11.5 2.5l2 2L6 12l-3 1 1-3 7.5-7.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            {label}
        </button>
    )
}
