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
	get tipStringmi() { return !this.tip } get tipNumerikmi() { return this.tip == 'number' } get tipTarihmi() { return this.tip == 'date' } get tipBoolmu() { return this.tip == 'boolean' }
	get secimSinif() { return this.tipNumerikmi ? SecimNumber : this.tipTarihmi ? SecimDate : SecimString }
	get kaYapimi() { return !!this.mfSinif } get orderBySaha() { let {kaYapimi} = this, {belirtec} = this.colDefs[0]; if (kaYapimi) { belirtec += 'kod' } return belirtec }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			tip: e.tip == 'string' ? null : e.tip, mfSinif: e.mfSinif, secimKullanilirFlag: e.secimKullanilirFlag,
			colDefs: e.colDefs ?? [], secimlerDuzenleyici: e.secimlerDuzenleyici, tbWhereClauseDuzenleyici: e.tbWhereClauseDuzenleyici
		})
		this.setKA(e.ka)
	}
	secimlerDuzenle(e) {
		const {secimKullanilirFlag} = this; if (secimKullanilirFlag) {
			const {ka, secimSinif, mfSinif} = this, kod = ka?.kod, kodSaha = mfSinif?.kodSaha;
			if (kod != null && secimSinif && mfSinif && kodSaha) {
				const {adiSaha} = mfSinif, sec = e.secimler, etiket = ka.aciklama;
				const grupKod = kod, zeminRenk = undefined, kapali = true; sec.grupEkle({ kod: grupKod, aciklama: etiket, zeminRenk, kapali });
				const userData = { kod }, liste = {}; liste[kod] = new secimSinif({ etiket: 'Kod', mfSinif, grupKod, userData });
				if (adiSaha) { liste[kod + 'Adi'] = new SecimOzellik({ etiket: 'Adı', grupKod, userData }) }
				sec.secimTopluEkle(liste)
			}
		}
		const {secimlerDuzenleyici} = this; if (secimlerDuzenleyici != null) { getFuncValue.call(this, secimlerDuzenleyici, e) }
	}
	tbWhereClauseDuzenle(e) {
		const {secimKullanilirFlag} = this; if (secimKullanilirFlag) {
			const {ka, secimSinif, mfSinif} = this, kod = ka?.kod, kodSaha = mfSinif?.kodSaha;
			if (kod != null && secimSinif && mfSinif && kodSaha) {
				const {aliasVeNokta, adiSaha} = mfSinif, sec = e.secimler, wh = e.where; wh.basiSonu(sec[kod], aliasVeNokta + kodSaha);
				if (adiSaha) { wh.ozellik(sec[kod + 'Adi'], aliasVeNokta + adiSaha) }
			}
		}
		const {tbWhereClauseDuzenleyici} = this; if (tbWhereClauseDuzenleyici != null) { getFuncValue.call(this, tbWhereClauseDuzenleyici, e) }
	}
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
	tipString() { this.tip = null; return this } tipNumerik() { this.tip = 'number'; return this }
	tipDate() { this.tip = 'date'; return this } tipBool() { this.tip = 'boolean'; return this }
	setColDefs(value) { this.colDefs = value; return this } setMFSinif(value) { this.mfSinif = value; return this }
	secimKullanilir() { this.secimKullanilirFlag = true; return this } secimKullanilmaz() { this.secimKullanilirFlag = false; return this }
	setSecimlerDuzenleyici(value) { this.secimlerDuzenleyici = value; return this }
	setTBWhereClauseDuzenleyici(value) { this.tbWhereClauseDuzenleyici = value; return this }
}
