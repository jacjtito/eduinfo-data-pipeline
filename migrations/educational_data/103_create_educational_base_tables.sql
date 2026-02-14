-- Migration: Create educational base tables
-- Description: Lycées and collèges performance, IPS, and geolocation data
-- Date: 2026-02-15
-- Week: 1 - Core Educational Data Layer

-- ============================================================================
-- LYCÉES - Performance Data
-- ============================================================================

CREATE TABLE IF NOT EXISTS educational_data.aggregated_data_lycees_2024 (
    annee INTEGER,
    uai VARCHAR(20),
    etablissement VARCHAR(255),
    code_region VARCHAR(10),
    region VARCHAR(100),
    academie VARCHAR(100),
    code_departement VARCHAR(10),
    departement VARCHAR(100),
    code_commune VARCHAR(10),
    ville VARCHAR(255),
    secteur VARCHAR(50),

    -- Overall metrics
    presents_toutes_series INTEGER,
    taux_reussite_toutes_series DOUBLE PRECISION,
    valeur_ajoutee_taux_reussite_toutes_series DOUBLE PRECISION,
    taux_acces_2nde_bac DOUBLE PRECISION,
    valeur_ajoutee_taux_acces_2nde_bac DOUBLE PRECISION,
    taux_mentions_toutes_series DOUBLE PRECISION,
    valeur_ajoutee_taux_mentions_toutes_series DOUBLE PRECISION,

    -- By series - Enrollment
    presents_l INTEGER,
    presents_es INTEGER,
    presents_s INTEGER,
    presents_gnle INTEGER,
    presents_sti2d INTEGER,
    presents_std2a INTEGER,
    presents_stmg INTEGER,
    presents_stl INTEGER,
    presents_st2s INTEGER,
    presents_tmd INTEGER,
    presents_sthr INTEGER,

    -- By series - Success rates
    taux_reussite_l DOUBLE PRECISION,
    taux_reussite_es DOUBLE PRECISION,
    taux_reussite_s DOUBLE PRECISION,
    taux_reussite_gnle DOUBLE PRECISION,
    taux_reussite_sti2d DOUBLE PRECISION,
    taux_reussite_std2a DOUBLE PRECISION,
    taux_reussite_stmg DOUBLE PRECISION,
    taux_reussite_stl DOUBLE PRECISION,
    taux_reussite_st2s DOUBLE PRECISION,
    taux_reussite_tmd DOUBLE PRECISION,
    taux_reussite_sthr DOUBLE PRECISION,

    -- By series - Value added
    valeur_ajoutee_taux_reussite_l DOUBLE PRECISION,
    valeur_ajoutee_taux_reussite_es DOUBLE PRECISION,
    valeur_ajoutee_taux_reussite_s DOUBLE PRECISION,
    valeur_ajoutee_taux_reussite_gnle DOUBLE PRECISION,
    valeur_ajoutee_taux_reussite_sti2d DOUBLE PRECISION,
    valeur_ajoutee_taux_reussite_std2a DOUBLE PRECISION,
    valeur_ajoutee_taux_reussite_stmg DOUBLE PRECISION,
    valeur_ajoutee_taux_reussite_stl DOUBLE PRECISION,
    valeur_ajoutee_taux_reussite_st2s DOUBLE PRECISION,
    valeur_ajoutee_taux_reussite_tmd DOUBLE PRECISION,
    valeur_ajoutee_taux_reussite_sthr DOUBLE PRECISION,

    -- Access rates
    effectif_de_seconde INTEGER,
    effectif_de_premiere INTEGER,
    effectif_de_terminale INTEGER,
    taux_acces_1ere_bac DOUBLE PRECISION,
    taux_acces_terminale_bac DOUBLE PRECISION,
    valeur_ajoutee_taux_acces_1ere_bac DOUBLE PRECISION,
    valeur_ajoutee_taux_acces_terminale_bac DOUBLE PRECISION,

    -- Mentions
    nombre_mentions_tb_avec_felicitations_g INTEGER,
    nombre_mentions_tb_sans_felicitations_g INTEGER,
    nombre_mentions_b_g INTEGER,
    nombre_mentions_ab_g INTEGER
);

