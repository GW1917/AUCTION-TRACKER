export interface User {
  id: string;
  username: string;
  dealershipName: string;
  fullName: string;
}

export interface AuctionSite {
  id: string;
  siteName: string;
  siteUrl: string;
  loginId: string;
  notes?: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  color: string;
  colorHex: string;
  mileage: number;
  starRating: number;
  location: string;
  distance: number;
  imageUrl: string;
  listingUrl: string;
  price?: number;
  auctionSiteId?: string;
  auctionSiteName: string;
}

export interface SearchFilters {
  yearFrom?: string;
  yearTo?: string;
  make?: string;
  model?: string;
  trim?: string;
  colors?: string[];
  maxMileage?: number;
  minStarRating?: number;
  radius?: string;
  selectedSiteIds?: string[];
}

export interface SavedSearch {
  id: string;
  searchName: string;
  filters: SearchFilters;
  createdAt: string;
}

export interface SearchResult {
  listings: Listing[];
  total: number;
  sitesSearched: number;
}

export type SortKey = 'distance' | 'mileage' | 'year' | 'starRating' | 'price';
