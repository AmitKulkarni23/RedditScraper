---
target: packages/web/app/page.tsx
total_score: 15
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-08-03T01-44-01Z
slug: packages-web-app-page-tsx
---
Method: dual-agent (A: design-review · B: detector-scan)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No data-freshness signal (6h lag invisible), no active-filter indicator near results |
| 2 | Match System / Real World | 1 | Copy and visuals mimic Reddit itself, not an archive tool; "explore" framing contradicts retrieval purpose |
| 3 | User Control and Freedom | 1 | No clear-filters, no cancel in-flight search, no URL state (can't bookmark/share/back-button searches) |
| 4 | Consistency and Standards | 3 | Internally consistent tokens and patterns; standard web form conventions |
| 5 | Error Prevention | 2 | Min-score input accepts negatives/garbage; no debounce on rapid submits; no abort controller for stale requests |
| 6 | Recognition Rather Than Recall | 2 | Must open dropdowns to recall current filter state; no active-filter summary near results |
| 7 | Flexibility and Efficiency | 0 | Zero keyboard shortcuts, no auto-apply filters, no saved searches, no deep-linking, no bulk pagination |
| 8 | Aesthetic and Minimalist Design | 3 | Clean single-column layout, restrained palette, decent whitespace — closest to passing |
| 9 | Error Recovery | 1 | Error banner shows raw message with no retry button; empty state gives no filter-specific guidance |
| 10 | Help and Documentation | 0 | Zero onboarding, tooltips, or explanation of what this tool is or how filters/lag work |
| **Total** | | **15/40** | **Poor** |

## Design Specificity Verdict

**LLM assessment**: This is a generic link-aggregator search UI wearing Reddit's literal brand color. Title "Reddit Scraper," subtitle "Search and explore posts from Reddit," `#ff4500` accent — every decision reads "small Reddit dashboard." Nothing communicates the actual purpose: a private archive for a small trusted group to find posts Reddit's own search makes hard to surface. The North Star ("quiet, archival, card catalog") is absent — no staleness indicator, no archive framing, no vocabulary distinguishing this from a live feed. The hardcoded `SUBREDDITS` constant and domain-specific placeholder examples ("deals, organic, employees") lock the UI to one deployment without serving the product principle of topic-agnosticism.

**Deterministic scan**: Detector returned **0 findings** across all 6 source files. CSS is clean — all colors via custom properties, single radius token, single shadow, no sprawl. This is plausible given DESIGN.md exists and CSS conforms token-for-token. However, the static scan cannot catch computed-style issues (contrast ratios, layout overflow, responsive breakpoints in practice). A live-URL scan (`npx impeccable detect http://localhost:3000`) would give fuller coverage.

## Overall Impression

Solid CSS craft, hollow product identity. The implementation faithfully follows DESIGN.md's token system — clean custom properties, correct dark mode, consistent spacing. But the *design itself* has no opinion about what this tool is. Strip the subreddit chips and this could be any search interface for any data. The biggest opportunity: make the UI actually embody "card catalog" — communicate archive identity, surface freshness, and serve the repeat-retrieval use case instead of mimicking a social feed.

## What's Working

1. **Token-faithful CSS system** — every color flows through custom properties, dark mode flips cleanly via `prefers-color-scheme`, single radius/shadow vocabulary. Detector confirmed zero drift from the design system.
2. **Post card scanning density** — 3-line body clamp, compact meta row, and 0.75rem gap create an efficient list for scanning many results. The information hierarchy within each card (subreddit → meta → title → body → stats) is logical.
3. **Responsive foundation** — filters stack below 640px, container is 960px centered, system font stack loads instantly. No layout-breaking edge cases in the CSS.

## Priority Issues

**[P0] No data-freshness signal anywhere**
- **Why it matters**: Product explicitly runs 6 hours behind Reddit. Users will search for recent posts, get nothing, and think the tool is broken. This is the #1 source of user confusion for an archive tool that looks like a live feed.
- **Fix**: Add a "Last scraped: X hours ago" indicator in the header or near the search bar. Surface per-post scrape timestamps. Empty-state message should mention lag as a possible cause.
- **Suggested command**: `/impeccable clarify`

**[P0] Hardcoded `SUBREDDITS` constant violates topic-agnosticism**
- **Why it matters**: `page.tsx:9` hardcodes `["wholefoods", "grocery", "Frugal"]`. The moment anyone reconfigures the scraper for different communities, the filter dropdown is wrong. SearchBar placeholder ("deals, organic, employees") compounds this with domain-specific examples.
- **Fix**: Fetch available subreddits from the API (distinct values from stored posts) or expose via environment/config. Remove domain-specific placeholder examples.
- **Suggested command**: `/impeccable harden`

**[P1] Filters require manual re-submit with no dirty-state cue**
- **Why it matters**: User changes subreddit dropdown or sort order → nothing happens → forgets to click Search → thinks the app is broken. No visual indicator that filters have changed and results are stale. Violates system-status visibility.
- **Fix**: Either auto-apply filters on change (with debounce), or show a visible "filters changed — click Search to update" indicator. Consider highlighting the Search button when filters are dirty.
- **Suggested command**: `/impeccable clarify`

**[P1] No URL state — searches are ephemeral**
- **Why it matters**: For a "find that post again" tool used by a small repeat-user group, inability to bookmark, share, or navigate search history via browser back/forward is a core workflow gap. Every visit starts from scratch.
- **Fix**: Sync query, filters, and page to URL search params. Use `useSearchParams` or `router.push` to persist state.
- **Suggested command**: `/impeccable harden`

**[P2] Error and empty states are dead ends**
- **Why it matters**: Error banner shows raw message text with no retry button. Empty state says "Try different search terms or filters" without specifying which filter is likely the problem or mentioning data lag. Casual, low-frequency users won't troubleshoot — they'll leave.
- **Fix**: Add retry button on error. Make empty state contextual: if min-score is set, suggest lowering it; if subreddit is filtered, suggest "All"; mention that data may lag Reddit by up to 6 hours.
- **Suggested command**: `/impeccable clarify`

## Persona Red Flags

**Alex (Power User)**: No keyboard shortcut to focus search (`/`). No `Enter` to paginate. Filters require a manual re-submit cycle — changing sort order forces click Search → wait → results reload at page 0, punishing iterative refinement. No saved or recent searches. No URL state means every session is a cold start. Previous/Next pagination with no page-jump for large result sets means many clicks to reach page 8.

**Jordan (First-Timer)**: Title "Reddit Scraper" and subtitle "Search and explore posts from Reddit" give zero orientation — is this live Reddit? An archive? A personal tool? Placeholder examples ("deals, organic, employees") are domain-specific holdovers that confuse anyone outside the original grocery use case. No help text on "Min score" (what does score mean? why would I set it?). Empty state offers no guided next step. No onboarding or explanation of the 6-hour lag.

**Riley (Stress Tester)**: Min-score `<input type="number">` accepts negative values, decimals, and absurdly large numbers with no validation. No `AbortController` on `fetchPosts` — rapid Search clicks create race conditions where a slow old request can overwrite newer results (classic stale-response bug). Error handler trusts `body.error` without type-checking. Empty `SUBREDDITS` array produces an empty dropdown with no fallback UI.

## Minor Observations

- `--accent: #ff4500` is literally Reddit's brand hex — undermines the "independent archive" identity; a slightly shifted ember would create distance.
- `timeAgo` in PostCard gives no absolute-date tooltip on hover — for an archive tool, exact timestamps ("March 14, 2026") matter more than "3d ago."
- No loading skeleton — full-panel spinner replaces content, causing layout shift between loading/loaded/empty states.
- Pagination scroll-to-top on page change is nice, but Previous doesn't restore scroll position — user loses their place.
- `layout.tsx` metadata title "Reddit Scraper" reinforces generic-tool feel in browser tab and link previews.
- One inline style in PostCard (`style={{ marginTop: "0.5rem" }}`) — trivial but breaks the class-only pattern.
