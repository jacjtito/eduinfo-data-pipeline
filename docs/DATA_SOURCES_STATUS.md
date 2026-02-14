# Data Sources Status Report

**Generated**: 2026-02-14
**Total Sources**: 16

## Summary by Freshness

### ✅ Recently Checked (Last 30 days)
8 sources checked in January 2026

### ⚠️ Never Checked
8 sources have never been checked

### 📦 Import Status
- **0 sources** have been imported (`last_imported IS NOT NULL`)
- **16 sources** are pending import

## Detailed Status by Category

### 1. Academic Performance Data (5 sources)

#### Indicateurs de Valeur Ajoutée des Lycées ⭐
- **ID**: `lycees-indicateurs-iva`
- **Status**: ✅ Recently updated (Jan 29, 2026)
- **Last Checked**: Jan 30, 2026
- **Acknowledged**: Yes
- **DB Table**: `aggregated_data_lycees_2024`
- **Frequency**: Yearly
- **Action**: This appears to be the most up-to-date source!

#### Indicateurs de Valeur Ajoutée - Collèges
- **ID**: `indicateurs-colleges`
- **Status**: ✅ Checked Jan 30, 2026
- **Last Modified**: Unknown
- **DB Table**: `metrics_colleges`
- **Frequency**: Yearly
- **Action**: Check for updates, last modified date unknown

#### IPS (Indice de Position Sociale) - Lycées
- **ID**: `ips-lycees`
- **Status**: ✅ Checked Jan 30, 2026
- **DB Table**: `aggregated_data_lycees_2024`
- **Frequency**: Yearly

#### IPS (Indice de Position Sociale) - Collèges
- **ID**: `ips-colleges`
- **Status**: ✅ Checked Jan 30, 2026
- **DB Table**: `metrics_colleges`
- **Frequency**: Yearly

#### Indicateurs de Résultats - Lycées Professionnels
- **ID**: `lycees-professionnels-indicateurs`
- **Status**: ⚠️ Never checked
- **Frequency**: Yearly
- **Action**: Initial check needed

---

### 2. Geolocation & Établissements (3 sources)

#### Annuaire de l'Éducation - Lycées ⭐
- **ID**: `lycees-geolocalisation`
- **Status**: ✅ Recently updated (Jan 29, 2026)
- **Last Checked**: Jan 30, 2026
- **DB Table**: `geodata_lycees`
- **Frequency**: Quarterly
- **Action**: Fresh data available!

#### Adresses et Géolocalisation des Établissements
- **ID**: `etablissements-geolocalisation`
- **Status**: ✅ Checked Jan 30, 2026
- **DB Table**: `geodata_lycees`
- **Frequency**: Quarterly
- **Action**: Check for modifications

#### Code Officiel Géographique - Communes
- **ID**: `communes-france`
- **Status**: ✅ Checked Jan 30, 2026
- **DB Table**: `info_communes`
- **Frequency**: Yearly
- **Type**: API
- **Action**: Verify via API

---

### 3. Curriculum Data (2 sources)

#### ONISEP - Spécialités de Première
- **ID**: `onisep-specialites-premiere`
- **Status**: ⚠️ Never checked
- **DB Table**: `specialites_lycees`
- **Frequency**: Yearly
- **Action**: Check for 2025-2026 data

#### ONISEP - Enseignements Optionnels de Seconde
- **ID**: `onisep-optionnels-seconde`
- **Status**: ⚠️ Never checked
- **DB Table**: `enseignements_optionnels_seconde`
- **Frequency**: Yearly
- **Action**: Check for 2025-2026 data

---

### 4. Real Estate Data (1 source)

#### DVF - Demandes de Valeurs Foncières
- **ID**: `dvf-mutations-immobilieres`
- **Status**: ✅ Checked Jan 30, 2026
- **DB Table**: `mutations_immo_2024`
- **Frequency**: Biannual (every 6 months)
- **Next Expected**: March/April 2026 (for 2025 H2 data)
- **Action**: Monitor for 2025 data release

---

### 5. Sectorisation Data (4 sources) - Manual/Complex

#### Carte Scolaire - Paris Collèges
- **ID**: `sectorisation-paris-colleges`
- **Status**: ⚠️ Never checked
- **Type**: ArcGIS
- **Frequency**: Yearly
- **Action**: Manual check required

