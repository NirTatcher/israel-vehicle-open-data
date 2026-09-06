export type PublicVehicleRecord = {
  _id: number
  mispar_rechev: number
  sug_rechev_cd: number | null
  sug_rechev_nm: string | null
  shnat_yitzur: number | null
  mishkal_kolel: number | null
  tozeret_cd: number | null
  tozeret_nm: string | null
  tzeva_cd: number | null
  tzeva_rechev: string | null
  degem_cd: number | null
  degem_nm: string | null
  kinuy_mishari: string | null
  sug_rechev_EU_cd: string | null
  sug_rechev_EU_nm: string | null
  bitul_cd: string | null
  bitul_nm: string | null
  bitul_dt: string | null
  tokef_dt: string | null
  mispar_mekomot: number | null
  mispar_mekomot_leyd_nahag: number | null

  [key: string]: unknown
}

export type InactiveVehicleWithModelRecord = {
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

  [key: string]: unknown
}

export type InactiveVehicleWithoutModelRecord = {
  _id: number
  mispar_rechev: number
  mispar_shilda: string | null
  tkina_EU: string | null
  shnat_yitzur: number | null
  tozeret_cd: number | null
  tozeret_nm: string | null
  tozeret_eretz_nm: string | null
  sug_delek_cd: number | null
  sug_delek_nm: string | null
  mishkal_kolel: number | null
  degem_nm: string | null
  mishkal_azmi: number | null
  nefach_manoa: number | null
  degem_manoa: string | null
  hanaa_cd: string | null
  hanaa_nm: string | null
  mishkal_mitan_harama: number | null
  horaat_rishum: number | null

  [key: string]: unknown
}

export type FinalCancelVehicleRecord = {
  _id: number
  mispar_rechev: number

  [key: string]: unknown
}

export type DisabledParkingPermitRecord = {
  _id: number
  'MISPAR RECHEV': number
  'TAARICH HAFAKAT TAG': number | null
  'SUG TAV': number | null

  [key: string]: unknown
}

export type PersonalImportVehicleRecord = {
  _id: number
  mispar_rechev: number
  shilda: string | null
  tozeret_cd: number | null
  tozeret_nm: string | null
  sug_rechev_cd: number | null
  sug_rechev_nm: string | null
  degem_nm: string | null
  mishkal_kolel: number | null
  shnat_yitzur: number | null
  nefach_manoa: number | null
  tozeret_eretz_nm: string | null
  degem_manoa: string | null
  mivchan_acharon_dt: string | null
  tokef_dt: string | null
  sug_yevu: string | null
  moed_aliya_lakvish: string | null
  sug_delek_nm: string | null

  [key: string]: unknown
}

export type TwoWheelerRecord = {
  _id: number
  mispar_rechev: number
  tozeret_cd: number | null
  tozeret_nm: string | null
  tozeret_eretz_nm: string | null
  degem_nm: string | null
  shnat_yitzur: number | null
  sug_delek_nm: string | null
  sug_rechev_cd: number | null
  sug_rechev_nm: string | null
  nefach_manoa: number | null
  misgeret: string | null
  moed_aliya_lakvish: string | null
  baalut: string | null

  [key: string]: unknown
}

export type HeavyTruckRecord = {
  _id: number
  mispar_rechev: number
  mispar_shilda: string | null
  tkina_EU: string | null
  shnat_yitzur: number | null
  tozeret_cd: number | null
  tozeret_nm: string | null
  tozeret_eretz_nm: string | null
  degem_nm: string | null
  sug_delek_nm: string | null
  moed_aliya_lakvish: string | null
  mishkal_kolel: number | null
  zmig_kidmi: string | null
  zmig_ahori: string | null

  [key: string]: unknown
}
