import { useState } from 'react';
import { Bookmark, ExternalLink, MapPin, Gauge, Navigation } from 'lucide-react';
import StarRating from './StarRating';
import type { Listing } from '../types';

interface VehicleCardProps {
  listing: Listing;
  index?: number;
}

const SITE_COLORS: Record<string, { bg: string; text: string; abbr: string }> = {
  manheim:       { bg: '#1a3a6e', text: '#60a5fa', abbr: 'MNH' },
  adesa:         { bg: '#1e3a1e', text: '#4ade80', abbr: 'ADS' },
  'ove.com':     { bg: '#3a1e1e', text: '#f87171', abbr: 'OVE' },
  backlotcars:   { bg: '#2e1e3a', text: '#a78bfa', abbr: 'BLC' },
  acv:           { bg: '#1e2e3a', text: '#38bdf8', abbr: 'ACV' },
  traderev:      { bg: '#3a2e1e', text: '#fb923c', abbr: 'TRV' },
  smartauction:  { bg: '#1e3a2e', text: '#34d399', abbr: 'SMA' },
};

function getSiteMeta(siteName: string) {
  const key = siteName.toLowerCase().replace(/[\s.]/g, '');
  for (const [k, v] of Object.entries(SITE_COLORS)) {
    if (key.includes(k.replace(/[\s.]/g, ''))) return v;
  }
  return { bg: '#1e2330', text: '#C9A84C', abbr: siteName.slice(0, 3).toUpperCase() };
}

export default function VehicleCard({ listing, index = 0 }: VehicleCardProps) {
  const [saved, setSaved] = useState(false);
  const [imgError, setImgError] = useState(false);
  const site = getSiteMeta(listing.auctionSiteName);

  return (
    <div
      className="glass-card glass-card-hover overflow-hidden flex flex-col"
      style={{
        animation: `fadeUp 0.4s ease ${index * 60}ms both`,
      }}
    >
      {/* Image */}
      <div className="relative h-44 bg-surface-2 overflow-hidden flex-shrink-0">
        {!imgError ? (
          <img
            src={listing.imageUrl}
            alt={`${listing.year} ${listing.make} ${listing.model}`}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <VehiclePlaceholder />
          </div>
        )}

        {/* Site badge */}
        <div
          className="absolute top-3 left-3 site-badge text-xs font-bold"
          style={{ background: site.bg, color: site.text, border: `1px solid ${site.text}30` }}
        >
          {site.abbr}
        </div>

        {/* Save button */}
        <button
          onClick={() => setSaved((v) => !v)}
          className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150"
          style={{
            background: saved ? 'rgba(201,168,76,0.2)' : 'rgba(10,12,16,0.7)',
            border: `1px solid ${saved ? 'rgba(201,168,76,0.5)' : 'rgba(30,35,48,0.8)'}`,
          }}
        >
          <Bookmark
            size={14}
            fill={saved ? '#C9A84C' : 'none'}
            stroke={saved ? '#C9A84C' : '#6B7280'}
          />
        </button>

        {/* Price badge */}
        {listing.price && (
          <div
            className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-sm font-bold"
            style={{ background: 'rgba(10,12,16,0.85)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}
          >
            ${listing.price.toLocaleString()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <div className="mb-3">
          <h3 className="font-display text-base font-semibold text-off-white leading-tight">
            {listing.year} {listing.make} {listing.model}
          </h3>
          {listing.trim && (
            <p className="text-xs text-muted mt-0.5">{listing.trim}</p>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Mileage */}
          <div className="flex items-center gap-1.5">
            <Gauge size={13} className="text-muted flex-shrink-0" />
            <span className="text-xs text-muted">
              {listing.mileage.toLocaleString()} mi
            </span>
          </div>

          {/* Distance */}
          <div className="flex items-center gap-1.5">
            <Navigation size={13} className="text-muted flex-shrink-0" />
            <span className="text-xs text-muted">
              {listing.distance} mi away
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 col-span-2">
            <MapPin size={13} className="text-muted flex-shrink-0" />
            <span className="text-xs text-muted truncate">{listing.location}</span>
          </div>
        </div>

        {/* Color + Stars */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
              style={{ background: listing.colorHex }}
            />
            <span className="text-xs text-muted truncate max-w-[120px]">{listing.color}</span>
          </div>
          <StarRating rating={listing.starRating} />
        </div>

        {/* VIN */}
        <div className="text-xs text-muted/50 font-mono mb-3 truncate">
          VIN: {listing.vin}
        </div>

        {/* Gold divider */}
        <div className="gold-divider mb-3" />

        {/* CTA */}
        <a
          href={listing.listingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto btn-gold text-center text-sm flex items-center justify-center gap-2"
        >
          View on {listing.auctionSiteName}
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}

function VehiclePlaceholder() {
  return (
    <svg viewBox="0 0 120 60" className="w-24 opacity-20" fill="currentColor">
      <path d="M15 40 L22 25 L45 18 L75 18 L90 25 L105 30 L108 38 L108 44 L5 44 L5 38 Z" />
      <circle cx="30" cy="47" r="9" />
      <circle cx="30" cy="47" r="5" fill="#12151C" />
      <circle cx="88" cy="47" r="9" />
      <circle cx="88" cy="47" r="5" fill="#12151C" />
    </svg>
  );
}
