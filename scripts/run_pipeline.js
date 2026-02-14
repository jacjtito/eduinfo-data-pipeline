#!/usr/bin/env node

require('dotenv').config();
const updateChecker = require('../lib/monitoring/update_checker');
const csvDownloader = require('../lib/downloaders/csv_downloader');
const dataSources = require('../config/data_sources.json');
const { query, end } = require('../config/db_config');

/**
 * Main pipeline orchestration
 * @param {Object} options - Pipeline options
 */
async function runPipeline(options = {}) {
    const { checkOnly = false, sourceIds = null, dryRun = false } = options;

    console.log('🚀 eduInfo Data Pipeline');
    console.log('========================\n');

    try {
        // Step 1: Check for updates
        console.log('📊 Step 1: Checking for data updates...\n');
        const updates = await updateChecker.checkAllSources(sourceIds);

        if (updates.length === 0) {
            console.log('✅ All data sources are up to date\n');
            return { status: 'success', updates: [] };
        }

        console.log(`\n📥 Found ${updates.length} update(s) available:`);
        updates.forEach(update => {
            console.log(`  - ${update.name}`);
            console.log(`    Last known: ${update.lastKnownModified || 'Never'}`);
            console.log(`    Remote: ${update.remoteModified}`);
        });
        console.log();

        if (checkOnly) {
            console.log('ℹ️  Check-only mode: Skipping download and import\n');
            return { status: 'success', updates, action: 'check_only' };
        }

        if (dryRun) {
            console.log('ℹ️  Dry-run mode: Simulating download and import\n');
            return { status: 'success', updates, action: 'dry_run' };
        }

        // Step 2: Download and import
        const results = [];
        for (const update of updates) {
            console.log(`\n📦 Processing: ${update.name}`);
            console.log('─'.repeat(50));

            try {
                // Find source config
                const sourceConfig = dataSources.sources.find(s => s.id === update.source);

                if (!sourceConfig) {
                    throw new Error(`Source configuration not found: ${update.source}`);
                }

                // Download
                console.log('⬇️  Downloading...');
                const downloadResult = await csvDownloader.downloadSource(update.source, sourceConfig);
                console.log(`✅ Downloaded to: ${downloadResult.path}`);

                // Import
                if (sourceConfig.importer) {
                    console.log(`\n📥 Importing with: ${sourceConfig.importer}`);
                    const importer = require(`../${sourceConfig.importer}`);
                    await importer.run(downloadResult.path);

                    // Update monitoring table
                    await query(
                        `UPDATE monitoring.data_sources
                         SET last_imported = NOW(),
                             last_known_modified = $2
                         WHERE id = $1`,
                        [update.source, update.remoteModified]
                    );

                    console.log('✅ Import complete');
                } else {
                    console.log('⚠️  No importer configured, skipping import');
                }

                results.push({
                    source: update.source,
                    status: 'success',
                    file: downloadResult.path
                });

            } catch (error) {
                console.error(`❌ Failed: ${error.message}`);
                results.push({
                    source: update.source,
                    status: 'error',
                    error: error.message
                });
            }
        }

        // Step 3: Refresh materialized views
        console.log('\n🔄 Step 3: Refreshing materialized views...\n');
        const refreshScript = require('./refresh_views');
        await refreshScript.run();

        console.log('\n✨ Pipeline complete!\n');
        console.log('Summary:');
        console.log(`  ✅ Successful: ${results.filter(r => r.status === 'success').length}`);
        console.log(`  ❌ Failed: ${results.filter(r => r.status === 'error').length}`);
        console.log();

        return {
            status: 'success',
            results,
            updates
        };

    } catch (error) {
        console.error('\n❌ Pipeline error:', error.message);
        console.error(error.stack);
        return {
            status: 'error',
            error: error.message
        };
    } finally {
        await end();
    }
}

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const checkOnly = args.includes('--check-only');
    const dryRun = args.includes('--dry-run') || process.env.DRY_RUN === 'true';
    const sourceIds = args.filter(arg => !arg.startsWith('--'));

    runPipeline({
        checkOnly,
        dryRun,
        sourceIds: sourceIds.length > 0 ? sourceIds : null
    }).then(result => {
        process.exit(result.status === 'success' ? 0 : 1);
    });
}

module.exports = { runPipeline };
