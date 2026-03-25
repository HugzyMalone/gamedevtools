import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, X, RotateCcw, Dices, ArrowLeft, ArrowRight,
  Trash2, Download, CheckCircle2, AlertCircle, Loader2, Play,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";
import { getRelatedTools } from "../tools";

const RARITIES = ["common", "uncommon", "rare", "epic", "legendary"];

// Default weight per rarity tier — choosing a rarity auto-fills this value
const RARITY_WEIGHTS = { common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 1 };

// Single-letter abbreviations used in the mobile rarity dot
const RARITY_ABBR = { common: "C", uncommon: "U", rare: "R", epic: "E", legendary: "L" };

const RARITY_CONFIG = {
  common:    { label: "Common",    badge: "bg-slate-400/10 text-slate-400 border-slate-400/30",  bar: "rgba(148,163,184,0.8)", dot: "#94A3B8" },
  uncommon:  { label: "Uncommon",  badge: "bg-tertiary/10 text-tertiary border-tertiary/30",     bar: "rgba(16,185,129,0.8)",  dot: "#10B981" },
  rare:      { label: "Rare",      badge: "bg-blue-400/10 text-blue-400 border-blue-400/30",     bar: "rgba(96,165,250,0.8)",  dot: "#60A5FA" },
  epic:      { label: "Epic",      badge: "bg-accent/10 text-accent border-accent/30",           bar: "rgba(124,58,237,0.8)", dot: "#7C3AED" },
  legendary: { label: "Legendary", badge: "bg-amber-400/10 text-amber-400 border-amber-400/30",  bar: "rgba(251,191,36,0.8)", dot: "#FBBF24" },
};

const SIM_SNAP_POINTS = [100, 500, 1000, 5000, 10000, 50000, 100000];
const SIM_CHUNK_SIZE = 10000; // process this many rolls per frame to avoid blocking UI

const RARITY_CHART_COLORS = {
  common:    "#64748b",
  uncommon:  "#10b981",
  rare:      "#3b82f6",
  epic:      "#8b5cf6",
  legendary: "#f59e0b",
};

const DEFAULT_ITEMS = [
  { name: "Gold Coin",     weight: 60, rarity: "common",    minQty: 10, maxQty: 50 },
  { name: "Silver Sword",  weight: 25, rarity: "uncommon",  minQty: 1,  maxQty: 1  },
  { name: "Magic Staff",   weight: 10, rarity: "rare",      minQty: 1,  maxQty: 1  },
  { name: "Dragon Scale",  weight: 4,  rarity: "epic",      minQty: 1,  maxQty: 1  },
  { name: "Ancient Relic", weight: 1,  rarity: "legendary", minQty: 1,  maxQty: 1  },
];

const TABLE_PRESETS = [
  {
    id: "rpg-loot",
    label: "RPG Loot",
    items: [
      { name: "Gold Coins",       rarity: "common",    minQty: 5,  maxQty: 20 },
      { name: "Health Potion",    rarity: "common",    minQty: 1,  maxQty: 2  },
      { name: "Rope",             rarity: "common",    minQty: 1,  maxQty: 1  },
      { name: "Iron Sword",       rarity: "uncommon",  minQty: 1,  maxQty: 1  },
      { name: "Leather Armor",    rarity: "uncommon",  minQty: 1,  maxQty: 1  },
      { name: "Steel Shield",     rarity: "rare",      minQty: 1,  maxQty: 1  },
      { name: "Enchanted Ring",   rarity: "epic",      minQty: 1,  maxQty: 1  },
      { name: "Legendary Scroll", rarity: "legendary", minQty: 1,  maxQty: 1  },
    ],
  },
  {
    id: "chest-drop",
    label: "Chest Drop",
    items: [
      { name: "Gold Coins",  rarity: "common",   minQty: 10, maxQty: 50 },
      { name: "Lockpick",    rarity: "common",   minQty: 1,  maxQty: 3  },
      { name: "Silver Key",  rarity: "uncommon", minQty: 1,  maxQty: 1  },
      { name: "Magic Gem",   rarity: "rare",     minQty: 1,  maxQty: 1  },
    ],
  },
  {
    id: "boss-drop",
    label: "Boss Drop",
    items: [
      { name: "Boss Crystal", rarity: "rare",      minQty: 1, maxQty: 1 },
      { name: "Dragon Heart", rarity: "epic",      minQty: 1, maxQty: 1 },
      { name: "Void Shard",   rarity: "legendary", minQty: 1, maxQty: 1 },
    ],
  },
  {
    id: "currency-drop",
    label: "Currency Drop",
    items: [
      { name: "Copper Coin", rarity: "common", minQty: 50, maxQty: 100 },
      { name: "Silver Coin", rarity: "common", minQty: 10, maxQty: 25  },
      { name: "Gold Coin",   rarity: "common", minQty: 1,  maxQty: 10  },
      { name: "Gem Shard",   rarity: "common", minQty: 1,  maxQty: 3   },
    ],
  },
  {
    id: "treasure-hoard",
    label: "Treasure Hoard",
    items: [
      { name: "Ancient Map",    rarity: "uncommon",  minQty: 1, maxQty: 1 },
      { name: "Mystic Ore",     rarity: "rare",      minQty: 1, maxQty: 3 },
      { name: "Runed Tablet",   rarity: "rare",      minQty: 1, maxQty: 1 },
      { name: "Shadow Crystal", rarity: "epic",      minQty: 1, maxQty: 1 },
      { name: "World Stone",    rarity: "legendary", minQty: 1, maxQty: 1 },
    ],
  },
];

