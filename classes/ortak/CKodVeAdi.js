class CKod extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kodSaha() { return 'kod' }
	constructor(e) { e = e || {}; super(e); this.kod = ($.isArray(e)) ? e[0] : (e.kod === undefined ? e.id : e.kod) }
	cizgiliOzet(e) { return this.kod || '' } parantezliOzet(e) { return this.kod || '' }
	toString(e) { return this.parantezliOzet(e) }
}
class CKodVeAdi extends CKod {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get adiSaha() { return 'aciklama' }
	constructor(e) {
		e = e || {}; super(e);
		if ($.isArray(e)) { this.aciklama = e[1]; if (e[2] != null) { this.question = e[2] } }
		else { this.aciklama = e.aciklama; if (e.question != null) { this.question = e.question } }
	}
	parantezliOzet(e) {
		e = e || {}; if (!this.aciklama) { return super.parantezliOzet(e) }
		if (!this.kod) { return this.aciklama }
		return `(${e.styled ? '<b>' : ''}${this.kod}${e.styled ? '</b>' : ''}) ${this.aciklama}`
	}
	cizgiliOzet(e) {
		e = e || {}; if (!this.aciklama) { return super.cizgiliOzet(e) }
		if (!this.kod) { return this.aciklama }
		return `${e.styled ? '<b>' : ''}${this.kod}${e.styled ? '</b>' : ''}-${this.aciklama}`
	}
	toString(e) { return this.parantezliOzet(e) }
}
class CKodAdiVeEkBilgi extends CKodVeAdi {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {}; super(e);
		if ($.isArray(e)) { this.ekBilgi = e[3] } else { if (e.ekBilgi !== undefined) { this.ekBilgi = e.ekBilgi } }
	}
}
class CKodAdiVeDetaylar extends CKodAdiVeEkBilgi {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get detaylar() { return this.ekBilgi } set detaylar(value) { return this.ekBilgi = value }
	constructor(e) {
		e = e || {}; super(e);
		if ($.isArray(e)) { this.detaylar = e[0] }
		else { if (e.detaylar !== undefined) { this.detaylar = e.detaylar } }
		this.detaylar = this.detaylar ?? []
	}
	addDetay(...liste) {
		const {detaylar} = this;
		if (liste) { for (const item of liste) { if (item == null) { continue } if ($.isArray(item)) { detaylar.push(...item) } else { detaylar.push(item) } } }
		return this
	}
	addDetaylar(liste) { return this.addDetay(liste) }
	detaylarReset() { this.detaylar = [] }
}
class CKodAdiVeMadde extends CKodAdiVeEkBilgi {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get madde() { return this.ekBilgi } set madde(value) { return this.ekBilgi = value }
	constructor(e) { e = e || {}; super(e); if (!$.isArray(e)) { if (e.madde !== undefined) { this.madde = e.madde } } }
}
class CKodAdiVeOran extends CKodAdiVeEkBilgi {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get oran() { return this.ekBilgi } set oran(value) { return this.ekBilgi = value }
	constructor(e) { e = e || {}; super(e); if (!$.isArray(e)) { if (e.oran !== undefined) { this.oran = e.oran } } }
}
class PayVeBaz extends CKodVeAdi {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {}; super(e); if ($.isArray(e)) { this.oran = e[4] } else { if (e.oran !== undefined) { this.oran = e.oran } }
		if (!this.aciklama) { const {oran} = this; if (oran && oran.baz != null) { this.aciklama = `${asInteger(oran.pay)}/${asInteger(oran.baz)}` } }
	}
}
