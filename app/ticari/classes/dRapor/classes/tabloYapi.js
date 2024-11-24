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
	setGruplar(value) { this.grup = value ?? {}; return this } setToplamlar(value) { this.toplam = value ?? {}; return this }
	setSortAttr(value) { this.sortAttr = value; return this } setKAPrefixes(value) { this.kaPrefixes = value; return this }
}
class DRaporFormul extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) { e = e || {}; super(e); this.setAttrListe(e.attrListe).setBlock(e.block) }
	run(e) {
		const {rec} = e, {block} = this; if (!(rec && block)) { return this }
		const formul = this, {item} = e, kod = e.kod ?? e.name ?? e.tip; return getFuncValue.call(this, block, { kod, rec, formul, item })
	}
	addAttr(...items) {
		const {attrListe} = this; for (const item of items) {
			if ($.isArray(item)) { this.addAttr(...item); continue }
			if (item != null) { attrListe.push(item) }
		}
		return this
	}
	setAttrListe(value) { this.attrListe = value ?? []; return this }
	setBlock(value) { if (typeof value == 'string') { value = getFunc(value) } this.block = value; return this }
}
class TabloYapiItem extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get tipStringmi() { return !this.tip } get tipNumerikmi() { return this.tip == 'number' } get tipTarihmi() { return this.tip == 'date' } get tipBoolmu() { return this.tip == 'boolean' }
	get secimSinif() { return this.tipNumerikmi ? SecimNumber : this.tipTarihmi ? SecimDate : SecimString } get kaYapimi() { return !!this.mfSinif } get formulmu() { return !!this.formul }
	get orderBySaha() {
		let belirtec = this._orderBySaha; if (belirtec !== undefined) { return belirtec }
		let {kaYapimi} = this; belirtec = this.colDefs[0]?.belirtec; if (belirtec && kaYapimi) {
			const belirtecLower = belirtec.toLowerCase(); if (!(belirtecLower.endsWith('kod') || belirtecLower.endsWith('adi'))) { belirtec += 'kod' } }
		return belirtec
	} set orderBySaha(value) { this._orderBySaha = value }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			tip: e.tip == 'string' ? null : e.tip, mfSinif: e.mfSinif, secimKullanilirFlag: e.secimKullanilirFlag, orderBySaha: e.orderBySaha,
			colDefs: e.colDefs ?? [], secimlerDuzenleyici: e.secimlerDuzenleyici, tbWhereClauseDuzenleyici: e.tbWhereClauseDuzenleyici,
			kodsuzmu: e.kodsuzmu, isHidden: e.hidden ?? e.isHidden
		});
		this.setKA(e.ka).setFormul(e.formul)
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
	formulEval(e) {
		const colDefs = this.colDefs?.filter(colDef => colDef.userData?.tip == 'toplam'); if (!colDefs?.length) { return this }
		const item = this, {rec} = e, {kod} = this.ka; let value = this.formul?.run({ item, kod, ...e }); if (value == null) { return this }
		for (const {belirtec} of colDefs) { rec[belirtec] = value } return this
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
	setFormul(e, _block) {
		if (_block !== undefined) { e = { attrListe: e, block: _block } }
		if (e != null && $.isPlainObject(e)) { e = new DRaporFormul(e) }
		this.formul = e; return this
	}
	setOrderBySaha(value) { this.orderBySaha = value; return this } setOrderBy(value) { return this.setOrderBySaha(value) } noOrderBy() { return this.setOrderBySaha(null) }
	kodsuz() { this.kodsuzmu = true; return this } kodlu() { this.kodsuzmu = false; return this }
	hidden() { this.isHidden = true; return this } visible() { this.isHidden = false; return this }
	tipString() { this.tip = null; return this } tipNumerik() { this.tip = 'number'; return this } tipDate() { this.tip = 'date'; return this } tipBool() { this.tip = 'boolean'; return this }
	setColDefs(value) { this.colDefs = value; return this } setMFSinif(value) { this.mfSinif = value; return this }
	secimKullanilir() { this.secimKullanilirFlag = true; return this } secimKullanilmaz() { this.secimKullanilirFlag = false; return this }
	setSecimlerDuzenleyici(value) { this.secimlerDuzenleyici = value; return this } setTBWhereClauseDuzenleyici(value) { this.tbWhereClauseDuzenleyici = value; return this }
}
