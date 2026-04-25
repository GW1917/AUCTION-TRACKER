// TODO: Replace mock data with real authenticated API call or Puppeteer/Playwright
// session scraping for ACV Auctions (acvauctions.com).
// Real flow: POST credentials to https://api.acvauctions.com/auth/login,
// receive bearer token, use token to query /inventory/search endpoint.

const { filterListings } = require('../utils/filterListings');

const MOCK_LISTINGS = [
  {
    id: 'acv-001',
    vin: '3TMCZ5AN4PM567890',
    year: 2023,
    make: 'Toyota',
    model: 'Tacoma',
    trim: 'TRD Pro 4x4 Double Cab',
    color: 'Lunar Rock',
    colorHex: '#A8A090',
    mileage: 6210,
    starRating: 5,
    location: 'Seattle, WA',
    distance: 498,
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=640&h=360&fit=crop&q=80',
    listingUrl: 'https://www.acvauctions.com/listing/mock-acv-001',
    price: 47500,
  },
  {
    id: 'acv-002',
    vin: '5FNYF8H64PB234567',
    year: 2023,
    make: 'Honda',
    model: 'Pilot',
    trim: 'TrailSport AWD',
    color: 'Sonic Gray Pearl',
    colorHex: '#9BA5A8',
    mileage: 9540,
    starRating: 5,
    location: 'Portland, OR',
    distance: 489,
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=640&h=360&fit=crop&q=80',
    listingUrl: 'https://www.acvauctions.com/listing/mock-acv-002',
    price: 42000,
  },
  {
    id: 'acv-003',
    vin: '1FMEE5DH4NLA89012',
    year: 2022,
    make: 'Ford',
    model: 'Bronco',
    trim: 'Wildtrak 4-Door 4x4',
    color: 'Area 51',
    colorHex: '#7B8C9A',
    mileage: 14820,
    starRating: 4,
    location: 'Boise, ID',
    distance: 467,
    imageUrl: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=640&h=360&fit=crop&q=80',
    listingUrl: 'https://www.acvauctions.com/listing/mock-acv-003',
    price: 46500,
  },
  {
    id: 'acv-004',
    vin: '1GCPTEEN4N1456789',
    year: 2023,
    make: 'Chevrolet',
    model: 'Colorado',
    trim: 'ZR2 4WD Crew Cab',
    color: 'Radiant Red Tintcoat',
    colorHex: '#8B1A00',
    mileage: 5120,
    starRating: 5,
    location: 'Sacramento, CA',
    distance: 495,
    imageUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=640&h=360&fit=crop&q=80',
    listingUrl: 'https://www.acvauctions.com/listing/mock-acv-004',
    price: 52000,
  },
  {
    id: 'acv-005',
    vin: 'JTERU5JR1N5678901',
    year: 2022,
    make: 'Toyota',
    model: '4Runner',
    trim: 'TRD Pro 4WD',
    color: 'Midnight Black Metallic',
    colorHex: '#1A1A1A',
    mileage: 18240,
    starRating: 5,
    location: 'Las Vegas, NV',
    distance: 450,
    imageUrl: 'https://images.unsplash.com/photo-1546768292-e9a3c8b3eb3d?w=640&h=360&fit=crop&q=80',
    listingUrl: 'https://www.acvauctions.com/listing/mock-acv-005',
    price: 48000,
  },
];

async function search(credentials, filters) {
  await new Promise((r) => setTimeout(r, 500 + Math.random() * 700));
  return filterListings(MOCK_LISTINGS, filters);
}

module.exports = { search };
