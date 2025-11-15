class DPanelTanim extends MQDetayliGUIDVeAdi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar, 'panel', 'rapor', 'inst', 'part'] }
	static get kodListeTipi() { return 'DPANEL' } static get sinifAdi() { return 'Panel Rapor' }
	static get table() { return 'wpanelrapor' } static get tableAlias() { return 'pnl' }
	static get detaySinif() { return DPanelDetay } static get gridKontrolcuSinif() { return DPanelGridci }
	static get tanimlanabilirmi() { return false } static get degistirilebilirmi() { return false }
	static get tanimUISinif() { return ModelTanimPart }
	static get kolonFiltreKullanilirmi() { return false }
	static get emptyAciklama() { return '_Boş Dizayn' } static get defaultAciklama() { return '_Güncel Dizayn' }
	static get localData() {
		let {_localData: result} = this
		if (result == null) {
			result = this._localData = new MQLocalData('panelTanim')
			result._promise = result.yukle()
		}
		return result
	}
	constructor({ id, rapor, ortakmi, userkod, encuser } = {}) {
		super(...arguments)
		let {user, encUser} = config.session
		this.rapor = rapor = rapor?.main ?? rapor
		$.extend(this, {
			ortakmi: ortakmi ?? true,
			user: userkod ?? user,
			encUser: encuser ?? encUser
		})
		if (id !== undefined)
			$.extend(this, { id })
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			user: new PInstStr(),
			encUser: new PInstStr()
		})
	}
	static async getDefault(e) {
		let inst = new this(e)
		return await inst.getDefault(e) ? inst : null
	}
	async getDefault(e) {
		let {class: cls, class: { localData: d }} = this; await d?._promise
		let aciklama = '', {id} = await d?.get('_current') ?? {}
		$.extend(this, { id, aciklama })
		if (id)
			await this.yukle(e)
		await cls.createEmptyIfNot(e)
		return this                                                       /* yükleyemezsen de mevcut olanı dön */
	}
	async setDefault(e) {
		let {class: cls, class: { localData: d }} = this; await d?._promise
		let cur = await d?.get('_current') ?? {}
		let id = this.id = cur.id || newGUID()
		this.user = this.encUser = ''
		if (!this.aciklama)
			this.setAciklamaDefault()
		let {aciklama} = this
		$.extend(cur, { id, aciklama })
		await d?.set('_current', cur); d?.kaydetDefer()
		await this.kaydet(e)
		return this
	}
	static async createEmptyIfNot(e) {
		let inst = new this().setAciklamaEmpty()
		if (await inst.varmi())
			return inst
		let {localData: d} = this; await d?._promise
		let {id, aciklama} = inst
		await d?.set('_empty', { id, aciklama })
		d?.kaydetDefer()
		inst.yaz(e)
		return inst
	}
	static getOzelSahaYapilari() { return null }
	static islemTuslariDuzenle_listeEkrani({ liste, part: butonlarPart, part: { ekSagButonIdSet, sagIdSet }, sender: gridPart }) {
		let e = arguments[0]
		liste.push(
			{ id: 'import', handler: _e => this.importIstendi({ ...e, ..._e })},
			{ id: 'export', handler: _e => this.exportIstendi({ ...e, ..._e })}
		)
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(new GridKolon('userKod', 'Kullanıcı', 10).noSql())
	}
	static loadServerData_queryDuzenle({ sent, sent: { where: wh, sahalar } }) {
		super.loadServerData_queryDuzenle(...arguments)
		let {isAdmin, encUser} = config.session, {tableAlias: alias} = this
		if (!isAdmin && encUser) {
			wh.add(new MQOrClause([
				`${alias}.xuserkod = ''`,
				{ degerAta: encUser, saha: `${alias}.xuserkod` }
			]))
		}
		sahalar.addWithAlias(alias, 'xuserkod')
	}
	static async loadServerDataDogrudan(e) {
		let recs = await super.loadServerDataDogrudan(e)
		if (!recs)
			return recs
		let enc2Dec = {}
		let encKodSet = asSet(recs.filter(rec => !rec.userKod && rec.xuserkod)
									  .map(rec => rec.xuserkod))
		if (!empty(encKodSet)) {
			enc2Dec = await app.xdec(keys(encKodSet))
			if (typeof enc2Dec != 'object')
				enc2Dec = { [keys(encKodSet)[0]]: enc2Dec }
		}
		for (let rec of recs) {
			let {userKod, xuserkod} = rec
			if (!userKod)
				userKod = rec.userKod = enc2Dec[xuserkod] ?? xuserkod
		}
		return recs
	}
	static yeniInstOlustur({ args: { rapor } = {} } = {}) {
		let inst = super.yeniInstOlustur(...arguments)
		if (inst && rapor)
			inst.rapor = rapor
		return inst
	}
	async kaydetOncesiIslemler() {
		await super.kaydetOncesiIslemler(...arguments)
		let {detaylar, class: { detayTable }} = this
		{
			let maxLen = detaylar?.length ? Math.max(...detaylar.map(det => det?.baslik?.length ?? 0)) : 0
			if (maxLen) {
				let newLen = maxLen > 2000 ? 'MAX' : maxLen
				let colName = 'baslik', query = [
					`IF COL_LENGTH('${detayTable}', '${colName}') BETWEEN 0 AND ${maxLen - 1}`,
					`    ALTER TABLE ${detayTable} ALTER COLUMN ${colName} VARCHAR(${newLen}) NOT NULL`
				].join(CrLf)
				await this.sqlExecNone(query)
			}
		}
		{
			let maxLen = detaylar?.length ? Math.max(...detaylar.map(det => det?.value?.length ?? 0)) : 0
			if (maxLen) {
				let newLen = maxLen > 2000 ? 'MAX' : maxLen
				let colName = 'value', query = [
					`IF COL_LENGTH('${detayTable}', '${colName}') BETWEEN 0 AND ${maxLen - 1}`,
					`    ALTER TABLE ${detayTable} ALTER COLUMN ${colName} VARCHAR(${newLen}) NOT NULL`
				].join(CrLf)
				await this.sqlExecNone(query)
			}
		}
	}
	async yukleSonrasiIslemler() {
		await super.yukleSonrasiIslemler(...arguments); let {encUser} = this
		this.user = encUser ? await app.xdec(encUser) : encUser
	}
	alternateKeyHostVarsDuzenle({ hv }) {
		super.alternateKeyHostVarsDuzenle(...arguments);
		let {ortakmi, encUser: xuserkod, raporKod, aciklama, class: { adiSaha }} = this
		if (ortakmi)
			xuserkod = ''
		$.extend(hv, { xuserkod, [adiSaha]: aciklama })
	}
	keySetValues({ rec }) {
		super.keySetValues(...arguments)
		let {class: { adiSaha }} = this
		$.extend(this, { aciklama: rec[adiSaha] })
	}
	setValues({ rec }) {
		super.setValues(...arguments); let {userkod: user = ''} = rec
		$.extend(this, { user })
	}
	static async importIstendi({ sender: gridPart }) {
		try {
			let {data: recs} = await openFile({ coklu: false, capture: false, type: wsDataType, accept: wsContentType })
			recs ??= []
			let count = 0, {length: total} = recs
			showProgress(`<b>${total}</b> kayıt içeri alınıyor...`, null, true)
			progressManager?.setProgressMax((count * 2) + 10)?.progressReset()
			for (let rec of recs) {
				if (rec)
					delete rec.xuserkod
				if (empty(rec))
					continue
				let inst = new this(rec)
				if (await inst.varmi())
					await inst.sil()
				progressManager?.progressStep()
				await inst.yaz(); count++
				progressManager?.progressStep()
			}
			progressManager?.progressEnd()
			setTimeout(() => hideProgress(), 1000)
			if (count) {
				gridPart.tazele()
				eConfirm(`<b>${count}</b> tanım içeri alındı`, 'İçeri Al')
			}
			else
				hConfirm('Dosyada yüklenebilecek veri bulunamadı', 'İçeri Al')
		}
		catch (ex) {
			hideProgress()
			hConfirm(getErrorText(ex), 'İçeri Alma Sorunu')
			throw ex
		}
	}
	static async exportIstendi({ sender: gridPart, sender: { selectedRecs: recs } }) {
		if (empty(recs)) {
			hConfirm('Dışarı aktarılacak tanımlar seçilmelidir', 'Dışa Aktar')
			return
		}
		let {length: total} = recs
		showProgress(`<b>${total}</b> kayıt dışa aktarılıyor...`, null, true)
		try {
			progressManager?.setProgressMax(total + 10)?.progressReset()
			let data = []
			for (let {id} of recs) {
				let inst = new this({ id })
				if (!await inst.yukle())
					continue
				let rec = { id, ...inst.asExportData }
				data.push(rec)
				progressManager?.progressStep()
			}
			data = toJSONStr(data) + CrLf
			await downloadData(data, 'export.json', wsContentType)
			progressManager?.progressEnd()
			setTimeout(() => hideProgress(), 1000)
		}
		catch (ex) {
			hideProgress()
			hConfirm(getErrorText(ex), 'Dışa Aktar')
			throw ex
		}
	}
	static ozelRaporAdimi(value) {
		let {emptyAciklama: empty, defaultAciklama: def} =  this
		return [empty, def].some(_ => _ == value)
	}
	setId(value) { this.id = value; return this }
	noId() { return this.setId(null) } resetId() { return this.setId(undefined) }
	setAciklama(value) { this.aciklama = value; return this }
	setAciklamaEmpty() { return this.setAciklama(this.class.emptyAciklama) }
	setAciklamaDefault() { return this.setAciklama(this.class.defaultAciklama) }
}
class DPanelTanim_Local extends DPanelTanim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static async loadServerDataDogrudan() {
		let {localData: d} = this; await d._promise
		let recs = Array.from(await d.values())
		return recs
	}
	async baslikYukle(e) {
		let {id, class: { localData: d, kodSaha }, rec} = this; await d._promise
		if (!id) {
			rec = (await this.class.loadServerData(e))?.[0]
			id = this.id = rec?.[kodSaha]
		}
		rec ??= await d.get(id);
		if (!rec) { return false }
		if (!await d.has(id)) { await d.set(id, rec); d.kaydetDefer() }
		this.setValues({ rec })
		return true
	}
	async detaylariYukle(e) {
		let {id, class: { localData: d, detaySinif }} = this; await d._promise
		let basRec = await d.get(id) ?? {}, {detaylar: detRecs = []} = basRec
		for (let rec of detRecs) {
			let det = new detaySinif()
			det.setValues({ rec })
			this.addDetay(det)
		}
		return true
	}
	async tekilOku(e) {
		let {id, class: { localData: d }} = this; await d._promise
		let rec = await d.get(id)
		return rec
	}
	async kayitSayisi(e) { return await this.tekilOku(e) ? 1 : 0 }
	async yaz(e) {
		let {id, detaylar, class: { localData: d }} = this; await d._promise
		id ??= this.id = newGUID()
		{
			let rec = await d.get(id)
			if (rec) { throw { isError: true, rc: 'duplicateRecord', errorText: 'Kayıt tekrarlanıyor' } }
		}
		{
			await this.kaydetOncesiIslemler(e)
			let _e = { fis: this }, rec = {
				...this.hostVars(),
				detaylar: detaylar.map(det => det.hostVars(_e))
			}
			await d.set(id, rec); d.kaydetDefer()
			this.kaydetSonrasiIslemler(e)
		}
	}
	async degistir(e) {
		let {id, detaylar, class: { localData: d }} = this; await d._promise
		{
			let rec = await d.get(id)
			if (!rec) { throw { isError: true, rc: 'noRecord', errorText: 'Kayıt bulunamadı' } }
		}
		{
			await this.kaydetOncesiIslemler(e)
			let _e = { fis: this }, rec = {
				...this.hostVars(),
				detaylar: detaylar.map(det => det.hostVars(_e))
			}
			await d.set(id, rec); d.kaydetDefer()
			this.kaydetSonrasiIslemler(e)
		}
	}
	async sil(e) {
		let {id, detaylar, class: { localData: d }} = this; await d._promise
		{
			let rec = await d.get(id)
			if (!rec) { throw { isError: true, rc: 'noRecord', errorText: 'Kayıt bulunamadı' } }
		}
		{
			await this.silmeOncesiIslemler(e)
			await d.delete(id); d.kaydetDefer()
			this.silmeSonrasiIslemler(e)
		}
	}
	yukleOncesiIslemler(e) { } yukleSonrasiIslemler(e) { }
	kaydetOncesiIslemler(e) {
		this.detaylariNumaralandir(e)
		return super.kaydetOncesiIslemler(e)
	}
	kaydetSonrasiIslemler(e) { } silmeOncesiIslemler(e) { } silmeSonrasiIslemler(e) { }
	static logKaydet() { } logKaydet() { }
}

