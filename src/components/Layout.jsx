import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-dark text-light">
      <header className="border-b border-white/10 px-6 py-4">
        <Link to="/" className="text-xl font-bold text-light hover:text-accent transition-colors">
          gamedevtools.dev
        </Link>
      </header>

      <main className="flex-1 px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 px-6 py-4 text-center text-sm text-light/40">
        Made for indie devs &middot; &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
