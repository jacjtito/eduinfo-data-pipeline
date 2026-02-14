const https = require('https');
const http = require('http');
const { query } = require('../../config/db_config');
const dataSources = require('../../config/data_sources.json');

/**
 * Check if a data source has updates by comparing Last-Modified header
 * @param {Object} source - Data source configuration
 * @returns {Promise<Object>} Update status
 */
async function checkSource(source) {
    if (!source.enabled) {
        return { source: source.id, hasUpdate: false, reason: 'disabled' };
    }

    if (source.type !== 'csv' && source.type !== 'dataset') {
        return { source: source.id, hasUpdate: false, reason: 'unsupported_check_type' };
    }

    try {
        // Get last known modification date from database
        const dbResult = await query(
            'SELECT last_known_modified FROM monitoring.data_sources WHERE id = $1',
            [source.id]
        );

        const lastKnownModified = dbResult.rows[0]?.last_known_modified;

        // Check remote file Last-Modified header
        const remoteModified = await getLastModified(source.url);

        if (!remoteModified) {
            return {
                source: source.id,
                hasUpdate: false,
                reason: 'no_last_modified_header'
            };
        }

        const hasUpdate = !lastKnownModified || new Date(remoteModified) > new Date(lastKnownModified);

        return {
            source: source.id,
            name: source.name,
            hasUpdate,
            lastKnownModified,
            remoteModified,
            url: source.url,
            importer: source.importer
        };
    } catch (error) {
        console.error(`Error checking ${source.id}:`, error.message);
        return {
            source: source.id,
            hasUpdate: false,
            error: error.message
        };
    }
}

/**
 * Get Last-Modified header from URL
 * @param {string} url - URL to check
 * @returns {Promise<string|null>} Last-Modified date string
 */
function getLastModified(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;

        const request = protocol.request(url, { method: 'HEAD' }, (response) => {
            const lastModified = response.headers['last-modified'];
            resolve(lastModified || null);
        });

        request.on('error', reject);
        request.setTimeout(parseInt(process.env.TIMEOUT_SECONDS || 30) * 1000, () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });

        request.end();
    });
}

/**
 * Check all enabled data sources for updates
 * @param {Array<string>} sourceIds - Optional array of source IDs to check
 * @returns {Promise<Array>} Array of sources with updates
 */
async function checkAllSources(sourceIds = null) {
    const sourcesToCheck = sourceIds
        ? dataSources.sources.filter(s => sourceIds.includes(s.id))
        : dataSources.sources.filter(s => s.enabled);

    console.log(`Checking ${sourcesToCheck.length} data sources...`);

    const results = await Promise.all(
        sourcesToCheck.map(source => checkSource(source))
    );

    const updatesAvailable = results.filter(r => r.hasUpdate);

    // Update database with check timestamp
    for (const result of results) {
        await query(
            `UPDATE monitoring.data_sources
             SET last_checked = NOW(),
                 last_known_modified = COALESCE($2, last_known_modified)
             WHERE id = $1`,
            [result.source, result.remoteModified]
        );
    }

    return updatesAvailable;
}

module.exports = {
    checkSource,
    checkAllSources,
    getLastModified
};