#### Affectation Lycées - Paris
- **ID**: `sectorisation-paris-lycees`
- **Status**: ⚠️ Never checked
- **Type**: ArcGIS
- **Frequency**: Yearly
- **Action**: Manual check required

#### Carte Scolaire - Yvelines (78)
- **ID**: `sectorisation-yvelines`
- **Status**: ⚠️ Never checked
- **Type**: Manual
- **Frequency**: Yearly
- **Action**: Manual check required

#### Pseudo-Secteurs - Région PACA
- **ID**: `sectorisation-paca`
- **Status**: ⚠️ Never checked
- **Type**: ArcGIS
- **Frequency**: Yearly
- **Action**: Manual check required

---

### 6. Parcoursup (1 source)

#### Catalogue des Formations Parcoursup
- **ID**: `parcoursup-formations`
- **Status**: ⚠️ Never checked
- **Frequency**: Yearly
- **Action**: Check for 2026 catalog

---

## Priority Actions

### 🔴 High Priority (Fresh Data Available)

1. **Lycées IVA** - Last modified Jan 29, 2026 ✅ ACKNOWLEDGED
2. **Annuaire Lycées** - Last modified Jan 29, 2026
3. **Import these datasets** if not already done

### 🟡 Medium Priority (Check for Updates)

1. **Indicateurs Collèges** - Check modification date
2. **IPS Lycées/Collèges** - Verify latest data
3. **DVF Immobilier** - Monitor for 2025 data (expected March/April)
4. **Géolocalisation Établissements** - Check for updates

### 🟢 Low Priority (Periodic Check)

1. **Communes France (INSEE)** - Annual API check
2. **ONISEP datasets** - Check for 2025-2026 school year data
3. **Parcoursup** - Check for 2026 catalog
4. **Sectorisation sources** - Manual checks (4 sources)

---

## Recommended Next Steps

1. **Verify Import Status**: Check which of the "checked" sources have actually been imported
2. **Set up Monitoring Script**: Automate checks for the 8 never-checked sources
3. **Review Fresh Data**: Priority review of Jan 29, 2026 updates
4. **Update Import Scripts**: Ensure import scripts are ready for new data
5. **Schedule Checks**: Set up quarterly checks for high-frequency sources

---

## Data Freshness Analysis

**Most Recent Data**: January 29-30, 2026 (2 sources)
- Lycées IVA (acknowledged ✓)
- Annuaire Lycées

**Last Import Run**: Never (all sources show `last_imported = NULL`)
**Data Staleness**: Most data likely from 2024 school year

**Critical Gap**: Import scripts may not have run after data checks!

---

## Query to Verify Import Status

```sql
SELECT
  id,
  name,
  last_checked,
  last_imported,
  last_known_modified,
  CASE
    WHEN last_imported IS NULL THEN 'Never imported'
    WHEN last_known_modified > last_imported THEN 'Update available'
    ELSE 'Up to date'
  END as import_status
FROM monitoring.data_sources
ORDER BY last_known_modified DESC NULLS LAST;
```

---

## Database Tables Status (As of Feb 14, 2026)

### Core Academic Data

| Table | Rows | Size | Notes |
|-------|------|------|-------|
| `aggregated_data_lycees_2024` | 30,139 | 162 MB | ✅ **2024 data** - Most recent lycées data |
| `aggregated_data_lycees` | 27,808 | 54 MB | Older lycées data |
| `perfs_lycees_2024` | 30,139 | 11 MB | ✅ **2024 performance data** |
| `kpi_lycees` | 27,808 | 32 MB | KPI metrics |
| `metrics_colleges_2024` | 20,053 | 3.9 MB | ✅ **2024 collèges metrics** |
| `metrics_colleges` | 20,063 | 8.4 MB | Older collèges metrics |

### Geolocation Data

| Table | Rows | Size | Notes |
|-------|------|------|-------|
| `geodata_lycees` | 64,412 | 29 MB | ✅ Large geolocation dataset |
| `lycees_geolocalisation` | 2,441 | 1.3 MB | Subset of lycées |
| `colleges_geolocalisation` | 6,812 | 4.8 MB | Collèges locations |

### IPS (Position Sociale)

| Table | Rows | Size | Notes |
|-------|------|------|-------|
| `ips_lycees` | 3,598 | 816 kB | IPS for lycées |
| `ips_colleges` | 6,979 | 1.1 MB | IPS for collèges |
| `ips_score` | 1,680 | 120 kB | IPS score reference |

### Curriculum Data

