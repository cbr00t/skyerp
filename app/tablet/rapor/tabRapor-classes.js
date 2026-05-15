class TabRapor_IlkIrsaliye extends TabRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'ILKIRSALIYE' }
	static get aciklama() { return 'İlk İrsaliye' }

	getUstBilgi(e) {
		return [
			'MUHTELİF MÜŞTERİLERE GÖNDERİLMEK ÜZERE',
			'ARAÇTAKİ MAL STOĞU',
			' '
		]
	}
	getTabloKolonlari(e) {
		return [
			...( super.getTabloKolonlari(e) ?? [] ),
			new GridKolon({ belirtec: 'stokText', text: 'Ürün' }).input().setUserData({ dokumSaha: { width: 35 } }),
			new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 13 }).input().tipDecimal().sum().setUserData({ }),
			new GridKolon({ belirtec: 'brm', text: 'Br', genislikCh: 4 }).checkedList().setUserData({ })
		]
	}
	async getSource(e) {
		let recs = await super.getSource(e) ?? []
		if (!recs)
			return recs
		;{
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent.fromAdd('sonstok son')
			wh.add(`son.stokKod <> ''`, `son.ozelIsaret <> 'X'`, `son.sonMiktar <> 0`)
			sahalar.add('son.stokKod', `SUM(son.sonMiktar) miktar`)
			sent.groupByOlustur()
			let orderBy = ['miktar DESC']
			let stm = new MQStm({ sent, orderBy })
			let _stok2Rec = await MQTabStok.getGloKod2Rec()
			;( await stm.execSelect() ).forEach(rec => {
				let { stokKod: kod } = rec
				let { aciklama: adi, brm } = _stok2Rec[kod] ?? {}
				rec.stokText = adi ?? `(${kod})`
				rec.brm = brm || 'AD'
				recs.push(rec)
			})
		}
		return recs
	}
	dokumGetColText({ key }) {
		switch (key) {
			case 'stokText': return 'Ürün'
			case 'miktar': return 'Miktar'
			case 'brm': return 'Brm'
		}
		return super.dokumGetColText(...arguments)
	}
	async dokumGetValue({ tip, key, inst = {} }) {
		let e = arguments[0]
		if (tip != 'cols') {
			switch (key) {
				case 'miktar':
					return inst[key]
				case 'dip': {
					let { dokumDetaylar: recs = [] } = inst
					let brm2TopMiktar = {}
					;recs.forEach(({ brm, miktar }) =>
						brm2TopMiktar[brm] = (brm2TopMiktar[brm] ?? 0) + Number(miktar))
					for (let [k, v] of entries(brm2TopMiktar))
						brm2TopMiktar[k] = roundToFra(3)
					
					let items = entries(brm2TopMiktar).map(([brm, topMiktar]) =>
						`${topMiktar} ${brm}`)
					let toplamText = items.join(' | ')
					toplamText = `T: ${toplamText}`
					
					return [
						'-'.repeat(toplamText.length),
						toplamText
					]
				}
			}
		}
		return await super.dokumGetValue(...arguments)
	}
}

