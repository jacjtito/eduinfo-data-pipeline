# Project Summary: eduInfo Data Pipeline

## What This Repository Does

This is a **separate maintenance repository** for managing data updates in the eduInfo educational platform. It's decoupled from the main application to provide:

1. **Automated monitoring** of open data sources
2. **Scheduled downloads** of fresh data (CSV/API)
3. **Bulk imports** to PostgreSQL database
4. **Materialized view refresh** after data updates
5. **Email/Slack notifications** on updates or failures

## Why Separate from Main eduInfo?

| Aspect | eduInfo (Main App) | eduInfo Data Pipeline |
|--------|-------------------|----------------------|
| **Purpose** | User-facing web application | Data maintenance & ETL |
| **Runs** | Continuously (web server) | Periodically (cron/scheduled) |
| **Changes** | Frequently (features, bugs) | Rarely (stable once built) |
| **Access** | Read-only DB access | Write access to DB |
| **Deploy** | App servers | Single server or GitHub Actions |

## Repository Structure

```
eduinfo-data-pipeline/
├── config/
│   ├── data_sources.json        # All data source definitions
│   └── db_config.js              # PostgreSQL connection
├── lib/
│   ├── downloaders/              # Download utilities
│   ├── parsers/                  # CSV/JSON parsers
│   ├── importers/                # Bulk import logic
│   └── monitoring/               # Update checkers
├── scripts/
│   ├── check_updates.js          # Check all sources
│   ├── run_pipeline.js           # Main orchestration
│   ├── import_onisep.js          # ONISEP importer
│   ├── import_lycees.js          # Lycées importer
│   └── refresh_views.js          # Refresh matviews
├── docs/
│   ├── DATA_SOURCE_ONISEP.md     # ONISEP API docs
│   └── DATA_SOURCES_STATUS.md    # Data freshness report
└── .github/workflows/
    └── check-updates.yml         # Automated checks
```

## Quick Start

```bash
# 1. Install
npm install
cp .env.example .env  # Configure database credentials

# 2. Check for updates
npm run check-updates

# 3. Run full pipeline
npm run pipeline

# 4. Or import specific source
npm run import:onisep
```

## Data Sources Currently Configured

1. **ONISEP** - 15,266 secondary education establishments
   - Collèges, lycées, CFA
   - CSV download (8.2 MB)
   - Monthly updates

2. **Education.gouv.fr - Lycées IVA**
   - Performance indicators
   - Yearly updates (March-May)

3. **Education.gouv.fr - Collèges**
   - Performance indicators
   - Yearly updates (March-May)

4. **INSEE - Communes**
   - Reference data for French communes
   - API-based

5. **DVF - Real Estate**
   - Property transactions
   - Biannual updates (April, October)

## Deployment Options

### Option 1: Cron (Production Server)
```bash
# Daily checks at 2 AM
0 2 * * * cd /opt/eduinfo-data-pipeline && node scripts/check_updates.js

# Full import on Sundays at 3 AM
0 3 * * 0 cd /opt/eduinfo-data-pipeline && node scripts/run_pipeline.js
```

### Option 2: GitHub Actions (Recommended)
- Runs automatically on schedule
- No server maintenance required
- Easy to monitor via GitHub UI
- Workflows already configured in `.github/workflows/`

## Integration with Main eduInfo

The pipeline connects to the same `eduinfo` database and:

1. **Reads** from `monitoring.data_sources` (created by migration 004)
2. **Writes** data to tables like:
   - `onisep_etablissements`
   - `aggregated_data_lycees_2024`
   - `metrics_colleges_2024`
   - etc.
3. **Refreshes** materialized views:
   - `mv_lycees_with_metrics`
   - `mv_colleges_with_metrics`

The main eduInfo app continues to run normally and reads the updated data automatically.

## Key Features

✅ **Automatic Update Detection** - Checks `Last-Modified` headers
✅ **Bulk Import** - Efficient PostgreSQL COPY with ON CONFLICT
✅ **PostGIS Support** - Geospatial data handling
✅ **Transaction Safety** - Rollback on errors
✅ **Progress Tracking** - Real-time progress display
✅ **Email Notifications** - SendGrid integration
✅ **Dry-Run Mode** - Test without importing
✅ **Extensible** - Easy to add new data sources

## Adding New Data Sources

1. Add to `config/data_sources.json`
2. Create importer script in `scripts/`
3. Add to `monitoring.data_sources` table
4. Test with `npm run pipeline -- new-source-id`

See [SETUP.md](SETUP.md) for detailed instructions.

## Monitoring

Check what was last imported:

```sql
SELECT id, name, last_checked, last_imported, last_known_modified
FROM monitoring.data_sources
ORDER BY last_imported DESC NULLS LAST;
```

View logs:
```bash
tail -f data/logs/check.log
tail -f data/logs/import.log
```

## Next Steps

1. ✅ Repository structure created
2. ✅ Core pipeline implemented
3. ✅ ONISEP importer complete
4. ⬜ Add importers for other sources (lycées, collèges, DVF, INSEE)
5. ⬜ Add email notification module
6. ⬜ Test full pipeline end-to-end
7. ⬜ Deploy to production server or GitHub Actions
8. ⬜ Schedule automated runs
9. ⬜ Monitor first few runs

## Documentation

- [README.md](README.md) - Project overview and usage
- [SETUP.md](SETUP.md) - Installation and deployment guide
- [docs/DATA_SOURCE_ONISEP.md](docs/DATA_SOURCE_ONISEP.md) - ONISEP API documentation
- [docs/DATA_SOURCES_STATUS.md](docs/DATA_SOURCES_STATUS.md) - Current data freshness report

## License

Private - eduInfo internal use only

## Repository Location

```
/Users/aurelien.esprit/Documents/Programming/eduinfo-data-pipeline/
```

## Git Remote

Not yet configured. To add GitHub remote:

```bash
# Create repository on GitHub first, then:
git remote add origin git@github.com:your-org/eduinfo-data-pipeline.git
git push -u origin main
```
