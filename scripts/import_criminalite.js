#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const zlib = require('zlib');
const csv = require('csv-parser');
const { query, end } = require('../config/db_config');

/**
 * Import crime/delinquency statistics from SSMSI
 * Handles both gzipped and regular CSV files
 *
 * @param {string} csvPath - Path to CSV file (can be .csv or .csv.gz)
 * @param {object} options - Import options
 * @param {string} options.schema - Target schema (default: 'public')
 * @param {string} options.targetTable - Target table name (default: 'criminalite_2024')
 */
async function importCriminaliteData(csvPath, options = {}) {
    const schema = options.schema || 'public';
    const targetTable = options.targetTable || 'criminalite_2024';

    console.log('🚨 Importing Crime & Delinquency Data');
    console.log('======================================\n');
    console.log(`File: ${csvPath}`);
    console.log(`Target: ${schema}.${targetTable}\n`);

    try {
        // Read and parse CSV
        console.log('⏳ Reading CSV file...');
        const records = [];
        let lineNumber = 0;
        const isGzipped = csvPath.endsWith('.gz');

        await new Promise((resolve, reject) => {
            let stream = fs.createReadStream(csvPath);

            // If file is gzipped, decompress it
            if (isGzipped) {
                console.log('   Decompressing gzip file...');
                stream = stream.pipe(zlib.createGunzip());
            }

            stream
                .pipe(csv({
                    separator: ';',
                    // CSV has headers, let csv-parser detect them
                }))
                .on('data', (row) => {
                    lineNumber++;

                    // Skip empty rows
                    if (!row.CODGEO_2025 || row.CODGEO_2025.trim() === '') {
                        return;
                    }

                    // Helper to parse values (handle NA and empty strings)
                    const parseValue = (val) => {
                        if (!val || val === 'NA' || val.trim() === '') return null;
                        return val.trim();
                    };

                    const parseNumber = (val) => {
                        if (!val || val === 'NA' || val.trim() === '') return null;
                        const num = parseInt(val);
                        return isNaN(num) ? null : num;
                    };

                    const parseDecimal = (val) => {
                        if (!val || val === 'NA' || val.trim() === '') return null;
                        const num = parseFloat(val.replace(',', '.'));
                        return isNaN(num) ? null : num;
                    };

                    // Clean and convert data
                    const record = {
                        code_commune: parseValue(row.CODGEO_2025),
                        annee: parseNumber(row.annee),
                        indicateur: parseValue(row.indicateur),
                        unite_de_compte: parseValue(row.unite_de_compte),
                        nombre: parseNumber(row.nombre),
                        taux_pour_mille: parseDecimal(row.taux_pour_mille),
                        est_diffuse: parseValue(row.est_diffuse),
                        insee_pop: parseNumber(row.insee_pop),
                        insee_log: parseNumber(row.insee_log),
                        complement_info_nombre: parseDecimal(row.complement_info_nombre),
                        complement_info_taux: parseDecimal(row.complement_info_taux)
                    };

                    records.push(record);

                    if (records.length % 10000 === 0) {
                        process.stdout.write(`\rParsed ${records.length} records...`);
                    }
                })
                .on('end', () => {
                    console.log(`\n✅ Parsed ${records.length} records\n`);
                    resolve();
                })
                .on('error', reject);
        });

        if (records.length === 0) {
            console.log('⚠️  No records found in CSV');
            return;
        }

        // Begin transaction
        console.log('⏳ Starting database import...');
        await query('BEGIN');

        // Truncate table
        console.log(`   Clearing existing data from ${targetTable}...`);
        await query(`TRUNCATE TABLE ${schema}.${targetTable}`);

        // Bulk insert
        console.log('   Inserting records...');

        const columns = [
            'code_commune', 'annee', 'indicateur', 'unite_de_compte', 'nombre',
            'taux_pour_mille', 'est_diffuse', 'insee_pop', 'insee_log',
            'complement_info_nombre', 'complement_info_taux'
        ];

        // Insert in batches
        const batchSize = 1000;
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);

            const values = batch.map((r, idx) => {
                const offset = idx;
                return `($${offset * 11 + 1}, $${offset * 11 + 2}, $${offset * 11 + 3}, $${offset * 11 + 4},
                        $${offset * 11 + 5}, $${offset * 11 + 6}, $${offset * 11 + 7}, $${offset * 11 + 8},
                        $${offset * 11 + 9}, $${offset * 11 + 10}, $${offset * 11 + 11})`;
            }).join(',');

            const params = batch.flatMap(r => [
                r.code_commune, r.annee, r.indicateur, r.unite_de_compte, r.nombre,
                r.taux_pour_mille, r.est_diffuse, r.insee_pop, r.insee_log,
                r.complement_info_nombre, r.complement_info_taux
            ]);

            await query(
                `INSERT INTO ${schema}.${targetTable} (${columns.join(', ')}) VALUES ${values}`,
                params
            );

            process.stdout.write(`\r   Imported ${Math.min(i + batchSize, records.length)}/${records.length} records...`);
        }

        // Commit transaction
        await query('COMMIT');
        console.log('\n\n✅ Import complete!');

        // Show summary
        const result = await query(`
            SELECT
                COUNT(*) as total_records,
                COUNT(DISTINCT code_commune) as total_communes,
                COUNT(DISTINCT indicateur) as total_indicators,
                MIN(annee) as min_year,
                MAX(annee) as max_year
            FROM ${schema}.${targetTable}
        `);

        console.log('\n📊 Summary:');
        console.log(`   Total records: ${result.rows[0].total_records}`);
        console.log(`   Unique communes: ${result.rows[0].total_communes}`);
        console.log(`   Crime indicators: ${result.rows[0].total_indicators}`);
        console.log(`   Year range: ${result.rows[0].min_year} - ${result.rows[0].max_year}`);
        console.log();

    } catch (error) {
        await query('ROLLBACK');
        console.error('\n❌ Import failed:', error.message);
        console.error(error.stack);
        throw error;
    } finally {
        await end();
    }
}

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2);

    let csvPath = './data/downloads/criminalite_2024.csv.gz';
    let schema = 'public';
    let targetTable = 'criminalite_2024';

    const schemaIndex = args.indexOf('--schema');
    if (schemaIndex >= 0 && args[schemaIndex + 1]) {
        schema = args[schemaIndex + 1];
    }

    const tableIndex = Math.max(args.indexOf('--table'), args.indexOf('--target-table'));
    if (tableIndex >= 0 && args[tableIndex + 1]) {
        targetTable = args[tableIndex + 1];
    }

    const csvArg = args.find(arg => !arg.startsWith('--') && args.indexOf(arg) === args.lastIndexOf(arg));
    if (csvArg) {
        csvPath = csvArg;
    }

    console.log('📝 Arguments:');
    console.log(`   Schema: ${schema}`);
    console.log(`   Table: ${targetTable}`);
    console.log(`   CSV: ${csvPath}\n`);

    importCriminaliteData(csvPath, { schema, targetTable }).catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = { importCriminaliteData };
