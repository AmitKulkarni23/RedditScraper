import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { RedditPost } from "@reddit-scraper/shared";
import { generateEmbeddings, buildEmbeddingText } from "./embeddings.js";

export function createSupabaseClient(url: string, serviceKey: string) {
  return createClient(url, serviceKey);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

export async function upsertPosts(
  client: AnySupabaseClient,
  posts: RedditPost[],
  openrouterKey?: string
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

  let embeddings: number[][] | null = null;
  if (openrouterKey) {
    try {
      const texts = posts.map((p) => buildEmbeddingText(p.title, p.selftext));
      embeddings = await generateEmbeddings(texts, openrouterKey);
      console.log(`  Generated ${embeddings.length} embeddings`);
    } catch (err) {
      console.error("  Embedding generation failed, storing without:", err);
    }
  }

  const rowsWithEmbeddings = rows.map((row, i) => ({
    ...row,
    ...(embeddings?.[i] ? { embedding: JSON.stringify(embeddings[i]) } : {}),
  }));

  const { data, error } = await client
    .from("posts")
    .upsert(rowsWithEmbeddings, { onConflict: "reddit_id", ignoreDuplicates: false });

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`);
  }

  return data;
}

export async function backfillEmbeddings(
  client: AnySupabaseClient,
  openrouterKey: string,
  batchSize = 10
) {
  const { data: posts, error } = await client
    .from("posts")
    .select("id, title, body")
    .is("embedding", null)
    .limit(batchSize);

  if (error) throw new Error(`Fetch failed: ${error.message}`);
  if (!posts || posts.length === 0) {
    console.log("No posts need embedding backfill");
    return 0;
  }

  const texts = posts.map((p) => buildEmbeddingText(p.title, p.body ?? ""));
  const embeddings = await generateEmbeddings(texts, openrouterKey);

  for (let i = 0; i < posts.length; i++) {
    const { error: updateError } = await client
      .from("posts")
      .update({ embedding: JSON.stringify(embeddings[i]) })
      .eq("id", posts[i].id);

    if (updateError) {
      console.error(`  Failed to update embedding for ${posts[i].id}:`, updateError.message);
    }
  }

  return posts.length;
}
