# israel-vehicle-open-data

[![npm version](https://img.shields.io/npm/v/israel-vehicle-open-data)](https://www.npmjs.com/package/israel-vehicle-open-data)
[![npm downloads/month](https://img.shields.io/npm/dm/israel-vehicle-open-data)](https://www.npmjs.com/package/israel-vehicle-open-data)
[![npm downloads total](https://img.shields.io/npm/dt/israel-vehicle-open-data)](https://www.npmjs.com/package/israel-vehicle-open-data)
[![CI](https://github.com/NirTatcher/israel-vehicle-open-data/actions/workflows/ci.yml/badge.svg)](https://github.com/NirTatcher/israel-vehicle-open-data/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/NirTatcher/israel-vehicle-open-data?style=social)](https://github.com/NirTatcher/israel-vehicle-open-data/stargazers)
[![repo views](https://komarev.com/ghpvc/?username=NirTatcher&repo=israel-vehicle-open-data&label=views&color=0e75b6)](https://github.com/NirTatcher/israel-vehicle-open-data)

JavaScript/TypeScript library for querying Israeli vehicle datasets on [data.gov.il](https://data.gov.il) via CKAN [`datastore_search`](https://data.gov.il/api/3/action/datastore_search). Ships typed responses, resource IDs, and query helpers for common lookups.

> **Disclaimer:** Unofficial community library — not affiliated with Israel's Ministry of Transport. Data may be incomplete or delayed. Does **not** cover stolen-vehicle status, insurance, liens, or non-public records.

## Install

```bash
npm install israel-vehicle-open-data
```

Requires **Node.js 18+** (uses native `fetch`).

Package: [npmjs.com/package/israel-vehicle-open-data](https://www.npmjs.com/package/israel-vehicle-open-data) · Source: [github.com/NirTatcher/israel-vehicle-open-data](https://github.com/NirTatcher/israel-vehicle-open-data)

## Used by

- **[Car check](https://car-check-il.netlify.app/)** — open-source Israeli license plate lookup ([source](https://github.com/NirTatcher/car-check))

If this package helps you, consider **[giving the repo a star](https://github.com/NirTatcher/israel-vehicle-open-data/stargazers)** — it helps others discover it.

## JavaScript & TypeScript

Works in **plain JavaScript and TypeScript**. Types are included — no `@types/...` package needed.

| Environment | Support |
|-------------|---------|
| Node.js (ESM) | `import { … } from 'israel-vehicle-open-data'` |
| Node.js (CommonJS) | `const { … } = require('israel-vehicle-open-data')` |
| Bundlers (Vite, webpack, etc.) | ESM import in `.js` or `.ts` files |
| Browser `<script>` without bundler | Not supported (no IIFE build) |

## Quick start

**ESM (Node or bundler):**

```js
import { searchActivePrivateByPlate } from 'israel-vehicle-open-data'

const response = await searchActivePrivateByPlate(3300421)

if (!response.success) {
  console.error(response.error)
} else {
  const record = response.result?.records[0]
  console.log(record?.tozeret_nm, record?.degem_nm)
}
```

**CommonJS (Node):**

```js
const { searchActivePrivateByPlate } = require('israel-vehicle-open-data')

searchActivePrivateByPlate(3300421).then((response) => {
  if (response.success) {
    console.log(response.result?.records[0])
  }
})
```

Pass an optional `AbortSignal` as the last argument on any query to cancel in-flight requests.

## How it works

Responses match the official CKAN JSON shape (`success`, `result`, `error`). The library does not retry failed requests, throw on `success: false`, or unwrap records — you handle the envelope the same way you would with a direct API call.

### Core API

| Export | Description |
|--------|-------------|
| `datastoreSearch(params, signal?)` | Any `datastore_search` call → `DatastoreSearchResponse<T>` |
| `buildDatastoreSearchUrl(params)` | URL builder (encodes `filters` once — do not pre-encode JSON) |
| `DATASTORE_SEARCH_URL` | Base CKAN endpoint URL |
| `RESOURCES` | Known dataset resource IDs |

### Query helpers

Each helper pre-fills `resource_id` and common `filters`, and returns the same CKAN envelope as `datastoreSearch`.

| Function | Filter key(s) | Notes |
|----------|---------------|-------|
| `searchActivePrivate(opts?)` | custom | Paginate active private registry |
| `searchActivePrivateByPlate(plate)` | `mispar_rechev` | Main plate lookup |
| `searchActivePrivateByModel({ tozeret_cd, degem_cd })` | model codes | `limit: 0` (count) |
| `searchActivePrivateByModelYear({ …, shnat_yitzur })` | model + year | `limit: 0` (count) |
| `searchPublicVehicleByPlate(plate)` | `mispar_rechev` | Public / gov vehicles |
| `searchPersonalImportByPlate(plate)` | `mispar_rechev` | Personal import |
| `searchInactiveWithModelByPlate(plate)` | `mispar_rechev` | Inactive, with model |
| `searchInactiveWithoutModelByPlate(plate)` | `mispar_rechev` | Inactive, without model |
| `searchFinalCancelByPlate(plate)` | `mispar_rechev` | Final cancellation |
| `searchHagbalatRecallByPlate(plate)` | `MISPAR_RECHEV` | Outstanding recalls (uppercase field) |
| `searchRecallCatalogByRecallId(recallId)` | `RECALL_ID` | Recall campaign catalog |
| `searchWltpByModel({ tozeret_cd, degem_cd, … })` | model codes | WLTP / specs |
| `searchPrivateHistoryMileageByPlate(plate)` | `mispar_rechev` | Last reported mileage |
| `searchPrivateOwnershipByPlate(plate)` | `mispar_rechev` | Ownership history, newest first |
| `searchDisabledParkingPermitByPlate(plate)` | `"MISPAR RECHEV"` | Space in field name |

Custom query example:

```js
import { datastoreSearch, RESOURCES } from 'israel-vehicle-open-data'

await datastoreSearch({
  resource_id: RESOURCES.activePrivate,
  filters: JSON.stringify({ mispar_rechev: 3300421 }),
  limit: 1,
})
```

## Datasets (`RESOURCES`)

Each `RESOURCES` key maps to a CKAN `resource_id`. Links point to the dataset page on data.gov.il (Ministry of Transport).

| Key | `resource_id` | Dataset on data.gov.il |
|-----|---------------|------------------------|
| `activePrivate` | `053cea08-09bc-40ec-8f7a-156f0677aff3` | [private-and-commercial-vehicles](https://data.gov.il/he/datasets/ministry_of_transport/private-and-commercial-vehicles) |
| `publicVehicles` | `cf29862d-ca25-4691-84f6-1be60dcb4a1e` | [kli_rechev_ciburiim](https://data.gov.il/he/datasets/ministry_of_transport/kli_rechev_ciburiim) |
| `personalImport` | `03adc637-b6fe-402b-9937-7c3d3afc9140` | [personal_import_vehicles](https://data.gov.il/he/datasets/ministry_of_transport/personal_import_vehicles) |
| `inactiveWithModel` | `f6efe89a-fb3d-43a4-bb61-9bf12a9b9099` | [rechev_le_pail_with_degem](https://data.gov.il/he/datasets/ministry_of_transport/rechev_le_pail_with_degem) |
| `inactiveWithoutModel` | `6f6acd03-f351-4a8f-8ecf-df792f4f573a` | [rechev_le_pail_without-degem](https://data.gov.il/he/datasets/ministry_of_transport/rechev_le_pail_without-degem) |
| `finalCancel` | `851ecab1-0622-4dbe-a6c7-f950cf82abf9` | [reshev_bitul_sofi](https://data.gov.il/he/datasets/ministry_of_transport/reshev_bitul_sofi) |
| `disabledParkingPermit` | `c8b9f9c8-4612-4068-934f-d4acd2e3c06e` | [rechev-tag-nachim](https://data.gov.il/he/datasets/ministry_of_transport/rechev-tag-nachim) |
| `hagbalatRecall` | `36bf1404-0be4-49d2-82dc-2f1ead4a8b93` | [hagbalat_recall](https://data.gov.il/he/datasets/ministry_of_transport/hagbalat_recall) |
| `recallCatalog` | `2c33523f-87aa-44ec-a736-edbb0a82975e` | [recall](https://data.gov.il/he/datasets/ministry_of_transport/recall) |
| `wltp` | `142afde2-6228-49f9-8a29-9b6c3a0cbe40` | [degem-rechev-wltp](https://data.gov.il/he/datasets/ministry_of_transport/degem-rechev-wltp) |
| `privateHistoryMileage` | `56063a99-8a3e-4ff4-912e-5966c0279bad` | [shinui_mivne](https://data.gov.il/he/datasets/ministry_of_transport/shinui_mivne) (mileage resource) |
| `privateOwnership` | `bb2355dc-9ec7-4f06-9c3f-3344672171da` | [shinui_mivne](https://data.gov.il/he/datasets/ministry_of_transport/shinui_mivne) (ownership resource) |

## Related links

- [data.gov.il](https://data.gov.il) — Israeli open data portal
- [CKAN `datastore_search` API](https://data.gov.il/api/3/action/datastore_search)
- [Car check](https://car-check-il.netlify.app/) — demo app using this library

## Development

```bash
npm install
npm test
npm run build
npm run typecheck
npm run lint
```

### Live smoke test

```bash
npm run build
node --input-type=module -e "
import { searchActivePrivateByPlate } from './dist/index.js'
const r = await searchActivePrivateByPlate(3300421)
console.log(r.success, r.result?.records[0]?.tozeret_nm)
"
```

## License

MIT
