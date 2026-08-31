import { ReactNode } from "react"
import { panelClass } from "@/app/components/util/Panel"

/**
 * THE STATS — the three scores side by side. Critic (Metacritic /100), the
 * NG+ community (/10), and you (/10), with your score highlighted like the
 * selected item in a menu and the gap to the community spelled out.
 */

type StatCompareProps = {
    critic?: number | null
    community?: number | null
    communityCount?: number
    you?: number | null
}

function Col({ label, value, scale, color, highlight = false }: {
    label: string
    value: ReactNode
    scale: string
    color: string
    highlight?: boolean
}) {
    return (
        <div
            className={`flex-1 min-w-0 text-center rounded-md px-2 py-2.5 ${highlight ? "outline outline-1 outline-(--color-accent)/60" : ""}`}
            style={highlight ? {
                background: "radial-gradient(85% 100% at 50% 45%, rgba(230,169,74,0.2), rgba(230,169,74,0.04) 80%)",
                boxShadow: "0 0 22px -6px rgba(230,169,74,0.4)",
            } : undefined}
        >
            <p className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-(--color-muted) opacity-90">
                {highlight && <span className="text-(--color-accent) mr-1.5" aria-hidden="true">&#9656;</span>}
                {label}
                {highlight && <span className="text-(--color-accent) ml-1.5" aria-hidden="true">&#9666;</span>}
            </p>
            <span
                className="block font-(family-name:--font-display) font-semibold text-[2.7rem] leading-none my-1 tabular-nums tracking-[-0.02em]"
                style={{ color }}
            >
                {value}
            </span>
            <span className="font-mono text-[0.5625rem] tracking-wide text-(--color-muted)">{scale}</span>
        </div>
    )
}

export default function StatCompare({ critic, community, communityCount = 0, you }: StatCompareProps) {
    const hasCritic = typeof critic === "number" && critic > 0
    const hasCommunity = typeof community === "number" && community > 0
    const hasYou = typeof you === "number" && you > 0

    let gap: ReactNode
    if (hasYou && hasCommunity) {
        const d = you! - community!
        const mag = Math.abs(d).toFixed(1)
        if (Math.abs(d) < 0.25) gap = <>You&apos;re <b>level</b> with the community</>
        else if (d > 0) gap = <>You&apos;re <b>{mag} above</b> the community</>
        else gap = <>You&apos;re <b>{mag} below</b> the community</>
    } else if (hasYou) {
        gap = <>You&apos;ve scored it &mdash; <b>first on the board</b></>
    } else if (hasCritic && hasCommunity) {
        const d = critic! / 10 - community!
        const mag = Math.abs(d).toFixed(1)
        if (Math.abs(d) < 0.5) gap = <>Critics and the community <b>agree</b></>
        else if (d > 0) gap = <>Critics are <b>{mag} above</b> the community</>
        else gap = <>The community is <b>{mag} above</b> the critics</>
    } else {
        gap = <>No scores yet &mdash; <b>set the pace</b></>
    }

    return (
        <div
            className={`${panelClass} relative overflow-hidden flex-1 basis-[22rem] max-w-[34rem] px-4 pt-[0.9rem] pb-[0.85rem]`}
            style={{ background: "radial-gradient(130% 120% at 50% -10%, rgba(230,169,74,0.1), transparent 55%), var(--color-surface)" }}
        >
            <div className="flex gap-1.5">
                <Col label="Critic" value={hasCritic ? critic : "—"} scale={hasCritic ? "/ 100" : "no score"} color="var(--color-critic)" />
                <Col label="Community" value={hasCommunity ? community : "—"} scale={hasCommunity ? `/ 10 · ${communityCount}` : "unrated"} color="var(--color-community)" />
                <Col label="You" value={hasYou ? you : "—"} scale={hasYou ? "/ 10" : "not scored"} color="var(--color-you)" highlight />
            </div>
            <p className="mt-2 pt-2 border-t border-(--color-border) text-center font-mono text-[0.6875rem] uppercase tracking-[0.09em] text-(--color-muted) [&_b]:text-(--color-text) [&_b]:font-medium">
                {gap}
            </p>
        </div>
    )
}
