"use client";

import { forwardRef } from "react";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  loading: boolean;
  filtersDirty: boolean;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  function SearchBar({ query, onQueryChange, onSearch, loading, filtersDirty }, ref) {
    return (
      <form
        className="search-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
      >
        <input
          ref={ref}
          type="text"
          className="search-input"
          placeholder='Search archived posts… (press "/" to focus)'
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Search posts"
        />
        <button
          type="submit"
          className={`search-btn${filtersDirty ? " search-btn-dirty" : ""}`}
          disabled={loading}
        >
          {loading ? "Searching…" : filtersDirty ? "Update results" : "Search"}
        </button>
      </form>
    );
  }
);

export default SearchBar;
