# Backup Analysis & Fresh Start Guide

**Generated**: 2026-02-14
**Purpose**: Inventory backup_from_eduinfo_orig and plan for clean database rebuild

---

## Executive Summary

The `backup_from_eduinfo_orig/` directory contains **everything needed** to rebuild the eduInfo database from scratch. This includes:

- ✅ Complete database schema (90+ tables across 3 schemas)
- ✅ Import scripts for all major datasets
- ✅ Python data cleaning utilities
- ✅ Cleaned CSV files ready for import
- ✅ Data source registry with API endpoints
- ✅ Full database backups from production

---

## Directory Structure

```
backup_from_eduinfo_orig/
├── Documentation
│   ├── DATABASE_USAGE_AUDIT.md       # Complete inventory of 90+ tables
│   ├── DATA_SOURCES_STATUS.md        # Status of 16 data sources
│   ├── DATA_SOURCE_ONISEP.md         # ONISEP API documentation
│   └── DB_POPULATION_CLEANUP_MIGRATION.md  # Migration tracking
│
├── Database Schema & Backups
│   └── db_backups_root/
│       ├── latest.sql                # Complete schema + data (May 2025)
│       ├── backup_before_ips_2024_*.sql
│       └── backup_before_immo_2024_*.sql
│
├── Import Scripts (JavaScript)
│   └── scripts/
│       ├── importAllOnisepData.js
│       ├── importIPSLycees2024.js
│       ├── importIPSColleges2024.js
│       ├── importSpecialitesLycees.js
│       ├── importEnseignementsOptionnelsSeconde.js
│       ├── importSectionsInternationales.js
│       ├── importMutationsImmo2024.js
│       ├── monitor_data_sources.js
│       └── check_dataset_updates.js
│
├── Data Cleaning (Python)
│   └── pgadmin/
│       ├── clean_lycees_csv.py
│       ├── clean_colleges_csv.py
│       ├── clean_etablissements_onisep.py
│       └── 9 other cleaning scripts
│
├── Cleaned Data Files (CSV)
│   └── pgadmin/
│       ├── communesdvf2024.csv         # DVF real estate (1.2 MB)
│       ├── criminalite_2023_filtered.csv  # Crime data (42 MB)
│       ├── cleaned_etablissements_onisep.csv  (2.1 MB)
│       ├── cleaned_commerce_sante.csv  (1.9 MB)
│       └── 40+ other cleaned CSV files
│
├── Data Source Registry
│   └── open_data_sources_registry.json  # 16 tracked data sources
│
└── Raw Government Data
    └── govData/
        ├── criminalite data
        ├── filosofi income data
        └── sectorisation PDFs
```

---

## Database Schema Overview

### From `latest.sql` backup (May 2025)

The production database has **90+ tables** across **3 schemas**:

#### 1. Public Schema (62+ tables)

**Educational Institutions:**
- `aggregated_data_lycees_2024` - Lycée performance 2024
- `aggregated_data_lycees` - Historical lycée data
- `metrics_colleges_2024` - Collège performance 2024
- `metrics_colleges` - Historical collège data
- `geodata_lycees` - Lycée geolocation
- `etablissements_onisep` - ONISEP establishment data

**IPS (Social Position Index):**
- `ips_lycees` - Lycée IPS scores
- `ips_colleges` - Collège IPS scores
- `ips_score` - IPS reference table

**Curriculum Data:**
- `specialites_lycees` - Lycée specialties (1ère)
- `enseignements_optionnels_seconde` - Optional courses (2nde)
- `sections_internationales` - International sections
- `onisep_details_formations_lycees` - ONISEP training details
- `onisep_details_formations_colleges` - Collège programs

**Commune Context Data:**
- `info_communes` - Comprehensive commune info (36,700 communes)
- `communes_limitrophes` - Neighboring communes
- `commerce_sante_2023` - Commerce/health facilities
- `mutations_immo_2023` - Real estate transactions
- `criminalite_2023` - Crime statistics
- `activite_economique_2022` - Economic activity
- `logement_2021` - Housing data
- `emploi_2021` - Employment data
- `niveau_education_2021` - Education levels
- `population_evolution_age` - Age distribution
- `merged_revenu_commune_bassin_2021` - Income data

