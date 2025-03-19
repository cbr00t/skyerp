class MQOrtakFis extends MQDetayli {
    static { window[this.name] = this; this._key2Class[this.name] = this }	
	static get tableAlias() { return 'fis' } static get ayrimTable() { return 'tfisayrim' } static get noSaha() { return 'no' }
	static get dipSinif() { return DipIslemci } static get dipKullanilirmi() { return false } static get dipNakliyeKullanilirmi() { return false }
	static get dipIskOranSayi() { return 0 } static get dipIskBedelSayi() { return 0 }
	static get tsnKullanilirmi() { return true } static get numYapi() { return null }
	static get numaratorGosterilirmi() { return true } static get dipGirisYapilirmi() { return true }
	get numYapi() { return this.class.numYapi } get fisNox() { return this.tsn?.asText() }
	get dipIslemci() {
		let result = this._dipIslemci; if (result === undefined) { this.dipOlustur(); result = this._dipIslemci }
		return result
	}
	set dipIslemci(value) { this._dipIslemci = value }
	get dipGridSatirlari() { return null }
	get fisTopBrut() {
		let toplam = 0; const {detaylar} = this; if (!detaylar) { return 0 }
		for (const det of detaylar) { toplam += (det.brutBedel || 0) }
		return roundToBedelFra(toplam)
	}
	get fisTopNet() {
		let toplam = 0; const {detaylar} = this; if (!detaylar) { return 0 }
		for (const det of detaylar) { toplam += (det.netBedel || 0) }
		return roundToBedelFra(toplam)
	}
	get fisBaslikOlusturucular() { const _e = { liste: [] }; this.fisBaslikOlusturucularDuzenle(_e); return _e.liste }
	get bakiyeciler() { return [] }
	
	constructor(e) {
		e = e || {}; super(e); if (e.isCopy) { return }
		const {noSaha} = this.class; if (noSaha) { this.fisNo = e.no ?? e.fisNo ?? this.no }
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e, {noSaha} = this;
		if (noSaha) { pTanim.fisNo = new PInst() }
	}
	static secimlerDuzenleSon(e) {
		super.secimlerDuzenleSon(e); const {secimler: sec} = e;
		sec.grupTopluEkle([ { kod: 'teknik', aciklama: 'Teknik', renk: '#eee', zeminRenk: 'orangered', kapalimi: true } ]);
		sec.secimTopluEkle({ sayac: new SecimInteger({ etiket: 'Belge ID' }) });
		sec.whereBlockEkle(e => {
			const {aliasVeNokta, sayacSaha} = this, {where: wh, secimler: sec} = e;
			wh.basiSonu(sec.sayac, `${aliasVeNokta}${sayacSaha}`)
		})
	}
	static getRootFormBuilder(e) { return this.getRootFormBuilder_fis(e) }
	static rootFormBuilderDuzenle(e) { }
	static rootFormBuilderDuzenleSonrasi_ayrimVeOzelSahalar_getParentBuilder(e) { return e.builders.baslikForm.builders[2] }
	static rootFormBuilderDuzenle(e) { e = e || {}; super.rootFormBuilderDuzenle(e); this.rootFormBuilderDuzenle_ilk(e); this.rootFormBuilderDuzenle_ara(e); this.rootFormBuilderDuzenle_son(e) }
	static rootFormBuilderDuzenle_ilk(e) { this.forAltYapiClassesDo('rootFormBuilderDuzenle_ilk', e) } static rootFormBuilderDuzenle_ara(e) { this.forAltYapiClassesDo('rootFormBuilderDuzenle_ara', e) }
	static rootFormBuilderDuzenle_son(e) { this.forAltYapiClassesDo('rootFormBuilderDuzenle_son', e) }
	static standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e); this.standartGorunumListesiDuzenle_ilk(e); this.standartGorunumListesiDuzenle_ara(e); this.standartGorunumListesiDuzenle_son(e) }
	static standartGorunumListesiDuzenle_ilk(e) { this.forAltYapiClassesDo('standartGorunumListesiDuzenle_ilk', e) } static standartGorunumListesiDuzenle_ara(e) { this.forAltYapiClassesDo('standartGorunumListesiDuzenle_ara', e) }
	static standartGorunumListesiDuzenle_son(e) { this.forAltYapiClassesDo('standartGorunumListesiDuzenle_son', e) }
	static orjBaslikListesiDuzenle(e) { super.orjBaslikListesiDuzenle(e); this.orjBaslikListesiDuzenle_ilk(e); this.orjBaslikListesiDuzenle_ara(e); this.orjBaslikListesiDuzenle_son(e) }
	static orjBaslikListesiDuzenle_ilk(e) { this.forAltYapiClassesDo('orjBaslikListesiDuzenle_ilk', e) } static orjBaslikListesiDuzenle_ara(e) { this.forAltYapiClassesDo('orjBaslikListesiDuzenle_ara', e) }
	static orjBaslikListesiDuzenle_son(e) { this.forAltYapiClassesDo('orjBaslikListesiDuzenle_son', e) }
	fisBaslikOlusturucularDuzenle(e) { }
	dipOlustur(e) {
		let result = null, {dipKullanilirmi} = this.class;
		if (dipKullanilirmi) { const {dipSinif} = this.class, fis = this; if (dipSinif) { result = this.dipIslemci = new dipSinif({ fis }) } }
		return result
	}
	getDipGridSatirlari(e) { e.liste = []; this.dipGridSatirlariDuzenle(e); return e.liste }
	dipGridSatirlariDuzenle(e) { }
	kopyaIcinDuzenle(e) {
		super.kopyaIcinDuzenle(e); this.fisNo = 0;
		for (const det of this.detaylar) { det.donusumBilgileriniSil(e) }
		this.donusumBilgileriniSil(e)
	}
	async disKaydetIslemi(e) {
		e = e || {}; let {noSaha} = this.class, {numarator: num, fisNo} = this;
		if (!num) { const {numYapi} = this; if (numYapi) { num = this.numarator = numYapi.deepCopy() } }
		if (noSaha && !fisNo && num) { await num.yukle(e); const {seri, noYil} = num; fisNo = num.sonNo; $.extend(this, { seri, noYil, fisNo }) }
		let result = await this.disKaydetOncesiIslemler(e); if (result === false) { return false }
		e.proc = async e => {
			let result = await this.disKaydetOncesi_trn(e); if (result === false) { return false }
			if (num && fisNo) { while (await this.varmi(e)) { fisNo = this.fisNo = (await num.kesinlestir(e)).sonNo } }
			result = await this.disKaydetSonrasi_trn(e); if (result === false) { return false }
			return await this.yaz(e)
		};
		const trnResult = await app.sqlTrnDo(e); result = await this.disKaydetSonrasiIslemler(e); if (result === false) { return false }
		return trnResult?.result ?? trnResult
	}
	disKaydetOncesi_trn(e) { } disKaydetSonrasi_trn(e) { }
	disKaydetOncesiIslemler(e) { } disKaydetSonrasiIslemler(e) { }
	async yeniSonrasiIslemler(e) { await super.yeniSonrasiIslemler(e); let tip2Yapi = await this.getTip2BakiyeciYapi(e) ?? {}; await this.bakiyeYapilarKaydet({ ...e, tip2Yapi }) }
	async degistirOncesiIslemler(e) { await super.degistirOncesiIslemler(e); e.eski_tip2BakiyeciYapi = await this.getTip2BakiyeciYapi(e) ?? {} }
	async degistirSonrasiIslemler(e) {				/* degistirOncesiIslemler(e) den elde edilen değerler (-), yeni değerler (+) olarak birleştirilerek güncellenir */
		await super.degistirSonrasiIslemler(e); let {eski_tip2BakiyeciYapi: eski_tip2Yapi} = e, tip2Yapi = await this.getTip2BakiyeciYapi(e) ?? {}, query = new MQToplu();
		let getAnah = values => { if (!$.isArray(values)) { values = Object.values(values) } return values.map(x => x?.toString()).join(delimWS) };
		let tip2AnahStr2Bilgi = {}; if (!$.isEmptyObject(tip2Yapi)) {
			for (let [tip, yapi] of Object.entries(tip2Yapi)) {
				let anahStr2Bilgi = tip2AnahStr2Bilgi[tip] = tip2AnahStr2Bilgi[tip] ?? {};
				for (let rec of yapi.bakiyeYapilar) { anahStr2Bilgi[getAnah(rec.sabit)] = rec }
			}
		}
		if (!$.isEmptyObject(eski_tip2Yapi)) {
			for (let [tip, eski_yapi] of Object.entries(eski_tip2Yapi)) {
				let {bakiyeci, bakiyeYapilar: eski_bakiyeYapilar} = eski_yapi, {table} = bakiyeci;
				let yapi = tip2Yapi[tip] = tip2Yapi[tip] ?? { bakiyeci: { table }, bakiyeYapilar: [] }, {bakiyeYapilar} = yapi;
				let anahStr2Bilgi = tip2AnahStr2Bilgi[tip] = tip2AnahStr2Bilgi[tip] ?? {};
				for (let {sabit, toplam} of eski_bakiyeYapilar) {
					let negToplam = {}; for (let [key, value] of Object.entries(toplam)) { negToplam[key] = -(value || 0) }
					let anahStr = getAnah(sabit), bilgi = anahStr2Bilgi[anahStr];
					if (bilgi == null) { anahStr2Bilgi[anahStr] = bilgi = { sabit, toplam: negToplam }; bakiyeYapilar.push(bilgi) }
					else { for (let [key, negValue] of Object.entries(negToplam)) { bilgi.toplam[key] = (bilgi.toplam[key] || 0) + negValue } }
				}
			}
		}
		await this.bakiyeYapilarKaydet({ ...e, tip2Yapi }) 
	}
	async silmeOncesiIslemler(e) {
		await super.silmeOncesiIslemler(e); let tip2Yapi = await this.getTip2BakiyeciYapi(e) ?? {}, query = new MQToplu();
		for (let {bakiyeci, bakiyeYapilar} of Object.values(tip2Yapi)) {				/* kayıt öncesinde eski değerler kadar bakiye/sonstok düşülür */
			let {table} = bakiyeci; for (let {sabit: keyHV, toplam: hv} of bakiyeYapilar) {
				query.add(new MQInsertOrUpdate({ table, keyHV, hv }).asCikar()) }
		}
		if (query.liste.length) {
			let {trnId} = e, offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode;
			await app.sqlExecNone({ offlineMode, trnId, query })
		}
	}
	async silmeSonrasiIslemler(e) { await super.silmeSonrasiIslemler(e) }
	async bakiyeYapilarKaydet(e) {
		let {tip2Yapi} = e; if ($.isEmptyObject(tip2Yapi)) { return true }
		let query = new MQToplu(); for (let {bakiyeci, bakiyeYapilar} of Object.values(tip2Yapi)) {				/* kayıt sonrası yeni değerler kadar bakiye/sonstok eklenir */
			let {table} = bakiyeci; for (let {sabit: keyHV, toplam: _hv} of bakiyeYapilar) {
				let hv = {}; for (let [key, value] of Object.entries(_hv)) { if (value) { hv[key] = value } }
				if (!$.isEmptyObject(hv)) { query.add(new MQInsertOrUpdate({ table, keyHV, hv }).asEkle()) }
			}
		}
		if (query.liste.length) {
			let {trnId} = e, offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode;
			return await app.sqlExecNone({ offlineMode, trnId, query })
		}
		return true
	}
	async getTip2BakiyeciYapi(e) {
		let {bakiyeciler} = this; if (!bakiyeciler?.length) { return [] }
		let fis = this, result = {}; for (const bakiyeci of bakiyeciler) {
			const {tipKod, table, anahtarSahalar, sumSahalar, delim} = bakiyeci.class; if (!tipKod) { continue }
			const bakiyeYapilar = await bakiyeci.getBakiyeDict({ fis }); if ($.isEmptyObject(bakiyeYapilar)) { continue }
			result[tipKod] = { bakiyeci, bakiyeYapilar }
		}
		return result
	}
	alternateKeyHostVarsDuzenle(e) {
		super.alternateKeyHostVarsDuzenle(e); const {hv} = e, {noSaha} = this.class, {fisNo} = this;
		if (noSaha) { hv[noSaha] = fisNo ?? null }
	}
	setValues(e) {
		super.setValues(e); const {rec} = e, {noSaha} = this.class, {fisNo} = this;
		if (noSaha) { this.fisNo = rec[this.class.noSaha] || 0 }
	}
	bakiyeSqlOrtakDuzenle(e) {
		const {sent} = e, {table, sayacSaha} = this.class, {paramName_fisSayac} = e, {sayac} = this;
		sent.fromAdd(`${table} fis`); sent.where.add(`fis.${sayacSaha} = ${sayac ? MQSQLOrtak.sqlServerDegeri(sayac) : paramName_fisSayac}`)
	}
	uiDuzenle_fisGiris(e) {
		const {fisBaslikOlusturucular} = this;
		if (fisBaslikOlusturucular) {
			for (let baslikOlusturucu of fisBaslikOlusturucular) {
				const _e = $.extend({}, e);
				if (baslikOlusturucu) {
					if (baslikOlusturucu.prototype)
						baslikOlusturucu = new baslikOlusturucu();
					else
						baslikOlusturucu = getFuncValue.call(this, baslikOlusturucu, _e);
				}
				if (baslikOlusturucu && baslikOlusturucu.prototype)
					baslikOlusturucu = new baslikOlusturucu();
				if (baslikOlusturucu)
					getFuncValue.call(this, baslikOlusturucu, _e);
			}
		}
	}
	uiDuzenle_fisGirisIslemTuslari(e) {
		const {parent, sender} = e; let btn = $(`<button id="listedenSec">LST</button>`);
		btn.on('click', evt => {
			let {gridWidget} = sender, listedenSecIslemi = colDef => { const {kaKolonu} = colDef || {}; if (kaKolonu?.listedenSec) { kaKolonu.listedenSec({ sender, args: cell }); return true } };
			let cell = gridWidget.getselectedcell(), {datafield} = cell;
			let colDef = sender.tabloKolonlari.find(_colDef => _colDef.kodAttr == datafield || _colDef.adiAttr == datafield);
			if (!listedenSecIslemi(colDef)) { colDef = sender.tabloKolonlari.find(_colDef => !!_colDef.kaKolonu?.listedenSec); listedenSecIslemi(colDef) }
		});
		btn.appendTo(parent)
	}
	fisGiris_gridVeriYuklendi(e) { }
}
