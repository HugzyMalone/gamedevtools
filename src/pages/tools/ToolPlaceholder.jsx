import { Link } from "react-router-dom";

export default function ToolPlaceholder({ name, relatedTools = [] }) {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-4xl font-bold text-light mb-4">{name}</h1>
      <p className="text-light/50 mb-8 text-lg">
        This tool is coming soon. Check back shortly!
      </p>
      <Link
        to="/"
        className="inline-block text-sm font-medium text-accent hover:text-accent/80 transition-colors"
      >
        &larr; Back to all tools
      </Link>

      {relatedTools.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold text-light mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedTools.map((tool) => (
              <Link
                key={tool.path}
                to={`/tools/${tool.path}`}
                className="group block p-5 rounded-xl bg-card border border-white/5 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1 transition-all duration-200"
              >
                <span className="text-2xl mb-2 block">{tool.icon}</span>
                <h3 className="text-base font-semibold text-light group-hover:text-accent transition-colors mb-1">
                  {tool.name}
                </h3>
                <p className="text-sm text-light/40">{tool.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
