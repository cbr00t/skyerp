class DipSatir extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get satirBelirtec() { return null } get satirEtiket() { return this.satirBelirtec }
	get revizeAdi() { let revizeAdi = this.etiket; if (revizeAdi.endsWith('%')) { const {oran} = this; revizeAdi += oran.toString() } return revizeAdi }
	get matrahSatir() { return null }
	get defaultBasitVisible() { return true } get defaultVisible() { return true } get defaultOranEditable() { return false } get defaultBedelEditable() { return false }
	get defaultEkCSS() { const {satirBelirtec} = this; return 'dipSatir' + (satirBelirtec ? ` dipSatir-${satirBelirtec}` : '') }
	get _oran() { return this.oran } set _oran(value) { this.oran = value }
	get bedelYapi() { return new TLVeDVBedel(this) }
	get eDipBosHostVars() {
		const hv = {}; for (const key of ['pifsayac', 'sipsayac']) { hv[key] = null }
		for (const key of ['xkod', 'xadi', 'hvtip', 'anatip', 'alttip', 'hizmetkod', 'vergikod']) { hv[key] = '' }
		for (const key of ['ustoran', 'oran', 'bedel', 'dvbedel', 'matrah', 'dvmatrah' ]) { hv[key] = 0 }
		return hv
	}

	constructor(e) {
		e = e || {}; super(e); if (e.isCopy) return
		$.extend(this, {
			belirtec: e.belirtec, etiket: e.etiket, seq: asInteger(e.seq) || 0, oran: asFloat(e.oran) || 0, ekKod: e.ekKod || '',
			tlBedel: roundToBedelFra(e.tlBedel) || 0, dvBedel: roundToBedelFra(e.dvBedel) || 0,
			_dipIslemci: e.dipIslemci, _basitVisible: e._basitVisible == null ? this.defaultBasitVisible : asBool(e.basitVisible),
			_visible: e.visible == null ? this.defaultVisible : asBool(e.visible),
			_oranEditable: e.editable == null ? this.defaultOranEditable : asBool(e.oranEditable || e.editable),
			_bedelEditable: e.editable == null ? this.defaultBedelEditable : asBool(e.bedelEditable || e.editable)
		});
		if (!this.belirtec) this.belirtec = this.satirBelirtec;
		if (!this.etiket) this.etiket = this.satirEtiket;
		this._ekCSS = e.ekCSS == null ? this.defaultEkCSS : e.ekCSS;
	}
	vergiDahileEklenirmi(e) { return false } odenecektenDusulurmu(e) { return false }
	hesapla(e) { this.hesaplaDevam(e); this.hesaplaSonrasi(e) }
	hesaplaDevam(e) { }
	hesaplaSonrasi(e) { for (const key of ['tlBedel', 'dvBedel']) { let value = this[key]; if (value != null) { value = this[key] = roundToBedelFra(value) } } }
	icmalSonuclarinaEkle(icmalSonuclari) { return this }
	eDipHostVars(e) {
		const {bedelYapi} = this; if (bedelYapi.bosmu) { return null }
		const {revizeAdi, matrahSatir} = this;
		const hv = $.extend({}, this.eDipBosHostVars, { xadi: revizeAdi, bedel: bedelYapi.tl, dvbedel: bedelYapi.dv });
		if (matrahSatir) { $.extend(hv, { matrah: matrahSatir.tlBedel, dvmatrah: matrahSatir.dvBedel }) }
		let _e = $.extend({}, e, { hv }); this.eDipHostVarsDuzenle(_e); return hv
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

	hesaplaDevam(e) { super.hesaplaDevam(e); const {_temps} = this._dipIslemci; _temps.araDeger = roundToBedelFra(this.tlBedel || 0); }
	icmalSonuclarinaEkle(icmalSonuclari) { super.icmalSonuclarinaEkle(icmalSonuclari); icmalSonuclari.ciro.ekle(this.bedelYapi); return this }
	eDipHostVarsDuzenle(e) { super.eDipHostVarsDuzenle(e); const {hv} = e; $.extend(hv, { anatip: 'DP', alttip: 'BR' }) }
}
class DipSatir_IskOrtak extends DipSatir {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get iskontomu() { return true } get defaultEkCSS() { return super.defaultEkCSS + 'isk' }
	hesaplaSonrasi(e) {
		super.hesaplaSonrasi(e); const {_temps} = this._dipIslemci, hesapBedel = (this.tlBedel || 0);
		_temps.topIskBedel = roundToBedelFra((_temps.topIskBedel || 0) + hesapBedel)
	}
	icmalSonuclarinaEkle(icmalSonuclari) { super.icmalSonuclarinaEkle(icmalSonuclari); icmalSonuclari.ciro.cikar(this.bedelYapi); return this }
	eDipHostVarsDuzenle(e) { super.eDipHostVarsDuzenle(e); const {hv} = e; $.extend(hv, { anatip: 'IS', hvtip: 'H' }) }
}
class DipSatir_IskOran extends DipSatir_IskOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get iskOranmi() { return true } get defaultOranEditable() { return true }
	get satirBelirtec() { return `IORAN${this.seq}` } get satirEtiket() { return `İSK%` }
	hesaplaDevam(e) {
		super.hesaplaDevam(e); const {_temps} = this._dipIslemci;
		const hesapBedel = this.tlBedel = roundToBedelFra(_temps.araDeger * (this.oran || 0) / 100);
		_temps.araDeger = roundToBedelFra(_temps.araDeger - hesapBedel)
	}
}
class DipSatir_IskBedel extends DipSatir_IskOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get iskBedelmi() { return true } get defaultBedelEditable() { return true }
	get satirBelirtec() { return `IBEDEL${this.seq}` } get satirEtiket() { return `İSKONTO` }
	hesaplaDevam(e) {
		super.hesaplaDevam(e); const {_temps} = this._dipIslemci;
		_temps.araDeger = roundToBedelFra(_temps.araDeger - (this.tlBedel || 0));
	}
}
class DipSatir_Nakliye extends DipSatir {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get nakliyemi() { return true } get satirBelirtec() { return 'NAK' } get satirEtiket() { return 'Nakliye' }
	hesaplaDevam(e) {
		super.hesaplaDevam(e); const {_temps} = this._dipIslemci;
		_temps.araDeger = roundToBedelFra(_temps.araDeger + (this.tlBedel || 0))
	}
	icmalSonuclarinaEkle(icmalSonuclari) { super.icmalSonuclarinaEkle(icmalSonuclari); icmalSonuclari.ciro.ekle(this.bedelYapi); return this }
	eDipHostVarsDuzenle(e) { super.eDipHostVarsDuzenle(e); const {hv} = e; $.extend(hv, { anatip: 'NK', hvtip: 'H' }) }
}
class DipSatir_KdvVeMatrahOrtak extends DipSatir {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get kdvMatrahVeyaBedelmi() { return true } get _oran() { return '' }
	hesaplaDevam(e) { super.hesaplaDevam(e) }
}
class DipSatir_KdvMatrah extends DipSatir_KdvVeMatrahOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get kdvMatrahmi() { return true } get satirBelirtec() { return `KMAT${this.ekKod}` } get satirEtiket() { return `Kdv.Mat (%${this.oran})` }
	eDipHostVarsDuzenle(e) { super.eDipHostVarsDuzenle(e); const {oran} = this; const {hv} = e; $.extend(hv, { anatip: 'KD', alttip: 'MT', oran }) }
}
class DipSatir_KdvOrtak extends DipSatir_KdvVeMatrahOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	hesaplaDevam(e) { super.hesaplaDevam(e) }
}
class DipSatir_Kdv extends DipSatir_KdvOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get kdvBedelmi() { return true } get satirBelirtec() { return `KDV${this.ekKod}` } get satirEtiket() { return `KDV (%${this.oran})` }
	get matrahSatir() { const {belirtec2DipSatir} = this._dipIslemci, vergikod = this.ekKod; return belirtec2DipSatir[`KMAT${vergikod}`] }
	odenecektenDusulurmu(e) { const {fis} = e; return fis.class.ihracKaydiylami }
	hesaplaDevam(e) {
		super.hesaplaDevam(e); const {_temps} = this._dipIslemci;
		_temps.araDeger = roundToBedelFra(_temps.araDeger + (this.tlBedel || 0))
	}
	icmalSonuclarinaEkle(icmalSonuclari) { super.icmalSonuclarinaEkle(icmalSonuclari); icmalSonuclari.kdv.ekle(this.bedelYapi); return this }
	eDipHostVarsDuzenle(e) { super.eDipHostVarsDuzenle(e); const {ekKod, oran} = this, {hv} = e; $.extend(hv, { anatip: 'KD', oran, xkod: '0015', hvtip: 'V', vergikod: ekKod }) }
}
class DipSatir_Tevkifat extends DipSatir_KdvOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get tevkifatmi() { return true } get satirBelirtec() { return `TEV${this.ekKod}` } get satirEtiket() { return `TEV (${this.oran})` }
	/* get matrahSatir() { const {belirtec2DipSatir} = this._dipIslemci, vergikod = this.ekKod; return belirtec2DipSatir[`TEVMAT${vergikod}`] } */
	vergiDahileEklenirmi(e) { return true }
	hesaplaDevam(e) {
		super.hesaplaDevam(e); const {_temps} = this._dipIslemci;
		_temps.araDeger = roundToBedelFra(_temps.araDeger - (this.tlBedel || 0))
	}
	icmalSonuclarinaEkle(icmalSonuclari) { super.icmalSonuclarinaEkle(icmalSonuclari); icmalSonuclari.tevkifat.ekle(this.bedelYapi); return this }
		/* vergikod: değerinde oranx ve tevkifatkodu belirlenecek. ustoran,xkod,oran,vergikod atanacak */
	eDipHostVarsDuzenle(e) { super.eDipHostVarsDuzenle(e); const {oran} = this, {hv} = e; debugger; $.extend(hv, { anatip: 'KD', alttip: 'TV', xkod: '' }) }
}
class DipSatir_Sonuc extends DipSatir {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get satirBelirtec() { return 'SONUC' } get satirEtiket() { return 'SONUÇ' } get sonucmu() { return true }

	hesaplaDevam(e) {
		super.hesaplaDevam(e); const {_temps} = this._dipIslemci;
		this.tlBedel = roundToBedelFra(_temps.araDeger)
	}
	eDipHostVarsDuzenle(e) { super.eDipHostVarsDuzenle(e); const {hv} = e; $.extend(hv, { anatip: 'DP', alttip: 'NT' }) }
}
