class SablonluSatisSiparisFis extends SatisSiparisFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get konsinyemi() { return false }
	static get sablonSinif() { return MQSablonOrtak } static get templateSinif() { return SablonluSiparisFisTemplate } get templateSinif() { return this.class.templateSinif }
	static get detaySinif() { return SablonluSatisSiparisDetay } static get gridKontrolcuSinif() { return SablonluSatisSiparisGridci }
	static get numaratorGosterilirmi() { return this.templateSinif.numaratorGosterilirmi } static get dipGirisYapilirmi() { return this.templateSinif.dipGirisYapilirmi }
	/*static get numYapi() { let result = super.numYapi; if (result) { result.seri = 'ABC' } return result }*/
	static get aciklamaKullanilirmi() { return this.templateSinif.aciklamaKullanilirmi }
	static get teslimCariSaha() { return this.templateSinif.teslimCariSaha }
	constructor(e) { e = e ?? {}; super(e); e.fis = this; this.templateSinif.constructor(e) }
	static detaySiniflarDuzenle(e) { /* super yok - 'this.detaySiniflar' boş ise 'this.detaySinif' kullanılır */ }
	static getUISplitHeight(e) { e = e ?? {}; e.fisSinif = this; return this.templateSinif.getUISplitHeight(e) }
	static pTanimDuzenle(e) { e = e ?? {}; e.fisSinif = this; super.pTanimDuzenle(e); this.templateSinif.pTanimDuzenle(e) }
	static rootFormBuilderDuzenle(e) { e = e ?? {}; e.fisSinif = this; /* super.rootFormBuilderDuzenle(e) */ this.templateSinif.rootFormBuilderDuzenle(e) }
	static loadServerData_queryDuzenle(e) { e.fisSinif = this; super.loadServerData_queryDuzenle(e); this.templateSinif.loadServerData_queryDuzenle(e) }
	sablonYukleVeBirlestir(e) { e = e ?? {}; e.fis = this; return this.templateSinif.sablonYukleVeBirlestir(e) }
	async yukle(e) {
		e??= {}; $.extend(e, { fis: this, islem: e.islem || 'degistir' });
		let result = await this.templateSinif.ozelYukleIslemi(e);
		return result ?? await super.yukle(e)
	}
	async yaz(e) {
		e??= {}; $.extend(e, { fis: this, islem: e.islem || 'yeni' });
		let result = await this.templateSinif.ozelKaydetIslemi(e);
		if (result != null) { await this.kaydetSonrasiIslemler(e) }
		return result ?? await super.yaz(e)
	}
	async degistir(e) {
		let _e = e ?? {}; if (_e && !$.isPlainObject(_e)) { _e = { eskiFis: _e } }
		$.extend(_e, { fis: this, islem: e.islem || 'degistir' });
		let result = await this.templateSinif.ozelKaydetIslemi(_e);
		if (result != null) { await this.kaydetSonrasiIslemler(e) }
		return result ?? await super.degistir(e)
	}
	async sil(e) {
		e??= {}; $.extend(e, { fis: this, islem: e.islem || 'sil' });
		let result = await this.templateSinif.ozelKaydetIslemi(e);
		if (result != null) { await this.kaydetSonrasiIslemler(e) }
		return result ?? await super.sil(e)
	}
	async yukleSonrasiIslemler(e) { e = e ?? {}; e.fis = this; await super.yukleSonrasiIslemler(e); return await this.templateSinif.yukleSonrasiIslemler(e) }
	async yeniTanimOncesiIslemler(e) { e = e ?? {}; e.fis = this; await super.yeniTanimOncesiIslemler(e); return await this.templateSinif.yeniTanimOncesiIslemler(e) }
	async kaydetOncesiIslemler(e) {
		e??= {}; $.extend(e, { fis: this });
		let result = await this.templateSinif.kaydetOncesiIslemler(e);
		return result ?? await super.kaydetOncesiIslemler(e)
	}
	async kaydetSonrasiIslemler(e) {
		e??= {}; $.extend(e, { fis: this });
		let result = await this.templateSinif.kaydetSonrasiIslemler(e);
		return result ?? await super.kaydetSonrasiIslemler(e)
	}
	async kaydetVeyaSilmeSonrasiIslemler(e) { e = e ?? {}; e.fis = this; await super.kaydetVeyaSilmeSonrasiIslemler(e); return await this.templateSinif.kaydetVeyaSilmeSonrasiIslemler(e) }
	hostVarsDuzenle(e) { e.det = this; super.hostVarsDuzenle(e); this.templateSinif.hostVarsDuzenle(e) }
	setValues(e) { e.det = this; super.setValues(e); this.templateSinif.setValues(e) }
	getYazmaIcinDetaylar(e) { e = e ?? {}; e.fis = this; return this.templateSinif.getYazmaIcinDetaylar(e) }
	uiDuzenle_fisGirisIslemTuslari(e) { e = e ?? {}; e.fis = this; return this.templateSinif.uiDuzenle_fisGirisIslemTuslari(e) }
}
class SablonluKonsinyeAlimSiparisFis extends AlimSiparisFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get konsinyemi() { return true }
	static get sablonSinif() { return MQKonsinyeSablon } static get templateSinif() { return SablonluSiparisFisTemplate } get templateSinif() { return this.class.templateSinif }
	static get detaySinif() { return SablonluKonsinyeAlimSiparisDetay } static get gridKontrolcuSinif() { return SablonluKonsinyeAlimSiparisGridci }
	static get numaratorGosterilirmi() { return this.templateSinif.numaratorGosterilirmi } static get dipGirisYapilirmi() { return this.templateSinif.dipGirisYapilirmi }
	/*static get numYapi() { let result = super.numYapi; if (result) { result.seri = 'ABC' } return result }*/
	static get aciklamaKullanilirmi() { return this.templateSinif.aciklamaKullanilirmi }
	static get teslimCariSaha() { return this.templateSinif.teslimCariSaha }
	constructor(e) { e = e ?? {}; super(e); e.fis = this; this.templateSinif.constructor(e) }
	static detaySiniflarDuzenle(e) { /* super yok - 'this.detaySiniflar' boş ise 'this.detaySinif' kullanılır */ }
	static getUISplitHeight(e) { e = e ?? {}; e.fisSinif = this; return this.templateSinif.getUISplitHeight(e) }
	static pTanimDuzenle(e) { e = e ?? {}; e.fisSinif = this; super.pTanimDuzenle(e); this.templateSinif.pTanimDuzenle(e) }
	static rootFormBuilderDuzenle(e) { e = e ?? {}; e.fisSinif = this; /* super.rootFormBuilderDuzenle(e) */ this.templateSinif.rootFormBuilderDuzenle(e) }
	static loadServerData_queryDuzenle(e) { e.fisSinif = this; super.loadServerData_queryDuzenle(e); this.templateSinif.loadServerData_queryDuzenle(e) }
	sablonYukleVeBirlestir(e) { e = e ?? {}; e.fis = this; return this.templateSinif.sablonYukleVeBirlestir(e) }
	async yukle(e) {
		e??= {}; $.extend(e, { fis: this, islem: e.islem || 'degistir' });
		let result = await this.templateSinif.ozelYukleIslemi(e);
		return result ?? await super.yukle(e)
	}
	async yaz(e) {
		e??= {}; $.extend(e, { fis: this, islem: e.islem || 'yeni' });
		let result = await this.templateSinif.ozelKaydetIslemi(e);
		if (result != null) { await this.kaydetSonrasiIslemler(e) }
		return result ?? await super.yaz(e)
	}
	async degistir(e) {
		let _e = e ?? {}; if (_e && !$.isPlainObject(_e)) { _e = { eskiFis: _e } }
		$.extend(_e, { fis: this, islem: e.islem || 'degistir' });
		let result = await this.templateSinif.ozelKaydetIslemi(_e);
		if (result != null) { await this.kaydetSonrasiIslemler(e) }
		return result ?? await super.degistir(e)
	}
	async sil(e) {
		e??= {}; $.extend(e, { fis: this, islem: e.islem || 'sil' });
		let result = await this.templateSinif.ozelKaydetIslemi(e);
		if (result != null) { await this.kaydetSonrasiIslemler(e) }
		return result ?? await super.sil(e)
	}
	async yukleSonrasiIslemler(e) { e = e ?? {}; e.fis = this; await super.yukleSonrasiIslemler(e); return await this.templateSinif.yukleSonrasiIslemler(e) }
	async yeniTanimOncesiIslemler(e) { e = e ?? {}; e.fis = this; await super.yeniTanimOncesiIslemler(e); return await this.templateSinif.yeniTanimOncesiIslemler(e) }
	async kaydetOncesiIslemler(e) {
		e??= {}; $.extend(e, { fis: this });
		let result = await this.templateSinif.kaydetOncesiIslemler(e);
		return result ?? await super.kaydetOncesiIslemler(e)
	}
	async kaydetSonrasiIslemler(e) {
		e??= {}; $.extend(e, { fis: this });
		let result = await this.templateSinif.kaydetSonrasiIslemler(e);
		return result ?? await super.kaydetSonrasiIslemler(e)
	}
	async kaydetVeyaSilmeSonrasiIslemler(e) { e = e ?? {}; e.fis = this; await super.kaydetVeyaSilmeSonrasiIslemler(e); return await this.templateSinif.kaydetVeyaSilmeSonrasiIslemler(e) }
	hostVarsDuzenle(e) { e.fis = this; super.hostVarsDuzenle(e); this.templateSinif.hostVarsDuzenle(e) }
	setValues(e) { e.fis = this; super.setValues(e); this.templateSinif.setValues(e) }
	getYazmaIcinDetaylar(e) { e = e ?? {}; e.fis = this; return this.templateSinif.getYazmaIcinDetaylar(e) }
	uiDuzenle_fisGirisIslemTuslari(e) { e = e ?? {}; e.fis = this; return this.templateSinif.uiDuzenle_fisGirisIslemTuslari(e) }
}
class SablonluKonsinyeTransferFis extends TransferSiparisFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get konsinyemi() { return true }
	static get sablonSinif() { return MQKonsinyeSablon } static get templateSinif() { return SablonluSiparisFisTemplate } get templateSinif() { return this.class.templateSinif }
	static get detaySinif() { return SablonluKonsinyeTransferDetay } static get gridKontrolcuSinif() { return SablonluKonsinyeTransferGridci }
	static get numaratorGosterilirmi() { return this.templateSinif.numaratorGosterilirmi } static get dipGirisYapilirmi() { return this.templateSinif.dipGirisYapilirmi }
	/*static get numYapi() { let result = super.numYapi; if (result) { result.seri = 'ABC' } return result }*/
	static get aciklamaKullanilirmi() { return this.templateSinif.aciklamaKullanilirmi }
	static get teslimCariSaha() { return this.mustSaha }
	static detaySiniflarDuzenle(e) { /* super yok - 'this.detaySiniflar' boş ise 'this.detaySinif' kullanılır */ }
	static getUISplitHeight(e) { e = e ?? {}; e.fisSinif = this; return this.templateSinif.getUISplitHeight(e) }
	constructor(e) { e = e ?? {}; super(e); e.fis = this; this.templateSinif.constructor(e) }
	static pTanimDuzenle(e) { e = e ?? {}; e.fisSinif = this; super.pTanimDuzenle(e); this.templateSinif.pTanimDuzenle(e) }
	static rootFormBuilderDuzenle(e) { e = e ?? {}; e.fisSinif = this; /* super.rootFormBuilderDuzenle(e) */ this.templateSinif.rootFormBuilderDuzenle(e) }
	static loadServerData_queryDuzenle(e) { e.fisSinif = this; super.loadServerData_queryDuzenle(e); this.templateSinif.loadServerData_queryDuzenle(e) }
	sablonYukleVeBirlestir(e) { e = e ?? {}; e.fis = this; return this.templateSinif.sablonYukleVeBirlestir(e) }
	async yukle(e) {
		e??= {}; $.extend(e, { fis: this, islem: e.islem || 'degistir' });
		let result = await this.templateSinif.ozelYukleIslemi(e);
		return result ?? await super.yukle(e)
	}
	async yaz(e) {
		e??= {}; $.extend(e, { fis: this, islem: e.islem || 'yeni' });
		let result = await this.templateSinif.ozelKaydetIslemi(e);
		if (result != null) { await this.kaydetSonrasiIslemler(e) }
		return result ?? await super.yaz(e)
	}
	async degistir(e) {
		let _e = e ?? {}; if (_e && !$.isPlainObject(_e)) { _e = { eskiFis: _e } }
		$.extend(_e, { fis: this, islem: e.islem || 'degistir' });
		let result = await this.templateSinif.ozelKaydetIslemi(_e);
		if (result != null) { await this.kaydetSonrasiIslemler(e) }
		return result ?? await super.degistir(e)
	}
	async sil(e) {
		e??= {}; $.extend(e, { fis: this, islem: e.islem || 'sil' });
		let result = await this.templateSinif.ozelKaydetIslemi(e);
		if (result != null) { await this.kaydetSonrasiIslemler(e) }
		return result ?? await super.sil(e)
	}
	async yukleSonrasiIslemler(e) { e = e ?? {}; e.fis = this; await super.yukleSonrasiIslemler(e); return await this.templateSinif.yukleSonrasiIslemler(e) }
	async yeniTanimOncesiIslemler(e) { e = e ?? {}; e.fis = this; await super.yeniTanimOncesiIslemler(e); return await this.templateSinif.yeniTanimOncesiIslemler(e) }
	async kaydetOncesiIslemler(e) {
		e??= {}; $.extend(e, { fis: this });
		let result = await this.templateSinif.kaydetOncesiIslemler(e);
		return result ?? await super.kaydetOncesiIslemler(e)
	}
	async kaydetSonrasiIslemler(e) {
		e??= {}; $.extend(e, { fis: this });
		let result = await this.templateSinif.kaydetSonrasiIslemler(e);
		return result ?? await super.kaydetSonrasiIslemler(e)
	}
	async kaydetVeyaSilmeSonrasiIslemler(e) { e = e ?? {}; e.fis = this; await super.kaydetVeyaSilmeSonrasiIslemler(e); return await this.templateSinif.kaydetVeyaSilmeSonrasiIslemler(e) }
	hostVarsDuzenle(e) { e.fis = this; super.hostVarsDuzenle(e); this.templateSinif.hostVarsDuzenle(e) }
	setValues(e) { e.fis = this; super.setValues(e); this.templateSinif.setValues(e) }
	getYazmaIcinDetaylar(e) { e = e ?? {}; e.fis = this; return this.templateSinif.getYazmaIcinDetaylar(e) }
	uiDuzenle_fisGirisIslemTuslari(e) { e = e ?? {}; e.fis = this; return this.templateSinif.uiDuzenle_fisGirisIslemTuslari(e) }
}

