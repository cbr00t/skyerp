class DAltRapor_PanelGruplama extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) { e = e || {}; super(e); $.extend(this, { ...e, _sumAttrListe: e._sumAttrListe ?? [], detaylar: e.detaylar ?? [] }) }
	toplamYapiOlustur(e) {
		const {_sumAttrListe, detaylar} = this;
		if (detaylar?.length) {
			for (const key of _sumAttrListe) {
				this[key] = 0; for (const det of detaylar) { if (det.toplamYapiOlustur) { det.toplamYapiOlustur(e) } this[key] = roundToFra((this[key] || 0) + (det[key] || 0), 2) }
			}
		}
		return this
	}
}
