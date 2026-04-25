import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal, Bookmark, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';
import api from '../api';
import type { AuctionSite, SearchFilters } from '../types';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => CURRENT_YEAR - i);

const RADIUS_OPTIONS = [
  { value: '50', label: '50 miles' },
  { value: '100', label: '100 miles' },
  { value: '200', label: '200 miles' },
  { value: '300', label: '300 miles' },
  { value: '500', label: '500 miles' },
  { value: 'nationwide', label: 'Nationwide' },
];

const COLORS = [
  { name: 'White',    hex: '#F5F5F0' },
  { name: 'Black',    hex: '#1A1A1A' },
  { name: 'Silver',   hex: '#C0C4C8' },
  { name: 'Gray',     hex: '#6B7280' },
  { name: 'Red',      hex: '#CC2200' },
  { name: 'Blue',     hex: '#1B4BA0' },
  { name: 'Navy',     hex: '#1F3A5F' },
  { name: 'Green',    hex: '#2D5A27' },
  { name: 'Brown',    hex: '#6B3A2A' },
  { name: 'Gold',     hex: '#C9A84C' },
  { name: 'Orange',   hex: '#C25A00' },
  { name: 'Beige',    hex: '#C2A882' },
  { name: 'Burgundy', hex: '#7A1C2E' },
  { name: 'Pearl',    hex: '#EEF0EE' },
];

const DEFAULT_FILTERS: SearchFilters & { selectedSiteIds: string[] } = {
  yearFrom: '',
  yearTo: '',
  make: '',
  model: '',
  trim: '',
  colors: [],
  maxMileage: 150000,
  minStarRating: 1,
  radius: 'nationwide',
  selectedSiteIds: [],
};

