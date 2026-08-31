'use client'

import { useEffect, useState } from 'react'

type Chip = { id: number; text: string }

/**
 * The +1 tic — NG+'s signature interaction. Any client action that advances
 * your file dispatches `window` event "ngplus:plus1"; this layer catches it
 * and floats a "+1 LABEL" up the screen like XP gain.
 */
export default function Plus1Layer() {
    const [chips, setChips] = useState<Chip[]>([])

    useEffect(() => {
        let seq = 0
        function onPlus1(e: Event) {
            const detail = (e as CustomEvent).detail ?? {}
            const n = typeof detail.n === 'number' ? detail.n : 1
            const label = detail.label ? ` ${String(detail.label).toUpperCase()}` : ''
            const id = ++seq
            setChips(c => [...c, { id, text: `+${n}${label}` }])
            window.setTimeout(() => setChips(c => c.filter(x => x.id !== id)), 1000)
        }
        window.addEventListener('ngplus:plus1', onPlus1)
        return () => window.removeEventListener('ngplus:plus1', onPlus1)
    }, [])

    if (chips.length === 0) return null

    return (
        <div className="ngplus-plus1-layer" aria-hidden="true">
            {chips.map(c => (
                <span key={c.id} className="ngplus-plus1">{c.text}</span>
            ))}
        </div>
    )
}
