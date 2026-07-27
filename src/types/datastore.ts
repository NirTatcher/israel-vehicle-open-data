export type DatastoreSearchResponse<TRecord extends object> = {
  help: string
  success: boolean
  result?: {
    include_total: boolean
    limit: number
    offset?: number
    records_format: 'objects'
    resource_id: string
    total?: number
    total_estimation_threshold: number | null
    records: TRecord[]
  }
  error?: unknown
}

export type CarRecord = {
  _id: number
  mispar_rechev: number
  tozeret_cd: number | null
  sug_degem: string | null
  tozeret_nm: string | null
  degem_cd: number | null
  degem_nm: string | null
  ramat_gimur: string | null
  ramat_eivzur_betihuty: number | null
  kvutzat_zihum: number | null
  shnat_yitzur: number | null
  degem_manoa: string | null
  mivchan_acharon_dt: string | null
  tokef_dt: string | null
  baalut: string | null
  misgeret: string | null
  tzeva_cd: number | null
  tzeva_rechev: string | null
  zmig_kidmi: string | null
  zmig_ahori: string | null
  sug_delek_nm: string | null
  horaat_rishum: number | null
  moed_aliya_lakvish: string | null
  kinuy_mishari: string | null

  /**
   * Extra unknown keys are allowed because the dataset may add fields over time.
   */
  [key: string]: unknown
}
