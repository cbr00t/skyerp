class MQYerelParamUretim extends MQYerelParamTicari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get paramKod() { return `${super.paramKod}.yerel` }
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, { sonWSBilgi: this.sonWSBilgi || {}, gerceklemeler: e.gerceklemeler || this.gerceklemeler || [] })
	}
	static paramAttrListeDuzenle(e) { super.paramAttrListeDuzenle(e); e.liste.push('sonWSBilgi', 'otoGonderFlag') }
	paramHostVarsDuzenle(e) {
		super.paramHostVarsDuzenle(e); const {hv} = e, {gerceklemeler} = this;
		if (gerceklemeler) { const _gerceklemeler = hv.gerceklemeler = []; for (const rec of gerceklemeler) { _gerceklemeler.push(rec.asJSON ? rec.asJSON() : rec) } }
	}
	paramSetValues(e) {
		super.paramSetValues(e); const rec = e.rec || {}, {gerceklemeler} = rec;
		if (gerceklemeler) {
			const _gerceklemeler = this.gerceklemeler = [];
			for (const _rec of gerceklemeler) { if (!_rec) { continue } const inst = new MQBarkodRec(_rec); _gerceklemeler.push(inst) }
		}
	}
	yukleSonrasi(e) {
		e = e || {}; super.yukleSonrasi(e);
		(() => {
			const wsBilgi = $.extend({ url: config.getWSUrlBase() }, app.wsSQL || {}), sonWSBilgi = this.sonWSBilgi || {}, keys = ['url', 'server', 'db']; let farklimi = false;
			for (const key of keys) {
				const value  = wsBilgi[key], lastValue = sonWSBilgi[key];
				if (value !== undefined && lastValue !== undefined && value != lastValue) { farklimi = true; break }
			}
			this.sonWSBilgi = $.extend({ url: config.getWSUrlBase() }, app.wsSQL || {}); this.wsConfigDegistimi = farklimi; this.kaydet()
		})()
	}
}
