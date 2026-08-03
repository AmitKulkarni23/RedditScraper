import type { PostRow } from "@reddit-scraper/shared";

interface PostCardProps {
  post: PostRow;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="post-card">
      <div className="post-meta">
        <span className="subreddit-tag">r/{post.subreddit}</span>
        <span>u/{post.author}</span>
        <span>{timeAgo(post.created_utc)}</span>
      </div>
      <div className="post-title">
        <a href={post.permalink} target="_blank" rel="noopener noreferrer">
          {post.title}
        </a>
      </div>
      {post.body && <div className="post-body">{post.body}</div>}
      <div className="post-meta" style={{ marginTop: "0.5rem" }}>
        <span>{post.score} points</span>
        <span>{post.num_comments} comments</span>
      </div>
    </div>
  );
}
