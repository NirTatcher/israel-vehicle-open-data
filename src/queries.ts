import { RESOURCES } from './constants.js'
import { datastoreSearch } from './datastore.js'
import type { CarRecord, DatastoreSearchResponse } from './types/datastore.js'
import type {
  HagbalatRecallRecord,
  PrivateVehicleHistoryMileageRecord,
  PrivateVehicleOwnershipRecord,
  RecallCatalogRecord,
  WltpSpecRecord,
} from './types/enrichment.js'
import type {
  DisabledParkingPermitRecord,
  FinalCancelVehicleRecord,
  InactiveVehicleWithModelRecord,
  InactiveVehicleWithoutModelRecord,
  PersonalImportVehicleRecord,
  PublicVehicleRecord,
  TwoWheelerRecord,
} from './types/registries.js'

type SearchOpts = {
  offset?: number
  limit?: number
  filters?: string
  sort?: string
  q?: string
  signal?: AbortSignal
}

function search<TRecord extends object>(
  resource_id: string,
  opts: SearchOpts = {},
): Promise<DatastoreSearchResponse<TRecord>> {
  const { signal, ...params } = opts
  return datastoreSearch<TRecord>({ resource_id, ...params }, signal)
}

function searchByPlate<TRecord extends object>(
  resource_id: string,
  plate: number,
  signal?: AbortSignal,
): Promise<DatastoreSearchResponse<TRecord>> {
  return search<TRecord>(resource_id, {
    filters: JSON.stringify({ mispar_rechev: plate }),
    limit: 1,
    signal,
  })
}

/** Active private vehicle registry (`datastore_search`). */
export function searchActivePrivate(
  opts: SearchOpts = {},
): Promise<DatastoreSearchResponse<CarRecord>> {
  return search<CarRecord>(RESOURCES.activePrivate, opts)
}

/** Active private registry lookup by plate (`mispar_rechev`). */
export function searchActivePrivateByPlate(
  plate: number,
  signal?: AbortSignal,
): Promise<DatastoreSearchResponse<CarRecord>> {
  return searchByPlate<CarRecord>(RESOURCES.activePrivate, plate, signal)
}

/** Active private registry count for a manufacturer/model pair (`limit: 0`). */
export function searchActivePrivateByModel(
  args: { tozeret_cd: number; degem_cd: number },
  signal?: AbortSignal,
): Promise<DatastoreSearchResponse<CarRecord>> {
  return search<CarRecord>(RESOURCES.activePrivate, {
    filters: JSON.stringify({
      tozeret_cd: Math.trunc(args.tozeret_cd),
      degem_cd: Math.trunc(args.degem_cd),
    }),
    limit: 0,
    signal,
  })
}

/** Active private registry count for model + year (`limit: 0`). */
export function searchActivePrivateByModelYear(
  args: { tozeret_cd: number; degem_cd: number; shnat_yitzur: number },
  signal?: AbortSignal,
): Promise<DatastoreSearchResponse<CarRecord>> {
  return search<CarRecord>(RESOURCES.activePrivate, {
    filters: JSON.stringify({
      tozeret_cd: Math.trunc(args.tozeret_cd),
      degem_cd: Math.trunc(args.degem_cd),
      shnat_yitzur: Math.trunc(args.shnat_yitzur),
    }),
    limit: 0,
    signal,
  })
}

/** WLTP / technical specs by model codes (optional year and trim). */
export function searchWltpByModel(
  args: {
    tozeret_cd: number
    degem_cd: number
    shnat_yitzur?: number
    sug_degem?: string
  },
  signal?: AbortSignal,
): Promise<DatastoreSearchResponse<WltpSpecRecord>> {
  const filtersObj: Record<string, unknown> = {
    tozeret_cd: args.tozeret_cd,
    degem_cd: args.degem_cd,
  }
  if (typeof args.shnat_yitzur === 'number') filtersObj.shnat_yitzur = args.shnat_yitzur
  if (typeof args.sug_degem === 'string' && args.sug_degem.trim()) {
    filtersObj.sug_degem = args.sug_degem
  }

  return search<WltpSpecRecord>(RESOURCES.wltp, {
    filters: JSON.stringify(filtersObj),
    limit: 1,
    signal,
  })
}

