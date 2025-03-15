class TSDetay extends MQDetay {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get mfSinif() { return null } static get tip() { return null } static get tipText() { return null }
	get tip() { return this.class.tip } get tipText() { return this.class.tipText }
	static get shSahaPrefix() { return null } static get shEtiket() { return null }
	get shdDetaymi() { return this.class.shdDetaymi } get stokGibimi() { return this.class.stokGibimi } get hizmetmi() { return this.class.hizmetmi } get demirbasmi() { return this.class.demirbasmi }
	get ekBilgimi() { return this.class.ekBilgimi } get aciklamami() { return this.class.aciklamami }
	get iskBedelYapi() {
		const {_temps} = this; let result = _temps.iskBedelYapi;
		if (result === undefined) {
			const {brutBedel, iskYapi} = this;
			result = _temps.iskBedelYapi = iskYapi ? iskYapi.getHesaplanmisIskontolarVeToplam({ brutBedel }) : null
		}
		return result
	}
	get iskBedelToplam() { return (this.iskBedelYapi || {}).toplam || 0 }
	get stokNetBedel() { return 0 }
	static getDetayTable(e) { return super.getDetayTable(e) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		this.orjBaslikListesiDuzenleIlk(e); this.orjBaslikListesiDuzenleAra(e); this.orjBaslikListesiDuzenleSon(e)
	}
	static orjBaslikListesiDuzenleIlk(e) { } static orjBaslikListesiDuzenleAra(e) { } static orjBaslikListesiDuzenleSon(e) { }
	static tekilOku_detaylar_queryDuzenle_ticari(e) { }
	uiSatirBedelHesapla(e) { this.uiSatirBedelHesaplaDevam(e); this.uiSatirBedelHesaplaSonrasi(e) }
	uiSatirBedelHesaplaDevam(e) { }
	uiSatirBedelHesaplaSonrasi(e) { this.uiSatirBedelHesaplaSonrasi_ara(e); const {fis} = e; if (fis) { fis.uiSatirBedelHesaplaSonrasi(e) } }
	uiSatirBedelHesaplaSonrasi_ara(e) { }
	iskBedelYapiReset() { delete this._temps.iskBedelYapi }
}
class TSSHDDetay extends TSDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get shdDetaymi() { return true } static get shTable() { return null } static get shAlias() { return null }
	static get shKodSaha() { const {shSahaPrefix} = this; return shSahaPrefix ? shSahaPrefix + 'kod' : null; }
	static get shAdiSaha() { const {shSahaPrefix} = this; return shSahaPrefix ? shSahaPrefix + 'adi' : null; }
	static getOrjKdvKodClause(e) { return null } static getAdiDegisirmiClause(e) { return null } static getKdvDegiskenmiClause(e) { return null }
	get dipHesabaEsasDegerler() { const result = super.dipHesabaEsasDegerler || {}; $.extend(result, { brutBedel: this.brutBedel, iskBedelYapi: this.iskBedelYapi, netBedel: this.netBedel }); return result }
	get ekVergiTipi() { return this.ekVergiYapi.tip }
	get tevkifatKod() { return this.ekVergiYapi.tevkifatKod } set tevkifatKod(value) { return this.ekVergiYapi.tevkifatKod = value }
	get istisnaKod() { return this.ekVergiYapi.istisnaKod } set istisnaKod(value) { return this.ekVergiYapi.istisnaKod = value }
	get kdvEkText() { return this.ekVergiYapi.kdvEkText }
	get eSHText() {
		let result = this._eSHText;
		if (result === undefined) {
			const eBilgi = this.eBilgi || {}, {efstokkod, efstokadi} = eBilgi;
			this._eSHText = efstokkod ? new CKodVeAdi({ kod: efstokkod, aciklama: (efstokadi || '') }).parantezliOzet({ styled: true }) : (efstokadi || '')
		}
		return result
	}
	get eIskOranText() { return (this.eBilgi || {}).iskoranstr || '' } get eMiktar() { return (this.eBilgi || {}).efmiktar || 0 } get eBedel() { return (this.eBilgi || {}).bedel || 0 }
	constructor(e) {
		e = e || {}; super(e); const {shSahaPrefix} = this.class;
		let value = e[`${shSahaPrefix}Kod`]; if (value != null) { this.shKod = value }
		value = e[`${shSahaPrefix}Adi`]; if (value != null) { this.shAdi = value }
		this.iskYapiPropertyleriOlustur(e); this.eBilgi = e.eBilgi;
		let prefix2OranlarSelector = { isk: 'iskOranlar', kam: 'kamOranlar' };
		for (let [key, value] of Object.entries(e)) {
			for (let [prefix, oranlarSelector] of Object.entries(prefix2OranlarSelector)) {
				if (!(value && key.startsWith(prefix))) { continue }
				if (typeof value != 'number') { value = asFloat(value) }
				let oranlar = this[oranlarSelector]; oranlar.push(value)
			}
		}
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e; $.extend(pTanim, {
			shKod: new PInstStr(), shAdi: new PInst(), miktar: new PInstNum('miktar'), brm: new PInstStr(), fiyat: new PInstNum('fiyat'),
			brutBedel: new PInstNum('brutbedel'), netBedel: new PInstNum('bedel'), takipNo: new PInstStr('dettakipno'), ekAciklama: new PInstStr('ekaciklama'),
			/* Ticari sahalar */
			iskYapi: new PInstClass(TicIskYapi), kdvKod: new PInstStr(), ekVergiYapi: new PInstClass(EkVergiYapi),
			kkegYuzde: new PInstNum('kkegyuzde'), adiDegisirmi: new PInstBool(), kdvDegiskenmi: new PInstBitBool(), altAciklama: new PInstStr()
		});
		if (!this.hizmetmi) { $.extend(pTanim, { yerKod: new PInstStr() }) }
	}
	static orjBaslikListesiDuzenleIlk(e) {
		super.orjBaslikListesiDuzenleIlk(e); this.orjBaslikListesiDuzenleDevam(e);
		const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 15 }).tipDecimal().noSql(),
			new GridKolon({ belirtec: 'brm', text: 'Br', genislikCh: 4 }).noSql()
		)
	}
	static orjBaslikListesiDuzenleDevam(e) {
		const {shEtiket, shKodSaha, shAlias} = this, {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'shKod', text: shEtiket, genislikCh: 25 }).noSql(),
			new GridKolon({
				belirtec: 'shAdi', text: `${shEtiket} Adı`, genislikCh: 45, /*sql: `${shAlias}.aciklama`,*/
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => value
			}).noSql()
		)
	}
	static orjBaslikListesiDuzenleAra(e) {
		super.orjBaslikListesiDuzenleAra(e); this.orjBaslikListesiDuzenleHMR(e); this.orjBaslikListesiDuzenleDevam2(e);
		const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'fiyat', text: 'Fiyat', genislikCh: 15 }).tipDecimal_fiyat().noSql(),
			new GridKolon({ belirtec: 'bedel', text: 'Net Bedel', genislikCh: 17 }).tipDecimal_bedel().noSql()
		)
	}
	static orjBaslikListesiDuzenleHMR(e) { }
	static orjBaslikListesiDuzenleDevam2(e) { }
	static orjBaslikListesiDuzenleSon(e) {
		super.orjBaslikListesiDuzenleSon(e); const {liste} = e;
		liste.push(new GridKolon({ belirtec: 'ekaciklama', text: 'Açıklama', minWidth: 100, maxWidth: 300 }).noSql())
	}
	static raporQueryDuzenle(e) {
		super.raporQueryDuzenle(e); const {sent, fisSinif, attrSet} = e;
		if (fisSinif.ticarimi) {
			if (attrSet.detayKdvOrani) { sent.har2KDVBagla() }
			if (attrSet.detayTevkifatOranx) { sent.fromIliski('vergihesap tevver', 'har.dettevhesapkod = tevver.kod') }
		}
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {aliasVeNokta, shTable, shAlias, shKodSaha} = this, {sent} = e;
		sent.fromIliski(`${shTable} ${shAlias}`, `${aliasVeNokta}${shKodSaha} = ${shAlias}.kod`);
		sent.sahalar.add(
			`${aliasVeNokta}${shKodSaha} shKod`, `${shAlias}.aciklama shAdi`, `${shAlias}.brm`,
			`${aliasVeNokta}miktar`, `${aliasVeNokta}fiyat`, `${aliasVeNokta}bedel`, `${aliasVeNokta}ekaciklama`
		);
		const {stokGibimi} = this;
		for (const item of HMRBilgi.hmrIter()) {
			const {kami, mfSinif, rowAttr, ioAttr, adiAttr} = item;
			const {table, tableAlias, kodSaha, adiSaha} = mfSinif || {}; if (!(kami && mfSinif)) { continue }
			if (stokGibimi) {
				sent.fromIliski(`${table} ${tableAlias}`, `${aliasVeNokta}${rowAttr} = ${tableAlias}.${kodSaha}`);
				sent.sahalar.add(`${aliasVeNokta}${rowAttr}`);
				if (adiAttr) { sent.sahalar.add(`${tableAlias}.${adiSaha} ${adiAttr}`); }
				mfSinif.hmr_queryEkDuzenle($.extend({}, e, { alias: tableAlias }))
			}
			else {
				sent.sahalar.add(`'' ${rowAttr}`); if (adiAttr) { sent.sahalar.add(`'' ${adiAttr}`); }
				mfSinif.hmr_queryEkDuzenle($.extend({}, e, { alias: tableAlias, bosClausemi: true }))
			}
		}
	}
	static tekilOku_detaylar_queryDuzenle_ticari(e) {
		super.tekilOku_detaylar_queryDuzenle_ticari(e); const {aliasVeNokta} = this, {sent} = e, {fis} = e, {yildizlimi} = fis;
		sent.fromIliski(`vergihesap kver`, `${aliasVeNokta}kdvhesapkod = kver.kod`);
		sent.sahalar.add(
			`kver.belirtec kdvbelirtec`,
			`${this.getAdiDegisirmiClause(e) || 'NULL'} adiDegisirmi`,
			`${this.getKdvDegiskenmiClause(e) || 'NULL'} kdvDegiskenmi`
		);
		if (yildizlimi) {
			const orjKdvKodClause = yildizlimi ? this.getOrjKdvKodClause(e) : `${aliasVeNokta}kdvhesapkod`;
			sent.sahalar.add(`${orjKdvKodClause} orjkdvkod`)
		}
		else { sent.sahalar.add(`${aliasVeNokta}kdvhesapkod orjkdvkod`) }
	}
	hostVars(e) { for (const key of ['fiyat', 'brutBedel', 'netBedel']) { this[key] = (this[key] || 0) } return super.hostVars(e) }
	hostVarsDuzenle(e) {
		e = e || {}; super.hostVarsDuzenle(e); const {fis, hv} = e, {shKodSaha, shAdiSaha, hizmetmi} = this.class;
		let {stokmu, siparismi} = fis?.class ?? {};
		hv[shKodSaha] = this.shKod; if (siparismi || hizmetmi) { delete hv.detyerkod } else { hv.detyerkod = this.getYerKod({ fis }) }
		const {fiyat, brutBedel, netBedel} = this;
		$.extend(hv, { ekranverifiyat: fiyat, belgefiyat: fiyat, belgebrutbedel: brutBedel, belgebedel: netBedel });
		if (stokmu) { for (let key of ['brutbedel', 'kkegyuzde']) { delete hv[key] } }
		let {hmr} = this; if (hmr) { hmr.hostVarsDuzenle(e); for (let {rowAttr, ioAttr} of hmr.hmrIter()) { hv[rowAttr] = this[ioAttr] } }
	}
	setValues(e) {
		e = e || {}; super.setValues(e); const {rec, fis} = e, {shKodSaha, shAdiSaha, hizmetmi} = this.class;
		let {stokmu, siparismi} = fis?.class ?? {};
		$.extend(this, {
			shKod: rec.shKod || rec.shkod || rec[shKodSaha], shAdi: rec.shAdi || rec.shadi || rec[shAdiSaha], brm: rec.brm,
			kdvDegiskenmi: asBool(rec.kdvDegiskenmi), adiDegisirmi: asBool(rec.adiDegisirmi), takipNo: rec.dettakipno || '', takipAdi: rec.takipadi,
		});
		if (!(siparismi || hizmetmi)) { $.extend(this, { yerKod: rec.detyerkod ?? '', yerAdi: rec.yeradi }) }
		let {hmr} = this; if (hmr) { hmr.setValues(e); for (let {rowAttr, ioAttr} of hmr.hmrIter()) { this[ioAttr] = rec[rowAttr] } }
	}
	ticariHostVarsDuzenle(e) {
		const {fis, hv} = e; $.extend(hv, { kdvhesapkod: this.kdvKod || '', perkdv: this.kdv || 0, perstopaj: this.stopaj || 0 }); this.ekVergiYapi.ticariHostVarsDuzenle(e);
		const {iskYapi} = this, iskHVEkle = e => {
			const {belirtec, rowAttrPrefix, oranMax} = e, oranlar = iskYapi[belirtec];
			for (let i = 0; i < oranMax; i++) { const oran = oranlar[i] || 0, rowAttr = `${rowAttrPrefix}oran${i + 1}`; hv[rowAttr] = oran }
		};
		for (const item of TicIskYapi.getIskYapiIter()) { iskHVEkle({ belirtec: item.key, rowAttrPrefix: item.belirtec, oranMax: item.maxSayi }) }
	}
	ticariSetValues(e) {
		const {fis, rec} = e;
		$.extend(this, { kdvKod: rec.kdvhesapkod, orjkdvKod: rec.orjkdvkod, kdvOrani: rec.kdvorani, kdv: rec.perkdv, otv: rec.perotv, stopaj: rec.perstopaj });
		this.ekVergiYapi.ticariSetValues(e);
		/* const {sabitIskOranMax, kampanyaIskOranMax} = app.params.fiyatVeIsk;*/
		const {iskYapi} = this, iskSetValues = e => {
			const {belirtec, rowAttrPrefix, oranMax} = e, oranlar = iskYapi[belirtec] = [];
			for (let i = 0; i < oranMax; i++) {
				const rowAttr = `${rowAttrPrefix}oran${i + 1}`, oran = rec[rowAttr] || 0;
				oranlar.push(oran);
			}
		};
		for (const item of TicIskYapi.getIskYapiIter()) { iskSetValues({ belirtec: item.key, rowAttrPrefix: item.belirtec, oranMax: item.maxSayi }) }
		/*iskSetValues({ belirtec: 'sabit', rowAttrPrefix: 'isk', oranMax: sabitIskOranMax });
		iskSetValues({ belirtec: 'kampanya', rowAttrPrefix: 'kam', oranMax: kampanyaIskOranMax });*/
		if (fis?.class?.ticarimi) {
			const {vergiBelirtecler} = TicariFis;
			for (const belirtec of vergiBelirtecler) { if (this[`${belirtec}Kod`] && this[`${belirtec}Orani`] == null) { this.vergileriHesapla(e) } }
		}
	}
	eBilgiSetValues_ilk(e) {
		super.eBilgiSetValues_ilk(e); const rec = this.eBilgi, gecerliMiktar = ((rec.efmiktar ?? rec.miktar) - rec.irsgecersiz) || 1;
		// fiyat verilmeyen hizmet gibi yerlerde
		let {fiyat, bedel} = rec; if (!fiyat && bedel && ((gecerliMiktar || 0) <= 1)) { fiyat = bedel }
		$.extend(this, {
			shKod: rec.shkod, shAdi: rec.shadi, miktar: gecerliMiktar, brm: rec.shbrm,
			fiyat, veriFiyat: fiyat, kdvKod: rec.kdvKod || '', orjkdvKod: rec.shkdvhesapkod
		}); this.miktar2Hesapla(e); this.uiSatirBedelHesapla(e)
	}
	eBilgiSetValues_son(e) { super.eBilgiSetValues_son(e); this.bedelHesapla({ ticarimi: true }) }
	getYerKod(e) { e = e || {}; const {fis} = e; return fis?.yerOrtakmi ? fis.yerKod : this.yerKod }
	uiSatirBedelHesaplaDevam(e) {
		super.uiSatirBedelHesaplaDevam(e); const {gridWidget, fis} = e;
		if (gridWidget) {
			gridWidget.setcellvalue(e.rowIndex, 'brutBedel', this.brutBedel);
			gridWidget.setcellvalue(e.rowIndex, 'netBedel', this.netBedel)
		}
		const ticarimi = e.ticarimi ?? (fis?.class?.ticarimi ?? false); this.bedelHesapla(e); if (ticarimi) { this.vergileriHesapla(e) }
	}
	miktar2Hesapla(e) { }
	bedelHesapla(e) {
		const brutBedel = this.brutBedel = roundToBedelFra(asFloat(this.miktar) * asFloat(this.fiyat));
		return this.netBedelHesapla(e)
	}
	netBedelHesapla(e) {
		e = e || {}; this.iskBedelYapiReset();
		const {fis} = e, {brutBedel} = this; let netBedel = brutBedel;
		const ticarimi = e.ticarimi ?? fis?.class?.ticarimi ?? false; if (ticarimi) { netBedel -= this.iskBedelToplam }
		return this.netBedel = netBedel
	}
	async vergileriHesapla(e) {
		const {netBedel} = this, {vergiBelirtecler} = TicariFis;
		for (const belirtec of vergiBelirtecler) {
			const kod = this[`${belirtec}Kod`], oran = kod ? await MQVergi.getKod2Oran({ belirtec, kod }) : null;
			if (oran != null) { this[`${belirtec}Orani`] = oran; this[belirtec] = roundToBedelFra(netBedel * oran / 100) }
		}
	}
	iskYapiPropertyleriOlustur(e) {
		const {iskYapi} = this; if (!iskYapi) { return }
		for (const item of iskYapi.class.getIskYapiIter()) {
			const {key, selector} = item;
			Object.defineProperty(this, selector, {
				get: () => { const {iskYapi} = this; return iskYapi[key] || [] },
				set: value => { const {iskYapi} = this; iskYapi[key] = value || []; }
			})
		}
	}
}
class TSStokHizmetDetay extends TSSHDDetay {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get shdmi() { return true }
	static getOrjStopajKodClause(e) { return null }
	static getAdiDegisirmiClause(e) { const {shAlias} = this; return `${shAlias}.adidegisir` }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, { stopajKod: new PInstStr() })
	}
	static orjBaslikListesiDuzenleDevam2(e) {
		super.orjBaslikListesiDuzenleDevam2(e); const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'miktar2', text: 'Miktar 2', genislikCh: 15 }).tipDecimal().noSql(),
			new GridKolon({ belirtec: 'brm2', text: 'Br2', genislikCh: 4 }).noSql()
		);
	}
	static raporQueryDuzenle(e) {
		super.raporQueryDuzenle(e); const {sent, fisSinif, attrSet} = e;
		if (fisSinif.ticarimi) { if (attrSet.detayStopajOrani) { sent.har2StopajBagla() } }
	}
	static tekilOku_detaylar_queryDuzenle_ticari(e) {
		super.tekilOku_detaylar_queryDuzenle_ticari(e); const {aliasVeNokta} = this, {sent} = e, {fis} = e, {yildizlimi} = fis;
		sent.fromIliski(`vergihesap sver`, `${aliasVeNokta}stopajhesapkod = sver.kod`);
		sent.sahalar.add(`sver.belirtec stopajbelirtec`);
		if (yildizlimi) {
			const orjStopajKodClause = yildizlimi ? this.getOrjStopajKodClause(e) : `${aliasVeNokta}stopajhesapkod`;
			sent.fromIliski(`vergihesap osver`, `${orjStopajKodClause} = osver.kod`);
			sent.sahalar.add(`osver.belirtec orjstopajbelirtec`, `${orjStopajKodClause} orjstopajkod`)
		}
		else { sent.sahalar.add(`sver.belirtec orjstopajbelirtec`, `${aliasVeNokta}stopajhesapkod orjstopajkod`) }
	}
	setValues(e) {
		super.setValues(e); const {rec} = e;
		$.extend(this, { brm2: rec.brm2, brmOrani: rec.brmorani })
	}
	ticariHostVarsDuzenle(e) {
		super.ticariHostVarsDuzenle(e); const {fis, hv} = e;
		$.extend(hv, { stopajhesapkod: this.stopajKod || '' });
	}
	ticariSetValues(e) {
		super.ticariSetValues(e); const {fis, rec} = e;
		$.extend(this, {
			stopajKod: rec.stopajhesapkod, orjstopajKod: rec.orjstopajkod,
			stopajBelirtec: rec.stopajbelirtec, orjstopajBelirtec: rec.orjstopajbelirtec
		})
	}
	eBilgiSetValues_ilk(e) {
		super.eBilgiSetValues_ilk(e); const rec = this.eBilgi;
		$.extend(this, { stopajKod: rec.stopajKod || '', orjstopajKod: rec.shstopajhesapkod, stopajOrani: rec.stopajorani })
	}
}
class TSStokDetayOrtak extends TSStokHizmetDetay {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get mfSinif() { return MQStok } static get stokGibimi() { return true }
	static get tip() { return 'stok' } static get tipText() { return 'Stok' } static get shSahaPrefix() { return 'stok' }
	static get table() { return 'pifstok' } static get shTable() { return 'stkmst' } static get shAlias() { return 'stk' } static get shEtiket() { return 'Stok' }
	static getOrjKdvKodClause(e) {
		const {shAlias} = this, {fis} = e;
		return fis.class.satismi ? `${shAlias}.satkdvhesapkod` : `${shAlias}.almkdvhesapkod`
	}
	static getOrjOtvKodClause(e) {
		const {shAlias} = this, {fis} = e;
		return fis.class.satismi ? `${shAlias}.satotvhesapkod` : `${shAlias}.almotvhesapkod`
	}
	static getOrjStopajKodClause(e) {
		const {shAlias} = this, {fis} = e;
		return fis.class.satismi ? `${shAlias}.satstopajhesapkod`: `${shAlias}.almstopajhesapkod`
	}
	get stokNetBedel() { return this.netBedel }

