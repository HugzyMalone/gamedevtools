import { Link } from "react-router-dom";

const tools = [
  {
    icon: "🎲",
    name: "Loot Table Simulator",
    path: "/tools/loot-table-simulator",
    description: "Define items, set drop weights, simulate thousands of drops, and visualise probability distributions.",
  },
  {
    icon: "⚔️",
    name: "Damage Formula Sandbox",
    path: "/tools/damage-formula-sandbox",
    description: "Design and test RPG damage formulas with interactive charts and preset systems.",
  },
  {
    icon: "📈",
    name: "XP Curve Designer",
    path: "/tools/xp-curve-designer",
    description: "Create and visualise levelling curves with live charts. Export as JSON, CSV, or code.",
  },
  {
    icon: "🎨",
    name: "Pixel Art Palette Generator",
    path: "/tools/palette-generator",
    description: "Generate harmonious limited palettes for pixel art. Extract palettes from images.",
  },
  {
    icon: "💡",
    name: "Game Jam Idea Generator",
    path: "/tools/game-jam-ideas",
    description: "Get random combinations of theme, genre, mechanic, and constraint for your next jam.",
  },
  {
    icon: "✂️",
    name: "Sprite Sheet Slicer",
    path: "/tools/sprite-sheet-slicer",
    description: "Upload a sprite sheet, configure the grid, preview frames, and download individual PNGs.",
  },
];

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto">
      <section className="text-center py-12 mb-8">
        <h1 className="text-5xl font-bold text-light mb-3">
          Game Dev Tools
        </h1>
        <p className="text-xl text-accent font-medium mb-4">
          Free browser-based tools for indie game developers
        </p>
        <p className="text-light/60 max-w-2xl mx-auto leading-relaxed">
          A growing collection of interactive utilities designed to speed up your game development workflow.
          No sign-up, no install — just open and build.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className="group block p-6 rounded-xl bg-card border border-white/5 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1 transition-all duration-200"
          >
            <span className="text-3xl mb-4 block">{tool.icon}</span>
            <h2 className="text-lg font-semibold text-light mb-2 group-hover:text-accent transition-colors">
              {tool.name}
            </h2>
            <p className="text-sm text-light/50 mb-4 leading-relaxed">
              {tool.description}
            </p>
            <span className="text-sm font-medium text-accent/80 group-hover:text-accent transition-colors">
              Launch Tool &rarr;
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
