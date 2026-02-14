-- Migration 006: Create commerce_sante_2024 table for BPE 2024 data
-- Base Permanente des Équipements - Services and facilities by commune

CREATE TABLE IF NOT EXISTS public.commerce_sante_2024 (
    code_commune character varying(10),
    commune character varying(100),
    police_gendarmerie integer,
    banque_caisse_epargne integer,
    grande_surface integer,
    superette_epicerie integer,
    boulangerie_patisserie integer,
    ecole_maternelle_primaire_elementaire integer,
    college integer,
    urgences integer,
    lycee integer,
    medecin_generaliste integer,
    chirurgien_dentiste integer,
    masseur_kinesitherapeute integer,
    infirmier integer,
    pharmacie integer,
    personnes_agees_hebergement integer,
    eaje_accueil_jeune_enfant integer,
    bassin_natation integer,
    salles_multisports integer
);

-- Add primary key
ALTER TABLE public.commerce_sante_2024
ADD CONSTRAINT commerce_sante_2024_pkey PRIMARY KEY (code_commune);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_commerce_sante_2024_commune
ON public.commerce_sante_2024(commune);

-- Add comments
COMMENT ON TABLE public.commerce_sante_2024 IS
'INSEE BPE (Base Permanente des Équipements) 2024 - Facility and service counts by commune';

COMMENT ON COLUMN public.commerce_sante_2024.code_commune IS 'INSEE commune code';
COMMENT ON COLUMN public.commerce_sante_2024.commune IS 'Commune name';
