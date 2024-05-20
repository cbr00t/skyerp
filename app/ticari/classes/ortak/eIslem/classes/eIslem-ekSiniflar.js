class EIslBaslikVeDetayOrtak extends RowluYapi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	onKontrol(e) { }
}
class EIslBaslik extends EIslBaslikVeDetayOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get eIslTip() { return this.rec.efayrimtipi } get eFaturami() { return this.eIslTip == 'E' } get eArsivmi() { return (this.eIslTip || 'A') == 'A' }
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
	get dovizlimi() {
		let result = this._dovizlimi;
		if (result === undefined) { const {dvKod} = this; result = this._dovizlimi = dvKod && dvKod != EIslemOrtak.currCode_tl }
		return result
	}
	get aliciBilgi() {
		let result = this._aliciBilgi;
		if (result === undefined) result = this._aliciBilgi = $.extend(new EIslBaslik_AliciBilgi(), this)
		return result
	}
	get genelYontemKod() { return this.rec.genelyontem } get ozelYontemKod() { return this.rec.ozelyontem }
	get eYontem() {
		let result = this._eYontem;
		if (result === undefined) {
			const {ozelYontemKod, genelYontemKod, _temps} = this;
			if (genelYontemKod) { result = new MQEIslGeneldenOzelYontem({ genelYontem: new EIslGenelYontem(genelYontemKod) }) }
			else {
				result = new MQEIslOzelYontem(); const {ozelYontemKod2Rec} = _temps, rec = ozelYontemKod2Rec ? ozelYontemKod2Rec[ozelYontemKod] : null;
				if (rec) { result.setValues({ rec }) }
			}
			this._eYontem = result
		}
		return result
	}
	get faturaOzelTipText() {
		let result = this._faturaOzelTipText;
		if (result === undefined) {
			const {rec, alimIademi} = this; result = rec.faturaozeltip;
			if (alimIademi) { result += `${result ? '-' : ''}IADE` }
		}
		return result
	}
	get eArsivBelgeTipi() { return this.eArsivmi ? this.rec.earsivbelgetipi : null }
	get eArsivBelgeTipBelirtec() {
		let result = this._eArsivBelgeTipBelirtec;
		if (result === undefined) {
			const {eArsivmi, eArsivBelgeTipi} = this;
			result = this._eArsivBelgeTipBelirtec = eArsivmi ? eArsivBelgeTipi == 'E' ? 'ELEKTRONIK' : 'KAGIT' : null
		}
		return result
	}

	async onKontrol(e) {
		await super.onKontrol(e); let err = errorTextsAsObject({ errors: await this.onKontrolMesajlar(e) }); if (err) { throw err }
 		const {eYontem} = this; if (eYontem?.eIslemOnKontrol) { await eYontem.eIslemOnKontrol(e) }
		return this
	}
	async onKontrolMesajlar(e) {
		const _e = $.extend({}, e, { liste: [] }); await this.onKontrolMesajlarDuzenle(_e); await this.onKontrolMesajlarDuzenle_son(_e);
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
		if (result == null) { this._kodGosterim = result = (this.rec.shkod || '').trimEnd() }
		return result
	}
	get adiGosterim() {
		let result = this._adiGosterim;
		if (result == null) {
			const {kural} = app.params.eIslem, kural_shAdi = kural.shAdi, kural_aciklama = kural.aciklama, kural_aciklamaKapsam = kural.aciklamaKapsam, {rec} = this;
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
	get sonucBedel() { const {rec} = this; return rec.bedel }
	getEFiyatYapi(e) {
		let result = this._eFiyatYapi;
		if (result == null) {
			const {kural} = app.params.eIslem, kural_fiyat = kural.fiyat, bedelPrefix = e.dovizlimi ? 'dv' : '', {rec} = this;
			let asilFiyat = rec[`${bedelPrefix}fiyat`], netFiyat;
			if (!kural_fiyat.brutmu) {
				const fiyatVeriTipi = rec.fiyatveritipi, miktarAttr = fiyatVeriTipi == '2' ? 'miktar2' : fiyatVeriTipi == 'K' ? 'koli' : 'miktar';
				const asilMiktar = rec[miktarAttr]; netFiyat = rec.bedel / (asilMiktar || 1)
			}
			result = kural_fiyat.netmi ? { asilFiyat: netFiyat, netFiyat: null }  : { asilFiyat: asilFiyat, netFiyat };
			this._eFiyatYapi = result
		}
		return result
	}
	get eMiktarYapi() {
		let result = this._eMiktarYapi;
		if (result == null) {
			const {kural} = app.params.eIslem, {fiyataEsasmi, birliktemi} = kural.miktar, {rec} = this;
			let asilMiktar = rec.miktar, miktar2, brm;
			if (birliktemi) { miktar2 = rec.miktar2 }
			else if (fiyataEsasmi) {
				const fiyatVeriTipi = rec.fiyatveritipi; asilMiktar = rec[fiyatVeriTipi == '2' ? 'miktar2' : fiyatVeriTipi == 'K' ? 'koli' : 'miktar'];
					/* paket için ulsKod karşılığı yok */
				const brmAttr = rec[fiyatVeriTipi == '2' ? 'brm2' : null]; brm = brmAttr ? rec[brmAttr] : null
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
		if (result === undefined) this._brutBedelYapi = result = ((((this.belirtec2AnaTip2AltTip2Satirlar[''] || {}).DP || {}).BR || [])[0] || {}).bedelYapi || {}
		return this._brutBedelYapi
	}
	get topIskBedelYapi() {
		let result = this._topIskBedelYapi;
		if (result === undefined) {
			const altTip2Satirlar = ((this.belirtec2AnaTip2AltTip2Satirlar.H || {}).IS || []);
			result = new TLVeDVBedel();
			for (const eSatir of Object.values(altTip2Satirlar)) { result.ekle(eSatir.bedelYapi) }
			this._topIskBedelYapi = result
		}
		return this._topIskBedelYapi
	}
	get hizmetler() {
		let result = (this._hizmetler = this._hizmetler || {});
		if (result === undefined) {
			result = new TLVeDVBedel();
			const anaTip2AltTip2Satirlar = this.belirtec2AnaTip2AltTip2Satirlar.H || {};
			for (const altTip2Satirlar of Object.values(anaTip2AltTip2Satirlar))
			for (const eSatir of Object.values(altTip2Satirlar)) { result.ekle(eSatir) }
			this._hizmetler = result
		}
		return this._hizmetler
	}
	getVergiEklenenYapi(e) {
		e = e || {}; const sadeceEkleneceklermi = e.sadeceEklenecekler || e.sadeceEkleneceklermi;
		let result = (this._vergiEklenenYapi = this._vergiEklenenYapi || {}), subResult = result[sadeceEklenecekler];
		if (subResult === undefined) {
			subResult = new TLVeDVBedel();
			const anaTip2AltTip2Satirlar = this.belirtec2AnaTip2AltTip2Satirlar.V || {};
			for (const altTip2Satirlar of Object.values(anaTip2AltTip2Satirlar)) {
				for (const eSatir of Object.values(altTip2Satirlar)) {
					let {bedelYapi} = eSatir;
					if (eSatir.dusulecekmi) { if (!sadeceEkleneceklermi) { continue } bedelYapi = bedelYapi.negated }
					subResult.ekle(bedelYapi)
				}
			}
			result[sadeceEklenecekler] = subResult
		}
		return this._vergiEklenenYapi
	}
	get vergiHaricToplamYapi() {
		let result = this._vergiHaricToplamYapi;
		if (result === undefined) {
			const {sonucBedelYapi} = this;
			this._vergiHaricToplamYapi = result = sonucBedelYapi && sonucBedelYapi.cikar ? sonucBedelYapi.cikar(this.dipVergiEklenenYapi) : {}
		}
		return this._vergiHaricToplamYapi
	}
	get vergiDahilToplamYapi() {
		let result = this._vergiDahilToplamYapi;
		if (result === undefined) { this._vergiDahilToplamYapi = result = ((((this.belirtec2AnaTip2AltTip2Satirlar[''] || {}).DP || {}).VD || [])[0] || {}).bedelYapi || {} }
		return this._vergiDahilToplamYapi
	}
	get vergiTip2Oran2EVergiRecs_tevkifatsiz() {
		let result = this._vergiTip2Oran2EVergiRecs_tevkifatsiz;
		if (result === undefined) {
			result = {}; const anaTip2AltTip2Satirlar = this.belirtec2AnaTip2AltTip2Satirlar.V || {};
			for (const altTip2Satirlar of Object.values(anaTip2AltTip2Satirlar)) {
				for (const eSatirlar of Object.values(altTip2Satirlar)) {
					for (const eSatir of eSatirlar) {
						if (eSatir.anaTip == 'KD' && eSatir.altTip == 'TV') { continue }
						const {kod, oran} = eSatir, oran2Recs = result[kod] = result[kod] || {};
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
		if (result === undefined) { const {belirtec2AnaTip2AltTip2Satirlar} = this; this._vergiRecs_tevkifatlar = result = belirtec2AnaTip2AltTip2Satirlar.V?.KD?.TV || [] }
		return this._vergiRecs_tevkifatlar
	}
	get sonucBedelYapi() {
		let result = this._sonucBedelYapi;
		if (result === undefined) { const {belirtec2AnaTip2AltTip2Satirlar} = this; this._sonucBedelYapi = result = (belirtec2AnaTip2AltTip2Satirlar['']?.DP?.OD || [])[0]?.bedelYapi || {} }
		return this._sonucBedelYapi
	}

	constructor(e) {
		e = e || {}; super(e);
		const getTLVeBedelObj = value => (value && $.isPlainObject(value) ? TLVeDVBedel(value) : value) || new TLVeDVBedel;
		$.extend(this, { satirlar: e.satirlar || [], belirtec2AnaTip2AltTip2Satirlar: e.belirtec2AnaTip2AltTip2Satirlar || {} })
	}
	getIcmalXSonucu(e) {
		const {dovizlimi} = e, {satirlar} = this, onEkci = text => `${dovizlimi ? 'Dv. ' : ''}${text}` ;
		const xci = dovizlimi ? (bv => bv.dv) : (bv => bv.tl), result = [];
		for (const eSatir of this.satirlar) { const etiket = onEkci(eSatir.etiket), bedel = xci(eSatir.bedelYapi); result.push({ etiket, bedel }) }
		return result
	}
	dipEIcmalYukle(e) {
		const {recs} = e; this.reset(); const {satirlar, belirtec2AnaTip2AltTip2Satirlar} = this;
		for (const rec of recs) {
			const eSatir = EIcmalSatirOrtak.newFor({ rec });
			if (eSatir) {
				satirlar.push(eSatir); const {hvTip, anaTip, altTip} = eSatir;
				const anaTip2AltTip2Satirlar = belirtec2AnaTip2AltTip2Satirlar[hvTip] = belirtec2AnaTip2AltTip2Satirlar[hvTip] || {};
				const altTip2Satirlar = anaTip2AltTip2Satirlar[anaTip] = anaTip2AltTip2Satirlar[anaTip] || {};
				(altTip2Satirlar[altTip] = altTip2Satirlar[altTip] || []).push(eSatir)
			}
		}
		return this
	}
	reset(e) { $.extend(this, { belirtec2AnaTip2AltTip2Satirlar: {}, satirlar: [] }); return this }
}
class EIcmalSatirOrtak extends RowluYapi {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return null }
	static get tip2Sinif() {
		let result = this._tip2Sinif;
		if (result === undefined) {
			result = {}; for (const cls of this.subClasses) { const {tip} = cls; if (tip != null) { result[tip] = cls } }
			this._tip2Sinif = result
		}
		return result
	}
	get bedelYapi() { return new TLVeDVBedel({ tl: this.bedel, dv: this.dvBedel }) }
	get hvTip() { return this.rec.hvtip } get anaTip() { return this.rec.anatip } get altTip() { return this.rec.alttip }
	get etiket() { return this.rec.xadi } get kod() { return this.rec.xkod } get oran() { return this.rec.oran } get bedel() { return this.rec.bedel } get dvBedel() { return this.rec.dvbedel }
	static getClass(e) { e = e || {}; const rec = e.rec || e; return this.tip2Sinif[rec.hvtip] ?? EIcmalSatirDiger }
	static newFor(e) { const cls = this.getClass(e); return cls ? new cls(e) : null }
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
			const {anaTip, altTip, oran} = this;
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
		e = e || {}; const {dvKur} = e, tl = this.matrah, dv = dvKur ? roundToFra(tl / dvKur, app.params.zorunlu.dvBedelFra) : 0;
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
