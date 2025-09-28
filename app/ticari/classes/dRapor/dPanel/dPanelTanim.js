class DPanelTanim extends MQDetayliGUIDVeAdi {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get detaySinif() { return DPanelDetay }
	static get table() { return 'wpanelrapor' } static get tableAlias() { return 'pnl' }
	static get kodListeTipi() { return 'DPANEL' } static get sinifAdi() { return 'Panel Rapor' }
	static get localData() {
		let {_localData: result} = this
		if (result == null) {
			result = this._localData = new MQLocalData('panelTanim')
			result._promise = result.yukle()
		}
		return result
	}
	constructor({ rapor, userkod, encuser } = {}) {
		super(...arguments); let {user, encUser} = config.session
		this.rapor = rapor = rapor?.main ?? rapor
		$.extend(this, { user: userkod ?? user, encUser: encuser ?? encUser })
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, { user: new PInstStr(), encUser: new PInstStr() })
	}
	static async getDefault(e) {
		let inst = new this(e)
		return await inst.getDefault(e) ? inst : null
	}
	async getDefault(e) {
		let {class: { localData: d }} = this; await d._promise
		let {id} = await d.get('_current') ?? {}, aciklama = ''
		$.extend(this, { id, aciklama })
		if (id) { await this.yukle(e) }
		return this    /* yükleyemezsen de mevcut olanı dön */
	}
	async setDefault(e) {
		let {class: { localData: d }} = this; await d._promise
		let cur = await d.get('_current') ?? {}
		let id = this.id = cur.id || newGUID()
		let aciklama = this.aciklama ||= '_Varsayılan'
		$.extend(cur, { id, aciklama })
		await d.set('_current', cur)
		d.kaydetDefer(); this.kaydet(e)
	}
	static getOzelSahaYapilari() { return null }
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(new GridKolon({ belirtec: 'xuserkod', text: 'Kullanıcı', genislikCh: 10 }))
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
	static yeniInstOlustur({ args: { rapor } = {} } = {}) {
		let inst = super.yeniInstOlustur(...arguments)
		if (inst && rapor) { inst.rapor = rapor }
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
					`IF COL_LENGTH('${detayTable}', '${colName}') < ${newLen == 'MAX' ? 0 : newLen}`,
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
					`IF COL_LENGTH('${detayTable}', '${colName}') < ${newLen == 'MAX' ? 0 : newLen}`,
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
		let {encUser, raporKod, aciklama, class: { adiSaha }} = this;
		$.extend(hv, { xuserkod: encUser, [adiSaha]: aciklama })
	}
	keySetValues({ rec }) {
		super.keySetValues(...arguments); let {class: { adiSaha }} = this
		$.extend(this, { aciklama: rec[adiSaha] })
	}
	setValues({ rec }) {
		super.setValues(...arguments); let {xuserkod: encUser = ''} = rec
		$.extend(this, { encUser })
	}
	setId(value) { this.id = value; return this }
	noId() { return this.setId(null) } resetId() { return this.setId(undefined) }
	setAciklama(value) { this.aciklama = value; return this }
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
	static get table() { return 'wpaneldetay' } static get adiSaha() { return 'value' }
	get id() { return this.sayac } set id(value) { this.sayac = value }
	get aciklama() { return this.value } set aciklama(value) { this.value = value }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments); let {adiSaha} = this
		$.extend(pTanim, {
			tip: new PInstTekSecim('tip', DPanelTip), raporTip: new PInstTekSecim('raportip', DAltRaporTip),
			baslik: new PInstStr('baslik'), value: new PInstStr(adiSaha),
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
			new GridKolon({ belirtec: 'baslik', text: 'Başlık', genislikCh: 50 }),
			new GridKolon({ belirtec: 'raportiptext', text: 'Rapor Tipi', genislikCh: 13 }).noSql(),
			new GridKolon({ belirtec: 'width', text: 'Genişlik', genislikCh: 13 }).tipDecimal(),
			new GridKolon({ belirtec: 'height', text: 'Yükseklik', genislikCh: 13 }).tipDecimal()
		])
	}
	static loadServerData_queryDuzenle({ sent: { sahalar } }) {
		super.loadServerData_queryDuzenle(...arguments); let {tableAlias: alias} = this
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
	setTip(value) { this.tip = value; return this }
	setBaslik(value) { this.baslik = value; return this } setTitle(value) { return this.setBaslik(value) }
	setValue(value) { this.value = value; return this }
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
