import { useState, useEffect, useRef } from 'react';
import {
  Copy, Check, UserCheck, UserX, Crown, Shield, User,
  ChevronDown, Pencil, X, ImagePlus, Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

interface Member {
  id: string;
  email: string;
  fullName: string;
  role: 'owner' | 'admin' | 'member';
  lastSeenAt: string | null;
  createdAt: string;
}

interface Pending {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

const ROLE_ICONS = { owner: Crown, admin: Shield, member: User };
const ROLE_COLORS: Record<string, string> = {
  owner: '#C9A84C',
  admin: '#60a5fa',
  member: '#9CA3AF',
};
const ROLE_LABEL: Record<string, string> = { owner: 'Owner', admin: 'Admin', member: 'Member' };

function isOnline(lastSeenAt: string | null): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < 5 * 60 * 1000;
}

export default function Settings() {
  const { profile, updateProfile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // name editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // logo
  const [logoUploading, setLogoUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isOwner = profile?.role === 'owner';
  const isOwnerOrAdmin = profile?.role === 'owner' || profile?.role === 'admin';

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
      setMembers(m => [...m, { ...data, role: 'member', lastSeenAt: null }]);
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

  function startEdit(m: Member) {
    setEditingId(m.id);
    setEditName(m.fullName);
  }

  async function saveName(userId: string) {
    if (!editName.trim()) return;
    setActionLoading('name-' + userId);
    try {
      const { data } = await api.put(`/dealership/member/${userId}/name`, { fullName: editName });
      setMembers(m => m.map(u => u.id === userId ? { ...u, fullName: data.fullName } : u));
      if (userId === profile?.id) updateProfile({ fullName: data.fullName });
      setEditingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    setLogoUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const logoData = reader.result as string;
        const { data } = await api.put('/dealership/logo', { logoData });
        updateProfile({ logoData: data.logoData });
      } catch (err) {
        console.error(err);
      } finally {
        setLogoUploading(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  }

  async function removeLogo() {
    setLogoUploading(true);
    try {
      await api.delete('/dealership/logo');
      updateProfile({ logoData: undefined });
    } catch (err) {
      console.error(err);
    } finally {
      setLogoUploading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-2">
      <div>
        <h1 className="font-display text-2xl font-bold text-off-white">Settings</h1>
        <p className="text-muted text-sm mt-1">{profile?.dealershipName}</p>
      </div>

      {/* Dealership Logo */}
      <section className="rounded-2xl p-6 space-y-4"
        style={{ background: 'rgba(18,21,28,0.92)', border: '1px solid rgba(30,35,48,0.9)' }}>
        <div>
          <h2 className="font-semibold text-off-white text-base">Dealership Logo</h2>
          <p className="text-muted text-sm mt-0.5">Shown throughout the app to represent your dealership.</p>
        </div>

        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {profile?.logoData
              ? <img src={profile.logoData} alt="Logo" className="w-full h-full object-contain" />
              : <ImagePlus size={24} style={{ color: '#4B5563' }} />
            }
          </div>

          <div className="flex flex-col gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={logoUploading || !isOwnerOrAdmin}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)', opacity: !isOwnerOrAdmin ? 0.5 : 1 }}>
              <ImagePlus size={14} />
              {logoUploading ? 'Uploading…' : profile?.logoData ? 'Replace Logo' : 'Upload Logo'}
            </button>
            {profile?.logoData && isOwnerOrAdmin && (
              <button
                onClick={removeLogo}
                disabled={logoUploading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'rgba(231,76,60,0.08)', color: '#f87171', border: '1px solid rgba(231,76,60,0.2)' }}>
                <Trash2 size={14} />
                Remove Logo
              </button>
            )}
            <p className="text-xs text-muted">PNG, JPG, or SVG — max ~750KB</p>
          </div>
        </div>
      </section>

      {/* Access Code */}
      <section className="rounded-2xl p-6 space-y-4"
        style={{ background: 'rgba(18,21,28,0.92)', border: '1px solid rgba(30,35,48,0.9)' }}>
        <div>
          <h2 className="font-semibold text-off-white text-base">Dealership Access Code</h2>
          <p className="text-muted text-sm mt-0.5">Share this code with team members so they can request to join.</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl py-4 px-5"
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
                  <button onClick={() => approveMember(p.id)} disabled={actionLoading === p.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>
                    <UserCheck size={13} /> Approve
                  </button>
                  <button onClick={() => removeMember(p.id)} disabled={actionLoading === p.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: 'rgba(231,76,60,0.1)', color: '#f87171', border: '1px solid rgba(231,76,60,0.25)' }}>
                    <UserX size={13} /> Reject
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
              const online = isOnline(m.lastSeenAt);
              const isEditing = editingId === m.id;

              return (
                <li key={m.id} className="rounded-xl px-4 py-3 space-y-2"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

                  <div className="flex items-center gap-3">
                    {/* Online dot */}
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <RoleIcon size={14} style={{ color: ROLE_COLORS[m.role] }} />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                        style={{
                          borderColor: '#12151C',
                          background: online ? '#4ade80' : '#374151',
                        }} />
                    </div>

                    {/* Name / edit */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveName(m.id); if (e.key === 'Escape') setEditingId(null); }}
                            className="flex-1 bg-transparent border-b text-sm text-off-white outline-none py-0.5 min-w-0"
                            style={{ borderColor: 'rgba(201,168,76,0.5)' }}
                          />
                          <button onClick={() => saveName(m.id)} disabled={actionLoading === 'name-' + m.id}
                            className="text-xs px-2 py-1 rounded-lg font-semibold"
                            style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80' }}>
                            Save
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="p-1 rounded-lg text-muted hover:text-off-white transition-colors">
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-off-white truncate">{m.fullName || '—'}</span>
                          {isMe && <span className="text-xs text-muted">(you)</span>}
                          {isOwnerOrAdmin && (
                            <button onClick={() => startEdit(m)}
                              className="p-1 rounded-md opacity-40 hover:opacity-100 transition-opacity"
                              style={{ color: '#C9A84C' }}>
                              <Pencil size={11} />
                            </button>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted truncate">{m.email}</span>
                        <span className="text-xs"
                          style={{ color: online ? '#4ade80' : '#6B7280' }}>
                          {online ? '● Online' : '○ Offline'}
                        </span>
                      </div>
                    </div>

                    {/* Role badge */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: `${ROLE_COLORS[m.role]}18`, color: ROLE_COLORS[m.role], border: `1px solid ${ROLE_COLORS[m.role]}33` }}>
                      <RoleIcon size={11} />
                      {ROLE_LABEL[m.role]}
                    </div>
                  </div>

                  {/* Action buttons */}
                  {!isMe && m.role !== 'owner' && (
                    <div className="flex gap-1.5 pl-11 flex-wrap">
                      {isOwner && m.role === 'member' && (
                        <button onClick={() => changeRole(m.id, 'admin')} disabled={actionLoading === m.id + 'admin'}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                          style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.25)' }}>
                          <Shield size={11} /> Make Admin
                        </button>
                      )}
                      {isOwner && m.role === 'admin' && (
                        <button onClick={() => changeRole(m.id, 'member')} disabled={actionLoading === m.id + 'member'}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                          style={{ background: 'rgba(156,163,175,0.1)', color: '#9CA3AF', border: '1px solid rgba(156,163,175,0.2)' }}>
                          <ChevronDown size={11} /> Demote
                        </button>
                      )}
                      <button onClick={() => removeMember(m.id)} disabled={!!actionLoading}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                        style={{ background: 'rgba(231,76,60,0.08)', color: '#f87171', border: '1px solid rgba(231,76,60,0.2)' }}>
                        <UserX size={11} /> Remove
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
