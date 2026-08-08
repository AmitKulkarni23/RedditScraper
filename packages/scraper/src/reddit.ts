import type { RedditPost } from "@reddit-scraper/shared";

const REDDIT_BASE_URL = "https://oauth.reddit.com";
const TOKEN_URL = "https://www.reddit.com/api/v1/access_token";

export async function getAccessToken(
  clientId: string,
  clientSecret: string
): Promise<string> {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Reddit auth failed: ${response.status}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function fetchSubredditPosts(
  subreddit: string,
  token: string,
  limit = 100
): Promise<RedditPost[]> {
  const response = await fetch(
    `${REDDIT_BASE_URL}/r/${subreddit}/hot?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "web:reddit-scraper:1.0 (by /u/mvrick23)",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Reddit API error for r/${subreddit}: ${response.status}`);
  }

  const data = (await response.json()) as {
    data: {
      children: Array<{
        data: {
          id: string;
          subreddit: string;
          title: string;
          author: string;
          selftext: string;
          score: number;
          num_comments: number;
          url: string;
          permalink: string;
          created_utc: number;
        };
      }>;
    };
  };

  return data.data.children.map((child) => ({
    id: child.data.id,
    subreddit: child.data.subreddit,
    title: child.data.title,
    author: child.data.author,
    selftext: child.data.selftext,
    score: child.data.score,
    num_comments: child.data.num_comments,
    url: child.data.url,
    permalink: `https://reddit.com${child.data.permalink}`,
    created_utc: child.data.created_utc,
    scraped_at: new Date().toISOString(),
  }));
}
