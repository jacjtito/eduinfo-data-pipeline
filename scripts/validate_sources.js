#!/usr/bin/env node

require('dotenv').config();
const https = require('https');
const http = require('http');
const dataSources = require('../config/data_sources.json');

/**
 * Check if a URL is accessible and return metadata
 */
async function validateUrl(url) {
    return new Promise((resolve) => {
        const protocol = url.startsWith('https') ? https : http;

        const request = protocol.request(url, { method: 'HEAD' }, (response) => {
            // Follow redirects
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                resolve(validateUrl(response.headers.location));
                return;
            }

            resolve({
                accessible: response.statusCode === 200,
                statusCode: response.statusCode,
                statusMessage: response.statusMessage,
                contentType: response.headers['content-type'] || 'unknown',
                contentLength: response.headers['content-length']
                    ? parseInt(response.headers['content-length'], 10)
                    : null,
                lastModified: response.headers['last-modified'] || 'unknown',
                headers: response.headers
            });
        });

        request.on('error', (err) => {
            resolve({
                accessible: false,
                error: err.message
            });
        });

        request.setTimeout(30000, () => {
            request.destroy();
            resolve({
                accessible: false,
                error: 'Timeout after 30s'
            });
        });

        request.end();
    });
}

/**
 * Download first few lines to validate CSV format
 */
async function sampleCsv(url, lines = 5) {
    return new Promise((resolve) => {
        const protocol = url.startsWith('https') ? https : http;
        let data = '';
        let lineCount = 0;
        let resolved = false;

        const resolveOnce = (result) => {
            if (!resolved) {
                resolved = true;
                resolve(result);
            }
        };

        const request = protocol.get(url, (response) => {
            if (response.statusCode !== 200) {
                resolveOnce({ valid: false, error: `HTTP ${response.statusCode}` });
                return;
            }

            response.on('data', (chunk) => {
                data += chunk.toString();
                lineCount = (data.match(/\n/g) || []).length;

                if (lineCount >= lines) {
                    response.destroy();
                    request.destroy();

                    const csvLines = data.split('\n').slice(0, lines);
                    const hasSeparators = csvLines[0] &&
                        (csvLines[0].includes(',') || csvLines[0].includes(';'));

                    resolveOnce({
                        valid: hasSeparators,
                        sample: csvLines,
                        separator: csvLines[0]?.includes(';') ? ';' : ',',
                        columns: csvLines[0]?.split(csvLines[0].includes(';') ? ';' : ',').length || 0
                    });
                }
            });

            response.on('end', () => {
                const csvLines = data.split('\n').slice(0, lines);
                const hasSeparators = csvLines[0] &&
                    (csvLines[0].includes(',') || csvLines[0].includes(';'));

                resolveOnce({
                    valid: hasSeparators,
                    sample: csvLines,
                    separator: csvLines[0]?.includes(';') ? ';' : ',',
                    columns: csvLines[0]?.split(csvLines[0].includes(';') ? ';' : ',').length || 0
                });
            });

            response.on('error', (err) => {
                resolveOnce({ valid: false, error: err.message });
            });
        });

        request.on('error', (err) => {
            resolveOnce({ valid: false, error: err.message });
        });

        request.setTimeout(10000, () => {
            request.destroy();

            if (data) {
                const csvLines = data.split('\n').slice(0, lines);
                const hasSeparators = csvLines[0] &&
                    (csvLines[0].includes(',') || csvLines[0].includes(';'));

                resolveOnce({
                    valid: hasSeparators,
                    sample: csvLines,
                    separator: csvLines[0]?.includes(';') ? ';' : ',',
                    columns: csvLines[0]?.split(csvLines[0].includes(';') ? ';' : ',').length || 0,
                    partial: true
                });
            } else {
                resolveOnce({ valid: false, error: 'Timeout' });
            }
        });
    });
}

/**
 * Format file size
 */
function formatSize(bytes) {
    if (!bytes) return 'unknown';
    const mb = bytes / 1024 / 1024;
    if (mb > 1) return `${mb.toFixed(2)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(2)} KB`;
}

/**
 * Main validation
 */
