import type { ActivePrivateTireTowRecord } from './types/active-private-supplement.js'
import type { CarRecord } from './types/datastore.js'

/** Copy tire/tow fields from the supplement row onto a main registry row. */
export function mergeActivePrivateWithTireTow(
  main: CarRecord | null | undefined,
  supplement: ActivePrivateTireTowRecord | null | undefined,
): CarRecord | null {
  if (!main) return null
  if (!supplement) return main

  const merged: CarRecord = { ...main }
  if (supplement.grira_nm != null) merged.grira_nm = supplement.grira_nm
  if (supplement.kod_omes_tzmig_kidmi != null) {
    merged.kod_omes_tzmig_kidmi = supplement.kod_omes_tzmig_kidmi
  }
  if (supplement.kod_omes_tzmig_ahori != null) {
    merged.kod_omes_tzmig_ahori = supplement.kod_omes_tzmig_ahori
  }
  if (supplement.kod_mehirut_tzmig_kidmi != null) {
    merged.kod_mehirut_tzmig_kidmi = supplement.kod_mehirut_tzmig_kidmi
  }
  if (supplement.kod_mehirut_tzmig_ahori != null) {
    merged.kod_mehirut_tzmig_ahori = supplement.kod_mehirut_tzmig_ahori
  }
  return merged
}
