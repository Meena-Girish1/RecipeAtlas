import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { getStatesByCountry } from '../services/api';

export default function CountryPage() {
  const { country } = useParams();
  const [states, setStates] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setStates(null);
    setError('');
    getStatesByCountry(country)
      .then((res) => setStates(res.data))
      .catch(() => setError(`No recipes found yet for ${country}.`));
  }, [country]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link to="/" className="flex items-center gap-1 text-sm text-ink-300 hover:text-ink-600">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to the atlas
      </Link>

      <h1 className="mt-4 text-3xl">{country}</h1>
      <p className="mt-1 text-ink-300">Pick a state or region to see its recipes.</p>

      <div className="mt-8">
        {!error && !states && <Loader label={`Charting ${country}`} />}
        {error && (
          <EmptyState
            title="Nothing here yet"
            message={error}
            actionLabel="Browse other countries"
            onAction={() => (window.location.href = '/')}
          />
        )}
        {states && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {states.map((s) => (
              <Link
                key={s.state}
                to={`/countries/${encodeURIComponent(country)}/states/${encodeURIComponent(s.state)}`}
                className="group flex items-center justify-between gap-3 rounded-card border border-ink-100 bg-white px-5 py-4 transition-colors hover:border-saffron-500"
              >
                <span className="flex items-center gap-2 font-display text-lg text-ink-700">
                  <MapPin className="h-4 w-4 text-saffron-500" aria-hidden="true" />
                  {s.state}
                </span>
                <span className="font-mono text-xs text-ink-300">
                  {s.recipeCount} recipe{s.recipeCount === 1 ? '' : 's'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
