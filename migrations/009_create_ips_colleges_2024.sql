-- Migration: Create ips_colleges_2024 table
-- Description: Social position indices (IPS) for collèges 2024
-- Date: 2026-02-14

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.ips_colleges_2024;

-- Create ips_colleges_2024 table with all CSV columns
CREATE TABLE IF NOT EXISTS public.ips_colleges_2024 (
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
    ips DOUBLE PRECISION,
    ecart_type_de_l_ips DOUBLE PRECISION,
    ips_national_prive DOUBLE PRECISION,
    ips_national_public DOUBLE PRECISION,
    ips_national DOUBLE PRECISION,
    ips_academique_prive DOUBLE PRECISION,
    ips_academique_public DOUBLE PRECISION,
    ips_academique DOUBLE PRECISION,
    ips_departemental_prive DOUBLE PRECISION,
    ips_departemental_public DOUBLE PRECISION,
    ips_departemental DOUBLE PRECISION,
    num_ligne INTEGER
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ips_colleges_2024_uai ON public.ips_colleges_2024(uai);
CREATE INDEX IF NOT EXISTS idx_ips_colleges_2024_code_commune ON public.ips_colleges_2024(code_insee_de_la_commune);
CREATE INDEX IF NOT EXISTS idx_ips_colleges_2024_academie ON public.ips_colleges_2024(code_academie);
CREATE INDEX IF NOT EXISTS idx_ips_colleges_2024_departement ON public.ips_colleges_2024(code_du_departement);
CREATE INDEX IF NOT EXISTS idx_ips_colleges_2024_region ON public.ips_colleges_2024(code_region);

-- Add comments
COMMENT ON TABLE public.ips_colleges_2024 IS 'Social position indices (IPS) for collèges 2024 - Full dataset including national, academic, and departmental comparisons - Source: Ministère de l''Éducation nationale';
COMMENT ON COLUMN public.ips_colleges_2024.uai IS 'Unique identifier for the establishment (UAI code)';
COMMENT ON COLUMN public.ips_colleges_2024.ips IS 'Overall IPS for the collège';
COMMENT ON COLUMN public.ips_colleges_2024.ecart_type_de_l_ips IS 'Standard deviation of the IPS';
COMMENT ON COLUMN public.ips_colleges_2024.ips_national IS 'National average IPS for all collèges';
COMMENT ON COLUMN public.ips_colleges_2024.ips_national_prive IS 'National average IPS for private collèges';
COMMENT ON COLUMN public.ips_colleges_2024.ips_national_public IS 'National average IPS for public collèges';
COMMENT ON COLUMN public.ips_colleges_2024.ips_academique IS 'Academic average IPS for the académie';
COMMENT ON COLUMN public.ips_colleges_2024.ips_departemental IS 'Departmental average IPS';
