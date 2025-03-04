class Hareketci extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get uygunmu() { return true }
	static get kod() { return null } static get aciklama() { return null } static get araSeviyemi() { return this == Hareketci }
	static get kod2Sinif() {
		let {_kod2Sinif: result} = this; if (result == null) {
			result = {}; const {subClasses} = this;
			for (const {araSeviyemi, kod} of subClasses) { if (!araSeviyemi && kod) { result[kod] = cls } }
			this._kod2Sinif = result
		}
		return result
   }
	static get hareketTipSecim() {
		let cacheSelector = '_hareketTipSecim', result = this[cacheSelector];
		if (result === undefined) { result = this[cacheSelector] = this.hareketTipSecimInternal } return result
	}
	static get hareketTipSecimInternal() { let cls = this.hareketTipSecimSinif; return cls ? new cls() : null }
	static get hareketTipSecimSinif() {
		const $this = this; return class extends TekSecim {
			kaListeDuzenle(e) {
				super.kaListeDuzenle(e); let _e = { ...e, kaListe: [] }; $this.hareketTipSecim_kaListeDuzenle(_e);
				let {kaListe} = _e; if (kaListe) { this.kaListe = kaListe = kaListe.filter(ka => !!ka) }
			}
		}
	}
	get defaultAttrSet() {
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
	static get zorunluAttrSet() {
		let {_zorunluAttrSet: result} = this;
		if (result == null) { result = this._zorunluAttrSet = asSet(['oncelik', 'seq']) }
		return result
	}
	get attrSet() {
		let {_attrSet: result} = this; if (result == null) { result = this._attrSet = { ...this.defaultAttrSet } }
		if ($.isArray(result)) { result = this.attrSet = asSet(result) }
		return result
	}
	set attrSet(value) { if ($.isArray(value)) { value = asSet(value) } this._attrSet = value }
	get uygunluk() {
		let {_uygunluk: result} = this; if (result == null) { result = asSet(this.class.hareketTipSecim?.kaListe.map(ka => ka.kod)) }
		result = result?.value ?? result; if ($.isArray(result)) { result = asSet(result) }
		return result
	}
	set uygunluk(value) { this._uygunluk = value }
	static get extListe() { let result = this._extListe; if (result == null) { let e = { liste: [] }; this.extListeDuzenle(e); result = this._extListe = e.liste } return result }
	static set extListe(value) { this._extListe = value }
	get uygunluk2UnionBilgiListe() {
		let {_uygunluk2UnionBilgiListe: result} = this, e;
		if (result == null) {
			const {uygunluk} = this, {zorunluAttrSet} = this.class;
			this.uygunluk2UnionBilgiListeDuzenle(e = { uygunluk, zorunluAttrSet, liste: {} });
			let {liste} = e; this.uniBilgiAllHVFix({ liste }); result = this._uygunluk2UnionBilgiListe = liste
		}
		return result
	}
	static get varsayilanHV() {
		let {_varsayilanHV: result} = this, e;
		if (result == null) { this.varsayilanHVDuzenle(e = { hv: {} }); result = this._varsayilanHV = e.hv }
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
	static hareketTipSecim_kaListeDuzenle(e) {
		e.hareketci = this; if (!this.uygunmu) { return }
		for (const ext of this.getExtIter()) { ext.hareketTipSecim_kaListeDuzenle(e) }
	}
	static varsayilanHVDuzenle(e) {
		const {hv} = e, /*sqlNull = 'NULL',*/ sqlEmpty = `''`, sqlNull = sqlEmpty, sqlZero = '0'; $.extend(e, { sqlNull, sqlEmpty, sqlZero });
		/* cast(null as ??) değerlerini sadece NULL olarak tutabiliriz, CAST işlemine gerek yok */
		for (const key of ['vade', 'reftarih']) { hv[key] = sqlNull }
		for (const key of [
			'ayadi', 'saat', 'unionayrim', 'iceriktipi', 'anaislemadi', 'islemkod', 'islemadi', 'refsubekod', 'refkod', 'refadi',
			'plasiyerkod', 'plasiyeradi', 'fistipi', 'fisektipi', 'must', 'ticmust', 'asilmust', 'althesapkod', 'althesapadi',
			'kdetay', 'takipno', 'aciklama', 'ekaciklama', 'odgunkod', 'iade', 'dovizsanalmi', 'dvkod'
		]) { hv[key] = sqlEmpty }
		for (const key of [ 'yilay', 'yilhafta', 'haftano', 'oncelik', 'seq', 'belgeno', 'noyil', 'dvkur' ]) { hv[key] = sqlZero }
		$.extend(hv, {
			fissayac: 'fis.kaysayac', kaysayac: 'har.kaysayac', ozelisaret: 'fis.ozelisaret', bizsubekod: 'fis.bizsubekod', tarih: 'fis.tarih',
			seri: 'fis.seri', fisno: 'fis.no', fisnox: 'fis.fisnox', disfisnox: 'fis.fisnox', ba: 'fis.ba', bedel: 'har.bedel', dvbedel: 'har.dvbedel',
			fisaciklama: 'fis.aciklama', detaciklama: 'har.aciklama',
			muhfissayac: 'fis.muhfissayac', sonzamants: 'fis.sonzamants', karsiodemetarihi: ({ hv }) => hv.vade
		})
	}
	uygunluk2UnionBilgiListeDuzenle(e) { if (this.class.uygunmu) { this.uygunluk2UnionBilgiListeDuzenleDevam(e) } }
	uygunluk2UnionBilgiListeDuzenleDevam(e) { e.hareketci = this; for (const ext of this.getExtIter()) { ext.uygunluk2UnionBilgiListeDuzenle(e) } }
	uniBilgiAllHVFix(e) {
		let liste = e.liste ?? e.uygunluk2UnionBilgiListe ?? this.uygunluk2UnionBilgiListe ?? [], {varsayilanHV: defHV} = this.class;
		if (!$.isArray(liste)) { liste = Object.values(liste) }
		liste = liste.flat().map(item => getFuncValue.call(this, item, e)).filter(x => !!x);
		let allKeys = {}; for (let {hv} of liste) { $.extend(allKeys, asSet(Object.keys(hv))) }
		for (let {hv} of liste) { for (let key in allKeys) { let value = hv[key] ?? defHV[key]; if (value == null) { hv[key] = 'NULL' } } }
	}
	static extListeDuzenle(e) {
		const {liste} = e, {kod} = this; for (const modul of app.getModulIter()) {
			const extSinif = modul[`extSinif_hareketci_${kod}`];
			if (extSinif && extSinif.uygunmu !== false) { liste.push(extSinif) }
		}
	}
	static *getExtIter() { const {extListe} = this; if (extListe) { for (const ext of extListe) { yield ext } } }
	*getExtIter() { return this.class.getExtIter() }
	defaultSonIslem(e) { this.uniOrtakSonIslem(e) }
	stmOlustur(e) {
		e = e || {}; let _e, stm = new MQStm({ orderBy: ['oncelik'] });
		this.stmDuzenle(_e = { ...e, stm }); stm = _e.stm;
		let {sent: uni} = stm; if (uni.unionmu) { uni.liste = uni.liste.filter(sent => !!sent?.sahalar?.liste?.length) }
		return stm
	}
	stmDuzenle(e) { const uni = e.stm.sent = this.uniOlustur(e); return this.stmDuzenleDevam(e) }
	stmDuzenleDevam(e) { }
	uniOlustur(e) {
		e = e || {}; let _e, uni = new MQUnionAll();
		this.uniDuzenle(_e = { ...e, uni, sqlEmpty: `''` }); return uni
	}
	uniDuzenle(e) {
		const {uygunluk2UnionBilgiListe, varsayilanHV: defHV, zorunluAttrSet} = this.class, {uygunluk} = this, uygunlukVarmi = uygunluk.bosDegilmi, {uni} = e;
		const sender = this, hareketci = this; $.extend(e, { uygunluk, zorunluAttrSet });
		for (let [selectorStr, unionBilgiListe] of Object.entries(uygunluk2UnionBilgiListe)) {
			if (uygunlukVarmi) {
				let selectors = selectorStr.split('$').filter(x => !!x); uygunmu = selectors.find(selector => uygunluk[selector]);
				if (!uygunmu) { continue }
			}
			unionBilgiListe = unionBilgiListe.map(item => getFuncValue.call(this, item, e)).filter(x => !!x);
			for (const uniBilgi of unionBilgiListe) {
				let {sent} = uniBilgi; if (!sent) { continue }
				let {hv} = uniBilgi, _e = { ...e, sent, hv }; if (hv) {
					sent = _e.sent = sent.deepCopy(); for (const alias in { ...zorunluAttrSet }) {
						let deger = hv[alias] || defHV[alias];
						if (isFunction(deger)) { deger = deger?.call(this, { ...e, sender, hareketci, uniBilgi, key: alias, sent, hv, defHV }) }
						deger = deger ?? 'NULL'; let saha = deger; if (alias) { saha += ` ${alias}` }
						sent.add(saha)
					}
				}
				if (!sent?.sahalar?.liste?.length) { continue }
				this.uniDuzenle_whereYapi(_e).uniDuzenle_sonIslem(_e); sent = _e.sent;
				sent.groupByOlustur().gereksizTablolariSil(); uni.add(sent)
			}
		}
	}
	uniOrtakSonIslem(e) { /* degerci #sonIslem method içeriği */ }
	uniDuzenle_tumSonIslemler(e) {    /* degerci bosGcbEkle value: sent. degerci koopDonemEkle value: sent. degerci sonIslem value: sent */
		return this.uniDuzenle_whereYapi(e).uniDuzenle_ekDuzenleyiciler(e).uniDuzenle_sonIslem(e)
	}
	uniDuzenle_whereYapi(e) { const {whereYapi} = this; if (whereYapi) { for (const key in whereYapi) { const handler = whereYapi[e]; getFuncValue.call(this, handler, e) } } return this }
	uniDuzenle_ekDuzenleyiciler(e) { const {ekDuzenleyiciler} = this; if (ekDuzenleyiciler) { for (const key in ekDuzenleyiciler) { const handler = key2Handlers[e]; getFuncValue.call(this, handler, e) } } return this }
	uniDuzenle_sonIslem(e) { const {sonIslem} = this; if (sonIslem) { getFuncValue.call(this, sonIslem, e) } return this }
	sentSahaEkleyici(e) {
		const {sent, sql, alias, attr2Deger} = e, {attrSet} = this;
		let saha = alias ? new MQAliasliYapi({ alias, deger: sql }) : MQAliasliYapi.newForSahaText(sql);
		let {alias: sahaAlias} = saha; if (!attrSet || attrSet[sahaAlias]) { sent.add(saha) }
		attr2Deger[sahaAlias] = saha.deger; return this
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
	reset(e) { for (let key of ['_uygunluk2UnionBilgiListe', '_defaultAttrSet', '_zorunluAttrSet']) { delete this[key] } return this }
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