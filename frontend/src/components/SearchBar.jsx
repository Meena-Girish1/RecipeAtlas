import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

/**
 * If `onSearch` is provided, the component calls it directly (used on the
 * Search page, which already owns the query string in its own state). If
 * not, it navigates to /search?q=... instead (used on the Home page, which
 * just wants to hand off to the dedicated Search page).
 */
export default function SearchBar({ initialValue = '', onSearch, autoFocus = false, placeholder }) {
  const [value, setValue] = useState(initialValue);
  const navigate = useNavigate();

  // Keep the input in sync if the query is cleared/changed from outside
  // this component (e.g. a "Clear all filters" action on the parent page),
  // not just on first mount.
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (onSearch) {
      onSearch(trimmed);
    } else {
      navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search');
    }
  };

  /**
   * Without this, emptying the box (e.g. selecting all + delete) leaves the
   * old query string active behind the scenes until the user explicitly
   * re-submits — which is easy to forget, and looks like "filters are
   * broken" when really the old text is just silently still applied. As
   * soon as the field becomes empty, clear the active search immediately
   * rather than waiting for a submit that may never come.
   */
  const handleChange = (e) => {
    const next = e.target.value;
    setValue(next);
    if (next === '') {
      if (onSearch) onSearch('');
      else navigate('/search');
    }
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="relative w-full">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        autoFocus={autoFocus}
        placeholder={placeholder || 'Search by recipe, ingredient, or tag — try "fish" or "maida"'}
        aria-label="Search recipes"
        className="w-full rounded-full border border-ink-100 bg-white py-3.5 pl-12 pr-28 text-sm text-ink-700 shadow-card placeholder:text-ink-300 focus:border-saffron-500 focus:outline-none"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-ink-600 px-5 py-2 text-sm font-semibold text-parchment-100 transition-colors hover:bg-ink-700"
      >
        Search
      </button>
    </form>
  );
}