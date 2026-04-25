import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, AlertCircle, Copy, Check, ArrowLeft, Clock } from 'lucide-react';
import { authClient } from '../auth';
import { useAuth, type CreatePayload, type JoinPayload } from '../context/AuthContext';

type Step = 'choose' | 'create' | 'join' | 'code' | 'pending';

export default function Onboarding() {
  const { data: session } = authClient.useSession();
  const { saveProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('choose');
  const [fullName, setFullName] = useState(session?.user?.name ?? '');
  const [dealershipName, setDealershipName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!session) {
    navigate('/login', { replace: true });
    return null;
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) return setError('Your name is required.');
    if (!dealershipName.trim()) return setError('Dealership name is required.');

    setSaving(true);
    try {
      const payload: CreatePayload = { flow: 'create', dealershipName: dealershipName.trim(), fullName: fullName.trim() };
      const profile = await saveProfile(payload);
      setGeneratedCode(profile.accessCode);
      setStep('code');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create dealership.');
    } finally {
      setSaving(false);
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) return setError('Your name is required.');
    if (!accessCode.trim()) return setError('Access code is required.');

    setSaving(true);
    try {
      const payload: JoinPayload = { flow: 'join', accessCode: accessCode.trim(), fullName: fullName.trim() };
      await saveProfile(payload);
      setStep('pending');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid access code.');
    } finally {
      setSaving(false);
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C97A)', boxShadow: '0 8px 24px rgba(201,168,76,0.3)' }}
            >
              <Building2 size={24} color="#0A0C10" />
            </div>
            <h1 className="font-display text-2xl font-bold text-off-white">
              {step === 'choose'  && 'Set Up Your Account'}
              {step === 'create'  && 'Create Dealership'}
              {step === 'join'    && 'Join a Dealership'}
              {step === 'code'    && 'Dealership Created!'}
              {step === 'pending' && 'Request Sent!'}
            </h1>
            <div className="gold-divider w-24 mt-3" />
          </div>

          {error && (
            <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 mb-4 text-sm"
              style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', color: '#f87171' }}
            >
              <AlertCircle size={15} className="flex-shrink-0" /> {error}
            </div>
          )}

          {/* STEP: Choose */}
          {step === 'choose' && (
            <div className="space-y-3">
              <p className="text-muted text-sm text-center mb-5">Are you setting up a new dealership or joining an existing one?</p>
              <button onClick={() => setStep('create')}
                className="w-full rounded-xl p-5 text-left flex items-center gap-4 transition-all duration-150 group"
                style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.2)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>
                  <Building2 size={18} />
                </div>
                <div>
                  <div className="font-semibold text-off-white text-sm">Create a New Dealership</div>
                  <div className="text-xs text-muted mt-0.5">You'll get a unique access code to share with your team</div>
                </div>
              </button>

              <button onClick={() => setStep('join')}
                className="w-full rounded-xl p-5 text-left flex items-center gap-4 transition-all duration-150 group"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#9CA3AF' }}>
                  <Users size={18} />
                </div>
                <div>
                  <div className="font-semibold text-off-white text-sm">Join an Existing Dealership</div>
                  <div className="text-xs text-muted mt-0.5">Enter the access code from your dealership admin</div>
                </div>
              </button>
            </div>
          )}

          {/* STEP: Create */}
          {step === 'create' && (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Your Full Name</label>
                <input type="text" value={fullName} onChange={e => { setFullName(e.target.value); setError(''); }}
                  placeholder="e.g. James Whitfield" className="input-luxury" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Dealership Name</label>
                <input type="text" value={dealershipName} onChange={e => { setDealershipName(e.target.value); setError(''); }}
                  placeholder="e.g. Premier Auto Group" className="input-luxury" />
              </div>
              <button type="submit" disabled={saving} className="btn-gold-shimmer w-full py-3.5 text-sm font-bold"
                style={{ opacity: saving ? 0.7 : 1 }}>
                {saving ? <span className="flex items-center justify-center gap-2"><span className="spinner-gold w-4 h-4" />Creating…</span> : 'Create Dealership'}
              </button>
              <button type="button" onClick={() => { setStep('choose'); setError(''); }}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-muted hover:text-off-white transition-colors py-1">
                <ArrowLeft size={12} /> Back
              </button>
            </form>
          )}

          {/* STEP: Join */}
          {step === 'join' && (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Your Full Name</label>
                <input type="text" value={fullName} onChange={e => { setFullName(e.target.value); setError(''); }}
                  placeholder="e.g. James Whitfield" className="input-luxury" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Dealership Access Code</label>
                <input type="text" value={accessCode} onChange={e => { setAccessCode(e.target.value.toUpperCase()); setError(''); }}
                  placeholder="e.g. ABC-1234" className="input-luxury tracking-widest font-mono" maxLength={8} />
                <p className="text-xs text-muted mt-1.5">Ask your dealership admin for this code.</p>
              </div>
              <button type="submit" disabled={saving} className="btn-gold-shimmer w-full py-3.5 text-sm font-bold"
                style={{ opacity: saving ? 0.7 : 1 }}>
                {saving ? <span className="flex items-center justify-center gap-2"><span className="spinner-gold w-4 h-4" />Joining…</span> : 'Join Dealership'}
              </button>
              <button type="button" onClick={() => { setStep('choose'); setError(''); }}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-muted hover:text-off-white transition-colors py-1">
                <ArrowLeft size={12} /> Back
              </button>
            </form>
          )}

          {/* STEP: Code reveal */}
          {step === 'code' && (
            <div className="text-center space-y-5">
              <p className="text-muted text-sm leading-relaxed">
                Your dealership has been created. Share this access code with your team so they can join.
              </p>
              <div className="rounded-xl py-5 px-6 relative"
                style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)' }}>
                <div className="font-mono text-3xl font-bold text-gold tracking-[0.25em]">{generatedCode}</div>
                <button onClick={copyCode}
                  className="absolute top-3 right-3 p-1.5 rounded-lg transition-all"
                  style={{ color: copied ? '#4ade80' : '#C9A84C', background: 'rgba(201,168,76,0.1)' }}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-xs text-muted">Keep this code safe — it's how your team members sign up.</p>
              <button onClick={() => navigate('/dashboard', { replace: true })}
                className="btn-gold-shimmer w-full py-3.5 text-sm font-bold">
                Enter Auction Tracker
              </button>
            </div>
          )}

          {/* STEP: Pending approval */}
          {step === 'pending' && (
            <div className="text-center space-y-5">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)' }}>
                  <Clock size={28} style={{ color: '#C9A84C' }} />
                </div>
              </div>
              <p className="text-muted text-sm leading-relaxed">
                Your request to join the dealership has been submitted. An owner or admin must approve your account before you can access the platform.
              </p>
              <p className="text-xs text-muted">Check back after your admin has approved you, then sign in again.</p>
              <button onClick={() => authClient.signOut().then(() => navigate('/login', { replace: true }))}
                className="btn-gold-shimmer w-full py-3.5 text-sm font-bold">
                Done — Sign Out
              </button>
            </div>
          )}

          {step !== 'code' && step !== 'pending' && (
            <button type="button"
              onClick={() => authClient.signOut().then(() => navigate('/login', { replace: true }))}
              className="w-full mt-4 text-xs text-muted hover:text-off-white text-center transition-colors py-1">
              Sign out and use a different account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
