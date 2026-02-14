#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const { getClient, end } = require('../config/db_config');

/**
 * Import ONISEP establishments from CSV
 * @param {string} filePath - Path to CSV file
 */
async function run(filePath) {
    console.log(`Importing ONISEP data from: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const records = [];

    // Parse CSV
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                records.push({
                    code_uai: row.code_uai || null,
                    n_siret: row.n_siret || null,
                    nom: row.nom,
                    sigle: row.sigle || null,
                    type_etablissement: row.type_detablissement,
                    statut: row.statut,
                    tutelle: row.tutelle || null,
                    adresse: row.adresse,
                    cp: row.cp,
                    commune: row.commune,
                    commune_cog: row.commune_cog,
                    departement: row.departement,
                    academie: row.academie,
                    region: row.region,
                    region_cog: row.region_cog,
                    longitude: parseFloat(row.longitude_x) || null,
                    latitude: parseFloat(row.latitude_y) || null,
                    telephone: row.telephone || null,
                    url_onisep: row.url_et_id_onisep || null,
                    journees_portes_ouvertes: row.journees_portes_ouvertes || null,
                    langues_enseignees: row.langues_enseignees || null,
                    date_creation: row.date_creation || null,
                    date_modification: row.date_de_modification || null
                });
            })
            .on('end', async () => {
                console.log(`✅ Parsed ${records.length} establishments`);

                try {
                    await importRecords(records);
                    console.log('✅ Import complete');
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
            .on('error', reject);
    });
}

/**
 * Bulk import records to database
 * @param {Array} records - Array of establishment records
 */
async function importRecords(records) {
    const client = await getClient();

    try {
        await client.query('BEGIN');

        console.log('💾 Importing to database...');

        // Create table if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS onisep_etablissements (
                code_uai VARCHAR(8) PRIMARY KEY,
                n_siret VARCHAR(14),
                nom TEXT NOT NULL,
                sigle VARCHAR(50),
                type_etablissement VARCHAR(100),
                statut VARCHAR(50),
                tutelle TEXT,
                adresse TEXT,
                cp VARCHAR(10),
                commune VARCHAR(100),
                commune_cog VARCHAR(10),
                departement VARCHAR(50),
                academie VARCHAR(50),
                region VARCHAR(50),
                region_cog VARCHAR(5),
                longitude DECIMAL(10, 7),
                latitude DECIMAL(10, 7),
                geom GEOMETRY(POINT, 4326),
                telephone VARCHAR(20),
                url_onisep TEXT,
                journees_portes_ouvertes TEXT,
                langues_enseignees TEXT,
                date_creation TIMESTAMP,
                date_modification TIMESTAMP,
                last_synced TIMESTAMP DEFAULT NOW()
            )
        `);

        // Create indexes if not exist
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_onisep_type ON onisep_etablissements(type_etablissement);
            CREATE INDEX IF NOT EXISTS idx_onisep_statut ON onisep_etablissements(statut);
            CREATE INDEX IF NOT EXISTS idx_onisep_academie ON onisep_etablissements(academie);
            CREATE INDEX IF NOT EXISTS idx_onisep_commune_cog ON onisep_etablissements(commune_cog);
        `);

        let imported = 0;
        let skipped = 0;

        for (const record of records) {
            // Skip records without UAI
            if (!record.code_uai) {
                skipped++;
                continue;
            }

            await client.query(`
                INSERT INTO onisep_etablissements
                (code_uai, n_siret, nom, sigle, type_etablissement, statut, tutelle,
                 adresse, cp, commune, commune_cog, departement, academie, region, region_cog,
                 longitude, latitude, geom, telephone, url_onisep,
                 journees_portes_ouvertes, langues_enseignees,
                 date_creation, date_modification, last_synced)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
                        ST_SetSRID(ST_MakePoint($16, $17), 4326),
                        $18, $19, $20, $21, $22, $23, NOW())
                ON CONFLICT (code_uai) DO UPDATE SET
                    nom = EXCLUDED.nom,
                    type_etablissement = EXCLUDED.type_etablissement,
                    statut = EXCLUDED.statut,
                    adresse = EXCLUDED.adresse,
                    commune = EXCLUDED.commune,
                    longitude = EXCLUDED.longitude,
                    latitude = EXCLUDED.latitude,
                    geom = EXCLUDED.geom,
                    telephone = EXCLUDED.telephone,
                    date_modification = EXCLUDED.date_modification,
                    last_synced = NOW()
            `, [
                record.code_uai, record.n_siret, record.nom, record.sigle,
                record.type_etablissement, record.statut, record.tutelle,
                record.adresse, record.cp, record.commune, record.commune_cog,
                record.departement, record.academie, record.region, record.region_cog,
                record.longitude, record.latitude,
                record.telephone, record.url_onisep,
                record.journees_portes_ouvertes, record.langues_enseignees,
                record.date_creation, record.date_modification
            ]);

            imported++;

            if (imported % 1000 === 0) {
                console.log(`  Progress: ${imported}/${records.length} (${((imported/records.length)*100).toFixed(1)}%)`);
            }
        }

        await client.query('COMMIT');

        console.log(`📊 Import summary:`);
        console.log(`  - Imported: ${imported}`);
        console.log(`  - Skipped (no UAI): ${skipped}`);

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// CLI execution
if (require.main === module) {
    const filePath = process.argv[2];

    if (!filePath) {
        console.error('Usage: node import_onisep.js <csv_file_path>');
        process.exit(1);
    }

    run(filePath)
        .then(() => {
            console.log('✅ Done');
            end();
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ Error:', err.message);
            console.error(err.stack);
            end();
            process.exit(1);
        });
}

module.exports = { run };