class SablonluSiparisDetayOrtak extends TSStokDetay {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get templateSinif() { return SablonluSiparisDetayTemplate } get templateSinif() { return this.class.templateSinif }
	constructor(e) { e = e ?? {}; super(e); e.det = this; this.templateSinif.constructor(e) }
	static pTanimDuzenle(e) { e.detSinif = this; super.pTanimDuzenle(e); this.templateSinif.pTanimDuzenle(e) }
	async yukle(e) {
		e??= {}; $.extend(e, { det: this, islem: e.islem || 'degistir' });
		let result = await this.templateSinif.ozelYukleIslemi(e);
		return result ?? await super.yukle(e)
	}
	hostVarsDuzenle(e) { e.det = this; super.hostVarsDuzenle(e); this.templateSinif.hostVarsDuzenle(e) }
	setValues(e) { e.det = this; super.setValues(e); this.templateSinif.setValues(e) }
}
class SablonluSatisSiparisDetay extends SablonluSiparisDetayOrtak { static { window[this.name] = this; this._key2Class[this.name] = this } }
class SablonluKonsinyeAlimSiparisDetay extends SablonluSiparisDetayOrtak { static { window[this.name] = this; this._key2Class[this.name] = this } }
class SablonluKonsinyeTransferDetay extends SablonluSiparisDetayOrtak { static { window[this.name] = this; this._key2Class[this.name] = this } }

