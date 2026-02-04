// Supabase Configuration
// Credentials are loaded from env.js (local dev) or injected by GitHub Actions (production)
const SUPABASE_URL = window.ENV?.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.ENV?.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase credentials. Copy js/env.template.js to js/env.js and add your credentials.');
}

// Map Configuration
const MAP_CONFIG = {
    // Default center (Continental USA - zoomed to Colorado area)
    defaultCenter: [39.0, -105.5],
    defaultZoom: 7,

    // Tile layer (OpenStreetMap)
    tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

// Table names in Supabase
const TABLES = {
    indexed: 'locations_indexed',
    noIndex: 'combined'  // Non-indexed polygon data
};
