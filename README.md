# israel-vehicle-open-data

[![npm version](https://img.shields.io/npm/v/israel-vehicle-open-data)](https://www.npmjs.com/package/israel-vehicle-open-data)

![npm](https://img.shields.io/npm/dw/israel-vehicle-open-data) &nbsp;&nbsp; ![npm](https://img.shields.io/npm/dm/israel-vehicle-open-data) &nbsp;&nbsp; ![npm](https://img.shields.io/npm/dy/israel-vehicle-open-data)

[![CI](https://github.com/NirTatcher/israel-vehicle-open-data/actions/workflows/ci.yml/badge.svg)](https://github.com/NirTatcher/israel-vehicle-open-data/actions/workflows/ci.yml) &nbsp;&nbsp; [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) &nbsp;&nbsp; [![GitHub stars](https://img.shields.io/github/stars/NirTatcher/israel-vehicle-open-data?style=social)](https://github.com/NirTatcher/israel-vehicle-open-data/stargazers)

JavaScript/TypeScript library for querying Israeli vehicle datasets on [data.gov.il](https://data.gov.il) via CKAN [`datastore_search`](https://data.gov.il/api/3/action/datastore_search). Ships typed responses, resource IDs, and query helpers for common lookups.

> **Disclaimer:** Unofficial community library — not affiliated with Israel's Ministry of Transport. Data may be incomplete or delayed. Does **not** cover stolen-vehicle status, insurance, liens, or non-public records.

## Install

```bash
npm install israel-vehicle-open-data
```

Requires **Node.js 18+** (uses native `fetch`).

Package: [npmjs.com/package/israel-vehicle-open-data](https://www.npmjs.com/package/israel-vehicle-open-data) · Source: [github.com/NirTatcher/israel-vehicle-open-data](https://github.com/NirTatcher/israel-vehicle-open-data)

## Example

**[Car check](https://car-check-il.netlify.app/)** — a live license plate lookup showing what you can build with this library (registry, recalls, mileage, ownership, and more).

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

## Full plate lookup (all datasets)

There is no single API call for “everything about a car”. A full lookup (as used by [Car check](https://car-check-il.netlify.app/)) typically:

1. **Resolve the vehicle** — try active private registry first; if empty, check public / government fleet → personal import → inactive → final cancel (in parallel). **Motorcycles and scooters** use a separate active registry — call `searchTwoWheelersByPlate` when you expect a two-wheeler (not mixed into the car fallback chain).
2. **By plate (always)** — outstanding recalls (`searchHagbalatRecallByPlate`).
3. **By plate (when a record exists)** — disabled parking permit, mileage history, ownership history.
4. **By model codes from the record** (`tozeret_cd`, `degem_cd`, optional `shnat_yitzur`, `sug_degem`) — WLTP specs, model popularity counts.
5. **By recall IDs** — for each hagbalat row, fetch recall catalog details (`searchRecallCatalogByRecallId`).

```js
import {
  searchActivePrivateByPlate,
  searchPublicVehicleByPlate,
  searchPersonalImportByPlate,
  searchInactiveWithModelByPlate,
  searchInactiveWithoutModelByPlate,
  searchFinalCancelByPlate,
  searchHagbalatRecallByPlate,
  searchDisabledParkingPermitByPlate,
  searchPrivateHistoryMileageByPlate,
  searchPrivateOwnershipByPlate,
  searchWltpByModel,
  searchActivePrivateByModel,
  searchActivePrivateByModelYear,
  searchRecallCatalogByRecallId,
  searchTwoWheelersByPlate,
} from 'israel-vehicle-open-data'

const plate = 3300421

function first(response) {
  return response.success && response.result?.records[0]
    ? response.result.records[0]
    : null
}

// 1. Resolve registry (simplified — see example script for full priority logic)
let vehicle = first(await searchActivePrivateByPlate(plate))
let source = vehicle ? 'active-private' : null

if (!vehicle) {
  const [pub, imp, inM, inNo, fin] = await Promise.all([
    searchPublicVehicleByPlate(plate).then(first),
    searchPersonalImportByPlate(plate).then(first),
    searchInactiveWithModelByPlate(plate).then(first),
    searchInactiveWithoutModelByPlate(plate).then(first),
    searchFinalCancelByPlate(plate).then(first),
  ])
  if (pub) { vehicle = pub; source = 'public' }
  else if (imp) { vehicle = imp; source = 'personal-import' }
  else if (inM) { vehicle = inM; source = 'inactive-with-model' }
  else if (inNo) { vehicle = inNo; source = 'inactive-without-model' }
  else if (fin) { vehicle = fin; source = 'inactive-final-cancel' }
}

// 2. Recalls by plate (always)
const hagbalat = await searchHagbalatRecallByPlate(plate)
const recallRows = hagbalat.success ? hagbalat.result.records : []

let disabledPermit = null
let mileage = null
let ownership = []
let wltp = null
let modelTotal = null
let modelYearTotal = null

if (vehicle) {
  const { tozeret_cd, degem_cd, shnat_yitzur, sug_degem } = vehicle

  ;[disabledPermit, mileage, ownership] = await Promise.all([
    searchDisabledParkingPermitByPlate(plate).then(first),
    searchPrivateHistoryMileageByPlate(plate).then(first),
    searchPrivateOwnershipByPlate(plate).then((r) =>
      r.success ? r.result.records : [],
    ),
  ])

  if (typeof tozeret_cd === 'number' && typeof degem_cd === 'number') {
    const [wltpRes, countRes, yearRes] = await Promise.all([
      searchWltpByModel({
        tozeret_cd,
        degem_cd,
        shnat_yitzur: typeof shnat_yitzur === 'number' ? shnat_yitzur : undefined,
        sug_degem: typeof sug_degem === 'string' ? sug_degem : undefined,
      }),
      searchActivePrivateByModel({ tozeret_cd, degem_cd }),
      typeof shnat_yitzur === 'number'
        ? searchActivePrivateByModelYear({ tozeret_cd, degem_cd, shnat_yitzur })
        : Promise.resolve(null),
    ])
    wltp = first(wltpRes)
    modelTotal = countRes.success ? countRes.result.total : null
    modelYearTotal = yearRes?.success ? yearRes.result.total : null
  }
}

// 3. Recall catalog for each outstanding recall
const recallCatalog = await Promise.all(
  recallRows.map((row) =>
    searchRecallCatalogByRecallId(row.RECALL_ID).then(first),
  ),
)

console.log({
  plate,
  source,
  vehicle,
  recallRows,
  recallCatalog: recallCatalog.filter(Boolean),
  disabledPermit,
  mileage,
  ownership,
  wltp,
  modelTotal,
  modelYearTotal,
})
```

**Runnable script:** [`examples/full-plate-lookup.mjs`](examples/full-plate-lookup.mjs)

```bash
npm run build
node examples/full-plate-lookup.mjs 3300421
```

Each response is a CKAN envelope — check `response.success` before reading `response.result`. The example script prints aggregated JSON for debugging.

## What's included

The library wraps **13 CKAN resources** on data.gov.il (Ministry of Transport vehicle datasets). Each has a key on `RESOURCES`, typed records where applicable, and one or more query helpers.

| Group | `RESOURCES` key | Plate lookup helper | Notes |
|-------|-----------------|---------------------|-------|
| **Active — private & commercial cars** | `activePrivate` | `searchActivePrivateByPlate` | Main registry (~4M vehicles). Also `searchActivePrivate`, model count helpers. |
| **Active — public / government fleet** | `publicVehicles` | `searchPublicVehicleByPlate` | Buses, taxis, municipal & gov vehicles (כלי רכב ציבוריים). |
| **Active — two-wheelers** | `twoWheelers` | `searchTwoWheelersByPlate` | Motorcycles, scooters, trikes (דו-גלגליים). Separate registry from cars. |
| **Active — personal import** | `personalImport` | `searchPersonalImportByPlate` | Personally imported vehicles still on the road. |
| **Inactive — with model code** | `inactiveWithModel` | `searchInactiveWithModelByPlate` | Off-road / deregistered, includes `degem_cd`. |
| **Inactive — without model code** | `inactiveWithoutModel` | `searchInactiveWithoutModelByPlate` | Off-road, sparse model fields. |
| **Inactive — final cancellation** | `finalCancel` | `searchFinalCancelByPlate` | Plate-only rows (minimal fields). |
| **Specs / WLTP** | `wltp` | — | `searchWltpByModel({ tozeret_cd, degem_cd, … })` |
| **History — mileage** | `privateHistoryMileage` | `searchPrivateHistoryMileageByPlate` | Last reported odometer reading. |
| **History — ownership** | `privateOwnership` | `searchPrivateOwnershipByPlate` | Ownership changes, newest first (`limit: 100`). |
| **Recalls — outstanding** | `hagbalatRecall` | `searchHagbalatRecallByPlate` | Filter field `MISPAR_RECHEV` (uppercase). |
| **Recalls — catalog** | `recallCatalog` | — | `searchRecallCatalogByRecallId(recallId)` |
| **Permits — disabled parking** | `disabledParkingPermit` | `searchDisabledParkingPermitByPlate` | Filter key `"MISPAR RECHEV"` (with space). |

For **batch scans** (stats, exports), use `paginateDatastore(resource_id, opts)` or the wrappers `paginateActivePrivate` / `paginateTwoWheelers`. Any resource can be paginated — only those two have convenience wrappers today.

## How it works

Responses match the official CKAN JSON shape (`success`, `result`, `error`). The library does not retry failed requests, throw on `success: false`, or unwrap records — you handle the envelope the same way you would with a direct API call.

### Core API

| Export | Description |
|--------|-------------|
| `datastoreSearch(params, signal?)` | Any `datastore_search` call → `DatastoreSearchResponse<T>`. Params: `resource_id`, `offset`, `limit`, `filters`, `sort`, `q`, **`fields`**. |
| `buildDatastoreSearchUrl(params)` | URL builder (encodes `filters` once — do not pre-encode JSON) |
| `paginateDatastore(resource_id, opts?)` | Async generator over CKAN pages. Throws if `success: false`. |
| `paginateActivePrivate(opts?)` | `paginateDatastore` for `RESOURCES.activePrivate` → `CarRecord` pages |
| `paginateTwoWheelers(opts?)` | `paginateDatastore` for `RESOURCES.twoWheelers` → `TwoWheelerRecord` pages |
| `DATASTORE_SEARCH_URL` | Base CKAN endpoint URL |
| `RESOURCES` | Known dataset resource IDs (`ResourceKey` type) |

**Pagination options** (`PaginateDatastoreOpts`):

| Option | CKAN param | Default | Description |
|--------|------------|---------|-------------|
| `limit` | `limit` | `1000` | Records per page |
| `fields` | `fields` | — | Comma-separated columns (smaller payloads; must match resource schema) |
| `filters` | `filters` | — | JSON filter string |
| `sort` | `sort` | — | Sort expression |
| `q` | `q` | — | Full-text query |
| `maxPages` | — | unlimited | Stop after N pages (tests / partial scans) |
| `signal` | — | — | `AbortSignal` to cancel |

Each yielded **`PaginatePage<T>`**: `{ records, offset, total, pageIndex }`.

### Query helpers

Each helper pre-fills `resource_id` and common `filters`, and returns the same CKAN envelope as `datastoreSearch`. Optional **`AbortSignal`** as the last argument on all helpers.

#### Active registries

| Function | Filter key(s) | Notes |
|----------|---------------|-------|
| `searchActivePrivate(opts?)` | custom | Low-level search on active private registry (`offset`, `limit`, `filters`, …) |
| `searchActivePrivateByPlate(plate)` | `mispar_rechev` | Main car/truck plate lookup |
| `searchActivePrivateByModel({ tozeret_cd, degem_cd })` | model codes | `limit: 0` (count only) |
| `searchActivePrivateByModelYear({ …, shnat_yitzur })` | model + year | `limit: 0` (count only) |
| `searchPublicVehicleByPlate(plate)` | `mispar_rechev` | Public / government fleet (buses, taxis, municipal) |
| `searchTwoWheelersByPlate(plate)` | `mispar_rechev` | Motorcycles, scooters, trikes |
| `searchPersonalImportByPlate(plate)` | `mispar_rechev` | Personal import vehicles |

#### Inactive / historical registries

| Function | Filter key(s) | Notes |
|----------|---------------|-------|
| `searchInactiveWithModelByPlate(plate)` | `mispar_rechev` | Inactive, with model code |
| `searchInactiveWithoutModelByPlate(plate)` | `mispar_rechev` | Inactive, without model code |
| `searchFinalCancelByPlate(plate)` | `mispar_rechev` | Final cancellation (plate-only rows) |

#### Enrichment & specs

| Function | Filter key(s) | Notes |
|----------|---------------|-------|
| `searchWltpByModel({ tozeret_cd, degem_cd, … })` | model codes | WLTP / technical specs (optional year, trim) |
| `searchPrivateHistoryMileageByPlate(plate)` | `mispar_rechev` | Last reported mileage |
| `searchPrivateOwnershipByPlate(plate)` | `mispar_rechev` | Ownership history, newest first (`limit: 100`) |

#### Recalls & permits

| Function | Filter key(s) | Notes |
|----------|---------------|-------|
| `searchHagbalatRecallByPlate(plate)` | `MISPAR_RECHEV` | Outstanding recalls (uppercase field) |
| `searchRecallCatalogByRecallId(recallId)` | `RECALL_ID` | Recall campaign catalog entry |
| `searchDisabledParkingPermitByPlate(plate)` | `"MISPAR RECHEV"` | Disabled parking permit (space in field name) |

Custom query example:

```js
import { datastoreSearch, RESOURCES } from 'israel-vehicle-open-data'

await datastoreSearch({
  resource_id: RESOURCES.activePrivate,
  filters: JSON.stringify({ mispar_rechev: 3300421 }),
  limit: 1,
})
```

Slimmer payloads with **`fields`** (only request columns that exist on that resource):

```js
await datastoreSearch({
  resource_id: RESOURCES.twoWheelers,
  limit: 1,
  fields: 'mispar_rechev,tozeret_nm,degem_nm,shnat_yitzur,sug_rechev_nm',
})
```

Scan an entire registry (e.g. for batch stats):

```js
import { paginateActivePrivate, paginateTwoWheelers } from 'israel-vehicle-open-data'

// Cars — large page size for fewer round trips
for await (const page of paginateActivePrivate({ limit: 32_000, fields: 'tozeret_cd,degem_cd,…' })) {
  console.log(page.pageIndex, page.records.length, page.total)
}

// Two-wheelers — note: no degem_cd on this resource; use degem_nm for display
for await (const page of paginateTwoWheelers({ limit: 32_000 })) {
  // aggregate …
}
```

### TypeScript types

All record types are exported from the package root (`import type { CarRecord, … } from 'israel-vehicle-open-data'`):

| Type | Dataset |
|------|---------|
| `CarRecord` | Active private / commercial |
| `PublicVehicleRecord` | Public / government fleet |
| `TwoWheelerRecord` | Active two-wheelers |
| `PersonalImportVehicleRecord` | Personal import |
| `InactiveVehicleWithModelRecord` | Inactive (with model) |
| `InactiveVehicleWithoutModelRecord` | Inactive (without model) |
| `FinalCancelVehicleRecord` | Final cancellation |
| `WltpSpecRecord` | WLTP specs |
| `PrivateVehicleHistoryMileageRecord` | Mileage history |
| `PrivateVehicleOwnershipRecord` | Ownership history |
| `HagbalatRecallRecord` | Outstanding recalls |
| `RecallCatalogRecord` | Recall catalog |
| `DisabledParkingPermitRecord` | Disabled parking permit |
| `DatastoreSearchResponse<T>` | CKAN envelope wrapper |

Also: `DatastoreSearchParams`, `PaginateDatastoreOpts`, `PaginatePage<T>`, `ResourceKey`.

## Datasets (`RESOURCES`)

Each `RESOURCES` key maps to a CKAN `resource_id`. Links point to the dataset page on data.gov.il (Ministry of Transport).

| Key | Registry | `resource_id` | Dataset on data.gov.il |
|-----|----------|---------------|------------------------|
| `activePrivate` | Private & commercial vehicles (active) | `053cea08-09bc-40ec-8f7a-156f0677aff3` | [private-and-commercial-vehicles](https://data.gov.il/he/datasets/ministry_of_transport/private-and-commercial-vehicles) |
| `publicVehicles` | Public / government fleet (buses, taxis, municipal) | `cf29862d-ca25-4691-84f6-1be60dcb4a1e` | [kli_rechev_ciburiim](https://data.gov.il/he/datasets/ministry_of_transport/kli_rechev_ciburiim) |
| `twoWheelers` | Motorcycles, scooters, trikes (active) | `bf9df4e2-d90d-4c0a-a400-19e15af8e95f` | [two-wheeled vehicles](https://data.gov.il/he/datasets/ministry_of_transport/two-wheeled-vehicles) |
| `personalImport` | Personal import (active) | `03adc637-b6fe-402b-9937-7c3d3afc9140` | [personal_import_vehicles](https://data.gov.il/he/datasets/ministry_of_transport/personal_import_vehicles) |
| `inactiveWithModel` | Inactive — with model code | `f6efe89a-fb3d-43a4-bb61-9bf12a9b9099` | [rechev_le_pail_with_degem](https://data.gov.il/he/datasets/ministry_of_transport/rechev_le_pail_with_degem) |
| `inactiveWithoutModel` | Inactive — without model code | `6f6acd03-f351-4a8f-8ecf-df792f4f573a` | [rechev_le_pail_without-degem](https://data.gov.il/he/datasets/ministry_of_transport/rechev_le_pail_without-degem) |
| `finalCancel` | Final cancellation | `851ecab1-0622-4dbe-a6c7-f950cf82abf9` | [reshev_bitul_sofi](https://data.gov.il/he/datasets/ministry_of_transport/reshev_bitul_sofi) |
| `disabledParkingPermit` | Disabled parking permit | `c8b9f9c8-4612-4068-934f-d4acd2e3c06e` | [rechev-tag-nachim](https://data.gov.il/he/datasets/ministry_of_transport/rechev-tag-nachim) |
| `hagbalatRecall` | Outstanding recall compliance | `36bf1404-0be4-49d2-82dc-2f1ead4a8b93` | [hagbalat_recall](https://data.gov.il/he/datasets/ministry_of_transport/hagbalat_recall) |
| `recallCatalog` | Recall campaign catalog | `2c33523f-87aa-44ec-a736-edbb0a82975e` | [recall](https://data.gov.il/he/datasets/ministry_of_transport/recall) |
| `wltp` | WLTP / model specs | `142afde2-6228-49f9-8a29-9b6c3a0cbe40` | [degem-rechev-wltp](https://data.gov.il/he/datasets/ministry_of_transport/degem-rechev-wltp) |
| `privateHistoryMileage` | Mileage history | `56063a99-8a3e-4ff4-912e-5966c0279bad` | [shinui_mivne](https://data.gov.il/he/datasets/ministry_of_transport/shinui_mivne) (mileage resource) |
| `privateOwnership` | Ownership history | `bb2355dc-9ec7-4f06-9c3f-3344672171da` | [shinui_mivne](https://data.gov.il/he/datasets/ministry_of_transport/shinui_mivne) (ownership resource) |

## Related links

- [data.gov.il](https://data.gov.il) — Israeli open data portal
- [CKAN `datastore_search` API](https://data.gov.il/api/3/action/datastore_search)
- [Car check](https://car-check-il.netlify.app/) — live example built with this library

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
