import { Bell, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../auth';
import { useAuth } from '../context/AuthContext';

export default function TopNav() {
  const { profile } = useAuth();
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayName = profile?.fullName ?? session?.user.name ?? '…';
  const displayDealership = profile?.dealershipName ?? '';
  const displayEmail = profile?.email ?? session?.user.email ?? '';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  async function handleSignOut() {
    await authClient.signOut();
    navigate('/login', { replace: true });
  }

  return (
    <header
      className="fixed top-0 right-0 h-16 flex items-center px-6 z-10"
      style={{
        left: '256px',
        background: 'rgba(10, 12, 16, 0.9)',
        borderBottom: '1px solid rgba(30, 35, 48, 0.8)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:text-off-white hover:bg-white/[0.06] transition-all duration-150">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#C9A84C' }} />
        </button>

        <div className="w-px h-6 bg-border/60" />

        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-3 rounded-xl px-3 py-1.5 hover:bg-white/[0.04] transition-all duration-150"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-bg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C97A)' }}
            >
              {initials}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-sm font-medium text-off-white leading-tight">{displayName}</div>
              <div className="text-xs text-muted leading-tight">{displayDealership}</div>
            </div>
            <ChevronDown size={14} className={`text-muted transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-xl z-20 py-1 overflow-hidden"
                style={{ background: '#12151C', border: '1px solid rgba(30,35,48,0.9)', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}
              >
                <div className="px-4 py-3 border-b border-border/50">
                  <div className="text-sm font-medium text-off-white">{displayName}</div>
                  <div className="text-xs text-muted">{displayEmail}</div>
                </div>
                <button
                  onClick={() => { handleSignOut(); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
