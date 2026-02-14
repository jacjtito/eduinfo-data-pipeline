# Educational Data Schema Migrations

This directory contains migrations for creating the `educational_data` and `analytics` schemas.

## Overview

These migrations build a clean schema separate from the existing `public` schema, allowing parallel operation and easy data refresh.

## Migration Files

### Week 1: Core Educational Data

- **100_create_educational_data_schema.sql** - Create schemas (educational_data, analytics)
- **101_create_reference_tables.sql** - Reference data (PCS labels, IPS mapping)
- **102_create_geographic_base_tables.sql** - Geographic data (communes, neighbors, anecdotes)
- **103_create_educational_base_tables.sql** - Core educational tables (lycées, collèges, IPS, geolocation)

### Week 2: Context Data + Views (Coming Soon)

- 104_create_socioeconomic_tables.sql
- 105_create_specialty_tables.sql
- 106_create_onisep_tables.sql
- 107_create_materialized_views.sql

### Week 3: Analytics + Sectorisation (Coming Soon)

- 108_create_analytics_schema_tables.sql
- 109_create_sectorisation_tables.sql
- 110_create_refresh_functions.sql

## Running Migrations

### Option 1: Run all Week 1 migrations

```bash
# From project root
for file in migrations/educational_data/10[0-3]*.sql; do
    echo "Running $(basename $file)..."
    psql $DATABASE_URL -f "$file"
done
```

### Option 2: Run individually

```bash
psql $DATABASE_URL -f migrations/educational_data/100_create_educational_data_schema.sql
psql $DATABASE_URL -f migrations/educational_data/101_create_reference_tables.sql
psql $DATABASE_URL -f migrations/educational_data/102_create_geographic_base_tables.sql
psql $DATABASE_URL -f migrations/educational_data/103_create_educational_base_tables.sql
```

### Option 3: Use script (Week 1 only)

```bash
# Create a helper script
cat > run_week1_migrations.sh << 'EOF'
#!/bin/bash
set -e

DB_URL=${DATABASE_URL:-postgresql://localhost:5432/evalLycee}

echo "🚀 Running Week 1 migrations..."
echo "Database: $DB_URL"
echo ""

for file in migrations/educational_data/10[0-3]*.sql; do
    echo "→ Running $(basename $file)..."
    psql "$DB_URL" -f "$file"
done

echo ""
echo "✅ Week 1 migrations complete!"
echo ""
echo "Verify schemas:"
psql "$DB_URL" -c "\dn educational_data"
psql "$DB_URL" -c "\dn analytics"
EOF

chmod +x run_week1_migrations.sh
./run_week1_migrations.sh
```

## Verifying Migrations

```sql
-- Check schemas exist
\dn educational_data
\dn analytics

-- List tables in educational_data
\dt educational_data.*

-- Count tables created in Week 1
SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'educational_data';
-- Expected: 10 tables

-- Check specific tables
\d educational_data.info_communes
\d educational_data.aggregated_data_lycees_2024
\d educational_data.ips_lycees
\d educational_data.metrics_colleges
```

## Rollback

If you need to completely remove the schemas:

```sql
-- ⚠️ WARNING: This will drop ALL data in these schemas
DROP SCHEMA IF EXISTS educational_data CASCADE;
DROP SCHEMA IF EXISTS analytics CASCADE;
```

## Tables Created - Week 1

### Reference Data (2 tables)
- `educational_data.pcs_libelle` - PCS labels
- `educational_data.ips_score` - IPS score mapping

### Geographic Data (3 tables)
- `educational_data.info_communes` - ~36,700 French communes
- `educational_data.communes_limitrophes` - Neighboring communes
- `educational_data.anecdotes_communes` - Commune anecdotes

### Educational Data - Lycées (5 tables)
- `educational_data.aggregated_data_lycees_2024` - Performance metrics
- `educational_data.ips_lycees` - Social position indices
- `educational_data.geodata_lycees` - Geolocation data
- `educational_data.lycees_geolocalisation` - Location with sector
- `educational_data.lycees_address_uai_mapping` - UAI to address

### Educational Data - Collèges (2 tables)
- `educational_data.metrics_colleges` - Performance metrics
- `educational_data.ips_colleges` - Social position indices

**Total Week 1:** 12 tables

## Next Steps

After running Week 1 migrations:

1. **Import data** using the import scripts:
   ```bash
   node scripts/import_insee.js --schema educational_data
   node scripts/import_ips_lycees.js --schema educational_data
   node scripts/import_ips_colleges.js --schema educational_data
   # ... etc
   ```

2. **Verify data** is populated:
   ```sql
   SELECT COUNT(*) FROM educational_data.info_communes;
   SELECT COUNT(*) FROM educational_data.ips_lycees;
   SELECT COUNT(*) FROM educational_data.metrics_colleges;
   ```

3. **Test queries** work correctly:
   ```sql
   SET search_path TO educational_data, public;

   SELECT * FROM aggregated_data_lycees_2024
   WHERE code_departement = '78' AND annee = 2024
   LIMIT 10;
   ```

## Notes

- **No impact** on existing `public` schema or `user_mgmt` schema
- **Safe to run** in production environment (creates new schemas only)
- **Incremental approach** - Week 2 and 3 migrations build on Week 1
- **Easy rollback** - Just drop the schemas if needed

## Documentation

- [Implementation Plan](../../docs/IMPLEMENTATION_PLAN.md) - Complete 3-week plan
- [Table Dependencies](../../docs/TABLE_DEPENDENCIES.md) - Import order and dependencies
- [Schema Rebuild Summary](../../docs/SCHEMA_REBUILD_SUMMARY.md) - Quick reference

