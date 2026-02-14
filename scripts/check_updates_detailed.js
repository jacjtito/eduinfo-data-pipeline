#!/usr/bin/env node

require('dotenv').config();
const updateChecker = require('../lib/monitoring/update_checker_enhanced');
const { end } = require('../config/db_config');

/**
 * Check all data sources with detailed information
 * Shows difference between metadata changes and data changes
 */
async function main() {
    console.log('🔍 Checking for data updates (Enhanced Detection)\n');
    console.log('='.repeat(70));
    console.log();

    try {
        const { results, updates } = await updateChecker.checkAllSources();

        // Display all results
        for (const result of results) {
            if (result.error) {
                console.log(`❌ ${result.source}: ${result.error}\n`);
                continue;
            }

            if (result.reason === 'disabled') {
                console.log(`⏭️  ${result.source}: Disabled\n`);
                continue;
            }

            console.log(`📊 ${result.name}`);
            console.log(`   ID: ${result.source}`);
            console.log(`   Check Method: ${result.checkMethod}`);
            console.log();

            if (result.checkMethod === 'api_data_processed') {
                // Enhanced data.education.gouv.fr check
                console.log(`   📅 Data Processing Dates:`);
                console.log(`      Last Known: ${result.lastDataProcessed || 'Never checked'}`);
                console.log(`      Remote:     ${result.remoteDataProcessed}`);
                console.log();

                console.log(`   📅 Metadata Dates:`);
                console.log(`      Last Known: ${result.lastKnownModified || 'Never'}`);
                console.log(`      Remote:     ${result.remoteModified}`);
                console.log();

                if (result.dateObservation) {
                    console.log(`   📊 Data Observation Date: ${result.dateObservation}`);
                }

                if (result.recordsCount) {
                    const countChanged = result.details?.recordCountChanged;
                    console.log(`   📈 Record Count: ${result.recordsCount}${countChanged ? ' ⚠️ (changed)' : ''}`);
                }

                console.log();

                if (result.hasUpdate) {
                    console.log(`   ✅ DATA UPDATE AVAILABLE`);
                    console.log(`      → New data was processed on ${result.remoteDataProcessed}`);
                } else {
                    console.log(`   ℹ️  No data update`);

                    if (result.details?.metadataChanged) {
                        console.log(`      (Metadata was modified on ${result.metadataProcessed}, but data hasn't changed)`);
                    }
                }

            } else {
                // Fallback HTTP Last-Modified check
                console.log(`   Last Known Modified: ${result.lastKnownModified || 'Never'}`);
                console.log(`   Remote Modified:     ${result.remoteModified || 'Unknown'}`);
                console.log();

                if (result.hasUpdate) {
                    console.log(`   ✅ UPDATE AVAILABLE`);
                } else {
                    console.log(`   ℹ️  No update detected`);
                }
            }

            console.log();
            console.log('─'.repeat(70));
            console.log();
        }

        // Summary
        console.log('='.repeat(70));
        console.log('📋 SUMMARY\n');

        if (updates.length === 0) {
            console.log('✅ All data sources are up to date\n');
        } else {
            console.log(`📥 ${updates.length} update(s) available:\n`);

            updates.forEach((update, index) => {
                console.log(`${index + 1}. ${update.name}`);
                console.log(`   Source ID: ${update.source}`);

                if (update.remoteDataProcessed) {
                    console.log(`   Data processed: ${update.remoteDataProcessed}`);
                    if (update.dateObservation) {
                        console.log(`   Data observation: ${update.dateObservation}`);
                    }
                } else {
                    console.log(`   Modified: ${update.remoteModified}`);
                }

                console.log(`   URL: ${update.url}`);
                console.log();
            });

            console.log('💡 To import these updates, run:');
            console.log('   npm run pipeline');
        }

        console.log();

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await end();
    }
}

// Execute
main();
