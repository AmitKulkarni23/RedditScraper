"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import PostCard from "@/components/PostCard";
import FreshnessBar from "@/components/FreshnessBar";
import type { PostRow, SearchFilters } from "@reddit-scraper/shared";

const PAGE_SIZE = 25;

function readFiltersFromParams(params: URLSearchParams): {
  query: string;
  filters: SearchFilters;
  page: number;
} {
  return {
    query: params.get("q") ?? "",
    filters: {
      subreddit: params.get("subreddit") || undefined,
      sortBy:
        (params.get("sortBy") as SearchFilters["sortBy"]) || "created_utc",
      sortOrder:
        (params.get("sortOrder") as SearchFilters["sortOrder"]) || "desc",
    },
    page: Math.max(0, Number(params.get("page") ?? 0)),
  };
}

function buildParams(
  query: string,
  filters: SearchFilters,
  page: number
): string {
  const p = new URLSearchParams();
  if (query) p.set("q", query);
  if (filters.subreddit) p.set("subreddit", filters.subreddit);
  if (filters.sortBy && filters.sortBy !== "created_utc")
    p.set("sortBy", filters.sortBy);
  if (filters.sortOrder && filters.sortOrder !== "desc")
    p.set("sortOrder", filters.sortOrder);
  if (page > 0) p.set("page", String(page));
  return p.toString();
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initial = readFiltersFromParams(searchParams);
  const [query, setQuery] = useState(initial.query);
  const [filters, setFilters] = useState<SearchFilters>(initial.filters);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initial.page);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [lastScrapedAt, setLastScrapedAt] = useState<string | null>(null);

  const [filtersDirty, setFiltersDirty] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch("/api/subreddits")
      .then((r) => r.json())
      .then((d) => setSubreddits(d.subreddits ?? []))
      .catch(() => {});

    fetch("/api/meta")
      .then((r) => r.json())
      .then((d) => setLastScrapedAt(d.lastScrapedAt ?? null))
      .catch(() => {});
  }, []);

  const fetchPosts = useCallback(
    async (q: string, f: SearchFilters, pageNum: number) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);
      setFiltersDirty(false);

      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (f.subreddit) params.set("subreddit", f.subreddit);
      if (f.sortBy) params.set("sortBy", f.sortBy);
      if (f.sortOrder) params.set("sortOrder", f.sortOrder);
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(pageNum * PAGE_SIZE));

      try {
        const res = await fetch(`/api/search?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          let message = `Request failed (${res.status})`;
          try {
            const body = await res.json();
            if (body.error) message = body.error;
          } catch {}
          throw new Error(message);
        }
        const data = await res.json();
        setPosts(data.posts ?? []);
        setTotal(data.total ?? 0);
        setHasSearched(true);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "Could not load posts"
        );
        setPosts([]);
        setTotal(0);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    []
  );

  function syncUrl(q: string, f: SearchFilters, p: number) {
    const qs = buildParams(q, f, p);
    router.replace(qs ? `?${qs}` : "/", { scroll: false });
  }

  function handleSearch() {
    const p = 0;
    setPage(p);
    syncUrl(query, filters, p);
    fetchPosts(query, filters, p);
  }

  function handleFiltersChange(f: SearchFilters) {
    setFilters(f);
    setFiltersDirty(true);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    syncUrl(query, filters, newPage);
    fetchPosts(query, filters, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRetry() {
    fetchPosts(query, filters, page);
  }

  useEffect(() => {
    fetchPosts(initial.query, initial.filters, initial.page);
  }, []);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="container">
      <header className="header">
        <h1>Reddit Archive</h1>
        <p className="subtitle">
          Search your saved posts across communities
        </p>
        <FreshnessBar lastScrapedAt={lastScrapedAt} />
      </header>

      <SearchBar
        query={query}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        loading={loading}
        filtersDirty={filtersDirty}
      />

      <FilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        subreddits={subreddits}
      />

      {error && (
        <div className="error" role="alert">
          <p>{error}</p>
          <button className="retry-btn" onClick={handleRetry}>
            Try again
          </button>
        </div>
      )}

      {loading && (
        <div className="loading" aria-live="polite">
          <div className="skeleton-list">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-line skeleton-short" />
                <div className="skeleton-line skeleton-long" />
                <div className="skeleton-line skeleton-medium" />
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && hasSearched && posts.length === 0 && (
        <div className="empty-state" role="status">
          <p className="empty-title">No posts found</p>
          <EmptyStateHint filters={filters} query={query} />
        </div>
      )}

      {!loading && posts.length > 0 && (
        <>
          <div className="results-info">
            <span>
              {total} result{total !== 1 ? "s" : ""} found
            </span>
            <span>
              Page {page + 1} of {totalPages}
            </span>
          </div>

          <div className="posts-list">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={page === 0}
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </button>
              <span className="page-indicator">
                {page + 1} / {totalPages}
              </span>
              <button
                className="page-btn"
                disabled={page >= totalPages - 1}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

function EmptyStateHint({
  filters,
  query,
}: {
  filters: SearchFilters;
  query: string;
}) {
  const hints: string[] = [];

  if (filters.subreddit) {
    hints.push('try "All" subreddits');
  }
  if (query) {
    hints.push("use fewer or broader search terms");
  }
  hints.push(
    "posts are scraped periodically — recent content may not appear for up to 6 hours"
  );

  return (
    <ul className="empty-hints">
      {hints.map((hint) => (
        <li key={hint}>{hint}</li>
      ))}
    </ul>
  );
}
