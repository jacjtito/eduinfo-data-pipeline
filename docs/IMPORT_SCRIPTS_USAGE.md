# Import Scripts Usage Guide

**Updated:** 2026-02-15
**Feature:** All import scripts now support `--schema` parameter

---

## ✅ Updated Scripts (Support --schema)

### 1. import_ips_lycees.js
```bash
# Import to educational_data schema
node scripts/import_ips_lycees.js \
  --schema educational_data \
  --table ips_lycees \
  data/downloads/ips_lycees_2024.csv

# Import to public schema (default)
node scripts/import_ips_lycees.js data/downloads/ips_lycees_2024.csv

# Shorthand
node scripts/import_ips_lycees.js --schema educational_data
```

### 2. import_ips_colleges.js
```bash
# Import to educational_data schema
node scripts/import_ips_colleges.js \
  --schema educational_data \
  --table ips_colleges \
  data/downloads/ips_colleges_2024.csv

# Import to public schema (default)
node scripts/import_ips_colleges.js data/downloads/ips_colleges_2024.csv
```

---

## 🔄 Scripts To Be Updated (Coming Soon)

### 3. import_onisep.js
```bash
# Will support:
node scripts/import_onisep.js \
  --schema educational_data \
  --table etablissements_onisep
```

### 4. import_bpe_commerce_sante.js
```bash
# Will support:
node scripts/import_bpe_commerce_sante.js \
  --schema educational_data \
  --table commerce_sante_2024
```

### 5. import_criminalite.js
```bash
# Will support:
node scripts/import_criminalite.js \
  --schema educational_data \
  --table criminalite_2024
```

---

## 📖 Parameter Reference

### --schema
- **Purpose:** Specify target database schema
- **Default:** `public`
- **Example:** `--schema educational_data`
- **Common values:**
  - `public` - Original schema (default)
  - `educational_data` - New clean schema
  - `test_data` - For testing

### --table or --target-table
- **Purpose:** Specify target table name
- **Default:** Varies by script
- **Example:** `--table ips_lycees`
- **Note:** Table must already exist in the target schema

### CSV Path
- **Purpose:** Path to CSV file to import
- **Position:** Last argument (or first non-flag argument)
- **Default:** `./data/downloads/[script-specific].csv`

---

## 📋 Examples

### Example 1: Import IPS Lycées to New Schema
```bash
# Step 1: Download or locate CSV
ls data/downloads/ips_lycees_2024.csv

# Step 2: Run migration (if not done)
psql $DATABASE_URL -f migrations/educational_data/103_create_educational_base_tables.sql

# Step 3: Import data
node scripts/import_ips_lycees.js \
  --schema educational_data \
  --table ips_lycees \
  data/downloads/ips_lycees_2024.csv

# Step 4: Verify
psql $DATABASE_URL -c "SELECT COUNT(*) FROM educational_data.ips_lycees;"
# Expected: ~7,243 rows
```

### Example 2: Import IPS Collèges to New Schema
```bash
node scripts/import_ips_colleges.js \
  --schema educational_data \
  --table ips_colleges \
  data/downloads/ips_colleges_2024.csv

# Verify
psql $DATABASE_URL -c "SELECT COUNT(*) FROM educational_data.ips_colleges;"
# Expected: ~13,972 rows
```

### Example 3: Test Query After Import
```bash
# Set search path to new schema
psql $DATABASE_URL <<EOF
SET search_path TO educational_data, public;

-- Test lycées query
SELECT
    uai,
    nom_de_l_etablissement,
    ips_etab,
    secteur
FROM ips_lycees
WHERE code_du_departement = '78'
ORDER BY ips_etab DESC
LIMIT 10;
EOF
```

