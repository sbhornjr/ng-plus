/**
 * The three-source verdict — NG+'s whole premise, made into one component.
 * Critics (Metacritic, /100), the NG+ community (/10), and you (/10), stamped
 * side by side with the disagreement called out underneath.
 */

type ScoreVerdictProps = {
    metacritic?: number | null
    community?: number | null
    communityCount?: number
    user?: number | null
    /** Shown when the viewer hasn't rated — usually the "Rate & Review" control. */
    userAction?: React.ReactNode
}

function criticTier(score: number) {
    return score >= 80 ? 'var(--color-good)' : score >= 60 ? 'var(--color-mid)' : 'var(--color-bad)'
}

function tenTier(score: number) {
    return score >= 8 ? 'var(--color-good)' : score >= 6 ? 'var(--color-mid)' : score >= 3 ? 'var(--color-bad)' : 'var(--color-muted)'
}

function Cell({ label, sub, children }: { label: string; sub: string; children: React.ReactNode }) {
    return (
        <div className="flex-1 px-4 py-4 text-center">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-(--color-muted) mb-1.5">{label}</p>
            <div className="flex items-baseline justify-center gap-1 tabular-nums leading-none">{children}</div>
            <p className="text-[11px] text-(--color-muted) mt-1.5">{sub}</p>
        </div>
    )
}

export default function ScoreVerdict({ metacritic, community, communityCount = 0, user, userAction }: ScoreVerdictProps) {
    const hasCritic = typeof metacritic === 'number' && metacritic > 0
    const hasCommunity = typeof community === 'number' && community > 0
    const hasUser = typeof user === 'number' && user > 0

    // Delta between critics (normalised to /10) and the NG+ community.
    let delta: string | null = null
    if (hasCritic && hasCommunity) {
        const d = metacritic! / 10 - community!
        const mag = Math.abs(d).toFixed(1)
        if (Math.abs(d) < 0.5) delta = 'Critics and NG+ broadly agree'
        else if (d > 0) delta = `Critics rate this ${mag} higher than NG+`
        else delta = `NG+ rates this ${mag} higher than the critics`
    }

    return (
        <div className="border border-(--color-border) rounded-[3px] bg-(--color-surface) overflow-hidden max-w-2xl">
            <div className="flex divide-x divide-(--color-border)">
                <Cell label="Critics" sub={hasCritic ? 'Metacritic' : 'No score'}>
                    {hasCritic ? (
                        <>
                            <span className="text-4xl font-bold font-(family-name:--font-display)" style={{ color: criticTier(metacritic!) }}>{metacritic}</span>
                            <span className="text-sm text-(--color-muted)">/100</span>
                        </>
                    ) : (
                        <span className="text-3xl font-bold text-(--color-muted)">&mdash;</span>
                    )}
                </Cell>

                <Cell label="NG+" sub={hasCommunity ? (communityCount > 0 ? `${communityCount} ${communityCount === 1 ? 'rating' : 'ratings'}` : 'Community') : 'Not rated yet'}>
                    {hasCommunity ? (
                        <>
                            <span className="text-4xl font-bold font-(family-name:--font-display)" style={{ color: tenTier(community!) }}>{community}</span>
                            <span className="text-sm text-(--color-muted)">/10</span>
                        </>
                    ) : (
                        <span className="text-3xl font-bold text-(--color-muted)">&mdash;</span>
                    )}
                </Cell>

                <Cell label="You" sub={hasUser ? 'Your rating' : 'Not rated yet'}>
                    {hasUser ? (
                        <>
                            <span className="text-4xl font-bold font-(family-name:--font-display)" style={{ color: tenTier(user!) }}>{user}</span>
                            <span className="text-sm text-(--color-muted)">/10</span>
                        </>
                    ) : userAction ? (
                        <span className="pt-1">{userAction}</span>
                    ) : (
                        <span className="text-3xl font-bold text-(--color-muted)">&mdash;</span>
                    )}
                </Cell>
            </div>

            {delta && (
                <p className="border-t border-(--color-border) px-4 py-2 text-center text-[11px] font-mono uppercase tracking-[0.12em] text-(--color-muted)">
                    {delta}
                </p>
            )}
        </div>
    )
}
