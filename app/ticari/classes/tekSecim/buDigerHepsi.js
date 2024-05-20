class BuVeDiger extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '1' }
	get bumu() { return this.char == '1' }
	get digermi() { return this.char == '2' }
	init(e) {
		e = e || {}; super.init(e);
		let buDigerYapi = e;
		if (buDigerYapi) { if (buDigerYapi == 'object' && !$.isArray(buDigerYapi)) buDigerYapi = [buDigerYapi.bu, buDigerYapi.diger] }
		if ($.isEmptyObject(buDigerYapi))
			buDigerYapi = ['Bu', 'Diğer'];
		this._buDigerYapi = buDigerYapi
	}	
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const questions = ['bumu', 'digermi'], {_buDigerYapi} = this;
		for (let i = 0; i < _buDigerYapi.length; i++) e.kaListe.push(new CKodVeAdi({ kod: (i + 1).toString(), aciklama: _buDigerYapi[i], question: questions[i] }))
	}
	bu() { this.char = '1'; return this }
	diger() { this.char = '2'; return this }
	static getBoolClause(e) { return this.instance.getBoolClause(e) }
	static getTersBoolClause(e) { return this.instance.getTersBoolClause(e) }
	static getBoolBitClause(e) { return this.instance.getBoolBitClause(e) }
	static getTersBoolBitClause(e) { return this.instance.getTersBoolBitClause(e) }
	getBoolClause(e) {
		const {kaListe} = this;
		if ($.isEmptyObject(kaListe)) return null
		const saha = typeof e == 'object' ? e.saha : e;
		if (this.bumu) return `${saha} <> ''`
		if (this.digermi) return `${saha} = ''`
		return null
	}
	getTersBoolClause(e) {
		const {kaListe} = this; if ($.isEmptyObject(kaListe)) return null
		const saha = typeof e == 'object' ? e.saha : e;
		if (this.bumu) return `${saha} = ''`
		if (this.digermi) return `${saha} <> ''`
		return null
	}
	getBoolBitClause(e) {
		const {kaListe} = this; if ($.isEmptyObject(kaListe)) return null
		const saha = typeof e == 'object' ? e.saha : e;
		if (this.bumu) return `${saha} <> 0`
		if (this.digermi) return `${saha} = 0`
		return null
	}
	getTersBoolBitClause(e) {
		const {kaListe} = this; if ($.isEmptyObject(kaListe)) return null
		const saha = typeof e == 'object' ? e.saha : e;
		if (this.bumu) return `${saha} = 0`
		if (this.digermi) return `${saha} <> 0`
		return null
	}
}
class BuDigerVeHepsi extends BuVeDiger {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return null }
	get hepsimi() { return !this.char }
	kaListeDuzenle(e) { super.kaListeDuzenle(e); e.kaListe.push(new CKodVeAdi({ kod: null, aciklama: 'Hepsi', question: 'hepsimi' }))} hepsi() { this.char = null; return this }
}
class EvetHayirTekSecim extends BuDigerVeHepsi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	init(e) {
		e = e || {}; super.init(e); const {_buDigerYapi} = this;
		_buDigerYapi[0] = '<span class="green">Evet</span>';
		_buDigerYapi[1] = '<span class="red">HAYIR</span>';
	}
	evet() { this.bu(); return this }
	hayir() { this.diger(); return this }
}
