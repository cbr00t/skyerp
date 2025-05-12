class MasrafHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get oncelik() { return 7 }
	static get kod() { return 'masraf' } static get aciklama() { return 'Masraf' }
	static get uygunmu() { return app?.params?.ticariGenel?.kullanim?.masraf }
	static altTipYapilarDuzenle({ def }) { super.altTipYapilarDuzenle(...arguments); def.ortak() }
	static mstYapiDuzenle({ result }) {
		super.mstYapiDuzenle(...arguments);
		result.set('masrafkod', ({ sent, kodClause, mstAlias, mstAdiAlias }) =>
			sent.fromIliski(`stkmasraf ${mstAlias}`, `${kodClause} = ${mstAlias}.kod`).add(`${mstAlias}.aciklama ${mstAdiAlias}`))
	}
    /* Hareket tiplerini (işlem türlerini) belirleyen seçim listesi */
    static hareketTipSecim_kaListeDuzenle({ kaListe }) {
        super.hareketTipSecim_kaListeDuzenle(arguments); kaListe.push(...[
			new CKodVeAdi(['alimFatura', 'Alım fatura']),
			new CKodVeAdi(['hizmet', 'Hizmet Fişleri']),
			new CKodVeAdi(['krKarti', 'Kredi Kart Masraf']),
			new CKodVeAdi(['stokCikis', 'Stok Çıkış']),
			new CKodVeAdi(['genelDekont', 'Genel Dekont'])
		])
    }
	uniOrtakSonIslem({ sender, hv, sent, attrSet }) {
		super.uniOrtakSonIslem(...arguments); let {from, where: wh} = sent;
		// if (!from.aliasIcinTable('mas') && (!attrSet || attrSet.MASRAF)) { sent.fromIliski('stkmasraf mas', `${hv.masrafkod} = mas.kod`) }
		if (!from.aliasIcinTable('car')) { sent.x2CariBagla({ kodClause: hv.mustkod }) }
		/*if (sender?.finansalAnalizmi) { }*/
	}
    /** Varsayılan değer atamaları (host vars) – temel sınıfa eklemeler.
		Hareketci.varsayilanHVDuzenle değerleri aynen alınır, sadece eksikler eklenir */
    static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
        super.varsayilanHVDuzenle(...arguments);
		for (let key of ['mustkod', 'brm']) { hv[key] = sqlEmpty }
		for (let key of ['miktar']) { hv[key] = sqlZero }
		for (let key of ['must', 'ticmust', 'fisaciklama', 'detaciklama']) { delete hv[key] }
		$.extend(hv, {
			/* 'anaislemadi' yoksa 'islemadi' degeri esas alinir */
			anaislemadi: ({ hv }) => hv.islemadi,
			/* 'detaciklama' gecicidir - 'detaciklama' ve 'fisaciklama' birleserek 'aciklama' olusturulur. (bos olan alinmaz) */
			aciklama: ({ hv }) => {
                let withCoalesce = (clause) => `COALESCE(${clause}, '')`;
                let {fisaciklama: fisAciklama, detaciklama: detAciklama} = hv;
                return fisAciklama && detAciklama 
                    ? `${withCoalesce(fisAciklama)} + ' ' + ${withCoalesce(detAciklama)}` 
                    : withCoalesce(detAciklama || fisAciklama || sqlEmpty)
            }
		})
    }
    /** UNION sorgusu hazırlama – hareket tipleri için */
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
        super.uygunluk2UnionBilgiListeDuzenleDevam(e);
        this.uniDuzenle_alimFatura(e).uniDuzenle_hizmet(e);
		this.uniDuzenle_krKarti(e).uniDuzenle_stokCikis(e)
		this.uniDuzenle_genelDekont(e)
    }
    /** (Alım Fatura) için UNION */
    uniDuzenle_alimFatura({ uygunluk, liste }) {
		let {params} = app, {kullanim: genel} = params.ticariGenel, {kullanim: satis} = params.satis;
		let {demirbas} = genel, {fason} = satis;
		let getUniBilgi = ({ pifHarTablo, kayitTipi, sentDuzenle, refKodClause, refAdiClause, refTipi, brmClause, dagilimSayacAttr }) => {
			return new Hareketci_UniBilgi()
				.sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent;
					sent.fisHareket('piffis', pifHarTablo, true)    /* true: innerJoinFlag */
						.leftJoin('har', 'pifmasrafdagilim mdag', [`fis.masrafortakdir = 'O'`, `har.kaysayac = mdag.${dagilimSayacAttr}`]);
					wh.fisSilindiEkle().degerAta('F', 'fis.piftipi').degerAta('A', 'fis.almsat').add(
						new MQOrClause([
							new MQAndClause([`fis.masrafortakdir = ''`, `har.detmasrafkod > ''`]),
							new MQAndClause([`fis.masrafortakdir = '*'`, `fis.masrafkod > ''`]),
							new MQAndClause([`fis.masrafortakdir = 'O'`, `mdag.masrafkod > ''`])
						])
					);
					sentDuzenle?.call(this, { ...arguments[0], sent })
				})
				.hvDuzenleIslemi(({ hv, sqlEmpty }) => {
					$.extend(hv, {
						kayittipi: kayitTipi.sqlServerDegeri(), islemadi: `'Alım Fatura'`, refkod: refKodClause, refadi: refAdiClause, reftipi: refTipi.sqlServerDegeri(),
						masrafkod: `(case fis.masrafortakdir when '' then har.detmasrafkod when '*' then fis.masrafkod when 'O' then mdag.masrafkod else '??' end)`,
						brm: brmClause, fisaciklama: 'fis.cariaciklama', detaciklama: 'har.ekaciklama', miktar: 'har.miktar', ba: `(case when fis.gc = 'G' then 'B' else 'A' end)`,
						bedel: `(case when fis.masrafortakdir = 'O' then mdag.masrafbedeli else ((har.bedel - har.dipiskonto) * (case when fis.iade = 'I' then -1 else 1 end)) end)`
					})
				})
		};
		$.extend(liste, {
            alimFatura: [
				getUniBilgi({              /* Stok */
					pifHarTablo: 'pifstok', kayitTipi: 'PIFST', sentDuzenle: ({ sent }) => sent.har2StokBagla(),
					refKodClause: 'har.stokkod', refAdiClause: 'coalesce(har.degiskenadi, stk.aciklama)', refTipi: 'ST',
					brmClause: 'stk.brm', dagilimSayacAttr: 'stokharsayac'
				}),
				getUniBilgi({              /* Hizmet */
					pifHarTablo: 'pifhizmet', kayitTipi: 'PIFHZ', sentDuzenle: ({ sent }) => sent.har2HizmetBagla(),
					refKodClause: 'har.hizmetkod', refAdiClause: 'coalesce(har.degiskenadi, hiz.aciklama)', refTipi: 'HZ',
					brmClause: 'hiz.brm', dagilimSayacAttr: 'hizmetharsayac'
				}),
				fason ? getUniBilgi({      /* Fason */
					pifHarTablo: 'piffsstok', kayitTipi: 'PIFFS', sentDuzenle: ({ sent }) => sent.har2StokBagla(),
					refKodClause: 'har.stokkod', refAdiClause: 'coalesce(har.degiskenadi, stk.aciklama)', refTipi: 'ST',
					brmClause: 'stk.brm', dagilimSayacAttr: 'fasonharsayac'
				}) : null,
				demirbas ? getUniBilgi({    /* Demirbaş */
					pifHarTablo: 'pifdemirbas', kayitTipi: 'PIFDM', sentDuzenle: ({ sent }) => sent.har2DemirbasBagla(),
					refKodClause: 'har.demirbaskod', refAdiClause: 'dem.aciklama', refTipi: 'DM',
					brmClause: 'dem.brm', dagilimSayacAttr: 'demirbasharsayac'
				}) : null
            ].filter(x => !!x)
        });
        return this
    }
	/** (Hizmet) için UNION */
    uniDuzenle_hizmet({ uygunluk, liste }) {
		$.extend(liste, {
            hizmet: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; 
					sent.fisHareket('finansfis', 'finanshar')
						.leftJoin('har', 'finmasrafdagilim mdag', 'har.kaysayac = mdag.harsayac')
						.har2HizmetBagla();
					wh.fisSilindiEkle().degerAta('A', 'fis.ba')
						.inDizi(['CH', 'KH', 'HH', 'MS'], 'fis.fistipi')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						kayittipi: `'HIZ'`, tarih: 'coalesce(har.belgetarih, fis.tarih)',
						refkod: 'har.hizmetkod', refadi: 'hiz.aciklama', reftipi: `'HZ'`,
						althesapkod: 'har.cariitn', takipno: 'har.takipno', mustkod: 'har.must',
						fisnox: '(case when har.belgeno = 0 then fis.fisnox else har.belgenox end)',
						masrafkod: 'coalesce(mdag.masrafkod, har.masrafkod)', ba: 'dbo.tersba(fis.ba)',
						bedel: '(case when mdag.masrafkod IS NULL then har.brutbedel else mdag.masrafbedeli end)',
						islemadi: (
							`(case fis.fistipi when 'CH' then 'Cari Hizmet' when 'KH' then 'Kasa Hizmet' when 'BH' then 'Banka Hizmet' ` +
							`when 'MS' then 'Kredi Kart Masraf Ödeme' else '?? Hizmet' end)`
						)
                    })
                })
            ]
        });
        return this
    }
	uniDuzenle_krKarti({ uygunluk, liste }) {
		$.extend(liste, {
            krKarti: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; 
					sent.fisHareket('posfis', 'posilkhar')
						.leftJoin('har', 'posmasrafdagilim mdag', 'har.kaysayac = mdag.harsayac')
						.har2HizmetBagla();
					wh.fisSilindiEkle().degerAta('A', 'fis.almsat')
						.add(`coalesce(mdag.masrafkod, har.masrafkod) > ''`)
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						kayittipi: `'POS'`, tarih: 'coalesce(har.belgetarih, fis.tarih)',
						islemadi: `'Kredi Kart Masraf Ödeme'`, refkod: 'har.hizmetkod', refadi: 'hiz.aciklama', reftipi: `'HZ'`,
						althesapkod: 'har.cariitn', takipno: 'har.takipno', mustkod: 'har.must',
						fisnox: '(case when har.belgeno = 0 then fis.fisnox else har.belgenox end)',
						masrafkod: 'coalesce(mdag.masrafkod, har.masrafkod)', ba: `'B'`,
						bedel: `(coalesce(mdag.masrafbedeli, har.brutbedel) * case when fis.iade = 'I' then -1 else 1 end)`
                    })
                })
            ]
        });
        return this
    }
	uniDuzenle_stokCikis({ uygunluk, liste }) {
		$.extend(liste, {
            stokCikis: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; 
					sent.fisHareket('stfis', 'ststok').har2StokBagla();
					wh.fisSilindiEkle().degerAta('C', 'fis.gctipi').degerAta('', 'fis.ozeltip')
						.add(
						new MQOrClause([
							new MQAndClause([`fis.masrafortakdir = ''`, `har.detmasrafkod > ''`]),
							new MQAndClause([`fis.masrafortakdir > ''`, `fis.masrafkod > ''`])
						])
					)
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						kayittipi: `'STST'`, islemadi: `'Stok Çıkış'`, althesapkod: 'fis.irscariitn',
						masrafkod: `(case when fis.masrafortakdir = '' then har.detmasrafkod else fis.masrafkod end)`,
						takipno: `(case when fis.takiportakdir = '' then har.dettakipno else fis.orttakipno end)`,
						mustkod: 'fis.irsmust', refkod: 'har.stokkod', refadi: 'stk.aciklama', reftipi: `'ST'`,
						brm: 'stk.brm', miktar: 'har.miktar', ba: `'B'`, bedel: 'har.fmalhammadde',
						fisaciklama: 'fis.cariaciklama', detaciklama: 'har.ekaciklama'
                    })
                })
            ]
        });
        return this
    }
	uniDuzenle_genelDekont({ uygunluk, liste }) {
		$.extend(liste, {
            genelDekont: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; 
					sent.fisHareket('geneldekontfis', 'geneldekonthar').har2HizmetBagla();
					wh.fisSilindiEkle().degerAta('HZ', 'har.kayittipi').add(`har.masrafkod > ''`)
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						kayittipi: `'DEK'`, masrafkod: 'har.masrafkod',
						islemadi: `'Genel Dekont'`, takipno: 'har.takipno',
						refkod: 'har.hizmetkod', refadi: 'hiz.aciklama', reftipi: `'HZ'`,
						ba: 'har.ba', bedel: 'har.bedel'
                    })
                })
            ]
        });
        return this
    }
}
