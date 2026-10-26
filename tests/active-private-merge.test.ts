import { describe, expect, it } from 'vitest'
import { mergeActivePrivateWithTireTow } from '../src/active-private-merge.js'

describe('mergeActivePrivateWithTireTow', () => {
  it('returns null when main is missing', () => {
    expect(
      mergeActivePrivateWithTireTow(null, {
        _id: 1,
        mispar_rechev: 1,
        tozeret_cd: 1,
        sug_degem: 'P',
        degem_cd: 1,
        kod_omes_tzmig_kidmi: 1,
        kod_omes_tzmig_ahori: 1,
        kod_mehirut_tzmig_kidmi: 'H',
        kod_mehirut_tzmig_ahori: 'H',
        grira_nm: 'אין וו גרירה',
      }),
    ).toBeNull()
  })

  it('merges grira and tire codes onto main row', () => {
    const merged = mergeActivePrivateWithTireTow(
      {
        _id: 2,
        mispar_rechev: 3300421,
        tozeret_cd: 728,
        sug_degem: 'P',
        tozeret_nm: 'פורד',
        degem_cd: 3,
        degem_nm: 'K8D',
        ramat_gimur: null,
        ramat_eivzur_betihuty: null,
        kvutzat_zihum: null,
        shnat_yitzur: 2020,
        degem_manoa: null,
        mivchan_acharon_dt: null,
        tokef_dt: null,
        baalut: 'פרטי',
        misgeret: null,
        tzeva_cd: null,
        tzeva_rechev: null,
        zmig_kidmi: '215/65R16',
        zmig_ahori: '215/65R16',
        sug_delek_nm: 'בנזין',
        horaat_rishum: null,
        moed_aliya_lakvish: '2020-01-01',
        kinuy_mishari: null,
      },
      {
        _id: 1,
        mispar_rechev: 3300421,
        tozeret_cd: 728,
        sug_degem: 'P',
        degem_cd: 3,
        kod_omes_tzmig_kidmi: 104,
        kod_omes_tzmig_ahori: 104,
        kod_mehirut_tzmig_kidmi: 'H',
        kod_mehirut_tzmig_ahori: 'H',
        grira_nm: 'אין וו גרירה',
      },
    )

    expect(merged?.tozeret_nm).toBe('פורד')
    expect(merged?.grira_nm).toBe('אין וו גרירה')
    expect(merged?.kod_omes_tzmig_kidmi).toBe(104)
    expect(merged?.zmig_kidmi).toBe('215/65R16')
  })
})
