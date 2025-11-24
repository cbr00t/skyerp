class EIslBaslikVeDetayOrtak extends RowluYapi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get temps() { return this._temps }
	get shared() { return this._shared }
	onKontrol(e) { }
}
class EIslBaslik extends EIslBaslikVeDetayOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get eIslTip() { return this.rec.efayrimtipi }
	get eFaturami() { return this.eIslTip == 'E' } get eArsivmi() { return (this.eIslTip || 'A') == 'A' }
	get eIrsaliyemi() { return this.eIslTip == 'IR' } get eMustahsilmi() { return this.eIslTip == 'MS' }
	get alimIademi() { return asBool(this.rec.alimiademi) } get subeKod() { return this.rec.bizsubekod }
	get dvKod() {
		let result = this._dvKod;
		if (result === undefined) {
			result = (this.rec.dvkod || '').trim();
			switch (result) { case '': case 'TL': case 'TRL': result = EIslemOrtak.currCode_tl; break; }
			this._dvKod = result
		}
		return result
	}
	get dvKodUyarlanmis() {
		let result = this._dvKodUyarlanmis;
		if (result === undefined) {
			result = this.dvKod; if (!result || result == 'TRY' || result == 'TRL') { result = 'TL' }
			this._dvKodUyarlanmis = result
		}
		return result
	}
	get dovizlimi() {
		let result = this._dovizlimi;
		if (result === undefined) { let {dvKod} = this; result = this._dovizlimi = dvKod && dvKod != EIslemOrtak.currCode_tl }
		return result
	}
	get aliciBilgi() {
		let {_aliciBilgi: result} = this
		if (result === undefined)
			result = this._aliciBilgi = $.extend(new EIslBaslik_AliciBilgi(), this)
		return result
	}
	get genelYontemKod() { return this.rec.genelyontem } get ozelYontemKod() { return this.rec.ozelyontem }
	get eYontem() {
		let {_eYontem: result} = this;
		if (result === undefined) {
			let {ozelYontemKod, genelYontemKod, _temps} = this;
			if (genelYontemKod) { result = new MQEIslGeneldenOzelYontem({ genelYontem: new EIslGenelYontem(genelYontemKod) }) }
			else {
				result = new MQEIslOzelYontem(); let {ozelYontemKod2Rec} = _temps;
				let rec = ozelYontemKod2Rec ? ozelYontemKod2Rec[ozelYontemKod] : null; if (rec) { result.setValues({ rec }) }
			}
			this._eYontem = result
		}
		return result
	}
	get faturaOzelTipText() {
		let result = this._faturaOzelTipText;
		if (result === undefined) {
			let {rec, alimIademi} = this; result = rec.faturaozeltip;
			if (alimIademi) { result += `${result ? '-' : ''}IADE` }
		}
		return result
	}
	get eArsivBelgeTipi() { return this.eArsivmi ? this.rec.earsivbelgetipi : null }
	get eArsivBelgeTipBelirtec() {
		let result = this._eArsivBelgeTipBelirtec;
		if (result === undefined) {
			let {eArsivmi, eArsivBelgeTipi} = this;
			result = this._eArsivBelgeTipBelirtec = eArsivmi ? eArsivBelgeTipi == 'E' ? 'ELEKTRONIK' : 'KAGIT' : null
		}
		return result
	}
	get xbakiye() { return this.rec[`${this.dovizlimi ? 'dv' : 'tl'}bakiye`] } get oncekiXBakiye() { return this.rec[`${this.dovizlimi ? 'dv' : 'tl'}oncekibakiye`] }
	get sonrakiXBakiye() { return (this.oncekiXBakiye || 0) + (this.xbakiye || 0) }
	get tlBakiye() { return this.rec.tlbakiye } get oncekiTLBakiye() { return this.rec.tloncekibakiye }
	get sonrakiTLBakiye() { return (this.oncekiTLBakiye || 0) + (this.tlBakiye || 0) }

	async onKontrol(e) {
		await super.onKontrol(e); let err = errorTextsAsObject({ errors: await this.onKontrolMesajlar(e) }); if (err) { throw err }
 		let {eYontem} = this; if (eYontem?.eIslemOnKontrol) { await eYontem.eIslemOnKontrol(e) }
		return this
	}
	async onKontrolMesajlar(e) {
		let _e = $.extend({}, e, { liste: [] }); await this.onKontrolMesajlarDuzenle(_e); await this.onKontrolMesajlarDuzenle_son(_e);
		return _e.liste?.filter(x => !!x)
	}
	async onKontrolMesajlarDuzenle(e) { } async onKontrolMesajlarDuzenle_son(e) { }
}
class EIslDetay extends EIslBaslikVeDetayOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get kayitTipi() { return this.rec.kayittipi }
	get stokmu() { return this.kayitTipi == 'S' } get hizmetmi() { return this.kayitTipi == 'H' } get demirbasmi() { return this.kayitTipi == 'D' }
	get kodGosterim() {
		let result = this._kodGosterim;
		if (result == null) {
			let {rec} = this, {kodYerineSiraNo} = app.params.eIslem.kullanim; result = kodYerineSiraNo ? rec.seq.toString() : rec.shkod;
			this._kodGosterim = result = result.trimEnd()
		}
		return result
	}
	get adiGosterim() {
		let result = this._adiGosterim;
		if (result == null) {
			let {kural} = app.params.eIslem, kural_shAdi = kural.shAdi, kural_aciklama = kural.aciklama, kural_aciklamaKapsam = kural.aciklamaKapsam, {rec} = this;
			result = kural_shAdi.sadeceAdi1mi ? rec.shadi : kural_shAdi.sadeceAdi2mi ? rec.shadi2 : `${rec.shadi} ${rec.shadi2}`;
			if (!(kural_aciklamaKapsam.sadeceNotlarmi || kural_aciklamaKapsam.hepsimi) && kural_aciklama.satirIciUrunAdindami) { result += ` (${rec.ekaciklama || ''})` }
			this._adiGosterim = result = result.trimEnd()
		}
		return result
	}
	get barkodGosterim() {
		let result = this._barkodGosterim;
		if (result == null) { this._barkodGosterim = result = this.rec.barkod || this.kodGosterim }
		return result
	}
	get revizeRefKod() { return this.rec.stokrefkod || this.kodGosterim }
	get sonucBedelYapi() { let {rec} = this; return new TLVeDVBedel({ tl: rec.bedel, dv: rec.dvbedel }) }
	getSonucBedel(e) { let {dovizlimi} = e, {sonucBedelYapi} = this; return sonucBedelYapi[dovizlimi ? 'dv' : 'tl'] }
	getEFiyatYapi(e) {
		let result = this._eFiyatYapi;
		if (result == null) {
			let {kural} = app.params.eIslem, kural_fiyat = kural.fiyat, bedelPrefix = e.dovizlimi ? 'dv' : '', {rec} = this;
			let asilFiyat = rec[`${bedelPrefix}fiyat`], netFiyat;
			if (!kural_fiyat.brutmu) {
				let fiyatVeriTipi = rec.fiyatveritipi, miktarAttr = fiyatVeriTipi == '2' ? 'miktar2' : fiyatVeriTipi == 'K' ? 'koli' : 'miktar';
				let asilMiktar = rec[miktarAttr]; netFiyat = rec.bedel / (asilMiktar || 1)
			}
			result = kural_fiyat.netmi ? { asilFiyat: netFiyat, netFiyat: null }  : { asilFiyat: asilFiyat, netFiyat };
			this._eFiyatYapi = result
		}
		return result
	}
	get eMiktarYapi() {
		let result = this._eMiktarYapi;
		if (result == null) {
			let {kural} = app.params.eIslem, {fiyataEsasmi, birliktemi} = kural.miktar, {rec} = this;
			let asilMiktar = rec.miktar, miktar2, brm;
			if (birliktemi) { miktar2 = rec.miktar2 }
			else if (fiyataEsasmi) {
				let fiyatVeriTipi = rec.fiyatveritipi; asilMiktar = rec[fiyatVeriTipi == '2' ? 'miktar2' : fiyatVeriTipi == 'K' ? 'koli' : 'miktar'];
					/* paket için ulsKod karşılığı yok */
				let brmAttr = rec[fiyatVeriTipi == '2' ? 'brm2' : null]; brm = brmAttr ? rec[brmAttr] : null
			}
				/* brm == null için 'brm' kullanılır */
			result = { asilMiktar, miktar2: (birliktemi ? miktar2 : null), brm }; this._eMiktarYapi = result
		}
		return result
	}
	constructor(e) { super(e); this.aciklamalar = e.aciklamalar || [] }

	aciklamaEkle(e) { this.aciklamalar.push(e.aciklama); return this }
}

