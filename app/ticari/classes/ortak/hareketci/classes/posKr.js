class PsKrOrtakHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get posmu() { return null }
    static get almSat() { return this.posmu ? 'T' : 'A' } static get almSatClause() { return `fis.almsat = '${this.almSat}'` }
	static mstYapiDuzenle({ result }) {
		super.mstYapiDuzenle(...arguments);
		result.set('banhesapkod', ({ sent, kodClause, mstAlias, mstAdiAlias }) =>
			sent.fromIliski(`banbizhesap ${mstAlias}`, `${kodClause} = ${mstAlias}.kod`).add(`${mstAlias}.aciklama ${mstAdiAlias}`))
	}
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
    static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
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
    /** (Fatura Tahsil/Ödeme) için UNION */
    uniDuzenle_fatKayit({ uygunluk, liste }) {
        $.extend(liste, {
            fatKayit: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
                    sent.fisHareket('piffis', 'pifpostaksit').fis2CariBagla().har2PosKosulBagla();
                    const {where: wh} = sent, {almSatClause, almSat} = this.class;
					wh.fisSilindiEkle().inDizi(['I', 'F', 'P'], 'fis.piftipi')
                        .add(almSatClause).degerAta(almSat, 'pkos.almsat')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kayittipi: `'PIFPOS'`, banhesapkod: 'har.banhesapkod', oncelik: '1',
                        ba: `(case when rtrim(fis.almsat + fis.iade) in ('T', 'AI') then 'B' else 'A' end)`,
                        islemadi: (
							`((case fis.piftipi when 'P' then 'Perakende Fiş' when 'I' then 'İrsaliye' else ` +
								`(case fis.ayrimtipi when 'PR' then 'Mağaza Fiş' else 'Fatura' end) ` +
							`end) + ' ' + (case fis.almsat when 'T' then ' POS Tahsil' else ' Kr.Kart Ödeme' end))`
						),     /* ^--  STRING CONCAT için talimatlarda `+ ' ' +` ile boşluk vermek gerekirdi, muhtemelen unutulmuş */
                        fisaciklama: 'fis.cariaciklama', bedel: 'har.bedel',
                        dvkur: `(case when har.karsidvvar = '' then fis.dvkur else har.karsidvkur end)`,
                        dvbedel: `(case when har.karsidvvar = '' then har.dvbedel else har.karsidvbedel end)`,
                        ndvade: 'har.nakdedonusumvade', takipno: 'fis.orttakipno', refkod: 'fis.must', refadi: 'car.birunvan',
                        plasiyerkod: 'fis.plasiyerkod', mustkod: 'fis.must', poskosulkod: 'har.poskosulkod',
                        komisyon: 'har.olasikomisyon', katkipayi: 'har.olasikatkipayi'
                    })
                })
            ]
        });
        return this
    }
    /** (Cari Tahsilat/Ödeme - cari hesap ile POS/KK ödeme) için UNION */
    uniDuzenle_cariTahsilatOdeme({ uygunluk, liste }) {
        $.extend(liste, {
            cariTahsilatOdeme: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
                    sent.fisHareket('carifis', 'carihar')
						.fis2CariBagla({ mustSaha: 'mustkod' })
						.har2TahSekliBagla().har2PosKosulBagla({ kodSaha: 'tahposkosulkod' })
                        .fromIliski('caripos cpos', 'har.kaysayac = cpos.harsayac')
                    const {where: wh} = sent, {almSat} = this.class;
					/* sadece OR clauseları nesnel olarak ayırmak yeterli, AND kısımları string kalabilir.
						uzun syntaxları bölelim ancak çok karışık hale de getirmeyelim */
					wh.fisSilindiEkle().degerAta(almSat, 'pkos.almsat').add(new MQOrClause([
						`(fis.ba = 'A' and tsek.tahsiltipi = 'PS')`,
						`(fis.ba = 'B' and tsek.tahsiltipi = 'KR')`
					]))
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kaysayac: 'cpos.kaysayac', kayittipi: `'CRPOS'`, banhesapkod: 'har.tahposhesapkod',
                        oncelik: '5', ba: 'dbo.tersba(fis.ba)', islemadi: `(case when fis.ba = 'A' then 'Cari Tahsilat' else 'Cari Ödeme' end)`,
                        anaislemadi: `'Cari Tahsilat/Ödeme'`, detaciklama: 'har.aciklama', ba: 'dbo.tersba(fis.ba)',
                        dvkur: `(case when har.karsidvvar = '' then har.dvkur else har.karsidvkur end)`,
                        bedel: 'cpos.bedel', dvbedel: 'cpos.dvbedel', ndvade: 'cpos.nakdedonusumvade', takipno: 'fis.takipno',
                        refkod: 'fis.mustkod', refadi: 'car.birunvan', plasiyerkod: 'fis.plasiyerkod',
                        mustkod: 'fis.mustkod', poskosulkod: 'har.tahposkosulkod', komisyon: 'cpos.olasikomisyon', katkipayi: 'cpos.olasikatkipayi'
                    })
                })
            ]
        });
        return this
    }
    /** (Çek-Senet Tahsilat/Ödeme - elden tahsil/ödeme) için UNION */
    uniDuzenle_csTahsilatOdeme({ uygunluk, liste }) {
        $.extend(liste, {
            csTahsilatOdeme: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
                    sent.fromAdd('csfis fis')
						/* !! { MQSent::fis2TahSekliBagla} methodu `${alias}.tahseklino = tsek.kodno` ilişkisini verir, { alias } değeri { e?.alias ?? 'fis' } ile alınabiliyor.
							('alias' için default = 'fis') ==> mevcut sentence'a uygundur */
						.fis2TahSekliBagla()
						.fromIliski('cspos cpos', 'fis.kaysayac = cpos.fissayac');
                    const {where: wh} = sent, {posmu} = this.class;
                    wh.fisSilindiEkle().degerAta(posmu ? 'EL' : 'EO', 'fis.fistipi');
					/* Reducing-by-logic following directive:
							if posmu() sent.where.add('fis.belgetipi in ('AC', 'AS')', 'fis.tahsiltipi = 'PS')
							else sent.where.add('fis.belgetipi in ('BC', 'BS')', 'fis.tahsiltipi = 'KR')
						Simplified JS Code is: */
					wh.degerAta(posmu ? 'PS' : 'KR', 'fis.tahsiltipi')
					  .inDizi(posmu ? ['AC', 'AS'] : ['BC', 'BS'], 'fis.belgetipi')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kaysayac: 'cpos.kaysayac', kayittipi: `'CSPOS'`, banhesapkod: 'fis.refhesapkod',
                        oncelik: '5', ba: `(case when fis.belgetipi in ('AC', 'AS') then 'B' else 'A' end)`,
                        islemadi: `(case when fis.belgetipi in ('AC', 'AS') then 'Çek-Senet Elden Tahsil' else 'Çek-Senet Elden Ödeme' end)`,
                        anaislemadi: `'Çek-Senet Tahsilat/Ödeme'`, ba: `(case when fis.belgetipi in ('AC', 'AS') then 'B' else 'A' end)`,
                        dvkur: 'fis.dvkur', bedel: 'cpos.bedel', dvbedel: 'cpos.dvbedel', ndvade: 'cpos.nakdedonusumvade', takipno: 'fis.takipno',
                        poskosulkod: 'tsek.poskosulkod', komisyon: 'cpos.olasikomisyon', katkipayi: 'cpos.olasikatkipayi'
                    });
                })
            ]
        });
        return this
    }
    /** (Genel Dekont) için UNION */
    uniDuzenle_dekont({ uygunluk, liste }) {
        $.extend(liste, {
            dekont: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
                    sent.fisHareket('geneldekontfis', 'geneldekonthar')
						/* !! { MQSent::fis2MuhIslBagla} methodu (muhisl isl) => 'fis.islkod = isl.kod' ilişkisini verir */
						.fis2MuhIslBagla();
                    const {where: wh} = sent, {posmu} = this.class;
                    wh.fisSilindiEkle().add(`fis.ozeltip = ''`);
					wh.degerAta(posmu ? 'PS' : 'PO', 'har.kayittipi')    /* (no cascaded message syntax usage: indent-based visual prettify */
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kayittipi: `'GDEK'`, banhesapkod: 'har.banhesapkod', oncelik: '60', ba: 'har.ba',
                        islemadi: `'Genel Dekont'`, detaciklama: 'har.aciklama', dvkur: 'har.dvkur',
                        ba: 'har.ba', bedel: 'har.bedel', dvbedel: 'har.dvbedel', vade: 'har.vade', takipno: 'har.takipno',
                        refkod: 'fis.islkod', refadi: 'isl.aciklama', poskosulkod: 'har.pkhesapkod'
                    });
                })
            ]
        });
        return this
    }
}
class POSHareketci extends PsKrOrtakHareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get oncelik() { return 3 }
    static get kod() { return 'pos' } static get aciklama() { return 'POS İşlemleri' } static get posmu() { return true }
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
		super.uygunluk2UnionBilgiListeDuzenleDevam(e);
		this.uniDuzenle_nakdeDonusum(e)
	}
    /** (Nakde Dönüşüm (POS) – eski POS nakit dönüşüm işlemleri) için UNION */
    uniDuzenle_nakdeDonusum({ uygunluk, liste }) {
        $.extend(liste, {
            nakdeDonusum: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
                    sent.fisHareket('posfis', 'posdigerhar')
                        .leftJoin('har', 'pifpostaksit fptak', [`har.bagtipi = 'T'`, `har.pifposharsayac = fptak.kaysayac`])
                        .leftJoin('fptak', 'piffis ffis', 'fptak.fissayac = ffis.kaysayac')
                        .leftJoin('har', 'caripos cpos', [`har.bagtipi = 'C'`, `har.caripossayac = cpos.kaysayac`])
                        .leftJoin('cpos', 'carihar char', 'cpos.harsayac = char.kaysayac')
                        .leftJoin('char', 'carifis cfis', 'char.fissayac = cfis.kaysayac')
                        .leftJoin('har', 'posilkhar pilk', [`har.bagtipi = ''`, `har.ilkharsayac = pilk.kaysayac`])
                        .leftJoin('pilk', 'posfis pfis', 'pilk.fissayac = pfis.kaysayac')
                        .leftJoin('pfis', 'carmst rcar', `(case har.bagtipi when 'T' then ffis.must else pilk.must end) = rcar.must`);
                    const {where: wh} = sent, {almSat} = this.class;
					wh.fisSilindiEkle().degerAta(almSat, 'fis.almsat').add(`fis.fistipi = 'TE'`)
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kayittipi: `'PNAK'`, banhesapkod: 'har.banhesapkod', oncelik: '5', islemadi: `'POS Nakde Dönüşüm'`,
                        ba: `(case when fis.almsat = 'T' then 'A' else 'B' end)`, bedel: 'har.brutbedel', refadi: 'rcar.birunvan',
                        refkod: `(case har.bagtipi when 'T' then ffis.must when 'C' then cfis.mustkod else pilk.must end)`,
                        plasiyerkod: `(case har.bagtipi when 'T' then ffis.plasiyerkod when 'C' then cfis.plasiyerkod else pfis.plasiyerkod end)`,
                        poskosulkod: `(case har.bagtipi when 'T' then fptak.poskosulkod when 'C' then char.tahposkosulkod when '' then pilk.poskosulkod else '' end)`,
                        komisyon: 'har.komisyon', katkipayi: 'har.katkipayi'
                    })
                })
            ]
        });
        return this
    }
}
class KrediKartiHareketci extends PsKrOrtakHareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get oncelik() { return 4 }
    static get kod() { return 'krediKart' } static get aciklama() { return 'Kredi Kartı İşlemleri' } static get posmu() { return false }
    /** Hareket tipleri seçimine ek olarak masraf ödeme tipini ekle */
    static hareketTipSecim_kaListeDuzenle(e) {
        super.hareketTipSecim_kaListeDuzenle(e);
        e.kaListe.push(new CKodVeAdi(['masrafOdeme', 'POS Masraf Ödeme (Hizmet)']))
    }
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
        super.uygunluk2UnionBilgiListeDuzenleDevam(e);
		this.uniDuzenle_nakdeDonusum(e).uniDuzenle_masrafOdeme(e)
    }
    /** (Nakde Dönüşüm (KKart) – eski kredi kartı ödeme işlemleri) için UNION */
    uniDuzenle_nakdeDonusum({ uygunluk, liste }) {
        $.extend(liste, {
            nakdeDonusum: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
                    sent.fisHareket('posfis', 'posdigerhar')
                        .leftJoin('har', 'pifpostaksit fptak', [`har.bagtipi = 'T'`, `har.pifposharsayac = fptak.kaysayac`])
                        .leftJoin('fptak', 'piffis ffis', 'fptak.fissayac=ffis.kaysayac')
                        .leftJoin('har', 'caripos cpos', [`har.bagtipi = 'C'`, `har.caripossayac = cpos.kaysayac`])
                        .leftJoin('cpos', 'carihar char', 'cpos.harsayac = char.kaysayac')
                        .leftJoin('char', 'carifis cfis', 'char.fissayac = cfis.kaysayac')
                        .leftJoin('har', 'posilkhar pilk', [`har.bagtipi = ''`, `har.ilkharsayac = pilk.kaysayac`])
                        .leftJoin('pilk', 'posfis pfis', 'pilk.fissayac = pfis.kaysayac');
                    const {where: wh} = sent, {almSat} = this.class;
					wh.fisSilindiEkle().degerAta(almSat, 'fis.almsat').add(`fis.fistipi = 'TE'`)
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kayittipi: `'PNAKF'`, banhesapkod: 'har.banhesapkod', oncelik: '40', islemadi: `'POS Nakit Ödemesi'`,
                        ba: `(case when fis.almsat = 'T' then 'A' else 'B' end)`, bedel: 'har.brutbedel',
                        poskosulkod: `(case har.bagtipi when 'T' then fptak.poskosulkod when 'C' then char.tahposkosulkod when '' then pilk.poskosulkod else '' end)`,
                        /* (komisyon, katkipayi) için { '0' ==> sqlZero } tanımı { this.varsayilanHVDuzenle } seviyesinde zaten mevcut.
							boş değerleri varsayılan varken belirtmeye gerek yok */
                    })
                })
            ]
        });
        return this
    }
    /** (Masraf Ödeme (Hizmet) – kredi kartıyla masraf (hizmet) ödeme işlemi) için UNION */
    uniDuzenle_masrafOdeme({ uygunluk, liste }) {
        $.extend(liste, {
            masrafOdeme: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
                    sent.fisHareket('posfis', 'posilkhar').har2HizmetBagla();
					const {where: wh} = sent; wh.fisSilindiEkle().add(`fis.fistipi = 'MS'`)
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kayittipi: `'PSTAH'`, banhesapkod: 'har.banhesapkod',
                        oncelik: '1', ba: `(case when fis.almsat='T' then 'B' else 'A' end)`,
                        islemadi: `'Kr.Kart ile Masraf Ödeme'`, detaciklama: 'har.aciklama', dvkur: 'har.dvkur',
                        bedel: `(case when fis.iade = 'I' then 0 - har.bedel else har.bedel end)`,
                        dvbedel: `(case when fis.iade = 'I' then 0 - har.dvbedel else har.dvbedel end)`,
                        tarih: `coalesce(har.belgetarih, fis.tarih)`,
                        fisnox: `(case when har.belgeno = 0 then fis.fisnox else har.belgenox end)`,
                        vade: 'har.vade', ndvade: 'har.nakdedonusumvade',
                        takipno: 'har.takipno', refkod: 'har.hizmetkod', refadi: 'hiz.aciklama',
                        hizmetkod: 'har.hizmetkod', poskosulkod: 'har.poskosulkod',
                        komisyon: 'har.olasikomisyon', katkipayi: 'har.olasikatkipayi'
                    })
                })
            ]
        });
        return this
    }
}
