-- Migration: Create criminalite_2024 table
-- Description: Crime and delinquency statistics for 2024
-- Date: 2026-02-14

-- Create criminalite_2024 table with same structure as criminalite_2023
CREATE TABLE IF NOT EXISTS public.criminalite_2024 (
    code_commune text,
    annee integer,
    indicateur text,
    unite_de_compte text,
    nombre integer,
    taux_pour_mille numeric,
    est_diffuse text,
    insee_pop integer,
    insee_log integer,
    complement_info_nombre numeric,
    complement_info_taux numeric
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_criminalite_2024_code_commune ON public.criminalite_2024(code_commune);
CREATE INDEX IF NOT EXISTS idx_criminalite_2024_annee ON public.criminalite_2024(annee);
CREATE INDEX IF NOT EXISTS idx_criminalite_2024_indicateur ON public.criminalite_2024(indicateur);

-- Add comments
COMMENT ON TABLE public.criminalite_2024 IS 'Crime and delinquency statistics by commune for 2024 - Source: SSMSI (Service statistique ministériel de la sécurité intérieure)';
COMMENT ON COLUMN public.criminalite_2024.code_commune IS 'INSEE commune code';
COMMENT ON COLUMN public.criminalite_2024.annee IS 'Year of the statistics';
COMMENT ON COLUMN public.criminalite_2024.indicateur IS 'Type of crime/delinquency indicator';
COMMENT ON COLUMN public.criminalite_2024.unite_de_compte IS 'Unit of count (e.g., faits, victimes)';
COMMENT ON COLUMN public.criminalite_2024.nombre IS 'Absolute number of incidents';
COMMENT ON COLUMN public.criminalite_2024.taux_pour_mille IS 'Rate per thousand inhabitants';
COMMENT ON COLUMN public.criminalite_2024.est_diffuse IS 'Whether the data is publicly released';
COMMENT ON COLUMN public.criminalite_2024.insee_pop IS 'INSEE population count';
COMMENT ON COLUMN public.criminalite_2024.insee_log IS 'INSEE housing units count';
