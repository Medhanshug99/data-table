# 🎨 Art Institute of Chicago — Collection Browser

A React + TypeScript + Vite application that displays artworks from the Art Institute of Chicago public API using PrimeReact DataTable.

This project focuses on proper server-side pagination and persistent multi-page row selection without prefetching or storing unnecessary data.

---

## ✨ Features

- Server-side pagination (data fetched per page)
- Lazy loading using PrimeReact DataTable
- Checkbox-based row selection
- Select / deselect all rows on the current page
- Custom “Select First N Rows” overlay
- Persistent selection across page navigation
- ID-based selection logic (no mass data storage)

---

## 🧠 Selection Strategy

Selections persist across pages using three pieces of state:

| State | Purpose |
|-------|---------|
| `selectedIds: Set<number>` | Artwork IDs explicitly selected by the user |
| `deselectedIds: Set<number>` | IDs manually unchecked inside the auto-select range |
| `autoSelectCount: number` | Represents “First N artworks globally are selected” |

When a page loads, a row is considered selected if:

- Its ID exists in `selectedIds`, OR
- Its global index is `< autoSelectCount` AND its ID is NOT in `deselectedIds`

This approach ensures:

- No prefetching of additional pages
- No storage of other page data
- Clean, scalable selection logic
- Full compliance with server-side pagination requirements

---

## 🛠 Tech Stack

- React 18
- TypeScript
- Vite
- PrimeReact DataTable
- Art Institute of Chicago API  
  `https://api.artic.edu/api/v1/artworks`

---
