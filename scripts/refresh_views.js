#!/usr/bin/env node

require('dotenv').config();
const { query, end } = require('../config/db_config');

/**
 * Refresh all materialized views
 */
async function run() {
    console.log('🔄 Refreshing materialized views...\n');

    const views = [
        'mv_colleges_with_metrics',
        'mv_lycees_with_metrics'
    ];

    try {
        for (const view of views) {
            console.log(`  Refreshing: ${view}`);
            const start = Date.now();

            await query(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${view}`);

            const duration = ((Date.now() - start) / 1000).toFixed(2);
            console.log(`  ✅ Done (${duration}s)`);
        }

        console.log('\n✅ All materialized views refreshed\n');

    } catch (error) {
        console.error('❌ Error refreshing views:', error.message);
        throw error;
    }
}

// CLI execution
if (require.main === module) {
    run()
        .then(() => {
            end();
            process.exit(0);
        })
        .catch(err => {
            console.error(err.stack);
            end();
            process.exit(1);
        });
}

module.exports = { run };
