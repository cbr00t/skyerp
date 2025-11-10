class BarkodParser_Kuralli extends BarkodParser {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get formatTipi() { return this.kural?.formattipi } get formatBaslangicmi() { return !this.formatTipi } get formatAyiraclimi() { return this.formatTipi == 'A' }
	constructor(e) { e = e || {}; super(e); this.kural = e.kural }
	static kuralFor(e) {
		e = e || {}; let basKod = e.basKod || e.kod, barkod = e.barkod; if (!barkod) return null;
		if (!(this.baslangicKod2Kural && this.ayrisimKurallari)) this.barkodKurallariBelirle()
		let kural = (this.baslangicKod2Kural || {})[basKod]; if (kural) return kural
		let ayrisimKurallari = this.ayrisimKurallari || [];
		for (let kural of ayrisimKurallari) {
			let formatTipi = kural.formattipi, ayiracStr = kural.ayiracstr;
			if (formatTipi && ayiracStr) {
				let kuralAyiracSayi = asInteger(kural.ayiracsayi), barkodAyiracSayi = barkod.split(ayiracStr).length - 1 || 0;
				if (kuralAyiracSayi == barkodAyiracSayi) return kural
			}
		}
		return null
	}
	static barkodKurallariBelirle(e = {}) {
		let _recs = e.recs ??= {}
		let baslangicKod2Kural = this.baslangicKod2Kural = {}
		let ayrisimKurallari = this.ayrisimKurallari = []
		let promises = []
		promises.push(new $.Deferred(async p => {
			try {
				let {baslangicKod2Kural: recs} = _recs
				recs ??= _recs.baslangicKod2Kural = []
				let parserSinif = BarkodParser_Tarti
				for (let rec of recs) {
					let kuralSinif = parserSinif.getKuralSinif()
					let kural = new kuralSinif({ parserSinif, ...rec })
					baslangicKod2Kural[rec.kod] = kural;
				}
				p.resolve(recs)
			}
			catch (ex) { p.reject(ex) }
		}));
		promises.push(new $.Deferred(async p => {
			try {
				await delay(100)
				let parserSinif = BarkodParser_Ayrisim, {ayrisimKurallari: recs} = _recs
				if (!recs) {
					let stm = new MQStm({
						sent: new MQSent({ from: 'barayrim', where: `kod <> ''`, sahalar: '*' }),
						orderBy: 'kod'
					})
					recs = _recs.ayrisimKurallari = await MQCogul.sqlExecSelect(stm)
				}
				for (let rec of recs) {
					let {formattipi: formatTipi} = rec
					let kuralSinif = parserSinif.getKuralSinif({ formatTipi })
					let kural = new kuralSinif({ parserSinif, ...rec })
					if (formatTipi) { ayrisimKurallari.push(kural) }
					else { baslangicKod2Kural[rec.kod] = kural }
				}
				p.resolve(recs)
			}
			catch (ex) { p.reject(ex) }
		}))
		return Promise.all(promises)
	}
	parseDevam(e) {
		let result = super.parseDevam(e)
		return result || false
	}
	parcaAl({ bas, hane, value, callback } = {}) {
		if (!(bas && !hane))
			return false
		value ??= this.barkod
		if (value.length < (bas + hane - 1))
			return false
		value = value.substr(bas - 1, hane).trim()
		callback.call(this, value, { ...arguments[0], value })
		return true
	}
}
