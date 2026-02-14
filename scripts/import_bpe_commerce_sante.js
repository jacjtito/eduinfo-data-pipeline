#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const { query, end } = require('../config/db_config');

/**
 * Import INSEE BPE data (Base Permanente des Équipements)
 * Commerce and health services facilities by commune
 *
 * @param {string} csvPath - Path to CSV file
 * @param {string} targetTable - Target table name (default: commerce_sante_2024)
 */
async function importBPEData(csvPath, targetTable = 'commerce_sante_2024') {
    console.log('📦 Importing BPE Commerce & Santé Data');
    console.log('=====================================\n');
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
                    skipLines: 2, // Skip the 2 metadata header lines
                    headers: [
                        'code_commune',
                        'commune',
                        'chirurgien_dentiste',
                        'police_gendarmerie',
                        'banque_caisse_epargne',
                        'grande_surface',
                        'superette_epicerie',
                        'boulangerie_patisserie',
                        'ecole_maternelle_primaire_elementaire',
                        'college',
                        'lycee',
                        'urgences',
                        'medecin_generaliste',
                        'masseur_kinesitherapeute',
                        'pharmacie',
                        'infirmier',
                        'personnes_agees_hebergement',
                        'eaje_accueil_jeune_enfant',
                        'bassin_natation',
                        'salles_multisports'
                    ]
                }))
                .on('data', (row) => {
                    lineNumber++;

                    // Skip empty rows
                    if (!row.code_commune || row.code_commune.trim() === '') {
                        return;
                    }

                    // Clean and convert data
                    const record = {
                        code_commune: row.code_commune.trim(),
                        commune: row.commune.trim(),
                        police_gendarmerie: parseInt(row.police_gendarmerie) || 0,
                        banque_caisse_epargne: parseInt(row.banque_caisse_epargne) || 0,
                        grande_surface: parseInt(row.grande_surface) || 0,
                        superette_epicerie: parseInt(row.superette_epicerie) || 0,
                        boulangerie_patisserie: parseInt(row.boulangerie_patisserie) || 0,
                        ecole_maternelle_primaire_elementaire: parseInt(row.ecole_maternelle_primaire_elementaire) || 0,
                        college: parseInt(row.college) || 0,
                        urgences: parseInt(row.urgences) || 0,
                        lycee: parseInt(row.lycee) || 0,
                        medecin_generaliste: parseInt(row.medecin_generaliste) || 0,
                        chirurgien_dentiste: parseInt(row.chirurgien_dentiste) || 0,
                        masseur_kinesitherapeute: parseInt(row.masseur_kinesitherapeute) || 0,
                        infirmier: parseInt(row.infirmier) || 0,
                        pharmacie: parseInt(row.pharmacie) || 0,
                        personnes_agees_hebergement: parseInt(row.personnes_agees_hebergement) || 0,
                        eaje_accueil_jeune_enfant: parseInt(row.eaje_accueil_jeune_enfant) || 0,
                        bassin_natation: parseInt(row.bassin_natation) || 0,
                        salles_multisports: parseInt(row.salles_multisports) || 0
                    };

                    records.push(record);

                    if (records.length % 5000 === 0) {
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

        // Bulk insert using COPY
        console.log('   Inserting records...');

        const columns = [
            'code_commune', 'commune', 'police_gendarmerie', 'banque_caisse_epargne',
            'grande_surface', 'superette_epicerie', 'boulangerie_patisserie',
            'ecole_maternelle_primaire_elementaire', 'college', 'urgences', 'lycee',
            'medecin_generaliste', 'chirurgien_dentiste', 'masseur_kinesitherapeute',
            'infirmier', 'pharmacie', 'personnes_agees_hebergement',
            'eaje_accueil_jeune_enfant', 'bassin_natation', 'salles_multisports'
        ];

        // Insert in batches
        const batchSize = 1000;
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);

            const values = batch.map((r, idx) => {
                const offset = idx;  // Use batch-relative position, not absolute
                return `($${offset * 20 + 1}, $${offset * 20 + 2}, $${offset * 20 + 3}, $${offset * 20 + 4},
                        $${offset * 20 + 5}, $${offset * 20 + 6}, $${offset * 20 + 7}, $${offset * 20 + 8},
                        $${offset * 20 + 9}, $${offset * 20 + 10}, $${offset * 20 + 11}, $${offset * 20 + 12},
                        $${offset * 20 + 13}, $${offset * 20 + 14}, $${offset * 20 + 15}, $${offset * 20 + 16},
                        $${offset * 20 + 17}, $${offset * 20 + 18}, $${offset * 20 + 19}, $${offset * 20 + 20})`;
            }).join(',');

            const params = batch.flatMap(r => [
                r.code_commune, r.commune, r.police_gendarmerie, r.banque_caisse_epargne,
                r.grande_surface, r.superette_epicerie, r.boulangerie_patisserie,
                r.ecole_maternelle_primaire_elementaire, r.college, r.urgences, r.lycee,
                r.medecin_generaliste, r.chirurgien_dentiste, r.masseur_kinesitherapeute,
                r.infirmier, r.pharmacie, r.personnes_agees_hebergement,
                r.eaje_accueil_jeune_enfant, r.bassin_natation, r.salles_multisports
            ]);

            await query(
                `INSERT INTO public.${targetTable} (${columns.join(', ')}) VALUES ${values}
                 ON CONFLICT (code_commune) DO UPDATE SET
                    commune = EXCLUDED.commune,
                    police_gendarmerie = EXCLUDED.police_gendarmerie,
                    banque_caisse_epargne = EXCLUDED.banque_caisse_epargne,
                    grande_surface = EXCLUDED.grande_surface,
                    superette_epicerie = EXCLUDED.superette_epicerie,
                    boulangerie_patisserie = EXCLUDED.boulangerie_patisserie,
                    ecole_maternelle_primaire_elementaire = EXCLUDED.ecole_maternelle_primaire_elementaire,
                    college = EXCLUDED.college,
                    urgences = EXCLUDED.urgences,
                    lycee = EXCLUDED.lycee,
                    medecin_generaliste = EXCLUDED.medecin_generaliste,
                    chirurgien_dentiste = EXCLUDED.chirurgien_dentiste,
                    masseur_kinesitherapeute = EXCLUDED.masseur_kinesitherapeute,
                    infirmier = EXCLUDED.infirmier,
                    pharmacie = EXCLUDED.pharmacie,
                    personnes_agees_hebergement = EXCLUDED.personnes_agees_hebergement,
                    eaje_accueil_jeune_enfant = EXCLUDED.eaje_accueil_jeune_enfant,
                    bassin_natation = EXCLUDED.bassin_natation,
                    salles_multisports = EXCLUDED.salles_multisports`,
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
                COUNT(*) as total_communes,
                SUM(CASE WHEN lycee > 0 THEN 1 ELSE 0 END) as communes_avec_lycee,
                SUM(CASE WHEN college > 0 THEN 1 ELSE 0 END) as communes_avec_college,
                SUM(CASE WHEN pharmacie > 0 THEN 1 ELSE 0 END) as communes_avec_pharmacie
            FROM public.${targetTable}
        `);

        console.log('\n📊 Summary:');
        console.log(`   Total communes: ${result.rows[0].total_communes}`);
        console.log(`   Communes with lycée: ${result.rows[0].communes_avec_lycee}`);
        console.log(`   Communes with collège: ${result.rows[0].communes_avec_college}`);
        console.log(`   Communes with pharmacy: ${result.rows[0].communes_avec_pharmacie}`);
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
    const csvPath = process.argv[2] || './data/samples/equipement_service_population_2024.csv';
    const targetTable = process.argv[3] || 'commerce_sante_2024';

    importBPEData(csvPath, targetTable).catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = { importBPEData };
