"use client"

import { ChangeEvent } from 'react';

const selectClass = `bg-[#1a1a1f] text-[#f0f0f0] text-sm border border-[#2a2a35] rounded-lg
    px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-[#00d4aa] focus:border-[#00d4aa]
    transition-colors duration-200 cursor-pointer appearance-none`
const arrowClass = "absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b8b9a] text-xs pointer-events-none"

export default function FilterSelect({ value, onChange, children }: {
    value: string,
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void,
    children: React.ReactNode
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={onChange}
                className={selectClass}
            >
                {children}
            </select>
            <span className={arrowClass}>
                ▾           
            </span>
        </div>
    )
}