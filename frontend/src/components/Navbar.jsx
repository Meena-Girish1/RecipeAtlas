import { Link, NavLink } from 'react-router-dom';
import { Compass, Plus } from 'lucide-react';

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-saffron-500' : 'text-parchment-100/80 hover:text-parchment-100'
  }`;

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 bg-ink-700/95 backdrop-blur supports-[backdrop-filter]:bg-ink-700/90">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-parchment-100">
          <Compass className="h-6 w-6 text-saffron-500" strokeWidth={1.75} aria-hidden="true" />
          <span className="font-display text-xl font-semibold tracking-tight">RecipeAtlas</span>
        </Link>

        <div className="hidden items-center gap-6 sm:flex">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/search" className={navLinkClass}>
            Search
          </NavLink>
        </div>

        <Link to="/add-recipe" className="btn-accent">
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          Add Recipe
        </Link>
      </nav>
    </header>
  );
}
