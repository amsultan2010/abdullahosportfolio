# Fullscreen Bloomberg Terminal + About Me Plan

## Overview
When the terminal enters fullscreen, transform the layout into a Bloomberg-terminal-inspired dashboard with an About Me section on the left and a full market data + news feed on the right.

## Changes

### 1. Education card icons — stack vertically (ExperienceCard.tsx)
- Line 92: Change the logo container from horizontal `display: 'flex'` to `flexDirection: 'column'` so Waterloo + Laurier logos stack on top of each other instead of side-by-side.

### 2. Left panel — Add "About Me" section (DesktopShell.tsx)
- **Only visible in fullscreen mode** — appears in the open space between the hero text (name/title/bio) and the Quick Start tiles
- Content: A brief personal introduction paragraph drawing from what's known (software engineer, Waterloo/Laurier CS + Business, currently at Augmentor Labs, interested in systems engineering, quantitative work, fullstack development)
- Style: Subtle, readable text (`rgba(255,255,255,0.7)`, ~13px font), with a small "ABOUT" label above it matching the existing "QUICK START" / "EXPLORE" label style
- Keeps the existing fullscreen layout structure (hero at top, Quick Start + contact at bottom)

### 3. Right panel — Bloomberg-style market dashboard (DesktopShell.tsx)
Replace the current single `CyclingStock` ticker + `ExploreCommands` in fullscreen with:

#### 3a. Refactor CyclingStock to accept props
- Add `startOffset` prop — each of the 4 instances starts cycling from a different position in the stocks array (offsets 0, 1, 2, 3)
- Add `stocks` prop — pass fetched data in from parent so all 4 share one API call
- Add `compact` prop — smaller text/chart height for the grid layout
- Add logic: each instance skips stocks that overlap with other instances (modular offset ensures no two show the same stock at the same time)

#### 3b. 2x2 Stock Grid (fullscreen only)
- Replace the single CyclingStock with a `StockGrid` component
- 2x2 CSS grid, each cell is a compact CyclingStock with its own continuous line chart
- Each cell cycles through different stocks (offset by position in grid)
- Separated by subtle `rgba(255,255,255,0.06)` borders
- Compact layout: smaller font sizes, shorter chart height (~70px instead of 120px)

#### 3c. News Feed (fullscreen only)
- Move the news fetching + rendering logic from NotificationCenter into a standalone `NewsFeed` component (or inline in DesktopShell)
- Fetch from `/api/news` on mount
- Show below the stock grid with "TOP STORIES" header
- Same visual style as notification center (source color badges, time ago, title)
- Scrollable if content overflows

#### 3d. Layout structure (fullscreen right panel)
```
┌─────────────────────────┐
│ Date (top-right)        │
├────────────┬────────────┤
│ Stock 1    │ Stock 2    │
│ (chart)    │ (chart)    │
├────────────┼────────────┤
│ Stock 3    │ Stock 4    │
│ (chart)    │ (chart)    │
├────────────┴────────────┤
│ TOP STORIES             │
│ - News item 1           │
│ - News item 2           │
│ - News item 3...        │
├─────────────────────────┤
│ Terminal prompt          │
└─────────────────────────┘
```

### 4. Non-fullscreen mode — unchanged
The normal (non-fullscreen) terminal keeps its current layout: single CyclingStock + Explore commands on the right, hero + Quick Start on the left.

## Files Modified
1. `src/components/portfolio/ExperienceCard.tsx` — logo stacking
2. `src/components/desktop/DesktopShell.tsx` — About Me section, StockGrid, NewsFeed, fullscreen layout
3. No new files needed — everything stays inline in DesktopShell