export default function Search() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [sites, setSites] = useState<AuctionSite[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/auction-sites')
      .then(({ data }) => {
        setSites(data);
        setFilters((f) => ({ ...f, selectedSiteIds: data.map((s: AuctionSite) => s.id) }));
      })
      .catch(() => {})
      .finally(() => setSitesLoading(false));
  }, []);

  function setField(key: string, value: any) {
    setFilters((f) => ({ ...f, [key]: value }));
    setError('');
  }

  function toggleColor(name: string) {
    setFilters((f) => ({
      ...f,
      colors: f.colors?.includes(name)
        ? f.colors.filter((c) => c !== name)
        : [...(f.colors || []), name],
    }));
  }

  function toggleSite(id: string) {
    setFilters((f) => ({
      ...f,
      selectedSiteIds: f.selectedSiteIds?.includes(id)
        ? f.selectedSiteIds.filter((s) => s !== id)
        : [...(f.selectedSiteIds || []), id],
    }));
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!filters.selectedSiteIds?.length) {
      return setError('Select at least one auction site to search.');
    }

    setSearching(true);
    try {
      const { data } = await api.post('/search', {
        filters: {
          yearFrom: filters.yearFrom || undefined,
          yearTo: filters.yearTo || undefined,
          make: filters.make || undefined,
          model: filters.model || undefined,
          trim: filters.trim || undefined,
          colors: filters.colors?.length ? filters.colors : undefined,
          maxMileage: filters.maxMileage,
          minStarRating: filters.minStarRating,
          radius: filters.radius,
        },
        selectedSiteIds: filters.selectedSiteIds,
      });
      navigate('/results', {
        state: {
          listings: data.listings,
          total: data.total,
          sitesSearched: data.sitesSearched,
          filters,
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  }

  async function handleSaveSearch() {
    if (!saveName.trim()) return;
    setSaving(true);
    try {
      await api.post('/saved-searches', { searchName: saveName.trim(), filters });
      setSaveModalOpen(false);
      setSaveName('');
    } catch {
      /* handled silently */
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8" style={{ animation: 'fadeUp 0.5s ease both' }}>
        <div>
          <p className="text-muted text-sm mb-1 flex items-center gap-1.5">
            <SlidersHorizontal size={13} /> Vehicle Search
          </p>
          <h1 className="font-display text-3xl font-bold text-off-white">Search Vehicles</h1>
          <p className="text-muted text-sm mt-1.5">Configure your filters and search all auction sites simultaneously.</p>
        </div>
        <button
          type="button"
          onClick={() => { setSaveName(''); setSaveModalOpen(true); }}
          className="btn-outline-gold flex items-center gap-2 flex-shrink-0"
        >
          <Bookmark size={14} />
          Save Search
        </button>
      </div>

      <form onSubmit={handleSearch}>
        {/* Year, Make, Model, Trim */}
        <Section title="Vehicle Details">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label>Year From</Label>
              <select
                value={filters.yearFrom}
                onChange={(e) => setField('yearFrom', e.target.value)}
                className="input-luxury"
              >
                <option value="">Any</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <Label>Year To</Label>
              <select
                value={filters.yearTo}
                onChange={(e) => setField('yearTo', e.target.value)}
                className="input-luxury"
              >
                <option value="">Any</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <Label>Make</Label>
              <input
                type="text"
                value={filters.make}
                onChange={(e) => setField('make', e.target.value)}
                placeholder="e.g. Honda"
                className="input-luxury"
              />
            </div>
            <div>
              <Label>Model</Label>
              <input
                type="text"
                value={filters.model}
                onChange={(e) => setField('model', e.target.value)}
                placeholder="e.g. Accord"
                className="input-luxury"
              />
            </div>
          </div>
          <div className="mt-3">
            <Label>Trim <span className="text-muted/60 font-normal normal-case">(optional)</span></Label>
            <input
              type="text"
              value={filters.trim}
              onChange={(e) => setField('trim', e.target.value)}
              placeholder="e.g. Sport 2.0T, EX-L, Limited…"
              className="input-luxury max-w-sm"
            />
          </div>
        </Section>

        {/* Color swatches */}
        <Section title="Color">
          <div className="flex flex-wrap gap-2.5">
            {COLORS.map((c) => {
              const selected = filters.colors?.includes(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => toggleColor(c.name)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150"
                  style={{
                    background: selected ? 'rgba(201,168,76,0.12)' : 'rgba(30,35,48,0.6)',
                    border: `1px solid ${selected ? 'rgba(201,168,76,0.4)' : 'rgba(30,35,48,0.8)'}`,
                    color: selected ? '#C9A84C' : '#6B7280',
                  }}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{
                      background: c.hex,
                      border: '1px solid rgba(255,255,255,0.15)',
                      boxShadow: selected ? `0 0 0 2px rgba(201,168,76,0.5)` : 'none',
                    }}
                  />
                  {c.name}
                </button>
              );
            })}
          </div>
          {filters.colors && filters.colors.length > 0 && (
            <button
              type="button"
              onClick={() => setField('colors', [])}
              className="text-xs text-muted hover:text-gold mt-2 transition-colors"
            >
              Clear colors
            </button>
          )}
        </Section>

        {/* Mileage, Star Rating, Radius */}
        <Section title="Condition & Location">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Max mileage */}
            <div>
              <Label>Max Mileage: <span className="text-gold">{(filters.maxMileage || 0).toLocaleString()} mi</span></Label>
              <input
                type="range"
                min={0}
                max={200000}
                step={5000}
                value={filters.maxMileage}
                onChange={(e) => setField('maxMileage', parseInt(e.target.value))}
                className="w-full mt-2 accent-gold"
                style={{ accentColor: '#C9A84C' }}
              />
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>0</span><span>200k</span>
              </div>
            </div>

            {/* Min star rating */}
            <div>
              <Label>Min Condition Rating</Label>
              <div className="flex items-center gap-3 mt-2">
                <StarRating
                  rating={filters.minStarRating || 1}
                  interactive
                  onChange={(r) => setField('minStarRating', r)}
                  size={22}
                />
                <span className="text-sm text-muted">{filters.minStarRating}+ stars</span>
              </div>
            </div>

            {/* Radius */}
            <div>
              <Label>Search Radius</Label>
              <select
                value={filters.radius}
                onChange={(e) => setField('radius', e.target.value)}
                className="input-luxury mt-1"
              >
                {RADIUS_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        {/* Auction sites selection */}
        <Section title="Auction Sites to Search">
          {sitesLoading ? (
            <div className="flex items-center gap-2 text-muted text-sm">
              <span className="spinner-gold w-4 h-4" /> Loading your auction sites…
            </div>
          ) : sites.length === 0 ? (
            <div className="text-sm text-muted">
              No auction sites configured yet.{' '}
              <a href="/auction-sites" className="text-gold hover:underline">Add auction sites</a> to start searching.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {sites.map((site) => {
                const selected = filters.selectedSiteIds?.includes(site.id);
                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => toggleSite(site.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150"
                    style={{
                      background: selected ? 'rgba(201,168,76,0.12)' : 'rgba(30,35,48,0.6)',
                      border: `1px solid ${selected ? 'rgba(201,168,76,0.4)' : 'rgba(30,35,48,0.8)'}`,
                      color: selected ? '#C9A84C' : '#6B7280',
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full transition-all"
                      style={{ background: selected ? '#C9A84C' : '#1E2330' }}
                    />
                    {site.siteName}
                  </button>
                );
              })}
              {sites.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setField(
                      'selectedSiteIds',
                      filters.selectedSiteIds?.length === sites.length
                        ? []
                        : sites.map((s) => s.id)
                    )
                  }
                  className="text-xs text-muted hover:text-gold px-3 py-2 transition-colors"
                >
                  {filters.selectedSiteIds?.length === sites.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
          )}
        </Section>

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-2.5 rounded-xl px-4 py-3 mb-4 text-sm"
            style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', color: '#f87171' }}
          >
            <AlertCircle size={15} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-center py-4">
          <button
            type="submit"
            disabled={searching}
            className="btn-gold-shimmer flex items-center gap-3 px-12 py-4 text-base font-bold rounded-xl"
            style={{ minWidth: '260px', opacity: searching ? 0.8 : 1 }}
          >
            {searching ? (
              <>
                <span className="spinner-gold w-5 h-5" />
                Searching {filters.selectedSiteIds?.length} auction site{filters.selectedSiteIds?.length !== 1 ? 's' : ''}…
              </>
            ) : (
              <>
                <SearchIcon size={18} />
                Search All Auctions
              </>
            )}
          </button>
        </div>
      </form>

      {/* Save Search Modal */}
      <Modal open={saveModalOpen} onClose={() => setSaveModalOpen(false)} title="Save This Search">
        <p className="text-sm text-muted mb-4">Name this search to run it again quickly from Saved Searches.</p>
        <input
          type="text"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          placeholder="e.g. Low-Mile SUVs Under 50k"
          className="input-luxury mb-4"
          onKeyDown={(e) => e.key === 'Enter' && handleSaveSearch()}
          autoFocus
        />
        <div className="flex gap-3">
          <button onClick={() => setSaveModalOpen(false)} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={handleSaveSearch}
            disabled={saving || !saveName.trim()}
            className="btn-gold flex-1 flex items-center justify-center gap-2"
          >
            {saving ? <><span className="spinner-gold w-4 h-4" /> Saving…</> : 'Save Search'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="glass-card p-6 mb-4"
      style={{ animation: 'fadeUp 0.5s ease both' }}
    >
      <h2 className="text-xs font-bold text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="w-4 h-px bg-gold/50 inline-block" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}
