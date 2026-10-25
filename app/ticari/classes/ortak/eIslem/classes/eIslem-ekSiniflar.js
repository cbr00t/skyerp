class EIslBaslikVeDetayOrtak extends RowluYapi {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	get temps() { return this._temps }
	set temps(v) { this._temps = v }
	get shared() { return this._shared }
	set shared(v) { this._shared = v }
	onKontrol(e) { }
}

class EIslBaslik extends EIslBaslikVeDetayOrtak {
    static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	get eIslTip() { return this.rec.eIslTip }
	get eFaturami() { return this.eIslTip == 'E' }
	get eArsivmi() { return (this.eIslTip || 'A') == 'A' }
	get eIrsaliyemi() { return this.eIslTip == 'IR' }
	get eMustahsilmi() { return this.eIslTip == 'MS' }
	get alimIademi() { return asBool(this.rec.alimiademi) }
	get subeKod() { return this.rec.subeKod }
	get fisTipi() { return this.rec.fisTipi }
	get tarihStr() { return asReverseDateString(asDate(this.rec.tarih)) }
	get sevkTarihStr() { return asReverseDateString(asDate(this.rec.sevkTarih)) || this.rec.sevkTarihStr }
	get sevkSaatStr() { return timeToString(asDate(this.rec.sevkSaat)) || this.rec.sevkSaatStr }
	get sevkYerKod() { return this.rec.sevkYerKod }
	get istisnaKod() { return this._istisnaKod ?? this.rec.kdvIstisnaTuru }
	set istisnaKod(v) { return this._istisnaKod = v }
	get efSenaryo() { return this.rec.carsenaryo }
	get kamumu() { return this.efSenaryo == 'K' }
	get dvKod() {
		let { _dvKod: result } = this
		if (result === undefined) {
			let { dvKod } = this.rec
			result = dvKod?.trim() ?? ''
			switch (result) {
				case '': case 'TL': case 'TRL': {
					result = EIslemOrtak.currCode_tl
					break
				}
			}
			this._dvKod = result
		}
		return result
	}
	get dvKodUyarlanmis() {
		let { _dvKodUyarlanmis: result } = this
		if (result === undefined) {
			result = this.dvKod
			if (!result || result == 'TRY' || result == 'TRL')
				result = 'TL'
			this._dvKodUyarlanmis = result
		}
		return result
	}
	get dovizlimi() {
		let { _dovizlimi: res } = this
		if (res === undefined) {
			let { dvKod } = this
			res = this._dovizlimi = (
				dvKod &&
				dvKod != EIslemOrtak.currCode_tl
			)
		}
		return res
	}
	get aliciBilgi() {
		let { _aliciBilgi: res } = this
		if (res === undefined)
			res = this._aliciBilgi = extend(new EIslBaslik_AliciBilgi(), this)
		return res
	}
	get genelYontemKod() { return this.rec.genelyontem }
	get ozelYontemKod() { return this.rec.ozelyontem }
	get eYontem() {
		let { _eYontem: res } = this
		if (res === undefined) {
			let { ozelYontemKod, genelYontemKod, _temps } = this
			if (genelYontemKod)
				res = new MQEIslGeneldenOzelYontem({ genelYontem: new EIslGenelYontem(genelYontemKod) })
			else {
				let { ozelYontemKod2Rec } = _temps
				res = new MQEIslOzelYontem()
				let rec = ozelYontemKod2Rec?.[ozelYontemKod]
				if (rec)
					res.setValues({ rec })
			}
			this._eYontem = res
		}
		return res
	}
	get faturaOzelTipText() {
		let { _faturaOzelTipText: res } = this
		if (res === undefined) {
			let { rec: r, alimIademi } = this
			let { faturaOzelTip } = r
			res = faturaOzelTip
			if (alimIademi)
				res += `${res ? '-' : ''}IADE`
		}
		return res
	}
	get eArsivBelgeTipi() { return this.eArsivmi ? this.rec.eaGonderimTipi : null }
	get eArsivBelgeTipBelirtec() {
		let res = this._eArsivBelgeTipBelirtec
		if (res === undefined) {
			let { eArsivmi, eArsivBelgeTipi } = this
			res = this._eArsivBelgeTipBelirtec = (
				eArsivmi
					? eArsivBelgeTipi == 'E' ? 'ELEKTRONIK' : 'KAGIT'
					: null
			)
		}
		return res
	}
	get xbakiye() { return this.rec[`${this.dovizlimi ? 'dv' : 'tl'}Bakiye`] }
	get oncekiXBakiye() { return this.rec[`${this.dovizlimi ? 'dv' : 'tl'}oncekibakiye`] }
	get sonrakiXBakiye() { return (this.oncekiXBakiye || 0) + (this.xbakiye || 0) }
	get tlBakiye() { return this.rec.tlBakiye }
	get oncekiTLBakiye() { return this.rec.tloncekibakiye }
	get sonrakiTLBakiye() { return (this.oncekiTLBakiye || 0) + (this.tlBakiye || 0) }