| Table | Rows | Size | Notes |
|-------|------|------|-------|
| `specialites_lycees` | 2,434 | 5.2 MB | Spécialités (1ère) |
| `enseignements_optionnels_seconde` | 2,676 | 4.4 MB | Options (2nde) |
| `sections_internationales` | 1,044 | 472 kB | International sections |
| `onisep_details_formations_lycees` | 42,140 | 31 MB | Detailed formations |
| `onisep_details_formations_colleges` | 8,352 | 5.2 MB | Collège formations |

### Contextual Data (Communes)

| Table | Rows | Size | Notes |
|-------|------|------|-------|
| `info_communes` | 36,700 | 11 MB | ✅ Comprehensive commune info |
| `communes_limitrophes` | 37,962 | 3.9 MB | Neighboring communes |
| `commune_boundaries` | 1,678 | 9.1 MB | Boundaries with geometry |
| `anecdotes_communes` | 3,795 | 824 kB | Commune anecdotes |

### Economic & Demographic Data

| Table | Rows | Size | Notes |
|-------|------|------|-------|
| `activite_economique_2022` | 34,935 | 4.4 MB | **2022 data** - May need update |
| `commerce_sante_2023` | 34,935 | 4.6 MB | ✅ **2023 data** |
| `emploi_2021` | 34,935 | 2.4 MB | **2021 data** - Outdated |
| `logement_2021` | 34,935 | 5.0 MB | **2021 data** - Outdated |
| `niveau_education_2021` | 34,935 | 3.9 MB | **2021 data** - Outdated |
| `population_evolution_age` | 34,935 | 4.4 MB | Population by age |
| `merged_revenu_commune_bassin_2021` | 34,935 | 3.2 MB | **2021 revenue data** - Outdated |

### Real Estate (DVF)

| Table | Rows | Size | Notes |
|-------|------|------|-------|
| `mutations_immo_2024` | 29,832 | 4.2 MB | ✅ **2024 data** |
| `mutations_immo_2023` | 29,832 | 4.2 MB | 2023 data (archive) |

### Security Data

| Table | Rows | Size | Notes |
|-------|------|------|-------|
| `criminalite_2023` | 559,680 | 64 MB | ✅ **2023 crime data** (large!) |
| `crime_indicateur_avg` | 1,568 | 288 kB | Crime indicators avg |

### Sectorisation

| Table | Rows | Size | Notes |
|-------|------|------|-------|
| `sectorisation_zones` | 1,824 | 25 MB | School catchment zones (geom) |
| `sectorisation_segments` | 23,163 | 19 MB | Address segments for sectorisation |

---

## Data Freshness Summary

### ✅ Fresh (2024 data)
- **Lycées**: aggregated_data_lycees_2024, perfs_lycees_2024
- **Collèges**: metrics_colleges_2024
- **Immobilier**: mutations_immo_2024
- **Commerce/Santé**: 2023 (reasonably fresh)
- **Criminalité**: 2023 (reasonably fresh)

### ⚠️ Outdated (2021-2022 data)
- **Activité Économique**: 2022 (2 years old)
- **Emploi**: 2021 (3 years old)
- **Logement**: 2021 (3 years old)
- **Éducation niveau**: 2021 (3 years old)
- **Revenus**: 2021 (3 years old)

### 📊 Data Quality Issues

1. **Mixed Data Vintages**: Core academic data is 2024, but contextual data is 2021-2022
2. **No 2025 Data Yet**: Expected release Q1-Q2 2026 for 2024-2025 school year
3. **Demographic Data Lag**: INSEE data typically lags by 2-3 years
4. **Economic Data**: Should check for 2023-2024 updates

---

## Recommendations

### Immediate Actions

1. **Check for 2024-2025 Academic Data**
   - Expected: Q2 2026 (March-June)
   - Sources: Lycées IVA, Collèges Indicateurs

2. **Update Economic/Demographic Data**
   - Priority: Activité Économique (2023-2024 available?)
   - Medium: Emploi, Logement, Éducation (check INSEE)

3. **Verify Import Status**
   - All tables show data but `last_imported = NULL` in monitoring
   - Update monitoring.data_sources with actual import dates

### Data Pipeline Review

1. **Automate Monitoring**: Set up cron job to check sources monthly
2. **Import Scripts**: Document and test all import scripts
3. **Data Validation**: Add data quality checks after imports
4. **User Notifications**: Inform users about data vintages on UI

