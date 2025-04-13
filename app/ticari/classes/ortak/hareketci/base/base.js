class Hareketci extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get uygunmu() { return true } static get oncelik() { return 99 }
	static get kod() { return null } static get aciklama() { return null } static get araSeviyemi() { return this == Hareketci }
	static get donemselIslemlerIcinUygunmu() { return true } static get eldekiVarliklarIcinUygunmu() { return this.donemselIslemlerIcinUygunmu }
	static get kod2Sinif() {
		let {_kod2Sinif: result} = this; if (result == null) {
			result = {}; const {subClasses} = this;
			for (const cls of subClasses) {
				let {uygunmu, araSeviyemi, kod} = cls;
				if (uygunmu && !araSeviyemi && kod) { result[kod] = cls }
			}
			this._kod2Sinif = result
		}
		return result
	}
	static get anaTipTekSecim() { let {anaTipKAListe: kaListe} = this; return new TekSecim({ kaListe }) }
	static get anaTipKAListe() {
		let cacheSelector = '_anaTipKAListe', result = this[cacheSelector];
		if (result == null) {
			let {kod2Sinif} = this; result = this[cacheSelector] = [];
			for (let [kod, cls] of Object.entries(kod2Sinif)) { result.push(new CKodAdiVeEkBilgi({ kod, aciklama: cls.aciklama, ekBilgi: cls })) }
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
	static get mstYapi() {
		let {_mstYapi: result} = this;
		if (result == null) {
			let e = { result: new Hareketci_MstYapi() }; this.mstYapiDuzenle(e);
			result = this._mstYapi = e.result
		}
		return result
	}
	get uygunluk2UnionBilgiListe() {
		let {uygunluk} = this, {zorunluAttrSet} = this.class, e;
		this.uygunluk2UnionBilgiListeDuzenle(e = { uygunluk, zorunluAttrSet, liste: {} });
		let {liste} = e; this.uniBilgiAllHVFix({ liste });
		return liste
	}
	/*get uygunluk2UnionBilgiListe() {
		let {_uygunluk2UnionBilgiListe: result} = this, e;
		if (result == null) {
			const {uygunluk} = this, {zorunluAttrSet} = this.class;
			this.uygunluk2UnionBilgiListeDuzenle(e = { uygunluk, zorunluAttrSet, liste: {} });
			let {liste} = e; this.uniBilgiAllHVFix({ liste }); result = this._uygunluk2UnionBilgiListe = liste
		}
		return result
	}*/
	static get varsayilanHV() {
		let {_varsayilanHV: result} = this, e;
		if (result == null) {
			let hv = {}, e = { hv, ...Hareketci_UniBilgi.ortakArgs };
			this.varsayilanHVDuzenle_ortak(e); this.varsayilanHVDuzenle(e);
			result = this._varsayilanHV = hv = e.hv
		}
		return result
	}
	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			_attrSet: e.attrListe ?? e.attrSet, _uygunluk: e.uygunluk, whereYapi: e.whereYapi ?? {}, ekDuzenleyiciler: e.ekDuzenleyiciler ?? e.ekDuzenleyici ?? {},
			sonIslem: e.sonIslem ?? (e => this.defaultSonIslem(e)), gereksizTablolariSilFlag: e.gereksizTablolariSil ?? e.gereksizTablolariSilFlag ?? false
		});
		let {whereYapi} = this; for (const key of ['master', 'hareket']) {
			let value = e[key]; if (value !== undefined) { whereYapi[key] = value } }
	}
	static getClass(e) { const kod = typeof e == 'object' ? (e.kod ?? e.tip) : e; return this.kod2Sinif[kod] }
	/*static altTipYapilarDuzenle(e) {
		let {result} = e;
		e.def = result[''] = new DRapor_AltTipYapi()
	}*/
	static getAltTipAdiVeOncelikClause({ hv }) {
		return ({ adi: this.aciklama.sqlServerDegeri(), oncelik: '0', yon: `'sol'` })
	}
	static mstYapiDuzenle(e) { }
	static hareketTipSecim_kaListeDuzenle(e) {
		e.hareketci = this; if (!this.uygunmu) { return }
		for (const ext of this.getExtIter()) { ext.hareketTipSecim_kaListeDuzenle(e) }
	}
	uniOrtakSonIslem({ sender, hv, sent, sqlNull, sqlEmpty }) {
		if (sender?.finansalAnalizmi) {
			let {finanalizkullanilmaz: finAnalizKullanimClause} = hv, {where: wh, sahalar} = sent;
			if (finAnalizKullanimClause == sqlEmpty || finAnalizKullanimClause == sqlNull) { finAnalizKullanimClause = null }
			if (finAnalizKullanimClause) { wh.degerAta('', finAnalizKullanimClause) }    /* ''(false) = kullanılır,  '*'(true) = kullanılMAZ */
			let {adi: altTipAdiClause, oncelik: oncelikClause, yon: yonClause} = this.class.getAltTipAdiVeOncelikClause({ hv }) ?? {};
			sahalar.add(`${altTipAdiClause} alttipadi`, `${oncelikClause} alttiponcelik`, `${yonClause} yon`)
			/*let {from, where: wh} = sent, digerHarmi = from.aliasIcinTable('har')?.deger == 'csdigerhar';
			wh.degerAta('', `ctip.finanaliztipi`)*/
		}
	}
	static varsayilanHVDuzenle_ortak({ hv, sqlNull, sqlEmpty }) {
		for (const key of [
			'finanalizkullanilmaz', 'ayadi', 'saat', 'unionayrim', 'iceriktipi',
			'anaislemadi', 'islemkod', 'islemadi', 'dvkod']
		) { hv[key] = sqlEmpty }
	}
	static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
		/* cast(null as ??) değerlerini sadece NULL olarak tutabiliriz, CAST işlemine gerek yok */
		for (const key of ['vade', 'reftarih']) { hv[key] = sqlNull }
		for (const key of [
			'refsubekod', 'refkod', 'refadi', 'plasiyerkod', 'plasiyeradi', 'fistipi', 'fisektipi', 'must', 'ticmust', 'asilmust', 'althesapkod', 'althesapadi',
			'kdetay', 'takipno', 'aciklama', 'ekaciklama', 'odgunkod', 'iade', 'dovizsanalmi', 'belgetipi',
			'portftipi', 'portfkod', 'portfadi', 'portfkisatiptext', 'refportftipi', 'refportfkod', 'refportfadi', 'refportfkisatiptext'
		]) { hv[key] = sqlEmpty }
		for (const key of [ 'yilay', 'yilhafta', 'haftano', 'oncelik', 'seq', 'belgeno', 'noyil', 'dvkur' ]) { hv[key] = sqlZero }
		$.extend(hv, {
			fissayac: 'fis.kaysayac', kaysayac: 'har.kaysayac', ozelisaret: 'fis.ozelisaret', bizsubekod: 'fis.bizsubekod', tarih: 'fis.tarih',
			seri: 'fis.seri', fisno: 'fis.no', fisnox: 'fis.fisnox', disfisnox: 'fis.fisnox', ba: 'fis.ba', bedel: 'har.bedel', dvbedel: 'har.dvbedel',
			fisaciklama: 'fis.aciklama', detaciklama: 'har.aciklama', muhfissayac: 'fis.muhfissayac', sonzamants: 'fis.sonzamants',
			karsiodemetarihi: ({ hv }) => hv.vade, isaretlibedel: ({ hv }) => hv.bedel
		})
	}
	uygunluk2UnionBilgiListeDuzenle(e) { if (this.class.uygunmu) { this.uygunluk2UnionBilgiListeDuzenleDevam(e) } }
	uygunluk2UnionBilgiListeDuzenleDevam(e) { e.hareketci = this; for (const ext of this.getExtIter()) { ext.uygunluk2UnionBilgiListeDuzenle(e) } }
	uniBilgiAllHVFix(e) {
		let liste = e.liste ?? e.uygunluk2UnionBilgiListe ?? this.uygunluk2UnionBilgiListe ?? [], {varsayilanHV: defHV} = this.class;
		if (!$.isArray(liste)) { liste = Object.values(liste) }
		liste = liste.flat().map(item => getFuncValue.call(this, item, e)).filter(x => !!x);
		let allKeys = {}; for (let {hv} of liste) { $.extend(allKeys, asSet(Object.keys(hv))) }
		for (let {hv: _hv} of liste) {
			let hv = liste.hv = {};
			for (let key in allKeys) {
				let value = _hv[key] ?? defHV[key] ?? 'NULL';
				hv[key] = value
			}
		}
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
		this.uniDuzenle(_e = { ...e, uni, ...Hareketci_UniBilgi.ortakArgs }); return uni
	}
	uniDuzenle(e) {
		let {uygunluk2UnionBilgiListe, attrSet} = this, {varsayilanHV: defHV, zorunluAttrSet} = this.class;
		if ($.isEmptyObject(attrSet)) { attrSet = null }
		let {uygunluk} = this, uygunlukVarmi = !$.isEmptyObject(uygunluk);
		if (!uygunlukVarmi) {
			let {hareketTipSecim} = this.class; uygunlukVarmi = !$.isEmptyObject(hareketTipSecim.kaListe);
			if (uygunlukVarmi) { uygunluk = asSet(hareketTipSecim.kaListe.map(({ kod }) => kod)) }
		}
		let sender = this, hareketci = this, {uni} = e; $.extend(e, { uygunluk, zorunluAttrSet });
		for (let [selectorStr, unionBilgiListe] of Object.entries(uygunluk2UnionBilgiListe)) {
			let uygunmu = true; if (uygunlukVarmi) {
				let keys = selectorStr.split('$').filter(x => !!x);
				uygunmu = !!keys.find(key => uygunluk[key]); if (!uygunmu) { continue }
			}
			unionBilgiListe = unionBilgiListe.map(item =>
				getFuncValue.call(this, item, e)).filter(({ sent, hv }) => sent && !$.isEmptyObject(hv));
			let tumHVKeys = { ...zorunluAttrSet, ...defHV };
			for (let {hv} of unionBilgiListe) { $.extend(tumHVKeys, hv) }
			for (let uniBilgi of unionBilgiListe) {
				let {sent, hv} = uniBilgi, _e = { ...e, sent, hv };
				if (hv) {
					sent = _e.sent = sent.deepCopy();
					for (let alias in tumHVKeys) {
						if (attrSet && !attrSet[alias]) { continue }
						let deger = hv[alias] || defHV[alias];
						if (isFunction(deger)) { deger = deger?.call(this, { ...e, sender, hareketci, uniBilgi, key: alias, sent, hv, defHV }) }
						deger = deger ?? 'NULL';
						let saha = deger; if (alias) { saha += ` ${alias}` }
						sent.add(saha)
					}
				}
				_e.hv = { ...defHV, ..._e.hv }; this.uniDuzenle_tumSonIslemler(_e); sent = _e.sent;
				sent.groupByOlustur().gereksizTablolariSil();
				if (sent?.sahalar?.liste?.length) { uni.add(sent) }
			}
		}
	}
	uniDuzenle_tumSonIslemler(e) {    /* degerci bosGcbEkle value: sent. degerci koopDonemEkle value: sent. degerci sonIslem value: sent */
		return this.uniDuzenle_whereYapi(e).uniDuzenle_ekDuzenleyiciler(e).uniDuzenle_sonIslem(e)
	}
	uniDuzenle_whereYapi(e) {
		let {whereYapi: handlers} = this; if (handlers) {
			let _e = { ...e, hareketci: this }, {sent} = e; if (sent) { _e.where = sent.where }
			for (let key in handlers) {
				let handler = handlers[key];
				if (handler) { getFuncValue.call(this, handler, _e) }
			}
		}
		return this
	}
	uniDuzenle_ekDuzenleyiciler(e) {
		let {ekDuzenleyiciler: handlers} = this; if (handlers) {
			let _e = { ...e, hareketci: this }, {sent} = e; if (sent) { _e.where = sent.where }
			for (let key in handlers) {
				let handler = handlers[key];
				if (handler) { getFuncValue.call(this, handler, _e) }
			}
		}
		return this
	}
	uniDuzenle_sonIslem(e) {
		let {sonIslem: handler} = this; if (handler) {
			let _e = { ...e, hareketci: this }, {sent} = e; if (sent) { _e.where = sent.where }
			getFuncValue.call(this, handler, _e)
		}
		return this
	}
	sentSahaEkleyici(e) {
		const {sent, sql, alias, attr2Deger} = e, {attrSet} = this;
		let saha = alias ? new MQAliasliYapi({ alias, deger: sql }) : MQAliasliYapi.newForSahaText(sql);
		let {alias: sahaAlias} = saha; if (!attrSet || attrSet[sahaAlias]) { sent.add(saha) }
		attr2Deger[sahaAlias] = saha.deger; return this
	}
	withAttrs(...items) { this.attrSet = asSet(items.flat()); return this }
	setWhereDuzenleyiciler(value) { this.whereYapi = value; return this }
	addWhereDuzenleyici(key, value) { key = key ?? newGUID(); this.whereYapi[key] = value; return this }
	clearWhereDuzenleyici() { this.whereYapi = {}; return this }
	setEkDuzenleyiciler(value) { this.ekDuzenleyiciler = value; return this }
	addEkDuzenleyici(key, value) { key = key ?? newGUID(); this.ekDuzenleyiciler[key] = value; return this }
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