import { describe, expect, it } from 'vitest'
import { RESOURCES } from '../src/constants.js'
import { datastoreSearch } from '../src/datastore.js'
import {
  searchActivePrivateByPlate,
  searchActivePrivateTireAndTowByPlate,
} from '../src/queries.js'

const LIVE = process.env.LIVE_API === '1' || process.env.LIVE_API === 'true'

describe.skipIf(!LIVE)('live data.gov.il', () => {
  const samplePlate = 7272071

  it('active private main resource has fleet total', async () => {
    const res = await datastoreSearch({ resource_id: RESOURCES.activePrivate, limit: 0 })
    expect(res.success).toBe(true)
    expect(res.result?.total).toBeGreaterThan(1_000_000)
  })

  it('tire/tow supplement resource has fleet total', async () => {
    const res = await datastoreSearch({
      resource_id: RESOURCES.activePrivateTireAndTow,
      limit: 0,
    })
    expect(res.success).toBe(true)
    expect(res.result?.total).toBeGreaterThan(1_000_000)
  })

  it('plate lookup returns main fields and merged grira_nm', async () => {
    const res = await searchActivePrivateByPlate(samplePlate)
    expect(res.success).toBe(true)
    const row = res.result?.records[0]
    expect(row?.mispar_rechev).toBe(samplePlate)
    expect(row?.tozeret_nm).toBeTruthy()
    expect(row?.grira_nm).toBeTruthy()
  })

  it('supplement-only query exposes tire codes', async () => {
    const res = await searchActivePrivateTireAndTowByPlate(samplePlate)
    const row = res.result?.records[0]
    expect(row?.grira_nm).toBeTruthy()
    expect(row?.kod_omes_tzmig_kidmi).toBeGreaterThan(0)
  })
})
