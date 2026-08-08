import type { PostRow } from "@reddit-scraper/shared";

interface PostCardProps {
  post: PostRow;
  index?: number;
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PostCard({ post, index = 0 }: PostCardProps) {
  const delay = Math.min(index * 0.04, 0.4);

  return (
    <article
      className="post-card"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="post-meta">
        <span className="subreddit-tag">r/{post.subreddit}</span>
        <span title={formatDate(post.created_utc)}>
          {timeAgo(post.created_utc)}
        </span>
      </div>
      <h2 className="post-title">
        <a href={post.permalink} target="_blank" rel="noopener noreferrer">
          {post.title}
        </a>
      </h2>
      {post.body && <p className="post-body">{post.body}</p>}
      <div className="post-stats">
        <span>{post.num_comments} comments</span>
      </div>
    </article>
  );
}
