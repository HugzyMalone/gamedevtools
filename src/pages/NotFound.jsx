import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto text-center py-24">
      <h1 className="text-6xl font-bold text-light mb-4">404</h1>
      <p className="text-xl text-light/50 mb-8">
        Oops — this page doesn't exist. Maybe it got lost in a dungeon somewhere.
      </p>
      <Link
        to="/"
        className="inline-block px-6 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent/80 transition-colors"
      >
        Back to Homepage
      </Link>
    </div>
  );
}
