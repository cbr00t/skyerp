class DAltRapor_PanelRec extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this } get panelRecmi() { return true }
	constructor(e) { e = e || {}; super(e); $.extend(this, { ...e }) }
	toplamYapiOlustur(e) { }
}
class DAltRapor_PanelRec_Donemsel extends DAltRapor_PanelRec {
	static { window[this.name] = this; this._key2Class[this.name] = this } get donemRecmi() { return true }
	get yilAy2Detay() {
		let result = this._yilAy2Detay; if (result === undefined) {
			let {_yilAyBelirtec: yilAyBelirtec, _toplamAttrListe: toplamAttrListe, detaylar} = this, toplamRec;
			result = {}; for (let rec of detaylar) {
				if (!toplamRec) {
					result.toplam = toplamRec = { ...rec };
					for (let key of toplamAttrListe) { toplamRec[key] = 0 }
				}
				result[rec[yilAyBelirtec]] = rec; for (let key of toplamAttrListe) { toplamRec[key] += (rec[key] || 0) }
			}
			this._yilAy2Detay = result; delete this.detaylar
		}
		return result
	}
	constructor(e) {
		e = e || {}; super(e); $.extend(this, { _yilAyBelirtec: e.yilAyBelirtec, _toplamAttrListe: e.toplamAttrListe, detaylar: e.detaylar ?? [] });
		for (const key of ['yilAyBelirtec', 'toplamAttrListe']) { delete this[key] }
	}
	donemselDuzenle(e) {
		let {_toplamAttrListe: toplamAttrListe, yilAy2Detay} = this; if (!(toplamAttrListe?.length && yilAy2Detay)) { return this }
		let {tumYilAyAttrSet} = e; for (let toplamAttr of toplamAttrListe) {
			for (let [yilAyAttr, rec] of Object.entries(yilAy2Detay)) {
				let attr = `${toplamAttr}_${yilAyAttr}`; this[attr] = rec[toplamAttr];
				tumYilAyAttrSet[attr] = true
			}
			delete this[toplamAttr]
		}
		return this
	}
	donemselAttrFix(e) { let {tumYilAyAttrSet} = e; for (let key in tumYilAyAttrSet) { this[key] = this[key] ?? 0 }; return this }
}
class DAltRapor_PanelGruplama extends DAltRapor_PanelRec {
	static { window[this.name] = this; this._key2Class[this.name] = this } get grupmu() { return true }
	constructor(e) { e = e || {}; super(e); $.extend(this, { _sumAttrListe: e._sumAttrListe ?? [], _avgAttrListe: e._avgAttrListe ?? [], _orj: e._orj ?? {}, detaylar: e.detaylar ?? [] }) }
	toplamYapiOlustur(e) {
		super.toplamYapiOlustur(e); const {_sumAttrListe, _avgAttrListe, detaylar, _orj: orj} = this; if (!detaylar?.length) { return this }
		const aggrAttrListe = ['kayitsayisi', ...(_sumAttrListe ?? []), ...(_avgAttrListe ?? [])];
		for (const key of aggrAttrListe) {
			this[key] = 0; for (const det of detaylar) {
				det.toplamYapiOlustur?.(e); this[key] = roundToFra2((this[key] || 0) + ((orj[key] ?? det[key]) || 0)) }
		}
		let {kayitsayisi: count} = this; if (count) {
			for (const key of _avgAttrListe) {
				let value = orj[key] = this[key] || 0; this[key] = value = roundToFra2(value / count) }
		}
		/*for (const key of aggrAttrListe) { for (const det of detaylar) { det.toplamYapiOlustur?.(e) } }*/
		return this
	}
}