COMMENT ON TABLE educational_data.aggregated_data_lycees_2024 IS 'Lycée performance metrics for all years (2017-2024) - Complete dataset with per-series breakdown';
COMMENT ON COLUMN educational_data.aggregated_data_lycees_2024.uai IS 'Unique establishment identifier (UAI code)';
COMMENT ON COLUMN educational_data.aggregated_data_lycees_2024.annee IS 'Year of data';
COMMENT ON COLUMN educational_data.aggregated_data_lycees_2024.taux_reussite_toutes_series IS 'Overall baccalaureate success rate (%)';
COMMENT ON COLUMN educational_data.aggregated_data_lycees_2024.valeur_ajoutee_taux_reussite_toutes_series IS 'Value-added for success rate (compared to expected)';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agg_lycees_2024_uai ON educational_data.aggregated_data_lycees_2024(uai);
CREATE INDEX IF NOT EXISTS idx_agg_lycees_2024_annee ON educational_data.aggregated_data_lycees_2024(annee);
CREATE INDEX IF NOT EXISTS idx_agg_lycees_2024_uai_annee ON educational_data.aggregated_data_lycees_2024(uai, annee);
CREATE INDEX IF NOT EXISTS idx_agg_lycees_2024_dept ON educational_data.aggregated_data_lycees_2024(code_departement);
CREATE INDEX IF NOT EXISTS idx_agg_lycees_2024_commune ON educational_data.aggregated_data_lycees_2024(code_commune);
CREATE INDEX IF NOT EXISTS idx_agg_lycees_2024_academie ON educational_data.aggregated_data_lycees_2024(academie);

-- ============================================================================
-- LYCÉES - IPS (Social Position Index)
-- ============================================================================

CREATE TABLE IF NOT EXISTS educational_data.ips_lycees (
    rentree_scolaire VARCHAR(20),
    code_region VARCHAR(10),
    region_academique VARCHAR(100),
    code_academie VARCHAR(10),
    academie VARCHAR(100),
    code_du_departement VARCHAR(10),
    departement VARCHAR(100),
    code_insee_de_la_commune VARCHAR(10),
    nom_de_la_commune VARCHAR(255),
    uai VARCHAR(20),
    nom_de_l_etablissement VARCHAR(255),
    secteur VARCHAR(50),
    type_de_lycee VARCHAR(50),

    -- IPS scores by track
    ips_voie_gt DOUBLE PRECISION,
    ips_voie_pro DOUBLE PRECISION,
    ips_post_bac DOUBLE PRECISION,
    ips_etab DOUBLE PRECISION,

    -- Standard deviations
    ecart_type_voie_gt DOUBLE PRECISION,
    ecart_type_voie_pro DOUBLE PRECISION,
    ecart_type_etablissement DOUBLE PRECISION,

    -- National benchmarks
    ips_national_legt DOUBLE PRECISION,
    ips_national_lpo DOUBLE PRECISION,
    ips_national_lp DOUBLE PRECISION,
    ips_national_legt_prive DOUBLE PRECISION,
    ips_national_legt_public DOUBLE PRECISION,
    ips_national_lpo_prive DOUBLE PRECISION,
    ips_national_lpo_public DOUBLE PRECISION,
    ips_national_lp_prive DOUBLE PRECISION,
    ips_national_lp_public DOUBLE PRECISION,

    -- Academic benchmarks
    ips_academique_legt DOUBLE PRECISION,
    ips_academique_lpo DOUBLE PRECISION,
    ips_academique_lp DOUBLE PRECISION,
    ips_academique_legt_prive DOUBLE PRECISION,
    ips_academique_legt_public DOUBLE PRECISION,
    ips_academique_lpo_prive DOUBLE PRECISION,
    ips_academique_lpo_public DOUBLE PRECISION,
    ips_academique_lp_prive DOUBLE PRECISION,
    ips_academique_lp_public DOUBLE PRECISION,

    -- Departmental benchmarks
    ips_departemental_legt DOUBLE PRECISION,
    ips_departemental_lpo DOUBLE PRECISION,
    ips_departemental_lp DOUBLE PRECISION,
    ips_departemental_legt_prive DOUBLE PRECISION,
    ips_departemental_legt_public DOUBLE PRECISION,
    ips_departemental_lpo_prive DOUBLE PRECISION,
    ips_departemental_lpo_public DOUBLE PRECISION,
    ips_departemental_lp_prive DOUBLE PRECISION,
    ips_departemental_lp_public DOUBLE PRECISION,

    num_ligne INTEGER
);

