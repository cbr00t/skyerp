class DAltRapor_PanelRec extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this } get panelRecmi() { return true }
	constructor(e) { e = e || {}; super(e); $.extend(this, { ...e }) }
	toplamYapiOlustur(e) { }
}
class DAltRapor_PanelRec_Donemsel extends DAltRapor_PanelRec {
	static { window[this.name] = this; this._key2Class[this.name] = this } get donemRecmi() { return true }
	get yatay2Detay() {
		let result = this._yatay2Detay; if (result === undefined) {
			let {_yatayBelirtec: yatayBelirtec, _toplamAttrListe: toplamAttrListe, detaylar} = this, toplamRec;
			result = {}; for (let rec of detaylar) {
				if (!toplamRec) {
					result.TOPLAM = toplamRec = { ...rec };
					for (let key of toplamAttrListe) { toplamRec[key] = 0 }
				}
				result[rec[yatayBelirtec]] = rec; for (let key of toplamAttrListe) { if (key != 'TOPLAM') { toplamRec[key] += (rec[key] || 0) } }
			}
			this._yatay2Detay = result; delete this.detaylar
		}
		return result
	}
	constructor(e) {
		e = e || {}; super(e); $.extend(this, { _yatayBelirtec: e.yatayBelirtec, _toplamAttrListe: e.toplamAttrListe, detaylar: e.detaylar ?? [] });
		for (const key of ['yatayBelirtec', 'toplamAttrListe']) { delete this[key] }
	}
	donemselDuzenle(e) {
		let {_toplamAttrListe: toplamAttrListe, yatay2Detay} = this; if (!(toplamAttrListe?.length && yatay2Detay)) { return this }
		let {tumYatayAttrSet} = e; for (let toplamAttr of toplamAttrListe) {
			for (let [yatayAttr, rec] of Object.entries(yatay2Detay)) {
				let attr = `${toplamAttr}_${yatayAttr}`; this[attr] = rec[toplamAttr];
				tumYatayAttrSet[attr] = true
			}
			this[toplamAttr] = yatay2Detay.TOPLAM[toplamAttr] || 0
		}
		return this
	}
	donemselAttrFix(e) { let {tumYatayAttrSet} = e; for (let key in tumYatayAttrSet) { this[key] = this[key] ?? 0 }; return this }
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
