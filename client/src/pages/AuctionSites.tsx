import { useState, useEffect, FormEvent } from 'react';
import { Plus, Globe, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';
import AuctionSiteCard from '../components/AuctionSiteCard';
import api from '../api';
import type { AuctionSite } from '../types';

const PRESET_SITES = [
  { name: 'Manheim', url: 'www.manheim.com' },
  { name: 'ADESA', url: 'www.adesa.com' },
  { name: 'OVE.com', url: 'www.ove.com' },
  { name: 'BacklotCars', url: 'www.backlotcars.com' },
  { name: 'ACV Auctions', url: 'www.acvauctions.com' },
  { name: 'TradeRev', url: 'www.traderev.com' },
  { name: 'SmartAuction', url: 'www.smartauction.com' },
];

interface FormState {
  siteName: string;
  siteUrl: string;
  loginId: string;
  password: string;
  notes: string;
}

const EMPTY_FORM: FormState = { siteName: '', siteUrl: '', loginId: '', password: '', notes: '' };

export default function AuctionSites() {
  const [sites, setSites] = useState<AuctionSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<AuctionSite | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchSites();
  }, []);

  async function fetchSites() {
    setLoading(true);
    try {
      const { data } = await api.get('/auction-sites');
      setSites(data);
    } catch {
      /* handled silently */
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditingSite(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowPassword(false);
    setModalOpen(true);
  }

  function openEdit(site: AuctionSite) {
    setEditingSite(site);
    setForm({
      siteName: site.siteName,
      siteUrl: site.siteUrl,
      loginId: site.loginId,
      password: '',
      notes: site.notes || '',
    });
    setFormError('');
    setShowPassword(false);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingSite(null);
    setFormError('');
  }

  function applyPreset(preset: { name: string; url: string }) {
    setForm((f) => ({ ...f, siteName: preset.name, siteUrl: preset.url }));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!form.siteName.trim()) return setFormError('Site name is required.');
    if (!form.siteUrl.trim()) return setFormError('Site URL is required.');
    if (!form.loginId.trim()) return setFormError('Login ID is required.');
    if (!editingSite && !form.password) return setFormError('Password is required.');

    setSaving(true);
    try {
      if (editingSite) {
        const { data } = await api.put(`/auction-sites/${editingSite.id}`, form);
        setSites((prev) => prev.map((s) => (s.id === editingSite.id ? data : s)));
      } else {
        const { data } = await api.post('/auction-sites', form);
        setSites((prev) => [data, ...prev]);
      }
      closeModal();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }
    try {
      await api.delete(`/auction-sites/${id}`);
      setSites((prev) => prev.filter((s) => s.id !== id));
    } catch {
      /* handled silently */
    }
    setDeleteConfirm(null);
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8" style={{ animation: 'fadeUp 0.5s ease both' }}>
        <div>
          <p className="text-muted text-sm mb-1 flex items-center gap-1.5">
            <Globe size={13} /> Auction Credentials
          </p>
          <h1 className="font-display text-3xl font-bold text-off-white">Auction Sites</h1>
          <p className="text-muted text-sm mt-1.5 max-w-md">
            Manage your auction site logins. Credentials are AES-256 encrypted at rest.
          </p>
        </div>
        <button onClick={openAdd} className="btn-gold flex items-center gap-2 flex-shrink-0">
          <Plus size={16} />
          Add Auction Site
        </button>
      </div>

      {/* Security notice */}
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3 mb-6"
        style={{ background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.15)' }}
      >
        <ShieldCheck size={16} className="text-success flex-shrink-0" />
        <p className="text-xs text-muted">
          Your credentials are stored with AES-256 encryption and are used exclusively to search on your behalf. Passwords are never exposed through the API.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="spinner-gold w-8 h-8" />
        </div>
      ) : sites.length === 0 ? (
        <EmptyState onAdd={openAdd} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
          {sites.map((site, i) => (
            <AuctionSiteCard
              key={site.id}
              site={site}
              onEdit={openEdit}
              onDelete={handleDelete}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Delete confirm toast */}
      {deleteConfirm && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-medium z-50 flex items-center gap-3"
          style={{ background: '#12151C', border: '1px solid rgba(231,76,60,0.4)', color: '#f87171', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        >
          <AlertCircle size={15} />
          Click Delete again to confirm removal
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingSite ? `Edit: ${editingSite.siteName}` : 'Add Auction Site'}
      >
        {/* Preset chips */}
        {!editingSite && (
          <div className="mb-5">
            <p className="text-xs text-muted mb-2 uppercase tracking-wide font-semibold">Quick Select</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_SITES.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all duration-150"
                  style={{
                    background: form.siteName === p.name ? 'rgba(201,168,76,0.15)' : 'rgba(30,35,48,0.6)',
                    border: `1px solid ${form.siteName === p.name ? 'rgba(201,168,76,0.4)' : 'rgba(30,35,48,0.8)'}`,
                    color: form.siteName === p.name ? '#C9A84C' : '#6B7280',
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {formError && (
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4 text-sm"
            style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', color: '#f87171' }}
          >
            <AlertCircle size={14} />
            {formError}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Site Name *
              </label>
              <input
                type="text"
                value={form.siteName}
                onChange={(e) => setForm((f) => ({ ...f, siteName: e.target.value }))}
                placeholder="e.g. Manheim"
                className="input-luxury"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Website URL *
              </label>
              <input
                type="text"
                value={form.siteUrl}
                onChange={(e) => setForm((f) => ({ ...f, siteUrl: e.target.value }))}
                placeholder="www.manheim.com"
                className="input-luxury"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Login ID *
              </label>
              <input
                type="text"
                value={form.loginId}
                onChange={(e) => setForm((f) => ({ ...f, loginId: e.target.value }))}
                placeholder="Username or dealer code"
                className="input-luxury"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Password {editingSite && <span className="text-muted/60 normal-case font-normal">(leave blank to keep)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder={editingSite ? 'New password (optional)' : 'Site password'}
                  className="input-luxury pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-off-white transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Notes <span className="text-muted/60 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Additional notes about this account…"
              rows={2}
              className="input-luxury resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={closeModal}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-gold flex-1 flex items-center justify-center gap-2"
            >
              {saving ? (
                <><span className="spinner-gold w-4 h-4" /> Saving…</>
              ) : (
                editingSite ? 'Save Changes' : 'Add Site'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)' }}
      >
        <Globe size={32} className="text-gold/60" />
      </div>
      <h3 className="font-display text-xl font-semibold text-off-white mb-2">No Auction Sites Yet</h3>
      <p className="text-muted text-sm max-w-xs mb-6 leading-relaxed">
        Add your auction site credentials to start searching Manheim, ADESA, ACV, and more simultaneously.
      </p>
      <button onClick={onAdd} className="btn-gold flex items-center gap-2">
        <Plus size={16} /> Add Your First Site
      </button>
    </div>
  );
}
