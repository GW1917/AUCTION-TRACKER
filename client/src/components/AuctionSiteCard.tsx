import { useState } from 'react';
import { Edit2, Trash2, Eye, EyeOff, ExternalLink, Globe } from 'lucide-react';
import type { AuctionSite } from '../types';

interface AuctionSiteCardProps {
  site: AuctionSite;
  onEdit: (site: AuctionSite) => void;
  onDelete: (id: string) => void;
  index?: number;
}

export default function AuctionSiteCard({ site, onEdit, onDelete, index = 0 }: AuctionSiteCardProps) {
  const [showPassword, setShowPassword] = useState(false);

  const siteInitials = site.siteName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="glass-card glass-card-hover p-5 flex flex-col gap-4"
      style={{ animation: `fadeUp 0.4s ease ${index * 80}ms both` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Site icon */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))',
              border: '1px solid rgba(201,168,76,0.2)',
              color: '#C9A84C',
            }}
          >
            {siteInitials}
          </div>
          <div>
            <h3 className="font-display font-semibold text-off-white text-base leading-tight">
              {site.siteName}
            </h3>
            <a
              href={site.siteUrl.startsWith('http') ? site.siteUrl : `https://${site.siteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted hover:text-gold transition-colors"
            >
              <Globe size={11} />
              {site.siteUrl}
              <ExternalLink size={10} className="opacity-60" />
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onEdit(site)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-gold hover:bg-gold/10 transition-all"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(site.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 transition-all"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="gold-divider" />

      {/* Credentials */}
      <div className="space-y-2.5">
        <div>
          <span className="text-xs text-muted uppercase tracking-wide">Login ID</span>
          <p className="text-sm text-off-white mt-0.5 font-mono">{site.loginId}</p>
        </div>
        <div>
          <span className="text-xs text-muted uppercase tracking-wide">Password</span>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-off-white font-mono tracking-wider">
              {showPassword ? '(stored securely)' : '••••••••••'}
            </p>
            <button
              onClick={() => setShowPassword((v) => !v)}
              className="text-muted hover:text-gold transition-colors"
            >
              {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>

        {site.notes && (
          <div>
            <span className="text-xs text-muted uppercase tracking-wide">Notes</span>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">{site.notes}</p>
          </div>
        )}
      </div>

      {/* Footer date */}
      <div className="text-xs text-muted/50 mt-auto">
        Added {new Date(site.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
    </div>
  );
}