	constructor(e) { e = e || {}; super(e); this.hmrPropertyleriOlustur(e) }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			miktar2: new PInstNum('miktar2'), brm2: new PInstStr(), brmOrani: new PInstNum(),
			/* Ticari sahalar */ otvKod: new PInstStr(), hmr: new PInstClass(HMRBilgi)
		})
	}
	static raporQueryDuzenle(e) {
		super.raporQueryDuzenle(e); const {sent, fisSinif, attrListesi} = e;
		sent.har2StokBagla(); sent.har2PaketBagla();
		sent.fromIliski('stkgrup grp', 'stk.grupkod = grp.kod');
		sent.fromIliski('stkistgrup sigrp', 'stk.sistgrupkod = sigrp.kod');
		sent.har2HMRBagla(); sent.stok2BarkodBagla(); sent.stokGTIPBagla(); sent.har2VarsayilanUrunPaketBagla();
		if (!fisSinif.siparismi) { sent.fromIliski('stkyer dyer', 'har.detyerkod = dyer.kod') }
		sent.fromIliski('takipmst dtak', 'har.dettakipno = dtak.kod');
		if (fisSinif.ticarimi) { sent.har2KDVBagla(); sent.har2OTVBagla() }
		const {stokGenel} = app.params;
		if (stokGenel.kullanim.dayaniksizGaranti && stokGenel.hmr.lotNo) { sent.leftJoin({ alias: 'har', table: 'dayaniksizbitis dbit', on: ['har.stokkod = dbit.stokkod', 'har.lotno = dbit.lotno'] }) }
		for (const attr of attrListesi) {
			const Prefix = 'stokOem';
			if (attr && attr.startsWith(Prefix)) {
				const oemSiraStr = attr.substring(Prefix.length), oemAlias = `soem${oemSiraStr}`;
				sent.leftJoin({ alias: 'har', table: `stokoem ${oemAlias}`, on: [`har.stokkod = ${oemAlias}.stokkod`, `${oemAlias}.oemsira = ${oemSiraStr}`] })
			}
		}
	}
	static orjBaslikListesiDuzenleHMR(e) {
		super.orjBaslikListesiDuzenleHMR(e); const {tableAlias: alias} = this, {liste} = e;
		for (const item of HMRBilgi.hmrIter()) {
			const colDefs = item.asGridGosterimKolonlar({ alias }); if ($.isEmptyObject(colDefs)) { continue }
			for (let colDef of colDefs) { colDef.noSql() } liste.push(...colDefs)
		}
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {aliasVeNokta, shTable, shAlias, shKodSaha, shAdiSaha, hizmetmi} = this;
		let {sent, fisSinif} = e, {sahalar} = sent, {siparismi} = fisSinif ?? {};
		if (!(hizmetmi || siparismi)) { sent.fromIliski('stkyer yer', `${aliasVeNokta}detyerkod = yer.kod`) }
		sent.fromIliski('takipmst tak', `${aliasVeNokta}dettakipno = tak.kod`);
		sahalar.add(`${aliasVeNokta}miktar2`);
		if (hizmetmi || siparismi) { sahalar.add(`'' yerkod`) }
		sahalar.add(`${hizmetmi || siparismi ? `''` : 'yer.aciklama'} yeradi`, 'tak.aciklama takipadi', `${shAlias}.brm2`, `${shAlias}.brmorani`)
	}
	static tekilOku_detaylar_queryDuzenle_ticari(e) {
		super.tekilOku_detaylar_queryDuzenle_ticari(e); const {aliasVeNokta} = this, {sent, fis} = e, {yildizlimi} = fis;
		sent.fromIliski(`vergihesap otver`, `${aliasVeNokta}otvhesapkod = otver.kod`);
		sent.sahalar.add(`otver.belirtec otvbelirtec`);
		if (yildizlimi) {
			const orjOtvKodClause = yildizlimi ? this.getOrjOtvKodClause(e) : `${aliasVeNokta}otvhesapkod`;
			sent.fromIliski(`vergihesap ootver`, `${orjOtvKodClause} = ootver.kod`);
			sent.sahalar.add(`ootver.belirtec orjotvbelirtec`, `${orjOtvKodClause} orjotvkod`)
		}
		else { sent.sahalar.add(`otver.belirtec orjotvbelirtec`, `${aliasVeNokta}otvhesapkod orjotvkod`) }
	}
	hostVars(e) {
		const hv = super.hostVars(e), {hmr} = this;
		if (hmr) { $.extend(hv, hmr.hostVars(e)) } return hv
	}
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e) }
	setValues(e) { super.setValues(e); const {hmr} = this; if (hmr) { hmr.setValues(e) } }
	ticariHostVarsDuzenle(e) {
		super.ticariHostVarsDuzenle(e); const {fis, hv} = e;
		$.extend(hv, { otvhesapkod: this.otvKod || '' })
	}
	ticariSetValues(e) {
		super.ticariSetValues(e); const {fis, rec} = e;
		$.extend(this, { otvKod: rec.otvhesapkod, orjotvKod: rec.orjotvkod, otvBelirtec: rec.otvbelirtec, orjotvBelirtec: rec.orjotvbelirtec })
	}
	eBilgiSetValues_ilk(e) {
		super.eBilgiSetValues_ilk(e); const rec = this.eBilgi;
		$.extend(this, { brm2: rec.shbrm2, brmOrani: rec.shbrmorani, otvKod: rec.otvKod || '', orjotvKod: rec.shotvhesapkod, otvOrani: rec.otvorani });
		this.miktar2Hesapla()
	}
	miktar2Hesapla(e) {
		super.miktar2Hesapla(e); const {brm2, brmOrani} = this;
		if (brm2 && brmOrani) { this.miktar2 = roundToStokFra(this.miktar * brmOrani, brm2) }
		return this
	}
	hmrPropertyleriOlustur(e) {
		e = e ?? {}; const {hmr} = this; if (!hmr) { return }
		for (const {ioAttr, adiAttr} of hmr.hmrIter()) {
			Object.defineProperty(this, ioAttr, { get: () => this.hmr[ioAttr], set: value => this.hmr[ioAttr] = value });
			if (adiAttr) { Object.defineProperty(this, adiAttr, { get: () => this.hmr[adiAttr], set: value => this.hmr[adiAttr] = value }) }
			this[ioAttr] = e[ioAttr]; this[adiAttr] = e[adiAttr]
		}
	}
}
class TSStokDetay extends TSStokDetayOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get stokmu() { return true }
	static getDetayTable(e) { const fisSinif = e.fisSinif ?? e.fis?.class; return fisSinif.tsStokDetayTable }
}
class TSHizmetDetay extends TSStokHizmetDetay {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get mfSinif() { return MQHizmet } static get hizmetmi() { return true }
	static get tip() { return 'hizmet' } static get tipText() { return 'Hizmet' }
	static get shSahaPrefix() { return 'hizmet' } static get table() { return 'pifhizmet' }
	static get shTable() { return 'hizmst' } static get shAlias() { return 'hiz' } static get shEtiket() { return 'Hizmet' }
	static getOrjKdvKodClause(e) { const {shAlias} = this, {fis} = e; return fis.class.satismi ? `${shAlias}.gelkdvhesapkod` : `${shAlias}.gidkdvhesapkod` }
	static getOrjStopajKodClause(e) { const {shAlias} = this, {fis} = e; return fis.class.satismi ? `${shAlias}.gelstopajhesapkod`: `${shAlias}.gidstopajhesapkod` }
	static getKdvDegiskenmiClause(e) { const {shAlias} = this, {fis} = e; return fis.class.satismi ? `${shAlias}.gelkdvdegiskenmi` : `${shAlias}.gidkdvdegiskenmi` }
	static getDetayTable(e) { const fisSinif = e.fisSinif ?? e.fis?.class; return fisSinif.tsHizmetDetayTable }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); const {pTanim} = e; $.extend(pTanim, { konaklamaKod: new PInstStr() }) }
	static raporQueryDuzenle(e) {
		super.raporQueryDuzenle(e); const {sent} = e;
		sent.har2HizmetBagla(); sent.fromIliski('hizgrup hgrp', 'hiz.grupkod = hgrp.kod');
		sent.fromIliski('hizistgrup higrp', 'hiz.histgrupkod = higrp.kod');
		sent.leftJoin({ alias: 'har', table: 'kategoridetay kdet', on: 'har.kdetaysayac = kdet.kaysayac' })
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); const {sent} = e; sent.sahalar.add('NULL miktar2', 'NULL brm2', 'NULL brmorani') }
	static tekilOku_detaylar_queryDuzenle_ticari(e) {
		super.tekilOku_detaylar_queryDuzenle_ticari(e); const {aliasVeNokta} = this, {sent} = e;
		sent.fromIliski(`vergihesap konver`, `${aliasVeNokta}konaklamahesapkod = konver.kod`);
		sent.sahalar.add(`konver.belirtec konaklamabelirtec`, `konver.belirtec orjkonaklamabelirtec`, `${aliasVeNokta}konaklamahesapkod orjkonaklamakod`)
	}
	ticariHostVarsDuzenle(e) { super.ticariHostVarsDuzenle(e); const {hv} = e; $.extend(hv, { konaklamahesapkod: this.konaklamaKod || '' }) }
	ticariSetValues(e) {
		super.ticariSetValues(e); const {rec} = e;
		$.extend(this, {
			konaklamaKod: rec.konaklamahesapkod, orjkonaklamaKod: rec.orjkonaklamakod,
			konaklamaBelirtec: rec.konaklamabelirtec, orjkonaklamaBelirtec: rec.orjkonaklamabelirtec
		})
	}
	eBilgiSetValues_ilk(e) {
		super.eBilgiSetValues_ilk(e); const rec = this.eBilgi;
		$.extend(this, { konaklamaKod: rec.konaklamaKod || '', orjkonaklamaKod: rec.shkonaklamahesapkod, konaklamaOrani: rec.konaklamaorani })
	}
}
class TSDemirbasDetay extends TSSHDDetay {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get mfSinif() { return MQDemirbas } static get demirbasmi() { return true }
	static get tip() { return 'demirbas' } static get tipText() { return 'Demirbaş' } static get shSahaPrefix() { return 'demirbas' }
	static get table() { return 'pifdemirbas' } static get shTable() { return 'demmst' } static get shAlias() { return 'dem' } static get shEtiket() { return 'Demirbaş' }
	static getOrjKdvKodClause(e) {
		const {shAlias} = this, {fis} = e;
		return fis.class.satismi ? `${shAlias}.satkdvhesapkod` : `${shAlias}.almkdvhesapkod`
	}
	static getDetayTable(e) { const fisSinif = e.fisSinif ?? e.fis?.class; return fisSinif.tsDemirbasDetayTable }
	static raporQueryDuzenle(e) {
		super.raporQueryDuzenle(e); const {sent, fisSinif} = e;
		sent.har2DemirbasBagla(); sent.fromIliski('demgrup dgrp', 'dem.grupkod = dgrp.kod');
		if (!fisSinif.siparismi) { sent.fromIliski('stkyer dyer', 'har.detyerkod = dyer.kod'); }
		sent.fromIliski('takipmst dtak', 'har.dettakipno = dtak.kod');
		if (fisSinif.ticarimi) { sent.har2KDVBagla() }
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); const {sent} = e; sent.sahalar.add(`NULL miktar2`, `NULL brm2`, `NULL brmorani`) }
}
class TSAciklamaDetay extends TSDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } get gridKADesteklenmezmi() { return true }		/* grid hucre deger degisti kontrolu yapmasın */
	static get ekBilgimi() { return true } static get aciklamami() { return true } static get tip() { return 'aciklama' } static get tipText() { return 'Açıklama' }
	static getDetayTable(e) { const fisSinif = e.fisSinif ?? e.fis?.class; return fisSinif.tsAciklamaDetayTable }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { aciklama: new PInstStr('aciklama') }) }
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {aliasVeNokta} = this, {sent} = e;
		sent.sahalar.add(`${aliasVeNokta}aciklama shAdi`, `'' shKod`, `'' brm`, `0 miktar`, `0 fiyat`, `0 bedel`, `'' ekaciklama`)
	}
}