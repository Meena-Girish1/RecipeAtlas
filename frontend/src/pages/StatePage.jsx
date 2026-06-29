import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { getRecipesByState } from '../services/api';

export default function StatePage() {
  const { country, state } = useParams();
  const [recipes, setRecipes] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setRecipes(null);
    setError('');
    getRecipesByState(country, state)
      .then((res) => setRecipes(res.data))
      .catch(() => setError('Could not load recipes for this region.'));
  }, [country, state]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        to={`/countries/${encodeURIComponent(country)}`}
        className="flex items-center gap-1 text-sm text-ink-300 hover:text-ink-600"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to {country}
      </Link>

      <h1 className="mt-4 text-3xl">{state}</h1>
      <p className="mt-1 font-mono text-xs uppercase tracking-wide text-ink-300">{country}</p>

      <div className="mt-8">
        {!error && !recipes && <Loader label={`Loading recipes from ${state}`} />}
        {error && <EmptyState title="Something went wrong" message={error} />}
        {recipes && recipes.length === 0 && (
          <EmptyState title="No recipes here yet" message={`No one has published a recipe from ${state} yet.`} />
        )}
        {recipes && recipes.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
