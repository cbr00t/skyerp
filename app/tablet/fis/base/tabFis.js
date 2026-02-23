class TabFis extends MQDetayliGUID {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar, '_dipIslemci'] }
	static get araSeviyemi() { return this == TabFis }
	static get fisTipi() {return this.kodListeTipi } static get sinifAdi() { return 'Tablet Fiş' }
	static get table() { return 'tabfis' } static get tableAlias() { return 'fis' }
	static get detaySinif() { return TabDetay } static get sayacSaha() { return 'id' }
	static get tanimUISinif() { return TabFisGirisPart } static get secimSinif() { return null }
	static get dipKullanilirmi() { return false } static get dipSinif() { return TabIcmal }
	static get dipGirisYapilirmi() { return true } static get gridIslemTuslariKullanilirmi() { return false }
	static get tumKolonlarGosterilirmi() { return true } static get kolonFiltreKullanilirmi() { return false }
	// static get noAutoFocus() { return true }
	static get gonderildiDesteklenirmi() { return true }
	static get offlineFis() { return true } static get almSat() { return null }
	static get satismi() { return this.almSat == 'T' } static get alimmi() { return this.almSat == 'A' }
	static get numTipKod() { return 'TB' } static get numKod() { return 'TB' }
	static get defaultSeri() { return 'TAB' } static get _bedelKullanilirmi() { return false }
	static get mustZorunlumu() { return true }
	static get dokumFormTip_normal() { return null }
	static get dokumFormTip_eIslem() { return this.dokumFormTip_normal }
	static get bedelKullanilirmi() {
		let {_bedelKullanilirmi: result} = this
		if (result) {
			let {depomu} = app, {tablet: { depoBedelGorur } = {}} = app.params
			result &&= !(depomu && depoBedelGorur === false)
		}
		return result
	}
	static get onlineFisSinif() { return null }
	static get tip2Sinif() {
		let {_tip2Sinif: result} = this
		if (!result) {
			result = this._tip2Sinif = fromEntries(
				TabFis.subClasses
					.filter(_ => !(_.araSeviyemi || _.ozelmi) && _.fisTipi)
					.map(_ => [_.fisTipi, _])
			)
		}
		return result
	}
	get numYapi() {
		let {numTipKod: tip, numKod: belirtec, defaultSeri: seri} = this.class
		let aciklama = 'Sky Tablet'
		return tip ? new MQTicNumarator({ tip, belirtec, aciklama, seri }) : null
	}
	get kosulYapilar() { return this._kosulYapilar }
	set kosulYapilar(value) { this._kosulYapilar = value }
	get fisNox() { return this.tsn?.asText() }
	get dipIslemci() {
		let {_dipIslemci: result} = this
		if (result === undefined) {
			this.dipOlustur()
			result = this._dipIslemci
		}
		return result
	}
	set dipIslemci(value) { this._dipIslemci = value }
	get dipGridSatirlari() { return null }
	get bakiyeciler() { return [] }
	get fisTopBrut() {
		let {dipIslemci, detaylar} = this
		if (dipIslemci)
			return dipIslemci.fisTopBrut
		return detaylar ? roundToBedelFra(topla(_ => _.netBedel || _.bedel || 0, detaylar)) : 0
	}
	get fisTopNet() {
		let {dipIslemci} = this
		return dipIslemci?.sonuc ?? this.fisTopBrut
	}
	get sonucBedel() { return this.fisTopNet }
	get dokumDetaylar() { return this.detaylar.filter(Boolean) }

	constructor({ isCopy, offlineBuildQuery } = {}) {
		super(...arguments)
		if (isCopy) {
			let {_dipIslemci} = this
			if (_dipIslemci)
				_dipIslemci.fis = this
		}
		else {
			if (!offlineBuildQuery) {
				let num = this.numarator ??= this.numYapi?.deepCopy()
				if (num)
					num._promise = num.yukle()
				this.dvKod ||= 'TL'
				this.fisNo ||= null
				;['subeKod', 'mustKod', 'plasiyerKod'].forEach(k => {
					let bu = this[k], def = app[k]
					if (!bu && def != null)
						this[k] = bu = def
				})
			}
		}
		this._prev = {}
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			plasiyerKod: new PInstStr('plasiyerkod'),
			tarih: new PInstDateToday('tarih'),
			subeKod: new PInstStr('bizsubekod'),
			seri: new PInstStr('seri'),
			noYil: new PInstNum('noyil'),
			fisNo: new PInst('fisno'),
			mustKod: new PInstStr('must'),
			aciklama: new PInstStr('cariaciklama'),
			fisSonuc: new PInstNum('sonuc')
		})
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e)
		let { parentPart: gridPart, part, liste } = e
		let items = [
			{ id: 'menu', text: '...', handler: async _e => {
				_e = { ...e, ..._e }
				try {
					let args = await this.getDefaultContextMenuArgs(_e)
					if (args) {
						let {selectedRecs: recs} = gridPart
						extend(_e, { recs, ...args })
						gridPart.openContextMenu(_e)
					}
				}
				catch (ex) { cerr(ex); throw ex }
			}}
		]
		let set = part.ekSagButonIdSet ??= {}
		if (items.length) {
			liste.unshift(...items)
			extend(set, asSet(items.map(_ => _.id)))
		}
	}
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e)
		MQMasterOrtak.orjBaslikListesi_argsDuzenle(e)
	}
	static ekCSSDuzenle({ dataField: belirtec, rec, result }) {
		super.ekCSSDuzenle(...arguments)
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: '_html', text: 'Belge' }).noSql(),
			new GridKolon({ belirtec: 'sonuc', text: 'Fiş Bedeli', genislikCh: 11 }).noSql().tipDecimal_bedel().sifirGosterme()
		)
	}
	static async loadServerDataDogrudan({ offlineRequest, offlineMode }) {
		if (!offlineRequest) {
			let cacheClasses = [MQTabCari]
			await Promise.allSettled(cacheClasses.map(_ => _.getGloKod2Rec()))
		}
		let recs = await super.loadServerDataDogrudan(...arguments)
		if (!offlineRequest) {
			for (let rec of recs)
				rec._html = this.getHTML({ ...e, rec })
		}
		return recs
	}
	static loadServerData_queryDuzenle({ offlineRequest, offlineMode, stm }) {
		let e = arguments[0]; super.loadServerData_queryDuzenle(e)
		let {tableAlias: alias} = this
		let unvanSaha = offlineMode === false ? 'birunvan' : MQTabCari.adiSaha
		for (let sent of stm) {
			let {from, where: wh, sahalar, alias2Deger} = sent
			if (!from.aliasIcinTable('car'))
				sent.leftJoin(alias, 'carmst car', 'fis.must = car.kod')
			if (!offlineRequest || offlineMode)
				wh.add(`${alias}.silindi = ''`)
			if (!alias2Deger.mustunvan)
				sahalar.add(`car.${unvanSaha} mustunvan`)
			if (!alias2Deger['*'])
				sahalar.add(`${alias}.*`)
		}
		let {orderBy} = stm
		orderBy.liste = orderBy.liste
			.filter(_ => !_.startsWith('_'))
			.map(_ => _.toUpperCase().endsWith('DESC') ? _ : `${_} DESC`)
	}
	static async loadServerData_detaylar({ parentRec: { fisTipi } = {}, offlineRequest, offlineMode }) {
		let recs = await super.loadServerData_detaylar(...arguments)
		if (offlineRequest)
			return recs
		for (let rec of recs) {
			let detaySinif = this.detaySinifFor({ rec })
			if (!detaySinif)
				continue
			let det = new detaySinif()
			await det.setValues({ rec })
			rec._html = det.html
		}
		return recs
	}
	async uiGirisOncesiIslemler(e) {
		this._promise_ready = new $.Deferred()
		await super.uiGirisOncesiIslemler(e)
		try { await this.satisKosullariOlustur(e) }
		catch (ex) { cerr(ex) }
	}
	async uiGirisSonrasiIslemler(e) {
		await super.uiGirisSonrasiIslemler(e)
		setTimeout(() => {
			this._promise_ready?.resolve()
			this._uiReady = true
		}, 1000)
	}
	async yeniTanimOncesiIslemler(e) {
		await this.topluHesapla(e)
		await super.yeniTanimOncesiIslemler(e)
		let fis = this, {numarator: num} = this
		if (num) {
			await num?._promise
			if (!this.fisNo) {
				$.extend(this, {
					seri: num.seri ?? this.seri,
					noYil: num.noYil ?? this.noYil,
					fisNo: null
				})
			}
		}
	}
	async yukleSonrasiIslemler({ islem }) {
		// this.dipOlustur()
		let e = arguments[0]
		await super.yukleSonrasiIslemler(e)
		this.topluHesapla(e)
		let fis = this, {detaylar} = this
		detaylar.forEach(det =>
			det.htmlOlustur?.())
	}
	async uiKaydetOncesiIslemler(e) {
		let fis = this, {detaylar, class: { detaySinif }} = this
		let _e = { ...e, fis, result: [] }
		await this.dataDuzgunmuDuzenle(_e)
		await detaySinif.uiKaydetOncesiIslemler(_e)
		detaylar.forEach(async (det, i) => {
			_e.seq = i + 1
			await det.uiKaydetOncesiIslemler(_e)
		})
		
		let {result} = _e
		if (!empty(result)) {
			let isError = true
			let errorText = result
				.map(getErrorText)
				.filter(_ => _ != null)
				.map(_ => `<li>${_}</li>`)
				.join(CrLf)
			if (errorText)
				errorText = `<ul>${errorText}</ul>`
			throw { isError, errorText }
		}
		return await super.uiKaydetOncesiIslemler(e)
	}
	async dataDuzgunmuDuzenle({ eskiInst: eskiFis, parentPart, gridPart, result }) {
		let {mustKod, plasiyerKod, class: { mustZorunlumu }} = this
		if (!mustKod && mustZorunlumu)
			result.push(`<b class=firebrick>Müşteri</b> belirtilmelidir`)
		if (mustKod && !await MQTabCari.kodVarmi(mustKod))
			result.push(`<b>Müşteri [<span class=firebrick>${mustKod}</span>]</b> hatalıdır`)
		if (plasiyerKod && !await MQTabPlasiyer.kodVarmi(plasiyerKod))
			result.push(`<b>Plasiyer [<span class=firebrick>${plasiyerKod}</span>]</b> hatalıdır`)
		return null
	}
	async kaydetOncesiIslemler({ islem }) {
		let e = arguments[0]
		await this._promise_topluHesapla
		await super.kaydetOncesiIslemler(e)
		let yeniVeyaKopyami = islem == 'yeni' || islem == 'kopya'
		let {eIslTip, fisNo, numarator: num} = this
		if (eIslTip)
			this.uuid ||= newGUID()
		this.fisSonuc = this.fisTopNet		
		if (yeniVeyaKopyami) {
			this.sayac = null
			if (!fisNo && num) {
				if (!num.sayac)
					await num.kaydet()
				do {
					await num.kesinlestir()
					this.fisNo = num.sonNo
				} while (await this.varmi())
			}
		}
		await this.dipIslemci?.kaydetOncesiIslemler(...arguments)
	}
	async kaydetSonrasiIslemler({ islem }) {
		super.kaydetSonrasiIslemler(...arguments)
	}
	async yukle(e = {}) {
		let {rec} = e
		if (rec)
			await this.setValues(e)
		else {
			e.rec = undefined
			return await super.yukle(e)
		}
	}
	async sil(e) {
		let {sayac: id, class: { table, idSaha }} = this
		if (!id)
			return false
		let upd = new MQIliskiliUpdate(), {where: wh, set} = upd
		upd.fromAdd(table)
		wh.degerAta(id, idSaha)
		set.degerAta(bool2FileStr(true), 'silindi')
		return await this.sqlExecNone(upd)
	}
	static varsayilanKeyHostVarsDuzenle({ hv }) {
		super.varsayilanKeyHostVarsDuzenle(...arguments)
		let {fisTipi} = this
		if (fisTipi != null)
			$.extend(hv, { fisTipi })
	}
	keyHostVarsDuzenle({ hv }) {
		super.keyHostVarsDuzenle(...arguments)
		let {class: { idSaha }} = this
		let id = this.id ||= newGUID()
		hv[idSaha] = id
	}
	kopyaIcinDuzenle(e) {
		super.kopyaIcinDuzenle(e)
		$.extend(this, { fisNo: null, tarih: today() })
		if (this.sevkTS)
			this.sevkTS = now()
	}
	topluYazmaKomutlariniOlustur_baslikSayacBelirle(e) {
		// super yok
		return this.id ||= newGUID()
	}
	topluYazmaKomutlariniOlustur_sqlParamsDuzenle({ params, paramName_fisSayac }) {
		// do nothing
	}

	static getDefaultContextMenuItems(e) {
		return [
			...(super.getDefaultContextMenuItems(e) ?? []),
			{ id: 'yazdir',  text: 'Yazdır', handler: _e => this.orjBaslikListesi_yazdirIstendi({ ...e, ..._e }) }
		]
	}
	static getTanimPartMenuItems(e = {}) {
		let {sender: tanimPart} = e, {acc} = tanimPart
		return [
			{ id: 'yazdir', text: 'Yazdır', handler: _e => { this.yazdirIstendi({ ...e, ..._e, tanimPart }); _e.close?.() } },
			{ id: 'duzenle', text: 'Düzenle', handler: _e => { acc.expand('duzenle'); _e.close() } },
			{ id: 'temizle', text: 'Temizle', handler: _e => this.temizleIstendi({ ...e, ..._e, tanimPart }) }
		]
	}

	static async orjBaslikListesi_yazdirIstendi(e = {}) {
		let {gridPart = e.sender, recs, close} = e
		if (empty(recs))
			return
		let count = recs.length
		showProgress(`${count} adet belge yazdırılıyor...`, 'Yazdır')
		let {progressManager: pm} = window
		pm.setProgressMax(count * 5 + 10)
		try {
			for (let rec of recs) {
				let {fisTipi, id} = rec
				let cls = TabFisListe.fisSinifFor(fisTipi)
				pm?.progressStep()
				let inst = cls ? new cls({ id }) : null
				if (!(await inst?.yukle()))
					continue
				pm?.progressStep()
				await this.yazdir({ ...e, inst })
				pm?.progressStep(3)
			}
		}
		finally {
			pm?.progressEnd()
			setTimeout(() => hideProgress(), 300)
		}
		close?.()
	}
	static temizleIstendi({ tanimPart, close }) {
		let {inst: fis, acc, gridPart} = tanimPart
		fis.detaylar = []
		gridPart?.tazele()
		acc.collapse()
		setTimeout(() => {
			acc.expand('detay')
			close?.()
		}, 50)
	}

	tarihDegisti({ value = this.tarih }) {
		this.satisKosullariOlusturWithReset(...arguments)
	}
	plasiyerDegisti({ oldValue = this._prev.plasiyerKod, value = this.plasiyerKod }) {
		this._prev.plasiyerKod = value
	}
	async mustDegisti({ oldValue = this._prev.mustKod, value = this.mustKod }) {
		if (!(oldValue && value == oldValue))
			await this.satisKosullariOlusturWithReset(...arguments)
		this._prev.mustKod = value
	}

	dipOlustur(e) {
		let result = null, fis = this
		let {dipKullanilirmi, dipSinif} = this.class
		if (dipKullanilirmi && dipSinif)
			result = this.dipIslemci = new dipSinif({ fis })
		return result
	}
	topluHesapla(e) {
		let {dipIslemci} = this
		dipIslemci?.topluHesapla(e)
		return this
	}
	topluHesaplaDefer(e = {}) {
		let {acc, tanimPart = e.sender} = e
		acc ??= tanimPart?.acc
		let k = '_timer_topluHesapla'
		clearTimeout(this[k])
		this._promise_topluHesapla?.resolve()
		this._promise_topluHesapla = new $.Deferred()
		this[k] = setTimeout(async e => {
			try {
				await this.topluHesapla(e)
				acc?.render()
			}
			finally {
				delete this[k]
				this._promise_topluHesapla?.resolve()
			}
		}, 500, e)
		return this
	}
	async satisKosullariOlusturWithReset(e = {}) {
		await this.satisKosullariOlustur(e)
		await this.satisKosullariReset(e)
	}
	async satisKosullariReset(e) { return this }
	async satisKosullariOlustur(e) { return this }
	static async yeniInstOlustur(e = {}) {
		let { gridPart = e.sender, islem, rec, rowIndex, args = {} } = e
		let {gonderildiDesteklenirmi, gonderimTSSaha} = this
		let {fisTipi} = rec ?? {}
		let degistirmi = islem == 'degistir'
		let silmi = islem == 'sil'
		let gonderimTS = gonderildiDesteklenirmi ? rec?.[gonderimTSSaha] : null
		if (silmi) {let gonderimTS = rec[gonderimTSSaha]
			if (gonderimTS)
				throw { isError: true, errorText: 'Merkeze gönderilmiş belgeler silinemez' }
			let {tip2Sinif} = this, cls = tip2Sinif[fisTipi]
			if (cls?.tahsilatmi) {
				let {dev, session: { isAdmin } = {}} = config
				if (!(dev && isAdmin))
					throw { isError: true, errorText: 'Tahsilat Fişi silme yetkiniz yok' }
			}
		}
		else if (degistirmi && gonderimTS)
			e.islem = 'izle'
	}
	async asOnlineFis(e = {}) {
		let {sayac: tabletID, tarih, seri, noYil, fisNo, plasiyerKod, subeKod, mustKod, class: { onlineFisSinif }} = this
		let oFis = onlineFisSinif ? new onlineFisSinif({ tabletID, tarih, seri, noYil, fisNo, plasiyerKod, subeKod, mustKod }) : null
		if (!oFis)
			return null
		let _e = { ...e, oFis }
		let result = await this.onlineFisDuzenle(_e)
		if (result === false)
			return null
		oFis = _e.oFis
		if (!oFis)
			return null
		let {numarator: num} = oFis
		if (num) {
			let fis = this
			app.online()
			try {
				while (await oFis.varmi()) {
					await num.kesinlestir()
					oFis.fisNo = num.sonNo
				}
			}
			finally { app.resetOfflineStatus() }
			let seriDegisti = fis.seri != oFis.seri
			let noDegisti = fis.fisNo != oFis.fisNo
			if (seriDegisti || noDegisti) {
				let {id, class: { idSaha, seriSaha, fisNoSaha, table: from }} = fis
				let upd = new MQIliskiliUpdate({ from }), {where: wh, set} = upd
				wh.degerAta(id, idSaha)
				if (seriDegisti)
					set.degerAta(fis.seri = seri, 'seri')
				if (noDegisti)
					set.degerAta(fis.fisNo = fisNo, 'fisno')
				this.sqlExecNone(upd)    // async - no await
			}
		}
		return oFis
	}
	async onlineFisDuzenle(e) {
		let {oFis, oFis: { class: oFisSinif }} = e
		let fis = this, {detaylar} = this, {detaySinif: detSinif} = fis.class
		detSinif ??= MQDetay
		let oDetSinif = oFisSinif.detaySinifFor?.('') ?? oFisSinif.detaySinif ?? MQDetay
		for (let det of detaylar) {
			if (isPlainObject(det))
				det = new detSinif(det)
			let oDet = new oDetSinif(det)
			let rec = det.hostVars({ ...e, fis, onlineFisDuzenle: true })
			await oDet.setValues({ rec })
			oFis.addDetay(oDet)
		}
		await oFis.dipOlustur?.()
		await oFis.dipIslemci?.topluHesapla?.()
	}

	static yazdir({ inst }) {
		return inst?.yazdir(...arguments)
	}
	async yazdir(e) {
		let bedelX = 33
		/*let data = ({
			nakil: false, tekDetaySatirSayisi: 2,
			dipYok: false, dipX: bedelX - 20,
			sayfaBoyut: { x: 60, y: 58 },
			otoYBasiSonu: { x: 17, y: 52 },
			sabit: [
				{ text: '[!FUNC(e => (2 + 3))] [!FUNC( ({ inst: { fisNo } }) => `FIS: ${fisNo}` )]', x: 5, y: 1 },
				{ key: 'fisTipText', pos: { x: 5, y: 2 }, length: 19 },
				{ text: '[islemTarih] [islemZaman]', pos: { x: 40, y: 5 }, _comment: '(pos.X = 0) => text length ne ise aynen yazılır, kırpmadan' },
				{ key: 'islemZaman', pos: { x: 48, y: 6 }, _comment: '(pos.X = 0) => text length ne ise aynen yazılır, kırpmadan' },
				{ key: 'yildizlimiText', pos: { x: 1, y: 0 }, length: 5, _comment: '(Y = 0) ==> Cursor ın kaldığı Y pozisyonundan devam et' },
				{ key: 'tahsilatSekliText', pos: { x: 0, y: 0 }, _comment: '(X = 0) => Bu bilgi yazılmaz | (Y = 0) ==> Cursor ın kaldığı Y pozisyonundan devam et' },
				{ text: 'SAYIN [mustUnvan],', pos: { x: 1, y: 8 }, length: 55 },
				{ text: '[vergiDairesi] [vergiNo]', pos: { x: 5, y: 9 }, length: 40 },
				{ text: '** BİLGİ FİŞİ **', pos: { x: 5, y: -1 }, length: 50, ozelIsaret: true, iade: false, _comment: '(Y = -1) => Bittiği yer veya Sayfa Boyutu Y ye göre tersten relative satır no' }
			],
			detay: [
				{ key: 'barkod', pos: { x: 2, y: 1 }, length: 15 },
				{ key: 'stokAdi', pos: { x: 18, y: 1 }, length: 40 },
				{ key: 'miktar', pos: { x: 5, y: 2 }, length: 8, right: true },
				{ key: 'brm', pos: { x: 15, y: 2 }, length: 4, right: true },
				{ key: 'fiyat', pos: { x: 21, y: 2 }, length: 10, right: true },
				{ key: 'netBedel', pos: { x: bedelX, y: 2 }, length: 13, right: true }
			],
			oto: [
				{ key: 'tahsilText', x: 2 },
				{ key: 'miktarText', x: 2 },
				{ key: 'yalnizText', x: 5 },
				{ key: 'bakiyeText', _comment: 'gizli' },
				{ key: 'notlar', _comment: 'gizli' }
			]
		})*/
		let {tablet: { dokumEkrana } = {}} = app.params
		// let form = this.getDokumForm(e) ?? new TabDokumForm(data)
		let form = this.getDokumForm(e) ?? new TabDokumForm()
		if (isPlainObject(form))
			form = new TabDokumForm(form)
		let device = TabDokumDevice.newDefault(e)
		let yontem = TabDokumYontemi.newDefault()
		let dokumcu = new TabDokumcu()
			.setSource(form).setDevice(device)
			.setYontem(yontem)
		if (dokumEkrana)
			dokumcu.ekrana()
		// dokumcu.setPrefix('\nMUHTELİF MÜŞTERİLERE GÖNDERMEK ÜZERE\nSİPARİŞLER AŞAĞIDAKİ GİBİDİR:\n\n\n')
		let inst = this
		await dokumcu.yazdir({ inst })
	}
	getDokumForm(e) {
		let tip = this.getDokumFormTip(e)
		if (!tip)
			return null
		let {tablet: { dokumFormlar = {} } = {}} = app.params
		return dokumFormlar[tip]
	}
	getDokumFormTip(e) {
		let eIslemmi = !this.yildizlimi && this.eIslTip
		return this.class[`dokumFormTip_${eIslemmi ? 'eIslem' : 'normal'}`]
	}
	async dokumGetValue({ tip, key } = {}) {
		switch (key) {
			case 'fisTipText':
				return this.class.sinifAdi
			case 'eIslText': {
				let {efatKullanirmi} = app.params.tablet
				let {eIslTip: _} = this
				efatKullanirmi ??= true
				return (
					_ == 'E' ? 'e-Fatura' :
					_ == 'IR' ? 'e-İrsaliye' :
					_ ? (efatKullanirmi ? 'e-Arşiv' : '')
					: eIslTip
				)
			}
			case 'tarih': case 'islemTarih':
				return dateToString(asDate(this.tarih))
			case 'saat': case 'zaman': case 'islemZaman':
				return timeToString(this.sevkTS ?? now())
			case 'mustUnvan': case 'mustUnvan1': case 'mustUnvan2':
				return MQTabCari.getGloKod2Adi(this.mustKod)
			case 'vergiDairesi':
				return MQTabCari.getGloKod2Rec().then(d => d[this.mustKod]?.vdaire)
			case 'vergiNo':
				return MQTabCari.getGloKod2Rec().then(d => d[this.mustKod]?.vnumara)
			case 'tahsilText':
				return '...'
		}
		return null
	}

	static getRootFormBuilder(e) { return MQCogul.getRootFormBuilder(e) }
	static getRootFormBuilder_fis(e) { return null }
	static rootFormBuilderDuzenle_listeEkrani({ sender: gridPart, rootBuilder: rfb }) {
		super.rootFormBuilderDuzenle_listeEkrani(...arguments)
		rfb.addStyle(`$elementCSS .header > .islemTuslari > div #sil { margin-left: 50px }`)
	}
	static rootFormBuilderDuzenle_islemTuslari({ fbd_islemTuslari: fbd }) {
		super.rootFormBuilderDuzenle_islemTuslari(...arguments)
		fbd.addStyle(`$elementCSS > div #tamam { margin-left: 50px }`)
	}
	static tanimPart_islemTuslariDuzenle({ parentPart: tanimPart, part, liste }) {
		super.tanimPart_islemTuslariDuzenle(...arguments)
		let items = [
			{ id: 'menu', text: '...', handler: async _e => {
				_e = { ...e, ..._e }
				try {
					let args = await this.getTanimPartMenuArgs(_e)
					if (args) {
						let {inst, inst: parentRec} = tanimPart
						extend(_e, { inst, parentRec, ...args })
						MFListeOrtakPart.openContextMenu(_e)
					}
				}
				catch (ex) { cerr(ex); throw ex }
			}}
		]
		let set = part.ekSagButonIdSet ??= {}
		if (items.length) {
			liste.unshift(...items)
			extend(set, asSet(items.map(_ => _.id)))
		}
	}
	static async rootFormBuilderDuzenle_tablet(e) { }
	static async rootFormBuilderDuzenle_tablet_acc(e) {
		let { sender: tanimPart, inst, acc } = e
		let { mustKod, numarator: num, class: { mustZorunlumu } } = inst
		let getBuilder = e.getBuilder = layout =>
			this.rootFormBuilderDuzenle_tablet_getBuilder({ ...e, layout })
		await acc.deferRedraw(async () => {
			acc.add({
				id: 'dip', title: 'Sonuç',
				collapsedContent: async ({ item, layout }) => {
					let rfb = getBuilder(layout)
					await this.rootFormBuilderDuzenle_tablet_acc_dipCollapsed({ ...e, rfb, item, layout })
					rfb.run()
				},
				content: async ({ item, layout }) => {
					let rfb = getBuilder(layout)
					await this.rootFormBuilderDuzenle_tablet_acc_dip({ ...e, rfb, item, layout })
					if (!rfb.builders?.length)
						rfb.addStyle_fullWH(null, 1)
					setTimeout(() => rfb.run(), 100)
				}
			})
			acc.add({
				id: 'detay', title: 'Kalemler',
				collapsedContent: async ({ item, layout }) => {
					let rfb = getBuilder(layout)
					await this.rootFormBuilderDuzenle_tablet_acc_detayCollapsed({ ...e, rfb, item, layout })
					rfb.run()
				},
				content: async ({ item, layout }) => {
					let rfb = getBuilder(layout)
					await this.rootFormBuilderDuzenle_tablet_acc_detay({ ...e, rfb, item, layout })
					if (rfb.builders?.length)
						setTimeout(() => rfb.run(), 100)
				}
			})
			await this.rootFormBuilderDuzenle_tablet_acc_baslikOncesi(...arguments)
			acc.add({
				id: 'baslik', title: 'Belge', expanded: true,
				collapsedContent: async ({ item, layout }) => {
					let rfb = getBuilder(layout)
					await this.rootFormBuilderDuzenle_tablet_acc_baslikCollapsed({ ...e, rfb, item, layout })
					rfb.run()
				},
				content: async ({ item, layout }) => {
					let rfb = getBuilder(layout)
					// rfb.addStyle_fullWH(null, 350)
					{
						let form = rfb.addFormWithParent().yanYana()
						form.addDateInput('tarih', 'Tarih').etiketGosterim_yok()
							.degisince(_e => inst.tarihDegisti({ ...e, ..._e, tanimPart, value: _e.value }))
						form.addTextInput('seri', 'Seri').etiketGosterim_yok()
							.addCSS('center')
							.addStyle(`$elementCSS { max-width: 90px }`)
							.setMaxLength(3)
							.degisince(({ builder: { id, input, altInst } }) => {
								let oldValue = altInst[id]
								let value = oldValue?.toUpperCase()
								if (value != oldValue) {
									input.val(value)
									altInst[id] = value
								}
							})
						form.addNumberInput('fisNo', 'No', undefined, num?.sonNo).etiketGosterim_yok()
							.addStyle(`$elementCSS { max-width: 200px }`)
							.setMin(0).setMax(999999999).setMaxLength(9)
							.degisince(({ value }) => inst.fisNo = value || null)
					}
					await this.rootFormBuilderDuzenle_tablet_acc_baslik({ ...e, rfb, item, layout })
					{
						let form = rfb.addFormWithParent().yanYana()
						rfb.addTextInput('aciklama', 'Açıklama').etiketGosterim_yok()
							//.addStyle(`$elementCSS { max-width: 800px }`)
					}
					if (rfb.builders?.length)
						setTimeout(() => rfb.run(), 100)
				}
			})
		})
		if (!mustZorunlumu || mustKod)
			acc.expand('detay')

		acc.onExpand(_e => setTimeout(e =>
			this.rootFormBuilderDuzenle_tablet_acc_onExpand(e), 1, { ...e, ..._e }))
		acc.onCollapse(_e => setTimeout(e =>
			this.rootFormBuilderDuzenle_tablet_acc_onCollapse(e), 1, { ...e, ..._e }))
	}
	static async rootFormBuilderDuzenle_tablet_acc_baslikOncesi({ sender: tanimPart, inst: fis, rfb }) { }
	static async rootFormBuilderDuzenle_tablet_acc_baslikCollapsed({ sender: tanimPart, inst: fis, rfb }) {
		let {mustKod, eIslTip} = fis
		if (mustKod) {
			/*let {adiSaha} = MQTabCari
			let {[mustKod]: { [adiSaha]: aciklama } = {}} = await MQTabCari.getGloKod2Rec() ?? {}
			aciklama ||= mustKod*/
			let aciklama = (await MQTabCari.getGloKod2Adi(mustKod)) || mustKod
			rfb
				.addCSS('flex-row')
				.addStyle(
					`$elementCSS > div { width: max-content !important }
					 $elementCSS > div:not(:first-child) { margin-left: 20px }`
				)
			rfb.addForm().setLayout(() => $([
				`<div class="flex-row" style="gap: 10px">`,
					// `<div class="orangered"><b>${dateKisaString(asDate(tarih))}</b></div>`,
					`<div class="royalblue"><b>${aciklama}</b></div>`,
				`</div>`
			].join(CrLf)))
		}
		if (eIslTip) {
			rfb.addForm().setLayout(() => $([
				`<div class="flex-row" style="gap: 5px">`,
					`<div class="bold red">e-İşlem</div>`,
				`</div>`
			].join(CrLf)))
		}
	}
	static rootFormBuilderDuzenle_tablet_acc_baslik({ sender: tanimPart, inst: fis, rfb, acc }) {
		let e = arguments[0]
		let {loginTipi} = config.session ?? {}
		if (!(loginTipi == 'plasiyerLogin' || loginTipi == 'musteriLogin')) {
			let mfSinif = MQTabPlasiyer, {sinifAdi: etiket} = mfSinif
			let form = rfb.addFormWithParent().altAlta()
			form.addSimpleComboBox('plasiyerKod', etiket, etiket)
				.etiketGosterim_yok()
				//.addStyle(`$elementCSS { max-width: 800px }`)
				.kodsuz().setMFSinif(mfSinif)
				.degisince(({ type, events, ...rest }) => {
					if (type != 'batch')
						return
					// henuz plasiyerKod atanmadı
					let _e = { type, events, ...rest, oldValue: fis.plasiyerKod, value: events.at(-1).value?.trimEnd() }
					setTimeout(() => fis.plasiyerDegisti({ ...e, ..._e, tanimPart }), 5)
				})
		}
		{
			let mfSinif = MQTabCari, {sinifAdi: etiket} = mfSinif
			let form = rfb.addFormWithParent().altAlta()
			// addSimpleComboBox(e, _etiket, _placeholder, _value, _source, _autoClear, _delay, _minLength, _disabled, _name, _userData)
			form.addSimpleComboBox('mustKod', etiket, etiket)
				.etiketGosterim_yok()
				//.addStyle(`$elementCSS { max-width: 800px }`)
				.kodsuz().setMFSinif(mfSinif)
				.degisince(({ type, events, ...rest }) => {
					if (type != 'batch')
						return
					// henuz mustKod atanmadı
					let _e = { type, events, ...rest, oldValue: fis.mustKod, value: events.at(-1).value?.trimEnd() }
					setTimeout(() => {
						fis.mustDegisti({ ...e, ..._e, tanimPart })
						acc?.render()
					}, 5)
				})
				.onAfterRun(({ builder: { part } }) =>
					setTimeout(() => part.focus(), 1))
			/*form.addModelKullan('mustKod', MQTabCari.sinifAdi)
				.addStyle(`$elementCSS { max-width: 800px }`)
				.comboBox().autoBind()
				.setMFSinif(MQTabCari)
				.onAfterRun(({ builder: { part } }) =>
					setTimeout(() => part.focus(), 1))*/
		}
	}
	static rootFormBuilderDuzenle_tablet_acc_dipCollapsed({ rfb }) { }
	static rootFormBuilderDuzenle_tablet_acc_dip({ rfb }) { }
	static rootFormBuilderDuzenle_tablet_acc_detayCollapsed({ rfb }) { }
	static rootFormBuilderDuzenle_tablet_acc_detay({ rfb }) { }
	static rootFormBuilderDuzenle_tablet_acc_onExpand({ sender: { parentPart: tanimPart }, acc: { activePanel } }) {
		/*let {id} = activePanel ?? {}
		let {islemTuslari} = tanimPart
		islemTuslari[id == 'duzenle' ? 'addClass' : 'removeClass']('jqx-hidden')*/
	}
	static rootFormBuilderDuzenle_tablet_acc_onCollapse(e) { }

	static rootFormBuilderDuzenle_tablet_getBuilder({ sender: tanimPart, inst, acc, layout }) {
		return new RootFormBuilder()
			.setLayout(layout).setPart(tanimPart)
			.setInst(inst)
	}
	static getHTML({ rec }) {
		let {fisTipi, tarih, seri, noyil, fisno, must, mustunvan, eisltip} = rec
		let fisSinif = TabFisListe.fisSinifFor(fisTipi)
		// let {kod2Rec: kod2Must} = MQTabCari.globals
		let tsnText = [
			seri || '',
			noyil ? noyil.toString().padStart(4, '0') : '',
			fisno?.toString() || '0'
		].filter(_ => _).join(' ')
		return [
			`<div class="flex-row" style="gap: 0 10px">`,
				`<template class="sort-data">${dateToString(tarih) ?? ''}|${seri}|${noyil}|${fisno}|${mustunvan}</template>`,
				`<div class="ek-bilgi bold float-right">${dateKisaString(asDate(tarih)) ?? ''}</div>`,
				`<div class="asil">${tsnText}</div>`,
				`<div class="asil orangered">${mustunvan || ''}</div>`,
				(eisltip ? `<div class="ek-bilgi bold red">e-İşl.</div>` : null),
				`<div class="ek-bilgi bold float-right">${must || ''}</div>`,
				(fisSinif ? `<div class="ek-bilgi float-right">${fisSinif.sinifAdi || ''}</div>` : null),
			`</div>`
		].filter(_ => _).join(CrLf)
	}

	shallowCopy(e) {
		let result = super.shallowCopy(e)
		let {_dipIslemci} = result
		if (_dipIslemci) {
			_dipIslemci = result._dipIslemci = _dipIslemci.shallowCopy()
			_dipIslemci.fis = result
		}
		return result
	}
	deepCopy(e) {
		let result = super.deepCopy(e)
		let {_dipIslemci} = result
		if (_dipIslemci)
			_dipIslemci.fis = result
		return result
	}
}
