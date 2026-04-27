import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Search, Globe, Bookmark, Bell, LogOut, ChevronRight, Settings } from 'lucide-react';
import { authClient } from '../auth';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/search',         icon: Search,          label: 'Search Vehicles' },
  { to: '/auction-sites',  icon: Globe,           label: 'Auction Sites' },
  { to: '/saved-searches', icon: Bookmark,        label: 'Saved Searches' },
  { to: '/results',        icon: Bell,            label: 'Results & Alerts' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isOwnerOrAdmin = profile?.role === 'owner' || profile?.role === 'admin';

  async function handleSignOut() {
    await authClient.signOut();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-20"
      style={{
        background: 'rgba(12, 14, 20, 0.95)',
        borderRight: '1px solid rgba(30, 35, 48, 0.8)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Logo */}
      <div className="px-3 py-4 border-b border-border/50">
        {profile?.logoData ? (
          <div className="flex items-center">
            <img
              src={profile.logoData}
              alt={profile.dealershipName ?? 'Dealership logo'}
              className="w-full max-h-40 object-contain rounded"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C97A)' }}
            >
              <CarIcon />
            </div>
            <div>
              <div className="font-display font-bold text-off-white text-base leading-tight">Auction</div>
              <div className="font-display font-bold text-gold text-base leading-tight -mt-0.5">Tracker</div>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="mb-2 px-3">
          <span className="text-xs font-semibold text-muted uppercase tracking-widest">Navigation</span>
        </div>
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative group ${
                    isActive ? 'text-off-white' : 'text-muted hover:text-off-white hover:bg-white/[0.04]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl"
                        style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))', border: '1px solid rgba(201,168,76,0.2)' }}
                      />
                    )}
                    <Icon size={18} className={`relative z-10 flex-shrink-0 ${isActive ? 'text-gold' : 'text-current'}`} />
                    <span className="relative z-10">{label}</span>
                    {isActive && <ChevronRight size={14} className="relative z-10 ml-auto text-gold/60" />}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="gold-divider mx-3" />

      <div className="px-3 py-4 space-y-1">
        {isOwnerOrAdmin && (
          <NavLink to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative group ${
                isActive ? 'text-off-white' : 'text-muted hover:text-off-white hover:bg-white/[0.04]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute inset-0 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))', border: '1px solid rgba(201,168,76,0.2)' }}
                  />
                )}
                <Settings size={18} className={`relative z-10 flex-shrink-0 ${isActive ? 'text-gold' : 'text-current'}`} />
                <span className="relative z-10">Settings</span>
                {isActive && <ChevronRight size={14} className="relative z-10 ml-auto text-gold/60" />}
              </>
            )}
          </NavLink>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-danger hover:bg-danger/10 transition-all duration-150 w-full"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

function CarIcon() {
  return (
    <svg viewBox="0 0 24 16" fill="none" className="w-5 h-4">
      <path d="M3 10L5 5H19L21 10L22 12V14H18.5C18.5 14 18 12 16 12C14 12 13.5 14 13.5 14H10.5C10.5 14 10 12 8 12C6 12 5.5 14 5.5 14H2V12L3 10Z"
        fill="#0A0C10" />
      <circle cx="8" cy="14" r="2" fill="#0A0C10" />
      <circle cx="16" cy="14" r="2" fill="#0A0C10" />
    </svg>
  );
}
