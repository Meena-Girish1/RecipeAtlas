import { Link } from 'react-router-dom';

const initials = (name) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

export default function CountryCard({ country, recipeCount }) {
  return (
    <Link
      to={`/countries/${encodeURIComponent(country)}`}
      className="group flex items-center gap-3 rounded-card border border-ink-100 bg-white px-4 py-3 transition-colors hover:border-saffron-500"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-ink-200 font-mono text-xs font-semibold text-ink-500 transition-colors group-hover:border-saffron-500 group-hover:text-saffron-600">
        {initials(country)}
      </span>
      <span className="flex flex-col">
        <span className="font-display text-base text-ink-700">{country}</span>
        <span className="font-mono text-xs text-ink-300">
          {recipeCount} recipe{recipeCount === 1 ? '' : 's'}
        </span>
      </span>
    </Link>
  );
}
