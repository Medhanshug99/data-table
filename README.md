# Art Institute of Chicago — Artworks Browser

A React + TypeScript + Vite application using PrimeReact DataTable to browse artworks from the Art Institute of Chicago API.

## Features

- **Server-side pagination** — fetches data per page, never all at once
- **Row selection** with checkboxes (individual rows and select-all on current page)
- **Persistent selection** across page navigation using an ID-based strategy
- **Custom N-row selection** via overlay panel — selects first N rows globally without prefetching other pages

## Selection Strategy

Selections persist across pages using three pieces of state:

| State | Purpose |
|-------|---------|
| `selectedIds: Set<number>` | Artwork IDs explicitly checked by the user |
| `deselectedIds: Set<number>` | IDs unchecked from within the auto-select range |
| `autoSelectCount: number` | "First N artworks globally are selected" |

When a page loads, a row is considered **selected** if:
- Its ID is in `selectedIds`, OR
- Its global index (across all pages) is `< autoSelectCount` AND its ID is NOT in `deselectedIds`

This means no other pages are ever prefetched — all selection logic is computed locally from IDs and indices.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

Upload the `dist/` folder to Netlify, Cloudflare Pages, or any static host.

## Tech Stack

- **Vite** + **TypeScript**
- **React 18**
- **PrimeReact DataTable**
- Art Institute of Chicago public API: `https://api.artic.edu/api/v1/artworks`
