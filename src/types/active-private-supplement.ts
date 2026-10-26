/**
 * MoT «המשך» resource — tire load/speed codes and tow-hitch (`grira_nm`) keyed by plate + model codes.
 * @see https://data.gov.il/he/datasets/ministry_of_transport/private-and-commercial-vehicles/0866573c-40cd-4ca8-91d2-9dd2d7a492e5
 */
export type ActivePrivateTireTowRecord = {
  _id: number
  mispar_rechev: number
  tozeret_cd: number | null
  sug_degem: string | null
  degem_cd: number | null
  kod_omes_tzmig_kidmi: number | null
  kod_omes_tzmig_ahori: number | null
  kod_mehirut_tzmig_kidmi: string | null
  kod_mehirut_tzmig_ahori: string | null
  grira_nm: string | null
  [key: string]: unknown
}
