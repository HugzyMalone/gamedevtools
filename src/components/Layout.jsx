import { Link, Outlet, useLocation } from "react-router-dom";
import { Gamepad2 } from "lucide-react";

export default function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-dark text-light">
      <header className="sticky top-0 z-50 border-b border-accent/20 bg-dark/80 backdrop-blur-md px-6 py-4">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-xl font-heading font-bold text-light hover:text-accent transition-colors duration-200"
            aria-label="gamedevtools.dev home"
          >
            <Gamepad2 className="w-6 h-6 text-accent" aria-hidden="true" />
            <span>gamedevtools<span className="text-accent">.dev</span></span>
          </Link>

          {!isHome && (
            <Link
              to="/"
              className="text-sm font-medium text-muted hover:text-accent transition-colors duration-200"
            >
              All Tools
            </Link>
          )}
        </nav>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-accent/10 px-6 py-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted">
          <span>Made for indie devs</span>
          <span>&copy; {new Date().getFullYear()} gamedevtools.dev</span>
        </div>
      </footer>
    </div>
  );
}
