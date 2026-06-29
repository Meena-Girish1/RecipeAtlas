import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, MapPin, Pencil, Trash2 } from 'lucide-react';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import RecipeCard from '../components/RecipeCard';
import { tagChipClasses } from '../utils/tagStyles';
import { deleteRecipe, getRecipeById, getSimilarRecipes } from '../services/api';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="100%" height="100%" fill="#F2E9D4"/><text x="50%" y="50%" font-family="sans-serif" font-size="18" fill="#9FB2B5" text-anchor="middle" dominant-baseline="middle">No photo yet</text></svg>`
  );

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState('');
  const [similar, setSimilar] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setRecipe(null);
    setError('');
    setSimilar(null);
    getRecipeById(id)
      .then((res) => setRecipe(res.data))
      .catch(() => setError('This recipe could not be found.'));
  }, [id]);

  useEffect(() => {
    if (!recipe) return;
    getSimilarRecipes(recipe._id)
      .then((res) => setSimilar(res.data))
      .catch(() => setSimilar([]));
  }, [recipe]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this recipe? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteRecipe(id);
      navigate('/');
    } catch {
      setDeleting(false);
      window.alert('Could not delete this recipe. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <EmptyState title="Recipe not found" message={error} actionLabel="Back to the atlas" onAction={() => navigate('/')} />
      </div>
    );
  }

  if (!recipe) {
    return <Loader label="Unrolling the recipe" />;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link to="/" className="flex items-center gap-1 text-sm text-ink-300 hover:text-ink-600">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to the atlas
      </Link>

      <div className="mt-5 overflow-hidden rounded-card border border-ink-50 shadow-card">
        <img
          src={recipe.imageUrl || PLACEHOLDER}
          alt={recipe.recipeName}
          className="aspect-[16/9] w-full object-cover"
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl">{recipe.recipeName}</h1>
          <p className="mt-2 flex items-center gap-1.5 font-mono text-sm uppercase tracking-wide text-ink-300">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {recipe.state}, {recipe.country}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-300">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            Added {formatDate(recipe.createdAt)} {recipe.author ? `by ${recipe.author}` : ''}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <Link to={`/edit-recipe/${recipe._id}`} className="btn-secondary">
            <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
          </Link>
          <button onClick={handleDelete} disabled={deleting} className="btn-secondary !border-chili-500 !text-chili-600">
            <Trash2 className="h-4 w-4" aria-hidden="true" /> {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      {recipe.tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <span key={tag} className={`tag-chip border ${tagChipClasses(tag)}`}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {recipe.summary && (
        <p className="mt-6 rounded-card bg-saffron-100/60 px-5 py-4 font-display text-lg leading-relaxed text-ink-600">
          {recipe.summary}
        </p>
      )}

      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-[1fr_1.4fr]">
        <section>
          <h2 className="text-xl">Ingredients</h2>
          <ul className="mt-4 space-y-2.5">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex gap-2.5 border-b border-ink-50 pb-2.5 text-sm text-ink-600 last:border-0">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron-500" aria-hidden="true" />
                {ing}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl">Instructions</h2>
          <ol className="mt-4 space-y-4">
            {recipe.instructions.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-600 font-mono text-xs text-parchment-100">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="mt-14">
        <h2 className="text-2xl">Similar recipes</h2>
        <p className="mt-1 text-sm text-ink-300">
          Suggested by Claude from recipes already on the atlas that share ingredients or tags.
        </p>
        <div className="mt-5">
          {similar === null && <Loader label="Finding similar recipes" />}
          {similar && similar.length === 0 && (
            <EmptyState title="No close matches yet" message="As more recipes are added, suggestions will appear here." />
          )}
          {similar && similar.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map(({ recipe: r, reason }) => (
                <div key={r._id} className="flex flex-col gap-2">
                  <RecipeCard recipe={r} />
                  {reason && <p className="px-1 text-xs italic text-ink-300">"{reason}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
