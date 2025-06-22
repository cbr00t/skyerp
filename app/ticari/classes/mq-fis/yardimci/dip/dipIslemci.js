class DipIslemci extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get deepCopyAlinmayacaklar() { return $.merge(super.deepCopyAlinmayacaklar, ['fis', '_detaylar', '_promise_dipSatirlari']) }
	get detaylar() { const {fis, _detaylar} = this; return (getFuncValue.call(this, _detaylar, { sender: this, fis }) ?? fis?.detaylar) }
	set detaylar(value) { this._detaylar = value }
	get icmalSonuclari() {
		const {dipSatirlari} = this; const result = {};
		for (const key of ['ciro', 'kdv', 'tevkifat', 'digerVergi']) { result[key] = new TLVeDVBedel() }
		for (const dipSatir of dipSatirlari) { dipSatir.icmalSonuclarinaEkle(result) }
		return result
	}
	get belirtec2DipSatir() {
		let result = this._belirtec2DipSatir;
		if (result == null) {
			let {dipSatirlari} = this; result = {};
			for (const dipSatir of dipSatirlari) { const {belirtec} = dipSatir; result[belirtec] = dipSatir }
			this._belirtec2DipSatir = result
		}
		return result
	}
	set belirtec2DipSatir(value) { this._belirtec2DipSatir = value }
	
	constructor(e) {
		e = e || {}; super(e); if (e.isCopy) return
		this._temps = {}; this.fis = e.inst || e.fis; this._detaylar = e.detaylar;
		this.offsetRefs = {}; this._promise_dipSatirlari = new $.Deferred();
	}
	ticariFisHostVarsDuzenle(e) {
		let {dipSatirlari} = this; if (!dipSatirlari) { this.getDipGridSatirlari(); dipSatirlari = this.dipSatirlari }
		let {fis, belirtec2DipSatir, icmalSonuclari} = this, {hv} = e;
		let bv = belirtec2DipSatir.BRUT.bedelYapi; $.extend(hv, { brut: bv.tl || 0, dvbrut: bv.dv || 0 });
		let tevBV = bv = icmalSonuclari.tevkifat; $.extend(hv, { dustevkifat: bv.tl || 0, dusdvtevkifat: bv.dv || 0 });
		bv = icmalSonuclari.kdv; $.extend(hv, { topkdv: (bv.tl || 0) - (tevBV?.tl || 0), topdvkdv: (bv.dv || 0) - (tevBV?.dv || 0) });
		/*bv = icmalSonuclari.digerVergi; $.extend(hv, { x: bv.tl || 0, xdv: bv.dv || 0 });*/
		bv = icmalSonuclari.ciro; $.extend(hv, { ciro: bv.tl || 0, dvciro: bv.dv || 0, bciro: bv.tl || 0 });
		bv = belirtec2DipSatir.SONUC.bedelYapi; $.extend(hv, { net: bv.tl || 0, dvnet: bv.dv || 0 });
		$.extend(hv, { kdvli: '*', otv2kdvmatdahildir: '', gkkp2kdvmatdahildir: '' });
		return this
	}
	getDipGridSatirlari(e) {
		e = e || {}; let {dipSatirlari} = this; if (!dipSatirlari) { this.dipSatirlariOlustur(e); dipSatirlari = this.dipSatirlari }
		const gelismisFlag = e.gelismis, _e = $.extend({}, e, { liste: [] });
		if (gelismisFlag) { this.dipGridSatirlariDuzenle_gelismis(_e) } else { this.dipGridSatirlariDuzenle_basit(_e) }
		dipSatirlari = _e.liste; if (!gelismisFlag) { dipSatirlari = dipSatirlari.filter(item => item._visible && item._basitVisible) }
		return dipSatirlari
	}
	dipSatirlariOlustur(e) {
		const {fis} = this, _e = $.extend({}, e || {}, { fis, dipIslemci: this }); delete this._belirtec2DipSatir;
		const dipSatirlari = this.dipSatirlari = fis.getDipGridSatirlari(_e), {belirtec2DipSatir} = this;
		for (const dipSatir of dipSatirlari) { belirtec2DipSatir[dipSatir.belirtec] = dipSatir }
		let {_promise_dipSatirlari} = this; if (_promise_dipSatirlari) { _promise_dipSatirlari.resolve(dipSatirlari) }
		return this
	}
	topluHesapla(e) { this.hesapcilarOnDegerleriYukle(e); this.satirlariHesapla(e); return this }
	satirDegisimIcinHesapla(e) {
		const {belirtec2DipSatir} = this, {yeni, eski} = e.degerler, satirNetArtis = yeni.netBedel - eski.netBedel;
		belirtec2DipSatir.BRUT.tlBedel = roundToBedelFra(belirtec2DipSatir.BRUT.tlBedel + satirNetArtis);				// Dip BRÜT = Satır Net Toplamı
		this.satirlariHesapla(e); return this
	}
	hesapcilarOnDegerleriYukle(e) {
		const {belirtec2DipSatir, detaylar} = this; let netToplam = 0;
		for (const det of detaylar) {
			let dipHesabaEsasDegerler = det.dipHesabaEsasDegerler || {};
			netToplam = roundToBedelFra(netToplam + dipHesabaEsasDegerler.netBedel || 0)
		}
		belirtec2DipSatir.BRUT.tlBedel = netToplam						// İleride İskonto ve Brütler gösterilebilir
	}
	satirlariHesapla(e) {
		// this.add(new DipSatir_Kdv({ dipIslemci: this, oran: 8 }), this.offsetRefs.kdv);
		let {offsetRefs, belirtec2DipSatir} = this, i, offsetRef_kdv = offsetRefs.kdv;
		let brut = belirtec2DipSatir.BRUT.tlBedel, dipSatirlar = Object.values(belirtec2DipSatir);
		// kdv oncesine kadar
		for (i = 0; i < dipSatirlar.length; i++) {
			let dipSatir = dipSatirlar[i]; dipSatir.hesapla(e);
			if (offsetRef_kdv && dipSatir == offsetRef_kdv) { break }
		}
		let {araDeger} = this._temps;
		let yansitilacakIskonto = brut - araDeger, dipSatir_nakliye = belirtec2DipSatir.NAK;
		let {fis} = this, {alimmi, kdvKod_nakliye} = fis.class;
		let yansitilacakNakliye = alimmi && dipSatir_nakliye ? dipSatir_nakliye.tlBedel : 0, {fisTopNet} = fis;
		let kdvKod2Yapi = this.kdvKod2Yapi = {}, detaylar = this.detaylar || fis.detaylar;
		for (const det of detaylar) {
			let {netBedel, stokNetBedel, kdvKod} = det;
			let dagitDipIskBedel = det.dagitDipIskBedel = roundToBedelFra(netBedel * yansitilacakIskonto / fisTopNet);
			let vergiMatrah = det.vergiMatrah = roundToBedelFra(netBedel - dagitDipIskBedel);
			let dagitDipNakBedel = det.dagitDipNakBedel = roundToBedelFra(stokNetBedel * yansitilacakNakliye / fisTopNet);
			// const {kdvKod, kdvOrani} = det;
			if (kdvKod) {
				let {kdvOrani} = det; if (!kdvOrani) {
					let {kod2VergiBilgi} = MQVergi.globals.belirtec2Globals.kdv;
					kdvOrani = det.kdvOrani = kod2VergiBilgi?.[kdvKod]?.oran
					/* det.netBedelHesapla() */
				}
				if (!kdvOrani) { continue }
				let vergiYapi = new TicVergiYapi({ kod: kdvKod, oran: kdvOrani });
				let kdv = det.kdv = roundToBedelFra(vergiMatrah * kdvOrani / 100);
				/* !! MD - çoklu kdv ve dip isk - detaylar bitiminde hesap yapılır */
				vergiYapi.matrah += vergiMatrah; vergiYapi.bedel += kdv;
				if (dipSatir_nakliye && kdvKod == kdvKod_nakliye) { vergiYapi.ekMatrah += dipSatir_nakliye.tlBedel }
				kdvKod2Yapi[kdvKod] = vergiYapi
			}
		}
		dipSatirlar = this.dipSatirlari = this.dipSatirlari.filter(dipSatir => !dipSatir.kdvMatrahVeyaBedelmi);
		for (let [belirtec, dipSatir] of Object.entries(belirtec2DipSatir)) {
			if (dipSatir.kdvMatrahVeyaBedelmi) { delete belirtec2DipSatir[belirtec] }
		}
		let kdvOran2YapiListe = {};
		for (let [kdvKod, vergiYapi] of Object.entries(kdvKod2Yapi)) {
			let {oran} = vergiYapi; (kdvOran2YapiListe[oran] = kdvOran2YapiListe[oran] || []).push(vergiYapi)
		}
		let kdvOranListe = new Uint8Array(Object.keys(kdvOran2YapiListe)).sort();
		for (let oran of kdvOranListe) {
			let vergiYapilar = kdvOran2YapiListe[oran];
			for (let vergiYapi of vergiYapilar) {
				let {kod: kdvKod} = vergiYapi, kdvSatir = { matrah: belirtec2DipSatir[`KMAT${kdvKod}`], kdv: belirtec2DipSatir[`KDV${kdvKod}`] };
				if (!kdvSatir.matrah) {
					let dipSatir = kdvSatir.matrah = new DipSatir_KdvMatrah({ dipIslemci: this, ekKod: kdvKod, oran: vergiYapi.oran, visible: !!vergiYapi.oran }).basitHidden();
					this.add(dipSatir, offsetRef_kdv); offsetRef_kdv = dipSatir
				}
				if (!kdvSatir.kdv) {
					let dipSatir = kdvSatir.kdv = new DipSatir_Kdv({ dipIslemci: this, ekKod: kdvKod, oran: vergiYapi.oran, visible: !!vergiYapi.oran })/*.basitHidden()*/;
					this.add(dipSatir, offsetRef_kdv); offsetRef_kdv = dipSatir
				}
				kdvSatir.matrah.tlBedel = vergiYapi.topMatrah;
				kdvSatir.kdv.tlBedel = vergiYapi.bedel;
				for (let dipSatir of Object.values(kdvSatir)) {
					dipSatir.hesapla(e) }
			}
		}
		i = dipSatirlar.indexOf(offsetRef_kdv);
		// kdv sonrasi
		for (i = i + 1; i < dipSatirlar.length; i++) {
			let dipSatir = dipSatirlar[i]; dipSatir.hesapla(e) }
	}
	dipGridSatirlariDuzenle_basit(e) {
		const {belirtec2DipSatir} = this, result = e.liste;
		result.push(
			belirtec2DipSatir.BRUT,
			new DipSatir_IskBedel({ belirtec: 'ISKNAK', etiket: 'İsk/Nak', dipIslemci: this }),
			new DipSatir_IskBedel({ belirtec: 'TOPKDV', etiket: 'KDV', dipIslemci: this }),
			new DipSatir_Tevkifat({ belirtec: 'TOPTEV', etiket: 'Tevkifat', dipIslemci: this }),
			belirtec2DipSatir.SONUC
		);
		const _belirtec2DipSatir = {};
		for (const dipSatir of result) { dipSatir.readOnly(); _belirtec2DipSatir[dipSatir.belirtec] = dipSatir }
		for (const dipSatir of Object.values(belirtec2DipSatir)) {
			if (dipSatir.iskontomu) _belirtec2DipSatir.ISKNAK.tlBedel += dipSatir.tlBedel
			else if (dipSatir.nakliyemi) _belirtec2DipSatir.ISKNAK.tlBedel -= dipSatir.tlBedel
			else if (dipSatir.kdvBedelmi) _belirtec2DipSatir.TOPKDV.tlBedel += dipSatir.tlBedel
			else if (dipSatir.tevkifatmi) _belirtec2DipSatir.TOPTEV.tlBedel += dipSatir.tlBedel
		}
		for (const dipSatir of result) { if (!dipSatir.tlBedel) { dipSatir.hidden() } }
		for (let key of ['BRUT', 'SONUC', 'TOPKDV']) { _belirtec2DipSatir[key]?.visible() }
	}
	dipGridSatirlariDuzenle_gelismis(e) { const result = e.liste; result.push(...this.dipSatirlari) }
	add(e, _ref) {
		e = e || {};
		let {dipSatirlari} = this; if (!dipSatirlari) { this.dipSatirlariOlustur(); dipSatirlari = this.dipSatirlari }
		const item = e.item === undefined ? e : e.item, {belirtec} = item; let {belirtec2DipSatir} = this;
		if (belirtec2DipSatir[belirtec]) return this
		const ref = e.item === undefined ? _ref : e.ref, ind = ref ? dipSatirlari.indexOf(ref) : -1;
		if (ind) { arrayInsert(dipSatirlari, ind + 1, item) } else { dipSatirlari.push(item) }
		delete this._belirtec2DipSatir; return this
	}
}
