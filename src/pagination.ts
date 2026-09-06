import { datastoreSearch } from './datastore.js'
import { RESOURCES } from './constants.js'
import type { CarRecord } from './types/datastore.js'
import type { TwoWheelerRecord, HeavyTruckRecord } from './types/registries.js'

export type PaginateDatastoreOpts = {
  /** Records per page (CKAN `limit`). Default 1000. */
  limit?: number
  filters?: string
  sort?: string
  q?: string
  /** Comma-separated field names (CKAN `fields`). */
  fields?: string
  signal?: AbortSignal
  /** Stop after this many pages (useful for tests or partial scans). */
  maxPages?: number
}

export type PaginatePage<TRecord extends object> = {
  records: TRecord[]
  offset: number
  total: number | null
  pageIndex: number
}

/**
 * Async generator over CKAN `datastore_search` pages for a resource.
 * Yields until a page is empty, `offset >= total`, or `maxPages` is reached.
 */
export async function* paginateDatastore<TRecord extends object>(
  resource_id: string,
  opts: PaginateDatastoreOpts = {},
): AsyncGenerator<PaginatePage<TRecord>, void, undefined> {
  const pageSize = opts.limit ?? 1000
  let offset = 0
  let pageIndex = 0
  let total: number | null = null

  while (true) {
    if (opts.maxPages !== undefined && pageIndex >= opts.maxPages) return
    if (opts.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }

    const response = await datastoreSearch<TRecord>(
      {
        resource_id,
        offset,
        limit: pageSize,
        filters: opts.filters,
        sort: opts.sort,
        q: opts.q,
        fields: opts.fields,
      },
      opts.signal,
    )

    if (!response.success) {
      const msg =
        typeof response.error === 'object' &&
        response.error !== null &&
        'message' in response.error
          ? String((response.error as { message: unknown }).message)
          : JSON.stringify(response.error)
      throw new Error(`datastore_search failed: ${msg}`)
    }

    const result = response.result
    if (!result) return

    if (total === null && typeof result.total === 'number') {
      total = result.total
    }

    const records = result.records ?? []
    if (records.length === 0) return

    yield { records, offset, total, pageIndex }

    offset += records.length
    pageIndex += 1

    if (records.length < pageSize) return
    if (total !== null && offset >= total) return
  }
}

/** Paginate the active private vehicle registry. */
export function paginateActivePrivate(
  opts: PaginateDatastoreOpts = {},
): AsyncGenerator<PaginatePage<CarRecord>, void, undefined> {
  return paginateDatastore<CarRecord>(RESOURCES.activePrivate, opts)
}

/** Paginate the active two-wheeled vehicle registry. */
export function paginateTwoWheelers(
  opts: PaginateDatastoreOpts = {},
): AsyncGenerator<PaginatePage<TwoWheelerRecord>, void, undefined> {
  return paginateDatastore<TwoWheelerRecord>(RESOURCES.twoWheelers, opts)
}

/** Paginate the active heavy-truck registry. */
export function paginateHeavyTrucks(
  opts: PaginateDatastoreOpts = {},
): AsyncGenerator<PaginatePage<HeavyTruckRecord>, void, undefined> {
  return paginateDatastore<HeavyTruckRecord>(RESOURCES.heavyTruck, opts)
}
