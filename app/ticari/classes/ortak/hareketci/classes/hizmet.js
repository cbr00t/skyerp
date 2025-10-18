class HizmetHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kisaKod() { return 'H' } static get kod() { return 'hizmet' } static get aciklama() { return 'Hizmet' }
	static get donemselIslemlerIcinUygunmu() { return false }
	static altTipYapilarDuzenle(e) { super.altTipYapilarDuzenle(e); e.def.sol() }
	static mstYapiDuzenle({ result }) {
		super.mstYapiDuzenle(...arguments)
		result.set('hizmetkod', ({ sent, kodClause, mstAlias, mstAdiAlias }) =>
			sent.fromIliski(`hizmst ${mstAlias}`, `${kodClause} = ${mstAlias}.kod`)
				.add(`${mstAlias}.aciklama ${mstAdiAlias}`))
	}
    /* Hareket tiplerini (işlem türlerini) belirleyen seçim listesi */
    static hareketTipSecim_kaListeDuzenle({ kaListe }) {
        super.hareketTipSecim_kaListeDuzenle(...arguments)
		let {params} = app, {kullanim: ticGenel} = params.ticariGenel, {kullanim: muhasebe} = params.muhasebe, {kullanim: banka} = params.bankaGenel
		let {kullanim: alim} = params.alim, {kullanim: satis} = params.satis, {kullanim: aktarim} = params.aktarim
		kaListe.push(...[
			new CKodVeAdi(['hizmetDevir', 'Devir']), new CKodVeAdi(['kasa', 'Kasa Hizmet']),
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
	uniOrtakSonIslem({ hvDegeri, sent, sent: { from } }) {
		super.uniOrtakSonIslem(...arguments)
		let kodClause = hvDegeri('hizmetkod') || 'har.hizmetkod'
		/*if (!from.aliasIcinTable('sub')) { sent.fis2SubeBagla() }
		if (!from.aliasIcinTable('igrp')) { sent.sube2GrupBagla() }*/
		if (!from.aliasIcinTable('hiz')) { sent.fromIliski('hizmst hiz', `${kodClause} = hiz.kod`) }
		if (!from.aliasIcinTable('grp')) { sent.hizmet2GrupBagla() }
		if (!from.aliasIcinTable('sigrp')) { sent.hizmet2IstGrupBagla() }
		// if (!from.aliasIcinTable('isl')) { sent.fis2StokIslemBagla() }
	}
    /** Varsayılan değer atamaları (hostVars) */
    static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
        /* super.varsayilanHVDuzenle(...arguments) */
		for (let key of ['tarih', 'kdetaysayac']) { hv[key] = sqlNull }
		for (let key of [
			'alttip', 'ozelisaret', 'fisnox', 'mustkod', 'refkod', 'refadi', 'plasiyerkod', 'althesapkod',
			'takipno', 'kdetay', 'depkod', 'masrafkod', 'ba', 'tahhizmetkod', 'masrafhizkod', 'masrafkathizkod',
			'anagrupkod', 'anagrupadi', 'grupkod', 'grupadi', 'hizmetadi', 'histgrupkod', 'histgrupadi', 'kategorikod', 'kategoriadi', 'katdetay'
		]) { hv[key] = sqlEmpty }
		for (let key of [
			'oncelik', 'seq', 'kaysayac', 'fissayac', 'miktar', 'bedel', 'dvbedel', 'dvkur'
		]) { hv[key] = sqlZero }
		
		/* 'mustkod' varsa ['must', 'ticmust'] gereksizdir */
		for (let key of ['must', 'ticmust', 'muhfissayac', 'no']) { delete hv[key] }
		$.extend(hv, {
			bizsubekod: 'fis.bizsubekod', ozelisaret: 'fis.ozelisaret', kaysayac: 'har.kaysayac', hizmetkod: 'har.hizmetkod',
			/*kdetaysayac: 'har.kdetaysayac', kdetay: 'kdet.kdetay',*/ tarih: 'fis.tarih', fisnox: 'fis.fisnox',
			fisaciklama: 'fis.aciklama', detaciklama: 'har.aciklama', bedel: 'har.bedel',
			vade: ({ hv }) => hv.tarih, brutbedel: ({ hv }) => hv.bedel, isaretlibedel: ({ hv }) => hv.bedel,
			aciklama: ({ hv }) => {
                const withCoalesce = (clause) => `COALESCE(${clause}, '')`, {fisaciklama: fisAciklama, detaciklama: detAciklama} = hv;
                return fisAciklama && detAciklama
                    ? `${withCoalesce(fisAciklama)} + ' ' + ${withCoalesce(detAciklama)}`
                    : withCoalesce(detAciklama || fisAciklama || sqlEmpty)
            }
        })
    }
    /** UNION sorgusu hazırlama – hareket tipleri için */
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
        super.uygunluk2UnionBilgiListeDuzenleDevam(e);
        this.uniDuzenle_devir(e).uniDuzenle_finansalIslemler(e).uniDuzenle_tahsilatOdeme(e);
		this.uniDuzenle_pos(e);this.uniDuzenle_dekont(e).uniDuzenle_ekMasraf(e).uniDuzenle_goMaliyet(e);
		this.uniDuzenle_fatura_giderPusula_perakende(e).uniDuzenle_fasonFatura(e);
		this.uniDuzenle_taksitliKredi(e).uniDuzenle_krediFaizi(e).uniDuzenle_yatirimGeliri(e)
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
						sent.fisHareket('finansfis', 'finanshar')
							.har2HizmetBagla().har2KatDetayBagla()
							.fis2KasaBagla().har2BankaHesapBagla().har2CariBagla()
							.fromIliski('carmst fiscar', 'fis.fismustkod = fiscar.must');
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
            genelDekont: [
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
					.hvDuzenleIslemi(({ hv, sqlNull, sqlEmpty }) => {
	                    $.extend(hv, {
							kayittipi: `'BNHE'`, hizmetkod: 'har.masrafhizkod', kdetaysayac: sqlNull, kdetay: sqlEmpty,
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
					.hvDuzenleIslemi(({ hv, sqlNull, sqlEmpty }) => {
	                    $.extend(hv, {
							kayittipi: `'CSDIG'`, hizmetkod: 'har.masrafhizkod', kdetaysayac: sqlNull, kdetay: sqlEmpty,
							ba: `'B'`, bedel: 'har.masraf', islemadi: `'Protesto Masrafı'`, takipno: 'fis.takipno',
							refkod: `(case fis.fistipi when 'KR' then fis.banhesapkod when 'EK' then fis.portfkod when '3K' then fis.fisciranta else '' end)`,
							refadi: `(case fis.fistipi when 'KR' then bhes.aciklama when 'EK' then prt.aciklama when '3K' then ciran.birunvan else '' end)`
						})
	                })
            ]
        });
        return this
    }
	/** (Güleryüz Maliyet) için UNION */
	uniDuzenle_goMaliyet({ uygunluk, liste }) {
		const getUniBilgi = tahakkukmu => {
			return new Hareketci_UniBilgi()
				.sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent;
                    sent.fromAdd('gofirmahakedis ghak')
						.innerJoin('ghak', 'gofirmaekhizmet ekhiz', 'ghak.kaysayac = ekhiz.fissayac')
						.fromIliski('gomstfirma gfrm', 'ghak.firmaid = gfrm.webrefid')
						.fromIliski('gomstcalismaalan gcaln', 'ghak.calismaalanid = gcaln.webrefid')
						.fromIliski('gomstekhizmet ghiz', 'ekhiz.ekhizmetid = ghiz.webrefid')
						.fromIliski('gofmal2tip2hizmet fhdon', ['ghak.firmaid = fhdon.firmaid', 'ekhiz.ekhizmetid = fhdon.hizmetid'])
					wh.add(`fhdon.hizmetkod > ''`);
					if (tahakkukmu) { wh.degerAta('T', 'ghiz.tip') }
				})
				.hvDuzenleIslemi(({ hv, sqlNull, sqlEmpty }) => {
					$.extend(hv, {
						kaysayac: sqlNull, kdetay: sqlEmpty, kdetaysayac: sqlNull,
						bizsubekod: sqlEmpty, detaciklama: sqlEmpty,
						kayittipi: `'GOML'`, hizmetkod: 'fhdon.hizmetkod', tarih: 'ghak.tarih', fisnox: 'ghak.fisnox',
                        takipno: 'ghak.takipno', fisaciklama: 'gcaln.aciklama',
						islemadi: `('GO-${tahakkukmu ? 'Hakediş' : 'Gider'}: ' + RTRIM(ghiz.aciklama))`,
						refadi: 'gfrm.aciklama', ba: `'${tahakkukmu ? 'A' : 'B'}'`, bedel: 'ekhiz.ekhizmetbedeli'
					})
				})
		}
        $.extend(liste, { goMaliyet: [getUniBilgi(false), getUniBilgi(true)] });
        return this
	}
	/** (Fatura & Gider Pusula & Perakende) için UNION */
	uniDuzenle_fatura_giderPusula_perakende({ uygunluk, liste }) {
		$.extend(liste, {
			fatura$giderPusula$perakende: [
				/* 1) Fiş-Detay Hareketleri */
				new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						let {fatura, giderPusula, perakende} = uygunluk;
						let pifTipleri = [], ayrimTipleri = [], ayrimTipEkClauses = [];
						if (fatura) { pifTipleri.push('F') }
						if (giderPusula || perakende) {
							pifTipleri.push('P'); ayrimTipleri.push(giderPusula ? 'GP' : '');  /* ya 'giderPusula' ya da 'perakende' dir */
							ayrimTipEkClauses.push(new MQOrClause([`fis.piftipi <> 'P'`]).inDizi(ayrimTipleri, 'fis.ayrimtipi'))
						}
						/* dbSent.js: yeni method:
								fis2DegAdresBagla(e) { this.fromIliski('degiskenadres dadr', 'fis.degiskenvknox = dadr.vknox'); return this } */
						sent.fisHareket('piffis', 'pifhizmet').fis2CariBagla()
							.har2KatDetayBagla().fis2DegAdresBagla();
						let {where: wh} = sent; wh.fisSilindiEkle();
						wh.inDizi(pifTipleri, 'fis.piftipi');
						if (ayrimTipEkClauses.length) { wh.add(...ayrimTipEkClauses) }
					})
					.hvDuzenleIslemi(({ hv }) => {
						$.extend(hv, {
							kayittipi: `'PIFHZ'`, depkod: 'har.depkod',
							masrafkod: `(case when fis.masrafortakdir = '' then har.detmasrafkod else fis.masrafkod end)`,
							plasiyerkod: 'fis.plasiyerkod', vade: 'fis.ortalamavade', miktar: 'har.miktar', dvkur: 'fis.dvkur',
							ba: `(case when har.btersmi = 0 then dbo.almsattext(fis.almsat, 'B', 'A') else dbo.almsattext(fis.almsat, 'A', 'B') end)`,
							bedel: '(case when har.btersmi = 0 then (har.bedel - har.dipiskonto) else 0 - (har.bedel - har.dipiskonto) end)',
							dvbedel: '(case when har.btersmi = 0 then har.dvbedel else 0 - har.dvbedel end)',
							islemadi: (
								`(case when fis.piftipi = 'F' then dbo.iadetext(fis.iade, dbo.almsattext(fis.almsat, 'Alım Fatura', 'Satış Fatura'))` +
								` else (case when fis.ayrimtipi = 'GP' then 'Gider Pusulası' else dbo.iadetext(fis.iade, dbo.almsattext(fis.almsat, 'Perakende Alım', 'Perakende Satış')) end)` +
								` end)`
							),
							althesapkod: 'fis.cariitn', takipno: 'har.dettakipno', mustkod: 'fis.must',
							refkod: `(case when fis.ayrimtipi = 'GP' then fis.degiskenvknox else fis.must end)`,
							refadi: `(case when fis.ayrimtipi = 'GP' then dadr.birunvan else car.birunvan end)`,
							detaciklama: `dbo.strconcat(coalesce(har.degiskenadi, ''), har.ekaciklama)`
						})
					}),
				/* 2) Tahsilat şeklinde Hizmet verilmesi */
				new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						let {fatura, giderPusula, perakende} = uygunluk;
						let pifTipleri = [
							(fatura ? 'F' : null),
							(giderPusula || perakende ? 'P' : null)
						].filter(x => x != null);
						sent.fisHareket('piffis', 'piftaksit').fis2CariBagla().x2TahSekliBagla({ kodClause: 'har.taktahsilsekli' });
						let {where: wh} = sent; wh.fisSilindiEkle();
						wh.inDizi(pifTipleri, 'fis.piftipi').degerAta('HZ', 'tsek.tahsiltipi')
					})
					.hvDuzenleIslemi(({ hv, sqlNull, sqlEmpty }) => {
						$.extend(hv, {
							kayittipi : `'PIFTK'`, hizmetkod: 'tsek.hizmetkod', plasiyerkod: 'fis.plasiyerkod',
							refkod: 'fis.must', refadi: 'car.birunvan', althesapkod: 'fis.cariitn', mustkod: 'fis.must',
							vade: 'har.vade', ba: `dbo.almsattext(fis.almsat, 'B', 'A')`, dvkur: 'fis.dvkur', dvbedel: 'har.dvbedel',
							kdetaysayac: sqlNull, kdetay: sqlEmpty, fisaciklama: 'fis.cariaciklama',
							islemadi: (
								`(case when fis.piftipi = 'F' then dbo.iadetext(fis.iade, dbo.almsattext(fis.almsat, 'Alım Fatura', 'Satış Fatura'))` +
								` else dbo.iadetext(fis.iade, dbo.almsattext(fis.almsat, 'Perakende Alım', 'Perakende Satış')) end)`
							)
						})
					}),
				/* 3) Fatura Dip Hizmetleri */
				new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						let {fatura, giderPusula, perakende} = uygunluk;
						let pifTipleri = [
							(fatura ? 'F' : null),
							(giderPusula || perakende ? 'P' : null)
						].filter(x => x != null);
						sent.fisHareket('piffis', 'pifdiphizmet').fis2CariBagla();
						let {where: wh} = sent; wh.fisSilindiEkle();
						wh.inDizi(pifTipleri, 'fis.piftipi');
						wh.add(`har.anatip <> 'II'`)    /* dip kisma atilan satir iskonto alinmaz */
					})
					.hvDuzenleIslemi(({ hv, sqlNull, sqlEmpty }) => {
						$.extend(hv, {
							kayittipi: `'PIFDIP'`, plasiyerkod: 'fis.plasiyerkod', vade: 'fis.ortalamavade',
							althesapkod: 'fis.cariitn', takipno: 'fis.orttakipno', mustkod: 'fis.must',
							ba: 'har.ba', bedel: 'har.bedel', dvkur: 'fis.dvkur', dvbedel: 'har.dvbedel',
							kdetaysayac: sqlNull, kdetay: sqlEmpty, fisaciklama: 'fis.cariaciklama',
							islemadi: (
								`(case when fis.piftipi = 'F' then dbo.iadetext(fis.iade, dbo.almsattext(fis.almsat, 'Alım Fatura', 'Satış Fatura'))` +
								` else dbo.iadetext(fis.iade, dbo.almsattext(fis.almsat, 'Perakende Alım', 'Perakende Satış')) end)`
							)
						})
					})
			]
		});
		return this
	}
	/* (Fason Fatura) için UNION */
	uniDuzenle_fasonFatura({ uygunluk, liste }) {
		const getUniBilgi = (karsimi, duzenleyici) => {
			return new Hareketci_UniBilgi()
				.sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent;
                    sent.fisHareket('piffis', 'piffsstok').fis2CariBagla().har2KatDetayBagla();
					wh.fisSilindiEkle().degerAta('F', 'piftipi').degerAta('FS', 'fis.ayrimtipi');
					duzenleyici?.call(this, { sent, wh })
				})
				.hvDuzenleIslemi(({ hv, sqlNull, sqlEmpty }) => {
					let baArgs = [`'B'`, `'A'`]; if (karsimi) { baArgs.reverse() }
					let islemAdiClause = `dbo.iadetext(fis.iade, dbo.almsattext(fis.almsat, 'Alım Fason Fatura', 'Satış Fason Fatura'))`;
					$.extend(hv, {
						kayittipi: `'PIFFS'`, depkod: 'har.depkod', plasiyerkod: 'fis.plasiyerkod',
						althesapkod: 'fis.cariitn', takipno: 'har.dettakipno', mustkod: 'fis.must',
						refkod: 'fis.must', refadi: 'car.birunvan',
						vade: 'fis.ortalamavade', ba: `dbo.almsattext(fis.almsat, ${baArgs.join(', ')})`,
						miktar: 'har.miktar', dvkur: 'fis.dvkur', bedel: '(har.bedel - har.dipiskonto)', dvbedel: 'har.dvbedel',
						islemadi: `${islemAdiClause}${karsimi ? ` + 'Karşılık'` : ''}`,
						fisaciklama: 'fis.cariaciklama', detaciklama: 'har.ekaciklama'
					})
				})
		}
        $.extend(liste, {
			fasonFatura: [
				getUniBilgi(false),
				getUniBilgi(true, ({ wh }) => wh.degerAta('A', 'fis.almsat'))    /* Fason Alım karşılığı */
			]
		});
        return this
	}
	/* (Taksitli Kredi) için UNION */
    uniDuzenle_taksitliKredi({ uygunluk, liste }) {
        $.extend(liste, {
            taksitliKredi: [
                new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						sent.fromAdd('kredifis fis').fis2KrediBankaHesapBagla();
	                    let {where: wh} = sent; wh.fisSilindiEkle();
						wh.degerAta('A', 'fis.fistipi').degerAta('H', 'fis.hedeftipi')    /* Hizmet Karşılığı Alınan Kredi ise */
	                })
					.hvDuzenleIslemi(({ hv, sqlNull, sqlEmpty }) => {
	                    $.extend(hv, {
							kaysayac: 'fis.kaysayac', kayittipi: `'KRE'`, hizmetkod: 'fis.hizmetkod',
							islemadi: `'Kredi Alımı'`, refkod: 'fis.kredihesapkod', refadi: 'bhes.aciklama',
							ba: `'B'`, bedel: 'fis.topbrutbedel',
							kdetaysayac: sqlNull, kdetay: sqlEmpty, detaciklama: sqlEmpty
						})
	                })
            ]
        });
        return this
    }
	/* (Kredi Faizi) için UNION */
	uniDuzenle_krediFaizi({ uygunluk, liste }) {
        $.extend(liste, {
            krediFaizi: [
				/* 1) Kredi alım veya devir */
                new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						sent.fisHareket('kredifis', 'kredihar').fis2KrediBankaHesapBagla();
	                    let {where: wh} = sent; wh.fisSilindiEkle();
						wh.inDizi(['A', 'D'], 'fis.fistipi').add(`har.faiz <> 0`)
	                })
					.hvDuzenleIslemi(({ hv, sqlNull, sqlEmpty }) => {
						let {zorunlu} = app.params, cariYil = zorunlu.cariYil || today().yil;
	                    $.extend(hv, {
							kaysayac: 'fis.kaysayac', kayittipi: `'KRFZ'`, refkod: 'fis.kredihesapkod', refadi: 'bhes.aciklama',
							hizmetkod: `(case when year(coalesce(har.vade, fis.tarih)) <= ${cariYil} then fis.bufaizhizmetkod else fis.gelfaizhizmetkod end)`,
							islemadi: `(case when fis.fistipi = 'D' then 'Kredi Devir' else 'Kredi Alımı' end)`,
							vade: 'har.vade', ba: `'B'`, bedel: 'har.faiz', dvbedel: 'har.dvfaiz',
							kdetaysayac: sqlNull, kdetay: sqlEmpty, detaciklama: sqlEmpty
						})
	                }),
				/* 2) Kendimize havale ile Kredi kapatımı */
				new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						sent.fisHareket('hefis', 'hehar').fis2BankaHesapBagla()
							.fromIliski('kredihar khar', 'har.krediharsayac = khar.kaysayac')
							.fromIliski('kredifis kfis', 'khar.fissayac = kfis.kaysayac');
	                    let {where: wh} = sent; wh.fisSilindiEkle();
						wh.degerAta('BH', 'fis.fistipi').add(`har.krediharsayac IS NOT NULL`, `har.kredifaiz <> 0`)
	                })
					.hvDuzenleIslemi(({ hv, sqlNull, sqlEmpty }) => {
						$.extend(hv, {
							kaysayac: 'fis.kaysayac', kayittipi: `'KRHV'`, hizmetkod: 'har.faizkrehizkod',
							islemadi: `'Kendimize Havale'`, refkod: 'fis.banhesapkod', refadi: 'bhes.aciklama',
							vade: 'khar.vade', ba: `'A'`, bedel: 'har.kredifaiz', dvbedel: 'har.kredidvfaiz',
							kdetaysayac: sqlNull, kdetay: sqlEmpty, detaciklama: sqlEmpty
						})
	                }),
				/* 3) Banka Yatan ile Kredi kapatımı */
				new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						sent.fisHareket('finansfis', 'finanshar').fis2KasaBagla()
							.fromIliski('kredihar khar', 'har.krediharsayac = khar.kaysayac')
							.fromIliski('kredifis kfis', 'khar.fissayac = kfis.kaysayac');
	                    let {where: wh} = sent; wh.fisSilindiEkle();
						wh.degerAta('KB', 'fis.fistipi').degerAta('A', 'fis.ba');
						wh.add(`har.krediharsayac IS NOT NULL`, `har.kredifaiz <> 0`)
	                })
					.hvDuzenleIslemi(({ hv, sqlNull, sqlEmpty }) => {
						$.extend(hv, {
							kaysayac: 'fis.kaysayac',kayittipi: `'KRYT'`, hizmetkod: 'har.faizkrehizkod',
							islemadi: `'Kendimize Havale'`, refkod: 'fis.kasakod', refadi: 'kas.aciklama',
							vade: 'khar.vade', ba: `'A'`, bedel: 'har.kredifaiz', dvbedel: 'har.kredidvfaiz',
							kdetaysayac: sqlNull, kdetay: sqlEmpty, detaciklama: sqlEmpty
						})
	                })
            ]
        });
        return this
    }
	/* (Taksitli Kredi) için UNION */
    uniDuzenle_yatirimGeliri({ uygunluk, liste }) {
        $.extend(liste, {
            yatirimGeliri: [
                new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						sent.fisHareket('finansfis', 'finanshar').har2BankaHesapBagla();
	                    let {where: wh} = sent; wh.fisSilindiEkle().degerAta('HY', 'fis.fistipi')
	                })
					.hvDuzenleIslemi(({ hv, sqlNull, sqlEmpty }) => {
	                    $.extend(hv, {
							kaysayac: 'fis.kaysayac', kayittipi: `'YAT'`,
							islemadi: `'Yatırım Geliri'`, refkod: 'har.banhesapkod', refadi: 'bhes.aciklama',
							ba: `'A'`, bedel: 'har.brutbedel', dvbedel: 'har.dvbrutbedel',
							kdetaysayac: sqlNull, kdetay: sqlEmpty
						})
	                })
            ]
        });
        return this
    }
	static maliTablo_secimlerYapiDuzenle({ tip2SecimMFYapi, result }) {
		super.maliTablo_secimlerYapiDuzenle(...arguments)
		$.extend(result, {
			sube: DMQSube, subeGrup: DMQSubeGrup, mst: DMQHizmet, grup: DMQHizmetGrup, anaGrup: DMQHizmetAnaGrup,
			istGrup: DMQHizmetIstGrup, isl: DMQMuhIslem, muhHesap: DMQMuhHesap
		})
	}
	static maliTablo_secimlerSentDuzenle({ detSecimler: sec, sent, sent: { from }, where: wh, hv, mstClause, maliTablo }) {
		super.maliTablo_secimlerSentDuzenle(...arguments)
		// let {det: { shStokHizmet = {} } = {}} = maliTablo ?? {}, {hizmetmi} = shStokHizmet
		mstClause ||= hv.shkod || 'har.hizmetkod'
		let grpClause = hv.grupkod || 'hiz.grupkod', aGrpClause = hv.anaGrupkod || 'grp.anagrupkod'
		let iGrpClause = hv.istgrupkod || 'hiz.histgrupkod', islClause = hv.islkod || 'fis.islkod'
		let muhHesapClause = hv.muhhesapkod || 'hiz.muhhesapkod'
		if (sec) {
			/*wh.basiSonu(sec.subeKod, 'fis.bizsubekod').ozellik(sec.subeAdi, 'sub.aciklama')*/
			wh.basiSonu(sec.subeGrupKod, 'sub.isygrupkod').ozellik(sec.subeGrupAdi, 'igrp.aciklama')
			wh.basiSonu(sec.mstKod, mstClause).ozellik(sec.mstAdi, 'hiz.aciklama')
			wh.basiSonu(sec.grupKod, grpClause).ozellik(sec.grupAdi, 'grp.aciklama')
			wh.basiSonu(sec.anaGrupKod, aGrpClause).ozellik(sec.anaGrupAdi, 'agrp.aciklama')
			wh.basiSonu(sec.istGrupKod, iGrpClause).ozellik(sec.istGrupAdi, `higrp.aciklama`)
			if (sec.islKod.value && !from.aliasIcinTable('isl')) { sent.fis2StokIslemBagla() }
			wh.basiSonu(sec.islKod, islClause).ozellik(sec.islAdi, 'isl.aciklama')
			wh.basiSonu(sec.muhHesap, muhHesapClause)
		}
	}

	/* TEST:
			let har = new HizmetHareketci();
			try { let stm = har.stmOlustur(); console.table(await app.sqlExecSelect(stm)) }
			catch (ex) { console.error(getErrorText(ex)) }
	*/
}
