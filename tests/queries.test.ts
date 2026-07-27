import { afterEach, describe, expect, it, vi } from 'vitest'
import { searchActivePrivateByPlate } from '../src/queries.js'
import fixture from './fixtures/active-private-hit.json'

describe('searchActivePrivateByPlate', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the CKAN response envelope unchanged', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => fixture,
      })),
    )

    const response = await searchActivePrivateByPlate(3300421)

    expect(response).toEqual(fixture)
    expect(response.success).toBe(true)
    expect(response.result?.records[0]?.mispar_rechev).toBe(3300421)
  })
})
