-- Enable pg_cron extension (pre-installed in Supabase)
create extension if not exists pg_cron;

-- Delete posts older than 30 days, runs daily at midnight UTC
select cron.schedule(
  'delete-posts-older-than-30-days',
  '0 0 * * *',
  $$delete from posts where scraped_at < now() - interval '30 days'$$
);
