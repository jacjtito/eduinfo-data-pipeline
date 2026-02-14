-- Migration 005: Add metadata column for enhanced change tracking
-- This allows storing detailed metadata like data_processed dates
-- to distinguish between metadata changes and actual data updates

ALTER TABLE monitoring.data_sources
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add index for faster JSONB queries
CREATE INDEX IF NOT EXISTS idx_data_sources_metadata
ON monitoring.data_sources USING gin(metadata);

-- Add comment
COMMENT ON COLUMN monitoring.data_sources.metadata IS
'Enhanced metadata for change tracking: data_processed, metadata_processed, records_count, date_observation, check_method';
