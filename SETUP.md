# eduInfo Data Pipeline - Setup Guide

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL 14+ with PostGIS extension
- Access to eduInfo production database
- (Optional) SendGrid API key for email notifications

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd eduinfo-data-pipeline
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```bash
# Database - use eduInfo production credentials
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=eduinfo
DB_USER=your-user
DB_PASSWORD=your-password

# Notifications
EMAIL_FROM=notifications@eduinfo.fr
EMAIL_TO=admin@eduinfo.fr
SENDGRID_API_KEY=your-sendgrid-key  # Optional

# Paths
DATA_DOWNLOAD_DIR=./data/downloads
LOG_DIR=./data/logs
```

### 4. Test Database Connection

```bash
node -e "const db = require('./config/db_config'); db.query('SELECT NOW()').then(r => console.log('✅ Connected:', r.rows[0])).catch(e => console.error('❌ Error:', e.message)).finally(() => db.end());"
```

### 5. Verify Monitoring Table

The pipeline expects the `monitoring.data_sources` table to exist in your database (created by eduInfo migration 004).

Verify:
```bash
node -e "const db = require('./config/db_config'); db.query('SELECT COUNT(*) FROM monitoring.data_sources').then(r => console.log('✅ Found', r.rows[0].count, 'data sources')).catch(e => console.error('❌ Error:', e.message)).finally(() => db.end());"
```

## Usage

### Check for Updates

```bash
npm run check-updates
```

This will check all enabled sources and display which ones have new data available.

### Download Specific Source

```bash
# Download ONISEP data
npm run download -- onisep-secondary

# Download lycées IVA
npm run download -- lycees-indicateurs-iva
```

### Import Data

```bash
# Import ONISEP establishments
npm run import:onisep

# Import lycées performance data
npm run import:lycees

# Import collèges data
npm run import:colleges
```

### Run Full Pipeline

Check for updates, download, import, and refresh views:

```bash
npm run pipeline
```

Check only (don't download/import):
```bash
npm run pipeline:check-only
```

### Refresh Materialized Views

```bash
npm run refresh-views
```

## Deployment

### Production Server Setup

1. **Clone to server:**
   ```bash
   ssh your-server
   cd /opt
   git clone <repository-url> eduinfo-data-pipeline
   cd eduinfo-data-pipeline
   ```

2. **Install dependencies:**
   ```bash
   npm ci --production
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   nano .env  # Add production credentials
   ```

4. **Set up cron jobs:**
   ```bash
   crontab -e
   ```

   Add:
   ```cron
   # Check for updates daily at 2 AM
   0 2 * * * cd /opt/eduinfo-data-pipeline && /usr/bin/node scripts/check_updates.js >> /var/log/eduinfo-pipeline/check.log 2>&1

   # Full import on Sundays at 3 AM
   0 3 * * 0 cd /opt/eduinfo-data-pipeline && /usr/bin/node scripts/run_pipeline.js >> /var/log/eduinfo-pipeline/import.log 2>&1
   ```

5. **Create log directory:**
   ```bash
   sudo mkdir -p /var/log/eduinfo-pipeline
   sudo chown $USER:$USER /var/log/eduinfo-pipeline
   ```

### GitHub Actions (Alternative)

GitHub Actions workflows are configured in `.github/workflows/`:

- `check-updates.yml` - Runs daily to check for new data

**Setup:**

1. Go to repository Settings → Secrets and variables → Actions
2. Add secrets:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`
   - `SENDGRID_API_KEY` (optional)
   - `EMAIL_FROM`
   - `EMAIL_TO`

3. The workflow will run automatically on schedule or manually via Actions tab

## Troubleshooting

### Database Connection Fails

```bash
# Test connection
node -e "const db = require('./config/db_config'); db.query('SELECT 1').then(() => console.log('OK')).catch(e => console.error(e.message)).finally(() => db.end());"
```

Check:
- Database credentials in `.env`
- Firewall rules allow connection
- PostgreSQL is running

### Import Fails with "monitoring.data_sources not found"

Run migration 004 from eduInfo main repository:
```bash
cd /path/to/eduInfo
psql -U postgres -d eduinfo -f appQueries/SQL/migrations/004_create_data_sources.sql
```

### CSV Download Times Out

Increase timeout in `.env`:
```bash
TIMEOUT_SECONDS=120
```

### Out of Memory During Import

Process large files in chunks or increase Node.js memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run import:onisep
```

## Monitoring

### Check Last Import Dates

```sql
SELECT
  id,
  name,
  last_checked,
  last_imported,
  last_known_modified
FROM monitoring.data_sources
ORDER BY last_imported DESC NULLS LAST;
```

### View Import Logs

```bash
# Recent check logs
tail -f data/logs/check.log

# Recent import logs
tail -f data/logs/import.log
```

## Adding New Data Sources

1. Add source to `config/data_sources.json`:
   ```json
   {
     "id": "new-source",
     "name": "New Data Source",
     "provider": "Provider Name",
     "type": "csv",
     "url": "https://example.com/data.csv",
     "target_table": "new_table",
     "importer": "scripts/import_new.js",
     "frequency": "monthly",
     "expected_months": [1, 4, 7, 10],
     "enabled": true
   }
   ```

2. Create importer script at `scripts/import_new.js` (use `import_onisep.js` as template)

3. Add to `monitoring.data_sources` table:
   ```sql
   INSERT INTO monitoring.data_sources (id, name, provider, url, type, update_frequency, expected_months, db_table, description)
   VALUES ('new-source', 'New Data Source', 'Provider Name', 'https://example.com/data.csv', 'dataset', 'monthly', '{1,4,7,10}', 'new_table', 'Description here');
   ```

4. Test:
   ```bash
   npm run check-updates
   npm run pipeline -- new-source
   ```

## Support

For issues or questions, contact: [your-email@example.com]