class DPanelDetay extends MQDetayGUID {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar, 'panel', 'rapor', 'inst', 'part'] }
	static get table() { return 'wpaneldetay' } static get adiSaha() { return 'value' }
	get id() { return this.sayac } set id(value) { this.sayac = value }
	get aciklama() { return this.value } set aciklama(value) { this.value = value }
	get raporId() { return this._raporId }
	set raporId(value) {
		this._raporId = value
		this.rapor_id = value
	}
	get raporTanim() { return this.inst?.main?.raporTanim }
	set raporTanim(value) {
		let {main} = this.inst ?? {}
		if (main)
			main.raporTanim = value
	}
	get rapor_id() { return this.raporTanim?.id }
	set rapor_id(value) {
		let {raporTanim} = this
		if (raporTanim)
			raporTanim.id = value
	}
	get rapor_adi() { return this.raporTanim?.aciklama }
	set rapor_adi(value) {
		let {raporTanim} = this
		if (raporTanim)
			raporTanim.aciklama = value
	}

	constructor(e = {}) {
		super(e); let {raporId = e._raporId, inst} = e
		if (inst)
			this.inst = inst
		if (raporId)
			this.raporId = raporId
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments); let {adiSaha} = this
		$.extend(pTanim, {
			tip: new PInstTekSecim('tip', DPanelTip), raporTip: new PInstTekSecim('raportip', DAltRaporTip),
			baslik: new PInstStr('baslik'), value: new PInstStr(adiSaha),
			raporAdi: new PInstStr('raporadi'),
			width: new PInstStr('width'), height: new PInstStr('height')
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let {tableAlias: alias, idSaha, adiSaha} = this
		liste.push(...[
			new GridKolon({ belirtec: idSaha, text: 'ID', genislikCh: 45 }),
			new GridKolon({ belirtec: 'tiptext', text: 'Panel Tipi', genislikCh: 20 }).noSql(),
			new GridKolon({ belirtec: adiSaha, text: 'Belirteç / Değer', genislikCh: 50 }),
			new GridKolon({ belirtec: 'raporadi', text: 'Rapor Adı', genislikCh: 40 }),
			new GridKolon({ belirtec: 'baslik', text: 'Başlık', genislikCh: 50 }),
			new GridKolon({ belirtec: 'raportiptext', text: 'Rapor Tipi', genislikCh: 13 }).noSql(),
			new GridKolon({ belirtec: 'width', text: 'Genişlik', genislikCh: 13 }).tipDecimal(),
			new GridKolon({ belirtec: 'height', text: 'Yükseklik', genislikCh: 13 }).tipDecimal()
		])
	}
	static loadServerData_queryDuzenle({ sent: { sahalar } }) {
		super.loadServerData_queryDuzenle(...arguments)
		let {tableAlias: alias} = this
		sahalar.addWithAlias(alias, 'tip', 'raportip')
	}
	static orjBaslikListesi_recsDuzenle({ recs }) {
		super.orjBaslikListesi_recsDuzenle(...arguments)
		let {kaDict: panelTipDict} = DPanelTip, {kaDict: altTipDict} = DAltRaporTip
		for (let rec of recs) {
			let {tip: panelTip, raportip: altTip} = rec
			rec.tiptext = panelTipDict[panelTip] ?? panelTip
			rec.raportiptext = altTipDict[altTip] ?? altTip
		}
	}
	kaydetOncesiIslemler(e) {
		let {rapor_id: raporId, rapor_adi: raporAdi} = this
		$.extend(this, { raporId, raporAdi })
		return super.kaydetOncesiIslemler(e)
	}
	setTip(value) { this.tip = value; return this }
	setBaslik(value) { this.baslik = value; return this } setTitle(value) { return this.setBaslik(value) }
	setInst(value) { this.inst = value; return this }
	setValue(value) { this.value = value; return this }
	setRaporId(value) { this._raporId = value; return this }
	setRaporAdi(value) { this.raporAdi = value; return this }
	setRaporTip(value) { this.raporTip = value; return this }
	tipRapor() { return this.setTip('') } tipWeb() { return this.setTip('WB') } tipEval() { return this.setTip('JS') }
	raporMain() { return this.setRaporTip('') } raporChart() { return this.setRaporTip('CH') } raporOzet() { return this.setRaporTip('OZ') }
	setWidth(value) { this.width = value; return this } setHeight(value) { this.height = value; return this }
	setWH(w, h) {
		if (w !== undefined) { this.setWidth(w) }
		if (h !== undefined) { this.setHeight(h) }
		return this
	}
}
class DPanelGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_ara({ liste }) {
		super.tabloKolonlariDuzenle_ara(...arguments)
	}
}

