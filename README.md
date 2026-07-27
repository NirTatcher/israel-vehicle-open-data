# israel-vehicle-open-data

JavaScript/TypeScript library for querying Israeli vehicle datasets on [data.gov.il](https://data.gov.il) via CKAN `datastore_search`. Ships typed responses, resource IDs, and query helpers for common lookups.

> **Disclaimer:** Unofficial community library — not affiliated with Israel's Ministry of Transport. Data may be incomplete or delayed. Does **not** cover stolen-vehicle status, insurance, liens, or non-public records.

## Install

```bash
npm install israel-vehicle-open-data
```

Requires **Node.js 18+** (uses native `fetch`).

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

## Resource IDs (`RESOURCES`)

| Key | Purpose |
|-----|---------|
| `activePrivate` | Active private vehicle registry |
| `publicVehicles` | Public / government vehicles |
| `personalImport` | Personal import registry |
| `inactiveWithModel` / `inactiveWithoutModel` | Inactive vehicles |
| `finalCancel` | Final cancellation |
| `hagbalatRecall` | Outstanding safety recalls by plate |
| `recallCatalog` | RECALL campaign catalog |
| `wltp` | WLTP / technical specs |
| `privateHistoryMileage` | Last reported mileage |
| `privateOwnership` | Ownership history |
| `disabledParkingPermit` | Disabled parking permit tag |

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
