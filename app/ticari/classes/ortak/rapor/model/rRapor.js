class RRapor extends MQDetayli {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Rapor' } static get table() { return 'rstdrapor' } static get tableAlias() { return 'rap' }
	static get sayacSaha() { return 'sayac' } static get adiSaha() { return 'aciklama' }
	static get tanimUISinif() { return RaporTanimPart } static get detaySinif() { return RRaporDetay }
	get tumSahalar() { const result = []; for (const saha of this.tumSahalarIter()) result.push(saha); return result }
	get tumDegiskenSahalar() { const result = []; for (const saha of this.tumDegiskenSahalarIter()) result.push(saha); return result }
	get tumAttrListesi() { const _e = { liste: [] }; this.tumAttrListeEkleInto(_e); return _e.liste }
	get sahalar() { const result = []; for (const saha of this.sahalarIter()) result.push(saha); return result }
	get degiskenSahalar() { const result = []; for (const saha of this.degiskenSahalarIter()) result.push(saha); return result }
	get attrListesi() { const _e = { liste: [] }; this.attrListeEkleInto(_e); return _e.liste }
	
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, {									/* detaylar ==>		    RRSahaOrtak veya RROzelIslem */
			ustBilgi: {}, altBilgi: {},
			gruplamalar: e.gruplamalar ?? [],				/* RRGrup */
			frXMLStr: e.frXMLStr || null, frOzelAttrListe: e.frOzelAttrListe ?? []
		})
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, { raporAdi: new PInstStr('aciklama'), ekAciklama: new PInstStr('ekaciklama'), raporGrup: new PInstStr('raporgrup') })
	}
	static ekCSSDuzenle(e) {
		e = e || {}; super.ekCSSDuzenle(e);
		const {rec, result} = e;
		if (asBool(rec.frvarmi)) result.push('rapor-frVar')
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {aliasVeNokta} = this, {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'aciklama', text: 'Rapor Adı',  minWidth: Math.min(200, asInteger($(window).width() / 4)), width: Math.min(600, asInteger($(window).width() / 2)) }),
			new GridKolon({ belirtec: 'ekaciklama', text: 'Ek Açıklama', minWidth: Math.min(200, asInteger($(window).width() / 4)), width: Math.min(600, asInteger($(window).width() / 2)) }),
			new GridKolon({ belirtec: 'frvarmi', text: 'FR', width: 80 }).tipBool(),
			new GridKolon({ belirtec: 'raporgrup', text: 'Grup', width: 120 })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {aliasVeNokta} = this, {sent, stm} = e;
		sent.sahalar.add(`${aliasVeNokta}raporgrup`);
		stm.orderBy.liste = [`${aliasVeNokta}raporgrup`, `${aliasVeNokta}aciklama`, `${aliasVeNokta}ekaciklama`]
	}
	async detaylariYukleSonrasi(e) {
		await super.detaylariYukleSonrasi(e); const {detaylar, gruplamalar} = this;
		while (true) {
			const kirInd = detaylar.findIndex(det => det.class.kirilmami);
			if (kirInd < 0) break
			const gruplama = new RRGrup(), altDetaylar = detaylar.splice(0, kirInd);		// silerek al
			gruplama.addDetaylar(altDetaylar); detaylar.splice(0, 1); gruplamalar.push(gruplama)
		}
		await this.frXMLYukle(e); return true
	}
	async kaydetSonrasiIslemler(e) { await super.kaydetSonrasiIslemler(e); await this.frXMLKaydet(e); }
	async frXMLYukle(e) {
		const {sayac} = this, wh = { degerAta: sayac, saha: 'sayac' };
		let stm = new MQStm({ sent: new MQSent({ from: 'rstdraporfrxml', where: wh, sahalar: 'xsubstr' }), orderBy: 'seq' });
		let recs = await app.sqlExecSelect(stm); let data = '';
		for (const rec of recs) data += (rec.xsubstr || '').trimEnd()
		if (data) data = Base64.decode(data); this.frXMLStr = data || null;
		stm = new MQStm({ sent: new MQSent({ from: 'rstdraporozelattr', where: wh, sahalar: 'fr2ozelattr' }), orderBy: 'seq' });
		recs = await app.sqlExecSelect(stm); let frOzelAttrListe = this.frOzelAttrListe = [];
		for (const rec of recs) frOzelAttrListe.push(rec.fr2ozelattr)
		return true
	}
	async frXMLKaydet(e) {
		const DataMaxLength = 4999;
		const {sayac} = this, hvListe = [];
		let data = this.frXMLStr; if (data) data = Base64.encode(data);
		while (data) {
			const part = data.slice(0, DataMaxLength); data = data.substring(DataMaxLength);
			if (!part) break; hvListe.push({ sayac, /* dettip: '??', */ xsubstr: part })
		} if (!hvListe.length) return
		const table = 'rstdraporfrxml', toplu = new MQToplu([
			new MQIliskiliDelete({ from: table, where: new MQWhereClause({ degerAta: sayac, saha: 'sayac' }) }),
			new MQInsert({ table, hvListe })
		]).withDefTrn(); await app.sqlExecNone(toplu);
	}
	tumAttrListeEkleInto(e) {
		const {liste} = e, set = e.set = asSet(liste);
		for (const saha of this.tumDegiskenSahalarIter()) { const {attr} = saha; if (!set[attr]) { set[attr] = true; liste.push(attr) } }
		this.attrListeEkleDevamOrtak(e); return this
	}
	attrListeEkleInto(e) {
		const {liste} = e, set = e.set = asSet(liste);
		for (const saha of this.degiskenSahalarIter()) { const {attr} = saha; if (!set[attr]) { set[attr] = true; liste.push(attr) } }
		this.attrListeEkleDevamOrtak(e); return this
	}
	attrListeEkleDevamOrtak(e) {
		const {frOzelAttrListe} = this;
		if (!$.isEmptyObject(frOzelAttrListe)) {
			const {set, liste} = e;
			for (const attr of frOzelAttrListe) { if (!set[attr]) { set[attr] = true; liste.push(attr) } }
		}
	}
	detayEkIslemler(e) {
		if (this._detayEkIslemlerYapildimi) return
		const {raporcu} = e; if (!raporcu) return; const {attr2Kolon} = raporcu;
		for (const saha of this.tumDegiskenSahalarIter()) {
			const {attr} = saha, def = attr2Kolon[attr];
			if (!def) continue
			for (const key of ['tip', 'sql', 'sifirGostermeFlag', 'wordWrapFlag']) {
				const value = def[key]; if (value !== undefined) saha[key] = value
			}
		}
		this._detayEkIslemlerYapildimi = true
	}
	static detaySinifFor(e) {
		let {rec} = e, tip = (e.detTip ?? rec?.dettip)?.trim();
		return tip == 'AT' || tip == 'SS' ? RROzelIslem : ( RRaporDetay.tip2Sinif[tip] ??  super.detaySinifFor(e) )
	}
	*tumSahalarIter() {
		const tumSahalar = [];
		for (const rGrup of this.gruplamalar) { for (const saha of rGrup.detaylar) yield saha }
		for (const saha of this.detaylar) yield saha
	}
	*tumDegiskenSahalarIter() { for (const saha of this.tumSahalarIter()) { if (saha.class.degiskenmi) yield saha } }
	*sahalarIter() { const tumSahalar = []; for (const saha of this.detaylar) yield saha }
	*degiskenSahalarIter() {
		for (const saha of this.sahalarIter()) { if (saha.class.degiskenmi) yield saha }
	}
}


class RRGrup extends DetayliYapi {
	constructor(e) {
		e = e || {};
		super(e);
	}

	attrListeEkleInto(e) {
		const {liste} = e;
		for (const det of this.detaylar) {
			if (det.class.degiskenmi)
				liste.push(det.attr)
		}
	}
}