	async onKontrol(e) {
		await super.onKontrol(e)
		let err = errorTextsAsObject({ errors: await this.onKontrolMesajlar(e) })
		if (err)
			throw err
 		let { eYontem } = this
		await eYontem?.eIslemOnKontrol?.(e)
		return this
	}
	async onKontrolMesajlar(e = {}) {
		let args = { ...e, liste: [] }
		await this.onKontrolMesajlarDuzenle(args)
		await this.onKontrolMesajlarDuzenle_son(args)
		return args.liste?.filter(Boolean)
	}
	async onKontrolMesajlarDuzenle(e) { }
	async onKontrolMesajlarDuzenle_son(e) { }
}

class EIslDetay extends EIslBaslikVeDetayOrtak {
    static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	get kayitTipi() { return this.rec.kayitTipi }
	get stokmu() { return this.kayitTipi == 'S' }
	get hizmetmi() { return this.kayitTipi == 'H' }
	get demirbasmi() { return this.kayitTipi == 'D' }
	get kodGosterim() {
		let { _kodGosterim: res } = this
		if (res == null) {
			let { rec: r } = this
			let { shKod, seq } = r
			let { kodYerineSiraNo } = app.params.eIslem.kullanim
			res = ( kodYerineSiraNo ? seq.toString() : shKod ) ?? ''
			this._kodGosterim = res = res.trimEnd()
		}
		return res
	}
	get adiGosterim() {
		let { _adiGosterim: res } = this
		if (res == null) {
			let { rec: r } = this
			let { shAdi, shAdi2, ekAciklama } = r
			let { kural } = app.params.eIslem
			let kural_shAdi = kural.shAdi, kural_aciklama = kural.aciklama
			let kural_aciklamaKapsam = kural.aciklamaKapsam
			res = (
				kural_shAdi.sadeceAdi1mi ? shAdi :
				kural_shAdi.sadeceAdi2mi ? shAdi2 :
				`${shAdi} ${shAdi2}`
			) ?? ''
			if (!(kural_aciklamaKapsam.sadeceNotlarmi || kural_aciklamaKapsam.hepsimi) && kural_aciklama.satirIciUrunAdindami)
				res += ` (${ekAciklama || ''})`
			this._adiGosterim = res = res.trimEnd()
		}
		return res
	}
	get barkodGosterim() {
		let { _barkodGosterim: res } = this
		if (res == null) {
			let { rec: r } = this
			this._barkodGosterim = res = r.barkod || this.kodGosterim
		}
		return res
	}
	get ikOranlar() {
		let { rec: r } = this
		let ikYapilar = arrayFrom(TicIskYapi.getIskIter())
		let ikKeys = ikYapilar.map(_ => _.rowAttr)
		return ikKeys.map(k => r[k]).filter(Boolean)
	}
	get ikBedeller() {
		let { rec: r } = this
		let ikYapilar = arrayFrom(TicIskYapi.getIskIter())
		let ikKeys = ikYapilar.map(_ => _.rowAttr_bedel)
		return ikKeys.map(k => r[k]).filter(Boolean)
	}
	get sonucIskOran() { return this.rec.sonuciskoran }
	get topIskBedel() {
		let { ikBedeller } = this
		// ikBedeller.reduce((bu, sonuc) => sonuc + bu)
		return topla(null, ...ikBedeller)
	}
	get revizeRefKod() {
		let { stokRefKod } = this.rec
		return stokRefKod || this.kodGosterim
	}
	get brutBedelYapi() {
		let { brutBedel: tl, brutDvBedel: dv } = this.rec
		return new TLVeDVBedel({ tl, dv })
	}
	get sonucBedelYapi() {
		let { bedel: tl, dvBedel: dv } = this.rec
		return new TLVeDVBedel({ tl, dv })
	}
	get eMiktarYapi() {
		let { _eMiktarYapi: res, rec: r } = this
		if (res == null) {
			let { fiyataEsasmi, birliktemi } = app.params.eIslem.kural?.miktar ?? {}
			let { miktar: asilMiktar, brm, miktar2, brm2, fiyatVeriTipi: fTip } = r
		
			if (fiyataEsasmi) {
				asilMiktar = r[
					fTip == '2' ? 'miktar2' :
					fTip == 'K' ? 'koli' :
					'miktar'
				]
				
				// paket için 'ulsKod' karşılığı yok
				brm = fTip == '2' ? r.brm2 : fTip == 'K' ? null : r.brm
			}
			else if (!birliktemi)
				miktar2 = brm2 = null
			
			// brm == null için 'brm' kullanılır 
			res = {
				asilMiktar, brm,
				miktar2, brm2
			}
			this._eMiktarYapi = res
		}
		return res
	}

