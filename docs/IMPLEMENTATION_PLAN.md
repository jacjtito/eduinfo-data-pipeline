# Implementation Plan - Educational Data Schema

**Schema Names:** `educational_data` + `analytics`
**Approach:** Incremental (3 weeks)
**Status:** 🟢 APPROVED - Ready to implement
**Date:** 2026-02-15

---

## Executive Summary

Building **two new schemas** in parallel with existing production:
- `educational_data` - 36 tables for educational/geographic data
- `analytics` - 2 tables for logging and feedback

**Zero impact on:**
- ❌ Existing `public` schema
- ❌ Existing `user_mgmt` schema
- ❌ Current eduinfo application code
- ❌ Production operations

**Timeline:** 3 weeks incremental implementation

---

## Schema Organization - Final Structure

```
Database: evalLycee
│
├─ educational_data (36 tables - NEW) ⭐
│  ├─ Core Educational
│  │  ├─ lycee_context_cache [MAT VIEW]
│  │  ├─ college_context_cache [MAT VIEW]
│  │  ├─ aggregated_data_lycees_2024
│  │  ├─ metrics_colleges
│  │  ├─ ips_lycees
│  │  ├─ ips_colleges
│  │  ├─ geodata_lycees
│  │  ├─ lycees_geolocalisation
│  │  ├─ lycees_address_uai_mapping
│  │  └─ onisep_details_formations_lycees
│  │
│  ├─ Specialties & Programs
│  │  ├─ specialites_lycees
│  │  ├─ enseignements_optionnels_seconde
│  │  ├─ sections_internationales
│  │  └─ etablissements_onisep
│  │
│  ├─ Geographic & Commune
│  │  ├─ commune_context_cache [MAT VIEW]
│  │  ├─ info_communes
│  │  ├─ communes_limitrophes
│  │  └─ anecdotes_communes
│  │
│  ├─ Socio-Economic Context
│  │  ├─ commerce_sante_2024
│  │  ├─ criminalite_2024
│  │  ├─ mutations_immo_latest
│  │  ├─ niveau_education_2021
│  │  ├─ population_evolution_age
│  │  ├─ merged_revenu_commune_bassin_2021
│  │  ├─ activite_economique_2022
│  │  ├─ logement_2021
│  │  └─ crime_indicateur_avg
│  │
│  ├─ Sectorisation
│  │  ├─ sectorisation_segments
│  │  ├─ sectorisation_zones
│  │  └─ data_quality_metrics
│  │
│  └─ Reference Data
│     ├─ pcs_libelle
│     └─ ips_score
│
├─ analytics (2 tables - NEW) 📊
│  ├─ nl_query_log
│  └─ user_feedback
│
├─ user_mgmt (EXISTING - NO TOUCH) 👤
│  └─ [All user management tables]
│
└─ public (EXISTING - NO TOUCH) 🔒
   └─ [Current production tables]
```

---

## Week 1: Core Educational Data (Feb 15-21)

### Goals
- ✅ Create `educational_data` schema
- ✅ Set up core educational tables (10 tables)
- ✅ Import educational institution data
- ✅ Test queries against new schema

### Migrations to Create

```
migrations/
├── 100_create_educational_data_schema.sql
├── 101_create_reference_tables.sql
├── 102_create_geographic_base_tables.sql
└── 103_create_educational_base_tables.sql
```

### Tables (10 total)

**Layer 1: Reference (2 tables)**
```sql
-- migrations/101_create_reference_tables.sql
CREATE SCHEMA IF NOT EXISTS educational_data;

CREATE TABLE educational_data.pcs_libelle (
    code_pcs VARCHAR(10) PRIMARY KEY,
    libelle TEXT NOT NULL
);

CREATE TABLE educational_data.ips_score (
    code_pcs VARCHAR(10) PRIMARY KEY,
    ips_score NUMERIC(5,2),
    FOREIGN KEY (code_pcs) REFERENCES educational_data.pcs_libelle(code_pcs)
);
```

**Layer 2: Geographic (2 tables)**
```sql
-- migrations/102_create_geographic_base_tables.sql
CREATE TABLE educational_data.info_communes (
    code_commune VARCHAR(10) PRIMARY KEY,
    nom_commune VARCHAR(255),
    code_departement VARCHAR(5),
    code_postal VARCHAR(10),
    -- ... other columns
);

CREATE TABLE educational_data.communes_limitrophes (
    insee VARCHAR(10),
    insee_voisins VARCHAR(10)[],
    nb_voisins INTEGER
);
```

