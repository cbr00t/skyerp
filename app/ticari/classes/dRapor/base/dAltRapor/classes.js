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
					result['TOPLAM'] = toplamRec = { ...rec };
					for (let key of toplamAttrListe) { toplamRec[key] = 0 }
				}
				result[rec[yatayBelirtec]] = rec; for (let key of toplamAttrListe) { if (key != 'TOPLAM') { toplamRec[key] += (rec[key] || 0) } }
			}
			this._yatay2Detay = result; delete this.detaylar
		}
		return result
	}
	constructor(e = {}) {
		super(e)
		extend(this, {
			_yatayBelirtec: e.yatayBelirtec, _toplamAttrListe: e.toplamAttrListe,
			detaylar: e.detaylar ?? []
		})
		deleteKeys(this, 'yatayBelirtec', 'toplamAttrListe')
	}
	donemselDuzenle(e) {
		let { _toplamAttrListe: toplamAttrListe, yatay2Detay } = this
		if (!(toplamAttrListe?.length && yatay2Detay))
			return this
		
		let {tumYatayAttrSet} = e
		for (let toplamAttr of toplamAttrListe) {
			for (let [yatayAttr, rec] of entries(yatay2Detay)) {
				let attr = `${toplamAttr}_${yatayAttr}`
				this[attr] = rec[toplamAttr]
				tumYatayAttrSet[attr] = true
			}
			this[toplamAttr] = yatay2Detay['TOPLAM'][toplamAttr] || 0
		}
		return this
	}
	donemselAttrFix({ tumYatayAttrSet }) {
		for (let key in tumYatayAttrSet)
			this[key] = this[key] ?? 0
		return this
	}
}
class DAltRapor_PanelGruplama extends DAltRapor_PanelRec {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get grupmu() { return true }
	
	constructor(e = {}) {
		super(e)
		extend(this, {
			_sumAttrListe: e._sumAttrListe ?? [], _avgAttrListe: e._avgAttrListe ?? [],
			_orj: e._orj ?? {}, detaylar: e.detaylar ?? []
		})
	}
	toplamYapiOlustur(e) {
		super.toplamYapiOlustur(e)
		let { _sumAttrListe, _avgAttrListe, detaylar, _orj: orj } = this
		if (!detaylar?.length)
			return this
		let aggrAttrListe = ['kayitsayisi', ...(_sumAttrListe ?? []), ...(_avgAttrListe ?? [])]
		for (let key of aggrAttrListe) {
			this[key] = 0
			for (let det of detaylar) {
				det.toplamYapiOlustur?.(e)
				this[key] = roundToFra2((this[key] || 0) + ((orj[key] ?? det[key]) || 0))
			}
		}
		let { kayitsayisi: count } = this
		if (count) {
			for (let key of _avgAttrListe) {
				let value = orj[key] = this[key] || 0
				this[key] = value = roundToFra2(value / count)
			}
		}
		/*for (let key of aggrAttrListe)
		  for (let det of detaylar)
			  det.toplamYapiOlustur?.(e)*/
		return this
	}
}

class DAltRaporTip extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Rapor Tip' } static get defaultChar() { return ' ' }
	get altRaporTip() {
		let kod = this.char?.trim() ?? ''
		switch (kod) {
			case '': return 'main'
			case 'OZ': return 'ozet'
			case 'CH': return 'chart'
		}
		return null
	}
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments)
		kaListe.push(
			new CKodVeAdi([' ', 'Asıl Rapor', 'mainmi']),
			new CKodVeAdi(['OZ', 'Özet', 'ozetmi']),
			new CKodVeAdi(['CH', 'Grafik', 'chartmi'])
		)
	}
}
