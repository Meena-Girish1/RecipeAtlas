import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { tagChipClasses } from '../utils/tagStyles';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#F2E9D4"/><text x="50%" y="50%" font-family="sans-serif" font-size="14" fill="#9FB2B5" text-anchor="middle" dominant-baseline="middle">No photo yet</text></svg>`
  );

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

export default function RecipeCard({ recipe }) {
  return (
    <Link
      to={`/recipes/${recipe._id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-ink-50 bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-cardHover"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-parchment-300">
        <img
          src={recipe.imageUrl || PLACEHOLDER}
          alt={recipe.recipeName}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="font-display text-lg leading-snug text-ink-700 line-clamp-2">
          {recipe.recipeName}
        </h3>
        <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-ink-300">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {recipe.state}, {recipe.country}
        </p>
        {recipe.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={`tag-chip border ${tagChipClasses(tag)}`}>
                {tag}
              </span>
            ))}
          </div>
        )}
        <p className="mt-auto pt-1 font-mono text-[11px] text-ink-200">
          Added {formatDate(recipe.createdAt)}
        </p>
      </div>
    </Link>
  );
}
