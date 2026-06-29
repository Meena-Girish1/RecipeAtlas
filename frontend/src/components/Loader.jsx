/**
 * Small inline loader used while async data is in flight. Kept deliberately
 * understated — a spinning compass needle nods to the atlas theme without
 * being a flashy "skeleton everything" loading state.
 */
export default function Loader({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-300">
      <svg
        className="h-8 w-8 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
        <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 12 L12 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 12 L15.2 13.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="font-mono text-xs uppercase tracking-widest">{label}</span>
    </div>
  );
}