**Layer 3: Educational Base (6 tables)**
```sql
-- migrations/103_create_educational_base_tables.sql

-- Lycées
CREATE TABLE educational_data.aggregated_data_lycees_2024 (
    uai VARCHAR(20),
    etablissement VARCHAR(255),
    annee INTEGER,
    -- ... all performance columns
);

CREATE TABLE educational_data.ips_lycees (
    uai VARCHAR(20) PRIMARY KEY,
    IPS NUMERIC(5,2),
    ecart_type NUMERIC(5,2)
);

CREATE TABLE educational_data.geodata_lycees (
    uai VARCHAR(20),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    code_commune VARCHAR(10)
);

CREATE TABLE educational_data.lycees_geolocalisation (
    uai VARCHAR(20),
    nom VARCHAR(255),
    commune VARCHAR(255),
    secteur VARCHAR(50)
);

CREATE TABLE educational_data.lycees_address_uai_mapping (
    uai VARCHAR(20) PRIMARY KEY,
    address TEXT
);

-- Collèges
CREATE TABLE educational_data.metrics_colleges (
    uai VARCHAR(20),
    session INTEGER,
    taux_reussite_g NUMERIC(5,2),
    -- ... other metrics
);

CREATE TABLE educational_data.ips_colleges (
    uai VARCHAR(20) PRIMARY KEY,
    IPS NUMERIC(5,2),
    ecart_type_ips NUMERIC(5,2)
);
```

### Import Scripts (Week 1)

**Priority 1: Already have data ✅**
```bash
# Just need to update scripts to support --schema parameter
node scripts/import_ips_lycees.js \
  --schema educational_data \
  --target-table ips_lycees

node scripts/import_ips_colleges.js \
  --schema educational_data \
  --target-table ips_colleges
```

**Priority 2: Download from API**
```bash
node scripts/import_lycees.js \
  --schema educational_data \
  --target-table aggregated_data_lycees_2024

node scripts/import_colleges.js \
  --schema educational_data \
  --target-table metrics_colleges

node scripts/import_geodata_lycees.js \
  --schema educational_data
```

**Priority 3: From backup CSV**
```bash
node scripts/import_insee.js \
  --schema educational_data \
  --csv backup_from_eduinfo_orig/pgadmin/info_communes.csv
```

### Testing (Week 1)
```sql
-- Test basic queries in new schema
SET search_path TO educational_data, user_mgmt, public;

-- Test lycée query
SELECT * FROM aggregated_data_lycees_2024
WHERE code_departement = '78'
  AND annee = 2024
LIMIT 10;

-- Test IPS data
SELECT l.uai, l.etablissement, i.IPS
FROM aggregated_data_lycees_2024 l
JOIN ips_lycees i ON l.uai = i.uai
WHERE l.annee = 2024
LIMIT 10;
```

### Deliverables (Week 1)
- [ ] 3 migration files created
- [ ] 10 tables created in educational_data schema
- [ ] 5 import scripts updated for --schema parameter
- [ ] Educational data imported
- [ ] Test queries verified
- [ ] Documentation: Week 1 completion report

---

## Week 2: Context Data + Materialized Views (Feb 22-28)

### Goals
- ✅ Add socio-economic context tables (9 tables)
- ✅ Add specialty/program tables (4 tables)
- ✅ Create 3 materialized views
- ✅ Test full query patterns

### Migrations to Create

```
migrations/
├── 104_create_socioeconomic_tables.sql
├── 105_create_specialty_tables.sql
├── 106_create_anecdotes_table.sql
└── 107_create_materialized_views.sql
```

### Tables (13 total)

**Socio-Economic (9 tables)**
```sql
-- migrations/104_create_socioeconomic_tables.sql
CREATE TABLE educational_data.commerce_sante_2024 (...);
CREATE TABLE educational_data.criminalite_2024 (...);
CREATE TABLE educational_data.mutations_immo_latest (...);
CREATE TABLE educational_data.niveau_education_2021 (...);
CREATE TABLE educational_data.population_evolution_age (...);
CREATE TABLE educational_data.merged_revenu_commune_bassin_2021 (...);
CREATE TABLE educational_data.activite_economique_2022 (...);
CREATE TABLE educational_data.logement_2021 (...);
CREATE TABLE educational_data.crime_indicateur_avg (...);
```