/** Private vehicle history / mileage by plate. */
export function searchPrivateHistoryMileageByPlate(
  plate: number,
  signal?: AbortSignal,
): Promise<DatastoreSearchResponse<PrivateVehicleHistoryMileageRecord>> {
  return searchByPlate<PrivateVehicleHistoryMileageRecord>(
    RESOURCES.privateHistoryMileage,
    plate,
    signal,
  )
}

/** Private ownership history by plate (newest first). */
export function searchPrivateOwnershipByPlate(
  plate: number,
  signal?: AbortSignal,
): Promise<DatastoreSearchResponse<PrivateVehicleOwnershipRecord>> {
  return search<PrivateVehicleOwnershipRecord>(RESOURCES.privateOwnership, {
    filters: JSON.stringify({ mispar_rechev: plate }),
    limit: 100,
    sort: 'baalut_dt desc',
    signal,
  })
}

/** Public / government vehicle registry by plate. */
export function searchPublicVehicleByPlate(
  plate: number,
  signal?: AbortSignal,
): Promise<DatastoreSearchResponse<PublicVehicleRecord>> {
  return searchByPlate<PublicVehicleRecord>(RESOURCES.publicVehicles, plate, signal)
}

/** Active two-wheeled vehicle registry by plate. */
export function searchTwoWheelersByPlate(
  plate: number,
  signal?: AbortSignal,
): Promise<DatastoreSearchResponse<TwoWheelerRecord>> {
  return searchByPlate<TwoWheelerRecord>(RESOURCES.twoWheelers, plate, signal)
}

/** Personal import registry by plate. */
export function searchPersonalImportByPlate(
  plate: number,
  signal?: AbortSignal,
): Promise<DatastoreSearchResponse<PersonalImportVehicleRecord>> {
  return searchByPlate<PersonalImportVehicleRecord>(RESOURCES.personalImport, plate, signal)
}

/** Inactive vehicle (with model) by plate. */
export function searchInactiveWithModelByPlate(
  plate: number,
  signal?: AbortSignal,
): Promise<DatastoreSearchResponse<InactiveVehicleWithModelRecord>> {
  return searchByPlate<InactiveVehicleWithModelRecord>(
    RESOURCES.inactiveWithModel,
    plate,
    signal,
  )
}

/** Inactive vehicle (without model) by plate. */
export function searchInactiveWithoutModelByPlate(
  plate: number,
  signal?: AbortSignal,
): Promise<DatastoreSearchResponse<InactiveVehicleWithoutModelRecord>> {
  return searchByPlate<InactiveVehicleWithoutModelRecord>(
    RESOURCES.inactiveWithoutModel,
    plate,
    signal,
  )
}

/** Final cancellation registry by plate. */
export function searchFinalCancelByPlate(
  plate: number,
  signal?: AbortSignal,
): Promise<DatastoreSearchResponse<FinalCancelVehicleRecord>> {
  return searchByPlate<FinalCancelVehicleRecord>(RESOURCES.finalCancel, plate, signal)
}

/**
 * Outstanding safety recalls by plate (hagbalat dataset).
 * Filter field is uppercase `MISPAR_RECHEV` in this resource.
 */
export function searchHagbalatRecallByPlate(
  plate: number,
  signal?: AbortSignal,
): Promise<DatastoreSearchResponse<HagbalatRecallRecord>> {
  return search<HagbalatRecallRecord>(RESOURCES.hagbalatRecall, {
    filters: JSON.stringify({ MISPAR_RECHEV: plate }),
    limit: 100,
    signal,
  })
}

/** RECALL catalog by `RECALL_ID`. */
export function searchRecallCatalogByRecallId(
  recallId: number,
  signal?: AbortSignal,
): Promise<DatastoreSearchResponse<RecallCatalogRecord>> {
  return search<RecallCatalogRecord>(RESOURCES.recallCatalog, {
    filters: JSON.stringify({ RECALL_ID: Math.trunc(recallId) }),
    limit: 1,
    signal,
  })
}

/**
 * Disabled parking permit by plate.
 * Filter key is `"MISPAR RECHEV"` (with a space) in this resource.
 */
export function searchDisabledParkingPermitByPlate(
  plate: number,
  signal?: AbortSignal,
): Promise<DatastoreSearchResponse<DisabledParkingPermitRecord>> {
  return search<DisabledParkingPermitRecord>(RESOURCES.disabledParkingPermit, {
    filters: JSON.stringify({ 'MISPAR RECHEV': plate }),
    limit: 1,
    signal,
  })
}