class EIcmal extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get brutBedelYapi() {
		let result = this._brutBedelYapi;
		if (result === undefined) {
			let satirdanDipe = this.belirtec2AnaTip2AltTip2Satirlar['']?.DP || {};
			this._brutBedelYapi = result = ((satirdanDipe.BR ?? satirdanDipe.NT) || [])[0]?.bedelYapi || {}
												/* ^-> Satır Brütten veya Netten kullanılabiliyor */
		}
		return this._brutBedelYapi
	}
	get topIskBedelYapi() {
		let result = this._topIskBedelYapi;
		if (result === undefined) {
			let altTip2Satirlar = ((this.belirtec2AnaTip2AltTip2Satirlar.H || {}).IS || []);
			result = new TLVeDVBedel();
			for (let eSatir of values(altTip2Satirlar)) { result.ekle(eSatir.bedelYapi) }
			this._topIskBedelYapi = result
		}
		return this._topIskBedelYapi
	}
	get hizmetler() {
		let result = (this._hizmetler = this._hizmetler || {});
		if (result === undefined) {
			result = new TLVeDVBedel();
			let anaTip2AltTip2Satirlar = this.belirtec2AnaTip2AltTip2Satirlar.H || {};
			for (let altTip2Satirlar of values(anaTip2AltTip2Satirlar))
			for (let eSatir of values(altTip2Satirlar)) { result.ekle(eSatir) }
			this._hizmetler = result
		}
		return this._hizmetler
	}
	getVergiEklenenYapi(e = {}) {
		let sadeceEkleneceklermi = e.sadeceEklenecekler ?? e.sadeceEkleneceklermi
		let result = (this._vergiEklenenYapi = this._vergiEklenenYapi || {})
		let subResult = result[sadeceEklenecekler]
		if (subResult === undefined) {
			subResult = new TLVeDVBedel()
			let anaTip2AltTip2Satirlar = this.belirtec2AnaTip2AltTip2Satirlar.V || {}
			for (let altTip2Satirlar of values(anaTip2AltTip2Satirlar)) {
				for (let eSatir of values(altTip2Satirlar)) {
					let {bedelYapi} = eSatir
					if (eSatir.dusulecekmi) {
						if (!sadeceEkleneceklermi)
							continue
						bedelYapi = bedelYapi.negated
					}
					subResult.ekle(bedelYapi)
				}
			}
			result[sadeceEklenecekler] = subResult
		}
		return this._vergiEklenenYapi
	}
	get vergiHaricToplamYapi() {
		let {_vergiHaricToplamYapi: result, belirtec2AnaTip2AltTip2Satirlar, sonucBedelYapi} = this
		if (result === undefined) {
			let kdvYapilar = values(this.vergiTip2Oran2EVergiRecs_tevkifatsiz).map(_ => values(_).flat()).flat()
			let topKdv = topla(_ => _.bedel, kdvYapilar)
			result = this._vergiHaricToplamYapi = { tl: sonucBedelYapi.tl - topKdv }
		}
		return this._vergiHaricToplamYapi
	}
	get vergiDahilToplamYapi() {
		let {_vergiDahilToplamYapi: result, belirtec2AnaTip2AltTip2Satirlar} = this
		if (result === undefined)
			result = this._vergiDahilToplamYapi = belirtec2AnaTip2AltTip2Satirlar['']?.DP?.VD?.[0]?.bedelYapi ?? {}
		return this._vergiDahilToplamYapi
	}
	get vergiTip2Oran2EVergiRecs_tevkifatsiz() {
		let result = this._vergiTip2Oran2EVergiRecs_tevkifatsiz;
		if (result === undefined) {
			result = {}; let anaTip2AltTip2Satirlar = this.belirtec2AnaTip2AltTip2Satirlar.V || {};
			for (let altTip2Satirlar of values(anaTip2AltTip2Satirlar)) {
				for (let eSatirlar of values(altTip2Satirlar)) {
					for (let eSatir of eSatirlar) {
						if (eSatir.anaTip == 'KD' && eSatir.altTip == 'TV') { continue }
						let {kod, oran} = eSatir, oran2Recs = result[kod] = result[kod] || {};
						let eSatirlar = oran2Recs[oran]; if (!eSatirlar) { oran2Recs[oran] = eSatirlar = [] } eSatirlar.push(eSatir)
					}
				}
			}
			this._vergiTip2Oran2EVergiRecs_tevkifatsiz = result
		}
		return this._vergiTip2Oran2EVergiRecs_tevkifatsiz
	}
	get vergiRecs_tevkifatlar() {
		let result = this._vergiRecs_tevkifatlar;
		if (result === undefined) { let {belirtec2AnaTip2AltTip2Satirlar} = this; this._vergiRecs_tevkifatlar = result = belirtec2AnaTip2AltTip2Satirlar.V?.KD?.TV || [] }
		return this._vergiRecs_tevkifatlar
	}
	get sonucBedelYapi() {
		let result = this._sonucBedelYapi;
		if (result === undefined) { let {belirtec2AnaTip2AltTip2Satirlar} = this; this._sonucBedelYapi = result = (belirtec2AnaTip2AltTip2Satirlar['']?.DP?.OD || [])[0]?.bedelYapi || {} }
		return this._sonucBedelYapi
	}

	constructor(e) {
		e = e || {}; super(e)
		let getTLVeBedelObj = value => (value && $.isPlainObject(value) ? TLVeDVBedel(value) : value) || new TLVeDVBedel
		$.extend(this, { satirlar: e.satirlar || [], belirtec2AnaTip2AltTip2Satirlar: e.belirtec2AnaTip2AltTip2Satirlar || {} })
	}
	getIcmalXSonucu(e) {
		let {dovizlimi} = e, {satirlar} = this, onEkci = text => `${dovizlimi ? 'Dv. ' : ''}${text}` ;
		let xci = dovizlimi ? (bv => bv.dv) : (bv => bv.tl), result = [];
		for (let eSatir of this.satirlar) { let etiket = onEkci(eSatir.etiket), bedel = xci(eSatir.bedelYapi); result.push({ etiket, bedel }) }
		return result
	}
	dipEIcmalYukle(e) {
		let {recs} = e; this.reset()
		let {satirlar, belirtec2AnaTip2AltTip2Satirlar} = this
		for (let rec of recs) {
			let eSatir = EIcmalSatirOrtak.newFor({ rec })
			if (eSatir) {
				satirlar.push(eSatir)
				let {hvTip, anaTip, altTip} = eSatir
				let anaTip2AltTip2Satirlar = belirtec2AnaTip2AltTip2Satirlar[hvTip] = belirtec2AnaTip2AltTip2Satirlar[hvTip] || {};
				let altTip2Satirlar = anaTip2AltTip2Satirlar[anaTip] = anaTip2AltTip2Satirlar[anaTip] || {};
				(altTip2Satirlar[altTip] = altTip2Satirlar[altTip] || []).push(eSatir)
			}
		}
		return this
	}
	reset(e) {
		$.extend(this, { belirtec2AnaTip2AltTip2Satirlar: {}, satirlar: [] })
		return this
	}
}
class EIcmalSatirOrtak extends RowluYapi {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return null }
	static get tip2Sinif() {
		let result = this._tip2Sinif;
		if (result === undefined) {
			result = {}; for (let cls of this.subClasses) {
				let {tip} = cls;
				if (tip != null) { result[tip] = cls }
			}
			this._tip2Sinif = result
		}
		return result
	}
	get bedelYapi() { return new TLVeDVBedel({ tl: this.bedel, dv: this.dvBedel }) }
	get hvTip() { return this.rec.hvtip } get anaTip() { return this.rec.anatip } get altTip() { return this.rec.alttip }
	get etiket() { return this.rec.xadi } get kod() { return this.rec.xkod } get oran() { return this.rec.oran } get bedel() { return this.rec.bedel } get dvBedel() { return this.rec.dvbedel }
	static getClass(e) { e = e || {}; let rec = e.rec || e; return this.tip2Sinif[rec.hvtip] ?? EIcmalSatirDiger }
	static newFor(e) { let cls = this.getClass(e); return cls ? new cls(e) : null }
}
class EIcmalHizmet extends EIcmalSatirOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'H' }
	get etiket() {
		let result = this._etiket;
		if (result === undefined) { result = this.iskontomu ? 'İskonto' : this.nakliyemi ? 'Nakliye' : super.etiket; this._etiket = result }
		return result
	}
	get iskontomu() { return this.rec.anatip == 'IS' }
	get nakliyemi() { return this.rec.anatip == 'NK' }
}
class EIcmalVergi extends EIcmalSatirOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'V' } get dusulecekmi() { return this.tevkifatmi || this.mustahsilmi }
	/*get etiket() {
		let result = this._etiket;
		if (result === undefined) {
			let {anaTip, altTip, oran} = this;
			if (anaTip == 'KD' && !altTip)
				result = `Kdv %${oran}`
			else if (anaTip == 'KD' && altTip == 'TV')
				result = `Tevkifat %${oran}/10`
			else if (anaTip == 'ST' && !altTip)
				result = `Stopaj %${oran}`
			else if (anaTip == 'OT' && !altTip)
				result = `Ötv %${oran}`
			else if (anaTip == 'KO' && !altTip)
				result = `Konaklama %${oran}`
			else if (anaTip == 'OI' && !altTip)
				result = `Özel İletişim %${oran}`
			else if (anaTip == 'MS') {
				switch (altTip) {
					case 'BG': result = `Bağ-Kur %${oran}`; break;
					case 'BI': result = `Birlik Kesintisi %${oran}`; break;
					case 'BO': result = `Borsa Kesintisi %${oran}`; break;
					case 'MR': result = `Mera Fonu %${oran}`; break;
				}
			}
			else
				result = super.etiket
			this._etiket = result
		}
		return result
	}*/
	get kdvmi() { return this.anaTip == 'KD' && !this.altTip }
	get tevkifatmi() { return this.anaTip == 'KD' && this.altTip == 'TV' } get mustahsilmi() { return this.anaTip == 'MS' }
	get matrah() { return this.rec.matrah } get dvMatrah() { return this.rec.dvmatrah }
	getMatrahYapi(e) {
		e = e || {}; let {dvKur} = e, tl = this.matrah, dv = dvKur ? roundToFra(tl / dvKur, app.params.zorunlu.dvBedelFra) : 0;
		return new TLVeDVBedel({ tl, dv })
	}
}
class EIcmalSatirDiger extends EIcmalSatirOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return '' }
}
class EIslBaslik_AliciBilgi extends EIslBaslik {
	get kod() { return this.rec.mustkod } get unvan() { return this.rec.unvan } get ulkeAdi() { return this.rec.ulkeadi } get ilAdi() { return this.rec.iladi }
	get adres() { return this.rec.adres } get yore() { return this.rec.yore } get posta() { return this.rec.posta }
	get tel1() { return this.rec.tel1 } get tel2() { return this.rec.tel2 } get tel3() { return this.rec.tel3 }
	get eMail() { return this.rec.email } get fax() { return this.rec.fax }
	get vknTckn() { return this.sahismi ? this.tckn : this.vkn } get sahismi() { return asBool(this.rec.sahismi) } get tckn() { return this.rec.tckn } get vkn() { return this.rec.vkn }
	get vergiDairesi() { return this.rec.vergidairesi } get ticSicilNo() { return this.rec.ticsicilno } get mersisNo() { return this.rec.mersisno }
	get gibAlias() { return this.rec.gibalias } get webURL() { return this.rec.webadresi }
}