**Specialties (4 tables)**
```sql
-- migrations/105_create_specialty_tables.sql
CREATE TABLE educational_data.specialites_lycees (...);
CREATE TABLE educational_data.enseignements_optionnels_seconde (...);
CREATE TABLE educational_data.sections_internationales (...);
CREATE TABLE educational_data.etablissements_onisep (...);
CREATE TABLE educational_data.onisep_details_formations_lycees (...);
```

**Anecdotes**
```sql
-- migrations/106_create_anecdotes_table.sql
CREATE TABLE educational_data.anecdotes_communes (
    code_commune VARCHAR(10) PRIMARY KEY,
    anecdote TEXT
);
```

### Materialized Views

```sql
-- migrations/107_create_materialized_views.sql

-- View 1: Commune Context (Foundation)
CREATE MATERIALIZED VIEW educational_data.commune_context_cache AS
SELECT
    ic.code_commune,
    ic.nom_commune,
    -- Aggregate from all socio-economic tables
    ...
FROM educational_data.info_communes ic
LEFT JOIN educational_data.commerce_sante_2024 cs USING (code_commune)
LEFT JOIN educational_data.criminalite_2024 cr USING (code_commune)
-- ... all other joins
WHERE ic.code_commune IN (SELECT code_commune FROM relevant_communes);

CREATE UNIQUE INDEX ON educational_data.commune_context_cache(code_commune);

-- View 2: Lycée Context (Primary data source)
CREATE MATERIALIZED VIEW educational_data.lycee_context_cache AS
SELECT
    l.uai,
    l.etablissement,
    l.code_departement,
    i.IPS,
    s.specialites_array,
    si.has_section_internationale,
    ccc.local_services,
    ccc.crime_level,
    -- ... all enrichments
FROM educational_data.aggregated_data_lycees_2024 l
LEFT JOIN educational_data.ips_lycees i USING (uai)
LEFT JOIN educational_data.specialites_lycees s USING (uai)
LEFT JOIN educational_data.sections_internationales si USING (uai)
LEFT JOIN educational_data.commune_context_cache ccc ON l.code_commune = ccc.code_commune
WHERE l.annee = 2024;

CREATE UNIQUE INDEX ON educational_data.lycee_context_cache(uai);

-- View 3: Collège Context
CREATE MATERIALIZED VIEW educational_data.college_context_cache AS
SELECT
    c.uai,
    c.nom_etablissement,
    i.IPS,
    ccc.*
FROM educational_data.metrics_colleges c
LEFT JOIN educational_data.ips_colleges i USING (uai)
LEFT JOIN educational_data.commune_context_cache ccc USING (code_commune)
WHERE c.session = (SELECT MAX(session) FROM educational_data.metrics_colleges);

CREATE UNIQUE INDEX ON educational_data.college_context_cache(uai);
```

### Import Scripts (Week 2)

**Already Have ✅**
```bash
node scripts/import_bpe_commerce_sante.js \
  --schema educational_data \
  --target-table commerce_sante_2024

node scripts/import_criminalite.js \
  --schema educational_data \
  --target-table criminalite_2024

node scripts/import_onisep.js \
  --schema educational_data \
  --target-table etablissements_onisep
```

**Need to Migrate from Backup**
```bash
# Copy and adapt from backup
cp backup_from_eduinfo_orig/scripts/importSpecialitesLycees.js \
   scripts/import_specialites.js

# Update config paths and add --schema support
node scripts/import_specialites.js \
  --schema educational_data

node scripts/import_optionnels_seconde.js --schema educational_data
node scripts/import_sections_internationales.js --schema educational_data
node scripts/import_onisep_formations.js --schema educational_data
```

**Need to Create (from backup CSVs)**
```bash
node scripts/import_niveau_education.js --schema educational_data
node scripts/import_population_age.js --schema educational_data
node scripts/import_revenus.js --schema educational_data
node scripts/import_activite_economique.js --schema educational_data
node scripts/import_logement.js --schema educational_data
node scripts/import_dvf.js --schema educational_data
```

