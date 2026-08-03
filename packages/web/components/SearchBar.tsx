"use client";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  loading: boolean;
  filtersDirty: boolean;
}

export default function SearchBar({
  query,
  onQueryChange,
  onSearch,
  loading,
  filtersDirty,
}: SearchBarProps) {
  return (
    <form
      className="search-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
    >
      <input
        type="text"
        className="search-input"
        placeholder="Search archived posts..."
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
