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
        <span className="filter-label">Subreddit</span>
        <select
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
        <span className="filter-label">Min score</span>
        <input
          type="number"
          className="filter-input"
          placeholder="0"
          value={filters.minScore ?? ""}
          onChange={(e) =>
            update({
              minScore: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </div>

      <div className="filters-row">
        <span className="filter-label">Sort by</span>
        <select
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
        <span className="filter-label">Order</span>
        <select
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