### Materialized View Refresh Script

```bash
#!/bin/bash
# scripts/refresh_materialized_views.sh

set -e

SCHEMA=${1:-educational_data}

echo "🔄 Refreshing materialized views in $SCHEMA schema..."

echo "1/3 Refreshing commune_context_cache..."
psql $DATABASE_URL -c "REFRESH MATERIALIZED VIEW ${SCHEMA}.commune_context_cache;"

echo "2/3 Refreshing lycee_context_cache..."
psql $DATABASE_URL -c "REFRESH MATERIALIZED VIEW ${SCHEMA}.lycee_context_cache;"

echo "3/3 Refreshing college_context_cache..."
psql $DATABASE_URL -c "REFRESH MATERIALIZED VIEW ${SCHEMA}.college_context_cache;"

echo "✅ All materialized views refreshed!"
```

### Testing (Week 2)
```sql
-- Test materialized views
SELECT COUNT(*) FROM educational_data.commune_context_cache;
-- Expected: ~5,000-8,000 communes

SELECT COUNT(*) FROM educational_data.lycee_context_cache;
-- Expected: ~2,500-3,000 lycées

SELECT COUNT(*) FROM educational_data.college_context_cache;
-- Expected: ~7,000-8,000 collèges

-- Test complex query (what backend actually does)
SELECT
    uai,
    etablissement,
    IPS,
    specialites_array,
    local_services,
    crime_level
FROM educational_data.lycee_context_cache
WHERE code_departement = '78'
  AND IPS >= 100
  AND specialites_array @> ARRAY['Mathématiques']::text[]
ORDER BY IPS DESC
LIMIT 20;
```

### Deliverables (Week 2)
- [ ] 4 migration files created
- [ ] 13 additional tables created
- [ ] 10 new import scripts (4 migrated + 6 created)
- [ ] All socio-economic data imported
- [ ] 3 materialized views created and populated
- [ ] Refresh script tested
- [ ] Performance testing completed
- [ ] Documentation: Week 2 completion report

---

## Week 3: Final Tables + Analytics Schema (Mar 1-7)

### Goals
- ✅ Create `analytics` schema
- ✅ Add sectorisation tables (3 tables)
- ✅ Complete documentation
- ✅ Automated refresh workflow
- ✅ Switch-over guide for eduinfo team

### Migrations to Create

```
migrations/
├── 108_create_analytics_schema.sql
├── 109_create_sectorisation_tables.sql
└── 110_create_refresh_functions.sql
```

### Analytics Schema (2 tables)

```sql
-- migrations/108_create_analytics_schema.sql
CREATE SCHEMA IF NOT EXISTS analytics;

CREATE TABLE analytics.nl_query_log (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_mgmt.users(id),
    user_query TEXT NOT NULL,
    generated_sql TEXT,
    success BOOLEAN,
    execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE analytics.user_feedback (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_mgmt.users(id),
    user_action VARCHAR(50),
    mood VARCHAR(20),
    message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_nl_query_log_user ON analytics.nl_query_log(user_id);
CREATE INDEX idx_nl_query_log_created ON analytics.nl_query_log(created_at);
CREATE INDEX idx_user_feedback_user ON analytics.user_feedback(user_id);
CREATE INDEX idx_user_feedback_created ON analytics.user_feedback(created_at);
```

### Sectorisation Tables (3 tables)

```sql
-- migrations/109_create_sectorisation_tables.sql
-- Note: These come from eduinfo-sectorisation project

CREATE TABLE educational_data.sectorisation_segments (
    id SERIAL PRIMARY KEY,
    code_commune VARCHAR(10),
    libelle_rue VARCHAR(255),
    number_from INTEGER,
    number_to INTEGER,
    side VARCHAR(10),
    uai_lycees_1 VARCHAR(20),
    uai_lycees_2 VARCHAR(20),
    uai_lycees_3 VARCHAR(20),
    uai_lycees_4 VARCHAR(20),
    geometry GEOMETRY(LineString, 4326)
);

CREATE TABLE educational_data.sectorisation_zones (
    id SERIAL PRIMARY KEY,
    code_commune VARCHAR(10),
    zone_name VARCHAR(255),
    uai_lycees_1 VARCHAR(20),
    uai_lycees_2 VARCHAR(20),
    uai_lycees_3 VARCHAR(20),
    uai_lycees_4 VARCHAR(20),
    geometry GEOMETRY(Polygon, 4326)
);

CREATE TABLE educational_data.data_quality_metrics (
    department VARCHAR(5) PRIMARY KEY,
    total_segments INTEGER,
    osm_matched INTEGER,
    match_confidence NUMERIC(5,2)
);
```

