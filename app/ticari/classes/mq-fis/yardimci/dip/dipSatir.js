class DipSatir extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar, '_dipIslemci'] }
	get satirBelirtec() { return null } get satirEtiket() { return this.satirBelirtec }
	get revizeAdi() { let revizeAdi = this.etiket; if (revizeAdi.endsWith('%')) { let {oran} = this; revizeAdi += oran.toString() } return revizeAdi }
	get matrahSatir() { return null }
	get defaultBasitVisible() { return true } get defaultVisible() { return true }
	get defaultOranEditable() { return false } get defaultBedelEditable() { return false }
	get defaultEkCSS() { let {satirBelirtec} = this; return 'dipSatir' + (satirBelirtec ? ` dipSatir-${satirBelirtec}` : '') }
	get _oran() { return this.oran } set _oran(value) { this.oran = value }
	get bedelYapi() { return new TLVeDVBedel(this) }
	get eDipBosHostVars() {
		let hv = {}; for (let key of ['pifsayac', 'sipsayac']) { hv[key] = null }
		for (let key of ['ba', 'xkod', 'xadi', 'hvtip', 'anatip', 'alttip', 'hizmetkod', 'vergikod']) { hv[key] = '' }
		for (let key of ['ustoran', 'oran', 'bedel', 'dvbedel', 'matrah', 'dvmatrah' ]) { hv[key] = 0 }
		return hv
	}

	constructor(e = {}) {
		super(e)
		if (e.isCopy)
			return
		$.extend(this, {
			belirtec: e.belirtec, etiket: e.etiket, seq: asInteger(e.seq) || 0, oran: asFloat(e.oran) || 0, ekKod: e.ekKod || '',
			tlBedel: roundToBedelFra(e.tlBedel) || 0, dvBedel: roundToBedelFra(e.dvBedel) || 0,
			_dipIslemci: e.dipIslemci, _basitVisible: e._basitVisible == null ? this.defaultBasitVisible : asBool(e.basitVisible),
			_visible: e.visible == null ? this.defaultVisible : asBool(e.visible),
			_oranEditable: e.editable == null ? this.defaultOranEditable : asBool(e.oranEditable || e.editable),
			_bedelEditable: e.editable == null ? this.defaultBedelEditable : asBool(e.bedelEditable || e.editable)
		});
		if (!this.belirtec) { this.belirtec = this.satirBelirtec }
		if (!this.etiket) { this.etiket = this.satirEtiket }
		this._ekCSS = e.ekCSS == null ? this.defaultEkCSS : e.ekCSS
	}
	vergiDahileEklenirmi(e) { return false } odenecektenDusulurmu(e) { return false }
	hesapla(e) { this.hesaplaDevam(e); this.hesaplaSonrasi(e) }
	hesaplaDevam(e) { }
	hesaplaSonrasi(e) { for (const key of ['tlBedel', 'dvBedel']) { let value = this[key] || 0; if (value != null) { value = this[key] = roundToBedelFra(value) } } }
	icmalSonuclarinaEkle(icmalSonuclari) { return this }
	eDipHostVars(e) {
		let {bedelYapi} = this; if (bedelYapi.bosmu) { return null }
		let {revizeAdi, matrahSatir, eDipBosHostVars} = this;
		let hv = { ...eDipBosHostVars, xadi: revizeAdi, bedel: bedelYapi.tl, dvbedel: bedelYapi.dv };
		if (matrahSatir) { $.extend(hv, { matrah: matrahSatir.tlBedel, dvmatrah: matrahSatir.dvBedel }) }
		this.eDipHostVarsDuzenle({ ...e, hv });
		return hv
	}
	eDipHostVarsDuzenle(e) { }
	oranEditable() { this._oranEditable = true; return this }
	bedelEditable() { this._bedelEditable = true; return this }
	readOnly() { this._oranEditable = this._bedelEditable = false; return this }
	basitHidden() { this._basitVisible = false; return this }
	hidden() { this._visible = false; return this }
	visible() { this._visible = true; return this }
}
class DipSatir_Brut extends DipSatir {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get satirBelirtec() { return 'BRUT' } get satirEtiket() { return 'BRÜT' }
	hesaplaDevam(e) { super.hesaplaDevam(e); let {_temps} = this._dipIslemci; _temps.araDeger = roundToBedelFra(this.tlBedel || 0); }
	icmalSonuclarinaEkle(icmalSonuclari) { super.icmalSonuclarinaEkle(icmalSonuclari); icmalSonuclari.ciro.ekle(this.bedelYapi); return this }
	eDipHostVarsDuzenle({ hv }) { super.eDipHostVarsDuzenle(...arguments); $.extend(hv, { anatip: 'DP', alttip: 'BR' }) }
}
class DipSatir_IskOrtak extends DipSatir {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get iskontomu() { return true } get defaultEkCSS() { return super.defaultEkCSS + 'isk' }
	hesaplaSonrasi(e) {
		super.hesaplaSonrasi(e); let {_temps} = this._dipIslemci, hesapBedel = (this.tlBedel || 0);
		_temps.topIskBedel = roundToBedelFra((_temps.topIskBedel || 0) + hesapBedel)
	}
	icmalSonuclarinaEkle(icmalSonuclari) {
		super.icmalSonuclarinaEkle(icmalSonuclari);
		icmalSonuclari.ciro.cikar(this.bedelYapi);
		return this
	}
	eDipHostVarsDuzenle({ hv, fisBA }) {
		super.eDipHostVarsDuzenle(...arguments);
		$.extend(hv, { anatip: 'IS', hvtip: 'H', ba: fisBA.tersBA()  /* gerekirse hizmet kodu konacak */ })
	}
}
class DipSatir_IskOran extends DipSatir_IskOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get iskOranmi() { return true } get defaultOranEditable() { return true }
	get satirBelirtec() { return `IORAN${this.seq}` } get satirEtiket() { return `İSK%` }
	hesaplaDevam(e) {
		super.hesaplaDevam(e); let {_temps} = this._dipIslemci;
		let hesapBedel = this.tlBedel = roundToBedelFra(_temps.araDeger * (this.oran || 0) / 100);
		_temps.araDeger = roundToBedelFra(_temps.araDeger - hesapBedel)
	}
}
class DipSatir_IskBedel extends DipSatir_IskOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get iskBedelmi() { return true } get defaultBedelEditable() { return true }
	get satirBelirtec() { return `IBEDEL${this.seq}` } get satirEtiket() { return `İSKONTO` }
	hesaplaDevam(e) {
		super.hesaplaDevam(e); let {_temps} = this._dipIslemci;
		_temps.araDeger = roundToBedelFra(_temps.araDeger - (this.tlBedel || 0));
	}
}
class DipSatir_Nakliye extends DipSatir {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get nakliyemi() { return true } get satirBelirtec() { return 'NAK' } get satirEtiket() { return 'Nakliye' }
	hesaplaDevam(e) {
		super.hesaplaDevam(e); let {_temps} = this._dipIslemci;
		_temps.araDeger = roundToBedelFra(_temps.araDeger + (this.tlBedel || 0))
	}
	icmalSonuclarinaEkle(icmalSonuclari) {
		super.icmalSonuclarinaEkle(icmalSonuclari);
		icmalSonuclari.ciro.ekle(this.bedelYapi);
		return this
	}
	eDipHostVarsDuzenle({ hv, fisBA }) {
		super.eDipHostVarsDuzenle(...arguments);
		$.extend(hv, { anatip: 'NK', hvtip: 'H', ba: fisBA  /* gerekirse hizmet kodu konacak */ })
	}
}
class DipSatir_KdvVeMatrahOrtak extends DipSatir {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get kdvMatrahVeyaBedelmi() { return true } get _oran() { return '' }
	hesaplaDevam(e) { super.hesaplaDevam(e) }
}
class DipSatir_KdvMatrah extends DipSatir_KdvVeMatrahOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get kdvMatrahmi() { return true } get satirBelirtec() { return `KMAT${this.ekKod}` } get satirEtiket() { return `Kdv.Mat (%${this.oran})` }
	hesaplaDevam(e) {
		super.hesaplaDevam(e) /*let {belirtec2DipSatir: d} = this._dipIslemci;*/
		/* ilk kdv matrahının ilk brüt ve ara değere oranı ile hesap edilecek:
				- hesaplama öncesi satırlardaki kdv matrahı = (%10 = 1000 | %20 = 1000)
				- BRUT = 2000
				- %20 isk. varsa = -400
				- ara değer = 1600
				- matrah = (%10) 1000 * 1600 / 2000 | (%20) = 1000 * 1600 / 200
		*/
	}
	eDipHostVarsDuzenle(e) { super.eDipHostVarsDuzenle(e); let {oran} = this; let {hv} = e; $.extend(hv, { anatip: 'KD', alttip: 'MT', oran }) }
}
class DipSatir_KdvOrtak extends DipSatir_KdvVeMatrahOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	hesaplaDevam(e) { super.hesaplaDevam(e) }
}
class DipSatir_Kdv extends DipSatir_KdvOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get kdvBedelmi() { return true } get satirBelirtec() { return `KDV${this.ekKod}` } get satirEtiket() { return `KDV (%${this.oran})` }
	get matrahSatir() { let {belirtec2DipSatir} = this._dipIslemci, vergikod = this.ekKod; return belirtec2DipSatir[`KMAT${vergikod}`] }
	odenecektenDusulurmu({ fis }) { return fis.class.ihracKaydiylami }
	hesaplaDevam(e) {
		super.hesaplaDevam(e); let {_temps, kdvKod2Yapi} = this._dipIslemci
		let matrahVeKdv = kdvKod2Yapi[this.ekKod] ??= { matrah: 0, bedel: 0 }
		_temps.araDeger = roundToBedelFra(_temps.araDeger + matrahVeKdv.bedel)
		//matrahVeKdv.bedel = roundToBedelFra(matrahVeKdv.bedel + this.tlBedel)
	}
	icmalSonuclarinaEkle(icmalSonuclari) { super.icmalSonuclarinaEkle(icmalSonuclari); icmalSonuclari.kdv.ekle(this.bedelYapi); return this }
	eDipHostVarsDuzenle({ hv, fisBA }) {
		super.eDipHostVarsDuzenle(...arguments); let {ekKod, oran} = this;
		$.extend(hv, { anatip: 'KD', oran, xkod: '0015', hvtip: 'V', vergikod: ekKod, ba: fisBA })
	}
}
class DipSatir_Tevkifat extends DipSatir_KdvOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get tevkifatmi() { return true } get satirBelirtec() { return `TEV${this.ekKod}` } get satirEtiket() { return `TEV (${this.oran})` }
	/* get matrahSatir() { let {belirtec2DipSatir} = this._dipIslemci, vergikod = this.ekKod; return belirtec2DipSatir[`TEVMAT${vergikod}`] } */
	vergiDahileEklenirmi(e) { return true }
	hesaplaDevam(e) {
		super.hesaplaDevam(e); let {_temps} = this._dipIslemci;
		_temps.araDeger = roundToBedelFra(_temps.araDeger - (this.tlBedel || 0))
	}
	icmalSonuclarinaEkle(icmalSonuclari) { super.icmalSonuclarinaEkle(icmalSonuclari); icmalSonuclari.tevkifat.ekle(this.bedelYapi); return this }
		/* vergikod: değerinde oranx ve tevkifatkodu belirlenecek. ustoran,xkod,oran,vergikod atanacak */
	eDipHostVarsDuzenle({ hv, fisBA }) {
		super.eDipHostVarsDuzenle(...arguments); let {oran} = this;
		$.extend(hv, { anatip: 'KD', alttip: 'TV', xkod: '', ba: fisBA.tersBA() })
	}
}
class DipSatir_Sonuc extends DipSatir {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get satirBelirtec() { return 'SONUC' } get satirEtiket() { return 'SONUÇ' } get sonucmu() { return true }
	hesaplaDevam(e) {
		super.hesaplaDevam(e); let {_temps} = this._dipIslemci;
		this.tlBedel = roundToBedelFra(_temps.araDeger)
	}
	eDipHostVarsDuzenle({ hv }) { super.eDipHostVarsDuzenle(...arguments); $.extend(hv, { anatip: 'DP', alttip: 'NT' }) }
}
