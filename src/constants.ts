/** CKAN datastore_search endpoint for data.gov.il. */
export const DATASTORE_SEARCH_URL = 'https://data.gov.il/api/3/action/datastore_search'

/**
 * Known resource IDs on data.gov.il for Israeli vehicle datasets.
 * @see https://data.gov.il
 */
export const RESOURCES = {
  /** Active private vehicle registry (main lookup). */
  activePrivate: '053cea08-09bc-40ec-8f7a-156f0677aff3',
  wltp: '142afde2-6228-49f9-8a29-9b6c3a0cbe40',
  privateHistoryMileage: '56063a99-8a3e-4ff4-912e-5966c0279bad',
  privateOwnership: 'bb2355dc-9ec7-4f06-9c3f-3344672171da',
  publicVehicles: 'cf29862d-ca25-4691-84f6-1be60dcb4a1e',
  personalImport: '03adc637-b6fe-402b-9937-7c3d3afc9140',
  inactiveWithModel: 'f6efe89a-fb3d-43a4-bb61-9bf12a9b9099',
  inactiveWithoutModel: '6f6acd03-f351-4a8f-8ecf-df792f4f573a',
  finalCancel: '851ecab1-0622-4dbe-a6c7-f950cf82abf9',
  disabledParkingPermit: 'c8b9f9c8-4612-4068-934f-d4acd2e3c06e',
  /** RECALL catalog (manufacturer campaigns — not keyed by plate). */
  recallCatalog: '2c33523f-87aa-44ec-a736-edbb0a82975e',
  /** Outstanding recall compliance by plate (משרד התחבורה). */
  hagbalatRecall: '36bf1404-0be4-49d2-82dc-2f1ead4a8b93',
} as const

export type ResourceKey = keyof typeof RESOURCES
