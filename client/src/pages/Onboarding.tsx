import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, AlertCircle } from 'lucide-react';
import { authClient } from '../auth';
import { useAuth } from '../context/AuthContext';

export default function Onboarding() {
  const { data: session } = authClient.useSession();
  const { saveProfile } = useAuth();
  const navigate = useNavigate();

  const [dealershipName, setDealershipName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!session) {
    navigate('/login', { replace: true });
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!dealershipName.trim()) return setError('Dealership name is required.');

    setSaving(true);
    try {
      await saveProfile(dealershipName.trim(), session!.user.name ?? '');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0A0C10' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-md" style={{ animation: 'fadeUp 0.5s ease both' }}>
        <div className="rounded-2xl p-8"
          style={{
            background: 'rgba(18,21,28,0.92)',
            border: '1px solid rgba(30,35,48,0.9)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C97A)', boxShadow: '0 8px 24px rgba(201,168,76,0.3)' }}
            >
              <Building2 size={24} color="#0A0C10" />
            </div>
            <h1 className="font-display text-2xl font-bold text-off-white">One Last Step</h1>
            <p className="text-muted text-sm mt-1.5 text-center">
              Tell us your dealership name to personalise your experience.
            </p>
            <div className="gold-divider w-24 mt-4" />
          </div>

          <p className="text-xs text-muted text-center mb-6">
            Signed in as <span className="text-gold/80">{session.user.email}</span>
          </p>

          {error && (
            <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 mb-4 text-sm"
              style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', color: '#f87171' }}
            >
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Dealership Name
              </label>
              <input
                type="text"
                value={dealershipName}
                onChange={(e) => { setDealershipName(e.target.value); setError(''); }}
                placeholder="e.g. Premier Auto Group"
                className="input-luxury"
                autoFocus
              />
            </div>

            <button type="submit" disabled={saving}
              className="btn-gold-shimmer w-full py-3.5 text-sm font-bold mt-2"
              style={{ opacity: saving ? 0.7 : 1 }}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2.5">
                  <span className="spinner-gold w-4 h-4" />
                  Saving…
                </span>
              ) : (
                'Enter Auction Tracker'
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={() => authClient.signOut().then(() => navigate('/login', { replace: true }))}
            className="w-full mt-3 text-xs text-muted hover:text-off-white text-center transition-colors py-1"
          >
            Sign out and use a different account
          </button>
        </div>
      </div>
    </div>
  );
}
