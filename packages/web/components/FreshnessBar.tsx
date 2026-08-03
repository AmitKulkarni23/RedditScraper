"use client";

function formatFreshness(isoDate: string): string {
  const ms = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface FreshnessBarProps {
  lastScrapedAt: string | null;
}

export default function FreshnessBar({ lastScrapedAt }: FreshnessBarProps) {
  if (!lastScrapedAt) return null;

  return (
    <p className="freshness">
      <span className="freshness-dot" aria-hidden="true" />
      Last scraped {formatFreshness(lastScrapedAt)}
    </p>
  );
}
