-- Migration: Create geographic and commune base tables
-- Description: French communes reference data and neighboring communes
-- Date: 2026-02-15
-- Week: 1 - Geographic Data Layer

-- ============================================================================
-- Communes - French Administrative Units Reference
-- ============================================================================

CREATE TABLE IF NOT EXISTS educational_data.info_communes (
    code_com INTEGER,
    insee_com VARCHAR(10) PRIMARY KEY,
    nom_com VARCHAR(255),
    population INTEGER,
    code_cant VARCHAR(10),
    code_arr VARCHAR(10),
    code_dept VARCHAR(10),
    nom_dept VARCHAR(255),
    code_reg INTEGER,
    nom_reg VARCHAR(255),
    nom_commune VARCHAR(255),
    code_postal VARCHAR(10),
    libelle_d_acheminement VARCHAR(255),
    coordonnees_gps VARCHAR(100),
    code_du_departement VARCHAR(10)
);

COMMENT ON TABLE educational_data.info_communes IS 'French communes reference data - Complete list of ~36,700 communes with geographic and administrative info';
COMMENT ON COLUMN educational_data.info_communes.insee_com IS 'INSEE commune code (official identifier)';
COMMENT ON COLUMN educational_data.info_communes.nom_commune IS 'Commune name';
COMMENT ON COLUMN educational_data.info_communes.population IS 'Population count';
COMMENT ON COLUMN educational_data.info_communes.code_dept IS 'Department code';
COMMENT ON COLUMN educational_data.info_communes.code_postal IS 'Postal code';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_info_communes_insee ON educational_data.info_communes(insee_com);
CREATE INDEX IF NOT EXISTS idx_info_communes_nom ON educational_data.info_communes(nom_commune);
CREATE INDEX IF NOT EXISTS idx_info_communes_dept ON educational_data.info_communes(code_dept);
CREATE INDEX IF NOT EXISTS idx_info_communes_postal ON educational_data.info_communes(code_postal);

-- ============================================================================
-- Communes Limitrophes - Neighboring Communes
-- ============================================================================

CREATE TABLE IF NOT EXISTS educational_data.communes_limitrophes (
    insee VARCHAR(10) PRIMARY KEY,
    insee_voisins VARCHAR(10)[],
    nb_voisins INTEGER
);

COMMENT ON TABLE educational_data.communes_limitrophes IS 'Neighboring communes mapping - Used for displaying nearby areas';
COMMENT ON COLUMN educational_data.communes_limitrophes.insee IS 'INSEE code of the commune';
COMMENT ON COLUMN educational_data.communes_limitrophes.insee_voisins IS 'Array of neighboring commune INSEE codes';
COMMENT ON COLUMN educational_data.communes_limitrophes.nb_voisins IS 'Number of neighboring communes';

-- Index
CREATE INDEX IF NOT EXISTS idx_communes_limitrophes_insee ON educational_data.communes_limitrophes(insee);

-- ============================================================================
-- Anecdotes - Commune Trivia and Fun Facts
-- ============================================================================

CREATE TABLE IF NOT EXISTS educational_data.anecdotes_communes (
    code_commune VARCHAR(10) PRIMARY KEY,
    anecdote TEXT
);

COMMENT ON TABLE educational_data.anecdotes_communes IS 'Commune anecdotes and fun facts - Used in PDF generation and establishment profiles';
COMMENT ON COLUMN educational_data.anecdotes_communes.code_commune IS 'INSEE commune code';
COMMENT ON COLUMN educational_data.anecdotes_communes.anecdote IS 'Anecdote or fun fact about the commune';

-- Index
CREATE INDEX IF NOT EXISTS idx_anecdotes_commune ON educational_data.anecdotes_communes(code_commune);

