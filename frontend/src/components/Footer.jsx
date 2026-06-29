export default function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-100 bg-parchment-100">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-ink-300">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-display text-base text-ink-600">RecipeAtlas</p>
          <p className="font-mono text-xs uppercase tracking-widest">
            Recipes from every corner, charted in one place
          </p>
        </div>
      </div>
    </footer>
  );
}
