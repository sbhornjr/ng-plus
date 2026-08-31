/**
 * THE RUN — the three scores as three playthroughs of an opinion.
 * Critic (Metacritic /100), community (/10), and you (/10), laid out for
 * comparison with your run highlighted and the gap to the community named.
 */

type RunComparisonProps = {
    critic?: number | null
    community?: number | null
    communityCount?: number
    you?: number | null
}

export default function RunComparison({ critic, community, communityCount = 0, you }: RunComparisonProps) {
    const hasCritic = typeof critic === 'number' && critic > 0
    const hasCommunity = typeof community === 'number' && community > 0
    const hasYou = typeof you === 'number' && you > 0

    let gap: React.ReactNode = 'No runs logged yet'
    if (hasYou && hasCommunity) {
        const d = you! - community!
        const mag = Math.abs(d).toFixed(1)
        if (Math.abs(d) < 0.25) gap = <>Your run is <b>dead level</b> with the community</>
        else if (d > 0) gap = <>You&apos;re running <b>{mag} ahead</b> of the community</>
        else gap = <>You&apos;re running <b>{mag} behind</b> the community</>
    } else if (hasYou) {
        gap = <>You&apos;ve logged your run &mdash; <b>be the first</b> against the field</>
    } else if (hasCritic && hasCommunity) {
        const d = critic! / 10 - community!
        const mag = Math.abs(d).toFixed(1)
        if (Math.abs(d) < 0.5) gap = <>Critics and the community are <b>running level</b></>
        else if (d > 0) gap = <>Critics are <b>{mag} ahead</b> of the community</>
        else gap = <>The community is <b>{mag} ahead</b> of the critics</>
    } else {
        gap = <>No community run yet &mdash; <b>set the pace</b></>
    }

    return (
        <div className="run">
            <div className="run-cols">
                <div className="run-col critic">
                    <span className="run-src">Critic</span>
                    <span className="run-val">{hasCritic ? critic : '—'}</span>
                    <span className="run-scale">{hasCritic ? '/ 100' : 'no score'}</span>
                </div>
                <div className="run-col community">
                    <span className="run-src">Community</span>
                    <span className="run-val">{hasCommunity ? community : '—'}</span>
                    <span className="run-scale">{hasCommunity ? `/ 10 · ${communityCount}` : 'unrated'}</span>
                </div>
                <div className="run-col you">
                    <span className="run-src">You</span>
                    <span className="run-val">{hasYou ? you : '—'}</span>
                    <span className="run-scale">{hasYou ? '/ 10' : 'no run'}</span>
                </div>
            </div>
            <p className="run-gap">{gap}</p>
        </div>
    )
}
