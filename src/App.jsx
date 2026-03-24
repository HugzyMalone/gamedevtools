import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ToolPlaceholder from "./pages/tools/ToolPlaceholder";

const tools = [
  { path: "loot-table-simulator", name: "Loot Table Simulator", icon: "🎲", description: "Define items, set drop weights, simulate thousands of drops, and visualise probability distributions." },
  { path: "damage-formula-sandbox", name: "Damage Formula Sandbox", icon: "⚔️", description: "Design and test RPG damage formulas with interactive charts and preset systems." },
  { path: "xp-curve-designer", name: "XP Curve Designer", icon: "📈", description: "Create and visualise levelling curves with live charts. Export as JSON, CSV, or code." },
  { path: "palette-generator", name: "Pixel Art Palette Generator", icon: "🎨", description: "Generate harmonious limited palettes for pixel art. Extract palettes from images." },
  { path: "game-jam-ideas", name: "Game Jam Idea Generator", icon: "💡", description: "Get random combinations of theme, genre, mechanic, and constraint for your next jam." },
  { path: "sprite-sheet-slicer", name: "Sprite Sheet Slicer", icon: "✂️", description: "Upload a sprite sheet, configure the grid, preview frames, and download individual PNGs." },
];

function getRelatedTools(currentPath) {
  const others = tools.filter((t) => t.path !== currentPath);
  return others.slice(0, 2);
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          {tools.map((tool) => (
            <Route
              key={tool.path}
              path={`tools/${tool.path}`}
              element={
                <ToolPlaceholder
                  name={tool.name}
                  relatedTools={getRelatedTools(tool.path)}
                />
              }
            />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
