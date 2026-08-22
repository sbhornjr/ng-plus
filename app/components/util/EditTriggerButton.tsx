'use client'

export default function EditTriggerButton({ onClick, label = "Edit" }: { onClick: () => void, label?: string }) {
    return (
        <button
            onClick={onClick}
            className="px-2 py-0.5 rounded-[3px] text-xs font-semibold
                bg-(--color-surface-light) text-(--color-muted) hover:bg-(--color-accent)/10 hover:text-(--color-accent)
                border border-(--color-border) hover:border-(--color-accent)
                transition-all duration-200"
        >
            {label}
        </button>
    )
}
