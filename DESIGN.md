# NG+ Design System

Internal reference for NG+'s visual identity. No name for this system is user-facing — see **Naming Conventions** below before introducing any new terminology.

## 1. Concept

NG+ isn't a storefront or a HUD — it's a personal ledger: you log what you played, grade it against your own taste, and compare that grade to Metacritic and the community. The design is built outward from two things nothing else in this space has:

- **The three-source rating.** Every game carries up to three independent scores — Metacritic, the NG+ community average, and yours — shown as stamped seals rather than a single number.
- **Loadout.** An LLM-written "gamer identity" paragraph generated from a user's real library/rating data.

Everything else — palette, type, geometry — is derived from an archival/catalog metaphor (a personal card catalog, a stamped ledger of what you've played) rather than borrowed from a music player or a HUD. Avoid reaching for neon/arcade or Spotify-style pill-and-circle geometry — that was explicitly rejected during the redesign as a generic "gaming app" default, not a fit for what this app actually does (cataloging and grading, not playing).

## 2. Naming Conventions

- **"Loadout"** is a real feature name (the AI-identity page). It's allowed to be a little unusual because nothing else occupies that name.
- **"Ledger"** is *not* a product name. It's the internal/design-system name for this aesthetic direction (the palette, type, stamp motif) — used only in code comments and design discussion, never in UI copy, button labels, or page titles.
- **"Library"** stays "Library." Every game platform (Steam, Xbox, PlayStation, GOG) already uses this word correctly; renaming it for vocabulary-cohesion reasons costs real clarity for no real gain. Don't rename established, correctly-expected nouns just to sound more "on brand" — save distinctive naming for things that don't already have an expected name (like Loadout).

## 3. Color

All colors are CSS custom properties in `app/globals.css` under `:root`. Always reference the token (`bg-(--color-x)`, `var(--color-x)`), never a hardcoded hex — that's what makes retuning the palette a one-file change.

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#14120f` | Page background — warm near-black (brown undertone, not neutral gray) |
| `--color-surface` | `#221f1a` | Card/panel background |
| `--color-surface-light` | `#2b271f` | Subtle fill — placeholder images, hover backgrounds |
| `--color-border` | `#3a352b` | Hairline borders, dividers |
| `--color-accent` | `#8e5aa8` | Interactive color — links, primary buttons, focus/hover states |
| `--color-accent-hover` | `#7a4a8f` | Hover/pressed state for accent-colored elements |
| `--color-text` | `#c9c2b4` | Primary text — warm parchment, not stark white |
| `--color-muted` | `#8a8378` | Secondary text, metadata, captions |

**Rating tiers** (`--color-good` / `--color-mid` / `--color-bad`) are a separate semantic set, used for Metacritic/NG+/your-score values and nowhere else:

| Token | Hex | Meaning |
|---|---|---|
| `--color-good` | `#4f86c6` | Score ≥ 8 |
| `--color-mid` | `#d99a3a` | Score 6–7 |
| `--color-bad` / `--color-bad-hover` | `#d6493f` / `#a83a30` | Score < 6, and destructive actions (delete account, remove from library) |

**Why blue/amber/red, not gold/brass/red:** an earlier version used three shades of the same warm hue (gold/brass/oxblood) differing mainly in lightness — this is hard to read for color-blind users, since it relies on a lightness difference in a hue family where color-blind discrimination is already weak. The current set uses genuinely different hues so tier is legible by color *and* the numbers remain the actual source of truth regardless. If you ever need a 4th semantic color, pick a hue outside this blue/amber/red family — don't add another warm brown/gold.

**Contrast against cover art:** the rating stamp (`Seal`, see below) sits on top of unpredictable, often busy game cover art. Its background is a near-opaque dark fill (`rgba(15,13,10,0.88)`), not a light tint — this is deliberate. A more transparent fill looked fine on plain art and unreadable on bright/saturated covers (tested against a solid-red game cover and a warm-orange one). Keep any future overlay-on-photo element close to that opacity.

## 4. Typography

Three font roles, each with a distinct job — this replaced an earlier two-font setup (Space Grotesk + Inter) that read as the generic "safe modern SaaS" pairing.

| Role | Font | Variable | Used for |
|---|---|---|---|
| Display | Fraunces (variable weight, italic) | `--font-display` | Headings, card titles, the Loadout headline |
| Body | IBM Plex Sans | `--font-body` | Prose — reviews, bios, descriptions |
| Mono | IBM Plex Mono | `--font-mono` | **Every number**: ratings, hours played, dates, stat values, badge labels |

The mono rule is a real convention, not a decoration — any numeric/data value in the UI (a rating, a play count, a timestamp, a stat tile figure) should render in `font-(family-name:--font-mono)`, tracked-out and uppercase for labels. This is what makes numbers read as "stamped ledger entries" consistently across the app. Prose never uses mono.

`h1`–`h6` are bound to `--font-display` globally in `globals.css`, so headings need no explicit font class — but most existing code repeats `font-(family-name:--font-display)` explicitly anyway for clarity; match that existing style rather than relying on the implicit heading rule.

## 5. Geometry

One flat corner radius everywhere non-circular: **`rounded-[3px]`**. This applies to cards, buttons, modals, form inputs, image frames, tag pills, dropdowns — everything. It replaced a mix of `rounded-lg`/`rounded-xl`/`rounded-2xl` that read as generic soft SaaS chrome.

Stay circular (`rounded-full`) only for things that are actually round objects, not because "circle" is a decorative default:
- Avatars (`Avatar.tsx`)
- The rating stamp (`Seal.tsx`) — see below

Progress-bar-style fills (rating distribution bars) use `rounded-[1px]`, not `rounded-full` — a pill-shaped thin bar reads as a loading indicator, not a ledger mark.

## 6. Signature devices

### The Seal (rating stamp)

`app/components/game/Seal.tsx`. A small dashed-border circle, semi-transparent dark fill, tier-colored border/text, slightly rotated (`-7deg` on the right, `5deg` on the left) — reads as a hand-stamped ink mark rather than a UI badge. This is the app's one true signature element and should appear anywhere a game's score is shown on top of its cover art: `GameCard`, `FeedGameCard`, `FeedReview`. It intentionally does **not** appear in list-row contexts where a score sits next to text rather than on an image (e.g. `Review.tsx`, `ReviewPageRating.tsx`) — there, a plain colored number in `--font-mono` is enough; forcing the stamp shape into a non-image layout would be decoration without a reason.

Placement convention: **right side = Metacritic or NG+ community score** (whichever applies — never both at once), **left side = the viewer's own score**. Don't invent a third position; if you need to show more than two scores at once (as the landing-page hero does, showing MC and NG+ simultaneously with no viewer score), that's a deliberate one-off, not a new standard layout.

### The Folio (CoverFan)

`app/components/lists/CoverFan.tsx`. Renders a list's covers as an overlapping, individually-tilted fan (`-9deg` to `8deg`, alternating) instead of a flat grid — reads as a hand of cards / stack of physical media rather than a generic thumbnail row. Used by both `ListPreview` (the standalone list page, `size="lg"`) and `FeedListPreview` (inline in the activity feed, default `size="md"`).

Two things that look like bugs but are load-bearing:
- **`imgSizes` in `CoverFan.tsx` is deliberately larger than the rendered box** (140px request for an 80px box, 220px for a 112px box). These images are rotated in CSS; an exactly-matched image request looks visibly soft once resampled at an angle. Don't "fix" this down to match the container size.
- **Rotation uses the CSS custom-property trick** (`rotate-[var(--fan-rotate)]` + an inline `style` setting `--fan-rotate`), not a literal Tailwind class per array index. A literal array of rotation classes (`ROTATIONS[i % n]` interpolated directly into `className`) works fine here since Tailwind scans raw source text, but if you ever generate rotation values dynamically (not from a fixed small array), use the CSS-variable pattern so the utility class Tailwind sees is always a static string.

Empty lists (0 games) show a single dashed-outline placeholder box in the same footprint as the folio, with muted uppercase mono text ("No games yet") — never leave the space blank. Same idea for `GameCard`'s missing-cover state: a faint diagonal-hatch texture + "No Cover" in tracked mono, not a flat gray box with plain text.

## 7. Component patterns

- **Catalog card** (`GameCard`): cover art, up to two `Seal`s, a dotted rule, then title (Fraunces) / developer+year (mono) / play stats (mono). This is the base pattern other card types riff on.
- **Stat tiles** (`StatGrid`, and the inline stat cards on `Loadout`): value in `--color-good` + mono, label in tracked-uppercase muted mono underneath.
- **Dossier note** (the Loadout identity paragraph, and the landing page's "Example Dossier Entry"): a slightly rotated card with a tracked-uppercase mono eyebrow label and the actual content in italic Fraunces. Anything presented as a *sample* rather than real user data should carry an explicit "Example ___" eyebrow like this — never let illustrative copy pass as real.

## 8. Do's and Don'ts

**Do**
- Reference color/font tokens, never hardcode a hex or a font name.
- Put every number in `--font-mono`.
- Keep the `rounded-[3px]` radius uniform; only avatars and the Seal stay circular.
- Show an empty state (dashed placeholder + short mono label) instead of blank space when a collection is empty.
- Ground any new visual device in something NG+ actually does (rating, logging, reviewing) before reaching for a generic "gaming" motif.

**Don't**
- Don't introduce pill-shaped buttons or Spotify-style geometry — already considered and rejected as a generic default, not a fit for this app.
- Don't rename established, correctly-understood nouns (Library, etc.) for branding cohesion.
- Don't use "Ledger" in any user-facing copy.
- Don't apply the Seal stamp to non-image, text-row contexts (use a plain mono-colored number there instead).
- Don't undersize an `Image`'s `sizes` prop to exactly match its rendered box if that box is rotated or scaled on hover — request headroom.
