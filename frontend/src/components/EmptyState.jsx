/**
 * Shown whenever a query legitimately returns nothing — no recipes for a
 * search, no states for a country, etc. Per the writing guidance: an empty
 * screen should read as an invitation to act, not an apology.
 */
export default function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-ink-100 bg-white/60 px-6 py-14 text-center">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="16" stroke="#9FB2B5" strokeWidth="1.5" strokeDasharray="3 4" />
        <path d="M14 20h12M20 14v12" stroke="#9FB2B5" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <h3 className="text-lg font-semibold text-ink-600">{title}</h3>
      {message && <p className="max-w-sm text-sm text-ink-300">{message}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-secondary mt-2">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
