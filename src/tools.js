import { Dices, Swords, TrendingUp, Palette, Lightbulb, Scissors } from "lucide-react";

const tools = [
  { path: "loot-table-simulator", name: "Loot Table Simulator", icon: Dices, description: "Define items, set drop weights, simulate thousands of drops, and visualise probability distributions." },
  { path: "damage-formula-sandbox", name: "Damage Formula Sandbox", icon: Swords, description: "Design and test RPG damage formulas with interactive charts and preset systems." },
  { path: "xp-curve-designer", name: "XP Curve Designer", icon: TrendingUp, description: "Create and visualise levelling curves with live charts. Export as JSON, CSV, or code." },
  { path: "palette-generator", name: "Pixel Art Palette Generator", icon: Palette, description: "Generate harmonious limited palettes for pixel art. Extract palettes from images." },
  { path: "game-jam-ideas", name: "Game Jam Idea Generator", icon: Lightbulb, description: "Get random combinations of theme, genre, mechanic, and constraint for your next jam." },
  { path: "sprite-sheet-slicer", name: "Sprite Sheet Slicer", icon: Scissors, description: "Upload a sprite sheet, configure the grid, preview frames, and download individual PNGs." },
];

export function getRelatedTools(currentPath) {
  const others = tools.filter((t) => t.path !== currentPath);
  return others.slice(0, 2);
}

export default tools;
