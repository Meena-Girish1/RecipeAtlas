import { tagChipClasses } from '../utils/tagStyles';

/**
 * `tags` is the full list available to filter by (e.g. from GET /api/tags).
 * `selected` is the currently active tag (or none). This is intentionally
 * single-select: clicking a tag replaces whatever was active before,
 * rather than accumulating tags together. Clicking the already-active tag
 * again clears the filter back to "no tag selected."
 */
export default function TagFilter({ tags, selected, onChange }) {
  const select = (name) => {
    onChange(selected.includes(name) ? [] : [name]);
  };

  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
      {tags.map((tag) => {
        const name = typeof tag === 'string' ? tag : tag.name;
        const isSelected = selected.includes(name);
        return (
          <button
            key={name}
            type="button"
            onClick={() => select(name)}
            aria-pressed={isSelected}
            className={`tag-chip border ${tagChipClasses(name, isSelected)}`}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}