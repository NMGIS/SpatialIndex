// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Query locations within a bounding box
 * Uses PostGIS ST_MakeEnvelope and ST_Within functions
 *
 * @param {string} tableName - Table to query
 * @param {object} bounds - Leaflet bounds object with getNorthEast() and getSouthWest()
 * @returns {Promise<{data: Array, time: number}>}
 */
async function queryBoundingBox(tableName, bounds) {
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    const startTime = performance.now();

    // Use RPC call to execute PostGIS spatial query
    const { data, error } = await supabase.rpc('query_bbox', {
        table_name: tableName,
        min_lng: sw.lng,
        min_lat: sw.lat,
        max_lng: ne.lng,
        max_lat: ne.lat
    });

    const endTime = performance.now();

    if (error) {
        console.error('Query error:', error);
        throw error;
    }

    return {
        data: data || [],
        time: endTime - startTime
    };
}

/**
 * Query locations within a radius of a point
 * Uses PostGIS ST_DWithin function
 *
 * @param {string} tableName - Table to query
 * @param {number} lat - Center latitude
 * @param {number} lng - Center longitude
 * @param {number} radiusMeters - Search radius in meters
 * @returns {Promise<{data: Array, time: number}>}
 */
async function queryRadius(tableName, lat, lng, radiusMeters) {
    const startTime = performance.now();

    const { data, error } = await supabase.rpc('query_radius', {
        table_name: tableName,
        center_lng: lng,
        center_lat: lat,
        radius_m: radiusMeters
    });

    const endTime = performance.now();

    if (error) {
        console.error('Query error:', error);
        throw error;
    }

    return {
        data: data || [],
        time: endTime - startTime
    };
}
