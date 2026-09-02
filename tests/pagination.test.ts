import { afterEach, describe, expect, it, vi } from 'vitest'
import { paginateDatastore } from '../src/pagination.js'
import { RESOURCES } from '../src/constants.js'

function pageResponse(records: object[], total: number, offset: number) {
  return {
    success: true,
    result: {
      include_total: true,
      limit: 2,
      offset,
      records_format: 'objects' as const,
      resource_id: RESOURCES.activePrivate,
      total,
      total_estimation_threshold: null,
      records,
    },
  }
}

describe('paginateDatastore', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('yields all pages until total is reached', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        const u = new URL(String(url))
        const offset = Number(u.searchParams.get('offset') ?? 0)
        const records =
          offset === 0
            ? [{ mispar_rechev: 1 }, { mispar_rechev: 2 }]
            : offset === 2
              ? [{ mispar_rechev: 3 }]
              : []
        return {
          ok: true,
          status: 200,
          json: async () => pageResponse(records, 3, offset),
        }
      }),
    )

    const pages = []
    for await (const page of paginateDatastore(RESOURCES.activePrivate, { limit: 2 })) {
      pages.push(page)
    }

    expect(pages).toHaveLength(2)
    expect(pages[0]?.records).toHaveLength(2)
    expect(pages[1]?.records).toHaveLength(1)
    expect(pages[0]?.total).toBe(3)
  })

  it('respects maxPages', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () =>
          pageResponse([{ mispar_rechev: 1 }, { mispar_rechev: 2 }], 10, 0),
      })),
    )

    const pages = []
    for await (const page of paginateDatastore(RESOURCES.activePrivate, {
      limit: 2,
      maxPages: 1,
    })) {
      pages.push(page)
    }

    expect(pages).toHaveLength(1)
  })

  it('throws when CKAN returns success=false', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          success: false,
          error: { message: 'boom' },
        }),
      })),
    )

    const gen = paginateDatastore(RESOURCES.activePrivate)
    await expect(gen.next()).rejects.toThrow(/datastore_search failed/)
  })
})
