import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowRight, Construction } from "lucide-react";

export default function ToolPlaceholder({ name, icon: Icon, description = '', path = '', relatedTools = [] }) {
  const canonicalUrl = `https://www.gamedevtools.dev/tools/${path}`;

  return (
    <>
      <Helmet>
        <title>{name} – Coming Soon | Game Dev Tools</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${name} | Game Dev Tools`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
    <div className="max-w-3xl mx-auto py-8 sm:py-12">
      {/* Tool Header */}
      <div className="flex items-start gap-4 mb-8">
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-accent" aria-hidden="true" />
          </div>
        )}
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-light mb-2">{name}</h1>
          <div className="flex items-center gap-2 text-muted">
            <Construction className="w-4 h-4" aria-hidden="true" />
            <p className="text-sm">This tool is coming soon. Check back shortly!</p>
          </div>
        </div>
      </div>

      {/* Coming Soon Visual */}
      <div className="rounded-2xl border border-white/[0.06] bg-card p-8 sm:p-12 text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <Construction className="w-8 h-8 text-accent/60" aria-hidden="true" />
        </div>
        <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">
          We're building this tool right now. It'll be interactive, browser-based, and completely free — just like every tool on gamedevtools.dev.
        </p>
      </div>

      {/* Back Link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80 transition-colors duration-200 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
        Back to all tools
      </Link>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <section className="mt-16" aria-label="Related tools">
          <h2 className="text-lg font-heading font-bold text-light mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedTools.map((tool) => {
              const RelatedIcon = tool.icon;
              return (
                <Link
                  key={tool.path}
                  to={`/tools/${tool.path}`}
                  className="group block p-5 rounded-2xl bg-card border border-white/[0.06] hover:border-accent/40 hover:shadow-glow hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors duration-200">
                    <RelatedIcon className="w-4.5 h-4.5 text-accent" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-heading font-bold text-light group-hover:text-accent transition-colors duration-200 mb-1">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed line-clamp-2">{tool.description}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-accent/60 group-hover:text-accent mt-3 transition-colors duration-200">
                    Open
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
    </>
  );
}
