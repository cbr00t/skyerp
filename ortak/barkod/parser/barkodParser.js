class BarkodParser extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get aciklama() { return '' } 
	static get cache() { return this._cache ??= {} }
	static set cache(value) { this._cache ??= value }

	constructor(e = {}) {
		super(e)
			this.setGlobals(e)
	}
	static getKuralSinif(e) { return BarkodKurali }
	async parse(e) {
		let result = await this.parseDevam(e)
		return result ? await this.parseSonrasi(e) : result
	}
	parseDevam(e) {
		this.setGlobals(e)
		return false
	}
	parseSonrasi(e) {
		let {carpan} = this
		if (carpan && carpan != 1)
			this.miktar = (this.miktar || 1) * carpan
		return true
	}
	setGlobals(e = {}) {
		let barkod = e.barkod || this.barkod || this.okunanBarkod
		if (barkod) {
			let carpan = e.carpan || 1, okunanBarkod = barkod
			$.extend(this, { okunanBarkod, barkod, carpan })
		}
	}
	async shEkBilgileriBelirle(e = {}) {
		let shKod = this.shKod = e.shKod || this.shKod
		if (!shKod)
			return false
		let {basit = e.basitmi} = e
		if (basit)
			return true
		let brmFiyatSaha = 'satfiyat1'
		let sent = new MQSent({
			from: 'stkmst stk', where: [
				new MQOrClause([
					{ degerAta: shKod, saha: 'stk.tartireferans' },
					{ degerAta: shKod, saha: 'stk.kod' }
					/*{ degerAta: '0'   + shKod, saha: `stk.kod`},
					{ degerAta: '00'   + shKod, saha: `stk.kod` },
					{ degerAta: '000'  + shKod, saha: `stk.kod` },
					{ degerAta: '0000' + shKod, saha: `stk.kod` }*/
				])
			],
			sahalar: [
				'stk.kod shKod', 'stk.aciklama shAdi', 'stk.brm',
				`stk.${brmFiyatSaha} fiyat`
			]
		})
		let stm = new MQStm({ sent })
		let {classKey, cache} = this.class
		let anah = toJSONStr({ classKey, basit, shKod })
		let rec = cache[anah]
		if (rec === undefined)
			rec = cache[anah] = (await MQCogul.sqlExecTekil(stm)) ?? null
		e.shRec = { ...rec }
		if (!rec)
			return false
		for (let [k, v] of entries(rec)) {
			if (v != null)
				this[k] = v
		}
		return true
	}
	static globalleriSil(e) {
		delete this._cache
		return this
	}
}
