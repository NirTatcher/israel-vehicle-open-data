export {
  DATASTORE_SEARCH_URL,
  RESOURCES,
  type ResourceKey,
} from './constants.js'

export {
  buildDatastoreSearchUrl,
  datastoreSearch,
  type DatastoreSearchParams,
} from './datastore.js'

export {
  searchActivePrivate,
  searchActivePrivateByPlate,
  searchActivePrivateByModel,
  searchActivePrivateByModelYear,
  searchWltpByModel,
  searchPrivateHistoryMileageByPlate,
  searchPrivateOwnershipByPlate,
  searchPublicVehicleByPlate,
  searchPersonalImportByPlate,
  searchInactiveWithModelByPlate,
  searchInactiveWithoutModelByPlate,
  searchFinalCancelByPlate,
  searchHagbalatRecallByPlate,
  searchRecallCatalogByRecallId,
  searchDisabledParkingPermitByPlate,
} from './queries.js'

export type * from './types/index.js'
