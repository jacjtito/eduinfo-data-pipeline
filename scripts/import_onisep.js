#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const { query, end } = require('../config/db_config');

/**
 * Import ONISEP secondary education establishments data
 * Full dataset with establishments details, addresses, and coordinates
 *
 * @param {string} csvPath - Path to CSV file
 * @param {string} targetTable - Target table name (default: onisep_etablissements_2024)
 */
async function importONISEPData(csvPath, targetTable = 'onisep_etablissements_2024') {
    console.log('🏫 Importing ONISEP Établissements Data');
    console.log('=======================================\n');
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
                    skipLines: 0,
                    // Let csv-parser auto-detect headers
                }))
                .on('data', (row) => {
                    lineNumber++;

                    // Get the first column name (should be code UAI or similar with BOM)
                    const keys = Object.keys(row);
                    if (keys.length === 0) return;

                    // Find code UAI column (might have BOM or quotes)
                    const codeUaiKey = keys.find(k => k.includes('code UAI') || k.includes('UAI'));
                    if (!codeUaiKey || !row[codeUaiKey] || row[codeUaiKey].trim() === '') {
                        return;
                    }

                    // Helper functions to parse values
                    const parseValue = (val) => {
                        if (!val || typeof val !== 'string') return null;
                        if (val.trim() === '') return null;
                        return val.trim();
                    };

                    const parseDecimal = (val) => {
                        if (!val || typeof val !== 'string') return null;
                        if (val.trim() === '') return null;
                        const num = parseFloat(val.replace(',', '.'));
                        return isNaN(num) ? null : num;
                    };

                    const parseDate = (val) => {
                        if (!val || typeof val !== 'string') return null;
                        if (val.trim() === '') return null;
                        // Format: DD/MM/YYYY
                        const parts = val.trim().split('/');
                        if (parts.length === 3) {
                            return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert to YYYY-MM-DD
                        }
                        return null;
                    };

                    // Find column keys (handling BOM and variations)
                    const getColumn = (partialName) => {
                        const key = keys.find(k => k.includes(partialName));
                        return key ? row[key] : null;
                    };

                    // Map all CSV columns to database columns
                    const record = {
                        code_uai: parseValue(getColumn('UAI')),
                        numero_siret: parseValue(getColumn('SIRET')),
                        type_etablissement: parseValue(getColumn("tablissement")), // matches "établissement"
                        nom: parseValue(row['nom']),
                        sigle: parseValue(row['sigle']),
                        statut: parseValue(row['statut']),
                        tutelle: parseValue(row['tutelle']),
                        universite_rattachement_libelle_uai: parseValue(getColumn('rattachement libellé')),
                        universite_rattachement_id_url: parseValue(getColumn('rattachement ID')),
                        etablissements_lies_libelles: parseValue(getColumn('liés libellés') || getColumn('lies libelles')),
                        etablissements_lies_url_id: parseValue(getColumn('liés URL') || getColumn('lies URL')),
                        adresse_1: parseValue(row['adresse']),
                        adresse_2: null, // Second address column if exists
                        code_postal: parseValue(row['CP']),
                        commune: parseValue(row['commune']),
                        commune_cog: parseValue(getColumn('COG')),
                        cedex: parseValue(row['cedex']),
                        telephone: parseValue(row['telephone']),
                        arrondissement: parseValue(row['arrondissement']),
                        departement: parseValue(getColumn('partement')),
                        academie: parseValue(getColumn('acad') || getColumn('mie')),
                        region: parseValue(getColumn('gion') && !getColumn('gion').includes('(')),
                        region_cog: parseValue(getColumn('gion (COG)') || getColumn('gion (') && row[keys.find(k => k.includes('gion ('))]),
                        longitude: parseDecimal(getColumn('longitude')),
                        latitude: parseDecimal(getColumn('latitude')),
                        journees_portes_ouvertes: parseValue(getColumn('portes ouvertes')),
                        langues_enseignees: parseValue(getColumn('langues')),
                        url_id_onisep: parseValue(getColumn('URL et ID')),
                        date_creation: parseDate(getColumn('création') || getColumn('creation')),
                        date_modification: parseDate(getColumn('modification'))
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
            'code_uai', 'numero_siret', 'type_etablissement', 'nom', 'sigle',
            'statut', 'tutelle', 'universite_rattachement_libelle_uai', 'universite_rattachement_id_url',
            'etablissements_lies_libelles', 'etablissements_lies_url_id',
            'adresse_1', 'adresse_2', 'code_postal', 'commune', 'commune_cog',
            'cedex', 'telephone', 'arrondissement', 'departement', 'academie',
            'region', 'region_cog', 'longitude', 'latitude',
            'journees_portes_ouvertes', 'langues_enseignees', 'url_id_onisep',
            'date_creation', 'date_modification'
        ];

        // Insert in batches (30 columns per record)
        const batchSize = 500;
        const numColumns = 30;

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
                r.code_uai, r.numero_siret, r.type_etablissement, r.nom, r.sigle,
                r.statut, r.tutelle, r.universite_rattachement_libelle_uai, r.universite_rattachement_id_url,
                r.etablissements_lies_libelles, r.etablissements_lies_url_id,
                r.adresse_1, r.adresse_2, r.code_postal, r.commune, r.commune_cog,
                r.cedex, r.telephone, r.arrondissement, r.departement, r.academie,
                r.region, r.region_cog, r.longitude, r.latitude,
                r.journees_portes_ouvertes, r.langues_enseignees, r.url_id_onisep,
                r.date_creation, r.date_modification
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
                COUNT(*) as total_etablissements,
                COUNT(DISTINCT type_etablissement) as types_etablissement,
                COUNT(DISTINCT academie) as total_academies,
                COUNT(DISTINCT departement) as total_departements,
                COUNT(DISTINCT region) as total_regions,
                COUNT(CASE WHEN statut = 'public' THEN 1 END) as publics,
                COUNT(CASE WHEN statut = 'privé' THEN 1 END) as prives,
                COUNT(CASE WHEN longitude IS NOT NULL AND latitude IS NOT NULL THEN 1 END) as avec_coordonnees
            FROM public.${targetTable}
        `);

        const typesResult = await query(`
            SELECT type_etablissement, COUNT(*) as count
            FROM public.${targetTable}
            WHERE type_etablissement IS NOT NULL
            GROUP BY type_etablissement
            ORDER BY count DESC
            LIMIT 10
        `);

        console.log('\n📊 Summary:');
        console.log(`   Total établissements: ${result.rows[0].total_etablissements}`);
        console.log(`   Types d'établissement: ${result.rows[0].types_etablissement}`);
        console.log(`   Régions: ${result.rows[0].total_regions}`);
        console.log(`   Académies: ${result.rows[0].total_academies}`);
        console.log(`   Départements: ${result.rows[0].total_departements}`);
        console.log(`   Public: ${result.rows[0].publics}`);
        console.log(`   Privé: ${result.rows[0].prives}`);
        console.log(`   With coordinates: ${result.rows[0].avec_coordonnees}`);

        console.log('\n📋 Top types d\'établissement:');
        typesResult.rows.forEach(row => {
            console.log(`   ${row.type_etablissement}: ${row.count}`);
        });
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
    const csvPath = process.argv[2] || './data/downloads/onisep_etablissements_2024.csv';
    const targetTable = process.argv[3] || 'onisep_etablissements_2024';

    importONISEPData(csvPath, targetTable).catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = { importONISEPData };
