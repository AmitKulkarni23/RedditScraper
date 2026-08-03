---
name: Reddit Scraper
description: Quiet archival search over scraped Reddit communities
colors:
  ember-orange: "#ff4500"
  ember-deep: "#e03d00"
  fog-paper: "#fafafa"
  card-white: "#ffffff"
  ink: "#1a1a1a"
  graphite-muted: "#6b7280"
  hairline: "#e5e7eb"
  tag-wash: "#f3f4f6"
  error-red: "#dc2626"
  error-wash: "#fef2f2"
typography:
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    letterSpacing: "-0.02em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 500
rounded:
  md: "8px"
  pill: "99px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  2xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.ember-orange}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0.625rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.ember-deep}"
  button-page:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  input-search:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.625rem 0.875rem"
  chip-subreddit:
    backgroundColor: "{colors.tag-wash}"
    textColor: "{colors.ember-orange}"
    rounded: "{rounded.pill}"
    padding: "0.125rem 0.5rem"
  card-post:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "1rem 1.25rem"
---

# Design System: Reddit Scraper

## Overview

**Creative North Star: "The Card Catalog"**

A quiet archival tool. Surfaces are neutral paper — fog-white in light mode, near-black in dark — and structure comes from hairline borders, not shadows or color blocks. One warm accent, Ember Orange, marks what is alive: the search action, the community a post belongs to, the card under your cursor. Everything else stays out of the way so a visitor scanning hundreds of scraped posts can find the one they remember.

The system is deliberately small and system-native: system font stack, one radius, one shadow, one accent. Restraint is the identity — this is a retrieval tool for a handful of trusted users, not a feed competing for attention.

**Key Characteristics:**
- Neutral paper surfaces; single warm accent used sparingly
- Border-led structure; flat at rest
- System typography, compact scale (0.75–1.75rem)
- Automatic light/dark via `prefers-color-scheme` — every surface has a dark counterpart
- Density tuned for scanning lists, not lingering

## Colors

Neutral grays carry the interface; one ember accent signals action and identity.

### Primary
- **Ember Orange** (`--accent`): Reddit's historic orangered, used for the search button, subreddit chips' text, focused input borders, and hover states on cards, links, and pagination. It appears only where something is interactive or names a community.
- **Ember Deep** (`--accent-hover`): darkened ember for pressed/hover state of the primary button only.

### Neutral
- **Fog Paper** (`--bg`): page background. Dark mode: `#111111`.
- **Card White** (`--bg-card`, `--bg-input`): post cards, inputs, pagination buttons. Dark mode: `#1a1a1a` cards, `#222222` inputs.
- **Ink** (`--text`): primary text. Dark mode: `#e5e5e5`.
- **Graphite Muted** (`--text-muted`): metadata, placeholders, empty/loading states, clamped body excerpts. Dark mode: `#9ca3af`.
- **Hairline** (`--border`): all borders and the spinner track. Dark mode: `#333333`.
- **Tag Wash** (`--tag-bg`): subreddit chip background. Dark mode: `#2a2a2a`.

### Tertiary
- **Error Red** on **Error Wash**: error banner only. Dark mode: `#fca5a5` on `#2a1515`.

### Named Rules
**The One Ember Rule.** Ember Orange means "interactive or community identity." It never decorates static text, backgrounds, or headings. Its rarity is what makes hover states legible.

**The Variable Rule.** Every color is consumed through its CSS custom property, never a literal hex — that is what keeps automatic dark mode intact.

## Typography

