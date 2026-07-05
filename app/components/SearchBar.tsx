'use client'

import { useRouter } from 'next/navigation'
import { useState, ChangeEvent, SubmitEvent } from 'react'

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    router.push(`/games?q=${encodeURIComponent(trimmed)}`)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search games..."
          className="w-full px-6 py-4 pr-36 pl-5 rounded-xl text-base
            bg-[#1a1a1f] border border-[#2a2a35] text-[#f0f0f0]
            placeholder-[#8b8b9a] outline-none
            focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa]
            transition-all duration-200"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2
            px-6 py-2.5 rounded-lg text-sm font-semibold
            bg-[#00d4aa] text-[#0e0e10]
            hover:bg-[#00b894] transition-colors duration-200
            font-[family-name:var(--font-display)]"
        >
          Search
        </button>
      </div>
    </form>
  )
}