#### 2. User Management Schema (14 tables)

- User accounts, subscriptions, authentication
- Activity tracking, analytics
- (Not needed for data pipeline - lives in main app)

#### 3. Monitoring Schema (3 tables)

- `data_sources` - Track dataset updates
- Operational monitoring
- Change detection

---

## What We've Already Migrated to New Structure

In the new `eduinfo-data-pipeline` repository, we've created:

### ✅ Migrations (Updated Structure)
- `005_add_metadata_tracking.sql` - Monitoring tables
- `006_create_commerce_sante_2024.sql` - BPE facilities 2024
- `007_create_criminalite_2024.sql` - Crime data 2024
- `008_create_ips_lycees_2024.sql` - Lycée IPS 2024 (48 columns)
- `009_create_ips_colleges_2024.sql` - Collège IPS 2024 (24 columns)
- `010_create_onisep_etablissements_2024.sql` - ONISEP 2024 (30 columns)

### ✅ Import Scripts (Modernized)
- `import_bpe_commerce_sante.js` - BPE importer ✅
- `import_criminalite.js` - Crime data (with gzip) ✅
- `import_ips_lycees.js` - Full IPS lycées ✅
- `import_ips_colleges.js` - Full IPS collèges ✅
- `import_onisep.js` - ONISEP with encoding fixes ✅
- `import_lycees.js` - Lycée performance data
- `import_colleges.js` - Collège metrics
- `import_dvf.js` - Real estate data
- `import_insee.js` - Commune data

### ✅ Data Successfully Imported
- 34,876 communes (BPE commerce/santé)
- 4.7M crime records (2016-2024)
- 7,243 lycées with IPS
- 13,972 collèges with IPS
- 14,671 ONISEP establishments

---

## What's Still in Backup (Not Yet Migrated)

### 🔄 Missing Import Scripts

These scripts exist in backup but not in new repo:

1. **importAllOnisepData.js** - Master ONISEP importer
   - Imports ONISEP training programs
   - Target: `onisep_details_formations_lycees`, `onisep_details_formations_colleges`

2. **importSpecialitesLycees.js** - Lycée specialties
   - Target: `specialites_lycees`
   - Source: ONISEP specialty data

3. **importEnseignementsOptionnelsSeconde.js** - Optional courses
   - Target: `enseignements_optionnels_seconde`
   - Source: ONISEP optional courses

4. **importSectionsInternationales.js** - International sections
   - Target: `sections_internationales`
   - Source: education.gouv.fr

### 🔄 Missing Table Migrations

Tables that exist in production but don't have migrations yet:

**Context Data Tables:**
- `logement_2021` - Housing data
- `emploi_2021` - Employment data
- `niveau_education_2021` - Education levels
- `population_evolution_age` - Age distribution
- `merged_revenu_commune_bassin_2021` - Income data
- `activite_economique_2022` - Economic activity
- `anecdotes_communes` - Commune anecdotes

**Reference Tables:**
- `communes_limitrophes` - Neighboring communes
- `ips_score` - IPS reference scores
- `pcs_libelle` - PCS category labels

**Geolocation Tables:**
- `lycees_address_uai_mapping` - UAI to address mapping
- `commune_boundaries` - Geographic boundaries

---

## Fresh Start Roadmap

### Phase 1: Core Schema Setup ✅ (Partially Done)

**Goal**: Create all essential tables for 2024 data

Already Created:
- [x] Monitoring tables (metadata tracking)
- [x] `commerce_sante_2024`
- [x] `criminalite_2024`
- [x] `ips_lycees_2024`
- [x] `ips_colleges_2024`
- [x] `onisep_etablissements_2024`

Still Needed:
- [ ] `aggregated_data_lycees_2024` (or use existing?)
- [ ] `metrics_colleges_2024` (or use existing?)
- [ ] `info_communes` (commune reference)
- [ ] `communes_limitrophes` (neighboring communes)
- [ ] `geodata_lycees` (geolocation)

### Phase 2: Curriculum Data Tables

- [ ] `specialites_lycees` - Lycée specialties
- [ ] `enseignements_optionnels_seconde` - Optional courses
- [ ] `sections_internationales` - International sections
- [ ] `onisep_details_formations_lycees` - Training programs
- [ ] `onisep_details_formations_colleges` - Collège programs

