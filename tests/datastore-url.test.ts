import { describe, expect, it } from 'vitest'
import { buildDatastoreSearchUrl } from '../src/datastore.js'
import { RESOURCES } from '../src/constants.js'

describe('buildDatastoreSearchUrl', () => {
  it('encodes filters JSON exactly once', () => {
    const plate = 3300421
    const filters = JSON.stringify({ mispar_rechev: plate })
    const url = buildDatastoreSearchUrl({
      resource_id: RESOURCES.activePrivate,
      filters,
      limit: 1,
    })

    expect(url).toContain('filters=')
    expect(url).not.toContain('%257B')
    expect(url).toContain(encodeURIComponent(filters))
  })

  it('omits undefined params', () => {
    const url = buildDatastoreSearchUrl({
      resource_id: RESOURCES.activePrivate,
      limit: 0,
    })

    expect(url).not.toContain('filters=')
    expect(url).not.toContain('offset=')
  })
})
