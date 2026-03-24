# gamedevtools.dev

A collection of free browser-based tools for indie game developers. Monetised via display ads.
Built with React + Vite + Tailwind CSS.

## Stack

- React 18 + Vite
- Tailwind CSS v3
- React Router v6 (client-side routing)
- Recharts (for tool visualisations)
- Lucide React (SVG icons)
- Deployed on Vercel (static)
- No nanoid — use `crypto.randomUUID()` for IDs

## Structure

- `/` — Homepage with tool card grid
- `/tools/loot-table-simulator` — **BUILT** (`src/tools/LootTableSimulator.jsx`)
- `/tools/damage-formula-sandbox` — placeholder
- `/tools/xp-curve-designer` — placeholder
- `/tools/palette-generator` — placeholder
- `/tools/game-jam-ideas` — placeholder
- `/tools/sprite-sheet-slicer` — placeholder

Routing: `src/App.jsx` — specific tool routes are added before the generic `tools.map` placeholder route.

## UI/UX

Use the ui-ux-pro-max skill for all UI/UX work on this project. This includes:
- Designing new pages or components
- Choosing colors, typography, spacing, or layout
- Reviewing UI code for accessibility, responsiveness, or visual quality
- Adding animations, charts, or interactive elements
- Any change that affects how something looks, feels, or is interacted with

## Design System (ui-ux-pro-max generated)

- Style: Dark Mode (OLED) with neon glow accents
- Typography: Orbitron (headings) + JetBrains Mono (body/code)
- Colors: Gaming palette — accent #7C3AED (purple), secondary #F43F5E (rose), tertiary #10B981 (emerald), bg #0F0F23, card #1E1C35
- Icons: Lucide React (SVG only, no emojis)
- Effects: Neon glow (text-shadow + box-shadow), smooth transitions (150-300ms)
- Accessibility: WCAG AAA contrast, visible focus rings, prefers-reduced-motion respected, aria-labels on icon-only elements

### Rarity Colour System

| Rarity    | Colour  | Tailwind              | Default Weight |
|-----------|---------|-----------------------|----------------|
| Common    | Gray    | `text-slate-400`      | 60             |
| Uncommon  | Green   | `text-tertiary`       | 25             |
| Rare      | Blue    | `text-blue-400`       | 10             |
| Epic      | Purple  | `text-accent`         | 4              |
| Legendary | Amber   | `text-amber-400`      | 1              |

## Tool: Loot Table Simulator (`src/tools/LootTableSimulator.jsx`)

**Status: Production-ready. Day 3 (Monte Carlo simulation + charts) next.**

### Data Model Reference — LootItem schema

The core data structure. Lives in `useState` — no Redux, no Zustand needed.

```js
const defaultItem = {
  id: crypto.randomUUID(), // unique key for React list
  name: 'Gold Coin',       // string — item display name
  weight: 60,              // positive integer — relative drop weight
  rarity: 'common',        // 'common'|'uncommon'|'rare'|'epic'|'legendary'
  minQty: 1,               // integer >= 1
  maxQty: 1,               // integer >= minQty
}

// Derived value (not stored — computed on render)
const probability = (item.weight / totalWeight * 100).toFixed(2) + '%'

// Rarity weight defaults (auto-filled when rarity changes)
const RARITY_WEIGHTS = { common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 1 }
```

### What's built

- `LootItem` shape: `{ id, name, weight (int ≥1), rarity, minQty, maxQty }`
- 5 default items on load: Gold Coin, Silver Sword, Magic Staff, Dragon Scale, Ancient Relic
- Inline-editable table: name (text), weight (number), rarity (select), minQty, maxQty
- Live `%` probability per item (`weight / totalWeight * 100`, 2dp)
- **Rarity select auto-fills weight** with tier default when rarity changes (`setItemRarity`)
- Colour-coded rarity badges on select + summary panel
- Toolbar actions: **+ Add Item**, **Reset to Defaults**, **Clear All** (with inline confirmation — no browser dialog)
- **5 Load Preset buttons** above the table:
  - RPG Loot — 8 items, full tier spread
  - Chest Drop — 4 items (common/uncommon/rare)
  - Boss Drop — 3 items (rare/epic/legendary)
  - Currency Drop — 4 commons, varied quantities
  - Treasure Hoard — 5 items, uncommon → legendary
- Desktop: 2-col layout (items table + sticky summary sidebar)
- Mobile: 1-col stacked card layout with labelled fields
- Summary panel: item count, total weight, per-rarity probability bars, tier defaults legend

### Deferred to Day 3

- Monte Carlo simulation (run N drops, tally results)
- Recharts charts (bar/pie probability distribution)
- CSV + JSON export