class TabRapor_SatislarVeTahsilatlar extends TabRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'SATISVETAH' }
	static get aciklama() { return 'Satışlar ve Tahsilatlar' }

	getTabloKolonlari(e) {
		return [
			...( super.getTabloKolonlari(e) ?? [] ),
			new GridKolon({ belirtec: 'mustText', text: 'Müşteri' }).input().setUserData({ dokumSaha: { width: 30 } }),
			new GridKolon({ belirtec: 'sonuc', text: 'Belge Sonuç', genislikCh: 15 }).input().tipDecimal_bedel().sum().setUserData({ }),
			new GridKolon({ belirtec: 'tah_TOPLAM', text: 'Top. Tah.', genislikCh: 15 }).input().tipDecimal_bedel().setUserData({ }),
			new GridKolon({ belirtec: 'tah_NK', text: 'Nakit', genislikCh: 15 }).input().tipDecimal_bedel().setUserData({ dokumSaha: { width: 0 } }),
			new GridKolon({ belirtec: 'tah_PS', text: 'POS', genislikCh: 15 }).input().tipDecimal_bedel().setUserData({ dokumSaha: { width: 0 } }),
			new GridKolon({ belirtec: 'tah_', text: 'Vadeli', genislikCh: 15 }).input().tipDecimal_bedel().setUserData({ dokumSaha: { width: 0 } }),
			new GridKolon({ belirtec: 'tah_DIGER', text: 'Diğer', genislikCh: 15 }).input().tipDecimal_bedel().setUserData({ dokumSaha: { width: 0 } }),
		]
	}
	async getSource(e) {
		let recs = await super.getSource(e) ?? []
		if (!recs)
			return recs

		let _must2Rec = await MQTabCari.getGloKod2Rec()
		let _tahNo2Rec = await MQTabTahsilSekli.getGloKod2Rec()
		let odemeliNoListe = values(_tahNo2Rec)
			.filter(r => r.tahsiltipi)
			.map(r => Number(r.kodno))
		
		let uni = new MQUnionAll()
		;{
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent.fromAdd('tabfis fis')
			wh
				.add(`fis.silindi = ''`, `fis.gecici = ''`)
				.add(`fis.merkez = ''`, `fis.sonuc <> 0`)
				.add(`fis.fistipi <> 'TAH'`)
				.inDizi(odemeliNoListe, 'fis.tahseklino')
			sahalar.add('fis.must mustKod', 'fis.tahseklino tahSekliNo', `SUM(fis.sonuc) sonuc`, `SUM(fis.sonuc) tahsilat`)
			sent.groupByOlustur()
			uni.add(sent)
		}
		;{
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent.fromAdd('tabfis fis')
			wh
				.add(`fis.silindi = ''`, `fis.gecici = ''`)
				.add(`fis.merkez = ''`, `fis.sonuc <> 0`)
				.add(`fis.fistipi <> 'TAH'`)
				.notInDizi(odemeliNoListe, 'fis.tahseklino')
			sahalar.add('fis.must mustKod', 'fis.tahseklino tahSekliNo', `SUM(fis.sonuc) sonuc`, `0 tahsilat`)
			sent.groupByOlustur()
			uni.add(sent)
		}
		;{
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent
				.fromAdd('tabhar har')
				.innerJoin('har', 'tabfis fis', [
					'har.fisid = fis.id', `fis.fistipi = 'TAH'`,
					`fis.silindi = ''`, `fis.gecici = ''`, `fis.merkez = ''`,
					`fis.sonuc <> 0`
				])
			wh
				.inDizi(odemeliNoListe, 'har.tahseklino')
				.add(`har.bedel <> 0`)
			sahalar.add('fis.must mustKod', 'har.tahseklino tahSekliNo', `0 sonuc`, `SUM(har.bedel) tahsilat`)
			sent.groupByOlustur()
			uni.add(sent)
		}
		
		let orderBy = ['mustKod', 'tahSekliNo']
		let stm = new MQStm({ sent: uni, orderBy })
		
		let must2Rec = {}
		let tahTotalSelector = 'tah_TOPLAM'
		;( await stm.execSelect() ).forEach(r => {
			let { mustKod, tahSekliNo, sonuc, tahsilat } = r
			let { aciklama: mustText } = _must2Rec[mustKod] ?? {}
			let { tahsiltipi: tahTip } = _tahNo2Rec[tahSekliNo] ?? {}
			let rec = must2Rec[mustKod] ??= { mustKod, mustText, tahTip }
			rec.sonuc = roundToBedelFra( (rec.sonuc || 0) + sonuc )
			let tahTipSelector = `tah_${tahSekliNo ? tahTip : 'DIGER'}`
			rec[tahTotalSelector] = roundToBedelFra( (rec[tahTotalSelector] || 0) + tahsilat )
			rec[tahTipSelector] = roundToBedelFra( (rec[tahTipSelector] || 0) + tahsilat )
		})
		
		return values(must2Rec)
	}
	dokumGetColText({ key }) {
		switch (key) {
			case 'mustText': return 'Müşteri'
			case 'sonuc': return 'Belge Sonuç'
			case 'tah_TOPLAM': return 'Top. Tah.'
			case 'tah_NK': return 'Nakit'
			case 'tah_PS': return 'POS'
			case 'tah_': return 'Vadeli'
			case 'tah_DIGER': return 'Diğer'
		}
		return super.dokumGetColText(...arguments)
	}
	async dokumGetValue({ tip, key, inst: { dokumDetaylar: recs } = {} } = {}) {
		let e = arguments[0]
		if (tip != 'cols') {
			switch (key) {
				case 'dip': {
					let toplam = { }
					;recs?.forEach(r => {
						let { sonuc } = r
						toplam.sonuc = roundToBedelFra( (toplam.sonuc || 0) + sonuc )
						for (let k in r) {
							if (k.startsWith('tah_'))
								toplam[k] = roundToBedelFra( (toplam[k] || 0) + r[k] )
						}
					})
					return entries(toplam).map(([key, value]) => [
						this.dokumGetColText({ key }),
						value
					])
				}
			}
		}
		return await super.dokumGetValue(...arguments)
	}
}

