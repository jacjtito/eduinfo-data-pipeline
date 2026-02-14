#!/usr/bin/env node

require('dotenv').config();
const updateChecker = require('../lib/monitoring/update_checker');
const { end } = require('../config/db_config');

/**
 * Check all data sources for updates
 */
async function main() {
    console.log('🔍 Checking for data updates...\n');

    try {
        const updates = await updateChecker.checkAllSources();

        if (updates.length === 0) {
            console.log('✅ All data sources are up to date\n');
            return;
        }

        console.log(`\n📊 Found ${updates.length} update(s) available:\n`);

        updates.forEach((update, index) => {
            console.log(`${index + 1}. ${update.name}`);
            console.log(`   Source ID: ${update.source}`);
            console.log(`   Last known: ${update.lastKnownModified || 'Never checked'}`);
            console.log(`   Remote modified: ${update.remoteModified}`);
            console.log(`   URL: ${update.url}`);
            console.log();
        });

        console.log('💡 To import these updates, run:');
        console.log('   npm run pipeline');
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
