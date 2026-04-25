import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Search, ArrowLeft, SlidersHorizontal, Car } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import type { Listing, SortKey } from '../types';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'distance', label: 'Distance' },
  { key: 'mileage', label: 'Mileage' },
  { key: 'year', label: 'Year' },
  { key: 'starRating', label: 'Rating' },
  { key: 'price', label: 'Price' },
];

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { listings = [], total = 0, sitesSearched = 0, filters } = (location.state || {}) as {
    listings: Listing[];
    total: number;
    sitesSearched: number;
    filters: any;
  };

  const [sortKey, setSortKey] = useState<SortKey>('distance');
  const [sortAsc, setSortAsc] = useState(true);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const sorted = useMemo(() => {
    const copy = [...listings];
    copy.sort((a, b) => {
      let av: number = a[sortKey] as number ?? 0;
      let bv: number = b[sortKey] as number ?? 0;
      if (sortKey === 'year' || sortKey === 'starRating') {
        // Higher is better — default descending
        return sortAsc ? bv - av : av - bv;
      }
      return sortAsc ? av - bv : bv - av;
    });
    return copy;
  }, [listings, sortKey, sortAsc]);

  if (!listings.length && !location.state) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)' }}
        >
          <Search size={28} className="text-gold/50" />
        </div>
        <h2 className="font-display text-xl font-semibold text-off-white mb-2">No Results Yet</h2>
        <p className="text-muted text-sm mb-6">Run a search to see vehicle listings here.</p>
        <button onClick={() => navigate('/search')} className="btn-gold flex items-center gap-2">
          <Search size={15} /> Start a Search
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6" style={{ animation: 'fadeUp 0.4s ease both' }}>
        <div>
          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-gold mb-2 transition-colors"
          >
            <ArrowLeft size={13} /> Back to Search
          </button>
          <h1 className="font-display text-3xl font-bold text-off-white">
            {total} Vehicle{total !== 1 ? 's' : ''} Found
          </h1>
          <p className="text-muted text-sm mt-1">
            Searched across{' '}
            <span className="text-gold">{sitesSearched} auction site{sitesSearched !== 1 ? 's' : ''}</span>
            {filters?.make && <> · <span className="text-off-white/70">{filters.make}</span></>}
            {filters?.model && <> <span className="text-off-white/70">{filters.model}</span></>}
          </p>
        </div>

        <button onClick={() => navigate('/search')} className="btn-gold flex items-center gap-2 flex-shrink-0">
          <Search size={14} /> New Search
        </button>
      </div>

      {/* Sort bar */}
      {listings.length > 0 && (
        <div
          className="flex items-center gap-2 flex-wrap mb-6 p-3 rounded-xl"
          style={{ background: 'rgba(18,21,28,0.7)', border: '1px solid rgba(30,35,48,0.7)' }}
        >
          <span className="text-xs text-muted uppercase tracking-wide font-semibold flex items-center gap-1.5">
            <SlidersHorizontal size={12} /> Sort by
          </span>
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
              style={{
                background: sortKey === key ? 'rgba(201,168,76,0.15)' : 'transparent',
                border: `1px solid ${sortKey === key ? 'rgba(201,168,76,0.35)' : 'rgba(30,35,48,0.6)'}`,
                color: sortKey === key ? '#C9A84C' : '#6B7280',
              }}
            >
              {label}
              {sortKey === key && (
                <span className="text-gold/60">{sortAsc ? '↑' : '↓'}</span>
              )}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted">{sorted.length} result{sorted.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Results grid / empty state */}
      {sorted.length === 0 ? (
        <EmptyResults sitesSearched={sitesSearched} onNewSearch={() => navigate('/search')} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sorted.map((listing, i) => (
            <VehicleCard key={`${listing.id}-${listing.auctionSiteId}`} listing={listing} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyResults({ sitesSearched, onNewSearch }: { sitesSearched: number; onNewSearch: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(18,21,28,0.8)', border: '1px solid rgba(30,35,48,0.7)' }}
      >
        <Car size={32} className="text-muted/40" />
      </div>
      <h3 className="font-display text-xl font-semibold text-off-white mb-2">
        No Vehicles Matched
      </h3>
      <p className="text-muted text-sm max-w-sm mb-6 leading-relaxed">
        No vehicles matched your search across{' '}
        <strong className="text-off-white">{sitesSearched} site{sitesSearched !== 1 ? 's' : ''}</strong>.
        Try broadening your filters — expand the year range, increase mileage, or reduce the star rating.
      </p>
      <button onClick={onNewSearch} className="btn-gold flex items-center gap-2">
        <Search size={15} /> Refine Search
      </button>
    </div>
  );
}