class TabRapor_SonStok extends TabRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'SONSTOK' }
	static get aciklama() { return 'Son Stok' }

	gridArgsDuzenleIslemi({ args }) {
		super.gridArgsDuzenleIslemi(...arguments)
		extend(args, { showGroupsHeader: true })
	}
	getTabloKolonlari(e) {
		return [
			...( super.getTabloKolonlari(e) ?? [] ),
			new GridKolon({ belirtec: 'stokText', text: 'Ürün' }).input().setUserData({ dokumSaha: { width: 35 } }),
			new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 10 }).input().tipDecimal().sum().setUserData({ }),
			new GridKolon({ belirtec: 'brm', text: 'Br', genislikCh: 4 }).checkedList().setUserData({ }),
			new GridKolon({ belirtec: 'yerText', text: 'Depo', genislikCh: 15 }).input().setUserData({ dokumSaha: { x: 0, y: 2, width: 10 } })
		]
	}
	async getSource(e) {
		let recs = await super.getSource(e) ?? []
		if (!recs)
			return recs
		;{
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent.fromAdd('sonstok son')
			wh.add(`son.stokKod <> ''`, `son.ozelIsaret <> 'X'`, `son.sonMiktar <> 0`)
			sahalar.add('son.yerKod', 'son.stokKod', `SUM(son.sonMiktar) miktar`)
			sent.groupByOlustur()
			let orderBy = ['yerKod', 'miktar DESC']
			let stm = new MQStm({ sent, orderBy })
			let _yer2Rec = await MQTabYer.getGloKod2Rec()
			let _stok2Rec = await MQTabStok.getGloKod2Rec()
			;( await stm.execSelect() ).forEach(rec => {
				let { yerKod, stokKod } = rec
				let { aciklama: yerAdi } = _yer2Rec[yerKod] ?? {}
				let { aciklama: stokAdi, brm } = _stok2Rec[stokKod] ?? {}
				extend(rec, {
					yerText: yerAdi ?? `(${yerKod})`,
					stokText: stokAdi ?? `(${stokKod})`,
					brm: brm || 'AD'
				})
				recs.push(rec)
			})
		}
		return recs
	}
	async gridVeriYuklenince({ gridPart: { grid, gridWidget: w } }) {
		await super.gridVeriYuklenince(...arguments)
		let groups = this._groupsInit ? grid.jqxGrid('groups') : ['yerText']
		if (!empty(groups))
			grid.jqxGrid('groups', groups)
		this._groupsInit = true
	}
	dokumGetColText({ key }) {
		switch (key) {
			case 'yerText': return 'Depo'
			case 'stokText': return 'Ürün'
			case 'miktar': return 'Miktar'
			case 'brm': return 'Brm'
		}
		return super.dokumGetColText(...arguments)
	}
	async dokumGetValue({ tip, key, inst = {} }) {
		let e = arguments[0]
		if (tip != 'cols') {
			switch (key) {
				case 'miktar':
					return inst[key]
				case 'dip': {
					let { dokumDetaylar: recs = [] } = inst
					let brm2TopMiktar = {}
					;recs.forEach(({ brm, miktar }) =>
						brm2TopMiktar[brm] = (brm2TopMiktar[brm] ?? 0) + Number(miktar))
					for (let [k, v] of entries(brm2TopMiktar))
						brm2TopMiktar[k] = roundToFra(3)
					
					let items = entries(brm2TopMiktar).map(([brm, topMiktar]) =>
						`${topMiktar} ${brm}`)
					let toplamText = items.join(' | ')
					toplamText = `T: ${toplamText}`
					
					return [
						'-'.repeat(toplamText.length),
						toplamText
					]
				}
			}
		}
		return await super.dokumGetValue(...arguments)
	}
}