class SablonluSiparisGridciOrtak extends TicariGridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get templateSinif() { return SablonluSiparisGridciTemplate } get templateSinif() { return this.class.templateSinif }
	gridArgsDuzenle(e) { super.gridArgsDuzenle(e); e.gridci = this; this.templateSinif.gridArgsDuzenle(e) }
	tabloKolonlariDuzenle(e) { e.gridci = this; this.tabloKolonlariDuzenle_ortak(e) }
	tabloKolonlariDuzenle_ilk(e) { e.gridci = this; /* super.tabloKolonlariDuzenle_ilk(e); */ this.templateSinif.tabloKolonlariDuzenle_ilk(e) }
	tabloKolonlariDuzenle_ara(e) { e.gridci = this; /* super.tabloKolonlariDuzenle_ara(e); */ this.templateSinif.tabloKolonlariDuzenle_ara(e) }
	tabloKolonlariDuzenle_son(e) { e.gridci = this; this.templateSinif.tabloKolonlariDuzenle_son(e) }
	fis2Grid(e) { e.gridci = this; return super.fis2Grid(e) && this.templateSinif.fis2Grid(e) }
	grid2Fis(e) { e.gridci = this; return super.grid2Fis(e) && this.templateSinif.grid2Fis(e) }
	geriYuklemeIcinUygunmu(e) { e.gridci = this; return this.templateSinif.geriYuklemeIcinUygunmu(e) }
	gridVeriYuklendi(e) { e.gridci = this; this.templateSinif.gridVeriYuklendi(e) }
	miktarFiyatDegisti(e) { e.gridci = this; super.miktarFiyatDegisti(e); this.templateSinif.miktarFiyatDegisti(e) }
	bedelHesapla(e) { e.gridci = this; super.bedelHesapla(e); this.templateSinif.bedelHesapla(e) }
}
class SablonluSatisSiparisGridci extends SablonluSiparisGridciOrtak { static { window[this.name] = this; this._key2Class[this.name] = this } }
class SablonluKonsinyeAlimSiparisGridci extends SablonluSiparisGridciOrtak { static { window[this.name] = this; this._key2Class[this.name] = this } }
class SablonluKonsinyeTransferGridci extends SablonluSiparisGridciOrtak { static { window[this.name] = this; this._key2Class[this.name] = this } }
