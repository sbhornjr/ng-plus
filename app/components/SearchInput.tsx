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
                className="w-full bg-[#1a1a24] text-[#8b8b9a] placeholder:text-[#5a5a6e] self-center justify-self-center border border-[#2a2a35] focus:outline-none rounded-lg px-2 py-1"
            />
            <button 
                onClick={() => onSubmit()}
                className="bg-[#00d4aa] text-[#0e0e10] hover:bg-[#00b894] self-center justify-self-center py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
            >
                Search
            </button>
        </div>
    )
}