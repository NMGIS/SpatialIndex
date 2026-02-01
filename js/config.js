// Supabase Configuration
// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Map Configuration
const MAP_CONFIG = {
    // Default center (San Francisco)
    defaultCenter: [37.7749, -122.4194],
    defaultZoom: 12,

    // Tile layer (OpenStreetMap)
    tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

// Table names in Supabase
const TABLES = {
    indexed: 'locations_indexed',
    noIndex: 'locations_no_index'
};
