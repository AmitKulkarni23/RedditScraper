# Reddit Scraper

Scrapes Reddit posts on a schedule, stores them in Supabase, and serves a searchable frontend on Vercel — with an AI chat interface coming in Phase 3.

## Stack

- **TypeScript** monorepo (pnpm workspaces)
- **Supabase** — Postgres database with full-text search, Row Level Security
- **Next.js 15** (App Router) — search UI deployed on Vercel
- **GitHub Actions** — cron-based scraper, runs daily
- **OpenRouter** — AI chat against stored data (Phase 3)

## Project Structure

```
├── packages/
│   ├── scraper/          # Reddit API → Supabase (runs in GitHub Actions)
│   └── web/              # Next.js frontend (deployed on Vercel)
├── shared/               # Shared TypeScript types
├── supabase/             # Database migrations (schema as code)
└── .github/workflows/    # CI/CD and scraper cron
```

## Getting Started

### Prerequisites

- Node.js 22+
- [pnpm](https://pnpm.io/installation)
- A [Supabase](https://supabase.com) project (free tier)
- A Reddit API app (script type) — create or find yours at https://www.reddit.com/prefs/apps

### Install

```bash
pnpm install
```

### Environment Variables

Copy `.env.example` and fill in your keys:

```bash
cp .env.example .env.local
```

### Common Commands

```bash
# Run the Next.js frontend locally
pnpm --filter web dev

# Run the scraper locally
pnpm --filter scraper start

# Apply pending migrations to remote DB
supabase db push --linked

# Check local vs remote migration status
supabase migration list --linked

# Run arbitrary SQL against remote DB
supabase db query "<SQL>" --linked

# Build everything
pnpm build
```

## Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Scraper + Supabase storage | In progress |
| 2 | Search UI with filters | Scaffolded |
| 3 | AI chat interface (OpenRouter) | Planned |

## Secrets & Security

GitHub Actions secrets are **encrypted and never exposed** — even on public repos. The `.env.example` file contains only placeholder values. Real keys live in:

- **GitHub** → Settings → Secrets and variables → Actions (for the scraper)
- **Vercel** → Project Settings → Environment Variables (for the frontend)
