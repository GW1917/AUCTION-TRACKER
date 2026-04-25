import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Globe, Bookmark, TrendingUp, ChevronRight, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ auctionSites: 0, savedSearches: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/auction-sites').catch(() => ({ data: [] })),
      api.get('/saved-searches').catch(() => ({ data: [] })),
    ]).then(([sitesRes, searchesRes]) => {
      setStats({ auctionSites: sitesRes.data.length, savedSearches: searchesRes.data.length });
    });
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10" style={{ animation: 'fadeUp 0.5s ease both' }}>
        <p className="text-muted text-sm font-medium mb-1">
          {greeting}, <span className="text-gold">{profile?.dealershipName}</span>
        </p>
        <h1 className="font-display text-4xl font-bold text-off-white">
          Welcome back, {profile?.fullName?.split(' ')[0] ?? '…'}.
        </h1>
        <p className="text-muted mt-2 text-sm">Your vehicle sourcing command center — search smarter, close faster.</p>
        <div className="gold-divider w-40 mt-4" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 stagger-children" style={{ animation: 'fadeUp 0.5s ease 100ms both' }}>
        <StatCard icon={<Globe size={20} />} label="Auction Sites" value={stats.auctionSites}
          action={() => navigate('/auction-sites')} actionLabel={stats.auctionSites === 0 ? 'Add your first site' : 'Manage sites'} color="blue" />
        <StatCard icon={<Bookmark size={20} />} label="Saved Searches" value={stats.savedSearches}
          action={() => navigate('/saved-searches')} actionLabel={stats.savedSearches === 0 ? 'No saved searches' : 'View all'} color="purple" />
        <StatCard icon={<TrendingUp size={20} />} label="Connectors Ready" value={7}
          action={() => navigate('/search')} actionLabel="Start searching" color="gold" />
      </div>

      {/* Main CTA */}
      <div className="rounded-2xl p-8 mb-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(18,21,28,0.95), rgba(24,27,36,0.95))',
          border: '1px solid rgba(201,168,76,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 0 60px rgba(201,168,76,0.03)',
          animation: 'fadeUp 0.5s ease 200ms both',
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
              style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}
            >
              <Search size={11} /> Multi-Site Search
            </div>
            <h2 className="font-display text-2xl font-bold text-off-white mb-2">Search All Auction Sites at Once</h2>
            <p className="text-muted text-sm leading-relaxed max-w-md">
              Filter by year, make, model, mileage, star rating, and radius. All your configured auction sites return results simultaneously.
            </p>
          </div>
          <button onClick={() => navigate('/search')}
            className="btn-gold-shimmer flex-shrink-0 flex items-center gap-2.5 px-8 py-4 text-base font-bold rounded-xl"
          >
            <Search size={18} /> Start New Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ animation: 'fadeUp 0.5s ease 300ms both' }}>
        <QuickActionCard icon={<Plus size={18} />} title="Add Auction Site"
          description="Connect Manheim, ADESA, ACV, BacklotCars, and more." onClick={() => navigate('/auction-sites')} />
        <QuickActionCard icon={<Bookmark size={18} />} title="Saved Searches"
          description="Instantly re-run your most-used vehicle search configurations." onClick={() => navigate('/saved-searches')} />
      </div>

      <div className="mt-8 rounded-xl px-5 py-3 flex items-start gap-3"
        style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.1)' }}
      >
        <span className="text-gold text-lg mt-0.5">⚡</span>
        <p className="text-xs text-muted leading-relaxed">
          Currently running with <strong className="text-off-white">mock data</strong>. Replace connector files in{' '}
          <code className="text-gold/80 text-xs bg-gold/10 px-1 py-0.5 rounded">server/src/connectors/</code>{' '}
          with real authenticated API calls or Puppeteer scrapers.
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, action, actionLabel, color }: {
  icon: React.ReactNode; label: string; value: number;
  action: () => void; actionLabel: string; color: 'blue' | 'purple' | 'gold';
}) {
  const colorMap = {
    blue:   { bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)',  text: '#60a5fa' },
    purple: { bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.2)',  text: '#a78bfa' },
    gold:   { bg: 'rgba(201,168,76,0.1)',  border: 'rgba(201,168,76,0.2)',  text: '#C9A84C' },
  };
  const c = colorMap[color];
  return (
    <div className="glass-card p-5 cursor-pointer group transition-all duration-200" onClick={action} style={{ borderColor: c.border }}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.bg, color: c.text }}>{icon}</div>
        <ChevronRight size={16} className="text-muted group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
      </div>
      <div className="font-display text-3xl font-bold text-off-white mb-1">{value}</div>
      <div className="text-sm text-muted mb-2">{label}</div>
      <div className="text-xs font-medium" style={{ color: c.text }}>{actionLabel}</div>
    </div>
  );
}

function QuickActionCard({ icon, title, description, onClick }: {
  icon: React.ReactNode; title: string; description: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="glass-card glass-card-hover p-5 text-left w-full flex items-start gap-4 group">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-105"
        style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}
      >{icon}</div>
      <div>
        <h3 className="font-semibold text-off-white text-sm mb-1">{title}</h3>
        <p className="text-xs text-muted leading-relaxed">{description}</p>
      </div>
      <ChevronRight size={16} className="ml-auto text-muted group-hover:text-gold flex-shrink-0 mt-0.5 transition-colors" />
    </button>
  );
}
