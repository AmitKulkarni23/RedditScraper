import { getAccessToken, fetchSubredditPosts } from "./reddit.js";
import { createSupabaseClient, upsertPosts, backfillEmbeddings } from "./db.js";

const SUBREDDITS = [
  "wholefoodscustomers",
  "wholefoods",
  // "buildinpublic",
  // "indiehackers",
  // "marketing",
  // "microsaas",
  // "startups",
  // "StartUpIndia",
  // "technology",
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
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  if (!openrouterKey) {
    console.warn("OPENROUTER_API_KEY not set — posts will be stored without embeddings");
  }

  const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
  const token = await getAccessToken(redditClientId, redditClientSecret);

  let totalPosts = 0;

  for (const subreddit of SUBREDDITS) {
    try {
      console.log(`Scraping r/${subreddit}...`);
      const posts = await fetchSubredditPosts(subreddit, token, 10);
      await upsertPosts(supabase, posts, openrouterKey);
      totalPosts += posts.length;
      console.log(`  Stored ${posts.length} posts from r/${subreddit}`);
    } catch (err) {
      console.error(`  Failed r/${subreddit}:`, err);
    }
  }

  if (openrouterKey) {
    console.log("Backfilling embeddings for posts missing them...");
    let backfilled = 0;
    let batch: number;
    do {
      batch = await backfillEmbeddings(supabase, openrouterKey);
      backfilled += batch;
    } while (batch > 0);
    if (backfilled > 0) {
      console.log(`  Backfilled ${backfilled} posts with embeddings`);
    }
  }

  console.log(`Done. Total posts upserted: ${totalPosts}`);
}

main().catch((err) => {
  console.error("Scraper failed:", err);
  process.exit(1);
});
