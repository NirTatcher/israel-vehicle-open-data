/**
 * Full plate lookup — fetches all datasets this library supports for one plate.
 *
 * Run (from repo root, after npm install && npm run build):
 *   node examples/full-plate-lookup.mjs 3300421
 *
 * This mirrors the flow used by https://car-check-il.netlify.app/ but returns
 * raw CKAN envelopes (check `.success` on each response).
 */
import {
  searchActivePrivateByPlate,
  searchDisabledParkingPermitByPlate,
  searchFinalCancelByPlate,
  searchHagbalatRecallByPlate,
  searchInactiveWithModelByPlate,
  searchInactiveWithoutModelByPlate,
  searchPersonalImportByPlate,
  searchPrivateHistoryMileageByPlate,
  searchPrivateOwnershipByPlate,
  searchPublicVehicleByPlate,
  searchRecallCatalogByRecallId,
  searchWltpByModel,
  searchActivePrivateByModel,
  searchActivePrivateByModelYear,
} from '../dist/index.js'

const plate = Number(process.argv[2] ?? 3300421)
if (!Number.isFinite(plate) || plate <= 0) {
  console.error('Usage: node examples/full-plate-lookup.mjs <plate>')
  process.exit(1)
}

function firstRecord(response) {
  if (!response.success || !response.result?.records?.length) return null
  return response.result.records[0]
}

function records(response) {
  if (!response.success || !response.result) return []
  return response.result.records
}

function total(response) {
  if (!response.success || !response.result) return null
  return typeof response.result.total === 'number' ? response.result.total : null
}

/** Pick best registry match (same priority as Car check). */
async function resolveVehicle(plateNumber, signal) {
  const active = firstRecord(await searchActivePrivateByPlate(plateNumber, signal))
  if (active) {
    return { source: 'active-private', record: active, fallbacks: {} }
  }

  const [pub, personal, inWith, inWithout, finalCancel] = await Promise.all([
    searchPublicVehicleByPlate(plateNumber, signal).then(firstRecord),
    searchPersonalImportByPlate(plateNumber, signal).then(firstRecord),
    searchInactiveWithModelByPlate(plateNumber, signal).then(firstRecord),
    searchInactiveWithoutModelByPlate(plateNumber, signal).then(firstRecord),
    searchFinalCancelByPlate(plateNumber, signal).then(firstRecord),
  ])

  const fallbacks = { pub, personal, inWith, inWithout, finalCancel }

  if (pub) return { source: 'public', record: pub, fallbacks }
  if (personal) return { source: 'personal-import', record: personal, fallbacks }
  if (inWith) return { source: 'inactive-with-model', record: inWith, fallbacks }
  if (inWithout) return { source: 'inactive-without-model', record: inWithout, fallbacks }
  if (finalCancel) return { source: 'inactive-final-cancel', record: finalCancel, fallbacks }

  return { source: null, record: null, fallbacks }
}

const controller = new AbortController()
const { signal } = controller

console.log('Plate:', plate)

const resolved = await resolveVehicle(plate, signal)
console.log('Registry source:', resolved.source ?? 'not found')

if (!resolved.record) {
  console.log('No vehicle record in any registry.')
  process.exit(0)
}

const car = resolved.record
console.log('Vehicle:', car.tozeret_nm, car.degem_nm)

// Always fetch outstanding recalls by plate (even without active match in Car check)
const hagbalatRes = await searchHagbalatRecallByPlate(plate, signal)
const hagbalatRows = records(hagbalatRes)
console.log('Outstanding recalls:', hagbalatRows.length)

// Enrichment parallel (when we have a matched record)
const { tozeret_cd, degem_cd, shnat_yitzur, sug_degem } = car

const enrichment = await Promise.all([
  searchDisabledParkingPermitByPlate(plate, signal).then(firstRecord),
  searchPrivateHistoryMileageByPlate(plate, signal).then(firstRecord),
  searchPrivateOwnershipByPlate(plate, signal).then(records),
  typeof tozeret_cd === 'number' && typeof degem_cd === 'number'
    ? searchActivePrivateByModel({ tozeret_cd, degem_cd }, signal).then(total)
    : Promise.resolve(null),
  typeof tozeret_cd === 'number' &&
  typeof degem_cd === 'number' &&
  typeof shnat_yitzur === 'number'
    ? searchActivePrivateByModelYear({ tozeret_cd, degem_cd, shnat_yitzur }, signal).then(total)
    : Promise.resolve(null),
  typeof tozeret_cd === 'number' && typeof degem_cd === 'number'
    ? searchWltpByModel(
        {
          tozeret_cd,
          degem_cd,
          shnat_yitzur: typeof shnat_yitzur === 'number' ? shnat_yitzur : undefined,
          sug_degem: typeof sug_degem === 'string' ? sug_degem : undefined,
        },
        signal,
      ).then(firstRecord)
    : Promise.resolve(null),
])

const [
  disabledPermit,
  historyMileage,
  ownershipHistory,
  modelRegistryTotal,
  modelRegistryTotalYear,
  wltp,
] = enrichment

// Recall catalog rows for each hagbalat RECALL_ID
const recallCatalog = await Promise.all(
  hagbalatRows.map((row) =>
    searchRecallCatalogByRecallId(row.RECALL_ID, signal).then(firstRecord),
  ),
)

console.log(JSON.stringify({
  plate,
  registry: { source: resolved.source, record: resolved.record },
  fallbacks: resolved.fallbacks,
  hagbalatRecall: hagbalatRows,
  recallCatalog: recallCatalog.filter(Boolean),
  disabledPermit,
  historyMileage,
  ownershipHistory,
  modelRegistryTotal,
  modelRegistryTotalYear,
  wltp,
}, null, 2))
