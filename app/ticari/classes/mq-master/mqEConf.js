class MQEConf extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'e-İşlem Konfigurasyon' } static get table() { return 'efatconf' } static get tableAlias() { return 'efc' }
	static get kodListeTipi() { return 'EFCONF' } static get bosKodAlinirmi() { return true } static get tumKolonlarGosterilirmi() { return true }
	/* static getInstance() { let result = this._instance; if (!result) { result = this._instance = new this() } return result } */
	get eIslEkArgs() {
		const result = {}, addIfNotEmpty = (selector, key) => { const value = this.getValue(selector); if (value) { result[key || selector] = value } };
		addIfNotEmpty('testmi'); addIfNotEmpty('anaBolum', 'eIslAnaBolum'); addIfNotEmpty('gibAlias', 'senderGIBAlias');
		/*addIfNotEmpty('eArsGIBAlias', 'senderEArsGIBAlias');*/ addIfNotEmpty('eIrsGIBAlias', 'senderEIrsGIBAlias');
		return result
	}
	get eLogin() {
		const result = {}, addIfNotEmpty = (selector, key) => { const value = this.getValue(selector); if (value) { result[key || selector] = value } };
		addIfNotEmpty('wsUser', 'user'); addIfNotEmpty('wsPass', 'pass'); addIfNotEmpty('firmaKodu'); addIfNotEmpty('subeKodu');
		return result
	}

	constructor(e) { e = e || {}; super(e); }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			anaBolum: new PInstStr('efatanabolum'), ozelEntegrator: new PInstTekSecim('oetip', EOzelEntegrator),
			wsUser: new PInstStr('wsuser'), wsPass: new PInstStr('wspass'), firmaKodu: new PInstStr('wsfirma'),
			subeKodu: new PInstStr('wsbranch'), gibAlias: new PInstStr('gibalias'), /*eArsGIBAlias: new PInstStr('earsgibalias'),*/ eIrsGIBAlias: new PInstStr('eirsgibalias')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); let tabPage = e.tabPage_genel;
		tabPage.addTextInput('anaBolum', 'e-İşlem Ana Bölüm');
		let form = tabPage.addFormWithParent().yanYana();
		form.addModelKullan('ozelEntegrator', 'Özel Entegratör').dropDown().noMF().kodsuz().setSource(e => e.builder.altInst.ozelEntegrator.kaListe);
		form.addTextInput('wsUser', 'WS Kullanıcı'); form.addTextInput('wsPass', 'WS Şifre');
		form = tabPage.addFormWithParent().yanYana();
		form.addTextInput('firmaKodu', 'WS Firma'); form.addTextInput('subeKodu', 'WS Branch/Şube');
		form = tabPage.addFormWithParent().yanYana();
		form.addTextInput('gibAlias', 'GIB Alias'); /*form.addTextInput('eArsGIBAlias', 'e-Arşiv GIB Alias');*/ form.addTextInput('eIrsGIBAlias', 'e-İrs. GIB Alias')
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e, {aliasVeNokta} = this;
		liste.push(
			new GridKolon({ belirtec: 'efatanabolum', text: 'Ana Bölüm' }),
			new GridKolon({ belirtec: 'ozelEntegratorText', text: 'Özel Entegratör', genislikCh: 16, sql: EOzelEntegrator.getClause(`${aliasVeNokta}oetip`) }),
			new GridKolon({ belirtec: 'wsuser', text: 'WS Kullanıcı', genislikCh: 16 }),
			new GridKolon({ belirtec: 'wsfirma', text: 'WS Firma', genislikCh: 10 }),
			new GridKolon({ belirtec: 'wsbranch', text: 'WS Branch', genislikCh: 10 }),
			new GridKolon({ belirtec: 'gibalias', text: 'GIB Alias' }),
			/*new GridKolon({ belirtec: 'earsgibalias', text: 'e-Arşiv GIB Alias' }),*/
			new GridKolon({ belirtec: 'eirsgibalias', text: 'e-İrs. GIB Alias' })
		);
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {aliasVeNokta} = this;
		sent.sahalar.add(`${aliasVeNokta}oetip`, `${aliasVeNokta}wspass`)
	}
	static yeniInstOlustur(e) {
		const {islem} = e, {kod} = e.rec ?? (e.recs || [])[0];
		if (!(islem == 'yeni' || islem == 'kopya')) { if (!kod) { throw { isError: true, errorText: 'Boş kayıt üzerinde işlem yapılamaz' } } }
		return super.yeniInstOlustur(e)
	}
	eIslListeSentDuzenle(e) { }
	getAnaBolumFor(e) {
		e = e || {}; let {eIslTip} = e; if (eIslTip == '') eIslTip = 'A'
		let {eIslSinif} = e; if (!eIslSinif && eIslTip != null) eIslSinif = EIslemOrtak.getClass({ tip: eIslTip })
		let result = this.getValue('anaBolum'); if (!result) return result
		let {altBolum} = eIslSinif || {}; if (altBolum) altBolum = altBolum.trim('\\').trim('/');
		if (altBolum) result += `\\${altBolum}`
		return result
	}
	getValue(e) {
		const {params} = app, selector = typeof e == 'object' ? e.selector : e, param_eIslem = params.eIslem, {oeParam} = param_eIslem; let result;
		if (selector == 'ozelEntegrator') { result = this[selector]; if (!result?.char?.trim()) { result = param_eIslem.ozelEntegrator} }
		else { result = this[selector] || (param_eIslem[selector]) || oeParam[selector] }
		/*if (result == null) { const param_oe = param_eIslem.oe[param_eIslem2.ozelEntegrator.char]; if (param_oe) { result = param_oe[selector] } }*/
		return result
	}
}
