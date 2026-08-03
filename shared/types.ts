export interface RedditPost {
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
  scraped_at: string;
}

export interface PostRow {
  id: string;
  reddit_id: string;
  subreddit: string;
  title: string;
  author: string;
  body: string;
  score: number;
  num_comments: number;
  url: string;
  permalink: string;
  created_utc: string;
  scraped_at: string;
}

export interface SearchFilters {
  query?: string;
  subreddit?: string;
  minScore?: number;
  sortBy?: "score" | "created_utc" | "num_comments";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}
