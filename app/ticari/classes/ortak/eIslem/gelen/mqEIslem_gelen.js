class MQEIslem_Gelen extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    static get kodListeTipi() { return 'EG' }
    static get sinifAdi() { return 'Gelen e-İşlem' }
    static get secimSinif() { return DonemselSecimler }
    static get gridDetaylimi() { return true }
    static get tumKolonlarGosterilirmi() { return true }
    static get tanimlanabilirmi() { return false }
	static get degistirilebilirmi() { return false }
	static get silinebilirmi() { return false }
	static get raporKullanilirmi() { return false }
	static get kolonDuzenlemeYapilirmi() { return true }

    static listeEkrani_init({ sender: listePart }) {
        super.listeEkrani_init(...arguments)
        
        let { eConf } = listePart
        eConf ??= MQEConf.instance
        
        let tip2EYonetici = {}
        ;[EIslFatura, EIslIrsaliye].forEach(eIslSinif =>
            tip2EYonetici[eIslSinif.tip] = new EYonetici_Gelen({ eConf, eIslSinif }))

		let sorguFiltre = new MQEIslem_Gelen_BekSorguFiltre()
        extend(listePart, { eConf, tip2EYonetici, sorguFiltre })
    }
    static listeEkrani_afterRun({ sender: listePart }) {
        super.listeEkrani_afterRun(...arguments)
    }
    static secimlerDuzenle({ sender: listePart, secimler: sec }) {
        super.secimlerDuzenle(...arguments)

        let { donem: { tekSecim: donem } } = sec
        donem.buYil()

        let grupKod = 'donemVeTarih'
        sec
            .secimTopluEkle({
                seri: new SecimString({ grupKod, etiket: 'Seri' }),
                fisNo: new SecimNumber({ grupKod, etiket: 'Fiş No' }),
                fisNox: new SecimOzellik({ grupKod, etiket: 'Belge Nox' }),
                uuid: new SecimOzellik({ grupKod, etiket: 'UUID (ETTN)' }),
                akibet: new SecimBirKismi({
                    grupKod, etiket: 'Akıbet',
                    tekSecimSinif: EIslemOnayDurum
                }).birKismi()
            })
            .whereBlockEkle(({ where: wh, secimler: sec }) => {
                wh
					.basiSonu(sec.tarihBS, 'fis.tarih')
                    .basiSonu(sec.seri, 'fis.seri')
                    .basiSonu(sec.fisNo, 'fis.fisno')
                    .ozellik(sec.fisNox, 'fis.effatnox')
                    .ozellik(sec.uuid, 'fis.uuid')
                let { akibet: { value: akibet }} = sec
                if (!empty(akibet))
                    wh.birKismi(akibet, 'fis.onaydurumu')
            })
    }
    static islemTuslariDuzenle_listeEkrani(e = {}) {
        super.islemTuslariDuzenle_listeEkrani(e)
        let { sender: listePart, liste, part: butonlarPart } = e
        let { ekSagButonIdSet } = butonlarPart
        
        let withErrCheck = async (islemAdi, args, block) => {
            try { await block?.({ ...e, ...args }) }
            catch (ex) {
				cerr(ex)
				let msg = getErrorText(ex)
				if (msg)
					hConfirm(msg, islemAdi)
			}
        }
        
        let items = [
			{
                id: 'bekleyenleriGetir',
				text: '📶',
				toolTip: 'Bekleyenleri Getir',
                handler: _e => void(
                    withErrCheck('Bekleyenleri Getir', _e, args =>
                        this.bekleyenleriGetirIstendi(args))
				)
            },
			{
                id: 'xmlYukle',
				text: 'XML',
				toolTip: 'XML Dosyadan Yükle',
                handler: _e => void(
                    withErrCheck('XML Yükle', _e, args =>
                        this.xmlYukleIstendi(args))
				)
            },
			{
                id: 'eIslemIzle',
				toolTip: 'e-İşlem İZLE',
                handler: _e =>
                    withErrCheck('e-İşlem İzle', _e, args =>
                        this.eIslemIzleIstendi(args))
            },
			{
                id: 'musteriBelirle',
				text: '🧑‍💼✓',
				toolTip: 'Müşteri Belirle',
				handler: _e => void(
                    withErrCheck('Müşteri Belirle', _e, args =>
                        this.musteriBelirleIstendi(args))
				)
            },
			{
                id: 'ticariyeAktar',
				toolTip: 'Ticariye Aktar',
				handler: _e => void(
                    withErrCheck('Ticariye Aktar', _e, args =>
                        this.ticariyeAktarIstendi(args))
				)
            },
			{
                id: 'sil',
				toolTip: 'e-İşlem SİL',
                handler: _e =>
                    withErrCheck('e-İşlem SİL', _e, args =>
                        this.eIslemKaldirIstendi(args))
            }
        ]
        
        liste.push(...items)
        extend(ekSagButonIdSet, asSet(items.map(r => r.id)))
    }
    static rootFormBuilderDuzenle_islemTuslari({ sender: listePart, fbd_islemTuslari: fbd }) {
		super.rootFormBuilderDuzenle_islemTuslari(...arguments)
    }
    static orjBaslikListesi_argsDuzenle(e = {}) {
        super.orjBaslikListesi_argsDuzenle(e)
		let { sender: listePart, args } = e
        extend(args, {
            rowsHeight: 60, groupsExpandedByDefault: true,
            showStatusBar: true, showAggregates: true
            // showGroupAggregates: true
        })
		;{
			let w = { dip: 300, margin: .5 }
			w.detay = `calc(var(--full) - ${w.dip}px)`
			
			extend(args, {
				rowDetailsTemplate: i => ({
					rowdetailsheight: 350,
					rowdetails: (
						`<div class="dip-grid-parent dock-bottom float-left" style="width: ${w.dip - w.margin}px">
							<div class="dip-grid"></div>
						</div>
						<div class="detay-grid-parent dock-bottom float-left" style="width: ${w.detay}">
							<div class="detay-grid"></div>
						</div>`
					)
				}),
				initRowDetails: (rowIndex, parent, grid, parentRec) => {
					parent = $(parent)
					promise(() => this.initRowDetails_dip({ ...e, rowIndex, parentRec, parent: parent.find('.dip-grid') }) )
					promise(() => listePart.initRowDetails({ ...e, rowIndex, parentRec, parent: parent.find('.detay-grid') }))
				}
			})
		}
    }
    static ekCSSDuzenle({ dataField: k, value: v, rec: r, result: res }) {
		super.ekCSSDuzenle(...arguments)
        switch (k) {
            case 'eIslTipText': {
                v = r.eIslTip?.char ?? r.eIslTip
                switch (v) {
                    case 'IR': {
                        res.push('bg-orangered')
                        break
                    }
                    default: {
                        res.push('bg-lightcyan')
                        break
                    }
                }
				break
            }
            case 'akibetText': {
                v = r.akibet?.char ?? r.akibet
                switch (v) {
                    case '@': {                             // Alıcıya Ulaştı
                        res.push('bg-forestgreen')
                        break
                    }
                    case 'O': {                             // Onay
                        res.push('bg-lightgreen')
                        break
                    }
                    case 'R': {                             // RED
                        res.push('bg-orangered')
                        break
                    }
                    case 'X': {                             // HATA
                        res.push('bg-lightred')
                        break
                    }
                }
                break
            }
            case 'sonucBedel': {
                v = Number(r.sonucBedel)
                res.push(
                    'bold', 'fs-110',
                    ( v < 0 ? 'firebrick' : 'forestgreen' )
                )
                break
            }
        }
    }
    static orjBaslikListesiDuzenle({ sender: listePart, liste }) {
        super.orjBaslikListesiDuzenle(...arguments)
        liste.push(...[
			gridKolon('tamamlandi', 'Tamam?', 5).noSql().checkedList().tipBool(),
			gridKolon('yazdirildi', 'Yazdır?', 5).noSql().checkedList().tipBool(),
			gridKolon('eIslTipText', 'Belge Tipi', 8).noSql().checkedList(),
            ...MQCogul.getKAKolonlar(
                gridKolon('kayitTarih', 'Kayıt Tarih', 12).date().noSql().checkedList(),
                gridKolon('kayitSaat', 'K.Zmn', 9).noSql().time().center(),
                true    // auto-reverse in mini-device mode
            ),
            ...MQCogul.getKAKolonlar(
                gridKolon('tarih', 'Belge Tarih', 13).noSql().checkedList().date(),
                gridKolon('fisNox', 'Belge No', 23).noSql().checkedList(),
                true    // auto-reverse in mini-device mode
            ),
            ...MQCogul.getKAKolonlar(
                gridKolon('gondericiUnvan', 'EF Gönderici Ünvan', 40).noSql().checkedList(),
                gridKolon('gondericiVKN', 'Gönderici VKN', 11).noSql().checkedList(),
                false
            ),
            gridKolon('irsVar', 'İrs?', 5).noSql().checkedList().tipBool(),
            gridKolon('sonucBedel', 'Sonuc Bedel', 23).noSql().bedel().sum().input(),
            ...MQCogul.getKAKolonlar(
                gridKolon('gondericiMustKod', 'Vio Cari', 18).noSql().checkedList(),
                gridKolon('vioMustUnvan', 'Vio Cari Ünvan', 40).noSql().checkedList(),
                false
            ),
            gridKolon('uuid', 'UUID (ETTN)', 42).noSql().checkedList()
        ])
    }
    static async loadServerDataDogrudan({ sender: listePart, wsArgs, secimler: sec }) {
        let { grid } = listePart
        if (listePart._rendered)
            listePart._lastGroups = grid.jqxGrid('groups')
        else
            listePart._rendered = true
        
        let recs = await super.loadServerDataDogrudan(...arguments)
        let ka = { akibet: EIslemOnayDurum.kaDict }
        ;recs.forEach(r => {
            let { eIslTip, kayitTS, akibet } = r
			;['tamamlandi', 'yazdirildi', 'bozuk', 'irsVar'].forEach(k =>
                r[k] = !!r[k])
            extend(r, {
                eIslTipText: EIslemOrtak.getClass(eIslTip)?.kisaAdi ?? eIslTip,
                kayitTarih: asDate(kayitTS)?.clone()?.clearTime(),
                kayitSaat: timeToString(kayitTS),
                akibetText: akibet ? ka.akibet[akibet || ' ']?.aciklama : ''
            })
        })
        return recs
    }
    static loadServerData_queryDuzenle({ sender: listePart, stm, sent, secimler: sec }) {
        super.loadServerData_queryDuzenle(...arguments)
        
        sent.sahalarVeGroupByVeHavingReset()
        let { where: wh, sahalar } = sent
        let { orderBy } = stm
        ;{
            sent
                .fromAdd('efgecicialfatfis fis')
                .x2CariBagla({ kodClause: 'fis.mustkod', leftJoin: 'fis' })
            sahalar
                .addWithAlias('fis',
                    'kaysayac sayac', 'kayitts kayitTS', 'efuuid uuid', 'tarih', 'seri', 'noyil noYil',
                    'effatnox fisNox', 'mustkod gondericiMustKod', 'efmustunvan gondericiUnvan', 'vkno gondericiVKN',
					'efsonuc sonucBedel', 'tamamlandi', 'yazdirildimi yazdirildi', 'bozukmu bozuk', 'birsaliyevar irsVar',
					'bizsubekod subeKod', 'degadreskod degAdresKod', 'onaydurumu akibet',
					'ayrimtipi ayrimTipi', 'iade'
                )
                .add(
                    `(CASE WHEN fis.efbelge = '' THEN 'E' ELSE fis.efbelge END) eIslTip`,
                    'car.birunvan vioMustUnvan'
                )
			for (let mid of ['', 'Dv']) {
				;['Brut', 'Iskonto', 'Kdv', 'Otv', 'Stopaj', 'Sonuc'].forEach(pf => {
					let ik = `ef${mid}${pf}`
					let rk = ik.toLowerCase()
					sahalar.add(`fis.${rk} ${ik}`)
				})
			}
        }
        orderBy.liste = ['eIslTip', 'kayitTS DESC', 'fisNox']

        /*
            (47) [
                'kaysayac', 'vkno', 'kayitts', 'efatconfkod', 'bizsubekod',
                'efbelge', 'ayrimtipi', 'mustkod',
                'yerkod', 'takipno', 'efmustunvan', 'efuuid', 'althesapkod',
                'tarih', 'effatnox', 'seri', 'noyil', 'no',
                'dvkod', 'dvkur', 'bcarihizmetmi', 'tamamlandi',
                'onaydurumu', 'yazdirildimi', 'iade', 'bozukmu', 'digerdurum',
                'kaynaksayac', 'satirbedelbrutmu', 'ozelentalimrefno', 'efatsenaryotipi', 'efbrut', 'efiskonto',
                'efkdv', 'efotv', 'efstopaj', 'efsonuc',
                'efdvbrut', 'efdviskonto', 'efdvkdv', 'efdvotv', 'efdvstopaj', 'efdvsonuc',
                'birsaliyevar', 'degadreskod', 'id', 'alimanlasmafisdurumu'
            ]
        */
    }
    static gridVeriYuklendi({ sender: listePart, recs }) {
        super.gridVeriYuklendi(...arguments)
    }
    static orjBaslikListesi_groupsDuzenle({ sender: listePart, liste }) {
        super.orjBaslikListesi_groupsDuzenle(...arguments)
        let { _lastGroups: groups } = listePart
        groups ??= ['eIslTipText']
        liste.push(...groups)
    }
	static orjBaslikListesi_satirCiftTiklandi({ sender } = {}) {
		super.orjBaslikListesi_satirCiftTiklandi(...arguments)
		// let { row: rec = e.event?.args ?? {}
		this.eIslemIzleIstendi({ sender })
	}

	static orjBaslikListesi_argsDuzenle_detaylar({ sender: listePart, args }) {
        super.orjBaslikListesi_argsDuzenle_detaylar(...arguments)
        extend(args, {
            rowsHeight: 50, groupsExpandedByDefault: true,
			showGroupsHeader: false, showStatusBar: true, showAggregates: true
            // showGroupAggregates: true
        })
    }
	static orjBaslikListesiDuzenle_detaylar({ sender: listePart, liste }) {
        super.orjBaslikListesiDuzenle_detaylar(...arguments)
        liste.push(...[
			gridKolon('shTipText', 'Tip', 8).noSql().checkedList(),
			...this.getKAKolonlar(
				gridKolon('eSHKod', 'EF Stok Kod', 16).noSql().checkedList(),
				gridKolon('eSHAdi', 'EF Stok Adı', 45).noSql().checkedList()
			),
			gridKolon('miktar', 'Miktar', 9).noSql().checkedList().dec(),
			...this.getKAKolonlar(
				gridKolon('fiyat', 'Fiyat', 17).noSql().input().fiyat(),
				gridKolon('bedel', 'Bedel', 17).noSql().input().bedel()
			),
			gridKolon('iskOranlarStr', 'İsk %', 10).noSql().input(),
			...this.getKAKolonlar(
				gridKolon('shKod', 'VIO Stok Kod', 16).noSql().checkedList(),
				gridKolon('shAdi', 'VIO Stok Adı', 30).noSql().checkedList()
			),
			gridKolon('detaciklama', 'Açıklama', 50).noSql().input(),
			gridKolon('bozuk', 'Bzk?', 5).noSql().checkedList().bool()
        ])
    }
    static async loadServerData_detaylar(e = {}) {
		let { sender: listePart, wsArgs, secimler: sec } = e
		let stm = e.stm = new MQStm()
		e.sent = stm.sent
		this.loadServerData_detaylar_queryDuzenle(e)
		stm = e.stm
		if (!stm)
			return []
		return await stm.execSelect()
    }
	static loadServerData_detaylar_queryDuzenle({ sender: listePart, stm, sent, secimler: sec, parentRec }) {
        super.loadServerData_detaylar_queryDuzenle(...arguments)
        sent.sahalarVeGroupByVeHavingReset()
		let { sayac: fisSayac } = parentRec
        let { where: wh, sahalar } = sent
        let { orderBy } = stm
        ;{
			let cl = {
				shTipText: new MQCase()
					.setClause('har.shtip')
					.when(`'H'`, `'Hiz.'`)
					.when(`'D'`, `'Dem.'`)
					.else(`'Stk.'`),
				shKod: new MQCase()
					.setClause('har.shtip')
					.when(`'H'`, 'har.hizmetkod')
					.when(`'D'`, 'har.demkod')
					.else('har.stokkod'),
				shAdi: new MQCase()
					.setClause('har.shtip')
					.when(`'H'`, 'hiz.aciklama')
					.when(`'D'`, 'dem.aciklama')
					.else('stk.aciklama')
			}
            sent
                .fromAdd('efgecicialfatdetay har')
                .innerJoin('har', 'stkmst stk', 'har.stokkod = stk.kod')
                .innerJoin('har', 'hizmst hiz', 'har.hizmetkod = hiz.kod')
                .innerJoin('har', 'demmst dem', 'har.demkod = dem.kod')
			if (fisSayac)
				wh.degerAta(fisSayac, 'fissayac')
            sahalar
                .addWithAlias('har',
                    'kaysayac sayac', 'fissayac fisSayac', 'seq', 'bozukmu bozuk',
					'efbarkod barkod', 'efstokkod eSHKod', 'efstokadi eSHAdi',
					'shtip tip', 'miktar', 'fiyat', 'bedel',
					'kdvorani kdvOrani', 'iskoranstr iskOranlarStr',
					'detaciklama detAciklama'
					// 'alimanlasmadurumu alimAnlasma'
                )
				.add(
					`${cl.shTipText} shTipText`,
					`${cl.shKod} shKod`,
					`${cl.shAdi} shAdi`
				)
        }
        orderBy.liste = ['fisSayac', 'seq DESC']

		/*
			id, kaysayac, fisid, fissayac, seq, bozukmu,
			efbarkod, efstokkod, efstokadi, efmiktar, efbirimtipi, efiskonto
			shtip, stokkod, hizmetkod, demkod, kdetaysayac,
			kdvorani, konaklamaorani, otvorani, stopajorani, tevoranx
			miktar, fiyat, bedel, iskoranstr, artoranstr,
			irseksik, irsfazla, irskabuledilmeyen,
			alimanlasmadurumu, detaciklama
		*/
	}

	static initRowDetails_dip(e = {}) {
		let { sender: listePart, parent: grid, parentRec, rowIndex } = e
		let rfb = new RootFormBuilder()
		rfb.addGridliGosterici('dip-grid')
			.setLayout(grid)
			.rowNumberOlmasin()
			.notAdaptive()
			.noAnimate()
			.widgetArgsDuzenleIslemi(({ args }) => {
				extend(args, {
					rowsHeight: 35, columnsMenu: false, filterable: false, groupable: false,
					showStatusBar: false, showAggregates: false, showGroupsHeader: false
				})
			})
			.setTabloKolonlari(
				[
					gridKolon('etiket', 'Açıklama', 14).noSql().input(),
					gridKolon('veri', 'Bedel', 15).noSql().input().bedel()
				].map(cd =>
					cd.setCellClassName((...args) =>
						this.getCellClassName_dip(...args))
				)
			)
			.setSource(_e =>
				this.loadServerData_dip({ ...e, ..._e }))
			.veriYukleninceIslemi(_e =>
				this.gridVeriYuklendi_dip({ ...e, ..._e }))
			.addStyle_fullWH()
			.addStyle(`$elementCSS [role = row] > div { font-size: 80% !important }`)
		rfb.run()
	}
	static getCellClassName_dip(cd, i, k, v, r) {
		let res = [k]
		let tip = r?.tip ?? ''
		switch (tip) {
			case '_sep': {
				res.push('whitesmoke', 'bg-whitesmoke')
				break
			}
			case 'sonuc': {
				res.push('fs-115 bold')
				break
			}
		}
		if (k == 'veri') {
			switch (tip) {
				case 'sonuc': {
					res.push('bg-lightgreen')
					break
				}
			}
		}
		return res
			.filter(Boolean)
			.join(' ')
	}
	static loadServerData_dip({ sender: gridPart, parentRec: pr } = {}) {
		if (!pr)
			return []

		let k2Def = {
			brut: { etiket: 'BRÜT', zorunlu: true },
			iskonto: { etiket: 'İSKONTO' },
			kdv: { etiket: 'KDV' },
			otv: { etiket: 'ÖTV' },
			stopaj: { etiket: 'STOPAJ' },
			sonuc: { etiket: 'SONUÇ', zorunlu: true },
		}

		let grp2Rec = {}
		for (let mid of ['', 'Dv']) {
			let g = mid.toLowerCase() || 'tl'
			let r = grp2Rec[g] = {}
			;['Brut', 'Iskonto', 'Kdv', 'Otv', 'Stopaj', 'Sonuc'].forEach(pf => {
				let ik = pf.toLowerCase()
				let rk = `ef${mid}${pf}`
				let v = Number(pr[rk])
				if (v)
					r[ik] = v
			})
		}

		let recs = []
		function add(grup, tip, etiket, veri, zorunlu) {
			if (!(zorunlu || veri))
				return null

			etiket ||= k2Etk[tip]
			let r = { grup, tip, etiket, veri }
			recs.push(r)
			return r
		}
		;['dv', 'tl'].forEach((g, i) => {
			let r = grp2Rec[g]
			if (empty(r))
				return true    // continue

			if (Number(i) > 0 && !empty(recs))
				add(null, '_sep', ' ', null, true)    // separator
				
			for (let [k, bedel] of entries(r)) {
				let { etiket, zorunlu } = k2Def[k] ?? {}
				add(g, k, etiket, bedel, zorunlu)
			}
		})
		
		return recs
	}
	static gridVeriYuklendi_dip({ sender: gridPart } = {}) {}
	
    static async bekleyenleriGetirIstendi({ sender: listePart } = {}) {
		let islemAdi = 'e-İşlem Bekleyenleri Getir'
		let { sorguFiltre: wsSec } = listePart
		await promise(tamamIslemi => {
			let parentPart = listePart
			let mfSinif = this
			wsSec.duzenlemeEkraniAc({ parentPart, mfSinif, tamamIslemi })
		})
		
		let { tarihBS } = wsSec
		let { value: vknKontrol } = wsSec.vknKontrol
		let { value: aliasKontrol } = wsSec.aliasKontrol
        let recsDuzenle = recs => {
            // debugger
        }
		
        let tip2Res = {}
		let pm = await showProgress('Gelen e-İşlem Belgeleri sorgulanıyor...', islemAdi)
		try {
	        for (let eYon of this.getEYoneticiler({ listePart })) {
	            let { eIslTip: k } = eYon
	            tip2Res[k] = await eYon.bekleyenleriGetirVeKaydet({
					tarihBS, recsDuzenle,
					aliasKontrol, vknKontrol
				})
	        }
			delay(10).then(() =>
				listePart?.tazele?.())
		}
		finally {
			pm?.progressEnd()
			delay(20).then(() =>
				hideProgress())
		}
    }
	static async xmlYukleIstendi({ sender: listePart } = {}) {
		let islemAdi = 'e-İşlem XML Yükle'
		let { eConf, sorguFiltre: wsSec, tip2EYonetici: tip2EYon } = listePart
		let { value: vknKontrol } = wsSec.vknKontrol
		let { value: aliasKontrol } = wsSec.aliasKontrol

		let tip2SubDir = fromEntries(
			keys(tip2EYon)
				.map(tip => [tip, eConf.getAnaBolumFor(tip)])
				.filter(([tip, v]) => v)
		)
        if (empty(tip2SubDir))
            throw { isError: true, errorText: 'e-İşlem Ana Bölüm belirlenemedi'}

		let coklu = true, capture = false, type = 'text', accept = ['text/xml']
		let recs = await openFile({ coklu, capture, type, accept }) ?? []

        let tip2Res = {}
		let pm = await showProgress('XML İçerikleri işleniyor...', islemAdi)
		try {
			recs = recs.filter(r => r.data)
			if (empty(recs))
				return null

			pm?.setProgressMax(recs.length * 8)
			for (let r of recs) {
				let { data } = r
				let xml
				try { xml = r.xml = data ? $.parseXML(data)?.documentElement : null }
				catch (ex) { cerr(ex) }
				if (!xml)
					continue

				let eFis = r.eFis = new EFis({ eConf, xml })
				pm?.progressStep(2)
				
				let { uuid, eIslTip: tip } = eFis
				if (!uuid) {
					pm?.progressStep()
					continue
				}
				
				tip = EYonetici_Gelen.normalizeEFAyrimTipi(tip) || 'E'
				let { recs: _recs } = (tip2Res[tip] ??= { recs: [] })
				_recs.push(r)
				// uuid2Rec[uuid] = r
				
				pm?.progressStep()
			}

			let baseArgs = { ...e, vknKontrol: true }
			let uploadList = []
			for (let [tip, { recs }] of entries(tip2Res)) {
				let subDir = tip2SubDir[tip]
				if (subDir) {
					;recs
						.filter(({ data, eFis }) =>
							data && eFis)
						.forEach(({ data, eFis }) => {
							let { uuid } = eFis
							let name = [subDir, 'ALINAN', `${uuid}.xml`]
								.join('/')
								.replaceAll('\\', '/')
							data = Base64.encode(data)
							uploadList.push({ name, data })
						})
				}
			}

			if (!empty(uploadList)) {
				let pr = app.wsMultiUpload({ data: uploadList })
				let timer
				(pr.always ?? pr.finally)(() => {
					clearTimeout(timer)
					pm.progressStep(3 * uploadList.length)
				})

				// XML Dosyası sadece İzleme işlemi için gerekli.
				//   İçeri alım sürecinde zorunlu değil
				timer = setTimeout(() => pr.resolve(), 2_000)
				await pr
			}

			for (let [tip, res] of entries(tip2Res)) {
				let eYon = tip2EYon[tip]
				if (!eYon) {
					pm.progressStep(5)
					continue
				}
				
				let { recs } = res
				let eFisler = recs.map(r => r.eFis)
				let args = { ...baseArgs, recs: eFisler }
				await eYon.geciciFisKaydet(args)
				
				mergeInto(args, res, 'recs', 'uuid2Rec')
				pm.progressStep(2)
			}
			
			delay(10).then(() =>
				listePart?.tazele?.())
		}
		finally {
			pm?.progressEnd()
			delay(20).then(() =>
				hideProgress())
		}
    }
	static async eIslemIzleIstendi({ sender: listePart } = {}) {
		let islemAdi = 'e-İşlem İZLE'
        let { tip2EYonetici } = listePart
        let totalCount = 0, tip2Recs = {}
        for (let r of listePart.selectedRecs) {
            let { eIslTip: k } = r
            k ||= 'E'
            ;(tip2Recs[k] ??= []).push(r)
			totalCount++
        }
        
        if (empty(tip2Recs))
            throw { isError: true, errorText: 'İzlenecek belgeler seçilmelidir' }
        
        let internal = true
        let tip2Res = {}
		let pm = await showProgress('Gelen e-İşlem Görüntüleri oluşturuluyor...', islemAdi)
		try {
			pm?.setProgressMax(totalCount)
	        for (let [tip, recs] of entries(tip2Recs)) {
	            let eYon = tip2EYonetici[tip]
	            if (eYon) {
		            let { url } = await eYon.eIslemIzle({ recs, internal }) ?? {}
		            if (url) {
		                openNewWindow(url)
		                await delay(20)
		            }
				}
				pm?.progressStep()
	        }
		}
		finally {
			pm?.progressEnd()
			delay(20).then(() =>
				hideProgress())
		}

        return tip2Res
    }
	static async eIslemKaldirIstendi({ sender: listePart } = {}) {
		let islemAdi = 'e-İşlem KALDIR'
        let { tip2EYonetici } = listePart
        let totalCount = 0, tip2Recs = {}
        for (let r of listePart.selectedRecs) {
            let { eIslTip: k } = r
            k ||= 'E'
            ;(tip2Recs[k] ??= []).push(r)
			totalCount++
        }
        
        if (empty(tip2Recs))
            throw { isError: true, errorText: 'Silinecek belgeler seçilmelidir' }

		try {
			let rdlg = await ehConfirm(
				(
					`<p><b class="royalblue">${totalCount} adet</b> Gelen e-İşlem Belgesi <u class="bold red">SİLİNECEKTİR</u></p>` +
					`<p>Devam edilsin mi?</p>`
				),
				islemAdi
			)
			if (!rdlg)
				return
		}
		catch (ex) { return }
		
        let internal = true
        let tip2Res = {}
		let pm = await showProgress(`<b class="royalblue">${totalCount} adet</b> Gelen e-İşlem Belgesi <u class="red">SİLİNİYOR</u>...`, islemAdi)
		try {
			pm?.setProgressMax(totalCount)
	        for (let [tip, recs] of entries(tip2Recs)) {
	            let eYon = tip2EYonetici[tip]
	            if (eYon)
		            tip2Res[tip] = await eYon.eIslemKaldir({ recs, internal }) ?? {}
				pm?.progressStep()
	        }

			let { gridWidget: w } = listePart ?? {}
			w?.clearselection()
			delay(10).then(() =>
				listePart?.tazele?.())
		}
		finally {
			pm?.progressEnd()
			delay(20).then(() =>
				hideProgress())
		}

        return tip2Res
    }
	static async musteriBelirleIstendi({ sender: listePart } = {}) {
		let islemAdi = 'Müşteri Belirle'
		let { eConf, selectedRec: rec } = listePart
		if (!rec) {
			hConfirm('Bir satır seçilmelidir', islemAdi)
			return
		}

		let pr = defer()
		let inst = new MQEIslem_Gelen_EkBilgiUI()
			.tip_musteriBelirle()
			.setTitle('Cari Hesap Belirleme')
			.setParentPart(listePart)
			.setEConf(eConf)
			.setRec(rec)
			.setTamamIslemi(res =>
				void(pr.resolve(res)))
		await inst.run()
		
		let { part } = inst
		part?.kapaninca?.(() =>
			pr.resolve(null))
		
		let res = await pr
		if (!res)
			return

		let { uuid, gondericiMustKod: mustkod, degAdresKod: degadreskod = '' } = res.rec
		if (uuid) {
			let upd = new MQIliskiliUpdate(), { where: wh, set } = upd
			upd.fromAdd('efgecicialfatfis')
			wh.degerAta(uuid, 'efuuid')
			set.birlestirDict({ mustkod, degadreskod })
			await upd.execute()
		}

		listePart?.tazele?.()
		
	}
	static async ticariyeAktarIstendi(e = {}) {
		let islemAdi = 'e-İşlem Ticariye Aktar'
		let { sender: listePart } = e
		let { eConf, selectedRec: rec } = listePart
		let { zorunlu: { cariYil } } = app.params
		cariYil ||= today().yil
		function err(errorText) {
			throw { isError: true, errorText }
		}
		if (!rec)
			err('Bir satır seçilmelidir')

		let { uuid, fisNox } = rec
		if (!uuid)
			err('Bu belge için UUID değeri belirsizdir')

		let yerRec = await MQStokYer.getVarsayilanYerRec() ?? {}
		let { sayac, subeKod, yerKod, gondericiMustKod: mustKod, tarih, eIslTip: efBelge } = rec
		let tsn = ( fisNox ? TicariSeriliNo.fromText(fisNox) : null ) ?? {}
		let { seri, noYil, no: fisNo } = tsn
		if (!fisNo)
			err('Bu belge için Belge No değeri belirsizdir')

		let eIslTip = EYonetici_Gelen.normalizeEFAyrimTipi_giden(efBelge)
		let irsaliyemi = eIslTip == 'IR'
		
		subeKod = yerRec.bizsubekod || subeKod || ''
		yerKod = yerRec.kod || yerKod || 'A'
		tarih = asDate(tarih)
		seri ||= ''
		noYil ||= cariYil
		
		;{
			let uni = new MQUnionAll()
			;['piffis', 'stfis'].forEach(table => {
				let sent = new MQSent(), { where: wh, sahalar } = sent
				sent.fromAdd(table)
				wh.add(
					new MQOrClause()
						.degerAta(uuid, 'efatuuid')
						.add(new MQAndClause()
							.degerAta(subeKod, 'bizsubekod')
							.degerAta(seri, 'seri')
							.degerAta(noYil, 'noyil')
							.degerAta(fisNo, 'no')
						)
				)
				if (table == 'piffis') {
					wh
						.degerAta(irsaliyemi ? 'I' : 'F', 'piftipi')
						.add(new MQOrClause()
							.add(new MQAndClause([`almsat = 'A'`, `iade = ''`]))
							.add(new MQAndClause([`almsat = 'T'`, `iade = 'I'`]))
						)
				}
				sahalar.add('1')
				uni.add(sent)
			})
			let _recs = await uni.execSelect()
			if (!empty(_recs)) {
				this.ticariyeAktarIstendi_kaydetSonrasi({ sender: listePart, rec, uuid })    // tamamlandı işareti yoksa koy, sonucu beklemeye gerek yok
				err('Bu belge zaten ticariye aktarılmış')
			}
		}

		let pr = defer()
		let inst = new MQEIslem_Gelen_EkBilgiUI()
			.tip_ticariAktar()
			.setParentPart(listePart)
			.setEConf(eConf)
			.setRec(rec)
			.setTamamIslemi(res => {
				if (!mustKod)
					err('Müşteri belirtilmelidir')
				void(pr.resolve(res))
			})
		await inst.run()
		
		;{
			let { part } = inst
			part?.kapaninca?.(() =>
				pr.resolve(null))
		}
		
		let res = await pr
		rec = res?.rec
		if (!rec)
			return

		mustKod = rec.gondericiMustKod ?? mustKod
		if (!mustKod)
			err('Müşteri belirtilmelidir')
		
		let { ayrimTipi, iade: iademi, fisTipi } = rec
		let alimmi = true
		if (fisTipi != null) {
			fisTipi = fisTipi?.char ?? fisTipi
			alimmi = !fisTipi
			iademi = fisTipi == 'I'
		}
		
		let fisSinif = FisAyrimTipiBasit.gelenFisSinifFor({ irsaliyemi, iademi, ayrimTipi })
		if (!fisSinif)
			err('Fiş Sınıfı belirlenemedi')

		let gridKontrolcuSinif = EIslAlimGridKontrolcu
		let efDonusumler = await EYonetici_Gelen.getEFDonusum(rec)

		let eBilgi = { rec, efDonusumler, gridKontrolcuSinif }
		let fis = new fisSinif({
			eBilgi,
			tarih, seri, noYil, fisNo,
			subeKod, mustKod, yerKod,
			uuid
		})
		
		await fis.eBilgiIcinDetaylariYukle(e)
		await fis.disFisGiris_ekIslemler(e)
		fis.efAyrimTipi.char = irsaliyemi ? 'IR' : 'E'
		
		fis.rootFormBuilderDuzenle_ekIslem(_e => {
			let { builders: b } = _e
			let { baslikForm: { builders: formlar } } = b
			let { style, tools: t } = SimplePart.ekBilgi_styleAndTools
			;{
				let form = formlar[2]
				form.addForm('_eBilgiText')
					.addStyle(style)
					.addStyle(`$elementCSS { margin-top: 5px !important }`)
					.setLayout(({ builder: { id, inst: fis } }) => {
						let { eBilgi: { rec } } = fis
						let { tarih, fisNox, gondericiUnvan: unvan, gondericiVKN: vkn } = rec
						let tarihStr = asDateAndToKisaString(tarih)
						return $([
	                        `<div class="full-wh">`,
	                            `<div class="parent flex-row full-width">`,
	                                t.ka('tarih', 'Tarih:', tarihStr),
	                                t.ka('fisNox', 'Fiş No:', fisNox),
	                            `</div>`,
	                            `<div class="parent flex-row full-width">`,
	                                t.ka('unvan', 'Gönderici:', unvan),
	                                t.ka('vkn', 'VKN:', vkn, null),
	                            `</div>`,
	                        `</div>`
	                    ].filter(Boolean).join(''))
					})
			}
		})
		
		pr = defer()
		await fis.tanimla({
			islem: 'yeni',
			kaydedince: _e =>
				pr.resolve({ ...e, ..._e }),
			kapaninca: _e => 
				pr.resolve(null)
		})
		
		res = await pr
		if (!res)
			return null
		
		await this.ticariyeAktarIstendi_kaydetSonrasi({ ...e, res, rec, fis })
		return res
		
    }
	static async ticariyeAktarIstendi_kaydetSonrasi({ sender: listePart, rec, uuid, fis } = {}) {
		if (fis)
			fis._kaydedildimi = true

		uuid ||= rec?.uuid
		if (!uuid)
			return

		let upd = new MQIliskiliUpdate(), { where: wh, set } = upd
		upd.fromAdd('efgecicialfatfis')
		wh.degerAta(uuid, 'efuuid')
		set.degerAta('*', 'tamamlandi')
		await upd.execute()

		listePart?.tazele()
	}

    static getEYoneticiler(e = {}) {
        let { tip2EYonetici, listePart = e.gridPart ?? e.sender } = e
        tip2EYonetici ??= listePart?.tip2EYonetici
        return values(tip2EYonetici)
    }
}
