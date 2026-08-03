"use client";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  loading: boolean;
}

export default function SearchBar({
  query,
  onQueryChange,
  onSearch,
  loading,
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
        placeholder="Search posts... (e.g. deals, organic, employees)"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
      <button type="submit" className="search-btn" disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
