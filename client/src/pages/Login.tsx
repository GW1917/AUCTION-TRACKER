import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authClient } from '../auth';

type Mode = 'login' | 'register';

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({ email: '', password: '', name: '' });

  // After sign-up, wait for the session atom to populate then redirect to onboarding.
  // (Navigating immediately causes a race where the session isn't set yet.)
  const { data: session } = authClient.useSession();
  const [awaitingOnboarding, setAwaitingOnboarding] = useState(false);
  useEffect(() => {
    if (awaitingOnboarding && session) {
      navigate('/onboarding', { replace: true });
    }
  }, [session, awaitingOnboarding, navigate]);

  function setField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password) {
      return setError('Email and password are required.');
    }
    if (mode === 'register' && form.password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }
    if (mode === 'register' && !form.name.trim()) {
      return setError('Your name is required.');
    }

    setLoading(true);

    if (mode === 'login') {
      try {
        const { error: err } = await authClient.signIn.email({
          email: form.email.trim(),
          password: form.password,
        });
        if (err) {
          setError(err.message || 'Invalid email or password.');
          setLoading(false);
        }
        // Success: keep the spinner — PublicRoute will redirect to /dashboard
        // once the session atom updates (avoids race condition where navigate
        // fires before the session is persisted in the client).
      } catch (err: any) {
        setError(err?.message || 'Something went wrong. Please try again.');
        setLoading(false);
      }
    } else {
      try {
        const { error: err } = await authClient.signUp.email({
          email: form.email.trim(),
          password: form.password,
          name: form.name.trim(),
        });
        if (err) {
          setError(err.message || 'Registration failed. Try a different email.');
          setLoading(false);
        } else {
          // Keep spinner — useEffect above will navigate once session atom populates
          setAwaitingOnboarding(true);
        }
      } catch (err: any) {
        setError(err?.message || 'Something went wrong. Please try again.');
        setLoading(false);
      }
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#0A0C10' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }} />
      </div>

      <div className="relative w-full max-w-md" style={{ animation: 'fadeUp 0.6s ease both' }}>
        <div className="rounded-2xl p-8"
          style={{
            background: 'rgba(18, 21, 28, 0.92)',
            border: '1px solid rgba(30, 35, 48, 0.9)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #E8C97A 100%)', boxShadow: '0 8px 24px rgba(201,168,76,0.3)' }}
            >
              <LogoCarIcon />
            </div>
            <h1 className="font-display text-3xl font-bold text-off-white tracking-tight">Auction Tracker</h1>
            <p className="text-muted text-sm mt-1.5">Premium Vehicle Sourcing Platform</p>
            <div className="gold-divider w-24 mt-4" />
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-xl p-1 mb-6"
            style={{ background: 'rgba(10,12,16,0.7)', border: '1px solid rgba(30,35,48,0.8)' }}
          >
            {(['login', 'register'] as Mode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(''); setForm({ email: '', password: '', name: '' }); }}
                className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 capitalize"
                style={mode === m
                  ? { background: 'linear-gradient(135deg, #C9A84C, #E8C97A)', color: '#0A0C10', boxShadow: '0 2px 8px rgba(201,168,76,0.3)' }
                  : { color: '#6B7280' }}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 mb-4 text-sm"
              style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', color: '#f87171' }}
            >
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="e.g. James Whitfield"
                  className="input-luxury"
                  autoFocus
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="you@dealership.com"
                className="input-luxury"
                autoComplete="email"
                autoFocus={mode === 'login'}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Password {mode === 'register' && <span className="text-muted/60 normal-case font-normal">— min. 8 characters</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  placeholder={mode === 'register' ? 'Create a strong password' : 'Enter your password'}
                  className="input-luxury pr-11"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-off-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-gold-shimmer w-full py-3.5 text-sm font-bold mt-2"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <span className="spinner-gold w-4 h-4" />
                  {mode === 'login' ? 'Signing In…' : 'Creating Account…'}
                </span>
              ) : (
                mode === 'login' ? 'Sign In to Auction Tracker' : 'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted/60 mt-6">
            Secured by <span className="text-gold/70">Neon Auth</span> · Professional access for licensed dealerships only.
          </p>
        </div>
      </div>
    </div>
  );
}

function LogoCarIcon() {
  return (
    <svg viewBox="0 0 48 32" fill="none" className="w-8 h-6">
      <path d="M6 22 L10 13 L20 9 L36 9 L42 13 L46 18 L46 24 L6 24 Z" fill="#0A0C10" opacity="0.9" />
      <path d="M17 10 L24 7 L32 10 L38 16 L13 16 Z" fill="#0A0C10" opacity="0.4" />
      <circle cx="14" cy="26" r="5" fill="#0A0C10" />
      <circle cx="34" cy="26" r="5" fill="#0A0C10" />
    </svg>
  );
}