function makeDefaults() {
  return DEFAULT_ITEMS.map((item) => ({ ...item, id: crypto.randomUUID() }));
}

function makePreset(preset) {
  return preset.items.map((item) => ({
    ...item,
    id: crypto.randomUUID(),
    weight: RARITY_WEIGHTS[item.rarity],
  }));
}

const INPUT_CLS =
  "w-full bg-dark border border-border/50 rounded-lg px-2.5 py-1.5 text-sm text-light placeholder-muted/40 focus:outline-none focus:ring-1 focus:ring-ring transition-colors duration-150";

export default function LootTableSimulator() {
  const [items, setItems] = useState(makeDefaults);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [weightDrafts, setWeightDrafts] = useState({});
  const [weightErrors, setWeightErrors] = useState(new Set());
  const relatedTools = getRelatedTools("loot-table-simulator");

  // ── Simulation state ──────────────────────────────────
  const [sampleSize, setSampleSize] = useState(10000);
  const [simResults, setSimResults] = useState(null);
  const [simRunning, setSimRunning] = useState(false);
  const [autoRerun, setAutoRerun] = useState(false);
  const simAbortRef = useRef(false);
  const chartsRef = useRef(null);

  // Set page title on mount, restore on unmount
  useEffect(() => {
    const prev = document.title;
    document.title = "Loot Table Simulator | Free Drop Rate Tool | Game Dev Tools";
    return () => { document.title = prev; };
  }, []);

  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0);
  const totalProb = totalWeight > 0
    ? items.reduce((sum, item) => sum + (item.weight / totalWeight) * 100, 0)
    : 0;
  const probVerified = totalWeight > 0 && Math.abs(totalProb - 100) < 0.01;

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", weight: RARITY_WEIGHTS.common, rarity: "common", minQty: 1, maxQty: 1 },
    ]);
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setWeightDrafts((prev) => { const { [id]: _, ...rest } = prev; return rest; });
    setWeightErrors((prev) => { const s = new Set(prev); s.delete(id); return s; });
  }

  function updateItem(id, field, value) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  // Selecting a rarity auto-fills weight with the tier default and clears any weight error
  function setItemRarity(id, rarity) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, rarity, weight: RARITY_WEIGHTS[rarity] } : item
      )
    );
    setWeightDrafts((prev) => { const { [id]: _, ...rest } = prev; return rest; });
    setWeightErrors((prev) => { const s = new Set(prev); s.delete(id); return s; });
  }

  function handleWeightChange(id, raw) {
    setWeightDrafts((prev) => ({ ...prev, [id]: raw }));
    const n = parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 1) {
      updateItem(id, "weight", n);
      setWeightErrors((prev) => { const s = new Set(prev); s.delete(id); return s; });
    } else {
      setWeightErrors((prev) => new Set([...prev, id]));
    }
  }

  function handleWeightBlur(id) {
    setWeightDrafts((prev) => { const { [id]: _, ...rest } = prev; return rest; });
    setWeightErrors((prev) => { const s = new Set(prev); s.delete(id); return s; });
  }

  function parsePositiveInt(raw, fallback = 1) {
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 1 ? n : fallback;
  }

  function clearAll() {
    setItems([]);
    setConfirmingClear(false);
    setWeightDrafts({});
    setWeightErrors(new Set());
  }

  function resetToDefaults() {
    setItems(makeDefaults());
    setConfirmingClear(false);
    setWeightDrafts({});
    setWeightErrors(new Set());
  }

  function loadPreset(preset) {
    setItems(makePreset(preset));
    setWeightDrafts({});
    setWeightErrors(new Set());
  }

  function exportJSON() {
    const data = items.map((item) => ({
      id: item.id,
      name: item.name,
      weight: item.weight,
      rarity: item.rarity,
      minQty: item.minQty,
      maxQty: item.maxQty,
      prob: totalWeight > 0 ? parseFloat(((item.weight / totalWeight) * 100).toFixed(2)) : 0,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "loot-table.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const rarityStats = RARITIES.map((rarity) => {
    const w = items.filter((i) => i.rarity === rarity).reduce((s, i) => s + (i.weight || 0), 0);
    const pct = totalWeight > 0 ? (w / totalWeight) * 100 : 0;
    return { rarity, pct };
  }).filter((s) => s.pct > 0);

  // Snap slider value to nearest snap point
  function snapSampleSize(raw) {
    let closest = SIM_SNAP_POINTS[0];
    let minDist = Math.abs(raw - closest);
    for (const sp of SIM_SNAP_POINTS) {
      const dist = Math.abs(raw - sp);
      if (dist < minDist) { closest = sp; minDist = dist; }
    }
    return closest;
  }

  // Monte Carlo simulation — chunked via setTimeout to avoid blocking UI
  const runSimulation = useCallback(() => {
    if (items.length === 0 || totalWeight === 0) return;
    simAbortRef.current = false;
    setSimRunning(true);

    // Build cumulative weight array for weighted selection
    const cumWeights = [];
    let cumSum = 0;
    for (const item of items) {
      cumSum += item.weight;
      cumWeights.push(cumSum);
    }

    // Results accumulator
    const hits = new Map();
    const totalQty = new Map();
    for (const item of items) {
      hits.set(item.id, 0);
      totalQty.set(item.id, 0);
    }

    let processed = 0;
    const n = sampleSize;

    function processChunk() {
      if (simAbortRef.current) { setSimRunning(false); return; }

      const end = Math.min(processed + SIM_CHUNK_SIZE, n);
      for (let i = processed; i < end; i++) {
        const roll = Math.random() * totalWeight;
        // Binary search for the selected item
        let lo = 0, hi = cumWeights.length - 1;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (cumWeights[mid] <= roll) lo = mid + 1;
          else hi = mid;
        }
        const selected = items[lo];
        hits.set(selected.id, hits.get(selected.id) + 1);
        // Roll random quantity between minQty and maxQty
        const qty = selected.minQty === selected.maxQty
          ? selected.minQty
          : selected.minQty + Math.floor(Math.random() * (selected.maxQty - selected.minQty + 1));
        totalQty.set(selected.id, totalQty.get(selected.id) + qty);
      }
      processed = end;

      if (processed < n) {
        setTimeout(processChunk, 0);
      } else {
        // Build results
        const results = items.map((item) => ({
          itemId: item.id,
          name: item.name,
          rarity: item.rarity,
          weight: item.weight,
          minQty: item.minQty,
          maxQty: item.maxQty,
          hits: hits.get(item.id),
          totalQty: totalQty.get(item.id),
          actualPct: (hits.get(item.id) / n) * 100,
          expectedPct: (item.weight / totalWeight) * 100,
        }));
        const uniqueHits = results.filter((r) => r.hits > 0).length;
        setSimResults({ n, uniqueHits, results });
        setSimRunning(false);
        // Smooth scroll to charts
        requestAnimationFrame(() => {
          chartsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }

    setTimeout(processChunk, 0);
  }, [items, totalWeight, sampleSize]);

  // Auto-rerun when table changes (if enabled and table is non-empty)
  useEffect(() => {
    if (!autoRerun || items.length === 0 || totalWeight === 0) return;
    // Abort any running sim first
    simAbortRef.current = true;
    const timer = setTimeout(() => runSimulation(), 50);
    return () => { clearTimeout(timer); simAbortRef.current = true; };
  }, [autoRerun, items, totalWeight, runSimulation]);

  const canRunSim = items.length > 0 && totalWeight > 0 && !simRunning;

  function exportCSV() {
    if (!simResults) return;
    const header = ["Name", "Rarity", "Weight", "Expected%", "Actual%", "Hits", "TotalQty", "MinQty", "MaxQty"];
    const rows = simResults.results.map((r) => [
      `"${r.name.replace(/"/g, '""')}"`,
      r.rarity,
      r.weight,
      r.expectedPct.toFixed(2),
      r.actualPct.toFixed(2),
      r.hits,
      r.totalQty,
      r.minQty,
      r.maxQty,
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "simulation-results.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Derived stats for the summary panel
  const simStats = simResults ? (() => {
    const withHits = simResults.results.filter((r) => r.hits > 0);
    if (withHits.length === 0) return null;
    const rarest = withHits.reduce((a, b) =>
      (RARITIES.indexOf(b.rarity) > RARITIES.indexOf(a.rarity) ? b : a));
    const mostCommon = withHits.reduce((a, b) => (b.hits > a.hits ? b : a));
    const largestDev = simResults.results.reduce((a, b) =>
      Math.abs(b.actualPct - b.expectedPct) > Math.abs(a.actualPct - a.expectedPct) ? b : a);
    return { rarest, mostCommon, largestDev };
  })() : null;

  return (
    <div className="py-6 sm:py-10">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 shadow-glow">
          <Dices className="w-6 h-6 text-accent" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-light mb-2">
            Loot Table / Drop Rate Simulator
          </h1>
          <p className="text-muted text-sm leading-relaxed max-w-xl">
            Build a weighted drop table by assigning each item a weight and quantity range — the
            higher an item's weight relative to the total, the more likely it is to drop.
            Probabilities update live as you edit, and you can export your finished table as JSON.
          </p>
        </div>
      </div>

      {/* ── 2-col layout ───────────────────────────────────── */}
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_288px] gap-6">

        {/* LEFT — items list */}
        <section aria-label="Loot items">

          {/* Preset buttons */}
          <div className="mb-5">
            <p className="text-xs font-heading font-bold text-muted uppercase tracking-widest mb-2.5">
              Load Preset
            </p>
            <div className="flex gap-2 flex-wrap">
              {TABLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => loadPreset(preset)}
                  className="inline-flex items-center px-3 py-2 min-h-[44px] text-xs font-medium text-muted border border-border/40 rounded-lg hover:text-light hover:border-accent/50 hover:bg-accent/5 transition-all duration-150 cursor-pointer whitespace-nowrap"
                  aria-label={`Load ${preset.label} preset`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <h2 className="text-xs font-heading font-bold text-muted uppercase tracking-widest">
              Items ({items.length})
            </h2>
            <div className="flex items-center gap-2 flex-wrap">

              {/* Export JSON */}
              <button
                onClick={exportJSON}
                disabled={items.length === 0}
                className="inline-flex items-center gap-1.5 px-3 min-h-[44px] text-xs font-medium text-muted border border-border/50 rounded-lg hover:text-tertiary hover:border-tertiary/40 transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Export loot table as JSON file"
              >
                <Download className="w-3 h-3" aria-hidden="true" />
                Export JSON
              </button>

              {/* Export CSV */}
              <button
                onClick={exportCSV}
                disabled={!simResults}
                className="inline-flex items-center gap-1.5 px-3 min-h-[44px] text-xs font-medium text-muted border border-border/50 rounded-lg hover:text-tertiary hover:border-tertiary/40 transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Export simulation results as CSV file"
                title={!simResults ? "Run a simulation first" : "Export simulation results as CSV"}
              >
                <Download className="w-3 h-3" aria-hidden="true" />
                Export CSV
              </button>

              {/* Clear All — inline confirmation */}
              {confirmingClear ? (
                <div className="flex items-center gap-1.5" role="group" aria-label="Confirm clear all items">
                  <span className="text-xs text-secondary">Clear all?</span>
                  <button
                    onClick={() => setConfirmingClear(false)}
                    className="px-2.5 min-h-[44px] text-xs font-medium text-muted border border-border/50 rounded-lg hover:text-light transition-colors duration-150 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={clearAll}
                    className="px-2.5 min-h-[44px] text-xs font-medium text-white bg-secondary/80 rounded-lg hover:bg-secondary transition-colors duration-150 cursor-pointer"
                  >
                    Confirm
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingClear(true)}
                  disabled={items.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 min-h-[44px] text-xs font-medium text-muted border border-border/50 rounded-lg hover:text-secondary hover:border-secondary/40 transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Clear all items"
                >
                  <Trash2 className="w-3 h-3" aria-hidden="true" />
                  Clear
                </button>
              )}

              <button
                onClick={resetToDefaults}
                className="inline-flex items-center gap-1.5 px-3 min-h-[44px] text-xs font-medium text-muted border border-border/50 rounded-lg hover:text-light hover:border-border transition-colors duration-150 cursor-pointer"
                aria-label="Reset to default items"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                Reset
              </button>

              <button
                onClick={addItem}
                className="inline-flex items-center gap-1.5 px-3 min-h-[44px] text-xs font-medium text-dark bg-accent rounded-lg hover:bg-accent/90 shadow-glow transition-all duration-150 cursor-pointer"
                aria-label="Add new loot item"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                Add Item
              </button>
            </div>
          </div>

          {/* Column headers — desktop only, with Weight tooltip */}
          {items.length > 0 && (
            <div
              className="hidden md:grid gap-2 px-3 mb-2"
              style={{ gridTemplateColumns: "1fr 72px 148px 64px 64px 60px 40px" }}
            >
              {/* Name */}
              <span className="text-xs font-medium text-muted/50 uppercase tracking-wider">Name</span>

              {/* Weight — with inline tooltip */}
              <div className="group/wt relative flex items-center gap-1">
                <span className="text-xs font-medium text-muted/50 uppercase tracking-wider">Weight</span>
                <button
                  type="button"
                  className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-muted/15 text-muted/50 text-[9px] font-bold leading-none hover:bg-accent/20 hover:text-accent focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer transition-colors duration-150 shrink-0"
                  aria-label="How weights work"
                >
                  ?
                </button>
                {/* Tooltip — shows on hover or focus-within the parent group */}
                <div
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-0 mb-2.5 w-60 px-3 py-2.5 bg-[#0F0F23] border border-white/10 rounded-xl text-xs leading-relaxed shadow-xl z-20 opacity-0 group-hover/wt:opacity-100 group-focus-within/wt:opacity-100 transition-opacity duration-150"
                >
                  <p className="font-medium text-light mb-1">Relative weights</p>
                  <p className="text-muted">
                    An item with weight&nbsp;2 drops twice as often as one with weight&nbsp;1.
                    Only the ratios matter — the total can be any value.
                  </p>
                  {/* Caret */}
                  <span className="absolute top-full left-4 block w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-white/10" aria-hidden="true" />
                </div>
              </div>

              {/* Remaining headers */}
              {["Rarity", "Min", "Max", "Chance", ""].map((h) => (
                <span key={h} className="text-xs font-medium text-muted/50 uppercase tracking-wider">
                  {h}
                </span>
              ))}
            </div>
          )}

          {/* ── Item rows ──────────────────────────────────── */}
          <div className="space-y-2" role="list" aria-label="Loot table items">

            {/* Empty state */}
            {items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border/40 bg-card/50 p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Dices className="w-7 h-7 text-accent/60" aria-hidden="true" />
                </div>
                <h3 className="text-base font-heading font-bold text-light mb-1.5">No items yet</h3>
                <p className="text-sm text-muted mb-6 max-w-xs mx-auto">
                  Add items to start building your loot table, or load one of the presets above.
                </p>
                <button
                  onClick={addItem}
                  className="inline-flex items-center gap-2 px-5 min-h-[44px] text-sm font-medium text-dark bg-accent rounded-xl hover:bg-accent/90 shadow-glow transition-all duration-150 cursor-pointer"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Add Your First Item
                </button>
              </div>
            )}

            {items.map((item) => {
              const pct = totalWeight > 0 ? (item.weight / totalWeight) * 100 : 0;
              const { badge, label: rarityLabel, dot } = RARITY_CONFIG[item.rarity] ?? RARITY_CONFIG.common;
              const hasWeightError = weightErrors.has(item.id);
              const hasMaxQtyError = item.maxQty < item.minQty;

              return (
                <div
                  key={item.id}
                  role="listitem"
                  className="rounded-xl border border-white/[0.06] bg-card px-3 py-3 hover:border-accent/20 transition-colors duration-150"
                >
                  {/* ── Desktop row ───────────────────────────── */}
                  <div
                    className="hidden md:grid gap-2 items-center"
                    style={{ gridTemplateColumns: "1fr 72px 148px 64px 64px 60px 40px" }}
                  >
                    <input
                      id={`name-${item.id}`}
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, "name", e.target.value)}
                      placeholder="Item name…"
                      aria-label="Item name"
                      className={INPUT_CLS}
                    />
                    <input
                      type="number"
                      value={weightDrafts[item.id] ?? String(item.weight)}
                      min={1}
                      onChange={(e) => handleWeightChange(item.id, e.target.value)}
                      onBlur={() => handleWeightBlur(item.id)}
                      aria-label="Drop weight (higher = more likely to drop)"
                      aria-invalid={hasWeightError}
                      className={`${INPUT_CLS} text-center ${hasWeightError ? "!border-red-500 focus:!ring-red-500" : ""}`}
                    />
                    {/* Rarity select — colour-coded + text label satisfies non-colour accessibility */}
                    <select
                      value={item.rarity}
                      onChange={(e) => setItemRarity(item.id, e.target.value)}
                      aria-label={`Rarity: ${rarityLabel} (auto-fills weight with tier default)`}
                      className={`w-full appearance-none bg-dark border rounded-lg px-2.5 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer transition-colors duration-150 ${badge}`}
                    >
                      {RARITIES.map((r) => (
                        <option key={r} value={r} className="bg-card text-light">
                          {RARITY_CONFIG[r].label} (w{RARITY_WEIGHTS[r]})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={item.minQty}
                      min={1}
                      onChange={(e) => updateItem(item.id, "minQty", parsePositiveInt(e.target.value))}
                      aria-label="Minimum drop quantity"
                      className={`${INPUT_CLS} text-center ${hasMaxQtyError ? "!border-red-500 focus:!ring-red-500" : ""}`}
                    />
                    <input
                      type="number"
                      value={item.maxQty}
                      min={1}
                      onChange={(e) => updateItem(item.id, "maxQty", parsePositiveInt(e.target.value))}
                      aria-label="Maximum drop quantity"
                      aria-invalid={hasMaxQtyError}
                      className={`${INPUT_CLS} text-center ${hasMaxQtyError ? "!border-red-500 focus:!ring-red-500" : ""}`}
                    />
                    <span
                      className="text-sm font-medium text-tertiary tabular-nums text-right"
                      aria-label={`Drop chance: ${pct.toFixed(2)}%`}
                    >
                      {pct.toFixed(2)}%
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-secondary hover:bg-secondary/10 transition-colors duration-150 cursor-pointer ml-auto"
                      aria-label={`Remove ${item.name || "unnamed item"}`}
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Desktop validation errors */}
                  {(hasWeightError || hasMaxQtyError) && (
                    <div className="hidden md:flex items-center gap-4 mt-1.5 text-xs text-red-400">
                      {hasWeightError && (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" aria-hidden="true" />
                          Weight must be ≥ 1
                        </span>
                      )}
                      {hasMaxQtyError && (
                        <span className="flex items-center gap-1 ml-auto mr-[104px]">
                          <AlertCircle className="w-3 h-3" aria-hidden="true" />
                          Max qty must be ≥ Min qty
                        </span>
                      )}
                    </div>
                  )}

                  {/* ── Mobile card ───────────────────────────── */}
                  <div className="md:hidden space-y-2.5">

                    {/* Row 1: name + % + delete */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        placeholder="Item name…"
                        aria-label="Item name"
                        className={`${INPUT_CLS} flex-1`}
                      />
                      <span
                        className="text-sm font-medium text-tertiary tabular-nums whitespace-nowrap"
                        aria-label={`Drop chance: ${pct.toFixed(2)}%`}
                      >
                        {pct.toFixed(2)}%
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex items-center justify-center w-11 h-11 rounded-lg text-muted hover:text-secondary hover:bg-secondary/10 transition-colors duration-150 cursor-pointer shrink-0"
                        aria-label={`Remove ${item.name || "unnamed item"}`}
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Row 2: Weight | Rarity dot | Qty (min–max) */}
                    <div className="grid grid-cols-[80px_52px_1fr] gap-2 items-end">

                      {/* Weight */}
                      <div>
                        <label
                          htmlFor={`mob-weight-${item.id}`}
                          className="text-xs text-muted/50 mb-1 block"
                        >
                          Weight
                        </label>
                        <input
                          id={`mob-weight-${item.id}`}
                          type="number"
                          value={weightDrafts[item.id] ?? String(item.weight)}
                          min={1}
                          onChange={(e) => handleWeightChange(item.id, e.target.value)}
                          onBlur={() => handleWeightBlur(item.id)}
                          aria-label="Drop weight (higher = more likely to drop)"
                          aria-invalid={hasWeightError}
                          title="Higher weight = more likely to drop. Weights are relative."
                          className={`${INPUT_CLS} text-center ${hasWeightError ? "!border-red-500 focus:!ring-red-500" : ""}`}
                        />
                      </div>

                      {/* Rarity — colour dot with letter abbreviation + invisible select for interaction */}
                      <div>
                        <label className="text-xs text-muted/50 mb-1 block">Rarity</label>
                        <div
                          className="relative flex items-center justify-center"
                          style={{ height: "38px" }}
                        >
                          {/* Visual: coloured circle with single-letter abbreviation */}
                          <span
                            className="flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold text-white shadow-sm"
                            style={{ backgroundColor: dot }}
                            aria-hidden="true"
                            title={rarityLabel}
                          >
                            {RARITY_ABBR[item.rarity]}
                          </span>
                          {/* Invisible select overlay — handles interaction and screen reader access */}
                          <select
                            value={item.rarity}
                            onChange={(e) => setItemRarity(item.id, e.target.value)}
                            aria-label={`Rarity: ${rarityLabel}`}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          >
                            {RARITIES.map((r) => (
                              <option key={r} value={r}>
                                {RARITY_CONFIG[r].label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Qty — min and max side by side, labelled as one column */}
                      <div>
                        <label className="text-xs text-muted/50 mb-1 block">
                          Qty
                          {hasMaxQtyError && (
                            <span className="ml-1 text-red-400" aria-live="polite">
                              (max ≥ min)
                            </span>
                          )}
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={item.minQty}
                            min={1}
                            onChange={(e) => updateItem(item.id, "minQty", parsePositiveInt(e.target.value))}
                            aria-label="Minimum drop quantity"
                            className={`${INPUT_CLS} flex-1 min-w-0 text-center px-1 ${hasMaxQtyError ? "!border-red-500 focus:!ring-red-500" : ""}`}
                          />
                          <span className="text-muted text-xs shrink-0" aria-hidden="true">–</span>
                          <input
                            type="number"
                            value={item.maxQty}
                            min={1}
                            onChange={(e) => updateItem(item.id, "maxQty", parsePositiveInt(e.target.value))}
                            aria-label="Maximum drop quantity"
                            aria-invalid={hasMaxQtyError}
                            className={`${INPUT_CLS} flex-1 min-w-0 text-center px-1 ${hasMaxQtyError ? "!border-red-500 focus:!ring-red-500" : ""}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mobile validation errors */}
                    {hasWeightError && (
                      <p className="flex items-center gap-1 text-xs text-red-400" role="alert">
                        <AlertCircle className="w-3 h-3" aria-hidden="true" />
                        Weight must be ≥ 1
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Summary footer row ─────────────────────────── */}
          {items.length > 0 && (
            <div
              className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-xl border border-white/[0.06] bg-card/40 px-4 py-2.5 text-xs"
              aria-label="Table summary"
            >
              <span className="text-muted">
                <span className="text-light font-medium tabular-nums">{items.length}</span>
                {" "}{items.length === 1 ? "item" : "items"}
              </span>
              <span className="text-muted">
                Total weight:{" "}
                <span className="text-light font-medium tabular-nums">{totalWeight}</span>
              </span>
              <span className="ml-auto flex items-center gap-1.5">
                {probVerified ? (
                  <>
                    <span className="text-tertiary font-medium tabular-nums">{totalProb.toFixed(2)}%</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-tertiary" aria-hidden="true" />
                    <span className="text-tertiary">verified</span>
                  </>
                ) : totalWeight === 0 ? (
                  <span className="text-muted">No weight set</span>
                ) : (
                  <>
                    <span className="text-secondary font-medium tabular-nums">{totalProb.toFixed(2)}%</span>
                    <AlertCircle className="w-3.5 h-3.5 text-secondary" aria-hidden="true" />
                    <span className="text-secondary">check weights</span>
                  </>
                )}
              </span>
            </div>
          )}
        </section>

        {/* ── Simulation section ─────────────────────────── */}
        <section aria-label="Simulation" className="lg:col-span-2 mt-2">
          <div className="rounded-2xl border border-white/[0.06] bg-card p-5">
            <h2 className="text-xs font-heading font-bold text-muted uppercase tracking-widest mb-4">
              Simulation
            </h2>

            {/* Controls row */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
              {/* Sample size slider */}
              <div className="flex-1 max-w-md">
                <label htmlFor="sim-sample-size" className="text-sm text-muted mb-1.5 block">
                  Sample size:{" "}
                  <span className="text-light font-medium tabular-nums">
                    {sampleSize.toLocaleString()}
                  </span>
                </label>
                <input
                  id="sim-sample-size"
                  type="range"
                  min={0}
                  max={SIM_SNAP_POINTS.length - 1}
                  step={1}
                  value={SIM_SNAP_POINTS.indexOf(sampleSize)}
                  onChange={(e) => setSampleSize(SIM_SNAP_POINTS[Number(e.target.value)])}
                  className="w-full h-2 rounded-full appearance-none bg-white/[0.06] accent-accent cursor-pointer"
                  aria-label={`Sample size: ${sampleSize.toLocaleString()}`}
                />
                <div className="flex justify-between mt-1">
                  {SIM_SNAP_POINTS.map((sp) => (
                    <span
                      key={sp}
                      className={`text-[10px] tabular-nums ${sp === sampleSize ? "text-accent font-medium" : "text-muted/40"}`}
                    >
                      {sp >= 1000 ? `${sp / 1000}k` : sp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Run button */}
              <button
                onClick={runSimulation}
                disabled={!canRunSim}
                className="inline-flex items-center gap-2 px-5 min-h-[44px] text-sm font-medium text-dark bg-accent rounded-xl hover:bg-accent/90 shadow-glow transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none shrink-0"
                aria-label={simRunning ? "Simulation in progress" : "Run simulation"}
              >
                {simRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Running…
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" aria-hidden="true" />
                    Run Simulation
                  </>
                )}
              </button>
            </div>

            {/* Auto-rerun + helpers row */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <label className="inline-flex items-center gap-2 text-sm text-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoRerun}
                  onChange={(e) => setAutoRerun(e.target.checked)}
                  className="w-4 h-4 rounded border-border/50 bg-dark accent-accent cursor-pointer"
                />
                Auto-rerun when table changes
              </label>
              {sampleSize >= 50000 && (
                <span className="text-xs text-amber-400/80 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  This may take a moment…
                </span>
              )}
            </div>

            {/* Empty table message */}
            {items.length === 0 && (
              <p className="text-sm text-muted/60 italic">
                Add items to the loot table to run a simulation.
              </p>
            )}

            {/* Stats summary + charts */}
            {simResults && !simRunning && (
              <>
                {/* Text summary */}
                <div className="mt-2 rounded-xl border border-white/[0.06] bg-dark/50 px-4 py-3">
                  <p className="text-sm text-light">
                    Simulated{" "}
                    <span className="font-medium text-accent tabular-nums">
                      {simResults.n.toLocaleString()}
                    </span>{" "}
                    drops.{" "}
                    <span className="font-medium text-tertiary tabular-nums">
                      {simResults.uniqueHits}
                    </span>{" "}
                    unique {simResults.uniqueHits === 1 ? "item" : "items"} hit.
                  </p>
                </div>

                {/* Stats cards */}
                {simStats && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      {
                        label: "Total Rolls",
                        value: simResults.n.toLocaleString(),
                        color: "text-accent",
                      },
                      {
                        label: "Unique Items Hit",
                        value: `${simResults.uniqueHits} / ${simResults.results.length}`,
                        color: "text-tertiary",
                      },
                      {
                        label: "Rarest Item Hit",
                        value: simStats.rarest.name || "—",
                        sub: `${simStats.rarest.actualPct.toFixed(2)}%`,
                        color: RARITY_CHART_COLORS[simStats.rarest.rarity] || "text-light",
                        colorInline: true,
                      },
                      {
                        label: "Most Common Hit",
                        value: simStats.mostCommon.name || "—",
                        sub: `${simStats.mostCommon.actualPct.toFixed(2)}%`,
                        color: RARITY_CHART_COLORS[simStats.mostCommon.rarity] || "text-light",
                        colorInline: true,
                      },
                      {
                        label: "Largest Deviation",
                        value: simStats.largestDev.name || "—",
                        sub: `exp ${simStats.largestDev.expectedPct.toFixed(1)}% vs act ${simStats.largestDev.actualPct.toFixed(1)}%`,
                        color: "text-secondary",
                      },
                    ].map(({ label, value, sub, color, colorInline }) => (
                      <div
                        key={label}
                        className="rounded-xl border border-white/[0.06] bg-dark/60 px-4 py-3 transition-all duration-300"
                      >
                        <p className="text-[10px] font-heading font-bold text-muted uppercase tracking-widest mb-1">
                          {label}
                        </p>
                        <p
                          className="text-sm font-medium leading-snug truncate transition-colors duration-300"
                          style={colorInline ? { color } : undefined}
                          {...(!colorInline ? { className: `text-sm font-medium leading-snug truncate transition-colors duration-300 ${color}` } : {})}
                        >
                          {value}
                        </p>
                        {sub && (
                          <p className="text-xs text-muted/60 tabular-nums mt-0.5 transition-all duration-300">
                            {sub}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Charts: bar + pie side by side ───────────── */}
                <div className="mt-5 flex flex-col md:flex-row gap-6">

                  {/* Bar chart */}
                  <div className="flex-1 min-w-0" ref={chartsRef}>
                    <p className="text-xs font-heading font-bold text-muted uppercase tracking-widest mb-3">
                      Drop Rate Distribution
                    </p>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={simResults.results.map((r) => ({
                          name: r.name.length > 12 ? r.name.slice(0, 12) + "…" : r.name,
                          fullName: r.name,
                          expected: parseFloat(r.expectedPct.toFixed(2)),
                          actual: parseFloat(r.actualPct.toFixed(2)),
                          hits: r.hits,
                          rarity: r.rarity,
                        }))}
                        margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#94A3B8", fontSize: 12 }}
                          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, (dataMax) => {
                            // Auto-scale: if all values are below 30%, don't hard-cap at 100
                            const maxExpected = Math.max(...simResults.results.map((r) => r.expectedPct));
                            const maxActual = Math.max(...simResults.results.map((r) => r.actualPct));
                            const cap = Math.max(maxExpected, maxActual, dataMax);
                            return cap > 30 ? 100 : Math.ceil(cap * 1.2);
                          }]}
                          tick={{ fill: "#94A3B8", fontSize: 12 }}
                          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                          tickLine={false}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1E1C35",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            fontSize: "13px",
                          }}
                          labelStyle={{ color: "#E2E8F0", fontWeight: 600, marginBottom: 4 }}
                          itemStyle={{ padding: 0 }}
                          formatter={(value, dataKey) => [
                            `${value}%`,
                            dataKey === "expected" ? "Expected" : "Actual",
                          ]}
                          labelFormatter={(_, payload) => {
                            if (!payload?.[0]) return "";
                            const d = payload[0].payload;
                            return `${d.fullName} — ${d.hits.toLocaleString()} hits`;
                          }}
                          cursor={{ fill: "rgba(124,58,237,0.08)" }}
                        />
                        <Legend
                          formatter={(value) => (
                            <span style={{ color: "#94A3B8", fontSize: 12 }}>
                              {value === "expected" ? "Expected" : "Actual"}
                            </span>
                          )}
                        />
                        <Bar dataKey="expected" name="expected" radius={[4, 4, 0, 0]}>
                          {simResults.results.map((r) => (
                            <Cell
                              key={r.itemId}
                              fill={RARITY_CHART_COLORS[r.rarity] || RARITY_CHART_COLORS.common}
                              fillOpacity={0.35}
                            />
                          ))}
                        </Bar>
                        <Bar dataKey="actual" name="actual" radius={[4, 4, 0, 0]}>
                          {simResults.results.map((r) => (
                            <Cell
                              key={r.itemId}
                              fill={RARITY_CHART_COLORS[r.rarity] || RARITY_CHART_COLORS.common}
                              fillOpacity={1}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pie chart */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-heading font-bold text-muted uppercase tracking-widest mb-3">
                      Drop Share Breakdown
                    </p>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={simResults.results.filter((r) => r.hits > 0).map((r) => ({
                            name: r.name,
                            value: parseFloat(r.actualPct.toFixed(2)),
                            hits: r.hits,
                            rarity: r.rarity,
                            fill: RARITY_CHART_COLORS[r.rarity] || RARITY_CHART_COLORS.common,
                          }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          isAnimationActive={true}
                          animationBegin={0}
                          animationDuration={600}
                          label={({ name, value, cx, x, y, midAngle }) => {
                            if (value < 3) return null;
                            const label = name.length > 10 ? name.slice(0, 10) + "…" : name;
                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#94A3B8"
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                                fontSize={11}
                              >
                                {label} {value}%
                              </text>
                            );
                          }}
                          labelLine={{ stroke: "rgba(148,163,184,0.3)" }}
                        >
                          {simResults.results.filter((r) => r.hits > 0).map((r) => (
                            <Cell
                              key={r.itemId}
                              fill={RARITY_CHART_COLORS[r.rarity] || RARITY_CHART_COLORS.common}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1E1C35",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            fontSize: "13px",
                          }}
                          formatter={(value, name, entry) => {
                            const d = entry.payload;
                            return [
                              <span key="v" style={{ color: "#E2E8F0" }}>
                                {d.hits.toLocaleString()} drops ({value}%)
                                <br />
                                <span style={{ color: "#94A3B8", fontSize: 11, textTransform: "capitalize" }}>
                                  {d.rarity}
                                </span>
                              </span>,
                              name,
                            ];
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Custom legend — all items, zero-hit items greyed out */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1 px-1">
                      {simResults.results.map((r) => {
                        const color = RARITY_CHART_COLORS[r.rarity] || RARITY_CHART_COLORS.common;
                        const hasHits = r.hits > 0;
                        return (
                          <span
                            key={r.itemId}
                            className="inline-flex items-center gap-1.5 text-xs"
                            style={{ color: hasHits ? "#94A3B8" : "#4B5563" }}
                          >
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                              style={{ backgroundColor: hasHits ? color : "#374151" }}
                              aria-hidden="true"
                            />
                            {r.name || "Unnamed"}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>
        </section>

        {/* ── RIGHT — summary panel ──────────────────────── */}
        <aside aria-label="Loot table summary">
          <div className="rounded-2xl border border-white/[0.06] bg-card p-5 lg:sticky lg:top-24">
            <h2 className="text-xs font-heading font-bold text-muted uppercase tracking-widest mb-4">
              Summary
            </h2>

            <div className="space-y-2.5 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Items</span>
                <span className="text-light font-medium tabular-nums">{items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Total weight</span>
                <span className="text-light font-medium tabular-nums">{totalWeight}</span>
              </div>
            </div>

            {rarityStats.length > 0 && (
              <div className="border-t border-white/[0.06] pt-4">
                <p className="text-xs text-muted/50 uppercase tracking-wider mb-3">By Rarity</p>
                <div className="space-y-3">
                  {rarityStats.map(({ rarity, pct }) => {
                    const { badge, label, bar } = RARITY_CONFIG[rarity];
                    return (
                      <div key={rarity} className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium shrink-0 w-24 justify-center ${badge}`}
                        >
                          {label}
                        </span>
                        <div className="flex-1 flex items-center gap-2 min-w-0">
                          <div
                            className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden"
                            role="presentation"
                          >
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{ width: `${pct}%`, background: bar }}
                              role="presentation"
                            />
                          </div>
                          <span className="text-xs font-medium text-light tabular-nums w-12 text-right shrink-0">
                            {pct.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rarity legend — both colour dot and text label */}
            <div className="border-t border-white/[0.06] pt-4 mt-4">
              <p className="text-xs text-muted/50 uppercase tracking-wider mb-3">Tier Defaults</p>
              <div className="space-y-1.5">
                {RARITIES.map((r) => {
                  const { badge, label, dot } = RARITY_CONFIG[r];
                  return (
                    <div key={r} className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium ${badge}`}>
                        {/* Colour dot + text — colour is not the only indicator */}
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: dot }}
                          aria-hidden="true"
                        />
                        {label}
                      </span>
                      <span className="text-xs text-muted tabular-nums">
                        w{RARITY_WEIGHTS[r]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Back link ──────────────────────────────────────── */}
      <div className="mt-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80 transition-colors duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Back to all tools
        </Link>
      </div>

      {/* ── Related Tools ──────────────────────────────────── */}
      {relatedTools.length > 0 && (
        <section className="mt-16" aria-labelledby="related-tools-heading">
          <h2
            id="related-tools-heading"
            className="text-lg font-heading font-bold text-light mb-4"
          >
            Related Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedTools.map((tool) => {
              const RelatedIcon = tool.icon;
              return (
                <Link
                  key={tool.path}
                  to={`/tools/${tool.path}`}
                  className="group block p-5 rounded-2xl bg-card border border-white/[0.06] hover:border-accent/40 hover:shadow-glow hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                  aria-label={`Open ${tool.name}`}
                >
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors duration-200">
                    <RelatedIcon className="w-4.5 h-4.5 text-accent" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-heading font-bold text-light group-hover:text-accent transition-colors duration-200 mb-1">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-medium text-accent/60 group-hover:text-accent mt-3 transition-colors duration-200"
                    aria-hidden="true"
                  >
                    Open
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
