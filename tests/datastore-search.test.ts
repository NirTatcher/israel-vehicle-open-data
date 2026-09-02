import { afterEach, describe, expect, it, vi } from 'vitest'
import { datastoreSearch } from '../src/datastore.js'
import { RESOURCES } from '../src/constants.js'

function jsonResponse(body: unknown, status = 200) {
  const text = JSON.stringify(body)
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => text,
  }
}

describe('datastoreSearch', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('returns success=false responses without throwing', async () => {
    const body = {
      success: false,
      error: { message: 'Cannot parse JSON', __type: 'Validation Error' },
    }

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(body, 409)),
    )

    const response = await datastoreSearch({
      resource_id: RESOURCES.activePrivate,
      filters: '%7Bbad%7D',
      limit: 1,
    })

    expect(response.success).toBe(false)
    expect(response.error).toEqual(body.error)
  })

  it('retries HTML gateway pages then returns JSON', async () => {
    const okBody = { success: true, result: { records: [], total: 0 } }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => '<!DOCTYPE html><html><body>error</body></html>',
      })
      .mockResolvedValueOnce(jsonResponse(okBody))

    vi.stubGlobal('fetch', fetchMock)

    const promise = datastoreSearch({
      resource_id: RESOURCES.finalCancel,
      limit: 1,
    })
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2), { timeout: 3000 })
    const response = await promise

    expect(response.success).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