### Automated Refresh Functions

```sql
-- migrations/110_create_refresh_functions.sql

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION educational_data.refresh_all_caches()
RETURNS void AS $$
BEGIN
    RAISE NOTICE 'Refreshing commune_context_cache...';
    REFRESH MATERIALIZED VIEW educational_data.commune_context_cache;

    RAISE NOTICE 'Refreshing lycee_context_cache...';
    REFRESH MATERIALIZED VIEW educational_data.lycee_context_cache;

    RAISE NOTICE 'Refreshing college_context_cache...';
    REFRESH MATERIALIZED VIEW educational_data.college_context_cache;

    RAISE NOTICE 'All caches refreshed successfully!';
END;
$$ LANGUAGE plpgsql;

-- Function to check data freshness
CREATE OR REPLACE FUNCTION educational_data.check_data_freshness()
RETURNS TABLE (
    table_name TEXT,
    last_updated TIMESTAMP,
    row_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        relname::TEXT,
        pg_stat_get_last_analyze_time(c.oid),
        n_live_tup
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'educational_data'
      AND c.relkind = 'r'
    ORDER BY relname;
END;
$$ LANGUAGE plpgsql;
```

### Master Rebuild Script

```bash
#!/bin/bash
# scripts/rebuild_educational_data.sh
# Complete rebuild of educational_data schema from scratch

set -e

SCHEMA="educational_data"

echo "🏗️  Rebuilding $SCHEMA schema from scratch..."
echo "================================================"

# Drop existing schema (USE WITH CAUTION!)
read -p "⚠️  This will DROP the $SCHEMA schema. Continue? (yes/no): " -r
if [[ $REPLY != "yes" ]]; then
    echo "Aborted."
    exit 1
fi

echo "Dropping existing schema..."
psql $DATABASE_URL -c "DROP SCHEMA IF EXISTS $SCHEMA CASCADE;"
psql $DATABASE_URL -c "DROP SCHEMA IF EXISTS analytics CASCADE;"

# Run migrations
echo "Running migrations..."
for migration in migrations/1*.sql; do
    echo "  → $(basename $migration)"
    psql $DATABASE_URL -f "$migration"
done

# Import data in dependency order
echo ""
echo "Importing data..."
echo "================================================"

echo "Phase 1: Reference & Geographic (5 tables)"
node scripts/import_pcs_reference.js --schema $SCHEMA &
node scripts/import_ips_reference.js --schema $SCHEMA &
node scripts/import_insee.js --schema $SCHEMA &
node scripts/import_communes_limitrophes.js --schema $SCHEMA &
node scripts/import_anecdotes.js --schema $SCHEMA &
wait

echo "Phase 2: Socio-Economic (9 tables)"
node scripts/import_bpe_commerce_sante.js --schema $SCHEMA &
node scripts/import_criminalite.js --schema $SCHEMA &
node scripts/import_dvf.js --schema $SCHEMA &
node scripts/import_niveau_education.js --schema $SCHEMA &
node scripts/import_population_age.js --schema $SCHEMA &
node scripts/import_revenus.js --schema $SCHEMA &
node scripts/import_activite_economique.js --schema $SCHEMA &
node scripts/import_logement.js --schema $SCHEMA &
wait

echo "Phase 3: Educational Base (9 tables)"
node scripts/import_lycees.js --schema $SCHEMA &
node scripts/import_ips_lycees.js --schema $SCHEMA &
node scripts/import_geodata_lycees.js --schema $SCHEMA &
node scripts/import_lycees_geolocalisation.js --schema $SCHEMA &
node scripts/import_onisep.js --schema $SCHEMA &
node scripts/import_colleges.js --schema $SCHEMA &
node scripts/import_ips_colleges.js --schema $SCHEMA &
wait

echo "Phase 4: Specialties (5 tables)"
node scripts/import_specialites.js --schema $SCHEMA &
node scripts/import_optionnels_seconde.js --schema $SCHEMA &
node scripts/import_sections_internationales.js --schema $SCHEMA &
node scripts/import_onisep_formations.js --schema $SCHEMA &
wait

echo "Phase 5: Materialized Views"
./scripts/refresh_materialized_views.sh $SCHEMA

echo ""
echo "✅ Rebuild complete!"
echo ""
echo "Verification:"
psql $DATABASE_URL -c "SELECT tablename, n_live_tup FROM pg_stat_user_tables WHERE schemaname = '$SCHEMA' ORDER BY tablename;"
```

