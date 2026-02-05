// DOM Elements
const runQueryBtn = document.getElementById('run-query-btn');
const queryTypeSelect = document.getElementById('query-type');
const timeNoIndex = document.getElementById('time-no-index');
const timeIndexed = document.getElementById('time-indexed');
const dbTimeNoIndex = document.getElementById('db-time-no-index');
const dbTimeIndexed = document.getElementById('db-time-indexed');
const countNoIndex = document.getElementById('count-no-index');
const countIndexed = document.getElementById('count-indexed');

// Radius for radius queries (in meters)
const SEARCH_RADIUS = 5000;

/**
 * Initialize the application
 */
function init() {
    // Initialize maps
    initMaps();

    // Set up event listeners
    runQueryBtn.addEventListener('click', runComparison);
}

/**
 * Run the comparison query on both tables
 */
async function runComparison() {
    // Disable button during query
    runQueryBtn.disabled = true;
    runQueryBtn.textContent = 'Querying...';

    // Reset displays
    resetTimingDisplay();
    clearMarkers();

    try {
        const queryType = queryTypeSelect.value;
        let resultNoIndex, resultIndexed;

        const bounds = getCurrentBounds();
        const zoom = getCurrentZoom();

        // Prevent timeout on large areas
        if (zoom < 6) {
            alert('Please zoom in more (zoom level 6+) to avoid query timeout.');
            return;
        }

        // Query sequentially to avoid cache effects
        // Display each result as soon as its query finishes
        resultNoIndex = await queryCombinedBbox(bounds);
        updateResults('noIndex', resultNoIndex);

        resultIndexed = await queryIndexedBbox(bounds);
        updateResults('indexed', resultIndexed);

        // Highlight faster result based on DB time (true index metric)
        highlightFaster(resultNoIndex.serverTime, resultIndexed.serverTime);

    } catch (error) {
        console.error('Error running comparison:', error);
        alert('Error running query. Check console for details.');
    } finally {
        runQueryBtn.disabled = false;
        runQueryBtn.textContent = 'Run Spatial Query';
    }
}

/**
 * Update the results display for one map
 */
function updateResults(mapType, result) {
    const timeEl = mapType === 'indexed' ? timeIndexed : timeNoIndex;
    const dbTimeEl = mapType === 'indexed' ? dbTimeIndexed : dbTimeNoIndex;
    const countEl = mapType === 'indexed' ? countIndexed : countNoIndex;

    // Update client timing
    timeEl.textContent = `${result.time.toFixed(2)} ms`;

    // Update DB timing
    if (result.serverTime != null) {
        dbTimeEl.textContent = `${result.serverTime.toFixed(2)} ms`;
    } else {
        dbTimeEl.textContent = 'N/A';
    }

    // Update count
    countEl.textContent = result.data.length;

    // Add markers or polygons to map
    if (result.isPolygon) {
        addPolygons(mapType, result.data);
    } else {
        addMarkers(mapType, result.data);
    }
}

/**
 * Reset timing display
 */
function resetTimingDisplay() {
    timeNoIndex.textContent = '--';
    timeIndexed.textContent = '--';
    dbTimeNoIndex.textContent = '--';
    dbTimeIndexed.textContent = '--';
    countNoIndex.textContent = '--';
    countIndexed.textContent = '--';

    // Remove highlight classes
    document.querySelectorAll('.map-panel').forEach(panel => {
        panel.classList.remove('faster', 'slower', 'loading');
        panel.classList.add('loading');
    });
}

/**
 * Highlight the faster result
 */
function highlightFaster(timeNoIdx, timeIdx) {
    const panelNoIndex = document.querySelector('.map-panel:first-child');
    const panelIndexed = document.querySelector('.map-panel:last-child');

    panelNoIndex.classList.remove('loading');
    panelIndexed.classList.remove('loading');

    if (timeIdx < timeNoIdx) {
        panelIndexed.classList.add('faster');
        panelNoIndex.classList.add('slower');
    } else if (timeNoIdx < timeIdx) {
        panelNoIndex.classList.add('faster');
        panelIndexed.classList.add('slower');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
