class Hareketci extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get uygunmu() { return true }
	static get oncelik() { return 99 } static get kisaKod() { return this.kod }
	static get kod() { return null } static get aciklama() { return null } static get araSeviyemi() { return this == Hareketci }
	static get maliTabloIcinUygunmu() { return true } static get donemselIslemlerIcinUygunmu() { return true }
	static get eldekiVarliklarIcinUygunmu() { return this.donemselIslemlerIcinUygunmu }
	static get finAnaliz_baIcinTersIslemYapilirmi() { return true }
	static get defaultYon() { return 'sol' }
	static get kod2Sinif() {
		let {_kod2Sinif: result} = this; if (result == null) {
			result = {}; let {subClasses} = this;
			for (let cls of subClasses) {
				let {uygunmu, araSeviyemi, kod} = cls;
				if (uygunmu && !araSeviyemi && kod) { result[kod] = cls }
			}
			this._kod2Sinif = result
		}
		return result
	}
	static get anaTipTekSecim() {
		let {anaTipKAListe: kaListe} = this
		return new TekSecim({ kaListe })
	}
	static get anaTipKAListe() {
		let cacheSelector = '_anaTipKAListe', result = this[cacheSelector]
		if (result == null) {
			let {kod2Sinif} = this; result = this[cacheSelector] = []
			for (let [kod, cls] of Object.entries(kod2Sinif))
				result.push(new CKodAdiVeEkBilgi({ kod, aciklama: cls.aciklama, ekBilgi: cls }))
		}
		return result
	}
	static get hareketTipSecim() {
		let cacheSelector = '_hareketTipSecim', result = this[cacheSelector];
		if (result === undefined) { result = this[cacheSelector] = this.hareketTipSecimInternal } return result
	}
	static get hareketTipSecimInternal() {
		let cls = this.hareketTipSecimSinif
		return cls ? new cls() : null
	}
	static get hareketTipSecimSinif() {
		let $this = this; return class extends TekSecim {
			kaListeDuzenle(e) {
				super.kaListeDuzenle(e); let _e = { ...e, kaListe: [] }
				$this.hareketTipSecim_kaListeDuzenle(_e); let {kaListe} = _e
				if (kaListe)
					this.kaListe = kaListe = kaListe.filter(ka => !!ka)
			}
		}
	}
	get defaultAttrSet() {
		let result = this._defaultAttrSet; if (result === undefined) {
			let {class: { varsayilanHV }, uygunluk2UnionBilgiListe} = this
			result = asSet(Object.keys(varsayilanHV));
			for (let uniBilgi of Object.values(uygunluk2UnionBilgiListe)) {
				let hv = uniBilgi?.hv; if (hv) {
					for (let key in hv) { if (!result[key]) { result[key] = true } } }
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
		let {_mstYapi: result} = this
		if (result == null) {
			let e = { result: new Hareketci_MstYapi() }
			this.mstYapiDuzenle(e)
			result = this._mstYapi = e.result
		}
		return result
	}
	get uygunluk2UnionBilgiListe() {
		let {uygunluk} = this, {zorunluAttrSet} = this.class, e
		this.uygunluk2UnionBilgiListeDuzenle(e = { uygunluk, zorunluAttrSet, liste: {} })
		let {liste} = e; this.uniBilgiAllHVFix({ liste })
		return liste
	}
	/*get uygunluk2UnionBilgiListe() {
		let {_uygunluk2UnionBilgiListe: result} = this, e;
		if (result == null) {
			let {uygunluk} = this, {zorunluAttrSet} = this.class;
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
		let {ekDuzenleyiciler, whereYapi} = this;
		this.ekDuzenleyiciler = e.ekDuzenleyiciler ?? [];
		for (let key of ['master', 'hareket']) {
			let value = e[key]
			if (value !== undefined) { whereYapi[key] = value }
		}
	}
	static getClass(e) { let kod = typeof e == 'object' ? (e.kod ?? e.tip) : e; return this.kod2Sinif[kod] }
	/*static altTipYapilarDuzenle(e) {
		let {result} = e;
		e.def = result[''] = new DRapor_AltTipYapi()
	}*/
	static getAltTipAdiVeOncelikClause({ hv, sqlEmpty }) {
		return {}
		/*return ({ adi: this.aciklama.sqlServerDegeri(), oncelik: '0', yon: this.defaultYon })*/
	}
	static mstYapiDuzenle(e) { }
	static hareketTipSecim_kaListeDuzenle(e) {
		e.hareketci = this; if (!this.uygunmu) { return }
		for (let ext of this.getExtIter()) { ext.hareketTipSecim_kaListeDuzenle(e) }
	}
	static ilkIslemler(e) { }
	uniOrtakSonIslem({ sender, hv, sent, sent: { from, where: wh, sahalar }, secimler, det = {}, detSecimler = {}, donemTipi, sqlNull, sqlEmpty, sqlZero }) {
		let tbWhere = secimler?.getTBWhereClause(...arguments)
		if (tbWhere?.liste?.length)
			wh.birlestir(tbWhere)
		if (hv.bizsubekod && !from.aliasIcinTable('sub')) {
			sent.x2SubeBagla({ kodClause: hv.bizsubekod })
			if (!from.aliasIcinTable('igrp'))
				sent.sube2GrupBagla()
		}
		if (sender?.finansalAnalizmi) {
			let {finanalizkullanilmaz: finAnalizKullanimClause} = hv
			if (finAnalizKullanimClause == sqlEmpty || finAnalizKullanimClause == sqlNull) { finAnalizKullanimClause = null }
			if (finAnalizKullanimClause) { wh.degerAta('', finAnalizKullanimClause) }    /* ''(false) = kullanılır,  '*'(true) = kullanılMAZ */
			let {adi: altTipAdiClause, oncelik: altTipOncelikClause, yon: yonClause} = this.class.getAltTipAdiVeOncelikClause({ hv }) ?? {}
			altTipAdiClause = altTipAdiClause || (this.class.aciklama?.sqlServerDegeri() ?? sqlEmpty)
			altTipOncelikClause = altTipOncelikClause || sqlZero
			yonClause = yonClause || (this.class.defaultYon?.sqlServerDegeri() ?? sqlEmpty)
			sahalar.add(`${altTipAdiClause} alttipadi`, `${altTipOncelikClause} alttiponcelik`, `${yonClause} yon`)
		}
	}
	static varsayilanHVDuzenle_ortak({ hv, sqlNull, sqlEmpty, sqlZero }) {
		for (let key of [
			'finanalizkullanilmaz', 'ayadi', 'saat', 'unionayrim',
			'iceriktipi', 'islkod', 'isladi', 'anaislemadi', 'dvkod', 'ba'
		]) { hv[key] = sqlEmpty }
		for (let key of ['bedel'])
			hv[key] = sqlZero
	}
	static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
		/* cast(null as ??) değerlerini sadece NULL olarak tutabiliriz, CAST işlemine gerek yok */
		for (let key of ['vade', 'reftarih']) { hv[key] = sqlNull }
		for (let key of [
			'refsubekod', 'refkod', 'refadi', 'plasiyerkod', 'plasiyeradi', 'fistipi', 'fisektipi', 'must', 'ticmust', 'asilmust', 'althesapkod', 'althesapadi',
			'kdetay', 'takipno', 'aciklama', 'ekaciklama', 'odgunkod', 'iade', 'dovizsanalmi', 'belgetipi',
			'portftipi', 'portfkod', 'portfadi', 'portfkisatiptext', 'refportftipi', 'refportfkod', 'refportfadi', 'refportfkisatiptext'
		]) { hv[key] = sqlEmpty }
		for (let key of [ 'yilay', 'yilhafta', 'haftano', 'oncelik', 'seq', 'belgeno', 'noyil', 'dvkur' ]) { hv[key] = sqlZero }
		$.extend(hv, {
			fissayac: 'fis.kaysayac', kaysayac: 'har.kaysayac', ozelisaret: 'fis.ozelisaret', bizsubekod: 'fis.bizsubekod', tarih: 'fis.tarih',
			seri: 'fis.seri', fisno: 'fis.no', fisnox: 'fis.fisnox', disfisnox: 'fis.fisnox', ba: 'fis.ba', bedel: 'har.bedel', dvbedel: 'har.dvbedel',
			fisaciklama: 'fis.aciklama', detaciklama: 'har.aciklama', muhfissayac: 'fis.muhfissayac', sonzamants: 'fis.sonzamants',
			isladi: ({ hv }) => hv.islemadi || hv.anaislemadi, fistarih: ({ hv }) => hv.tarih,
			karsiodemetarihi: ({ hv }) => hv.vade, isaretlibedel: ({ hv }) => hv.bedel,
			aciklama: ({ hv }) => {
                let withCoalesce = clause => (clause?.sqlDoluDegermi ?? false) ? `COALESCE(${clause}, '')` : sqlEmpty;
                let {fisaciklama: fisAciklama, detaciklama: detAciklama} = hv;
                return fisAciklama && detAciklama
                    ? `${withCoalesce(fisAciklama)} + ' ' + ${withCoalesce(detAciklama)}` 
                    : withCoalesce(detAciklama || fisAciklama || sqlEmpty)
            }
		})
	}
	uygunluk2UnionBilgiListeDuzenle(e) { if (this.class.uygunmu) { this.uygunluk2UnionBilgiListeDuzenleDevam(e) } }
	uygunluk2UnionBilgiListeDuzenleDevam(e) { e.hareketci = this; for (let ext of this.getExtIter()) { ext.uygunluk2UnionBilgiListeDuzenle(e) } }
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
		let {liste} = e, {kod} = this; for (let modul of app.getModulIter()) {
			let extSinif = modul[`extSinif_hareketci_${kod}`];
			if (extSinif && extSinif.uygunmu !== false) { liste.push(extSinif) }
		}
	}
	static *getExtIter() { let {extListe} = this; if (extListe) { for (let ext of extListe) { yield ext } } }
	*getExtIter() { return this.class.getExtIter() }
	defaultSonIslem(e) { this.uniOrtakSonIslem(e) }
	stmOlustur(e) {
		e = e || {}; let _e, stm = new MQStm({ orderBy: ['tarih', 'oncelik'] });
		this.stmDuzenle(_e = { ...e, stm }); stm = _e.stm;
		let {sent: uni} = stm; if (uni.unionmu) { uni.liste = uni.liste.filter(sent => !!sent?.sahalar?.liste?.length) }
		return stm
	}
	stmDuzenle(e) { let uni = e.stm.sent = this.uniOlustur(e); return this.stmDuzenleDevam(e) }
	stmDuzenleDevam(e) { }
	uniOlustur(e) {
		e = e || {}; let _e, uni = new MQUnionAll();
		this.uniDuzenle(_e = { ...e, uni, ...Hareketci_UniBilgi.ortakArgs });
		return uni
	}
	uniDuzenle(e) {
		this.uniDuzenleOncesi(e)
		let {uygunluk2UnionBilgiListe, attrSet} = this, {varsayilanHV: defHV, zorunluAttrSet} = this.class
		let rapor = e.rapor ?? e.sender, secimler = e.secimler ?? rapor?.secimler;
		if (empty(attrSet)) { attrSet = null }
		let {uygunluk} = this, uygunlukVarmi = !empty(uygunluk);
		if (!uygunlukVarmi) {
			let {hareketTipSecim} = this.class; uygunlukVarmi = !empty(hareketTipSecim.kaListe)
			if (uygunlukVarmi)
				uygunluk = asSet(hareketTipSecim.kaListe.map(({ kod }) => kod))
		}
		let sender = this, hareketci = this, {uni, maliTablomu, sender: { finansalAnalizmi } = {}} = e
		$.extend(e, { uygunluk, zorunluAttrSet })
		for (let [selectorStr, unionBilgiListe] of Object.entries(uygunluk2UnionBilgiListe)) {
			let uygunmu = true; if (uygunlukVarmi) {
				let keys = selectorStr.split('$').filter(x => !!x);
				uygunmu = !!keys.find(key => uygunluk[key]); if (!uygunmu) { continue }
			}
			unionBilgiListe = unionBilgiListe.map(item =>
				getFuncValue.call(this, item, e)).filter(({ sent, hv }) => sent && !empty(hv));
			let tumHVKeys = { ...zorunluAttrSet, ...defHV };
			for (let {hv} of unionBilgiListe) { $.extend(tumHVKeys, hv) }
			for (let uniBilgi of unionBilgiListe) {
				let {sent, hv} = uniBilgi, _e = { ...e, sent, hv };
				if (hv) {
					sent = _e.sent = sent.deepCopy();
					for (let alias in tumHVKeys) {
						if (attrSet && !attrSet[alias])
							continue
						let deger = hv[alias] || defHV[alias];
						if (isFunction(deger)) { deger = deger?.call(this, { ...e, sender, hareketci, uniBilgi, key: alias, sent, hv, defHV }) }
						deger = deger ?? 'NULL';
						let saha = deger; if (alias) { saha += ` ${alias}` }
						sent.add(saha)
					}
					hv = { ...defHV, ..._e.hv }
				}
				let hvDegeri = key => hv?.[key] || defHV?.[key];
				$.extend(_e, { defHV, hv, har: this, harSinif: this.class, rapor, secimler, hvDegeri });
				this.uniDuzenle_tumSonIslemler(_e); sent = _e.sent;
				if (!(maliTablomu || finansalAnalizmi)) { sent.groupByOlustur().gereksizTablolariSil() }
				if (sent?.sahalar?.liste?.length) { uni.add(sent) }
			}
		}
	}
	uniDuzenleOncesi(e) { }
	uniDuzenle_tumSonIslemler(e) {    /* degerci bosGcbEkle value: sent. degerci koopDonemEkle value: sent. degerci sonIslem value: sent */
		return this.uniDuzenle_whereYapi(e).uniDuzenle_ekDuzenleyiciler(e).uniDuzenle_sonIslem(e)
	}
	uniDuzenle_whereYapi(e) {
		let {whereYapi: handlers} = this; if (handlers) {
			let _e = { ...e, hareketci: this }, {sent} = e
			if (sent) { _e.where = sent.where }
			for (let key in handlers) {
				let handler = handlers[key];
				if (handler) { getFuncValue.call(this, handler, _e) }
			}
		}
		return this
	}
	uniDuzenle_ekDuzenleyiciler(e) {
		let {ekDuzenleyiciler: handlers} = this; if (handlers) {
			let _e = { ...e, hareketci: this }, {sent} = e
			if (sent) { _e.where = sent.where }
			for (let key in handlers) {
				let handler = handlers[key];
				if (handler) { getFuncValue.call(this, handler, _e) }
			}
		}
		return this
	}
	uniDuzenle_sonIslem(e) {
		let {sonIslem: handler} = this; if (handler) {
			let _e = { ...e, hareketci: this }, {sent} = e
			if (sent) { _e.where = sent.where }
			getFuncValue.call(this, handler, _e)
		}
		return this
	}
	sentSahaEkleyici(e) {
		let {sent, sql, alias, attr2Deger} = e, {attrSet} = this
		let saha = alias ? new MQAliasliYapi({ alias, deger: sql }) : MQAliasliYapi.newForSahaText(sql)
		let {alias: sahaAlias} = saha
		if (!attrSet || attrSet[sahaAlias]) { sent.add(saha) }
		attr2Deger[sahaAlias] = saha.deger
		return this
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
	setWHD_master(value) { this.whereYapi.master = value; return this }
	setWHD_hareket(value) { this.whereYapi.hareket = value; return this }
	setUygunluk(value) { this.uygunluk = value; return this }
	gereksizTablolariSil() { this.gereksizTablolariSilFlag = true; return this }
	gereksizTablolariSilme() { this.gereksizTablolariSilFlag = false; return this }
	reset(e) { for (let key of ['_uygunluk2UnionBilgiListe', '_defaultAttrSet', '_zorunluAttrSet']) { delete this[key] } return this }

	static maliTablo_secimlerYapiOlustur(e) {
		let {tip2SecimMFYapi} = e; if (!tip2SecimMFYapi) { return this }
		e.result = {}; this.maliTablo_secimlerYapiDuzenle(e)
		if (!empty(e.result)) { tip2SecimMFYapi[this.kisaKod] = e.result }
		return this
	}
	static maliTablo_secimlerYapiDuzenle({ result }) { }
	static maliTablo_secimlerEkDuzenle({ secimler: sec }) {
		if (config.dev) {
			let grupKod = 'ek', grup = { kod: grupKod, aciklama: 'Ek', kapali: true }
			sec.grupEkle(grup)
			sec.secimTopluEkle({
				fisNo: new SecimNumber({ etiket: 'Fiş No', grupKod }),
				seri: new SecimString({ etiket: 'Seri', grupKod })
			})
		}
	}
	// static maliTablo_secimlerSentDuzenle({ secimler: genSec, detSecimler: detSec, uni, sent, where: wh, hv, donemTipi, det, har, attrSet, mstYapi, mstYapi: { hvAlias } }) {
	static maliTablo_secimlerSentDuzenle({ secimler: sec, detSecimler: detSec, sent, sent: { from, where: wh }, hv, mstClause }) {
		let {sqlNull, sqlEmpty} = Hareketci_UniBilgi.ortakArgs
		let varmi = kodClause => kodClause && ![sqlNull, sqlEmpty].includes(kodClause)
		let varsaYap = (kodClause, block) => {
			if (!varmi(kodClause))
				return false
			for (let secimler of [detSec, sec]) {
				if (secimler)
					block?.call(this, { kodClause, secimler })
			}
			return true
		}
		varsaYap(hv.takipno, ({ kodClause, secimler: _sec }) => {
			if (_sec.takipKod) {
				if (!from.aliasIcinTable('tak'))
					sent.fromIliski('takipmst tak', `${kodClause} = tak.kod`)
				wh.basiSonu(_sec.takipKod, kodClause).ozellik(_sec.takipAdi, 'tak.aciklama')
			}
			if (_sec.takipGrupKod) {
				if (!from.aliasIcinTable('tgrp'))
					sent.takip2GrupBagla()
				wh.basiSonu(_sec.takipGrupKod, 'tak.grupkod').ozellik(_sec.takipGrupAdi, 'tgrp.aciklama')
			}
		})				
		varsaYap(hv.bizsubekod, ({ kodClause, secimler: _sec }) => {
			if (_sec.subeKod) {
				if (!from.aliasIcinTable('sub'))
					sent.fromIliski('isyeri sub', `${kodClause} = sub.kod`)
				wh.basiSonu(_sec.subeKod, kodClause).ozellik(_sec.subeAdi, 'sub.aciklama')
			}
			if (_sec.subeGrupKod) {
				if (!from.aliasIcinTable('igrp'))
					sent.sube2GrupBagla()
				wh.basiSonu(_sec.subeGrupKod, 'sub.isygrupkod').ozellik(_sec.subeGrupAdi, 'igrp.aciklama')
			}
		})
		varsaYap(hv.fisno, ({ kodClause, secimler: _sec }) => {
			if (from.aliasIcinTable('fis')?.deger == 'carifis' && kodClause == 'fis.no')
				debugger
			if (_sec.fisNo)
				wh.basiSonu(_sec.fisNo, kodClause)
		})
		varsaYap(hv.seri, ({ kodClause, secimler: _sec }) => {
			if (_sec.seri)
				wh.basiSonu(_sec.seri, kodClause)
		})
	}
}

/*
		== ORNEK CAGIRIM ==
	let queryYapi = new CariHareketci().gereksizTablolariSil().withAttrs('kaysayac', 'fisno', 'fistipi', 'must', 'althesapadi', 'tarih', 'vade', 'seri', 'noyil', 'no', 'bedel')
		.setWHD_master(e => { let {wh, attr2Deger} = e; wh.degerAta('C1', attr2Deger.asilmust) })
		.setWHD_hareket(e => { let {wh, attr2Deger} = e; wh.basiSonu({ basi: today().yilBasi(), sonu: today() }, attr2Deger.tarih) })
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