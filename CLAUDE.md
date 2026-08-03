# RedditScraper

## Project Overview
TypeScript monorepo: Reddit scraper (GitHub Actions cron) → Supabase Postgres → Next.js frontend (Vercel) with search + AI chat (OpenRouter).

## Architecture
- `packages/scraper/` — GitHub Action cron job, writes to Supabase
- `packages/web/` — Next.js app deployed on Vercel, reads from Supabase
- `shared/` — shared TypeScript types
- `supabase/` — migrations and config (schema as code)

## Stack
- **Runtime**: TypeScript, Node.js
- **Database**: Supabase (Postgres + PostgREST)
- **Frontend**: Next.js (App Router)
- **Hosting**: Vercel (free tier)
- **Scraper**: GitHub Actions (cron schedule)
- **AI Chat**: OpenRouter (Phase 3)
- **Package Manager**: pnpm workspaces

## Commands
```bash
pnpm install              # Install all dependencies
pnpm --filter web dev     # Run Next.js dev server
pnpm --filter scraper start  # Run scraper locally
supabase db push          # Apply migrations to Supabase
```

## Environment Variables
### Scraper (GitHub Actions secrets)
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_KEY` — Supabase service role key (write access)
- `REDDIT_CLIENT_ID` — Reddit API app client ID
- `REDDIT_CLIENT_SECRET` — Reddit API app client secret

### Web (Vercel env vars)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (read-only, safe for client)
- `OPENROUTER_API_KEY` — OpenRouter API key (Phase 3, server-side only)

## Phases
1. Scraper + Supabase storage
2. Search UI with filters
3. AI chat interface against stored data
