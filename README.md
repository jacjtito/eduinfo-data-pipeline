# eduInfo Data Pipeline

Automated ETL (Extract, Transform, Load) pipeline for eduInfo educational data platform.

## Overview

This repository contains scripts and tools to:
- Monitor open data sources for updates
- Download fresh data (CSV, API, Excel)
- Transform and validate data
- Import to PostgreSQL database
- Refresh materialized views
- Send notifications on updates

## Architecture

```
Data Sources → Download → Transform → Validate → Import → Refresh Views → Notify
     ↓            ↓          ↓          ↓         ↓           ↓            ↓
  ONISEP      CSV/API     Parse      Check     PostgreSQL   Matviews   Email/Slack
  INSEE       files       clean      errors    bulk insert  concurrent
  DVF                     enrich     schema                 refresh
  Education.gouv
```

## Repository Structure

```
eduinfo-data-pipeline/
├── config/                      # Configuration files
│   ├── data_sources.json       # Source definitions
│   └── db_config.js            # Database connection
├── scripts/                     # Executable scripts
│   ├── check_updates.js        # Check all sources for updates
│   ├── download_data.js        # Download CSVs/APIs
│   ├── import_onisep.js        # Import ONISEP establishments
│   ├── import_lycees.js        # Import lycées IVA data
│   ├── import_colleges.js      # Import collèges data
│   └── refresh_views.js        # Refresh materialized views
├── lib/                         # Reusable modules
│   ├── downloaders/            # Download utilities
│   ├── parsers/                # CSV/JSON parsers
│   ├── importers/              # Bulk import logic
│   └── monitoring/             # Update checkers, notifiers
├── data/                        # Data directory (gitignored)
│   ├── downloads/              # Downloaded CSV files
│   └── logs/                   # Import logs
├── tests/                       # Unit tests
├── docs/                        # Data source documentation
└── migrations/                  # Database schema changes
```

## Quick Start

### Installation

```bash
npm install
```

### Configuration

Copy and configure environment:
```bash
cp .env.example .env
# Edit .env with your database credentials and API keys
```

### Usage

**Check for updates:**
```bash
npm run check-updates
```

**Download specific source:**
```bash
npm run download -- onisep-secondary
```

**Import data:**
```bash
npm run import:onisep
npm run import:lycees
npm run import:colleges
```

**Refresh materialized views:**
```bash
npm run refresh-views
```

**Full pipeline (check → download → import → refresh):**
```bash
npm run pipeline
```

## Data Sources

See [docs/](docs/) for detailed documentation on each data source:

- [ONISEP](docs/DATA_SOURCE_ONISEP.md) - Educational establishments
- [Education.gouv.fr](docs/DATA_SOURCE_EDUCATION_GOUV.md) - Lycées/Collèges performance
- [INSEE](docs/DATA_SOURCE_INSEE.md) - Commune data
- [DVF](docs/DATA_SOURCE_DVF.md) - Real estate transactions

## Scheduling

### Cron (Production)

```bash
# Check for updates daily at 2 AM
0 2 * * * cd /opt/eduinfo-data-pipeline && npm run check-updates

# Full import on Sundays at 3 AM
0 3 * * 0 cd /opt/eduinfo-data-pipeline && npm run pipeline
```

### GitHub Actions

See [.github/workflows/](.github/workflows/) for automated checks and imports.

## Development

### Run Tests

```bash
npm test
```

### Local Import

Test imports without affecting production:
```bash
DB_NAME=eduinfo_dev npm run import:onisep
```

## Monitoring

- **Email notifications**: Sent when updates detected or imports fail
- **Slack webhooks**: Real-time notifications
- **Database tracking**: `monitoring.data_sources` table stores last check/import dates

## License

Private - eduInfo internal use only

## Contact

For questions about the data pipeline: [your-email@example.com]
