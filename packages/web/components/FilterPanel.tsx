"use client";

import type { SearchFilters } from "@reddit-scraper/shared";

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  subreddits: string[];
}

export default function FilterPanel({
  filters,
  onFiltersChange,
  subreddits,
}: FilterPanelProps) {
  function update(partial: Partial<SearchFilters>) {
    onFiltersChange({ ...filters, ...partial });
  }

  return (
    <div className="filters">
      <div className="filters-row">
        <label className="filter-label" htmlFor="filter-subreddit">
          Subreddit
        </label>
        <select
          id="filter-subreddit"
          className="filter-select"
          value={filters.subreddit ?? ""}
          onChange={(e) =>
            update({ subreddit: e.target.value || undefined })
          }
        >
          <option value="">All</option>
          {subreddits.map((sub) => (
            <option key={sub} value={sub}>
              r/{sub}
            </option>
          ))}
        </select>
      </div>

      <div className="filters-row">
        <label className="filter-label" htmlFor="filter-sortby">
          Sort by
        </label>
        <select
          id="filter-sortby"
          className="filter-select"
          value={filters.sortBy ?? "created_utc"}
          onChange={(e) =>
            update({ sortBy: e.target.value as SearchFilters["sortBy"] })
          }
        >
          <option value="created_utc">Date</option>
          <option value="score">Score</option>
          <option value="num_comments">Comments</option>
        </select>
      </div>

      <div className="filters-row">
        <label className="filter-label" htmlFor="filter-order">
          Order
        </label>
        <select
          id="filter-order"
          className="filter-select"
          value={filters.sortOrder ?? "desc"}
          onChange={(e) =>
            update({
              sortOrder: e.target.value as SearchFilters["sortOrder"],
            })
          }
        >
          <option value="desc">Newest / Highest</option>
          <option value="asc">Oldest / Lowest</option>
        </select>
      </div>
    </div>
  );
}