	constructor({ aciklamalar }) {
		super(...arguments)
		this.aciklamalar = aciklamalar ?? []
	}
	getBrutBedel({ dovizlimi }) {
		let { brutBedelYapi: by } = this
		return by[dovizlimi ? 'dv' : 'tl']
	}
	getSonucBedel({ dovizlimi }) {
		let { sonucBedelYapi: by } = this
		return by[dovizlimi ? 'dv' : 'tl']
	}
	getEFiyatYapi({ dovizlimi } = {}) {
		let key = dovizlimi ? 'dv' : 'tl'
		let cache = this._eFiyatYapi ??= {}
		let result = cache[key]
		if (result == null) {
			let { rec: r } = this
			let { dvFiyat, fiyat, bedel, fiyatVeriTipi } = r
			let { kural } = app.params.eIslem
			let { fiyat: kural_fiyat } = kural ?? {}
			
			let asilFiyat = dovizlimi ? dvFiyat : fiyat
			let netFiyat
			if (!kural_fiyat.brutmu) {
				let miktarAttr = fiyatVeriTipi == '2'
					? 'miktar2'
					: fiyatVeriTipi == 'K' ? 'koli' : 'miktar'
				let asilMiktar = r[miktarAttr]
				netFiyat = (dovizlimi ? r.dvBedel : bedel) / (asilMiktar || 1)
			}
			
			cache[key] = result = kural_fiyat.netmi
				? { asilFiyat: netFiyat, netFiyat: null }
				: { asilFiyat: asilFiyat, netFiyat }
		}
		return result
	}
	aciklamaEkle({ aciklama, value }) {
		this.aciklamalar.push(aciklama ?? value)
		return this
	}
}

