-- Migration: Create reference tables
-- Description: PCS classification and IPS score mapping tables
-- Date: 2026-02-15
-- Week: 1 - Reference Data Layer

-- ============================================================================
-- PCS (Professional Classification System) Labels
-- ============================================================================

CREATE TABLE IF NOT EXISTS educational_data.pcs_libelle (
    pcs BIGINT PRIMARY KEY,
    libelle TEXT NOT NULL
);

COMMENT ON TABLE educational_data.pcs_libelle IS 'PCS (Professional Classification System) labels - Reference data for socio-professional categories';
COMMENT ON COLUMN educational_data.pcs_libelle.pcs IS 'PCS code (INSEE classification)';
COMMENT ON COLUMN educational_data.pcs_libelle.libelle IS 'Label/description of the professional category';

-- Index
CREATE INDEX IF NOT EXISTS idx_pcs_libelle_pcs ON educational_data.pcs_libelle(pcs);

-- ============================================================================
-- IPS Score Mapping
-- ============================================================================

CREATE TABLE IF NOT EXISTS educational_data.ips_score (
    pcs_mere BIGINT,
    pcs_pere BIGINT,
    diplome_mere INTEGER,
    diplome_pere INTEGER,
    ips_score NUMERIC(6,2)
);

COMMENT ON TABLE educational_data.ips_score IS 'IPS (Index de Position Sociale) score mapping from parental PCS and education levels';
COMMENT ON COLUMN educational_data.ips_score.pcs_mere IS 'Mother''s PCS code';
COMMENT ON COLUMN educational_data.ips_score.pcs_pere IS 'Father''s PCS code';
COMMENT ON COLUMN educational_data.ips_score.diplome_mere IS 'Mother''s education level code';
COMMENT ON COLUMN educational_data.ips_score.diplome_pere IS 'Father''s education level code';
COMMENT ON COLUMN educational_data.ips_score.ips_score IS 'Calculated IPS score';

-- Indexes for lookups
CREATE INDEX IF NOT EXISTS idx_ips_score_pcs_mere ON educational_data.ips_score(pcs_mere);
CREATE INDEX IF NOT EXISTS idx_ips_score_pcs_pere ON educational_data.ips_score(pcs_pere);
CREATE INDEX IF NOT EXISTS idx_ips_score_composite ON educational_data.ips_score(pcs_mere, pcs_pere, diplome_mere, diplome_pere);

