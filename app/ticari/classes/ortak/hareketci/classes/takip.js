class TakipHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get oncelik() { return 30 }
	static get kod() { return 'takip' } static get aciklama() { return 'Takip No' }
	static get uygunmu() { return app?.params?.ticariGenel?.kullanim?.takipNo }
	static getAltTipAdiVeOncelikClause({ hv }) { return { } }
	static mstYapiDuzenle({ result }) {
		super.mstYapiDuzenle(...arguments);
		result.set('takipno', ({ sent, kodClause, mstAlias, mstAdiAlias }) =>
			sent.fromIliski(`takipmst ${mstAlias}`, `${kodClause} = ${mstAlias}.kod`).add(`${mstAlias}.aciklama ${mstAdiAlias}`))
	}
    /* Hareket tiplerini (işlem türlerini) belirleyen seçim listesi */
    static hareketTipSecim_kaListeDuzenle({ kaListe }) {
		let {params} = app, {kullanim: akt} = params.aktarim;
        super.hareketTipSecim_kaListeDuzenle(arguments);
		kaListe.push(...[
			new CKodVeAdi(['fatura', 'Alım/Satış']), new CKodVeAdi(['hizmet', 'Gelir/Gider']),
			new CKodVeAdi(['ekMasraf', 'Ek Masraf']), new CKodVeAdi(['genelDekont', 'Dekont']),
			new CKodVeAdi(['stok', 'Stok Giriş/Çıkış']), (akt.guleryuzOnline ? new CKodVeAdi(['goMaliyet', 'Güleryüz Online']) : null)
		].filter(x => !!x))
    }
	uniOrtakSonIslem({ sender, hv, sent, attrSet }) {
		super.uniOrtakSonIslem(...arguments); let {from, where: wh} = sent;
		if (!from.aliasIcinTable('tak')) {
			let {takipno: kodClause} = hv;
			sent.fromIliski('takipmst tak', `${kodClause} = tak.kod`);
			wh.add(`${kodClause} > ''`)
		}
	}
    /** Varsayılan değer atamaları (host vars) – temel sınıfa eklemeler.
		Hareketci.varsayilanHVDuzenle değerleri aynen alınır, sadece eksikler eklenir */
    static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
        super.varsayilanHVDuzenle(...arguments);
		for (let key of ['stokmu', 'ekrefkod', 'ekrefadi', 'refgruptip', 'refgrupkod', 'must', 'brm', 'hba']) { hv[key] = sqlEmpty }
		for (let key of ['belgenox', 'miktar', 'kdv', 'maliyet']) { hv[key] = sqlZero }
		for (let key of ['mustkod', 'ticmust', 'fisaciklama', 'detaciklama']) { delete hv[key] }
		$.extend(hv, {
			fistarih: ({ hv }) => hv.tarih, fisnox: ({ hv }) => hv.belgenox,
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
        this.uniDuzenle_fatura(e).uniDuzenle_hizmet(e).uniDuzenle_ekMasraf(e);
		this.uniDuzenle_genelDekont(e).uniDuzenle_stok(e).uniDuzenle_goMaliyet(e)
    }
    /** (Fatura) için UNION */
    uniDuzenle_fatura({ uygunluk, liste }) {
		let {params} = app, {kullanim: genel} = params.ticariGenel;
		$.extend(liste, {
            fatura: [
				/* stok satis geliri, alım gideri */
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; 
					sent.fisHareket('piffis', 'pifstok').har2StokBagla();
					wh.fisSilindiEkle().degerAta('F', 'fis.piftipi').inDizi(['A', 'T'], 'fis.almsat')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						kayittipi: `'FAT'`, anaislemadi: 'Fatura',
						islemadi: `dbo.iadetext(fis.iade, dbo.almsattext (fis.almsat, 'Alım Fatura', 'Satış Fatura'))`,
						refkod: 'har.stokkod', refadi: 'coalesce(har.degiskenadi, stk.aciklama)',
						takipno: 'har.dettakipno', must: 'fis.must', bedel: 'har.harciro', kdv: 'har.perkdv',
						refgruptip: `'S'`, refgrupkod: 'stk.grupkod', ba: `(case when fis.gc = 'C' then 'A' else 'B' end)`,
						stokmu: `'*'`, brm: 'stk.brm', miktar: '(har.miktar + har.malfazmkt)'
                    })
                }),
				/* stok satış maliyeti */
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; 
					sent.fisHareket('piffis', 'pifstok').har2StokBagla();
					wh.fisSilindiEkle().inDizi(['F', 'P'], 'fis.piftipi').degerAta('T', 'fis.almsat')
                }).hvDuzenleIslemi(({ hv }) => {
					/* switch(filtre.maliyetSekli)
						case 'ALM': (sahaDict) => `${(sahaDict['miktar'] * stk.almnetfiyat)}`
						case 'ORT': (sahaDict) => `${(sahaDict['miktar'] * stk.ortmaliyet)}`
						else: '(har.fmalhammadde + har.fmalmuh)'
					*/
					let maliyetClause = ('har.fmalhammadde + har.fmalmuh');
                    $.extend(hv, {
						kayittipi: `'FAT'`, anaislemadi: 'Fatura',
						islemadi: `dbo.iadetext(fis.iade, 'Satış Fatura')`,
						refkod: 'har.stokkod', refadi: 'coalesce(har.degiskenadi, stk.aciklama)',
						takipno: 'har.dettakipno', must: 'fis.must', bedel: maliyetClause,
						refgruptip: `'S'`, refgrupkod: 'stk.grupkod', ba: `(case when fis.gc = 'C' then 'A' else 'B' end)`,
						stokmu: `'*'`
                    })
                }),
				/* Fatura: Hizmet */
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; 
					sent.fisHareket('piffis', 'pifhizmet').har2HizmetBagla().har2KatDetayBagla();
					wh.fisSilindiEkle().inDizi(['F', 'P'], 'fis.piftipi')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						kayittipi: `'FAT'`, anaislemadi: 'Fatura',
						islemadi: `dbo.iadetext(fis.iade, dbo.almsattext(fis.almsat, 'Alım Fatura', 'Satış Fatura'))`,
						refkod: 'har.hizmetkod', refadi: 'hiz.aciklama', ekrefkod: 'kdet.kdetay',
						takipno: 'har.dettakipno', must: 'fis.must', bedel: 'har.harciro', kdv: 'har.perkdv',
						refgruptip: `'H'`, refgrupkod: 'hiz.grupkod', ba: `(case when fis.gc = 'C' then 'A' else 'B' end)`,
						brm: 'hiz.brm', miktar: 'har.miktar'
                    })
                })
			]
        });
        return this
    }
	/** (Hizmet Fişleri) için UNION */
    uniDuzenle_hizmet({ uygunluk, liste }) {
		$.extend(liste, {
            hizmet: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; 
					sent.fisHareket('finansfis', 'finanshar')
						.har2HizmetBagla().har2KatDetayBagla();
					wh.fisSilindiEkle().degerAta('A', 'fis.ba')
						.inDizi(['CH', 'KH', 'HH', 'SM'], 'fis.fistipi')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						kayittipi: `'HIZ'`, anaislemadi: 'Hizmet',
						islemadi: `(case fis.fistipi when 'CH' then 'Cari Hizmet' when 'KH' then 'Kasa Hizmet' when 'HH' then 'Banka Hesap Hizmet' when 'SM' then 'Serbest Meslek' else '' end)`,
						refkod: 'har.hizmetkod', refadi: 'hiz.aciklama', refgruptip: `'H'`, refgrupkod: 'hiz.grupkod',
						ekrefkod: 'kdet.kdetay', bedel: 'har.brutbedel', kdv: 'har.kdv', tarih: 'coalesce(har.belgetarih, fis.tarih)',
						must: 'har.must', takipno: `(case when fis.fistipi = 'SM' then fis.fistakipno else har.takipno end)`,
						ba: 'dbo.tersba(fis.ba)', bedel: 'har.brutbedel', kdv: 'har.kdv',
						belgenox: '(case when har.belgeno = 0 then fis.fisnox else har.belgenox end)'
                    })
                })
            ]
        });
        return this
    }
	/** (Stok Hareket) için UNION */
	uniDuzenle_ekMasraf({ uygunluk, liste }) {
		$.extend(liste, {
            ekMasraf: [
				/* pos masrafi */
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; 
					sent.fisHareket('posfis', 'posdigerhar')
						.fromIliski('posilkhar bel', 'har.ilkharsayac = bel.kaysayac')
						.fromIliski('hizmst hiz', 'har.masrafkomhizkod = hiz.kod')
						.har2BankaHesapBagla()
					wh.fisSilindiEkle().degerAta('TE', 'fis.fistipi').add('har.komisyon > 0')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						kayittipi: `'MAS'`, anaislemadi: `'Masraf'`, islemadi: `'POS Komisyonu'`,
						takipno: 'bel.takipno', must: 'bel.must', refkod: 'har.masrafkomhizkod', refadi: 'hiz.aciklama',
						refgruptip: `'H'`, refgrupkod: 'hiz.grupkod', ekrefkod: 'har.banhesapkod', ekrefadi: 'bhes.aciklama',
						ba: `'B'`, bedel: 'har.komisyon'
                    })
                }),
				/* pos katki */
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; 
					sent.fisHareket('posfis', 'posdigerhar')
						.fromIliski('posilkhar bel', 'har.ilkharsayac = bel.kaysayac')
						.fromIliski('hizmst hiz', 'har.masrafkomhizkod = hiz.kod')
						.har2BankaHesapBagla()
					wh.fisSilindiEkle().degerAta('TE', 'fis.fistipi').add('har.katkipayi > 0')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						kayittipi: `'MAS'`, anaislemadi: `'Masraf'`, islemadi: `'POS Katkı Payı'`,
						takipno: 'bel.takipno', must: 'bel.must', refkod: 'har.masrafkathizkod', refadi: 'hiz.aciklama',
						refgruptip: `'H'`, refgrupkod: 'hiz.grupkod', ekrefkod: 'har.banhesapkod', ekrefadi: 'bhes.aciklama',
						ba: `'B'`, bedel: 'har.katkipayi'
                    })
                }),
				/* kredi kart masraf odeme */
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; 
					sent.fisHareket('posfis', 'posilkhar').har2HizmetBagla().har2BankaHesapBagla()
					wh.fisSilindiEkle().degerAta('MS', 'fis.fistipi')
						.degerAta('A', 'fis.almsat').add('har.brutbedel > 0')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						kayittipi: `'MAS'`, anaislemadi: `'Masraf'`, islemadi: `'Kredi Kart Masraf Ödeme'`,
						takipno: 'bel.takipno', refkod: 'har.hizmetkod', refadi: 'hiz.aciklama',
						refgruptip: `'H'`, refgrupkod: 'hiz.grupkod', ekrefkod: 'har.banhesapkod', ekrefadi: 'bhes.aciklama',
						ba: `'B'`, bedel: 'dbo.iadeisecevir(fis.iade, har.brutbedel)'
                    })
                }),
				/* havale/eft masrafi */
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; 
					sent.fisHareket('hefis', 'hehar').x2HizmetBagla({ kodClause: 'has.masrafhizkod' }).fis2BankaHesapBagla()
					wh.fisSilindiEkle().add(new MQOrClause([
						new MQAndClause([{ degerAta: 'TP', saha: 'fis.fistipi' }, { degerAta: 'A', saha: 'fis.hba' }]),
						new MQAndClause({ inDizi: ['SH', 'SE', 'SS'], saha: 'fis.fistipi' })
					])).add('har.masraf > 0')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						kayittipi: `'MAS'`, anaislemadi: `'Masraf'`, islemadi: `'Havale/EFT Masrafı'`,
						takipno: 'har.takipno', refkod: 'har.masrafhizkod', refadi: 'hiz.aciklama',
						refgruptip: `'H'`, refgrupkod: 'hiz.grupkod', ekrefkod: 'fis.banhesapkod', ekrefadi: 'bhes.aciklama',
						must: 'har.must', ba: `'B'`, bedel: 'har.masraf'
                    })
                })
            ]
        });
        return this
    }
	/** (Stok Hareket) için UNION */
	uniDuzenle_stok({ uygunluk, liste }) {
		$.extend(liste, {
            stok: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; 
					sent.fisHareket('stfis', 'ststok').har2StokBagla();
					wh.fisSilindiEkle().degerAta('C', 'fis.gctipi')
                }).hvDuzenleIslemi(({ hv, sqlZero }) => {
					let maliyetClause = '(har.fmalhammadde + har.fmalmuh)';
                    $.extend(hv, {
						kayittipi: `'STHAR'`, anaislemadi: `'Stok'`, islemadi: `'Çıkış'`,
						refkod: 'har.stokkod', refadi: 'stk.aciklama', refgruptip: `'S'`, refgrupkod: 'stk.grupkod',
						ba: `'A'` , bedel: sqlZero, stokmu: `'*'`,
						miktar: `(har.miktar*(case when fis.iade = '' then 1 else -1 end))`, brm: 'stk.brm',
						maliyet: `(${maliyetClause} * (case when fis.iade = '' then 1 else -1 end))`
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
					sent.fisHareket('geneldekontfis', 'geneldekonthar')
						.har2HizmetBagla().har2KatDetayBagla();
					wh.fisSilindiEkle().degerAta('A', 'fis.ba')
						.inDizi(['CH', 'KH', 'HH', 'SM'], 'fis.fistipi')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						kayittipi: `'DEK'`, anaislemadi: 'Dekont', islemadi: 'Genel Dekont',
						refkod: 'har.hizmetkod', refadi: 'hiz.aciklama', refgruptip: `'H'`, refgrupkod: 'hiz.grupkod', ekrefkod: 'kdet.kdetay',
						must: `(case when har.kayittipi = 'CR' then har.must else '' end)`, takipno: 'har.takipno',
						ba: 'har.ba', bedel: 'har.bedel'
                    })
                })
            ]
        });
        return this
    }
	/* (Güleryüz Online Maliyet) için UNION */
	uniDuzenle_goMaliyet({ uygunluk, liste }) {
		let {params} = app, {kullanim: akt} = params.aktarim;
		if (!akt.goMaliyet) { return this }
		$.extend(liste, {
            goMaliyet: [
				/* normal hakedis */
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; 
					sent.fromAdd('gofirmahakedis ghak ghak')
						.innerJoin('ghak', 'gofirmaekhizmet ekhiz', 'ghak.kaysayac = ekhiz.fissayac')
						.fromIliski('gofmal2tip2hizmet fhdon', ['ghak.firmaid = fhdon.firmaid', 'ekhiz.ekhizmetid = fhdon.hizmetid'])
						.fromIliski('hizmst hiz', 'fhdon.hizmetkod = hiz.kod');
					wh.fisSilindiEkle().add(`fhdon.hizmetkod > ''`)
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						kayittipi: `'GON'`, anaislemadi: 'GO Maliyet', islemadi: `'GO-Gider: Firma Maliyet'`,
						takipno: 'ghak.takipno', refkod: 'fhdon.hizmetkod', refadi: 'hiz.aciklama', refgruptip: `'H'`, refgrupkod: 'hiz.grupkod',
						ba: `'B'`, bedel: 'ekhiz.ekhizmetbedeli', tarih: 'ghak.tarih', belgenox: 'ghak.fisnox'
                    })
                }),
				 /* tahakkuk tipindekiler icin ters islem */
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; 
					sent.fromAdd('gofirmahakedis ghak ghak')
						.innerJoin('ghak', 'gofirmaekhizmet ekhiz', 'ghak.kaysayac = ekhiz.fissayac')
						.fromIliski('gofmal2tip2hizmet fhdon', ['ghak.firmaid = fhdon.firmaid', 'ekhiz.ekhizmetid = fhdon.hizmetid'])
						.fromIliski('hizmst hiz', 'fhdon.hizmetkod = hiz.kod');
					wh.fisSilindiEkle().add(`fhdon.hizmetkod > ''`).degerAta('T', 'hiz.tip')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						kayittipi: `'GON'`, anaislemadi: 'GO Maliyet', islemadi: `'GO-Gider: Firma Maliyet-Karşı'`,
						takipno: 'ghak.takipno', refkod: 'fhdon.hizmetkod', refadi: 'hiz.aciklama', refgruptip: `'H'`, refgrupkod: 'hiz.grupkod',
						ba: `'A'`, bedel: 'ekhiz.ekhizmetbedeli', tarih: 'ghak.tarih', belgenox: 'ghak.fisnox'
                    })
                })
            ]
		});
        return this
    }
}
