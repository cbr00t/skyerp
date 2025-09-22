class DPanelTanim extends MQDetayliGUIDVeAdi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get localData() {
		let {_localData: result} = this
		if (result == null) {
			result = this._localData = new MQLocalData('panelTanim')
			result._promise = result.yukle()
		}
		return result
	}
	static get tableAlias() { return 'pnl' }
	static get kodListeTipi() { return 'DPANEL' } static get sinifAdi() { return 'Panel Rapor' }
	static get detaySinif() { return DPanelDetay }
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
	yukleOncesiIslemler(e) { }
	yukleSonrasiIslemler(e) { }
	kaydetOncesiIslemler(e) {
		this.detaylariNumaralandir(e)
		return super.kaydetOncesiIslemler(e)
	}
	kaydetSonrasiIslemler(e) { }
	silmeOncesiIslemler(e) { }
	silmeSonrasiIslemler(e) { }
	static logKaydet() { } logKaydet() { } static getOzelSahaYapilari() { return null }
	setId(value) { this.id = value; return this }
	setAciklama(value) { this.aciklama = value; return this }
}
class DPanelDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodSaha() { return 'id' } static get adiSaha() { return 'value' }
	get kod() { return this.id } set kod(value) { this.id = value }
	get aciklama() { return this.value } set aciklama(value) { this.value = value }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments); let {kodSaha, adiSaha} = this
		$.extend(pTanim, {
			id: new PInstGuid({ rowAttr: kodSaha, init: () => newGUID() }), tip: new PInstTekSecim(DPanelTip),
			value: new PInstStr(adiSaha), raporTip: new PInstTekSecim('raportip', DAltRaporTip),
			width: new PInstStr('width'), height: new PInstStr('height')
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); let {tableAlias: alias} = this
		liste.push(...[
			new GridKolon({ belirtec: 'id', text: 'ID', genislikCh: 45 }),
			new GridKolon({ belirtec: 'tiptext', text: 'Panel Tipi', genislikCh: 20 }).noSql(),
			new GridKolon({ belirtec: 'value', text: 'Belirteç / Değer', genislikCh: 50 }),
			new GridKolon({ belirtec: 'raportiptext', text: 'Rapor Tipi', genislikCh: 13 }).noSql(),
			new GridKolon({ belirtec: 'width', text: 'Genişlik', genislikCh: 13 }).tipDecimal(),
			new GridKolon({ belirtec: 'height', text: 'Yükseklik', genislikCh: 13 }).tipDecimal()
		])
	}
	static orjBaslikListesi_recsDuzenle({ recs }) {
		super.orjBaslikListesi_recsDuzenle(...arguments)
		let {kaDict: panelTipDict} = DPanelTip, {kaDict: altTipDict} = DAltRaporTip
		for (let rec of recs) {
			let {tip: panelTip, raportip: altTip} = rec;
			rec.tiptext = panelTipDict[panelTip] ?? panelTip
			rec.raportiptext = altTipDict[altTip] ?? altTip
		}
	}
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments)
		let {tableAlias: alias} = this, {sahalar} = sent
		sahalar.addWithAlias(alias, 'tip', 'raportip')
	}
	setId(value) { this.id = value; return this }
	setTip(value) { this.tip = value; return this }
	setValue(value) { this.value = value; return this }
	setRaporTip(value) { this.raporTip = value; return this }
	tipRapor() { return this.setTip('') } tipWEB() { return this.setTip('WB') } tipEval() { return this.setTip('JS') }
	raporMain() { return this.setRaporTip('') } raporChart() { return this.setRaporTip('CH') } raporOzet() { return this.setRaporTip('OZ') }
	setWidth(value) { this.width = value; return this } setHeight(value) { this.height = value; return this }
	setWH(w, h) {
		if (w !== undefined) { this.setWidth(w) }
		if (h !== undefined) { this.setHeight(h) }
		return this
	}
}

class DPanelTip extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Panel Tip' } static get defaultChar() { return ' ' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments)
		kaListe.push(
			new CKodVeAdi([' ', 'Rapor', 'rapormu']),
			new CKodVeAdi(['WB', 'Web Adresi', 'webmi']),
			new CKodVeAdi(['JS', 'JavaScript Kodu', 'evalmi'])
		)
	}
}
