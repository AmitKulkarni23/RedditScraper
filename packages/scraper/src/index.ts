import { getAccessToken, fetchSubredditPosts } from "./reddit.js";
import { createSupabaseClient, upsertPosts } from "./db.js";

const SUBREDDITS = [
  "problems",
  "buildinpublic",
  "indiehackers",
  "marketing",
  "microsaas",
  "startups",
  "StartUpIndia",
  "technology",
];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function main() {
  const supabaseUrl = requireEnv("SUPABASE_URL");
  const supabaseKey = requireEnv("SUPABASE_SERVICE_KEY");
  const redditClientId = requireEnv("REDDIT_CLIENT_ID");
  const redditClientSecret = requireEnv("REDDIT_CLIENT_SECRET");

  const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
  const token = await getAccessToken(redditClientId, redditClientSecret);

  let totalPosts = 0;

  for (const subreddit of SUBREDDITS) {
    try {
      console.log(`Scraping r/${subreddit}...`);
      const posts = await fetchSubredditPosts(subreddit, token, 10);
      await upsertPosts(supabase, posts);
      totalPosts += posts.length;
      console.log(`  Stored ${posts.length} posts from r/${subreddit}`);
    } catch (err) {
      console.error(`  Failed r/${subreddit}:`, err);
    }
  }

  console.log(`Done. Total posts upserted: ${totalPosts}`);
}

main().catch((err) => {
  console.error("Scraper failed:", err);
  process.exit(1);
});
