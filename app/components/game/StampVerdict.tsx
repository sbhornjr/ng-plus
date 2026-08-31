/**
 * The three verdicts, rendered as rubber stamps on the record — critics
 * (Metacritic /100), the NG+ community (/10), and you (/10). Each is stamped
 * by a different authority, so each carries its own ink and sits at its own
 * slightly-off angle.
 */

type StampVerdictProps = {
    metacritic?: number | null
    community?: number | null
    user?: number | null
}

function Stamp({
    cls,
    rotate,
    auth,
    value,
    scale,
    inked,
}: {
    cls: string
    rotate: number
    auth: string
    value: string
    scale: string
    inked: boolean
}) {
    return (
        <div
            className={`stamp ${cls}`}
            style={{ transform: `rotate(${rotate}deg)`, opacity: inked ? 1 : 0.5 }}
        >
            <span className="stamp-frame" aria-hidden="true" />
            <span className="stamp-auth">{auth}</span>
            <span className="stamp-num">{value}</span>
            <span className="stamp-scale">{scale}</span>
        </div>
    )
}

export default function StampVerdict({ metacritic, community, user }: StampVerdictProps) {
    const hasCritic = typeof metacritic === 'number' && metacritic > 0
    const hasCommunity = typeof community === 'number' && community > 0
    const hasUser = typeof user === 'number' && user > 0

    let finding = 'Awaiting the community’s verdict'
    if (hasCritic && hasCommunity) {
        const d = metacritic! / 10 - community!
        const mag = Math.abs(d).toFixed(1)
        if (Math.abs(d) < 0.5) finding = 'On the record — critics and NG+ concur'
        else if (d > 0) finding = `On the record — critics rate this ${mag} above NG+`
        else finding = `On the record — NG+ rates this ${mag} above the critics`
    }

    return (
        <div className="paper w-fit max-w-full" style={{ padding: '0.95rem 1.3rem 0.8rem' }}>
            <p className="field" style={{ textAlign: 'center', marginBottom: '0.6rem', letterSpacing: '0.24em' }}>The Verdict</p>
            <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ marginTop: '0.35rem' }}>
                    <Stamp cls="critic" rotate={-2.5} auth="Critics" value={hasCritic ? String(metacritic) : '—'} scale={hasCritic ? '/ 100' : 'no score'} inked={hasCritic} />
                </div>
                <div style={{ marginTop: '-0.4rem' }}>
                    <Stamp cls="community" rotate={1.6} auth="NG+" value={hasCommunity ? String(community) : '—'} scale={hasCommunity ? '/ 10' : 'unrated'} inked={hasCommunity} />
                </div>
                <div style={{ marginTop: '0.15rem' }}>
                    <Stamp cls="you" rotate={-1.1} auth="You" value={hasUser ? String(user) : '—'} scale={hasUser ? '/ 10' : 'not on file'} inked={hasUser} />
                </div>
            </div>
            <p className="finding">{finding}</p>
        </div>
    )
}
