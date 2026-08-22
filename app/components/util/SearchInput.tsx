"use client"

export default function SearchInput( { searchQuery, onChange, onSubmit} : { 
    searchQuery: string, 
    onChange: (s: string) => void,
    onSubmit: () => void
}) {
    return (
        <div className="flex gap-2 items-center w-full h-full">
            <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-(--color-surface) text-(--color-muted) placeholder:text-(--color-muted) self-center justify-self-center border border-(--color-border) focus:outline-none rounded-[3px] px-2 py-1"
            />
            <button 
                onClick={() => onSubmit()}
                className="bg-(--color-accent) text-(--color-bg) hover:bg-(--color-accent-hover) self-center justify-self-center py-2 px-4 rounded-[3px] font-semibold transition-colors duration-200"
            >
                Search
            </button>
        </div>
    )
}