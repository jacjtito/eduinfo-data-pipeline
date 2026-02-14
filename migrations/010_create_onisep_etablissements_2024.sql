-- Migration: Create onisep_etablissements_2024 table
-- Description: ONISEP secondary education establishments (collèges, lycées, CFA) - Full dataset
-- Date: 2026-02-14

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.onisep_etablissements_2024;

-- Create onisep_etablissements_2024 table with all CSV columns
CREATE TABLE IF NOT EXISTS public.onisep_etablissements_2024 (
    code_uai VARCHAR(20),
    numero_siret VARCHAR(20),
    type_etablissement VARCHAR(100),
    nom VARCHAR(255),
    sigle VARCHAR(100),
    statut VARCHAR(50),
    tutelle VARCHAR(100),
    universite_rattachement_libelle_uai TEXT,
    universite_rattachement_id_url TEXT,
    etablissements_lies_libelles TEXT,
    etablissements_lies_url_id TEXT,
    adresse_1 VARCHAR(255),
    adresse_2 VARCHAR(255),
    code_postal VARCHAR(10),
    commune VARCHAR(100),
    commune_cog VARCHAR(10),
    cedex VARCHAR(20),
    telephone VARCHAR(20),
    arrondissement VARCHAR(50),
    departement VARCHAR(100),
    academie VARCHAR(100),
    region VARCHAR(100),
    region_cog VARCHAR(10),
    longitude DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    journees_portes_ouvertes TEXT,
    langues_enseignees TEXT,
    url_id_onisep TEXT,
    date_creation DATE,
    date_modification DATE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_onisep_etab_2024_uai ON public.onisep_etablissements_2024(code_uai);
CREATE INDEX IF NOT EXISTS idx_onisep_etab_2024_commune ON public.onisep_etablissements_2024(commune_cog);
CREATE INDEX IF NOT EXISTS idx_onisep_etab_2024_type ON public.onisep_etablissements_2024(type_etablissement);
CREATE INDEX IF NOT EXISTS idx_onisep_etab_2024_academie ON public.onisep_etablissements_2024(academie);
CREATE INDEX IF NOT EXISTS idx_onisep_etab_2024_departement ON public.onisep_etablissements_2024(departement);
CREATE INDEX IF NOT EXISTS idx_onisep_etab_2024_region ON public.onisep_etablissements_2024(region_cog);
CREATE INDEX IF NOT EXISTS idx_onisep_etab_2024_coords ON public.onisep_etablissements_2024(longitude, latitude);

-- Add comments
COMMENT ON TABLE public.onisep_etablissements_2024 IS 'ONISEP secondary education establishments 2024 - Complete dataset with 15,266 establishments (collèges, lycées, CFA) - Source: ONISEP';
COMMENT ON COLUMN public.onisep_etablissements_2024.code_uai IS 'Unique establishment identifier (UAI code)';
COMMENT ON COLUMN public.onisep_etablissements_2024.numero_siret IS 'SIRET business identification number';
COMMENT ON COLUMN public.onisep_etablissements_2024.type_etablissement IS 'Type of establishment (lycée, collège, CFA, etc.)';
COMMENT ON COLUMN public.onisep_etablissements_2024.nom IS 'Name of the establishment';
COMMENT ON COLUMN public.onisep_etablissements_2024.statut IS 'Status (public, private, etc.)';
COMMENT ON COLUMN public.onisep_etablissements_2024.commune_cog IS 'INSEE commune code (COG)';
COMMENT ON COLUMN public.onisep_etablissements_2024.longitude IS 'Longitude coordinate (X)';
COMMENT ON COLUMN public.onisep_etablissements_2024.latitude IS 'Latitude coordinate (Y)';
