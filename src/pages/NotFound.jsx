import { Link } from "react-router-dom";
import { ArrowLeft, Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto text-center py-20 sm:py-28">
      <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
        <Ghost className="w-8 h-8 text-secondary" aria-hidden="true" />
      </div>
      <h1 className="text-5xl sm:text-6xl font-heading font-black text-light text-glow-secondary mb-4">
        404
      </h1>
      <p className="text-lg text-muted mb-8 max-w-md mx-auto leading-relaxed">
        This page doesn't exist. Maybe it got lost in a dungeon somewhere.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent/80 hover:shadow-glow transition-all duration-200 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Homepage
      </Link>
    </div>
  );
}
