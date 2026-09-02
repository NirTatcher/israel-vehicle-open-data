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

const MAX_ATTEMPTS = 5
const BASE_DELAY_MS = 800
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524])

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

function looksLikeHtml(body: string): boolean {
  const start = body.trimStart().slice(0, 15).toLowerCase()
  return start.startsWith('<!doctype') || start.startsWith('<html')
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const timeoutId = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timeoutId)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

function retryDelayMs(attempt: number): number {
  return Math.min(12_000, BASE_DELAY_MS * 2 ** attempt)
}

function isRetryableNetworkError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'AbortError') return false
  return err instanceof TypeError || err instanceof SyntaxError
}

/**
 * Calls CKAN `datastore_search` and returns the JSON body as-is.
 *
 * Check `response.success` and `response.error` — this function does not throw
 * for CKAN-level failures (`success: false`). Transient HTTP failures (429, 5xx,
 * HTML error pages from the gateway) are retried with backoff. Network / parse
 * errors still propagate after retries are exhausted.
 */
export async function datastoreSearch<TRecord extends object>(
  params: DatastoreSearchParams,
  signal?: AbortSignal,
): Promise<DatastoreSearchResponse<TRecord>> {
  const url = buildDatastoreSearchUrl(params)
  let lastError: unknown

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal,
      })
      const text = await res.text()

      if (looksLikeHtml(text) || text.trim() === '') {
        const snippet = text.trim().slice(0, 160).replace(/\s+/g, ' ')
        lastError = new Error(
          `datastore_search returned HTML/empty (HTTP ${res.status}) for ${params.resource_id}: ${snippet}`,
        )
        if (attempt < MAX_ATTEMPTS - 1) {
          const delay = retryDelayMs(attempt)
          console.error(
            `datastore_search retry ${attempt + 1}/${MAX_ATTEMPTS - 1} (${params.resource_id} HTTP ${res.status} HTML) in ${delay}ms`,
          )
          await sleep(delay, signal)
          continue
        }
        throw lastError
      }

      let parsed: DatastoreSearchResponse<TRecord>
      try {
        parsed = JSON.parse(text) as DatastoreSearchResponse<TRecord>
      } catch {
        lastError = new Error(
          `datastore_search returned non-JSON (HTTP ${res.status}) for ${params.resource_id}`,
        )
        if (attempt < MAX_ATTEMPTS - 1) {
          const delay = retryDelayMs(attempt)
          console.error(
            `datastore_search retry ${attempt + 1}/${MAX_ATTEMPTS - 1} (${params.resource_id} HTTP ${res.status} non-JSON) in ${delay}ms`,
          )
          await sleep(delay, signal)
          continue
        }
        throw lastError
      }

      if (!res.ok && RETRYABLE_STATUS.has(res.status)) {
        lastError = new Error(`datastore_search HTTP ${res.status} for ${params.resource_id}`)
        if (attempt < MAX_ATTEMPTS - 1) {
          const delay = retryDelayMs(attempt)
          console.error(
            `datastore_search retry ${attempt + 1}/${MAX_ATTEMPTS - 1} (${params.resource_id} HTTP ${res.status}) in ${delay}ms`,
          )
          await sleep(delay, signal)
          continue
        }
        throw lastError
      }

      return parsed
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') throw err
      lastError = err
      if (attempt < MAX_ATTEMPTS - 1 && isRetryableNetworkError(err)) {
        const delay = retryDelayMs(attempt)
        console.error(
          `datastore_search retry ${attempt + 1}/${MAX_ATTEMPTS - 1} (${params.resource_id} ${err instanceof Error ? err.message : 'network'}) in ${delay}ms`,
        )
        await sleep(delay, signal)
        continue
      }
      throw err
    }
  }

  throw lastError
}