### Phase 3: Context Data Tables (2024 updates)

- [ ] `logement_2024` - Housing
- [ ] `emploi_2024` - Employment
- [ ] `niveau_education_2024` - Education levels
- [ ] `population_evolution_age_2024` - Demographics
- [ ] `revenus_2024` - Income data
- [ ] `activite_economique_2024` - Economic activity

### Phase 4: Import All Data

With migrations complete, run imports in order:

1. **Base Reference Data**
   ```bash
   node scripts/import_insee.js           # info_communes
   node scripts/import_communes_limitrophes.js
   ```

2. **Educational Institutions**
   ```bash
   node scripts/import_lycees.js          # aggregated_data_lycees_2024
   node scripts/import_colleges.js        # metrics_colleges_2024
   node scripts/import_onisep.js          # onisep_etablissements_2024 ✅ DONE
   node scripts/import_geodata.js         # geodata_lycees
   ```

3. **IPS & Social Data**
   ```bash
   node scripts/import_ips_lycees.js      # ✅ DONE
   node scripts/import_ips_colleges.js    # ✅ DONE
   ```

4. **Curriculum Data**
   ```bash
   node scripts/import_specialites.js
   node scripts/import_optionnels_seconde.js
   node scripts/import_sections_internationales.js
   node scripts/import_onisep_formations.js
   ```

5. **Context Data**
   ```bash
   node scripts/import_bpe_commerce_sante.js  # ✅ DONE
   node scripts/import_criminalite.js         # ✅ DONE
   node scripts/import_dvf.js                 # mutations_immo_2024
   node scripts/import_logement.js
   node scripts/import_emploi.js
   node scripts/import_revenus.js
   ```

---

## Using the Backup to Extract Missing Pieces

### Extract Table Schema from Backup

```bash
# Extract CREATE TABLE for specific table
grep -A 30 "CREATE TABLE public.specialites_lycees" \
  backup_from_eduinfo_orig/db_backups_root/latest.sql

# Extract all CREATE TABLE statements
grep -A 20 "CREATE TABLE public\." \
  backup_from_eduinfo_orig/db_backups_root/latest.sql > all_tables.sql
```

### Copy Import Scripts

```bash
# Copy missing import scripts to new repo
cp backup_from_eduinfo_orig/scripts/importSpecialitesLycees.js \
   scripts/import_specialites.js

# Update database config path in copied scripts
sed -i '' 's|../config/db|./config/db_config|g' scripts/import_*.js
```

### Use Cleaned Data Files

```bash
# The backup has cleaned CSV files ready to import
ls -lh backup_from_eduinfo_orig/pgadmin/*.csv

# Example: Import specialties
node scripts/import_specialites.js \
  backup_from_eduinfo_orig/pgadmin/onisep_specialites_premiere.csv
```

---

## Data Source Registry

The `open_data_sources_registry.json` tracks 16 data sources:

**Academic Performance (5 sources):**
- Lycées IVA (Indicateurs de Valeur Ajoutée)
- Collèges IVA
- IPS Lycées
- IPS Collèges
- Lycées Professionnels

**Geolocation (3 sources):**
- Annuaire de l'Éducation - Lycées
- Établissements geolocalisation
- Code Officiel Géographique - Communes

**Curriculum (2 sources):**
- ONISEP Spécialités Première
- ONISEP Enseignements Optionnels Seconde

**Context Data (6 sources):**
- Sections Internationales
- Revenus/Pauvreté (Filosofi)
- Mutations Immobilières (DVF)
- Commerce & Santé (BPE)
- Logement
- Criminalité

---

## Comparison: New vs Backup Structure

### Config Files

| Feature | New Repo | Backup | Status |
|---------|----------|--------|--------|
| Data sources config | `config/data_sources.json` | `open_data_sources_registry.json` | ✅ Different format, both valid |
| Database config | `config/db_config.js` | N/A | ✅ New |
| Environment | `.env` | `.env` | ✅ Same |

### Import Scripts

