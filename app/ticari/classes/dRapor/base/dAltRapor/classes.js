class DAltRapor_PanelGruplama extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) { e = e || {}; super(e); $.extend(this, { ...e, _sumAttrListe: e._sumAttrListe ?? [], _avgAttrListe: e._avgAttrListe ?? [],  _orj: e._orj ?? {}, detaylar: e.detaylar ?? [] }) }
	toplamYapiOlustur(e) {
		const {_sumAttrListe, _avgAttrListe, detaylar, _orj: orj} = this; if (!detaylar?.length) { return this }
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
