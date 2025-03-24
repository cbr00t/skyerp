class CSHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    static get almSat() { return this.posmu ? 'T' : 'A' } static get almSatClause() { return `fis.almsat = '${this.almSat}'` }
    /* Hareket tiplerini (işlem türlerini) belirleyen seçim listesi */
    static hareketTipSecim_kaListeDuzenle({ kaListe }) {
        super.hareketTipSecim_kaListeDuzenle(...arguments); const {posmu} = this;
        kaListe.push(...[
            new CKodVeAdi(['devir', posmu ? 'POS Devir' : 'Kredi Kart Devir']),
            new CKodVeAdi(['ilkKayit', posmu ? 'POS ile Tahsil' : 'Kredi Kart ile Ödeme']),
            new CKodVeAdi(['fatKayit', `Fatura ${posmu ? 'POS ile Tahsil' : 'Kredi Kart ile Ödeme'}`]),
            new CKodVeAdi(['cariTahsilatOdeme', `Cari ${posmu ? 'Tahsilat' : 'Ödeme'}`]),
            new CKodVeAdi(['csTahsilatOdeme', `Çek-Senet ${posmu ? 'Tahsilat' : 'Ödeme'}`]),
            new CKodVeAdi(['nakdeDonusum', posmu ? 'POS Nakde Dönüşüm' : 'Kredi Kartina Ödeme']),
            new CKodVeAdi(['dekont', 'Genel Dekont'])
        ]/*.filter(x => !!x)*/)
    }
    /** Varsayılan değer atamaları (host vars) – temel sınıfa eklemeler.
		Hareketci.varsayilanHVDuzenle değerleri aynen alınır, sadece eksikler eklenir */
    static varsayilanHVDuzenle({hv, sqlNull, sqlEmpty, sqlZero}) {
        super.varsayilanHVDuzenle(...arguments);
		/* yeni talimat: { (ozelisaret: '') değerleri (ozelisaret = 'fis.ozelisaret') olmalı.
			bu da base.varsayilanHVDuzenle seviyesinde mevcut.
			sqlEmpty ataması bu yüzden bu seviyede sadece comment yapıldı } */
		for (const key of [/*'ozelisaret',*/ 'mustkod', 'hizmetkod']) { hv[key] = sqlEmpty }
		for (const key of ['onayno', 'komisyon', 'katkipayi']) { hv[key] = sqlZero }
		/* 'mustkod' olan durumda ('must', 'ticmust') sahalarına ihtiyaç yok, bunların yerini alır */
		for (const key of ['must', 'ticmust']) { delete hv[key] }
		$.extend(hv, {
			/* 'ndvade' (nakde dönüşüm vadesi) değeri aksi belirtilemdikçe = (hv.vade) değeri ile aynıdır */
			ndvade: ({ hv }) => hv.vade,
			/* 'anaislemadi' yoksa 'islemadi' degeri esas alinir */
			anaislemadi: ({ hv }) => hv.islemadi,
			/* 'detaciklama' gecicidir - 'detaciklama' ve 'fisaciklama' birleserek 'aciklama' olusturulur. (bos olan alinmaz) */
			aciklama: ({ hv }) => {
                const withCoalesce = (clause) => `COALESCE(${clause}, '')`;
                const {fisaciklama: fisAciklama, detaciklama: detAciklama} = hv;
                return fisAciklama && detAciklama 
                    ? `${withCoalesce(fisAciklama)} + ' ' + ${withCoalesce(detAciklama)}` 
                    : withCoalesce(detAciklama || fisAciklama)
            }
		})
    }
    /** UNION sorgusu hazırlama – hareket tipleri için */
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
        super.uygunluk2UnionBilgiListeDuzenleDevam(e); this.uniDuzenle_devir$ilkKayit$nakdeDonusum(e).uniDuzenle_fatKayit(e);
        this.uniDuzenle_cariTahsilatOdeme(e).uniDuzenle_csTahsilatOdeme(e).uniDuzenle_dekont(e)
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
