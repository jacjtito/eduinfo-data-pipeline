const https = require('https');
const http = require('http');
const { query } = require('../../config/db_config');
const dataSources = require('../../config/data_sources.json');

/**
 * Get dataset metadata from data.education.gouv.fr API
 * This provides more accurate change tracking than Last-Modified header
 * @param {string} datasetId - Dataset ID
 * @returns {Promise<Object>} Dataset metadata with dates
 */
async function getDataEducationMetadata(datasetId) {
    return new Promise((resolve, reject) => {
        const url = `https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/${datasetId}`;

        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}`));
                return;
            }

            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const metas = json.metas?.default || {};

                    resolve({
                        modified: metas.modified, // Metadata OR data change
                        data_processed: metas.data_processed, // Actual data processing date
                        metadata_processed: metas.metadata_processed,
                        records_count: metas.records_count,
                        date_observation: json.metas?.['metadonnees-complementaires']?.['date-observation']
                    });
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', reject);
    });
}

/**
 * Check if a data source has updates
 * Uses enhanced detection for data.education.gouv.fr sources
 * @param {Object} source - Data source configuration
 * @returns {Promise<Object>} Update status with detailed info
 */
async function checkSource(source) {
    if (!source.enabled) {
        return { source: source.id, hasUpdate: false, reason: 'disabled' };
    }

    try {
        // Get last known dates from database
        const dbResult = await query(
            `SELECT last_known_modified, last_imported,
                    metadata->>'data_processed' as last_data_processed,
                    metadata->>'records_count' as last_records_count
             FROM monitoring.data_sources
             WHERE id = $1`,
            [source.id]
        );

        const lastKnown = dbResult.rows[0] || {};

        let checkResult;

        // Enhanced check for data.education.gouv.fr datasets
        if (source.provider === 'data.education.gouv.fr' && source.dataset_id) {
            const metadata = await getDataEducationMetadata(source.dataset_id);

            const lastDataProcessed = lastKnown.last_data_processed;
            const hasDataUpdate = !lastDataProcessed ||
                new Date(metadata.data_processed) > new Date(lastDataProcessed);

            checkResult = {
                source: source.id,
                name: source.name,
                hasUpdate: hasDataUpdate,
                checkMethod: 'api_data_processed',
                lastKnownModified: lastKnown.last_known_modified,
                remoteModified: metadata.modified,
                lastDataProcessed: lastDataProcessed,
                remoteDataProcessed: metadata.data_processed,
                metadataProcessed: metadata.metadata_processed,
                recordsCount: metadata.records_count,
                lastRecordsCount: lastKnown.last_records_count ? parseInt(lastKnown.last_records_count) : null,
                dateObservation: metadata.date_observation,
                url: source.url,
                importer: source.importer,
                details: {
                    metadataChanged: metadata.metadata_processed && lastKnown.last_known_modified &&
                        new Date(metadata.metadata_processed) > new Date(lastKnown.last_known_modified),
                    recordCountChanged: lastKnown.last_records_count &&
                        metadata.records_count !== parseInt(lastKnown.last_records_count)
                }
            };
        } else {
            // Fallback to Last-Modified header for other sources
            const remoteModified = await getLastModified(source.url);

            const hasUpdate = !lastKnown.last_known_modified ||
                (remoteModified && new Date(remoteModified) > new Date(lastKnown.last_known_modified));

            checkResult = {
                source: source.id,
                name: source.name,
                hasUpdate,
                checkMethod: 'http_last_modified',
                lastKnownModified: lastKnown.last_known_modified,
                remoteModified,
                url: source.url,
                importer: source.importer
            };
        }

        return checkResult;

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
 * Get Last-Modified header from URL (fallback method)
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
 * @returns {Promise<Array>} Array of sources with updates and detailed info
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

    // Update database with check results
    for (const result of results) {
        if (result.error) continue;

        const metadata = {
            data_processed: result.remoteDataProcessed,
            metadata_processed: result.metadataProcessed,
            records_count: result.recordsCount,
            date_observation: result.dateObservation,
            check_method: result.checkMethod
        };

        await query(
            `UPDATE monitoring.data_sources
             SET last_checked = NOW(),
                 last_known_modified = COALESCE($2, last_known_modified),
                 metadata = $3
             WHERE id = $1`,
            [result.source, result.remoteModified, JSON.stringify(metadata)]
        );
    }

    return { results, updates: updatesAvailable };
}

module.exports = {
    checkSource,
    checkAllSources,
    getLastModified,
    getDataEducationMetadata
};
