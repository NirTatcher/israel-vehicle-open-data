import { afterEach, describe, expect, it, vi } from 'vitest'
import { searchActivePrivateByPlate, searchHeavyTruckByPlate } from '../src/queries.js'
import { RESOURCES } from '../src/constants.js'
import fixture from './fixtures/active-private-hit.json'
import supplementFixture from './fixtures/active-private-supplement-hit.json'

describe('searchActivePrivateByPlate', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('merges main registry with tire/tow supplement', async () => {
    const fetchMock = vi.fn(async (url: string | URL) => {
      const href = String(url)
      const body = href.includes(RESOURCES.activePrivateTireAndTow)
        ? supplementFixture
        : fixture
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify(body),
      }
    })
    vi.stubGlobal('fetch', fetchMock)

    const response = await searchActivePrivateByPlate(3300421)

    expect(response.success).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const record = response.result?.records[0]
    expect(record?.mispar_rechev).toBe(3300421)
    expect(record?.tozeret_nm).toBe('טויוטה')
    expect(record?.grira_nm).toBe('אין וו גרירה')
    expect(record?.kod_mehirut_tzmig_kidmi).toBe('H')
  })
})

describe('searchHeavyTruckByPlate', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('queries the heavy-truck resource by mispar_rechev', async () => {
    let calledUrl = ''
    const fetchMock = vi.fn(async (url: string | URL) => {
      calledUrl = String(url)
      return {
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            success: true,
            result: {
              records: [{ _id: 1, mispar_rechev: 3300421, tkina_EU: 'N3' }],
              total: 1,
              limit: 1,
            },
          }),
      }
    })
    vi.stubGlobal('fetch', fetchMock)

    const response = await searchHeavyTruckByPlate(3300421)

    expect(response.success).toBe(true)
    expect(response.result?.records[0]?.tkina_EU).toBe('N3')
    expect(calledUrl).toContain(RESOURCES.heavyTruck)
    expect(calledUrl).toContain('3300421')
  })
})
