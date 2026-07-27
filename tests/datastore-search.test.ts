import { afterEach, describe, expect, it, vi } from 'vitest'
import { datastoreSearch } from '../src/datastore.js'
import { RESOURCES } from '../src/constants.js'

describe('datastoreSearch', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns success=false responses without throwing', async () => {
    const body = {
      success: false,
      error: { message: 'Cannot parse JSON', __type: 'Validation Error' },
    }

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 409,
        json: async () => body,
      })),
    )

    const response = await datastoreSearch({
      resource_id: RESOURCES.activePrivate,
      filters: '%7Bbad%7D',
      limit: 1,
    })

    expect(response.success).toBe(false)
    expect(response.error).toEqual(body.error)
  })
})
