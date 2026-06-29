import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import CountryMap from '../components/CountryMap';
import CountryCard from '../components/CountryCard';
import RecipeCard from '../components/RecipeCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { tagChipClasses } from '../utils/tagStyles';
import { getCountries, getLatestRecipes, getTags } from '../services/api';

export default function Home() {
  const [countries, setCountries] = useState(null);
  const [latest, setLatest] = useState(null);
  const [tags, setTags] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getCountries(), getLatestRecipes(8), getTags()])
      .then(([countriesRes, latestRes, tagsRes]) => {
        setCountries(countriesRes.data);
        setLatest(latestRes.data);
        setTags(tagsRes.data.filter((t) => t.usageCount > 0).slice(0, 10));
      })
      .catch(() => setError('Could not reach the RecipeAtlas API. Is the backend running?'));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20">
      {/* Hero */}
      <section className="pt-12 sm:pt-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-saffron-600">
            A global recipe atlas
          </p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
            Every dish has a place on the map.
          </h1>
          <p className="mt-4 text-ink-300">
            Browse recipes pinned to the countries and regions that cook them — or publish one of
            your own and put it on the atlas.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-xl">
          <SearchBar />
        </div>

        <div className="mt-10">
          {error && <p className="text-center text-sm text-chili-600">{error}</p>}
          {!error && !countries && <Loader label="Charting the atlas" />}
          {countries && <CountryMap countries={countries} />}
        </div>
      </section>

      {/* Popular tags */}
      {tags && tags.length > 0 && (
        <section className="mt-16">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl">Popular tags</h2>
            <Link to="/search" className="flex items-center gap-1 text-sm font-medium text-saffron-600 hover:text-saffron-700">
              Browse all <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.name}
                to={`/search?tags=${encodeURIComponent(tag.name)}`}
                className={`tag-chip border ${tagChipClasses(tag.name)}`}
              >
                {tag.name}
                <span className="opacity-60">· {tag.usageCount}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Countries with recipes */}
      <section className="mt-16">
        <h2 className="text-2xl">Countries on the atlas</h2>
        <p className="mt-1 text-sm text-ink-300">
          Only countries that already have published recipes appear here.
        </p>
        <div className="mt-5">
          {!error && !countries && <Loader label="Loading countries" />}
          {countries && countries.length === 0 && (
            <EmptyState
              title="No countries yet"
              message="Be the first to add a recipe and put a country on the atlas."
              actionLabel="Add a recipe"
              onAction={() => (window.location.href = '/add-recipe')}
            />
          )}
          {countries && countries.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {countries.map((c) => (
                <CountryCard key={c.country} country={c.country} recipeCount={c.recipeCount} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest recipes */}
      <section className="mt-16">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl">Latest recipes</h2>
          <Link to="/search" className="flex items-center gap-1 text-sm font-medium text-saffron-600 hover:text-saffron-700">
            See all <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-5">
          {!error && !latest && <Loader label="Fetching the newest dishes" />}
          {latest && latest.length === 0 && (
            <EmptyState title="No recipes yet" message="Nothing has been published on the atlas yet." />
          )}
          {latest && latest.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {latest.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