COMMENT ON TABLE educational_data.ips_lycees IS 'Social position indices (IPS) for lycées with national, academic, and departmental comparisons';
COMMENT ON COLUMN educational_data.ips_lycees.uai IS 'Unique establishment identifier (UAI code)';
COMMENT ON COLUMN educational_data.ips_lycees.ips_etab IS 'Overall establishment IPS';
COMMENT ON COLUMN educational_data.ips_lycees.ips_voie_gt IS 'IPS for general and technological track';
COMMENT ON COLUMN educational_data.ips_lycees.ips_voie_pro IS 'IPS for professional track';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ips_lycees_uai ON educational_data.ips_lycees(uai);
CREATE INDEX IF NOT EXISTS idx_ips_lycees_commune ON educational_data.ips_lycees(code_insee_de_la_commune);
CREATE INDEX IF NOT EXISTS idx_ips_lycees_dept ON educational_data.ips_lycees(code_du_departement);
CREATE INDEX IF NOT EXISTS idx_ips_lycees_academie ON educational_data.ips_lycees(code_academie);

-- ============================================================================
-- LYCÉES - Geolocation Data
-- ============================================================================

CREATE TABLE IF NOT EXISTS educational_data.geodata_lycees (
    uai VARCHAR(20),
    etablissement VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    position VARCHAR(255),
    code_commune VARCHAR(10),
    commune VARCHAR(255),
    academie VARCHAR(100),
    secteur VARCHAR(50)
);

COMMENT ON TABLE educational_data.geodata_lycees IS 'Lycée geolocation data with coordinates for map display';
COMMENT ON COLUMN educational_data.geodata_lycees.uai IS 'Unique establishment identifier (UAI code)';
COMMENT ON COLUMN educational_data.geodata_lycees.latitude IS 'Latitude coordinate';
COMMENT ON COLUMN educational_data.geodata_lycees.longitude IS 'Longitude coordinate';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_geodata_lycees_uai ON educational_data.geodata_lycees(uai);
CREATE INDEX IF NOT EXISTS idx_geodata_lycees_commune ON educational_data.geodata_lycees(code_commune);
CREATE INDEX IF NOT EXISTS idx_geodata_lycees_coords ON educational_data.geodata_lycees(latitude, longitude);

-- ============================================================================
-- LYCÉES - Geolocalisation with Sector
-- ============================================================================

CREATE TABLE IF NOT EXISTS educational_data.lycees_geolocalisation (
    uai VARCHAR(20) PRIMARY KEY,
    nom VARCHAR(255),
    commune VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    secteur VARCHAR(50)
);

COMMENT ON TABLE educational_data.lycees_geolocalisation IS 'Lycée geographic info with sector - Used by sectorisation service';
COMMENT ON COLUMN educational_data.lycees_geolocalisation.uai IS 'Unique establishment identifier (UAI code)';
COMMENT ON COLUMN educational_data.lycees_geolocalisation.secteur IS 'Public/Private sector';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lycees_geoloc_commune ON educational_data.lycees_geolocalisation(commune);
CREATE INDEX IF NOT EXISTS idx_lycees_geoloc_secteur ON educational_data.lycees_geolocalisation(secteur);

-- ============================================================================
-- LYCÉES - UAI to Address Mapping
-- ============================================================================

CREATE TABLE IF NOT EXISTS educational_data.lycees_address_uai_mapping (
    uai VARCHAR(20) PRIMARY KEY,
    address TEXT
);

COMMENT ON TABLE educational_data.lycees_address_uai_mapping IS 'UAI to address mapping for display and geocoding';
COMMENT ON COLUMN educational_data.lycees_address_uai_mapping.uai IS 'Unique establishment identifier (UAI code)';
COMMENT ON COLUMN educational_data.lycees_address_uai_mapping.address IS 'Full address text';

-- ============================================================================
-- COLLÈGES - Performance Metrics
-- ============================================================================