| Dataset | New Repo | Backup | Notes |
|---------|----------|--------|-------|
| ONISEP establishments | ✅ `import_onisep.js` | `importAllOnisepData.js` | New is better (encoding fixes) |
| IPS Lycées | ✅ `import_ips_lycees.js` | `importIPSLycees2024.js` | New has 48 columns |
| IPS Collèges | ✅ `import_ips_colleges.js` | `importIPSColleges2024.js` | New has 24 columns |
| BPE Commerce/Santé | ✅ `import_bpe_commerce_sante.js` | N/A | New |
| Crime Data | ✅ `import_criminalite.js` | N/A | New with gzip |
| Specialties | ❌ | `importSpecialitesLycees.js` | **Need to migrate** |
| Optional Courses | ❌ | `importEnseignementsOptionnelsSeconde.js` | **Need to migrate** |
| International Sections | ❌ | `importSectionsInternationales.js` | **Need to migrate** |
| ONISEP Formations | ❌ | `importAllOnisepData.js` | **Need to migrate** |

---

## Recommended Next Steps

### Option 1: Complete Migration (Recommended)

**Goal**: Finish migrating all essential scripts and migrations to new repo

1. **Create Missing Migrations** (1-2 hours)
   - Extract schema from `latest.sql`
   - Create migrations for:
     - `specialites_lycees`
     - `enseignements_optionnels_seconde`
     - `sections_internationales`
     - `onisep_details_formations_*`
     - `geodata_lycees`

2. **Migrate Import Scripts** (2-3 hours)
   - Copy 4 missing scripts from backup
   - Update database config paths
   - Test on sample data

3. **Test Full Pipeline** (1 hour)
   - Drop all tables
   - Run all migrations in order
   - Run all imports
   - Verify data integrity

4. **Document** (30 mins)
   - Create `REBUILD_GUIDE.md` with step-by-step instructions
   - Update `README.md` with migration status

### Option 2: Use Backup Schema Directly

**Goal**: Extract complete schema from backup and adapt

1. **Extract Full Schema** (30 mins)
   ```bash
   # Dump only schema (no data)
   grep -E "CREATE TABLE|CREATE INDEX|ALTER TABLE" \
     backup_from_eduinfo_orig/db_backups_root/latest.sql \
     > migrations/000_complete_schema.sql
   ```

2. **Split into Logical Migrations** (1 hour)
   - 001_core_tables.sql (info_communes, geodata)
   - 002_educational_institutions.sql (lycées, collèges)
   - 003_ips_curriculum.sql (IPS, specialties)
   - 004_context_data.sql (crime, real estate, demographics)

3. **Update Import Scripts** (1 hour)
   - Copy all scripts from backup
   - Update config paths
   - Test imports

---

## Key Insights

### ✅ Good News

1. **Complete Backup Exists**: The `latest.sql` contains the entire schema
2. **Cleaned Data Ready**: CSV files are pre-cleaned and ready to import
3. **Working Scripts**: All import scripts in backup are tested and working
4. **New Improvements**: Our 2024 imports have better error handling and encoding fixes

### ⚠️ Considerations

1. **Schema Evolution**: Production schema (May 2025) vs our new migrations (Feb 2026)
2. **Table Naming**: Mix of `_2023`, `_2024` suffixes - need consistent strategy
3. **Data Currency**: Some CSV files are from 2023-2024, may need refreshing
4. **Missing Pieces**: ~10 tables/scripts not yet migrated

### 🎯 Priority

**Focus on:** Complete the migration of curriculum data (specialties, optional courses, formations) - these are essential for the application and have working scripts in the backup.

---

## Questions to Answer

1. **Schema Strategy**: Use backup schema as-is, or continue building year-specific tables (2024, 2025)?
2. **Migration Approach**: One big migration or incremental table-by-table?
3. **Data Refresh**: Import from backup CSVs or download fresh from APIs?
4. **Monitoring**: Keep monitoring schema or simplify for data pipeline only?

---

## Summary

You have **everything needed** to rebuild from scratch:
- ✅ Complete database schema (90+ tables)
- ✅ Working import scripts
- ✅ Cleaned data files
- ✅ API documentation and registry

**Current Progress**: 60% migrated (6/10 core tables + 5/9 import scripts)

**Recommended**: Complete migration of remaining 4 import scripts + their table migrations, then test full rebuild pipeline.