**Body Font:** system stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`)

**Character:** Native and unassuming. The tool reads like part of the OS; no webfonts, no display face. Hierarchy comes from weight and muted color, not size jumps.

### Hierarchy
- **Headline** (700, 1.75rem, -0.02em tracking): page title only.
- **Title** (600, 1rem, 1.4): post titles in cards.
- **Body** (400, 0.95rem, 1.5): inputs, buttons, post excerpts (excerpts clamp to 3 lines).
- **Label** (500, 0.8rem): filter labels, metadata, results counts, subreddit chips, pagination, stats — always in Graphite Muted. Chips use 600 weight.

### Named Rules
**The Compact Scale Rule.** Four steps — 0.8, 0.95, 1, 1.75rem — no skips for drama; the scale stays tight so dense lists scan evenly.

## Layout

Single centered column, `max-width: 960px`, `2rem 1rem` padding. Vertical rhythm in rem steps: 0.75rem gaps between post cards, 1.5rem before pagination, 2rem under the header. Search bar and filters are flex rows with 0.5rem gaps; filters wrap, and below 640px they stack vertically with full-width controls. No grid, no sidebar — the list is the page.

## Elevation & Depth

Flat, border-led. The only shadow is a whisper (`0 1px 3px rgba(0,0,0,0.08)`, darker `0.3` alpha in dark mode) resting on post cards. Depth and interactivity are conveyed by borders warming to Ember Orange on hover/focus, never by lifting or scaling.

### Shadow Vocabulary
- **Whisper** (`box-shadow: 0 1px 3px rgba(0,0,0,0.08)`): post cards at rest. Nothing else casts a shadow.

### Named Rules
**The Border-Speaks Rule.** State changes announce themselves through border color (Hairline → Ember Orange), transitioned at 0.15s. No transforms, no shadow growth.

## Shapes

One soft radius (8px) on everything rectangular — cards, inputs, buttons, error banner. Subreddit chips are full pills (99px). The spinner is a 20px circle. Borders are always 1px Hairline. No sharp corners, no asymmetric radii, no clipping tricks.

## Components

### Buttons
- **Shape:** soft corners (8px)
- **Primary (Search):** Ember Orange fill, white 600-weight text, `0.625rem 1.25rem` padding; background darkens to Ember Deep on hover (0.15s); 0.6 opacity + `not-allowed` cursor when disabled.
- **Pagination:** Card White fill, Ink text, 1px Hairline border; border warms to Ember on hover; 0.4 opacity when disabled.

### Chips
- **Subreddit tag:** Tag Wash pill, Ember Orange 600-weight text at 0.8rem, `0.125rem 0.5rem` padding. Identity marker, not a button.

### Cards / Containers
- **Post card:** Card White, 1px Hairline border, 8px radius, Whisper shadow, `1rem 1.25rem` padding, 0.75rem list gap. Hover warms the border to Ember. Inside: 600-weight title (links inherit Ink, turn Ember on hover), muted 0.8rem meta row, 3-line-clamped muted excerpt.

### Inputs / Fields
- **Search input & filters:** Card White (input tint in dark mode), 1px Hairline border, 8px radius; border turns Ember on focus (no ring, no glow); muted placeholders. Filter controls use label size (0.8rem, `0.5rem 0.75rem`).

### Feedback states
- **Loading:** 4 skeleton cards with pulsing Hairline bars (short/long/medium widths), 1.5s ease-in-out pulse animation.
- **Empty:** centered title + contextual hint list (filter-specific suggestions, data-lag notice), 3rem padding.
- **Error:** Error Red text on Error Wash, 8px radius, centered, with a bordered retry button that fills on hover.
- **Freshness:** muted label-size text below subtitle showing last scrape time.

## Do's and Don'ts

### Do:
- **Do** route every color through its CSS custom property so dark mode stays automatic.
- **Do** signal hover/focus by warming borders to Ember Orange at 0.15s.
- **Do** keep new surfaces on the 8px radius and 1px Hairline border.
- **Do** keep metadata and secondary text in Graphite Muted at 0.8rem.
- **Do** keep the page a single 960px column.

### Don't:
- **Don't** use Ember Orange on static, non-interactive elements (chips excepted — they name communities).
- **Don't** add shadows beyond the Whisper, or transforms/scale on hover.
- **Don't** introduce webfonts or sizes outside the 0.8–1.75rem scale.
- **Don't** hardcode hex values in components; dark mode will break silently.
- **Don't** hardcode subreddit names into UI copy — the community list changes.
