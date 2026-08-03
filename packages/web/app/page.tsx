"use client";

import { useState, useEffect, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import PostCard from "@/components/PostCard";
import type { PostRow, SearchFilters } from "@reddit-scraper/shared";

const SUBREDDITS = ["wholefoods", "grocery", "Frugal"];
const PAGE_SIZE = 25;

export default function Home() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: "created_utc",
    sortOrder: "desc",
  });
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchPosts = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (filters.subreddit) params.set("subreddit", filters.subreddit);
      if (filters.minScore !== undefined)
        params.set("minScore", String(filters.minScore));
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(pageNum * PAGE_SIZE));

      try {
        const res = await fetch(`/api/search?${params}`);
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error ?? `Request failed: ${res.status}`);
        }
        const data = await res.json();
        setPosts(data.posts ?? []);
        setTotal(data.total ?? 0);
        setHasSearched(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setPosts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [query, filters]
  );

  function handleSearch() {
    setPage(0);
    fetchPosts(0);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    fetchPosts(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    fetchPosts(0);
  }, []);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="container">
      <header className="header">
        <h1>Reddit Scraper</h1>
        <p>Search and explore posts from Reddit</p>
      </header>

      <SearchBar
        query={query}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        loading={loading}
      />

      <FilterPanel
        filters={filters}
        onFiltersChange={(f) => {
          setFilters(f);
        }}
        subreddits={SUBREDDITS}
      />

      {error && <div className="error">{error}</div>}

      {loading && (
        <div className="loading">
          <span className="spinner" />
          Loading posts...
        </div>
      )}

      {!loading && hasSearched && posts.length === 0 && (
        <div className="empty-state">
          <p>No posts found. Try different search terms or filters.</p>
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

          <div className="pagination">
            <button
              className="page-btn"
              disabled={page === 0}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </button>
            <button
              className="page-btn"
              disabled={page >= totalPages - 1}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}
