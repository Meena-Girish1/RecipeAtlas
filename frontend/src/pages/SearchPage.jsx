import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import TagFilter from '../components/TagFilter';
import RecipeCard from '../components/RecipeCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { getTags, searchRecipes } from '../services/api';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const selectedTags = (params.get('tags') || '').split(',').filter(Boolean);

  const [allTags, setAllTags] = useState([]);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getTags()
      .then((res) => setAllTags(res.data))
      .catch(() => {});
  }, []);

  const runSearch = useCallback(() => {
    setResults(null);
    setError('');
    searchRecipes({ q, tags: selectedTags })
      .then((res) => setResults(res.data))
      .catch(() => setError('Something went wrong while searching. Please try again.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, params.get('tags')]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  const updateParams = (next) => {
    const merged = { q, tags: selectedTags.join(','), ...next };
    const newParams = new URLSearchParams();
    if (merged.q) newParams.set('q', merged.q);
    if (merged.tags) newParams.set('tags', merged.tags);
    setParams(newParams);
  };

  const hasActiveFilters = Boolean(q) || selectedTags.length > 0;
  const clearAll = () => setParams(new URLSearchParams());

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl">Search the atlas</h1>
      <p className="mt-1 text-ink-300">Search by recipe name, ingredient, or tag — and filter by tag.</p>

      <div className="mt-6 max-w-xl">
        <SearchBar
          initialValue={q}
          onSearch={(value) => updateParams({ q: value })}
          autoFocus
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <TagFilter
          tags={allTags}
          selected={selectedTags}
          onChange={(tags) => updateParams({ tags: tags.join(',') })}
        />
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="shrink-0 whitespace-nowrap text-sm font-medium text-ink-300 underline-offset-2 hover:text-chili-600 hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className="mt-8">
        {error && (
          <EmptyState title="Search failed" message={error} actionLabel="Try again" onAction={runSearch} />
        )}
        {!error && !results && <Loader label="Searching recipes" />}
        {!error && results && results.length === 0 && (
          <EmptyState
            title="No recipes match yet"
            message="Try a different ingredient, a broader tag, or check back once more recipes are added."
          />
        )}
        {!error && results && results.length > 0 && (
          <>
            <p className="mb-4 font-mono text-xs uppercase tracking-wide text-ink-300">
              {results.length} recipe{results.length === 1 ? '' : 's'} found
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}