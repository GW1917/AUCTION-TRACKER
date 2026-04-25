import { useState, useEffect } from 'react';
import { Copy, Check, UserCheck, UserX, Crown, Shield, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

interface Member {
  id: string;
  email: string;
  fullName: string;
  role: 'owner' | 'admin' | 'member';
  createdAt: string;
}

interface Pending {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

const ROLE_ICONS = {
  owner: Crown,
  admin: Shield,
  member: User,
};

const ROLE_COLORS: Record<string, string> = {
  owner: '#C9A84C',
  admin: '#60a5fa',
  member: '#9CA3AF',
};

export default function Settings() {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isOwner = profile?.role === 'owner';

  useEffect(() => {
    async function load() {
      try {
        const [membersRes, pendingRes] = await Promise.all([
          api.get('/dealership/members'),
          api.get('/dealership/pending'),
        ]);
        setMembers(membersRes.data);
        setPending(pendingRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function copyCode() {
    if (!profile?.accessCode) return;
    navigator.clipboard.writeText(profile.accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function approveMember(userId: string) {
    setActionLoading(userId);
    try {
      const { data } = await api.post(`/dealership/approve/${userId}`);
      setPending(p => p.filter(u => u.id !== userId));
      setMembers(m => [...m, { ...data, role: 'member' }]);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  async function removeMember(userId: string) {
    setActionLoading(userId);
    try {
      await api.delete(`/dealership/remove/${userId}`);
      setMembers(m => m.filter(u => u.id !== userId));
      setPending(p => p.filter(u => u.id !== userId));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  async function changeRole(userId: string, role: 'admin' | 'member') {
    setActionLoading(userId + role);
    try {
      const { data } = await api.put(`/dealership/role/${userId}`, { role });
      setMembers(m => m.map(u => u.id === data.id ? { ...u, role: data.role } : u));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-2">
      <div>
        <h1 className="font-display text-2xl font-bold text-off-white">Settings</h1>
        <p className="text-muted text-sm mt-1">{profile?.dealershipName}</p>
      </div>

      {/* Access Code */}
      <section className="rounded-2xl p-6 space-y-4"
        style={{ background: 'rgba(18,21,28,0.92)', border: '1px solid rgba(30,35,48,0.9)' }}>
        <div>
          <h2 className="font-semibold text-off-white text-base">Dealership Access Code</h2>
          <p className="text-muted text-sm mt-0.5">Share this code with team members so they can request to join.</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl py-4 px-5 relative"
          style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)' }}>
          <span className="font-mono text-2xl font-bold text-gold tracking-[0.2em] flex-1">
            {profile?.accessCode ?? '—'}
          </span>
          <button onClick={copyCode}
            className="p-2 rounded-lg transition-all flex-shrink-0"
            style={{ color: copied ? '#4ade80' : '#C9A84C', background: 'rgba(201,168,76,0.1)' }}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </section>

      {/* Pending Approvals */}
      <section className="rounded-2xl p-6 space-y-4"
        style={{ background: 'rgba(18,21,28,0.92)', border: '1px solid rgba(30,35,48,0.9)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-off-white text-base">Pending Approvals</h2>
            <p className="text-muted text-sm mt-0.5">New members waiting for access</p>
          </div>
          {pending.length > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}>
              {pending.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-6 text-muted text-sm">Loading…</div>
        ) : pending.length === 0 ? (
          <div className="text-center py-6 text-muted text-sm">No pending requests</div>
        ) : (
          <ul className="space-y-2">
            {pending.map(p => (
              <li key={p.id} className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-off-white truncate">{p.fullName || '—'}</div>
                  <div className="text-xs text-muted truncate">{p.email}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => approveMember(p.id)}
                    disabled={actionLoading === p.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>
                    <UserCheck size={13} />
                    Approve
                  </button>
                  <button
                    onClick={() => removeMember(p.id)}
                    disabled={actionLoading === p.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: 'rgba(231,76,60,0.1)', color: '#f87171', border: '1px solid rgba(231,76,60,0.25)' }}>
                    <UserX size={13} />
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Team Members */}
      <section className="rounded-2xl p-6 space-y-4"
        style={{ background: 'rgba(18,21,28,0.92)', border: '1px solid rgba(30,35,48,0.9)' }}>
        <div>
          <h2 className="font-semibold text-off-white text-base">Team Members</h2>
          <p className="text-muted text-sm mt-0.5">Manage roles and access</p>
        </div>

        {loading ? (
          <div className="text-center py-6 text-muted text-sm">Loading…</div>
        ) : members.length === 0 ? (
          <div className="text-center py-6 text-muted text-sm">No members yet</div>
        ) : (
          <ul className="space-y-2">
            {members.map(m => {
              const RoleIcon = ROLE_ICONS[m.role] ?? User;
              const isMe = m.id === profile?.id;
              return (
                <li key={m.id} className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-off-white truncate">{m.fullName || '—'}</span>
                      {isMe && <span className="text-xs text-muted">(you)</span>}
                    </div>
                    <div className="text-xs text-muted truncate">{m.email}</div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: `${ROLE_COLORS[m.role]}18`, color: ROLE_COLORS[m.role], border: `1px solid ${ROLE_COLORS[m.role]}33` }}>
                      <RoleIcon size={11} />
                      {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                    </div>

                    {isOwner && !isMe && m.role !== 'owner' && (
                      <div className="flex gap-1">
                        {m.role === 'member' && (
                          <button
                            onClick={() => changeRole(m.id, 'admin')}
                            disabled={actionLoading === m.id + 'admin'}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                            style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.25)' }}>
                            <Shield size={11} />
                            Make Admin
                          </button>
                        )}
                        {m.role === 'admin' && (
                          <button
                            onClick={() => changeRole(m.id, 'member')}
                            disabled={actionLoading === m.id + 'member'}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                            style={{ background: 'rgba(156,163,175,0.1)', color: '#9CA3AF', border: '1px solid rgba(156,163,175,0.2)' }}>
                            <ChevronDown size={11} />
                            Demote
                          </button>
                        )}
                        <button
                          onClick={() => removeMember(m.id)}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                          style={{ background: 'rgba(231,76,60,0.08)', color: '#f87171', border: '1px solid rgba(231,76,60,0.2)' }}>
                          <UserX size={11} />
                          Remove
                        </button>
                      </div>
                    )}

                    {!isOwner && !isMe && m.role !== 'owner' && (
                      <button
                        onClick={() => removeMember(m.id)}
                        disabled={!!actionLoading}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                        style={{ background: 'rgba(231,76,60,0.08)', color: '#f87171', border: '1px solid rgba(231,76,60,0.2)' }}>
                        <UserX size={11} />
                        Remove
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
