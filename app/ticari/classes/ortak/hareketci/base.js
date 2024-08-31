class Hareketci extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return null } static get aciklama() { return null } static get araSeviyemi() { return this == Hareketci }
	static get kod2Sinif() {
		let result = this._kod2Sinif; if (result == null) {
			result = {}; const {subClasses} = this; for (const cls of subClasses) { const {araSeviyemi, kod} = cls; if (!araSeviyemi && kod) { result[kod] = cls } }
			this._kod2Sinif = result
		}
		return result
   }
	static get hareketTipSecim() {
		let cacheSelector = '_hareketTipTekSecim', result = this[cacheSelector];
		if (result === undefined) { result = this[cacheSelector] = this.hareketTipSecimInternal } return result
	}
	static get hareketTipSecimInternal() { let cls = this.hareketTipSecimSinif; return cls ? new cls() : null }
	static get hareketTipSecimSinif() {
		const $this = this; return class extends TekSecim {
			kaListeDuzenle(e) {
				super.kaListeDuzenle(e); const _e = { ...e, kaListe: [] }; $this.hareketTipSecim_kaListeDuzenle(_e);
				const {kaListe} = e; if (kaListe) { this.kaListe = kaListe.filter(ka => !!ka) }
			}
		}
	}
	static get defaultAttrSet() {
		let result = this._defaultAttrSet; if (result === undefined) {
			let {varsayilanHV, uygunluk2UnionBilgiListe} = this; result = asSet(Object.keys(varsayilanHV));
			for (const uniBilgi of Object.values(uygunluk2UnionBilgiListe)) {
				const hv = uniBilgi?.hv; if (hv) {
					for (const key in hv) { if (!result[key]) { result[key] = true } } }
			}
			this._defaultAttrSet = result
		}
		return result
	}
	get attrSet() {
		let result = this._attrSet; if (result == null) { result = this._attrSet = { ...this.class.defaultAttrSet } }
		if ($.isArray(result)) { result = this.attrSet = asSet(result) }
		return result
	}
	set attrSet(value) { this._attrSet = value }
	get uygunluk() {
		let result = this._uygunluk; if (result == null) { result = this.class.hareketTipSecim }
		if (!(result.class?.birKismimi ?? result.birKismimi)) { result = this._uygunluk = new SecimBirKismi({ tekSecim: result }) }
		return result
	}
	set uygunluk(value) { this._uygunluk = value }
	static get varsayilanHV() {
		let result = this._varsayilanHV;
		if (result == null) { let e = { hv: {} }; this.varsayilanHVDuzenle(e); result = this._varsayilanHV = e.hv }
		return result
	}
	static get uygunluk2UnionBilgiListe() {
		let result = this._uygunluk2UnionBilgiListe;
		if (result == null) { let e = { liste: {} }; this.uygunluk2UnionBilgiListeDuzenle(e); result = this._uygunluk2UnionBilgiListe = e.liste }
		return result
	}

	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			_attrSet: e.attrListe ?? e.attrSet, _uygunluk: e.uygunluk, whereYapi: e.whereYapi ?? {}, ekDuzenleyiciler: e.ekDuzenleyiciler ?? e.ekDuzenleyici ?? {},
			sonIslem: e.sonIslem ?? (e => this.defaultSonIslem(e)), gereksizTablolariSilFlag: e.gereksizTablolariSil ?? e.gereksizTablolariSilFlag ?? false
		});
		const {whereYapi} = this; for (const key of ['master', 'hareket']) { const value = e[key]; if (value !== undefined) { whereYapi[key] = value } }
	}
	static getClass(e) { const kod = typeof e == 'object' ? (e.kod ?? e.tip) : e; return this.kod2Sinif[kod] }
	static hareketTipSecim_kaListeDuzenle(e) { } static varsayilanHVDuzenle(e) { }
	static uygunluk2UnionBilgiListeDuzenle(e) { this.uygunluk2UnionBilgiListeDuzenleDevam(e) } static uygunluk2UnionBilgiListeDuzenleDevam(e) { }
	defaultSonIslem(e) { }
	uniOlustur(e) { e = e || {}; const uni = new MQUnionAll(), _e = { ...e, uni }; this.uniDuzenle(_e); return uni }
	uniDuzenle(e) {
		e = e || {}; $.extend(e, {
			...e, sqlEmpty: `''`, ekleyici: (e, ...items) => { for (const item of items) { let sql = item[0], alias = item[1]; this.sentSahaEkleyici({ ...e, sql, alias }) } }
		}); return this.uniDuzenleDevam(e)
	}
	uniDuzenleDevam(e) {
		const {uygunluk2UnionBilgiListe, varsayilanHV} = this.class, {uygunluk} = this, {uni} = e, uygunlukVarmi = uygunluk.bosDegilmi;
		for (const [selector, unionBilgiListe] of Object.entries(uygunluk2UnionBilgiListe)) {
			if (uygunlukVarmi && !uygunluk[selector]) { continue }
			for (const uniBilgi of unionBilgiListe) {
				let sent = uniBilgi?.sent; if (!sent) { continue }
				let {hv} = uniBilgi, _e = { ...e, sent, hv }; if (hv) {
					sent = _e.sent = sent.deepCopy();
					let {attrSet} = this; for (const alias in attrSet) {
						let deger = hv[alias] || varsayilanHV[alias]; if (!deger) { continue }
						/*let saha = alias ? new MQAliasliYapi({ alias, deger }) : MQAliasliYapi.newForSahaText(deger);*/
						let saha = deger; if (alias) { saha += ` ${alias}` } sent.add(saha)
					}
				}
				if (!sent?.sahalar?.liste?.length) { continue }
				this.uniDuzenle_whereYapi(_e).uniDuzenle_sonIslem(_e); sent = _e.sent;
				sent.groupByOlustur().gereksizTablolariSil(); uni.add(sent)
			}
		}
	}
	uniOrtakSonIslem(e) { /* degerci #sonIslem method içeriği */ }
	uniDuzenle_tumSonIslemler(e) {
			/* degerci bosGcbEkle value: sent. degerci koopDonemEkle value: sent. degerci sonIslem value: sent */
		return this.uniDuzenle_whereYapi(e).uniDuzenle_ekDuzenleyiciler(e).uniDuzenle_sonIslem(e)
	}
	uniDuzenle_whereYapi(e) { const {whereYapi} = this; if (whereYapi) { for (const key in whereYapi) { const handler = whereYapi[e]; getFuncValue.call(this, handler, e) } } return this }
	uniDuzenle_ekDuzenleyiciler(e) { const {ekDuzenleyiciler} = this; if (ekDuzenleyiciler) { for (const key in ekDuzenleyiciler) { const handler = key2Handlers[e]; getFuncValue.call(this, handler, e) } } return this }
	uniDuzenle_sonIslem(e) { const {sonIslem} = this; if (sonIslem) { getFuncValue.call(this, sonIslem, e) } return this }
	sentSahaEkleyici(e) {
		const {sent, sql, alias, attr2Deger} = e, {attrSet} = this;
		let saha = alias ? new MQAliasliYapi({ alias, deger: sql }) : MQAliasliYapi.newForSahaText(sql), sahaAlias = saha.alias;
		if (!attrSet || attrSet[sahaAlias]) { sent.add(saha) } attr2Deger[sahaAlias] = saha.deger; return this
	}
	withAttrs(...items) { this.attrSet = items.flat(); return this }
	setWhereDuzenleyiciler(value) { this.whereYapi = value; return this }
	addWhereDuzenleyici(key, value) { key = key ?? newGUID(); this.whereYapi[key] = value; return this }
	clearWhereDuzenleyici() { this.whereYapi = {}; return this }
	setEkDuzenleyiciler(value) { this.ekDuzenleyiciler = value; return this }
	addEkDuzenleyiciler(key, value) { key = key ?? newGUID(); this.ekDuzenleyiciler[key] = value; return this }
	clearEkDuzenleyiciler() { this.ekDuzenleyiciler = {}; return this }
	setSonIslem(value) { this.sonIslem = sonIslem; return this }
	clearSonIslem(value) { this.sonIslem = null; return this }
	setWHD_master(value) { this.whereYapi.master = value; return this } setWHD_hareket(value) { this.whereYapi.hareket = value; return this } setUygunluk(value) { this.uygunluk = value; return this }
	gereksizTablolariSil() { this.gereksizTablolariSilFlag = true; return this } gereksizTablolariSilme() { this.gereksizTablolariSilFlag = false; return this }
}

/*
		== ORNEK CAGIRIM ==
	let queryYapi = new CariHareketci().gereksizTablolariSil().withAttrs('kaysayac', 'fisno', 'fistipi', 'must', 'althesapadi', 'tarih', 'vade', 'seri', 'noyil', 'no', 'bedel')
		.setWHD_master(e => { const {wh, attr2Deger} = e; wh.degerAta('C1', attr2Deger.asilmust) })
		.setWHD_hareket(e => { const {wh, attr2Deger} = e; wh.basiSonu({ basi: today().yilBasi(), sonu: today() }, attr2Deger.tarih) })
		.uniOlustur().getQueryYapi();
	let recs; try { recs = queryYapi?.query ? await app.sqlExecSelect(queryYapi) : [] } catch (ex) { console.error(getErrorText(ex)) }
	if (recs) {
		console.table(recs); let rec = recs[0], source = e => recs;
		let tabloKolonlari = rec ? Object.keys(rec).map(belirtec => {
			let colDef = new GridKolon({ belirtec, text: belirtec }); if (typeof rec[belirtec] == 'number') { colDef.tipDecimal() } return colDef }) : null;
		new MasterListePart({ tabloKolonlari, source }).run()
	}
	recs
*/