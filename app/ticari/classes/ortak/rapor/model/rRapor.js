class RRapor extends MQDetayli {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Rapor' } static get table() { return 'rstdrapor' } static get tableAlias() { return 'rap' }
	static get sayacSaha() { return 'sayac' } static get adiSaha() { return 'aciklama' }
	static get tanimUISinif() { return RaporTanimPart } static get detaySinif() { return RRaporDetay }
	get tumSahalar() { let result = []; for (let saha of this.tumSahalarIter()) result.push(saha); return result }
	get tumDegiskenSahalar() { let result = []; for (let saha of this.tumDegiskenSahalarIter()) result.push(saha); return result }
	get tumAttrListesi() { let _e = { liste: [] }; this.tumAttrListeEkleInto(_e); return _e.liste }
	get sahalar() { let result = []; for (let saha of this.sahalarIter()) result.push(saha); return result }
	get degiskenSahalar() { let result = []; for (let saha of this.degiskenSahalarIter()) result.push(saha); return result }
	get attrListesi() { let _e = { liste: [] }; this.attrListeEkleInto(_e); return _e.liste }
	
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, {									/* detaylar ==>		    RRSahaOrtak veya RROzelIslem */
			ustBilgi: {}, altBilgi: {},
			gruplamalar: e.gruplamalar ?? [],				/* RRGrup */
			frXMLStr: e.frXMLStr || null, frOzelAttrListe: e.frOzelAttrListe ?? []
		})
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); let {pTanim} = e;
		$.extend(pTanim, { raporAdi: new PInstStr('aciklama'), ekAciklama: new PInstStr('ekaciklama'), raporGrup: new PInstStr('raporgrup') })
	}
	static ekCSSDuzenle(e) {
		e = e || {}; super.ekCSSDuzenle(e);
		let {rec, result} = e;
		if (asBool(rec.frvarmi)) result.push('rapor-frVar')
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); let {aliasVeNokta} = this, {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'aciklama', text: 'Rapor Adı',  minWidth: Math.min(200, asInteger($(window).width() / 4)), width: Math.min(600, asInteger($(window).width() / 2)) }),
			new GridKolon({ belirtec: 'ekaciklama', text: 'Ek Açıklama', minWidth: Math.min(200, asInteger($(window).width() / 4)), width: Math.min(600, asInteger($(window).width() / 2)) }),
			new GridKolon({ belirtec: 'frvarmi', text: 'FR', width: 80 }).tipBool(),
			new GridKolon({ belirtec: 'raporgrup', text: 'Grup', width: 120 })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {aliasVeNokta} = this, {sent, stm} = e;
		sent.sahalar.add(`${aliasVeNokta}raporgrup`);
		stm.orderBy.liste = [`${aliasVeNokta}raporgrup`, `${aliasVeNokta}aciklama`, `${aliasVeNokta}ekaciklama`]
	}
	async detaylariYukleSonrasi(e) {
		await super.detaylariYukleSonrasi(e); let {detaylar, gruplamalar} = this;
		while (true) {
			let kirInd = detaylar.findIndex(det => det.class.kirilmami);
			if (kirInd < 0) break
			let gruplama = new RRGrup(), altDetaylar = detaylar.splice(0, kirInd);		// silerek al
			gruplama.addDetaylar(altDetaylar); detaylar.splice(0, 1); gruplamalar.push(gruplama)
		}
		await this.frXMLYukle(e); return true
	}
	async kaydetSonrasiIslemler(e) { await super.kaydetSonrasiIslemler(e); await this.frXMLKaydet(e); }
	async frXMLYukle(e) {
		let {sayac} = this, wh = { degerAta: sayac, saha: 'sayac' };
		let stm = new MQStm({ sent: new MQSent({ from: 'rstdraporfrxml rxml', where: wh, sahalar: 'rxml.xsubstr' }), orderBy: 'seq' });
		let recs = await app.sqlExecSelect(stm), data = ''
		for (let rec of recs) data += (rec.xsubstr || '').trimEnd()
		if (data) data = Base64.decode(data); this.frXMLStr = data || null;
		stm = new MQStm({ sent: new MQSent({ from: 'rstdraporozelattr rattr', where: wh, sahalar: 'rattr.fr2ozelattr' }), orderBy: 'seq' });
		recs = await app.sqlExecSelect(stm); let frOzelAttrListe = this.frOzelAttrListe = [];
		for (let rec of recs) frOzelAttrListe.push(rec.fr2ozelattr)
		return true
	}
	async frXMLKaydet(e) {
		let DataMaxLength = 4999;
		let {sayac} = this, hvListe = [];
		let data = this.frXMLStr; if (data) data = Base64.encode(data);
		while (data) {
			let part = data.slice(0, DataMaxLength); data = data.substring(DataMaxLength);
			if (!part) break; hvListe.push({ sayac, /* dettip: '??', */ xsubstr: part })
		} if (!hvListe.length) return
		let table = 'rstdraporfrxml rxml', toplu = new MQToplu([
			new MQIliskiliDelete({ from: `${table} rxml`, where: new MQWhereClause({ degerAta: sayac, saha: 'rxml.sayac' }) }),
			new MQInsert({ table, hvListe })
		]).withDefTrn(); await app.sqlExecNone(toplu);
	}
	tumAttrListeEkleInto(e) {
		let {liste} = e, set = e.set = asSet(liste);
		for (let saha of this.tumDegiskenSahalarIter()) { let {attr} = saha; if (!set[attr]) { set[attr] = true; liste.push(attr) } }
		this.attrListeEkleDevamOrtak(e); return this
	}
	attrListeEkleInto(e) {
		let {liste} = e, set = e.set = asSet(liste);
		for (let saha of this.degiskenSahalarIter()) { let {attr} = saha; if (!set[attr]) { set[attr] = true; liste.push(attr) } }
		this.attrListeEkleDevamOrtak(e); return this
	}
	attrListeEkleDevamOrtak(e) {
		let {frOzelAttrListe} = this;
		if (!$.isEmptyObject(frOzelAttrListe)) {
			let {set, liste} = e;
			for (let attr of frOzelAttrListe) { if (!set[attr]) { set[attr] = true; liste.push(attr) } }
		}
	}
	detayEkIslemler(e) {
		if (this._detayEkIslemlerYapildimi) return
		let {raporcu} = e; if (!raporcu) return; let {attr2Kolon} = raporcu;
		for (let saha of this.tumDegiskenSahalarIter()) {
			let {attr} = saha, def = attr2Kolon[attr];
			if (!def) continue
			for (let key of ['tip', 'sql', 'sifirGostermeFlag', 'wordWrapFlag']) {
				let value = def[key]; if (value !== undefined) saha[key] = value
			}
		}
		this._detayEkIslemlerYapildimi = true
	}
	static detaySinifFor(e) {
		let {rec} = e, tip = (e.detTip ?? rec?.dettip)?.trim();
		return tip == 'AT' || tip == 'SS' ? RROzelIslem : ( RRaporDetay.tip2Sinif[tip] ??  super.detaySinifFor(e) )
	}
	*tumSahalarIter() {
		let tumSahalar = [];
		for (let rGrup of this.gruplamalar) { for (let saha of rGrup.detaylar) yield saha }
		for (let saha of this.detaylar) yield saha
	}
	*tumDegiskenSahalarIter() { for (let saha of this.tumSahalarIter()) { if (saha.class.degiskenmi) yield saha } }
	*sahalarIter() { let tumSahalar = []; for (let saha of this.detaylar) yield saha }
	*degiskenSahalarIter() {
		for (let saha of this.sahalarIter()) { if (saha.class.degiskenmi) yield saha }
	}
}


class RRGrup extends DetayliYapi {
	constructor(e) {
		e = e || {};
		super(e);
	}

	attrListeEkleInto(e) {
		let {liste} = e;
		for (let det of this.detaylar) {
			if (det.class.degiskenmi)
				liste.push(det.attr)
		}
	}
}

