-- Enable pgvector extension
create extension if not exists vector;

-- Add embedding column (2048 dimensions for nvidia/nemotron-3-embed-1b)
-- No vector index needed: dataset is small (<10k rows), sequential scan is fast
alter table posts add column if not exists embedding vector(2048);

-- Similarity search function
create or replace function match_posts(
  query_embedding vector(2048),
  match_threshold float default 0.5,
  match_count int default 10
)
returns table (
  id uuid,
  reddit_id text,
  subreddit text,
  title text,
  author text,
  body text,
  score int,
  num_comments int,
  url text,
  permalink text,
  created_utc timestamptz,
  similarity float
)
language sql stable
as $$
  select
    posts.id,
    posts.reddit_id,
    posts.subreddit,
    posts.title,
    posts.author,
    posts.body,
    posts.score,
    posts.num_comments,
    posts.url,
    posts.permalink,
    posts.created_utc,
    1 - (posts.embedding <=> query_embedding) as similarity
  from posts
  where posts.embedding is not null
    and 1 - (posts.embedding <=> query_embedding) > match_threshold
  order by posts.embedding <=> query_embedding
  limit match_count;
$$;