class EIcmal extends CObject {
    static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	get bedelsizmi() {
		let { sonucBedelYapi: r } = this
		let { tl, dv } = r
		return !(tl || dv)
	}
	get brutBedelYapi() {
		let result = this._brutBedelYapi
		if (result === undefined) {
			let { belirtec2AnaTip2AltTip2Satirlar } = this
			let s2d = belirtec2AnaTip2AltTip2Satirlar['']?.DP ?? {}
			this._brutBedelYapi = result =
				( s2d.BR ?? s2d.NT )?.[0]?.bedelYapi ?? {}
					// ^-> Satır Brütten veya Netten kullanılabiliyor
		}
		return this._brutBedelYapi
	}
	get topIskBedelYapi() {
		let result = this._topIskBedelYapi
		if (result === undefined) {
			let { belirtec2AnaTip2AltTip2Satirlar } = this
			let altTip2Satirlar = belirtec2AnaTip2AltTip2Satirlar.H?.IS ?? []
			result = new TLVeDVBedel()
			for (let eSatir of values(altTip2Satirlar).flat()) { result.ekle(eSatir.bedelYapi) }
			this._topIskBedelYapi = result
		}
		return this._topIskBedelYapi
	}
	get hizmetler() {
		let result = this._hizmetler
		if (result === undefined) {
			result = this.satirlar.filter(s => s.hvTip == 'H')
			this._hizmetler = result
		}
		return this._hizmetler
	}
	getVergiEklenenYapi(e = {}) {
		let { sadeceEkleneceklermi = e.sadeceEklenecekler } = e
		let result = (this._vergiEklenenYapi ??= {})
		let subResult = result[sadeceEkleneceklermi]
		if (subResult === undefined) {
			subResult = new TLVeDVBedel()
			let anaTip2AltTip2Satirlar = this.belirtec2AnaTip2AltTip2Satirlar.V ?? {}
			for (let altTip2Satirlar of values(anaTip2AltTip2Satirlar)) {
				for (let eSatir of values(altTip2Satirlar).flat()) {
					let { bedelYapi } = eSatir
					if (sadeceEkleneceklermi && eSatir.dusulecekmi)
						bedelYapi = bedelYapi.negated
					subResult.ekle(bedelYapi)
				}
			}
			result[sadeceEkleneceklermi] = subResult
		}
		return subResult
	}
	get vergiHaricToplamYapi() {
		let { _vergiHaricToplamYapi: result, belirtec2AnaTip2AltTip2Satirlar, sonucBedelYapi } = this
		if (result === undefined) {
			let { vergiTip2Oran2EVergiRecs_tevkifatsiz } = this
			let kdvYapilar = values(vergiTip2Oran2EVergiRecs_tevkifatsiz)
				.map(r => values(r).flat())
				.flat()
			let topKdv = topla(_ => _.bedel, kdvYapilar)
			let topDvKdv = topla(_ => _.dvBedel, kdvYapilar)
			let vergiDahil = this.vergiDahilToplamYapi
			result = this._vergiHaricToplamYapi = {
				tl: (vergiDahil.tl ?? sonucBedelYapi.tl ?? 0) - topKdv,
				dv: (vergiDahil.dv ?? sonucBedelYapi.dv ?? 0) - topDvKdv
			}
		}
		return this._vergiHaricToplamYapi
	}
	get vergiDahilToplamYapi() {
		let { _vergiDahilToplamYapi: result, belirtec2AnaTip2AltTip2Satirlar } = this
		if (result === undefined)
			result = this._vergiDahilToplamYapi = belirtec2AnaTip2AltTip2Satirlar['']?.DP?.VD?.[0]?.bedelYapi ?? {}
		return this._vergiDahilToplamYapi
	}
	get vergiTip2Oran2EVergiRecs_tevkifatsiz() {
		let { _vergiTip2Oran2EVergiRecs_tevkifatsiz: result } = this
		if (result === undefined) {
			result = {}
			let anaTip2AltTip2Satirlar = this.belirtec2AnaTip2AltTip2Satirlar.V ?? {}
			for (let altTip2Satirlar of values(anaTip2AltTip2Satirlar))
				for (let eSatirlar of values(altTip2Satirlar))
				for (let eSatir of eSatirlar) {
					if (eSatir.anaTip == 'KD' && eSatir.altTip == 'TV')
						continue
					
					let { kod, oran } = eSatir
					let oran2Recs = result[kod] ??= {}
					let eSatirlar = oran2Recs[oran]
					if (!eSatirlar)
						oran2Recs[oran] = eSatirlar = []
					
					eSatirlar.push(eSatir)
				}
				
			
			this._vergiTip2Oran2EVergiRecs_tevkifatsiz = result
		}
		return this._vergiTip2Oran2EVergiRecs_tevkifatsiz
	}
	get vergiRecs_tevkifatlar() {
		let { _vergiRecs_tevkifatlar: result } = this
		if (result === undefined) {
			let { belirtec2AnaTip2AltTip2Satirlar } = this
			this._vergiRecs_tevkifatlar = result = belirtec2AnaTip2AltTip2Satirlar.V?.KD?.TV ?? []
		}
		return this._vergiRecs_tevkifatlar
	}
	get sonucBedelYapi() {
		let { _sonucBedelYapi: result } = this
		if (result === undefined) {
			let { belirtec2AnaTip2AltTip2Satirlar } = this
			this._sonucBedelYapi = result = belirtec2AnaTip2AltTip2Satirlar['']?.DP?.OD?.[0]?.bedelYapi ?? {}
		}
		return this._sonucBedelYapi
	}