### Switch-Over Guide

```markdown
# Switching eduinfo to educational_data Schema

## Prerequisites
- educational_data schema fully populated
- All materialized views refreshed
- Test queries verified

## Option 1: Database-Level Switch (Recommended)
```sql
-- Switch default search path for the database
ALTER DATABASE evalLycee SET search_path TO educational_data, user_mgmt, analytics, public;

-- Verify
SHOW search_path;
```

## Option 2: Application-Level Switch
```javascript
// In database connection config
const pool = new Pool({
  ...config,
  options: '-c search_path=educational_data,user_mgmt,analytics,public'
});
```

## Rollback Plan
```sql
-- If issues arise, immediately rollback
ALTER DATABASE evalLycee SET search_path TO public, user_mgmt, public;
```

## Monitoring After Switch
- Check query performance (should be same or better)
- Monitor error logs
- Verify materialized view queries work
- Test all major features
```

### Deliverables (Week 3)
- [ ] Analytics schema created (2 tables)
- [ ] Sectorisation tables created (3 tables)
- [ ] Automated refresh functions
- [ ] Master rebuild script
- [ ] Data refresh workflow documented
- [ ] Switch-over guide for eduinfo team
- [ ] Complete REBUILD_GUIDE.md
- [ ] Performance comparison report

---

## Data Refresh Workflow (Post-Implementation)

### When New Data is Available

```bash
#!/bin/bash
# scripts/refresh_educational_data.sh
# Refresh educational data when new datasets are published

set -e

SCHEMA="educational_data"

echo "🔄 Refreshing educational data..."

# Download latest data
echo "Downloading latest datasets..."
node scripts/download_latest_data.js

# Import updated tables (with TRUNCATE)
echo "Importing updated data..."
node scripts/import_lycees.js --schema $SCHEMA --truncate
node scripts/import_colleges.js --schema $SCHEMA --truncate
node scripts/import_ips_lycees.js --schema $SCHEMA --truncate
node scripts/import_ips_colleges.js --schema $SCHEMA --truncate
# ... other tables as needed

# Refresh materialized views
echo "Refreshing materialized views..."
psql $DATABASE_URL -c "SELECT educational_data.refresh_all_caches();"

# Verify
echo "Verification..."
psql $DATABASE_URL -c "SELECT * FROM educational_data.check_data_freshness();"

echo "✅ Data refresh complete!"
```

### Automated Scheduling (Optional)

```bash
# Cron job to check for updates daily
0 2 * * * /path/to/scripts/check_and_refresh_data.sh >> /var/log/educational_data_refresh.log 2>&1
```

---

## Success Criteria

### Week 1 Success
- [ ] 10 tables created and populated
- [ ] Basic queries work in educational_data schema
- [ ] No errors in import logs

### Week 2 Success
- [ ] All 23 tables populated
- [ ] 3 materialized views created
- [ ] Complex queries (with JOINs) work correctly
- [ ] Refresh script completes successfully

### Week 3 Success
- [ ] Analytics schema operational
- [ ] Sectorisation tables populated
- [ ] Master rebuild script works end-to-end
- [ ] Documentation complete
- [ ] Ready for eduinfo team to switch

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Import script failures | Backup CSVs available, can import manually |
| Long import times | Parallel execution, run overnight |
| Materialized view refresh slow | Index optimization, incremental refresh |
| Missing data | Backup schema has all data, can extract |
| Application breaks | Keep public schema, easy rollback |

---

## Next Steps

**Ready to start implementation!**

1. Create Week 1 migrations
2. Extract schemas from backup
3. Update import scripts for --schema parameter
4. Begin testing locally

**Shall I proceed with Week 1 implementation?**

