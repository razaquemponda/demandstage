import { Link, useLocation } from "react-router-dom";
import { Music } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/vote", label: "Vote" },
  { to: "/results", label: "Results" },
  { to: "/events", label: "Events" },
  { to: "/sponsors", label: "Sponsors" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold">
          <Music className="h-6 w-6 text-primary" />
          <span>Demand<span className="text-primary">Stage</span></span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === l.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

      </div>
    </nav>
  );
}
