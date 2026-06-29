import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { COUNTRY_COORDINATES } from '../utils/countryCoordinates';
import Loader from './Loader';
import EmptyState from './EmptyState';

/**
 * The hero signature element: a real, geographically-accurate world map
 * (via react-simple-maps + react-simple-maps' bundled Natural Earth-derived
 * boundary data), with a glowing pin dropped wherever the database actually
 * has at least one recipe from that country.
 *
 * The boundary data is fetched from a CDN at runtime rather than bundled
 * with the app, since it's a few hundred KB of geometry that rarely
 * changes — this is the standard pattern for react-simple-maps and keeps
 * the app's own bundle small. It does mean this one component needs an
 * internet connection in the browser; everything else in the app is
 * fully local/offline-capable.
 */
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export default function CountryMap({ countries = [] }) {
  const navigate = useNavigate();
  const [geoData, setGeoData] = useState(null);
  const [geoError, setGeoError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(GEO_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Map data request failed (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setGeoData(data);
      })
      .catch(() => {
        if (!cancelled) setGeoError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pins = countries
    .map((c) => {
      const coords = COUNTRY_COORDINATES[c.country];
      if (!coords) return null;
      return { ...c, coordinates: [coords.lon, coords.lat] };
    })
    .filter(Boolean);

  const unplottedCount = countries.length - pins.length;

  if (geoError) {
    return (
      <EmptyState
        title="Map couldn't load"
        message="The world map needs an internet connection to load its boundary data. Everything else on the site works fine without it — try refreshing once you're back online."
      />
    );
  }

  return (
    <div className="relative w-full">
      <div className="relative flex aspect-[2/1] w-full items-center justify-center overflow-hidden rounded-card bg-ink-700">
        {!geoData ? (
          <Loader label="Loading the world map" />
        ) : (
          <ComposableMap
            width={800}
            height={400}
            projectionConfig={{ scale: 130, center: [8, 8] }}
            className="absolute inset-0 h-full w-full"
          >
            <Geographies geography={geoData}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#1F3038"
                    stroke="#3D5459"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: '#27404A', outline: 'none' },
                      pressed: { fill: '#27404A', outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>

            {pins.map((pin) => (
              <Marker key={pin.country} coordinates={pin.coordinates}>
                <g
                  role="link"
                  tabIndex={0}
                  aria-label={`${pin.country}, ${pin.recipeCount} recipe${pin.recipeCount === 1 ? '' : 's'}`}
                  className="group cursor-pointer outline-none"
                  onClick={() => navigate(`/countries/${encodeURIComponent(pin.country)}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/countries/${encodeURIComponent(pin.country)}`);
                    }
                  }}
                >
                  <title>
                    {pin.country} · {pin.recipeCount} recipe{pin.recipeCount === 1 ? '' : 's'}
                  </title>
                  <circle
                    r={7}
                    fill="rgba(226,163,61,0.35)"
                    style={{ transformOrigin: '0px 0px' }}
                    className="motion-safe:animate-ping"
                  />
                  <circle
                    r={3.5}
                    fill="#E2A33D"
                    stroke="#FBF6EA"
                    strokeWidth={1.2}
                    style={{ transformOrigin: '0px 0px' }}
                    className="transition-transform group-hover:scale-125 group-focus-visible:scale-125"
                  />
                </g>
              </Marker>
            ))}
          </ComposableMap>
        )}
      </div>

      {unplottedCount > 0 && (
        <p className="mt-3 text-center font-mono text-xs text-ink-300">
          + {unplottedCount} more {unplottedCount === 1 ? 'country' : 'countries'} on the atlas — see the full list below
        </p>
      )}
    </div>
  );
}