async function main() {
    console.log('🔍 Validating Data Sources');
    console.log('='.repeat(60));
    console.log();

    const results = [];

    for (const source of dataSources.sources) {
        console.log(`📊 ${source.name}`);
        console.log(`   ID: ${source.id}`);
        console.log(`   Provider: ${source.provider}`);
        console.log(`   Type: ${source.type}`);
        console.log(`   Enabled: ${source.enabled ? '✅' : '❌'}`);

        if (!source.enabled) {
            console.log(`   ⏭️  Skipped (disabled)`);
            console.log();
            results.push({ source: source.id, skipped: true });
            continue;
        }

        // For API sources, validate API URL
        const urlToTest = source.type === 'api' ? source.api_url : source.url;

        if (!urlToTest) {
            console.log(`   ❌ No URL configured`);
            console.log();
            results.push({ source: source.id, error: 'No URL' });
            continue;
        }

        console.log(`   URL: ${urlToTest}`);

        // Validate URL
        console.log(`   ⏳ Checking accessibility...`);
        const validation = await validateUrl(urlToTest);

        if (!validation.accessible) {
            console.log(`   ❌ FAILED: ${validation.error || validation.statusMessage}`);
            if (validation.statusCode) {
                console.log(`   Status: ${validation.statusCode}`);
            }
            console.log();
            results.push({
                source: source.id,
                accessible: false,
                error: validation.error || validation.statusMessage
            });
            continue;
        }

        console.log(`   ✅ Accessible (${validation.statusCode})`);
        console.log(`   Content-Type: ${validation.contentType}`);
        console.log(`   Size: ${formatSize(validation.contentLength)}`);
        console.log(`   Last-Modified: ${validation.lastModified}`);

        // For CSV sources, sample the content
        if (source.type === 'csv') {
            console.log(`   ⏳ Sampling CSV content...`);
            const sample = await sampleCsv(urlToTest);

            if (sample.valid) {
                console.log(`   ✅ Valid CSV format`);
                console.log(`   Separator: "${sample.separator}"`);
                console.log(`   Columns: ${sample.columns}`);
                console.log(`   Header: ${sample.sample[0]?.substring(0, 80)}...`);

                results.push({
                    source: source.id,
                    accessible: true,
                    valid: true,
                    contentType: validation.contentType,
                    size: validation.contentLength,
                    lastModified: validation.lastModified,
                    csvSeparator: sample.separator,
                    csvColumns: sample.columns
                });
            } else {
                console.log(`   ⚠️  Warning: Could not validate CSV format`);
                console.log(`   Error: ${sample.error || 'Unknown'}`);

                results.push({
                    source: source.id,
                    accessible: true,
                    valid: false,
                    error: sample.error,
                    contentType: validation.contentType,
                    size: validation.contentLength,
                    lastModified: validation.lastModified
                });
            }
        } else {
            results.push({
                source: source.id,
                accessible: true,
                contentType: validation.contentType,
                size: validation.contentLength,
                lastModified: validation.lastModified
            });
        }

        console.log();
    }

    // Summary
    console.log('='.repeat(60));
    console.log('📋 SUMMARY\n');

    const accessible = results.filter(r => r.accessible).length;
    const failed = results.filter(r => r.accessible === false).length;
    const skipped = results.filter(r => r.skipped).length;
    const csvValid = results.filter(r => r.valid === true).length;
    const csvInvalid = results.filter(r => r.valid === false).length;

    console.log(`✅ Accessible: ${accessible}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped (disabled): ${skipped}`);
    if (csvValid > 0) console.log(`📄 Valid CSV: ${csvValid}`);
    if (csvInvalid > 0) console.log(`⚠️  Invalid CSV: ${csvInvalid}`);
    console.log();

    if (failed > 0) {
        console.log('⚠️  FAILED SOURCES:');
        results.filter(r => r.accessible === false).forEach(r => {
            console.log(`   - ${r.source}: ${r.error}`);
        });
        console.log();
    }

    if (csvInvalid > 0) {
        console.log('⚠️  CSV FORMAT ISSUES:');
        results.filter(r => r.valid === false).forEach(r => {
            console.log(`   - ${r.source}: ${r.error || 'Could not validate'}`);
        });
        console.log();
    }

    // Exit code
    if (failed > 0 || csvInvalid > 0) {
        console.log('❌ Some sources have issues. Review the output above.');
        process.exit(1);
    } else {
        console.log('✨ All enabled sources are valid and accessible!');
        process.exit(0);
    }
}

// Execute
main().catch(err => {
    console.error('❌ Validation error:', err);
    process.exit(1);
});
