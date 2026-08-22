# ng-plus

Next.js 16 (App Router) gaming profile app backed by Supabase. Tailwind CSS v4.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


## Commands

```bash
npm run dev      # dev server on :3000
npm run build    # production build
npm run lint     # eslint (core-web-vitals + typescript)
npm run seed     # seed games from RAWG API (requires .env.local with RAWG_API_KEY + SUPABASE_SECRET_KEY)
```

No test framework is configured. No typecheck script — use `npx tsc --noEmit` for type checking.

## Structure

- `app/` — Next.js App Router pages and API routes
  - `app/components/` — UI components organized by domain (user, game, library, lists, feed, util)
  - `app/api/` — API routes (only `delete-account` currently)
- `lib/` — shared logic: Supabase clients, DB queries, utilities
- `scripts/` — standalone scripts (`seed-games.ts`, `inspect-rawg.ts`)

## Supabase Clients

Three different Supabase clients exist — use the right one for context:

| File | Context | Import |
|------|---------|--------|
| `lib/supabase-server.ts` | Server Components / Route Handlers | `import { createClient } from '@/lib/supabase-server'` (async) |
| `lib/supabase-browser.ts` | Client Components via `@supabase/ssr` | `import { createClient } from '@/lib/supabase-browser'` |
| `lib/supabase.ts` | Browser only — raw `supabase-js` client with debug logging | `import { supabase } from '@/lib/supabase'` |

Do **not** mix them. The server client is async (`await createClient()`). The browser client from `supabase-browser.ts` is sync.

## Auth & Middleware

`proxy.ts` handles Supabase session refresh on every request via cookie-based SSR. It is not wired as `middleware.ts` by default — verify before modifying.

## External APIs

- **RAWG API** — game data source, used by `scripts/seed-games.ts`
- **Anthropic API** — generates AI "Loadout" identity text (`lib/loadout.ts`), model `claude-sonnet-4-6`
- **Supabase Storage** — user avatars and game images (remote pattern: `*.supabase.co/storage/v1/object/public/**`)

## Env Vars

Required in `.env.local` (gitignored):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SECRET_KEY` (for seed script)
- `RAWG_API_KEY` (for seed script)
- `ANTHROPIC_API_KEY` (for loadout generation)

## Conventions

- Dark theme hardcoded: `bg-[#0e0e10]`, `text-[#f0f0f0]`
- Fonts: Space Grotesk (`--font-display`), Inter (`--font-body`)
- Path alias: `@/*` maps to project root
- No monorepo — single package
