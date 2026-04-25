import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Play, Trash2, Search, AlertCircle, Calendar, SlidersHorizontal } from 'lucide-react';
import api from '../api';
import type { SavedSearch, AuctionSite } from '../types';

export default function SavedSearches() {
  const navigate = useNavigate();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sites, setSites] = useState<AuctionSite[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/saved-searches'),
      api.get('/auction-sites'),
    ])
      .then(([searchesRes, sitesRes]) => {
        setSearches(searchesRes.data);
        setSites(sitesRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleRunAgain(saved: SavedSearch) {
    setRunningId(saved.id);
    try {
      const selectedSiteIds = saved.filters.selectedSiteIds?.length
        ? saved.filters.selectedSiteIds
        : sites.map((s) => s.id);

      const { data } = await api.post('/search', {
        filters: saved.filters,
        selectedSiteIds,
      });

      navigate('/results', {
        state: {
          listings: data.listings,
          total: data.total,
          sitesSearched: data.sitesSearched,
          filters: saved.filters,
        },
      });
    } catch {
      /* handled silently */
    } finally {
      setRunningId(null);
    }
  }

  async function handleDelete(id: string) {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }
    try {
      await api.delete(`/saved-searches/${id}`);
      setSearches((prev) => prev.filter((s) => s.id !== id));
    } catch {
      /* handled silently */
    }
    setDeleteConfirm(null);
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8" style={{ animation: 'fadeUp 0.5s ease both' }}>
        <div>
          <p className="text-muted text-sm mb-1 flex items-center gap-1.5">
            <Bookmark size={13} /> Saved Configurations
          </p>
          <h1 className="font-display text-3xl font-bold text-off-white">Saved Searches</h1>
          <p className="text-muted text-sm mt-1.5">Re-run your favorite vehicle search configurations instantly.</p>
        </div>
        <button onClick={() => navigate('/search')} className="btn-gold flex items-center gap-2 flex-shrink-0">
          <Search size={14} /> New Search
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="spinner-gold w-8 h-8" />
        </div>
      ) : searches.length === 0 ? (
        <EmptyState onNew={() => navigate('/search')} />
      ) : (
        <div className="space-y-4 stagger-children">
          {searches.map((saved, i) => (
            <SavedSearchCard
              key={saved.id}
              saved={saved}
              index={i}
              isRunning={runningId === saved.id}
              onRun={() => handleRunAgain(saved)}
              onDelete={() => handleDelete(saved.id)}
              pendingDelete={deleteConfirm === saved.id}
            />
          ))}
        </div>
      )}

      {/* Delete toast */}
      {deleteConfirm && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-medium z-50 flex items-center gap-3"
          style={{ background: '#12151C', border: '1px solid rgba(231,76,60,0.4)', color: '#f87171', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        >
          <AlertCircle size={15} />
          Click Delete again to confirm removal
        </div>
      )}
    </div>
  );
}

function SavedSearchCard({ saved, index, isRunning, onRun, onDelete, pendingDelete }: {
  saved: SavedSearch;
  index: number;
  isRunning: boolean;
  onRun: () => void;
  onDelete: () => void;
  pendingDelete: boolean;
}) {
  const f = saved.filters;

  const chips: string[] = [];
  if (f.make) chips.push(f.make);
  if (f.model) chips.push(f.model);
  if (f.yearFrom || f.yearTo) chips.push(`${f.yearFrom || ''}–${f.yearTo || 'now'}`);
  if (f.maxMileage) chips.push(`≤${Number(f.maxMileage).toLocaleString()} mi`);
  if (f.minStarRating) chips.push(`${f.minStarRating}+ ★`);
  if (f.radius && f.radius !== 'nationwide') chips.push(`${f.radius} mi radius`);
  else if (f.radius === 'nationwide') chips.push('Nationwide');
  if (f.colors?.length) chips.push(f.colors.join(', '));

  return (
    <div
      className="glass-card glass-card-hover p-5 flex flex-col sm:flex-row sm:items-center gap-4"
      style={{ animation: `fadeUp 0.4s ease ${index * 80}ms both` }}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }}
      >
        <SlidersHorizontal size={18} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-off-white text-base mb-1.5 truncate">
          {saved.searchName}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {chips.length > 0 ? (
            chips.map((chip) => (
              <span
                key={chip}
                className="inline-block px-2 py-0.5 rounded-md text-xs font-medium"
                style={{ background: 'rgba(30,35,48,0.8)', color: '#9BA5AF', border: '1px solid rgba(30,35,48,0.9)' }}
              >
                {chip}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted">All vehicles</span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs text-muted/60">
          <Calendar size={11} />
          Saved {new Date(saved.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onDelete}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted transition-all duration-150"
          style={{
            background: pendingDelete ? 'rgba(231,76,60,0.15)' : 'transparent',
            border: `1px solid ${pendingDelete ? 'rgba(231,76,60,0.4)' : 'rgba(30,35,48,0.8)'}`,
            color: pendingDelete ? '#f87171' : '#6B7280',
          }}
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
        <button
          onClick={onRun}
          disabled={isRunning}
          className="btn-gold flex items-center gap-2 px-4 py-2 text-sm rounded-xl"
          style={{ opacity: isRunning ? 0.7 : 1 }}
        >
          {isRunning ? (
            <><span className="spinner-gold w-4 h-4" /> Running…</>
          ) : (
            <><Play size={14} /> Run Again</>
          )}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)' }}
      >
        <Bookmark size={32} className="text-gold/50" />
      </div>
      <h3 className="font-display text-xl font-semibold text-off-white mb-2">No Saved Searches</h3>
      <p className="text-muted text-sm max-w-xs mb-6 leading-relaxed">
        Run a search and click "Save Search" to store your filter configuration here for quick re-use.
      </p>
      <button onClick={onNew} className="btn-gold flex items-center gap-2">
        <Search size={15} /> Run a Search
      </button>
    </div>
  );
}
