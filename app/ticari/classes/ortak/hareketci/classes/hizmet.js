class HizmetHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    /* Hareket tiplerini (işlem türlerini) belirleyen seçim listesi */
    static hareketTipSecim_kaListeDuzenle({ kaListe }) {
        super.hareketTipSecim_kaListeDuzenle(...arguments);
		let {params} = app, {kullanim: ticGenel} = params.ticariGenel, {kullanim: muhasebe} = params.muhasebe, {kullanim: banka} = params.bankaGenel;
		let {kullanim: alim} = params.alim, {kullanim: satis} = params.satis, {kullanim: aktarim} = params.aktarim;
		kaListe.push(...[
			new CKodVeAdi(['hizmetDevir', 'Devir']), new CKodVeAdi(['Kasa', 'Kasa Hizmet']),
			new CKodVeAdi(['banka', 'Banka Hizmet']), new CKodVeAdi(['cari', 'Cari Hizmet']),
			new CKodVeAdi(['pos', 'POS Hizmet']), new CKodVeAdi(['tahsilatOdeme', 'Cari Tahsilat/Ödeme']),
			new CKodVeAdi(['fatura', 'Fatura Hizmet']), new CKodVeAdi(['perakende', 'Perakende Hizmet']),
			new CKodVeAdi(['genelDekont', 'Genel Dekont']), new CKodVeAdi(['ekMasraf', 'Ek Masraf']),
			(alim.hizmetGiderPusulasi ? new CKodVeAdi(['giderPusula', 'Gider Pusulası']) : null),
			(alim.serbestMeslekMakbuzu || satis.serbestMeslekMakbuzu ? new CKodVeAdi(['serbestMeslek', 'Serbest Meslek']) : null),
			(alim.fason || satis.fason ? new CKodVeAdi(['fasonFatura', 'Fason Fatura']) : null),
			(banka.taksitliKredi ? new CKodVeAdi(['taksitliKredi', 'Banka Taksitli Kredi']) : null),
			(banka.taksitliKredi ? new CKodVeAdi(['krediFaizi', 'Kredi Faiz']) : null),
			(banka.yatirim ? new CKodVeAdi(['yatirimGeliri', 'Banka Yatırım Geliri']) : null),
			(ticGenel.demirbas ? new CKodVeAdi(['demAktif', 'Demirbaş Aktifleştirme']) : null),
			(aktarim.yazarKasa ? new CKodVeAdi(['kasiyer', 'Kasiyer İşlem']) : null),
			(aktarim.guleryuzOnline ? new CKodVeAdi(['goMaliyet', 'Güleryüz Maliyet']) : null)
		].filter(x => !!x))
    }
    /** Varsayılan değer atamaları (hostVars) */
    static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
        /* super.varsayilanHVDuzenle(...arguments); */
		for (let key of ['tarih']) { hv[key] = sqlNull }
		for (let key of [
			'ozelisaret', 'fisnox', 'mustkod', 'refkod', 'refadi', 'plasiyerkod', 'althesapkod',
			'takipno', 'kdetay', 'depkod', 'masrafkod', 'ba'
		]) { hv[key] = sqlEmpty }
		for (let key of [
			'oncelik', 'seq', 'kaysayac', 'fissayac', 'kdetaysayac',
			'miktar', 'bedel', 'dvbedel', 'dvkur'
		]) { hv[key] = sqlZero }
		/* 'mustkod' varsa ['must', 'ticmust'] gereksizdir */
		for (let key of ['must', 'ticmust', 'muhfissayac', 'no']) { delete hv[key] }
		$.extend(hv, {
			bizsubekod: 'fis.bizsubekod', ozelisaret: 'fis.ozelisaret', kaysayac: 'har.kaysayac', hizmetkod: 'har.hizmetkod',
			/*kdetaysayac: 'har.kdetaysayac', kdetay: 'kdet.kdetay',*/ tarih: 'fis.tarih', fisnox: 'fis.fisnox',
			fisaciklama: 'fis.aciklama', detaciklama: 'har.aciklama', bedel: 'har.bedel',
			vade: ({ hv }) => hv.tarih, brutbedel: ({ hv }) => hv.bedel,
			aciklama: ({ hv }) => {
                const withCoalesce = (clause) => `COALESCE(${clause}, '')`, {fisaciklama: fisAciklama, detaciklama: detAciklama} = hv;
                return fisAciklama && detAciklama
                    ? `${withCoalesce(fisAciklama)} + ' ' + ${withCoalesce(detAciklama)}`
                    : withCoalesce(detAciklama || fisAciklama || sqlNull)
            }
        })
    }
    /** UNION sorgusu hazırlama – hareket tipleri için */
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
        super.uygunluk2UnionBilgiListeDuzenleDevam(e);
        this.uniDuzenle_devir(e).uniDuzenle_finansalIslemler(e).uniDuzenle_tahsilatOdeme(e);
		this.uniDuzenle_pos(e).uniDuzenle_dekont(e).uniDuzenle_ekMasraf(e)
    }
    /** (Hizmet Devir) için UNION */
    uniDuzenle_devir({ uygunluk, liste }) {
        $.extend(liste, {
            hizmetDevir: [
                new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						sent.fisHareket('findevirfis', 'findevirhar').har2HizmetBagla().har2KatDetayBagla();
	                    let {where: wh} = sent; wh.fisSilindiEkle().degerAta('HZ', 'fis.fistipi')
	                })
					.hvDuzenleIslemi(({ hv }) => {
	                    $.extend(hv, { kayittipi: `'HZDEV'`, ba: 'har.detba', islemadi: `'Hizmet Devir'` })
	                })
            ]
        });
        return this
    }
	/** (Finansal İşlemler) için UNION */
    uniDuzenle_finansalIslemler({ uygunluk, liste }) {
        let kodClause = 'har.banhesapkod'; $.extend(liste, {
            kasa$banka$cari$serbestMeslek: [
                new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						let tipListe = [
							(uygunluk.kasa ? 'KH' : ''), (uygunluk.banka ? 'HH' : ''),
							(uygunluk.cari ? 'CH' : ''), (uygunluk.serbestMeslek ? 'SM' : '')
						].filter(x => !!x);
						sent.fisHareket('finansfis', 'finanshar').har2HizmetBagla().har2KatDetayBagla()
							.fis2KasaBagla().har2BankaHesapBagla().har2CariBagla()
							.fromIliski('carmst fiscar', 'fis.fismustkod = fiscar.must')
	                    let {where: wh} = sent; wh.fisSilindiEkle().inDizi(tipListe, 'fis.fistipi')
	                })
					.hvDuzenleIslemi(({ hv }) => {
	                    $.extend(hv, {
							kayittipi: `(case fis.fistipi when 'KH' then 'KSHIZ' when 'HH' then 'BNHIZ' when 'CH' then 'CHIZ' when 'SM' then 'SRBMES' else '' end)`,
							depkod: 'har.depkod', masrafkod: 'har.masrafkod', plasiyerkod: 'fis.plasiyerkod', althesapkod: 'har.cariitn',
							tarih: 'coalesce(har.belgetarih, fis.tarih)', vade: 'har.vade',
							fisnox: '(case when har.belgeno = 0 then fis.fisnox else har.belgenox end)',
							ba: '(case when har.btersmi = 0 then dbo.tersba(fis.ba) else fis.ba end)',
							islemadi: (
								`(case fis.fistipi when 'KH' then dbo.batext(fis.ba, 'Kasa Gelir', 'Kasa Gider')` +
								` when 'HH' then dbo.batext(fis.ba, 'Banka Hesap Gelir', 'Banka Hesap Gider')` +
								` when 'CH' then dbo.batext(fis.ba, 'Cari Hes.Gelir', 'Cari Hes.Gider')` +
								` when 'SM' then 'Serbest Meslek Mak.' else '' end)`
							),
							takipno: `(case when fis.fistipi in ('GD', 'SM') then fis.fistakipno else har.takipno end)`,
							mustkod: `(case when fis.fistipi = 'SM' then fis.fismustkod else har.must end)`,
							refkod: `(case fis.fistipi when 'KH' then fis.kasakod when 'HH' then har.banhesapkod when 'CH' then har.must when 'SM' then fis.fismustkod else '' end)`,
							refadi: `(case fis.fistipi when 'KH' then kas.aciklama when 'HH' then bhes.aciklama when 'CH' then car.birunvan when 'SM' then fiscar.birunvan else '' end)`,
							detaciklama: 'dbo.hizmetack(har.belgetarih, har.belgeseri, har.belgeno, har.aciklama)',
							miktar: 'har.miktar', bedel: '(case when har.btersmi = 0 then har.brutbedel else 0 - har.brutbedel end)',
							dvbedel: '(case when har.btersmi = 0 then har.dvbedel else 0 - har.dvbedel end)',
							brutbedel: '(case when har.btersmi = 0 then har.brutbedel else 0 - har.brutbedel end)'
						})
	                })
            ]
        });
        return this
    }
	/** (Cari Tahsilat/Ödeme) için UNION */
    uniDuzenle_tahsilatOdeme({ uygunluk, liste }) {
        $.extend(liste, {
            tahsilatOdeme: [
                new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						sent.fisHareket('carifis', 'carihar')
							.x2HizmetBagla({ kodClause: 'har.tahhizmetkod' })
							.fis2CariBagla({ mustSaha: 'mustkod' }).har2TahSekliBagla()
	                    let {where: wh} = sent; wh.fisSilindiEkle().add(`har.tahhizmetkod <> ''`)
	                })
					.hvDuzenleIslemi(({ hv }) => {
	                    $.extend(hv, {
							kayittipi: `'CRHAR'`, hizmetkod: 'har.tahhizmetkod', plasiyerkod: 'fis.plasiyerkod',
							ba: 'dbo.tersba(fis.ba)', islemadi: `dbo.batext(fis.ba, 'Cari Ödeme', 'Cari Tahsilat')`,
							althesapkod: 'har.detalthesapkod', takipno: 'fis.takipno', mustkod: 'fis.mustkod',
							refkod: 'fis.mustkod', refadi: 'car.birunvan', dvkur: 'har.dvkur', dvbedel: 'har.dvbedel',
							detaciklama: 'dbo.hizmetack(cast(null as datetime), har.belgeseri, har.belgeno, har.aciklama)'
						})
	                })
            ]
        });
        return this
    }
	/** (POS, Nakde Dönüşüm Masraf, Nakde Dönüşüm Katkı Payı) için UNION */
	uniDuzenle_pos({ uygunluk, liste }) {
        $.extend(liste, {
            pos: [
                new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						sent.fisHareket('posfis', 'posilkhar')
							.har2HizmetBagla().har2BankaHesapBagla();
	                    let {where: wh} = sent; wh.fisSilindiEkle()
							.degerAta('MS', 'fis.fistipi')
	                })
					.hvDuzenleIslemi(({ hv }) => {
	                    $.extend(hv, {
							kayittipi: `'PSHIZ'`, tarih: 'coalesce(har.belgetarih, fis.tarih)', vade: 'har.vade',
							ba: `(case when fis.iade = 'I' then 'A' else 'B' end)`,
							islemadi: `'Pos Masraf'`, takipno: 'har.takipno', refkod: 'har.banhesapkod', refadi: 'bhes.aciklama',
							detaciklama: 'dbo.hizmetack(har.belgetarih, har.belgeseri, har.belgeno, har.aciklama)',
							miktar: 'har.miktar', bedel: 'har.brutbedel', dvkur: 'har.dvkur', dvbedel: 'har.dvbedel'
						})
	                }),
				new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						sent.fisHareket('posfis', 'posilkhar')
							.x2HizmetBagla({ kodClause: 'har.masrafkomhizkod'})
							.har2BankaHesapBagla();
	                    let {where: wh} = sent; wh.fisSilindiEkle();
						wh.degerAta('ND', 'fis.fistipi').add(`har.masrafkomhizkod <> ''`, `har.olasikomisyon > 0`)
	                })
					.hvDuzenleIslemi(({ hv }) => {
	                    $.extend(hv, {
							kayittipi: `'PSHIZ'`, hizmetkod: 'har.masrafkomhizkod',
							ba: `'B'`, bedel: 'har.olasikomisyon',
							tarih: 'coalesce(har.belgetarih, fis.tarih)', vade: 'har.vade',
							islemadi: `'Nakde Dönüş. Komisyon'`, takipno: 'har.takipno',
							refkod: 'har.banhesapkod', refadi: 'bhes.aciklama',
							detaciklama: 'dbo.hizmetack(har.belgetarih, har.belgeseri, har.belgeno, har.aciklama)'
						})
	                }),
				new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						sent.fisHareket('posfis', 'posilkhar')
							.x2HizmetBagla({ kodClause: 'har.masrafkathizkod'})
							.har2BankaHesapBagla();
	                    let {where: wh} = sent; wh.fisSilindiEkle();
						wh.degerAta('ND', 'fis.fistipi').add(`har.masrafkathizkod <> ''`, `har.olasikomisyon > 0`)
	                })
					.hvDuzenleIslemi(({ hv }) => {
	                    $.extend(hv, {
							kayittipi: `'PSHIZ'`, hizmetkod: 'har.masrafkathizkod',
							ba: `'B'`, bedel: 'har.olasikatkipayi',
							tarih: 'coalesce(har.belgetarih, fis.tarih)', vade: 'har.vade',
							islemadi: `'Nakde Dönüş. Katkı'`, takipno: 'har.takipno',
							refkod: 'har.banhesapkod', refadi: 'bhes.aciklama',
							detaciklama: 'dbo.hizmetack(har.belgetarih, har.belgeseri, har.belgeno, har.aciklama)'
						})
	                })
            ]
        });
        return this
    }
	/** (Genel Dekont) için UNION */
    uniDuzenle_dekont({ uygunluk, liste }) {
        $.extend(liste, {
            dekont: [
                new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						sent.fisHareket('geneldekontfis', 'geneldekonthar')
							.har2HizmetBagla().har2KatDetayBagla()
							.fromIliski('muhisl isl', 'fis.islkod = isl.kod');
	                    let {where: wh} = sent; wh.fisSilindiEkle();
						wh.degerAta('HZ', 'har.kayittipi').inDizi(['', 'HD', 'KS'], 'fis.ozeltip')
	                })
					.hvDuzenleIslemi(({ hv }) => {
	                    $.extend(hv, {
							kayittipi: `'GDEK'`, depkod: 'har.depkod', masrafkod: 'har.masrafkod',
							vade: 'har.vade', ba: 'har.ba', islemadi: `('Dekont (' + RTRIM(isl.aciklama) + ')')`,
							althesapkod: 'har.cariitn', takipno: 'har.takipno',
							detaciklama: 'har.aciklama', miktar: 'har.miktar', dvbedel: 'har.dvbedel'
						})
	                })
            ]
        });
        return this
    }
	/** (Havale/EFT Masrafı, Senet Protesto [Masraf]) için UNION */
	uniDuzenle_ekMasraf({ uygunluk, liste }) {
        $.extend(liste, {
            ekMasraf: [
                new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						sent.fisHareket('hefis', 'hehar')
							.x2HizmetBagla({ kodClause: 'har.masrafhizkod' })
							.fis2BankaHesapBagla();
	                    let {where: wh} = sent; wh.fisSilindiEkle().add(...[							/* '...[]' gereksiz - sadece collapse için eklendi, method (...array) alıyor zaten */
							new MQOrClause()
								.inDizi(['SH', 'SE', 'SS', 'BH', 'BE', 'BS'], 'fis.fistipi')
								.add(...[																/* '...[]' gereksiz - sadece collapse için eklendi, method (...array) alıyor zaten */
									new MQAndClause()
										.degerAta('TP', 'fis.fistipi')
										.degerAta('A', 'har.hba')
										.add(`har.masraf > 0`)
								])
						])
	                })
					.hvDuzenleIslemi(({ hv, sqlEmpty }) => {
	                    $.extend(hv, {
							kayittipi: `'BNHE'`, hizmetkod: 'har.masrafhizkod',
							kdetaysayac: 'cast(null as int)', kdetay: sqlEmpty,
							tarih: 'coalesce(har.belgetarih, fis.tarih)', ba: `'B'`, bedel: 'har.masraf',
							fisnox: '(case when har.belgeno > 0 then har.belgenox else fis.fisnox end)',
							islemadi: (
								`(case when fis.fistipi = 'BH' then 'Kendimize Havale' when fis.fistipi = 'BE' then 'Kendimize EFT'` +
								` when fis.fistipi = 'BS' then 'Kendimize Swift'` +
								` when (fis.fistipi = 'SH' or (fis.fistipi = 'TP' and har.hisl = 'AHAV')) then 'Satıcıya Havale'` +
								` when (fis.fistipi = 'SE' or (fis.fistipi = 'TP' and har.hisl = 'AEFT')) then 'Satıcıya EFT'` +
								` when (fis.fistipi = 'SS' or (fis.fistipi = 'TP' and har.hisl = 'ASWF')) then 'Satıcıya Swift' else '' end)`
							),
							althesapkod: 'har.cariitn', takipno: 'har.takipno', mustkod: 'har.must',
							refkod: 'fis.banhesapkod', refadi: 'bhes.aciklama',
							detaciklama: 'dbo.hizmetack(har.belgetarih, har.belgeseri, har.belgeno, har.aciklama)'
						})
	                }),
				new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						sent.fisHareket('csfis', 'csdigerhar')
							.x2HizmetBagla({ kodClause: 'har.masrafhizkod' })
							.leftJoin('fis', 'banbizhesap bhes', [`fis.fistipi = 'KR'`, 'fis.banhesapkod = bhes.kod'])
							.leftJoin('fis', 'csportfoy prt', [`fis.fistipi = 'EK'`, 'fis.portfkod = prt.kod'])
							.leftJoin('fis', 'carmst ciran', [`fis.fistipi = '3K'`, 'fis.fisciranta = ciran.must']);
	                    let {where: wh} = sent; wh.fisSilindiEkle();
						wh.inDizi(['KR', 'EK', '3K'], 'fis.fistipi').add(`har.masraf > 0`)
	                })
					.hvDuzenleIslemi(({ hv, sqlEmpty }) => {
	                    $.extend(hv, {
							kayittipi: `'CSDIG'`, hizmetkod: 'har.masrafhizkod',
							kdetaysayac: 'cast(null as int)', kdetay: sqlEmpty,
							ba: `'B'`, bedel: 'har.masraf', islemadi: `'Protesto Masrafı'`, takipno: 'fis.takipno',
							refkod: `(case fis.fistipi when 'KR' then fis.banhesapkod when 'EK' then fis.portfkod when '3K' then fis.fisciranta else '' end)`,
							refadi: `(case fis.fistipi when 'KR' then bhes.aciklama when 'EK' then prt.aciklama when '3K' then ciran.birunvan else '' end)`
						})
	                })
            ]
        });
        return this
    }

	/* TEST:
			let har = new HizmetHareketci();
			try { let stm = har.stmOlustur(); console.table(await app.sqlExecSelect(stm)) }
			catch (ex) { console.error(getErrorText(ex)) }
	*/
}
