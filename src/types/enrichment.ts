export type WltpSpecRecord = {
  _id: number
  sug_degem: string | null
  tozeret_cd: number | null
  tozeret_nm: string | null
  degem_cd: number | null
  degem_nm: string | null
  shnat_yitzur: number | null
  kvuzat_agra_cd?: number | null
  ramat_gimur: string | null
  delek_nm: string | null
  degem_manoa?: string | null
  nefah_manoa: number | null
  koah_sus: number | null
  mishkal_kolel: number | null
  merkav: string | null
  kvutzat_zihum: number | null

  mazgan_ind?: number | null
  abs_ind?: number | null
  hege_koah_ind?: number | null
  automatic_ind?: number | null
  hanaa_nm?: string | null
  technologiat_hanaa_nm?: string | null
  mispar_dlatot?: number | null
  mispar_kariot_avir?: number | null
  halon_bagg_ind?: number | null
  mispar_halonot_hashmal?: number | null
  bakarat_yatzivut_ind?: number | null
  galgaley_sagsoget_kala_ind?: number | null

  [key: string]: unknown
}

export type PrivateVehicleHistoryMileageRecord = {
  _id: number
  mispar_rechev: number
  kilometer_test_aharon: number | null
  rishum_rishon_dt: string | null
  mkoriut_nm: string | null

  [key: string]: unknown
}

export type PrivateVehicleOwnershipRecord = {
  _id: number
  mispar_rechev: number
  baalut_dt: number | null
  baalut: string | null

  [key: string]: unknown
}

/** Ministry of Transport — vehicles with outstanding safety recall (CKAN). */
export type HagbalatRecallRecord = {
  _id: number
  MISPAR_RECHEV: number
  RECALL_ID: number
  SUG_RECALL: string | null
  SUG_TAKALA: string | null
  TEUR_TAKALA: string | null
  TAARICH_PTICHA: string | null

  [key: string]: unknown
}

/** Ministry RECALL catalog row (by RECALL_ID). */
export type RecallCatalogRecord = {
  _id: number
  RECALL_ID: number
  [key: string]: unknown
}