CREATE TABLE IF NOT EXISTS educational_data.metrics_colleges (
    session INTEGER,
    uai VARCHAR(20),
    nom_etablissement VARCHAR(255),
    commune VARCHAR(255),
    code_region_academique VARCHAR(10),
    region_academique VARCHAR(100),
    code_academie VARCHAR(10),
    academie VARCHAR(100),
    code_departement VARCHAR(10),
    departement VARCHAR(100),
    secteur VARCHAR(20),

    -- General track metrics
    nb_candidats_g INTEGER,
    taux_reussite_g NUMERIC(5,2),
    va_taux_reussite_g NUMERIC(5,2),
    note_ecrit_g NUMERIC(5,2),
    va_note_g NUMERIC(5,2),

    -- Professional track metrics
    nb_candidats_p INTEGER,
    taux_reussite_p NUMERIC(5,2),
    note_ecrit_p NUMERIC(5,2),

    -- Access rates
    taux_acces_6e_3e NUMERIC(5,2),
    part_presents_3e_ordinaire_total NUMERIC(5,2),
    part_presents_3e_ordinaire_g NUMERIC(5,2),
    part_presents_3e_ordinaire_p NUMERIC(5,2),
    part_presents_3e_segpa_total NUMERIC(5,2),

    -- Mentions
    nb_mentions_ab_g INTEGER,
    nb_mentions_b_g INTEGER,
    nb_mentions_tb_g INTEGER,
    nb_mentions_global_g INTEGER,
    taux_mention NUMERIC(5,2),

    -- Scoring
    score_college NUMERIC,
    classement INTEGER,
    classement_relatif INTEGER,
    valeur_ajoutee NUMERIC,

    code_commune VARCHAR(10)
);

COMMENT ON TABLE educational_data.metrics_colleges IS 'Collège performance metrics for all sessions - Complete dataset';
COMMENT ON COLUMN educational_data.metrics_colleges.uai IS 'Unique establishment identifier (UAI code)';
COMMENT ON COLUMN educational_data.metrics_colleges.session IS 'Year/session of the exam';
COMMENT ON COLUMN educational_data.metrics_colleges.taux_reussite_g IS 'Success rate for general track (%)';
COMMENT ON COLUMN educational_data.metrics_colleges.va_taux_reussite_g IS 'Value-added for success rate';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_metrics_colleges_uai ON educational_data.metrics_colleges(uai);
CREATE INDEX IF NOT EXISTS idx_metrics_colleges_session ON educational_data.metrics_colleges(session);
CREATE INDEX IF NOT EXISTS idx_metrics_colleges_uai_session ON educational_data.metrics_colleges(uai, session);
CREATE INDEX IF NOT EXISTS idx_metrics_colleges_dept ON educational_data.metrics_colleges(code_departement);
CREATE INDEX IF NOT EXISTS idx_metrics_colleges_commune ON educational_data.metrics_colleges(code_commune);

-- ============================================================================
-- COLLÈGES - IPS (Social Position Index)
-- ============================================================================

CREATE TABLE IF NOT EXISTS educational_data.ips_colleges (
    rentree_scolaire VARCHAR(20),
    code_region VARCHAR(10),
    region_academique VARCHAR(100),
    code_academie VARCHAR(10),
    academie VARCHAR(100),
    code_du_departement VARCHAR(10),
    departement VARCHAR(100),
    code_insee_de_la_commune VARCHAR(10),
    nom_de_la_commune VARCHAR(255),
    uai VARCHAR(20),
    nom_de_l_etablissement VARCHAR(255),
    secteur VARCHAR(50),

    -- IPS scores
    ips DOUBLE PRECISION,
    ecart_type_de_l_ips DOUBLE PRECISION,

    -- National benchmarks
    ips_national_prive DOUBLE PRECISION,
    ips_national_public DOUBLE PRECISION,
    ips_national DOUBLE PRECISION,

    -- Academic benchmarks
    ips_academique_prive DOUBLE PRECISION,
    ips_academique_public DOUBLE PRECISION,
    ips_academique DOUBLE PRECISION,

    -- Departmental benchmarks
    ips_departemental_prive DOUBLE PRECISION,
    ips_departemental_public DOUBLE PRECISION,
    ips_departemental DOUBLE PRECISION,

    num_ligne INTEGER
);

COMMENT ON TABLE educational_data.ips_colleges IS 'Social position indices (IPS) for collèges with benchmarks';
COMMENT ON COLUMN educational_data.ips_colleges.uai IS 'Unique establishment identifier (UAI code)';
COMMENT ON COLUMN educational_data.ips_colleges.ips IS 'Overall IPS for the collège';
COMMENT ON COLUMN educational_data.ips_colleges.ecart_type_de_l_ips IS 'Standard deviation of the IPS';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ips_colleges_uai ON educational_data.ips_colleges(uai);
CREATE INDEX IF NOT EXISTS idx_ips_colleges_commune ON educational_data.ips_colleges(code_insee_de_la_commune);
CREATE INDEX IF NOT EXISTS idx_ips_colleges_dept ON educational_data.ips_colleges(code_du_departement);
CREATE INDEX IF NOT EXISTS idx_ips_colleges_academie ON educational_data.ips_colleges(code_academie);

