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
  paginateActivePrivate,
  paginateDatastore,
  paginateTwoWheelers,
  type PaginateDatastoreOpts,
  type PaginatePage,
} from './pagination.js'

export {
  searchActivePrivate,
  searchActivePrivateByPlate,
  searchActivePrivateByModel,
  searchActivePrivateByModelYear,
  searchWltpByModel,
  searchPrivateHistoryMileageByPlate,
  searchPrivateOwnershipByPlate,
  searchPublicVehicleByPlate,
  searchTwoWheelersByPlate,
  searchPersonalImportByPlate,
  searchInactiveWithModelByPlate,
  searchInactiveWithoutModelByPlate,
  searchFinalCancelByPlate,
  searchHagbalatRecallByPlate,
  searchRecallCatalogByRecallId,
  searchDisabledParkingPermitByPlate,
} from './queries.js'

export type * from './types/index.js'