### Example 4: Import to Both Schemas (Testing)
```bash
# Import to public (existing)
node scripts/import_ips_lycees.js \
  --schema public \
  --table ips_lycees_2024

# Import to educational_data (new)
node scripts/import_ips_lycees.js \
  --schema educational_data \
  --table ips_lycees

# Compare counts
psql $DATABASE_URL -c "
  SELECT 'public' as schema, COUNT(*) FROM public.ips_lycees_2024
  UNION ALL
  SELECT 'educational_data', COUNT(*) FROM educational_data.ips_lycees;
"
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Table doesn't exist
```
Error: relation "educational_data.ips_lycees" does not exist
```
**Solution:** Run migrations first
```bash
psql $DATABASE_URL -f migrations/educational_data/103_create_educational_base_tables.sql
```

### Issue 2: Schema doesn't exist
```
Error: schema "educational_data" does not exist
```
**Solution:** Create schema
```bash
psql $DATABASE_URL -f migrations/educational_data/100_create_educational_data_schema.sql
```

### Issue 3: Permission denied
```
Error: permission denied for schema educational_data
```
**Solution:** Grant permissions
```sql
GRANT USAGE ON SCHEMA educational_data TO your_user;
GRANT ALL ON ALL TABLES IN SCHEMA educational_data TO your_user;
```

### Issue 4: CSV not found
```
Error: ENOENT: no such file or directory
```
**Solution:** Provide full path or check file location
```bash
ls -la data/downloads/ips_lycees_2024.csv
node scripts/import_ips_lycees.js --schema educational_data $(pwd)/data/downloads/ips_lycees_2024.csv
```

---

## 🎯 Quick Test Script

Save this as `test_import.sh`:

```bash
#!/bin/bash
set -e

echo "🧪 Testing import scripts with educational_data schema"
echo "======================================================"

# Check database connection
echo "1. Testing database connection..."
psql $DATABASE_URL -c "SELECT current_database(), current_schema();" || exit 1

# Check schema exists
echo "2. Checking educational_data schema..."
psql $DATABASE_URL -c "\dn educational_data" || {
    echo "❌ Schema doesn't exist. Run: psql \$DATABASE_URL -f migrations/educational_data/100_create_educational_data_schema.sql"
    exit 1
}

# Check tables exist
echo "3. Checking tables..."
psql $DATABASE_URL -c "\dt educational_data.ips_lycees" || {
    echo "❌ Tables don't exist. Run: psql \$DATABASE_URL -f migrations/educational_data/103_create_educational_base_tables.sql"
    exit 1
}

# Test import (with small sample if available)
echo "4. Testing import..."
if [ -f "data/downloads/ips_lycees_2024.csv" ]; then
    node scripts/import_ips_lycees.js \
        --schema educational_data \
        --table ips_lycees \
        data/downloads/ips_lycees_2024.csv

    echo "5. Verifying data..."
    psql $DATABASE_URL -c "SELECT COUNT(*) FROM educational_data.ips_lycees;"

    echo "✅ Import test successful!"
else
    echo "⚠️  CSV file not found. Skipping import test."
fi
```

Make it executable and run:
```bash
chmod +x test_import.sh
./test_import.sh
```

---

## 📚 Next Steps

After importing IPS data:

1. **Import other educational tables:**
   ```bash
   # Once scripts are updated:
   node scripts/import_onisep.js --schema educational_data
   ```

2. **Verify all data loaded:**
   ```sql
   SELECT
       schemaname,
       tablename,
       n_live_tup as row_count
   FROM pg_stat_user_tables
   WHERE schemaname = 'educational_data'
   ORDER BY tablename;
   ```

3. **Test queries work:**
   ```sql
   SET search_path TO educational_data, public;

   -- Test JOIN between tables
   SELECT
       l.uai,
       l.nom_de_l_etablissement,
       l.ips_etab
   FROM ips_lycees l
   WHERE l.code_du_departement = '78'
   LIMIT 10;
   ```

---

## 🔗 Related Documentation

- [Week 1 Progress](WEEK1_PROGRESS.md) - Current implementation status
- [Implementation Plan](IMPLEMENTATION_PLAN.md) - 3-week roadmap
- [Migration README](../migrations/educational_data/README.md) - How to run migrations

---

**Status:** ✅ 2/5 scripts updated | 🔄 3 remaining

