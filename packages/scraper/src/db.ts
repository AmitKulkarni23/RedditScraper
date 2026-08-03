import { createClient } from "@supabase/supabase-js";
import type { RedditPost } from "@reddit-scraper/shared";

export function createSupabaseClient(url: string, serviceKey: string) {
  return createClient(url, serviceKey);
}

export async function upsertPosts(
  client: ReturnType<typeof createClient>,
  posts: RedditPost[]
) {
  const rows = posts.map((post) => ({
    reddit_id: post.id,
    subreddit: post.subreddit,
    title: post.title,
    author: post.author,
    body: post.selftext,
    score: post.score,
    num_comments: post.num_comments,
    url: post.url,
    permalink: post.permalink,
    created_utc: new Date(post.created_utc * 1000).toISOString(),
    scraped_at: post.scraped_at,
  }));

  const { data, error } = await client
    .from("posts")
    .upsert(rows, { onConflict: "reddit_id" });

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`);
  }

  return data;
}
