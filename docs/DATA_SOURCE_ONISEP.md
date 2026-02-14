# ONISEP Data Source Documentation

**Provider**: ONISEP (Office national d'information sur les enseignements et les professions)
**Type**: Open Data API & CSV Download
**License**: ODbL (Open Database License) - ✅ **Commercial use allowed**
**Frequency**: Yearly updates (~10 updates/year)
**Coverage**: France (métropole + DOM-TOM)

## Quick Answers

### ❓ Why wasn't lycée 0782568T (Lycée Alain, Le Vésinet) found initially?

You were looking at the **wrong dataset**! ONISEP has **two separate datasets**:

1. **Higher Education** (`5fa586da5c4b6`) - 9,017 universities, IUT, engineering schools ❌ (initially documented)
2. **Secondary Education** (`5fa5816ac6a6e`) - 15,266 collèges, lycées, CFA ✅ (correct one for eduInfo)

UAI **0782568T** is in the **secondary education dataset** and can be found here:
- **Name**: Lycée Alain
- **Location**: 25 route de la Cascade, 78110 Le Vésinet
- **Type**: Lycée général, technologique ou polyvalent
- **API**: `https://api.opendata.onisep.fr/api/1.0/dataset/5fa5816ac6a6e/search?q=0782568T`

### ✅ Can you use ONISEP data for commercial purposes?

**YES!** The ODbL (Open Database License) **allows commercial use** with these conditions:

1. ✅ **Use commercially** - You can use it in eduInfo (commercial SaaS)
2. ⚠️ **Attribute ONISEP** - Must credit them as the data source
3. ⚠️ **Share-Alike** - If you publicly distribute a modified version of the database itself, share it under ODbL
4. ⚠️ **No DRM lock-in** - Can't restrict access with technical measures only

**For eduInfo**: You're fine! Just add "Data source: ONISEP" in your UI where you display this data.

---

## Overview

ONISEP provides comprehensive data about educational institutions in France through multiple datasets covering secondary education, higher education, and training programs.

## License Information - ODbL

**License**: [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/)

### ✅ You CAN Use for Commercial Purposes

The ODbL license **permits commercial use** with the following requirements:

1. **Attribution Required**: You must credit ONISEP as the data source
2. **Share-Alike**: If you modify or adapt the database and distribute it publicly, you must share it under the same ODbL license
3. **Keep Open**: If you add technological restrictions (like DRM), you must also provide an unrestricted version

### Key Freedoms
- ✅ Use commercially
- ✅ Share the database
- ✅ Create derived works
- ✅ Adapt and modify the data

### Key Obligations
- ⚠️ **Attribute ONISEP** in any public use
- ⚠️ **Share modifications** under ODbL if publicly distributed
- ⚠️ **No lock-in**: Cannot restrict access with DRM only

**For eduInfo**: You can use this data commercially as long as you attribute ONISEP and keep any shared modifications open.

---

## Available Datasets

ONISEP provides **3 main establishment datasets**:

### 1. Secondary Education (Enseignement Secondaire) ⭐
- **Dataset ID**: `5fa5816ac6a6e`
- **Web Interface**: https://opendata.onisep.fr/data/5fa5816ac6a6e/2-ideo-structures-d-enseignement-secondaire.htm
- **Total Records**: 15,266 establishments (as of Feb 2026)
- **Coverage**: Collèges (7,200), Lycées (2,581 general + 1,244 professional), CFA (1,645), Agricultural lycées (453), and more
- **Most Relevant for eduInfo** ✅

### 2. Higher Education (Enseignement Supérieur)
- **Dataset ID**: `5fa586da5c4b6`
- **Web Interface**: https://opendata.onisep.fr/data/5fa586da5c4b6/2-ideo-structures-d-enseignement-superieur.htm
- **Total Records**: 9,017 establishments (as of Feb 2026)
- **Coverage**: Universities, IUT, Engineering schools, Business schools, Health schools, etc.

### 3. Training Programs & Curricula
Additional datasets available for specific programs offered by establishments (not just the establishments themselves).

---

## API Information

### Base URL
```
https://api.opendata.onisep.fr/api/1.0/
```

### Main Dataset for Secondary Education ⭐
- **Dataset ID**: `5fa5816ac6a6e` (Secondary Education)
- **Total Records**: 15,266 establishments (as of Feb 2026)

### API Endpoints

#### Secondary Education (Recommended for eduInfo)
```bash
GET https://api.opendata.onisep.fr/api/1.0/dataset/5fa5816ac6a6e/search
```

#### Higher Education
```bash
GET https://api.opendata.onisep.fr/api/1.0/dataset/5fa586da5c4b6/search
```

**Query Parameters**:
- `size`: Number of results per page (default: 10, max: 100)
- `from`: Offset for pagination
- `q`: Search query (searches in all fields)
- `filters`: JSON filters for faceted search

### Example Requests

#### Search by UAI Code
```bash
curl -X GET "https://api.opendata.onisep.fr/api/1.0/dataset/5fa5816ac6a6e/search?size=10&q=0782568T"
```

#### Get All Lycées in a Region
```bash
curl -X GET "https://api.opendata.onisep.fr/api/1.0/dataset/5fa5816ac6a6e/search?size=100&filters={\"type_detablissement\":[\"lycée général, technologique ou polyvalent\"],\"region\":[\"Ile-de-France\"]}"
```

#### Bulk Download (First 100)
```bash
curl -X GET "https://api.opendata.onisep.fr/api/1.0/dataset/5fa5816ac6a6e/search?size=100"
```

## Data Fields

Each establishment record contains:

### Core Identification
| Field | Description | Example |
|-------|-------------|---------|
| `code_uai` | UAI code (unique identifier) | `"0771654E"` |
| `n_siret` | SIRET number | `"77566214100123"` |
| `nom` | Establishment name | `"BTP CFA Nangis"` |
| `sigle` | Acronym/abbreviation | `"IFMK"` |
| `type_detablissement` | Type of establishment | `"lycée général, technologique ou polyvalent"` |
| `statut` | Status | `"public"`, `"privé"`, `"privé sous contrat"`, `"privé hors contrat"` |
| `tutelle` | Supervising ministry | `"Ministère chargé de l'Éducation nationale"` |

### Location Data
| Field | Description | Example |
|-------|-------------|---------|
| `adresse` | Street address | `"3 bis avenue du Général de Gaulle"` |
| `boite_postale` | PO Box | `"BP 55"` |
| `cp` | Postal code | `"77370"` |
| `commune` | City name | `"Nangis"` |
| `commune_cog` | INSEE code | `"77327"` |
| `cedex` | CEDEX code | `"Cedex 01"` |
| `arrondissement` | District (Paris) | `"13"` |
| `departement` | Department | `"77 - Seine-et-Marne"` |
| `academie` | Academy | `"Créteil"` |
| `region` | Region | `"Ile-de-France"` |
| `region_cog` | Region INSEE code | `"11"` |

### Geographic Coordinates
| Field | Description | Example |
|-------|-------------|---------|
| `longitude_x` | Longitude | `3.01362` |
| `latitude_y` | Latitude | `48.5618` |
| `_geoloc` | Geo object | `{"lat": 48.5618, "lon": 3.01362}` |

### Contact Information
| Field | Description | Example |
|-------|-------------|---------|
| `telephone` | Phone number | `"01 60 58 54 10"` |
| `url_et_id_onisep` | ONISEP page URL | `"https://www.onisep.fr/http/redirection/etablissement/slug/ENS.12339"` |

### Open House Days (JPO)
| Field | Description | Example |
|-------|-------------|---------|
| `journees_portes_ouvertes` | JPO dates and times | `"le 31/01/2026 de 08h30 à 12h00 (post bac en relation avec les lycées du secteur de Belfort) \| le 21/03/2026 de 08h30 à 12h00"` |

**Format**: Multiple dates separated by `|`, with times and optional notes

### University Affiliation (Higher Education)
| Field | Description | Example |
|-------|-------------|---------|
| `universite_de_rattachement_libelle_et_uai` | Parent university name + UAI | `"Université Paris Cité (0755976N)"` |
| `universite_de_rattachement_id_et_url_onisep` | Parent university ONISEP link | `"https://www.onisep.fr/http/redirection/etablissement/slug/ENS.161"` |

### Related Establishments
| Field | Description | Example |
|-------|-------------|---------|
| `etablissements_lies_libelles` | Names of related establishments | Pipe-separated list |
| `etablissements_lies_url_et_id_onisep` | URLs of related establishments | Pipe-separated URLs |

### Metadata
| Field | Description | Example |
|-------|-------------|---------|
| `date_creation` | Record creation date | `"2020-06-06T00:00:00+02:00"` |
| `date_de_modification` | Last modification date | `"2025-11-25T00:00:00+01:00"` |

## Establishment Types (Secondary Education Dataset)

The secondary education dataset (`5fa5816ac6a6e`) provides **25 different establishment types** with 15,266 total establishments:

### Collèges (7,200 establishments)
- **Collège**: 7,200 - Lower secondary education (ages 11-15)

### Lycées - General & Technological (2,581 establishments)
- **Lycée général, technologique ou polyvalent**: 2,581 - Upper secondary with general/tech tracks

### Lycées - Professional (1,244 establishments)
- **Lycée professionnel**: 1,244 - Vocational secondary education

### Apprenticeship & Professional Training (2,225 establishments)
- **Centre de formation d'apprentis (CFA)**: 1,645
- **Maison familiale rurale**: 395
- **Centre de formation professionnelle**: 185

### Agricultural Education (453 establishments)
- **Lycée agricole**: 453 - Agricultural high schools

### Health & Social (645 establishments)
- **École de santé**: 495
- **École du secteur social**: 150

### Specialized Secondary (304 establishments)
- **École de formation sportive**: 166
- **Autre établissement d'enseignement**: 179
- **École de la deuxième chance**: 125
- **Établissement régional d'enseignement adapté (EREA)**: 79
- **École de production**: 66

### Arts & Culture (158 establishments)
- **Conservatoire départemental**: 87
- **Conservatoire régional**: 47
- **École d'art**: 24

### Other (456 establishments)
- **Micro-lycée**: 38
- **CREPS**: 27
- **Établissement scolaire public innovant**: 21
- **Centre de formation de fonctionnaires**: 15
- And more...

## Geographic Distribution (Secondary Education Dataset)

### By Region (Top 10)
1. **Île-de-France**: 2,262 establishments
2. **Auvergne-Rhône-Alpes**: 1,876
3. **Nouvelle-Aquitaine**: 1,486
4. **Hauts-de-France**: 1,355
5. **Occitanie**: 1,341
6. **Grand Est**: 1,212
7. **Provence-Alpes-Côte d'Azur**: 1,098
8. **Pays de la Loire**: 922
9. **Normandie**: 818
10. **Bretagne**: 792

### By Academy (Top 10)
1. **Versailles**: 995
2. **Nantes**: 922
3. **Lille**: 890
4. **Bordeaux**: 831
5. **Normandie**: 818
6. **Créteil**: 815
7. **Rennes**: 792
8. **Grenoble**: 767
9. **Toulouse**: 732
10. **Lyon**: 725

### By Department (Top 10)
1. **59 - Nord**: 573
2. **13 - Bouches-du-Rhône**: 477
3. **75 - Paris**: 452
4. **69 - Rhône**: 414
5. **33 - Gironde**: 339
6. **62 - Pas-de-Calais**: 317
7. **44 - Loire-Atlantique**: 316
8. **93 - Seine-Saint-Denis**: 309
9. **76 - Seine-Maritime**: 294
10. **31 - Haute-Garonne**: 288

## Status Distribution (Secondary Education)

- **Public**: 9,499 (62.2%)
- **Privé sous contrat**: 3,624 (23.7%)
- **Privé**: 1,772 (11.6%)
- **Privé hors contrat**: 371 (2.4%)

## Data Quality & Freshness (Secondary Education Dataset)

### Strengths
✅ **Comprehensive coverage**: 15,266 establishments across France (7,200 collèges, 3,825 lycées)
✅ **Accurate geolocation**: Latitude/longitude for mapping
✅ **Recent updates**: Many records updated in 2024-2025
✅ **Rich metadata**: Type, status, tutelle, contact info
✅ **Languages taught**: Lists all languages available (Allemand, Anglais, Chinois, Espagnol, etc.)
✅ **JPO dates**: Open house dates included when available
✅ **API availability**: Programmatic access via REST API
✅ **Real-time search**: Can search by UAI, name, location, type

### Limitations
⚠️ **Mixed update dates**: Some records from 2020, others from 2025
⚠️ **JPO format**: Unstructured text string, requires parsing (format: "le 29/03/2025 de 09h00 à 12h00")
⚠️ **Missing fields**: Some establishments lack phone/email/JPO dates
⚠️ **No formations detail**: This dataset focuses on establishments, not specific programs (use separate formation datasets)
⚠️ **Some missing UAI**: A few establishments have empty `code_uai` field (use SIRET instead)

## Use Cases for eduInfo

### Current Use
- **Establishment details**: Name, address, type, status
- **Geolocation**: Map display with coordinates
- **JPO dates**: Showing open house information
- **Contact info**: Phone numbers, ONISEP links

### Potential Enhancements
1. **JPO Calendar**: Parse and display upcoming open houses
2. **Establishment Profiles**: Link to detailed ONISEP pages
3. **Higher Ed Links**: Show university affiliations for UFRs/IUTs
4. **Network Visualization**: Display related establishments
5. **Coverage Analysis**: Show which establishments in our DB are in ONISEP

## Integration Strategy

### Option 1: CSV Download ⭐ (Recommended for Initial Load)

**Direct CSV Download URLs:**

#### Secondary Education (15,266 establishments)
```bash
# CSV (8.2 MB)
curl -O "https://api.opendata.onisep.fr/downloads/5fa5816ac6a6e/5fa5816ac6a6e.csv"

# Or get other formats:
# JSON: https://api.opendata.onisep.fr/downloads/5fa5816ac6a6e/5fa5816ac6a6e.json
# Excel: https://api.opendata.onisep.fr/downloads/5fa5816ac6a6e/5fa5816ac6a6e.xlsx
# GeoJSON: https://api.opendata.onisep.fr/downloads/5fa5816ac6a6e/5fa5816ac6a6e.geojson
# ZIP (all formats): https://api.opendata.onisep.fr/downloads/5fa5816ac6a6e/5fa5816ac6a6e.zip
```

#### Higher Education (9,017 establishments)
```bash
# CSV
curl -O "https://api.opendata.onisep.fr/downloads/5fa586da5c4b6/5fa586da5c4b6.csv"
```

**File Information:**
- **Size**: ~8.2 MB (secondary), ~4 MB (higher ed)
- **Last Modified**: January 20, 2026
- **Format**: UTF-8 CSV with headers
- **No authentication required** - Direct download

**Pros**:
- ✅ Full dataset at once (15,266 records)
- ✅ No rate limits
- ✅ Easy to process
- ✅ Can check `Last-Modified` header to detect updates
- ✅ Multiple formats available (CSV, JSON, Excel, GeoJSON)

**Cons**:
- ⚠️ Large file size (8.2 MB)
- ⚠️ Need to re-download entire file for updates
- ⚠️ Manual update detection

### Option 2: API Integration (Good for Real-Time Queries)

Query API programmatically with pagination (max 100 results per request)

**Pros**:
- ✅ Query specific subsets (by region, type, etc.)
- ✅ Real-time data
- ✅ Can query by UAI for individual updates
- ✅ Faceted search capabilities

**Cons**:
- ⚠️ Pagination required for full dataset (153 requests for 15,266 records)
- ⚠️ Slower than bulk download for initial load
- ⚠️ Network overhead

### Option 3: Hybrid Approach ⭐ (Recommended)

**Best practice for eduInfo:**

1. **Initial Import**: Download CSV for bulk load
   ```bash
   curl -O "https://api.opendata.onisep.fr/downloads/5fa5816ac6a6e/5fa5816ac6a6e.csv"
   ```

2. **Update Detection**: Check `Last-Modified` header weekly
   ```bash
   curl -I "https://api.opendata.onisep.fr/downloads/5fa5816ac6a6e/5fa5816ac6a6e.csv"
   ```

3. **Incremental Updates**: When modification detected, query API for changed records
   ```bash
   # Get records modified after last import
   curl "https://api.opendata.onisep.fr/api/1.0/dataset/5fa5816ac6a6e/search?size=100"
   # Filter by date_de_modification in application code
   ```

4. **Individual Lookups**: Use API for real-time UAI lookups
   ```bash
   curl "https://api.opendata.onisep.fr/api/1.0/dataset/5fa5816ac6a6e/search?q=0782568T"
   ```

**Implementation Steps:**
1. Download CSV and import to `onisep_etablissements` table
2. Store `Last-Modified` date in `monitoring.data_sources`
3. Set up weekly cron job to check for updates
4. Re-import CSV when updates detected
5. Track `date_de_modification` to identify changed records

## Database Schema Suggestions

```sql
CREATE TABLE IF NOT EXISTS onisep_etablissements (
  code_uai VARCHAR(8) PRIMARY KEY,
  n_siret VARCHAR(14),
  nom TEXT NOT NULL,
  sigle VARCHAR(50),
  type_detablissement VARCHAR(100),
  statut VARCHAR(50),
  tutelle TEXT,

  -- Location
  adresse TEXT,
  cp VARCHAR(10),
  commune VARCHAR(100),
  commune_cog VARCHAR(10),
  departement VARCHAR(50),
  academie VARCHAR(50),
  region VARCHAR(50),
  region_cog VARCHAR(5),

  -- Coordinates
  longitude DECIMAL(10, 7),
  latitude DECIMAL(10, 7),
  geom GEOMETRY(POINT, 4326), -- PostGIS

  -- Contact
  telephone VARCHAR(20),
  url_onisep TEXT,

  -- JPO
  journees_portes_ouvertes TEXT,

  -- University affiliation
  universite_rattachement_uai VARCHAR(8),
  universite_rattachement_nom TEXT,

  -- Metadata
  date_creation TIMESTAMP,
  date_modification TIMESTAMP,
  last_synced TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_onisep_type ON onisep_etablissements(type_detablissement);
CREATE INDEX idx_onisep_statut ON onisep_etablissements(statut);
CREATE INDEX idx_onisep_academie ON onisep_etablissements(academie);
CREATE INDEX idx_onisep_commune_cog ON onisep_etablissements(commune_cog);
CREATE INDEX idx_onisep_geom ON onisep_etablissements USING GIST(geom);
```

## Practical Implementation Examples

### Download Script (Node.js)

```javascript
const fs = require('fs');
const https = require('https');

async function downloadOnisepCSV() {
    const url = 'https://api.opendata.onisep.fr/downloads/5fa5816ac6a6e/5fa5816ac6a6e.csv';
    const outputPath = './data/onisep_secondary_education.csv';

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);
        https.get(url, (response) => {
            const lastModified = response.headers['last-modified'];
            console.log(`Downloading ONISEP data (Last Modified: ${lastModified})...`);
            console.log(`File size: ${(response.headers['content-length'] / 1024 / 1024).toFixed(2)} MB`);

            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log('Download complete!');
                resolve({ path: outputPath, lastModified });
            });
        }).on('error', (err) => {
            fs.unlink(outputPath, () => {});
            reject(err);
        });
    });
}

// Usage
downloadOnisepCSV()
    .then(result => console.log(`Saved to: ${result.path}`))
    .catch(err => console.error('Download failed:', err));
```

### Check for Updates

```javascript
const https = require('https');

async function checkOnisepUpdates(lastKnownModified) {
    const url = 'https://api.opendata.onisep.fr/downloads/5fa5816ac6a6e/5fa5816ac6a6e.csv';

    return new Promise((resolve, reject) => {
        https.request(url, { method: 'HEAD' }, (response) => {
            const lastModified = new Date(response.headers['last-modified']);
            const known = new Date(lastKnownModified);

            resolve({
                hasUpdate: lastModified > known,
                lastModified: response.headers['last-modified'],
                fileSize: response.headers['content-length']
            });
        }).on('error', reject).end();
    });
}

// Usage
checkOnisepUpdates('2026-01-20T13:05:21Z')
    .then(result => {
        if (result.hasUpdate) {
            console.log('New data available! Download and re-import.');
        } else {
            console.log('Data is up to date.');
        }
    });
```

### Parse CSV and Import

```javascript
const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    database: 'eduinfo',
    user: 'your_user',
    password: 'your_password'
});

async function importOnisepCSV(filePath) {
    const results = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            results.push({
                code_uai: row.code_uai,
                n_siret: row.n_siret,
                nom: row.nom,
                type_etablissement: row.type_detablissement,
                statut: row.statut,
                adresse: row.adresse,
                cp: row.cp,
                commune: row.commune,
                commune_cog: row.commune_cog,
                departement: row.departement,
                academie: row.academie,
                region: row.region,
                longitude: parseFloat(row.longitude_x) || null,
                latitude: parseFloat(row.latitude_y) || null,
                telephone: row.telephone,
                url_onisep: row.url_et_id_onisep,
                journees_portes_ouvertes: row.journees_portes_ouvertes,
                langues_enseignees: row.langues_enseignees,
                date_creation: row.date_creation,
                date_modification: row.date_de_modification
            });
        })
        .on('end', async () => {
            console.log(`Parsed ${results.length} establishments`);

            // Bulk insert (use ON CONFLICT for upsert)
            for (const record of results) {
                await pool.query(`
                    INSERT INTO onisep_etablissements
                    (code_uai, n_siret, nom, type_etablissement, statut, adresse, cp, commune,
                     commune_cog, departement, academie, region, longitude, latitude, telephone,
                     url_onisep, journees_portes_ouvertes, langues_enseignees,
                     date_creation, date_modification, last_synced)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW())
                    ON CONFLICT (code_uai) DO UPDATE SET
                        nom = EXCLUDED.nom,
                        type_etablissement = EXCLUDED.type_etablissement,
                        statut = EXCLUDED.statut,
                        adresse = EXCLUDED.adresse,
                        telephone = EXCLUDED.telephone,
                        date_modification = EXCLUDED.date_modification,
                        last_synced = NOW()
                `, [
                    record.code_uai, record.n_siret, record.nom, record.type_etablissement,
                    record.statut, record.adresse, record.cp, record.commune, record.commune_cog,
                    record.departement, record.academie, record.region, record.longitude,
                    record.latitude, record.telephone, record.url_onisep,
                    record.journees_portes_ouvertes, record.langues_enseignees,
                    record.date_creation, record.date_modification
                ]);
            }

            console.log('Import complete!');
            await pool.end();
        });
}

// Usage
importOnisepCSV('./data/onisep_secondary_education.csv');
```

## Next Steps

1. ✅ **Document API structure** (this file)
2. ⬜ **Write import script** (see examples above)
3. ⬜ **Create database table** (see schema below)
4. ⬜ **Download and import CSV** (8.2 MB, ~15,266 records)
5. ⬜ **Set up monitoring** (weekly Last-Modified checks)
6. ⬜ **Link to existing data** (match UAI codes with geodata_lycees)
7. ⬜ **Display on frontend** (establishment profiles with ONISEP data)

## References

- **ONISEP Open Data Portal**: https://opendata.onisep.fr/
- **API Documentation**: https://api.opendata.onisep.fr/
- **Dataset Page**: https://opendata.onisep.fr/data/5fa586da5c4b6/
