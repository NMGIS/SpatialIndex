// Map instances
let mapNoIndex = null;
let mapIndexed = null;

// Layer groups for markers
let markersNoIndex = null;
let markersIndexed = null;

/**
 * Initialize both maps
 */
function initMaps() {
    // Create map without index
    mapNoIndex = L.map('map-no-index', {
        center: MAP_CONFIG.defaultCenter,
        zoom: MAP_CONFIG.defaultZoom
    });

    // Create map with index
    mapIndexed = L.map('map-indexed', {
        center: MAP_CONFIG.defaultCenter,
        zoom: MAP_CONFIG.defaultZoom
    });

    // Add tile layers
    L.tileLayer(MAP_CONFIG.tileLayer, {
        attribution: MAP_CONFIG.tileAttribution
    }).addTo(mapNoIndex);

    L.tileLayer(MAP_CONFIG.tileLayer, {
        attribution: MAP_CONFIG.tileAttribution
    }).addTo(mapIndexed);

    // Create layer groups for markers
    markersNoIndex = L.layerGroup().addTo(mapNoIndex);
    markersIndexed = L.layerGroup().addTo(mapIndexed);

    // Sync map movements
    syncMaps(mapNoIndex, mapIndexed);
    syncMaps(mapIndexed, mapNoIndex);
}

/**
 * Sync one map's movements to another
 */
function syncMaps(source, target) {
    let isSyncing = false;

    source.on('move', function() {
        if (isSyncing) return;
        isSyncing = true;
        target.setView(source.getCenter(), source.getZoom(), { animate: false });
        isSyncing = false;
    });
}

/**
 * Get current bounds from the indexed map (they're synced, so either works)
 */
function getCurrentBounds() {
    return mapIndexed.getBounds();
}

/**
 * Get current center from the indexed map
 */
function getCurrentCenter() {
    return mapIndexed.getCenter();
}

/**
 * Get current zoom level
 */
function getCurrentZoom() {
    return mapIndexed.getZoom();
}

/**
 * Clear all markers from both maps
 */
function clearMarkers() {
    markersNoIndex.clearLayers();
    markersIndexed.clearLayers();
}

/**
 * Add markers to a specific map
 * @param {string} mapType - 'noIndex' or 'indexed'
 * @param {Array} points - Array of {lat, lng, name} objects
 */
function addMarkers(mapType, points) {
    const layerGroup = mapType === 'indexed' ? markersIndexed : markersNoIndex;

    points.forEach(point => {
        const marker = L.circleMarker([point.lat, point.lng], {
            radius: 6,
            fillColor: mapType === 'indexed' ? '#27ae60' : '#e74c3c',
            color: '#fff',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });

        if (point.name) {
            marker.bindPopup(point.name);
        }

        layerGroup.addLayer(marker);
    });
}

/**
 * Add polygons to a specific map
 * @param {string} mapType - 'noIndex' or 'indexed'
 * @param {Array} features - Array of {geojson, name, admin_type} objects
 */
function addPolygons(mapType, features) {
    const layerGroup = mapType === 'indexed' ? markersIndexed : markersNoIndex;
    const fillColor = mapType === 'indexed' ? '#27ae60' : '#e74c3c';

    features.forEach(feature => {
        if (!feature.geojson) return;

        const polygon = L.geoJSON(feature.geojson, {
            style: {
                fillColor: fillColor,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.5
            }
        });

        if (feature.name) {
            polygon.bindPopup(`<strong>${feature.name}</strong><br>${feature.admin_type || ''}`);
        }

        layerGroup.addLayer(polygon);
    });
}
