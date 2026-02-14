# Change Detection Strategy

## The Problem

Open data portals like data.education.gouv.fr use a `modified` timestamp that changes for **both** metadata updates AND data updates. This creates false positives when monitoring for new data.

### Example: Lycées IVA Dataset

```
Modified date: Feb 6, 2026 (recent)
Data observation: June 30, 2024 (unchanged)
```

The Feb 6 modification was likely:
- Updated field descriptions
- Fixed typos in documentation
- Changed dataset labels
- UI improvements

But the **actual data** (2024 baccalauréat results) hasn't changed.

## The Solution

### 1. Enhanced Detection for data.education.gouv.fr

For datasets from `data.education.gouv.fr`, we query the **API metadata endpoint** instead of relying on HTTP `Last-Modified` headers:

```javascript
GET https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/{dataset_id}
```

This returns:
- `data_processed` - When the actual data was last processed ✅
- `metadata_processed` - When metadata was last updated
- `records_count` - Number of records (detect additions/deletions)
- `date_observation` - The period the data covers

We track `data_processed` to detect **real data changes** only.

### 2. Fallback for Other Sources

For sources without API metadata:
- ONISEP: Use HTTP `Last-Modified` header
- INSEE API: Use `Last-Modified` header
- Others: HTTP headers

## Implementation

### Files

1. **[update_checker_enhanced.js](../lib/monitoring/update_checker_enhanced.js)**
   - Enhanced change detection logic
   - API metadata querying for data.education.gouv.fr
   - Stores detailed metadata in database

2. **[check_updates_detailed.js](../scripts/check_updates_detailed.js)**
   - Shows detailed change information
   - Distinguishes metadata vs data changes
   - Displays observation dates and record counts

### Usage

```bash
# Simple check (original)
npm run check-updates

# Detailed check with enhanced detection
npm run check-updates:detailed
```

### Example Output

```
📊 Indicateurs de Valeur Ajoutée des Lycées
   ID: lycees-indicateurs-iva
   Check Method: api_data_processed

   📅 Data Processing Dates:
      Last Known: 2025-12-15T10:30:00+00:00
      Remote:     2026-01-29T19:34:59+00:00

   📅 Metadata Dates:
      Last Known: 2026-01-10T08:00:00+00:00
      Remote:     2026-02-06T22:30:39+00:00

   📊 Data Observation Date: 30/06/2024
   📈 Record Count: 30139

   ✅ DATA UPDATE AVAILABLE
      → New data was processed on 2026-01-29
```

## Database Schema

Migration `005_add_metadata_tracking.sql` adds:

```sql
ALTER TABLE monitoring.data_sources
ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
```

Stored metadata example:
```json
{
  "data_processed": "2026-01-29T19:34:59.411000+00:00",
  "metadata_processed": "2026-02-06T22:30:40.988000+00:00",
  "records_count": 30139,
  "date_observation": "30/06/2024",
  "check_method": "api_data_processed"
}
```

## Benefits

✅ **No false positives** - Only triggers on actual data changes
✅ **Better logging** - Track what changed (data vs metadata)
✅ **Avoid unnecessary downloads** - Save bandwidth and time
✅ **Understand data freshness** - See observation dates
✅ **Detect data quality issues** - Track record count changes

## Limitations

- Only works for data.education.gouv.fr datasets with `dataset_id`
- Other sources still use HTTP `Last-Modified` (less accurate)
- Requires `metadata` column in database (migration 005)

## Future Enhancements

1. **Content-based detection** - Calculate file checksums/hashes
2. **Sample-based detection** - Download first 1000 rows and compare
3. **API support for other providers** - Extend to ONISEP, INSEE APIs
4. **Historical tracking** - Store change history in separate table
5. **Notifications** - Only alert on data changes, not metadata

## References

- [OpenDataSoft API Documentation](https://help.opendatasoft.com/apis/ods-explore-v2/)
- [data.education.gouv.fr](https://data.education.gouv.fr/)
