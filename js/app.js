// DOM Elements
const runQueryBtn = document.getElementById('run-query-btn');
const timeNoIndex = document.getElementById('time-no-index');
const timeIndexed = document.getElementById('time-indexed');
const dbTimeNoIndex = document.getElementById('db-time-no-index');
const dbTimeIndexed = document.getElementById('db-time-indexed');
const countNoIndex = document.getElementById('count-no-index');
const countIndexed = document.getElementById('count-indexed');
const scoreIndexedEl = document.getElementById('score-indexed');
const scoreNoIndexEl = document.getElementById('score-no-index');
const scoreTieEl = document.getElementById('score-tie');
const resetScoreBtn = document.getElementById('reset-score-btn');

// Score tracking
let score = { indexed: 0, noIndex: 0, tie: 0 };


/**
 * Initialize the application
 */
function init() {
    // Initialize maps
    initMaps();

    // Set up event listeners
    runQueryBtn.addEventListener('click', runComparison);
    resetScoreBtn.addEventListener('click', resetScore);
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
        let resultNoIndex, resultIndexed;

        const bounds = getCurrentBounds();
        const zoom = getCurrentZoom();

        // Prevent timeout on large areas
        if (zoom < 6) {
            alert('Please zoom in more (zoom level 6+) to avoid query timeout.');
            return;
        }

        // Randomize query order to distribute cache-warming advantage fairly
        const noIndexFirst = Math.random() < 0.5;

        if (noIndexFirst) {
            resultNoIndex = await queryCombinedBbox(bounds);
            updateResults('noIndex', resultNoIndex);

            resultIndexed = await queryIndexedBbox(bounds);
            updateResults('indexed', resultIndexed);
        } else {
            resultIndexed = await queryIndexedBbox(bounds);
            updateResults('indexed', resultIndexed);

            resultNoIndex = await queryCombinedBbox(bounds);
            updateResults('noIndex', resultNoIndex);
        }

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
        score.indexed++;
    } else if (timeNoIdx < timeIdx) {
        panelNoIndex.classList.add('faster');
        panelIndexed.classList.add('slower');
        score.noIndex++;
    } else {
        score.tie++;
    }
    updateScoreboard();
}

/**
 * Update the scoreboard display
 */
function updateScoreboard() {
    scoreIndexedEl.textContent = score.indexed;
    scoreNoIndexEl.textContent = score.noIndex;
    scoreTieEl.textContent = score.tie;
}

/**
 * Reset the score
 */
function resetScore() {
    score = { indexed: 0, noIndex: 0, tie: 0 };
    updateScoreboard();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
