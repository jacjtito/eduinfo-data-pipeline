#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const { query, end } = require('../config/db_config');

/**
 * Import IPS (Indice de Position Sociale) data for lycées
 * Social position index for French high schools - Full dataset
 *
 * @param {string} csvPath - Path to CSV file
 * @param {object} options - Import options
 * @param {string} options.schema - Target schema (default: 'public')
 * @param {string} options.targetTable - Target table name (default: 'ips_lycees')
 */
async function importIPSLyceesData(csvPath, options = {}) {
    const schema = options.schema || 'public';
    const targetTable = options.targetTable || 'ips_lycees';

    console.log('🎓 Importing IPS Lycées Data');
    console.log('============================\n');
    console.log(`File: ${csvPath}`);
    console.log(`Target: ${schema}.${targetTable}\n`);

    try {
        // Read and parse CSV
        console.log('⏳ Reading CSV file...');
        const records = [];
        let lineNumber = 0;

        await new Promise((resolve, reject) => {
            fs.createReadStream(csvPath)
                .pipe(csv({
                    separator: ';',
                    // CSV has headers, let csv-parser detect them
                }))
                .on('data', (row) => {
                    lineNumber++;

                    // Skip empty rows
                    if (!row.uai || row.uai.trim() === '') {
                        return;
                    }

                    // Helper functions to parse values
                    const parseValue = (val) => {
                        if (!val || val.trim() === '' || val === 'ns' || val === 'NC') return null;
                        return val.trim();
                    };

                    const parseNumber = (val) => {
                        if (!val || val.trim() === '' || val === 'ns' || val === 'NC') return null;
                        const num = parseInt(val);
                        return isNaN(num) ? null : num;
                    };

                    const parseDecimal = (val) => {
                        if (!val || val.trim() === '' || val === 'ns' || val === 'NC') return null;
                        const num = parseFloat(val.replace(',', '.'));
                        return isNaN(num) ? null : num;
                    };

                    // Map all CSV columns to database columns
                    const record = {
                        rentree_scolaire: parseValue(row.rentree_scolaire),
                        code_region: parseValue(row.code_region),
                        region_academique: parseValue(row.region_academique),
                        code_academie: parseValue(row.code_academie),
                        academie: parseValue(row.academie),
                        code_du_departement: parseValue(row.code_du_departement),
                        departement: parseValue(row.departement),
                        code_insee_de_la_commune: parseValue(row.code_insee_de_la_commune),
                        nom_de_la_commune: parseValue(row.nom_de_la_commune),
                        uai: parseValue(row.uai),
                        nom_de_l_etablissement: parseValue(row.nom_de_l_etablissement),
                        secteur: parseValue(row.secteur),
                        type_de_lycee: parseValue(row.type_de_lycee),
                        ips_voie_gt: parseDecimal(row.ips_voie_gt),
                        ips_voie_pro: parseDecimal(row.ips_voie_pro),
                        ips_post_bac: parseDecimal(row.ips_post_bac),
                        ips_etab: parseDecimal(row.ips_etab),
                        ecart_type_voie_gt: parseDecimal(row.ecart_type_voie_gt),
                        ecart_type_voie_pro: parseDecimal(row.ecart_type_voie_pro),
                        ecart_type_etablissement: parseDecimal(row.ecart_type_etablissement),
                        ips_national_legt: parseDecimal(row.ips_national_legt),
                        ips_national_lpo: parseDecimal(row.ips_national_lpo),
                        ips_national_lp: parseDecimal(row.ips_national_lp),
                        ips_national_legt_prive: parseDecimal(row.ips_national_legt_prive),
                        ips_national_legt_public: parseDecimal(row.ips_national_legt_public),
                        ips_national_lpo_prive: parseDecimal(row.ips_national_lpo_prive),
                        ips_national_lpo_public: parseDecimal(row.ips_national_lpo_public),
                        ips_national_lp_prive: parseDecimal(row.ips_national_lp_prive),
                        ips_national_lp_public: parseDecimal(row.ips_national_lp_public),
                        ips_academique_legt: parseDecimal(row.ips_academique_legt),
                        ips_academique_lpo: parseDecimal(row.ips_academique_lpo),
                        ips_academique_lp: parseDecimal(row.ips_academique_lp),
                        ips_academique_legt_prive: parseDecimal(row.ips_academique_legt_prive),
                        ips_academique_legt_public: parseDecimal(row.ips_academique_legt_public),
                        ips_academique_lpo_prive: parseDecimal(row.ips_academique_lpo_prive),
                        ips_academique_lpo_public: parseDecimal(row.ips_academique_lpo_public),
                        ips_academique_lp_prive: parseDecimal(row.ips_academique_lp_prive),
                        ips_academique_lp_public: parseDecimal(row.ips_academique_lp_public),
                        ips_departemental_legt: parseDecimal(row.ips_departemental_legt),
                        ips_departemental_lpo: parseDecimal(row.ips_departemental_lpo),
                        ips_departemental_lp: parseDecimal(row.ips_departemental_lp),
                        ips_departemental_legt_prive: parseDecimal(row.ips_departemental_legt_prive),
                        ips_departemental_legt_public: parseDecimal(row.ips_departemental_legt_public),
                        ips_departemental_lpo_prive: parseDecimal(row.ips_departemental_lpo_prive),
                        ips_departemental_lpo_public: parseDecimal(row.ips_departemental_lpo_public),
                        ips_departemental_lp_prive: parseDecimal(row.ips_departemental_lp_prive),
                        ips_departemental_lp_public: parseDecimal(row.ips_departemental_lp_public),
                        num_ligne: parseNumber(row.num_ligne)
                    };

                    records.push(record);

                    if (records.length % 1000 === 0) {
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
        console.log(`   Clearing existing data from ${schema}.${targetTable}...`);
        await query(`TRUNCATE TABLE ${schema}.${targetTable}`);

        // Bulk insert
        console.log('   Inserting records...');

        const columns = [
            'rentree_scolaire', 'code_region', 'region_academique', 'code_academie', 'academie',
            'code_du_departement', 'departement', 'code_insee_de_la_commune', 'nom_de_la_commune',
            'uai', 'nom_de_l_etablissement', 'secteur', 'type_de_lycee',
            'ips_voie_gt', 'ips_voie_pro', 'ips_post_bac', 'ips_etab',
            'ecart_type_voie_gt', 'ecart_type_voie_pro', 'ecart_type_etablissement',
            'ips_national_legt', 'ips_national_lpo', 'ips_national_lp',
            'ips_national_legt_prive', 'ips_national_legt_public',
            'ips_national_lpo_prive', 'ips_national_lpo_public',
            'ips_national_lp_prive', 'ips_national_lp_public',
            'ips_academique_legt', 'ips_academique_lpo', 'ips_academique_lp',
            'ips_academique_legt_prive', 'ips_academique_legt_public',
            'ips_academique_lpo_prive', 'ips_academique_lpo_public',
            'ips_academique_lp_prive', 'ips_academique_lp_public',
            'ips_departemental_legt', 'ips_departemental_lpo', 'ips_departemental_lp',
            'ips_departemental_legt_prive', 'ips_departemental_legt_public',
            'ips_departemental_lpo_prive', 'ips_departemental_lpo_public',
            'ips_departemental_lp_prive', 'ips_departemental_lp_public',
            'num_ligne'
        ];

        // Insert in batches (48 columns per record)
        const batchSize = 500;
        const numColumns = 48;

        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);

            const values = batch.map((r, idx) => {
                const offset = idx;
                const params = [];
                for (let j = 1; j <= numColumns; j++) {
                    params.push(`$${offset * numColumns + j}`);
                }
                return `(${params.join(', ')})`;
            }).join(',');

            const params = batch.flatMap(r => [
                r.rentree_scolaire, r.code_region, r.region_academique, r.code_academie, r.academie,
                r.code_du_departement, r.departement, r.code_insee_de_la_commune, r.nom_de_la_commune,
                r.uai, r.nom_de_l_etablissement, r.secteur, r.type_de_lycee,
                r.ips_voie_gt, r.ips_voie_pro, r.ips_post_bac, r.ips_etab,
                r.ecart_type_voie_gt, r.ecart_type_voie_pro, r.ecart_type_etablissement,
                r.ips_national_legt, r.ips_national_lpo, r.ips_national_lp,
                r.ips_national_legt_prive, r.ips_national_legt_public,
                r.ips_national_lpo_prive, r.ips_national_lpo_public,
                r.ips_national_lp_prive, r.ips_national_lp_public,
                r.ips_academique_legt, r.ips_academique_lpo, r.ips_academique_lp,
                r.ips_academique_legt_prive, r.ips_academique_legt_public,
                r.ips_academique_lpo_prive, r.ips_academique_lpo_public,
                r.ips_academique_lp_prive, r.ips_academique_lp_public,
                r.ips_departemental_legt, r.ips_departemental_lpo, r.ips_departemental_lp,
                r.ips_departemental_legt_prive, r.ips_departemental_legt_public,
                r.ips_departemental_lpo_prive, r.ips_departemental_lpo_public,
                r.ips_departemental_lp_prive, r.ips_departemental_lp_public,
                r.num_ligne
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
                COUNT(*) as total_lycees,
                COUNT(DISTINCT academie) as total_academies,
                COUNT(DISTINCT code_du_departement) as total_departements,
                COUNT(DISTINCT code_region) as total_regions,
                ROUND(AVG(ips_etab)::numeric, 2) as avg_ips,
                ROUND(MIN(ips_etab)::numeric, 2) as min_ips,
                ROUND(MAX(ips_etab)::numeric, 2) as max_ips,
                COUNT(CASE WHEN ips_voie_gt IS NOT NULL THEN 1 END) as avec_voie_gt,
                COUNT(CASE WHEN ips_voie_pro IS NOT NULL THEN 1 END) as avec_voie_pro,
                COUNT(CASE WHEN ips_post_bac IS NOT NULL THEN 1 END) as avec_post_bac
            FROM ${schema}.${targetTable}
            WHERE ips_etab IS NOT NULL
        `);

        console.log('\n📊 Summary:');
        console.log(`   Total lycées: ${result.rows[0].total_lycees}`);
        console.log(`   Régions: ${result.rows[0].total_regions}`);
        console.log(`   Académies: ${result.rows[0].total_academies}`);
        console.log(`   Départements: ${result.rows[0].total_departements}`);
        console.log(`   Average IPS: ${result.rows[0].avg_ips}`);
        console.log(`   IPS range: ${result.rows[0].min_ips} - ${result.rows[0].max_ips}`);
        console.log(`   With GT track: ${result.rows[0].avec_voie_gt}`);
        console.log(`   With Pro track: ${result.rows[0].avec_voie_pro}`);
        console.log(`   With Post-Bac: ${result.rows[0].avec_post_bac}`);
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
    // Parse command-line arguments
    const args = process.argv.slice(2);

    // Extract options
    let csvPath = './data/downloads/ips_lycees_2024.csv';
    let schema = 'public';
    let targetTable = 'ips_lycees';

    // Parse --schema
    const schemaIndex = args.indexOf('--schema');
    if (schemaIndex >= 0 && args[schemaIndex + 1]) {
        schema = args[schemaIndex + 1];
    }

    // Parse --table or --target-table
    const tableIndex = Math.max(args.indexOf('--table'), args.indexOf('--target-table'));
    if (tableIndex >= 0 && args[tableIndex + 1]) {
        targetTable = args[tableIndex + 1];
    }

    // Parse CSV path (first non-flag argument)
    const csvArg = args.find(arg => !arg.startsWith('--') && args.indexOf(arg) === args.lastIndexOf(arg));
    if (csvArg) {
        csvPath = csvArg;
    }

    console.log('📝 Arguments:');
    console.log(`   Schema: ${schema}`);
    console.log(`   Table: ${targetTable}`);
    console.log(`   CSV: ${csvPath}\n`);

    importIPSLyceesData(csvPath, { schema, targetTable }).catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = { importIPSLyceesData };
