class TabloYapi extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get grupVeToplam() { let result = this._grupVeToplam; if (result == null) { const {grup, toplam} = this; result = this._grupVeToplam = { ...grup, ...toplam } } return result }
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, { grup: e.grup ?? {}, toplam: e.toplam ?? {}, kaPrefixes: e.kaPrefixes ?? [], sortAttr: e.sortAttr ?? null })
	}
	addGrup(...items) {
		const result = this.grup; for (let item of items) {
			if ($.isArray(item)) { this.addGrup(...item); continue }
			if ($.isPlainObject(item)) { item = new TabloYapiItem(item) }
			let {ka} = item, kod = ka?.kod; if (kod != null) { result[kod] = item }
		}
		return this
	}
	addToplam(...items) {
		const result = this.toplam; for (let item of items) {
			if ($.isArray(item)) { this.addToplam(...item); continue }
			if ($.isPlainObject(item)) { item = new TabloYapiItem(item) }
			const {ka} = item, kod = ka?.kod; if (kod != null) { result[kod] = item }
		}
		return this
	}
	addKAPrefix(...items) {
		const {kaPrefixes} = this; for (const item of items) {
			if ($.isArray(item)) { this.addKAPrefix(...item); continue }
			if (item != null) { kaPrefixes.push(item) }
		}
		return this
	}
	setGrup(value) { this.grup = value ?? {}; return this }
	setGrup(value) { this.toplam = value ?? {}; return this }
	setSortAttr(value) { this.sortAttr = value; return this }
	setKAPrefixes(value) { this.kaPrefixes = value; return this }
}
class TabloYapiItem extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, { colDefs: e.colDefs ?? [], secimlerDuzenleyici: e.secimlerDuzenleyici, tbWhereClauseDuzenleyici: e.tbWhereClauseDuzenleyici })
		this.setKA(e.ka)
	}
	secimlerDuzenle(e) { const {secimlerDuzenleyici} = this; if (secimlerDuzenleyici != null) { getFuncValue.call(this, secimlerDuzenleyici, e) } }
	tbWhereClauseDuzenle(e) { const {tbWhereClauseDuzenleyici} = this; if (tbWhereClauseDuzenleyici != null) { getFuncValue.call(this, tbWhereClauseDuzenleyici, e) } }
	addColDef(...items) {
		const {colDefs} = this; for (const item of items) {
			if ($.isArray(item)) { this.addColDef(...item); continue }
			if (item != null) { colDefs.push(item) }
		}
		return this
	}
	setKA(e, _aciklama) {
		if (e != null) {
			if (_aciklama !== undefined) { e = new CKodVeAdi({ kod: e, aciklama: _aciklama }) }
			if ($.isPlainObject(e)) { e = new CKodVeAdi(value) }
			if ($.isArray(e)) { e = new CKodVeAdi({ kod: value[0], aciklama: value[1] }) }
		}
		this.ka = e; return this
	}
	setColDefs(value) { this.colDefs = value; return this }
	setSecimlerDuzenleyici(value) { this.secimlerDuzenleyici = value; return this }
	setTBWhereClauseDuzenleyici(value) { this.tbWhereClauseDuzenleyici = value; return this }
}
