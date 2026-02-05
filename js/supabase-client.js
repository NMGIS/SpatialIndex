// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    const { data, error } = await supabaseClient.rpc('query_bbox', {
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

    const { data, error } = await supabaseClient.rpc('query_radius', {
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

/**
 * Query combined table (polygons) within a bounding box
 * Returns GeoJSON for polygon display
 *
 * @param {object} bounds - Leaflet bounds object
 * @returns {Promise<{data: Array, time: number}>}
 */
async function queryCombinedBbox(bounds) {
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    const startTime = performance.now();

    const { data, error } = await supabaseClient.rpc('query_combined_bbox', {
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

    const rows = data || [];
    const serverTime = rows.length > 0 ? Math.max(...rows.map(r => r.server_ms)) : null;
    const features = rows.map(({ server_ms, ...rest }) => rest);
    return {
        data: features,
        time: endTime - startTime,
        serverTime: serverTime,
        isPolygon: true
    };
}

/**
 * Query indexed table (polygons) within a bounding box
 * Returns GeoJSON for polygon display
 *
 * @param {object} bounds - Leaflet bounds object
 * @returns {Promise<{data: Array, time: number}>}
 */
async function queryIndexedBbox(bounds) {
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    const startTime = performance.now();

    const { data, error } = await supabaseClient.rpc('query_indexed_bbox', {
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

    const rows = data || [];
    const serverTime = rows.length > 0 ? Math.max(...rows.map(r => r.server_ms)) : null;
    const features = rows.map(({ server_ms, ...rest }) => rest);
    return {
        data: features,
        time: endTime - startTime,
        serverTime: serverTime,
        isPolygon: true
    };
}