	constructor(e = {}) {
		super(e)
		let getTLVeBedelObj = r =>
			( r && isPlainObject(r) ? TLVeDVBedel(r) : r ) ?? new TLVeDVBedel()
		
		let { satirlar = [], belirtec2AnaTip2AltTip2Satirlar = {} } = e
		extend(this, { satirlar, belirtec2AnaTip2AltTip2Satirlar })
	}
	getIcmalXSonucu({ dovizlimi }) {
		let { satirlar } = this
		let onEkci = text =>
			`${dovizlimi ? 'Dv. ' : ''}${text}`
		let xci = dovizlimi ? (bv => bv.dv) : (bv => bv.tl)
		
		let result = []
		for (let eSatir of satirlar) {
			let etiket = onEkci(eSatir.etiket)
			let bedel = xci(eSatir.bedelYapi)
			result.push({ etiket, bedel })
		}
		return result
	}
	dipEIcmalYukle({ recs }) {
		this.reset()
		let { satirlar, belirtec2AnaTip2AltTip2Satirlar } = this
		for (let rec of recs) {
			let eSatir = EIcmalSatirOrtak.newFor({ rec })
			if (!eSatir)
				continue
			
			let { hvTip, anaTip, altTip } = eSatir
			satirlar.push(eSatir)
			let anaTip2AltTip2Satirlar = belirtec2AnaTip2AltTip2Satirlar[hvTip] ??= {}
			let altTip2Satirlar = anaTip2AltTip2Satirlar[anaTip] ??= {}
			;(altTip2Satirlar[altTip] ??= [])
				.push(eSatir)
		}
		return this
	}
	reset(e) {
		deleteKeys(this, '_brutBedelYapi', '_topIskBedelYapi', '_hizmetler', '_vergiEklenenYapi',
			'_vergiHaricToplamYapi', '_vergiDahilToplamYapi', '_vergiTip2Oran2EVergiRecs_tevkifatsiz',
			'_vergiRecs_tevkifatlar', '_sonucBedelYapi')
		extend(this, { belirtec2AnaTip2AltTip2Satirlar: {}, satirlar: [] })
		return this
	}
}

class EIcmalSatirOrtak extends RowluYapi {
    static { globalThis[this.name] = this; this._key2Class[this.name] = this }
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
	get hvTip() { return this.rec.hvTip }
	get anaTip() { return this.rec.anaTip }
	get altTip() { return this.rec.altTip }
	get etiket() { return this.rec.xadi }
	get kod() { return this.rec.xkod }
	get oran() { return this.rec.oran }
	get bedel() { return this.rec.bedel }
	get dvBedel() { return this.rec.dvBedel }
	static getClass(e = {}) {
		let { rec = e } = e, { hvTip } = rec
		return this.tip2Sinif[hvTip] ?? EIcmalSatirDiger
	}
	static newFor(e) {
		let cls = this.getClass(e)
		return cls ? new cls(e) : null
	}
}

class EIcmalHizmet extends EIcmalSatirOrtak {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'H' }
	get etiket() {
		let { _etiket: res } = this 
		if (res === undefined) {
			res = (
				this.iskontomu ? 'İskonto' :
				this.nakliyemi ? 'Nakliye' :
				super.etiket
			)
			this._etiket = res
		}
		return res
	}
	get iskontomu() { return this.anaTip == 'IS' }
	get nakliyemi() { return this.anaTip == 'NK' }
}

class EIcmalVergi extends EIcmalSatirOrtak {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'V' }
	get dusulecekmi() { return this.tevkifatmi || this.mustahsilmi }
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
	get tevkifatmi() { return this.anaTip == 'KD' && this.altTip == 'TV' }
	get mustahsilmi() { return this.anaTip == 'MS' }
	get matrah() { return this.rec.matrah } get dvMatrah() { return this.rec.dvMatrah }
	
	getMatrahYapi({ dvKur } = {}) {
		let { matrah: tl, dvMatrah: dv } = this
		dv ??= dvKur ? roundToDvBedelFra(tl / dvKur) : 0
		return new TLVeDVBedel({ tl, dv })
	}
}

class EIcmalSatirDiger extends EIcmalSatirOrtak {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return '' }
}

class EIslBaslik_AliciBilgi extends EIslBaslik {
	get kod() { return this.rec.mustKod }
	get unvan() {
		let { rec: r } = this
		return r.mustUnvan ?? r.unvan
	}
	get ulkeAdi() { return this.rec.ulkeAdi }
	get ilKod() { return this.rec.ilkod }
	get ilAdi() { return this.rec.ilAdi }
	get adres() { return this.rec.adres }
	get yore() { return this.rec.yore } 
	get posta() { return this.rec.posta }
	get tel1() { return this.rec.tel1 }
	get tel2() { return this.rec.tel2 }
	get tel3() { return this.rec.tel3 }
	get eMail() { return this.rec.eMail }
	get fax() {
		let { rec: r } = this
		return r.fax ?? r.faks
	}
	get vknTckn() { return this.sahismi ? this.tckn : this.vkn }
	get sahismi() { return asBool(this.rec.sahismi) }
	get tckn() { return this.rec.tckn }
	get vkn() { return this.rec.vkn }
	get vergiDairesi() { return this.rec.vergiDairesi }
	get ticSicilNo() { return this.rec.ticSicilNo }
	get mersisNo() { return this.rec.mersisNo }
	get gibAlias() { return this.rec.gibAlias }
	get webURL() { return this.rec.webAdresi }
}
