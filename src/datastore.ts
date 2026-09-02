import { DATASTORE_SEARCH_URL } from './constants.js'
import type { DatastoreSearchResponse } from './types/datastore.js'

export type DatastoreSearchParams = {
  resource_id: string
  offset?: number
  limit?: number
  filters?: string
  sort?: string
  q?: string
  /** Comma-separated field names to return (CKAN `fields`). */
  fields?: string
}

/**
 * Builds a datastore_search URL. Values are encoded once via URLSearchParams.
 * Do not pre-encode `filters` JSON — double-encoding breaks CKAN filter parsing.
 */
export function buildDatastoreSearchUrl(params: DatastoreSearchParams): string {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue
    qs.set(k, String(v))
  }
  return `${DATASTORE_SEARCH_URL}?${qs.toString()}`
}

/**
 * Calls CKAN `datastore_search` and returns the JSON body as-is.
 *
 * Check `response.success` and `response.error` — this function does not throw
 * for CKAN-level failures (`success: false`). Network / parse errors from
 * `fetch` still propagate.
 */
export async function datastoreSearch<TRecord extends object>(
  params: DatastoreSearchParams,
  signal?: AbortSignal,
): Promise<DatastoreSearchResponse<TRecord>> {
  const url = buildDatastoreSearchUrl(params)

  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  })

  return (await res.json()) as DatastoreSearchResponse<TRecord>
}
