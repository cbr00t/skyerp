class CSHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get trfCikismi() { return false }
    /* Hareket tiplerini (işlem türlerini) belirleyen seçim listesi */
    /** Varsayılan değer atamaları (host vars) – temel sınıfa eklemeler.
		Hareketci.varsayilanHVDuzenle değerleri aynen alınır, sadece eksikler eklenir */
    static varsayilanHVDuzenle({hv, sqlNull, sqlEmpty, sqlZero}) {
        super.varsayilanHVDuzenle(...arguments);
		for (const key of ['ilk', 'finanaliztipi', 'bankadekontnox']) { hv[key] = sqlEmpty }
		for (const key of ['disfisnox', 'must', 'ticmust', 'asilmust', 'althesapkod', 'althesapadi', 'muhfissayac', 'sonzamants', 'karsiodemetarihi']) { delete hv[key] }
		$.extend(hv, { belgetipi: 'fis.belgetipi' })
    }
    /** UNION sorgusu hazırlama – hareket tipleri için */
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
        super.uygunluk2UnionBilgiListeDuzenleDevam(e)
    }
    /** (Devir, İlk Kayıt, Nakde Dönüşüm) için UNION */
    uniDuzenle_devir$ilkKayit$nakdeDonusum({ uygunluk, liste }) {
        $.extend(liste, {
            devir$ilkKayit$nakdeDonusum: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					const tipDizi = [
						(uygunluk.devir ? 'DV' : null),
						(uygunluk.ilkKayit ? ['AL', 'AK'] : null),
						(uygunluk.nakdeDonusum ? 'ND' : null)
					].flat().filter(x => !!x);
					const {where: wh} = sent, {almSat, almSatClause} = this.class;
                    sent.fisHareket('posfis', 'posilkhar').har2CariBagla().har2PosKosulBagla()
                    wh.fisSilindiEkle().inDizi(tipDizi, 'fis.fistipi')
						.add(almSatClause).degerAta(almSat, 'pkos.almsat')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						kayittipi: `(case when fis.fistipi = 'DV' then 'PSDEV' when fis.fistipi = 'ND' then 'PSNAK' when fis.fistipi in ('AL', 'AK') then 'PSTAH' else '??' end)`,
                        banhesapkod: 'har.banhesapkod', tarih: 'coalesce(har.belgetarih, fis.tarih)',
						fisnox: `(case when har.belgeno = 0 then fis.fisnox else har.belgenox end)`,
						oncelik: `(case when fis.fistipi = 'DV' then 0 when fis.fistipi = 'ND' then 9 else 1 end)`,
						ba: `(case when fis.almsat = 'T' then (case when fis.fistipi = 'ND' then 'A' when fis.iade = 'I' then 'A' else 'B' end) else (case when fis.fistipi = 'ND' then 'B' when fis.iade = 'I' then 'B' else 'A' end) end)`,
						islemadi: `(case when fis.fistipi = 'DV' then 'Devir' when fis.fistipi = 'ND' then (case when fis.almsat = 'T' then 'Nakde Dönü?üm' else 'Kr.Kart Ödeme' end) when fis.fistipi in ('AL', 'AK') then (case when fis.almsat = 'T' then 'Pos Tahsil' else 'Kr.Kart ile Ödeme' end) else '??' end)`,
						detaciklama: 'har.aciklama', takipno: 'har.takipno',
						dvkur: 'har.dvkur', bedel: `(case when fis.fistipi = 'ND' then har.brutbedel else har.bedel end)`, dvbedel: 'har.dvbedel',
						ndvade: 'har.nakdedonusumvade', vade: 'har.vade', plasiyerkod: `(case when fis.fistipi = 'AL' then fis.plasiyerkod else '' end)`,
						refkod: `(case when fis.fistipi = 'AL' then har.must else '' end)`, refadi: `(case when fis.fistipi = 'AL' then car.birunvan else '' end)`,
						mustkod: `(case when fis.fistipi = 'AL' then har.must else '' end)`, onayno: 'har.onayno', poskosulkod: 'har.poskosulkod',
						komisyon: 'har.olasikomisyon', katkipayi: 'har.olasikatkipayi'
                    })
                })
            ]
        });
        return this
    }
}
