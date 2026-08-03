create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  reddit_id text unique not null,
  subreddit text not null,
  title text not null,
  author text not null,
  body text default '',
  score integer default 0,
  num_comments integer default 0,
  url text not null,
  permalink text not null,
  created_utc timestamptz not null,
  scraped_at timestamptz default now()
);

-- Full-text search index for Phase 2
alter table posts add column if not exists fts tsvector
  generated always as (to_tsvector('english', title || ' ' || coalesce(body, ''))) stored;

create index if not exists idx_posts_fts on posts using gin(fts);
create index if not exists idx_posts_subreddit on posts(subreddit);
create index if not exists idx_posts_created_utc on posts(created_utc desc);
create index if not exists idx_posts_score on posts(score desc);

-- Row Level Security: allow public read, restrict writes to service role
alter table posts enable row level security;

create policy "Public read access" on posts
  for select using (true);

create policy "Service role write access" on posts
  for insert with check (true);

create policy "Service role update access" on posts
  for update using (true);
