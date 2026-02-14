#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const { query, end } = require('../config/db_config');

/**
 * Import IPS (Indice de Position Sociale) data for collèges
 * Social position index for French middle schools - Full dataset
 *
 * @param {string} csvPath - Path to CSV file
 * @param {string} targetTable - Target table name (default: ips_colleges_2024)
 */
async function importIPSCollegesData(csvPath, targetTable = 'ips_colleges_2024') {
    console.log('🎓 Importing IPS Collèges Data');
    console.log('==============================\n');
    console.log(`File: ${csvPath}`);
    console.log(`Target table: public.${targetTable}\n`);

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
                        ips: parseDecimal(row.ips),
                        ecart_type_de_l_ips: parseDecimal(row.ecart_type_de_l_ips),
                        ips_national_prive: parseDecimal(row.ips_national_prive),
                        ips_national_public: parseDecimal(row.ips_national_public),
                        ips_national: parseDecimal(row.ips_national),
                        ips_academique_prive: parseDecimal(row.ips_academique_prive),
                        ips_academique_public: parseDecimal(row.ips_academique_public),
                        ips_academique: parseDecimal(row.ips_academique),
                        ips_departemental_prive: parseDecimal(row.ips_departemental_prive),
                        ips_departemental_public: parseDecimal(row.ips_departemental_public),
                        ips_departemental: parseDecimal(row.ips_departemental),
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
        console.log(`   Clearing existing data from ${targetTable}...`);
        await query(`TRUNCATE TABLE public.${targetTable}`);

        // Bulk insert
        console.log('   Inserting records...');

        const columns = [
            'rentree_scolaire', 'code_region', 'region_academique', 'code_academie', 'academie',
            'code_du_departement', 'departement', 'code_insee_de_la_commune', 'nom_de_la_commune',
            'uai', 'nom_de_l_etablissement', 'secteur', 'ips', 'ecart_type_de_l_ips',
            'ips_national_prive', 'ips_national_public', 'ips_national',
            'ips_academique_prive', 'ips_academique_public', 'ips_academique',
            'ips_departemental_prive', 'ips_departemental_public', 'ips_departemental',
            'num_ligne'
        ];

        // Insert in batches (24 columns per record)
        const batchSize = 500;
        const numColumns = 24;

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
                r.uai, r.nom_de_l_etablissement, r.secteur, r.ips, r.ecart_type_de_l_ips,
                r.ips_national_prive, r.ips_national_public, r.ips_national,
                r.ips_academique_prive, r.ips_academique_public, r.ips_academique,
                r.ips_departemental_prive, r.ips_departemental_public, r.ips_departemental,
                r.num_ligne
            ]);

            await query(
                `INSERT INTO public.${targetTable} (${columns.join(', ')}) VALUES ${values}`,
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
                COUNT(*) as total_colleges,
                COUNT(DISTINCT academie) as total_academies,
                COUNT(DISTINCT code_du_departement) as total_departements,
                COUNT(DISTINCT code_region) as total_regions,
                ROUND(AVG(ips)::numeric, 2) as avg_ips,
                ROUND(MIN(ips)::numeric, 2) as min_ips,
                ROUND(MAX(ips)::numeric, 2) as max_ips,
                COUNT(CASE WHEN secteur = 'public' THEN 1 END) as colleges_publics,
                COUNT(CASE WHEN secteur = 'prive' THEN 1 END) as colleges_prives
            FROM public.${targetTable}
            WHERE ips IS NOT NULL
        `);

        console.log('\n📊 Summary:');
        console.log(`   Total collèges: ${result.rows[0].total_colleges}`);
        console.log(`   Régions: ${result.rows[0].total_regions}`);
        console.log(`   Académies: ${result.rows[0].total_academies}`);
        console.log(`   Départements: ${result.rows[0].total_departements}`);
        console.log(`   Average IPS: ${result.rows[0].avg_ips}`);
        console.log(`   IPS range: ${result.rows[0].min_ips} - ${result.rows[0].max_ips}`);
        console.log(`   Public: ${result.rows[0].colleges_publics}`);
        console.log(`   Private: ${result.rows[0].colleges_prives}`);
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
    const csvPath = process.argv[2] || './data/downloads/ips_colleges_2024.csv';
    const targetTable = process.argv[3] || 'ips_colleges_2024';

    importIPSCollegesData(csvPath, targetTable).catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = { importIPSCollegesData };
