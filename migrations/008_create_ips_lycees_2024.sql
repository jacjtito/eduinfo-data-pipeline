-- Migration: Create ips_lycees_2024 table
-- Description: Social position indices (IPS) for lycées 2024 - Full dataset with all columns
-- Date: 2026-02-14

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.ips_lycees_2024;

-- Create ips_lycees_2024 table with all CSV columns
CREATE TABLE IF NOT EXISTS public.ips_lycees_2024 (
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
    ips_voie_gt DOUBLE PRECISION,
    ips_voie_pro DOUBLE PRECISION,
    ips_post_bac DOUBLE PRECISION,
    ips_etab DOUBLE PRECISION,
    ecart_type_voie_gt DOUBLE PRECISION,
    ecart_type_voie_pro DOUBLE PRECISION,
    ecart_type_etablissement DOUBLE PRECISION,
    ips_national_legt DOUBLE PRECISION,
    ips_national_lpo DOUBLE PRECISION,
    ips_national_lp DOUBLE PRECISION,
    ips_national_legt_prive DOUBLE PRECISION,
    ips_national_legt_public DOUBLE PRECISION,
    ips_national_lpo_prive DOUBLE PRECISION,
    ips_national_lpo_public DOUBLE PRECISION,
    ips_national_lp_prive DOUBLE PRECISION,
    ips_national_lp_public DOUBLE PRECISION,
    ips_academique_legt DOUBLE PRECISION,
    ips_academique_lpo DOUBLE PRECISION,
    ips_academique_lp DOUBLE PRECISION,
    ips_academique_legt_prive DOUBLE PRECISION,
    ips_academique_legt_public DOUBLE PRECISION,
    ips_academique_lpo_prive DOUBLE PRECISION,
    ips_academique_lpo_public DOUBLE PRECISION,
    ips_academique_lp_prive DOUBLE PRECISION,
    ips_academique_lp_public DOUBLE PRECISION,
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ips_lycees_2024_uai ON public.ips_lycees_2024(uai);
CREATE INDEX IF NOT EXISTS idx_ips_lycees_2024_code_commune ON public.ips_lycees_2024(code_insee_de_la_commune);
CREATE INDEX IF NOT EXISTS idx_ips_lycees_2024_academie ON public.ips_lycees_2024(code_academie);
CREATE INDEX IF NOT EXISTS idx_ips_lycees_2024_departement ON public.ips_lycees_2024(code_du_departement);
CREATE INDEX IF NOT EXISTS idx_ips_lycees_2024_region ON public.ips_lycees_2024(code_region);

-- Add comments
COMMENT ON TABLE public.ips_lycees_2024 IS 'Social position indices (IPS) for lycées 2024 - Full dataset including national, academic, and departmental comparisons - Source: Ministère de l''Éducation nationale';
COMMENT ON COLUMN public.ips_lycees_2024.uai IS 'Unique identifier for the establishment (UAI code)';
COMMENT ON COLUMN public.ips_lycees_2024.ips_voie_gt IS 'IPS for general and technological track';
COMMENT ON COLUMN public.ips_lycees_2024.ips_voie_pro IS 'IPS for professional track';
COMMENT ON COLUMN public.ips_lycees_2024.ips_post_bac IS 'IPS for post-baccalaureate programs';
COMMENT ON COLUMN public.ips_lycees_2024.ips_etab IS 'Overall establishment IPS';
COMMENT ON COLUMN public.ips_lycees_2024.ips_national_legt IS 'National average IPS for LEGT (Lycée d''Enseignement Général et Technologique)';
COMMENT ON COLUMN public.ips_lycees_2024.ips_national_lpo IS 'National average IPS for LPO (Lycée Polyvalent)';
COMMENT ON COLUMN public.ips_lycees_2024.ips_national_lp IS 'National average IPS for LP (Lycée Professionnel)';
