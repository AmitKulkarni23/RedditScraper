# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Owner (Amit) plus a small trusted group of friends. They visit occasionally to search scraped Reddit history or ask questions about it — casual, low-frequency use, not a daily work tool. No public audience; no auth-gated roles today.

## Product Purpose

Follow specific Reddit communities over time. A GitHub Actions cron scrapes posts into Supabase every 6 hours; the web app makes that archive searchable (Postgres full-text search) and, in Phase 3, answerable via AI chat (OpenRouter). Success: a user finds or recalls a post/discussion that Reddit's own search makes hard to find.

## Operating Context

- Data arrives on a schedule, not live — results can lag Reddit by up to 6 hours.
- Deployed on Vercel free tier; Supabase free tier. Cost-conscious choices are durable constraints.
- Users arrive with a memory of a post or a question about a community, not a browsing itch.

## Capabilities and Constraints

- Subreddit list is configurable and changes over time — the product must not assume fixed topics or hardcode community names into UI copy.
- Search with filters and pagination exists (Phase 2 shipped). Dark mode supported.
- AI chat (Phase 3) planned against stored data; `app/api/chat` route scaffolded.
- Read path uses Supabase anon key (read-only); writes only via scraper service key.
- Monorepo: `packages/web` is the only UI surface; design work is scoped there.

## Evidence on Hand

- Real scraped Reddit posts in Supabase (titles, bodies, metadata) — actual content, no need to fabricate sample data.
- No testimonials, metrics, or marketing claims exist; do not invent any.

## Product Principles

1. Retrieval over browsing — optimize for "find that post again," not feeds or engagement.
2. Honest about staleness — surface data freshness rather than pretending to be live Reddit.
3. Topic-agnostic — UI must work whatever the current subreddit list is.
4. Small-group tool — clarity and speed for a handful of trusted users beat growth features.
5. Free-tier frugal — no feature that requires paid infrastructure.
