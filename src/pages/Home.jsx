import { Link } from "react-router-dom";
import tools from "../tools";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="text-center py-16 sm:py-20 mb-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-light text-glow mb-4 tracking-tight">
          Game Dev Tools
        </h1>
        <p className="text-lg sm:text-xl text-accent font-medium mb-5">
          Free browser-based tools for indie game developers
        </p>
        <p className="text-muted max-w-xl mx-auto leading-relaxed text-sm sm:text-base">
          A growing collection of interactive utilities designed to speed up your game development workflow.
          No sign-up, no install — just open and build.
        </p>
      </section>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.path}
              to={`/tools/${tool.path}`}
              className="group relative block p-6 rounded-2xl bg-card border border-white/[0.06] hover:border-accent/40 hover:shadow-glow hover:-translate-y-1 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors duration-200">
                <Icon className="w-5 h-5 text-accent" aria-hidden="true" />
              </div>
              <h2 className="text-base font-heading font-bold text-light mb-2 group-hover:text-accent transition-colors duration-200">
                {tool.name}
              </h2>
              <p className="text-sm text-muted mb-4 leading-relaxed line-clamp-2">
                {tool.description}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent/70 group-hover:text-accent transition-colors duration-200">
                Launch Tool
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" aria-hidden="true" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
