class MQEConf extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'e-İşlem Konfigurasyon' }
	static get table() { return 'efatconf' } static get tableAlias() { return 'efc' }
	static get kodListeTipi() { return 'EFCONF' } static get bosKodAlinirmi() { return true } static get tumKolonlarGosterilirmi() { return true }
	/* static getInstance() { let result = this._instance; if (!result) { result = this._instance = new this() } return result } */
	static altYapiDictDuzenle(e) { super.altYapiDictDuzenle(e); const {liste} = e; $.extend(liste, { kisit: MQEConfAlt_Kisit }) }
	static get kisitKeys() { return MQEConfAlt_Kisit.kisitKeys } static get kisitKeysSet() { return MQEConfAlt_Kisit.kisitKeysSet }
	get eIslEkArgs() {
		const result = {}, addIfNotEmpty = (selector, key) => { const value = this.getValue(selector); if (value) { result[key || selector] = value } };
		addIfNotEmpty('testmi'); addIfNotEmpty('anaBolum', 'eIslAnaBolum'); addIfNotEmpty('gibAlias', 'senderGIBAlias');
		addIfNotEmpty('eArsGIBAlias', 'senderEArsGIBAlias'); addIfNotEmpty('eIrsGIBAlias', 'senderEIrsGIBAlias'); addIfNotEmpty('eMusGIBAlias', 'senderEMusGIBAlias');
		return result
	}
	get eLogin() {
		const result = {}, addIfNotEmpty = (selector, key) => { const value = this.getValue(selector); if (value) { result[key || selector] = value } };
		addIfNotEmpty('wsUser', 'user'); addIfNotEmpty('wsPass', 'pass'); addIfNotEmpty('firmaKodu'); addIfNotEmpty('subeKodu');
		return result
	}
	get kisitUyarlanmis() {
		const {kisit} = this, paramKisit = app.params.eIslem.kisit, result = {}, keys = ['kullanilirmi', ...this.class.kisitKeys];
		return kisit.kullanilirmi ? kisit : paramKisit.kullanilirmi ? paramKisit : {}
		}

	constructor(e) { e = e || {}; super(e); }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			anaBolum: new PInstStr('efatanabolum'), ozelEntegrator: new PInstTekSecim('oetip', EOzelEntegrator),
			wsUser: new PInstStr('wsuser'), wsPass: new PInstStr('wspass'), firmaKodu: new PInstStr('wsfirma'),
			subeKodu: new PInstStr('wsbranch'), gibAlias: new PInstStr('gibalias'), eArsGIBAlias: new PInstStr('earsgibalias'),
			eIrsGIBAlias: new PInstStr('eirsgibalias'), eMusGIBAlias: new PInstStr('emusgibalias')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e);
		let tabPage = e.tabPage_genel; tabPage.addTextInput('anaBolum', 'e-İşlem Ana Bölüm');
		let form = tabPage.addFormWithParent().yanYana();
			form.addModelKullan('ozelEntegrator', 'Özel Entegratör').dropDown().noMF().kodsuz().setSource(e => e.builder.altInst.ozelEntegrator.kaListe);
			form.addTextInput('wsUser', 'WS Kullanıcı'); form.addTextInput('wsPass', 'WS Şifre');
		form = tabPage.addFormWithParent().yanYana(); form.addTextInput('firmaKodu', 'WS Firma'); form.addTextInput('subeKodu', 'WS Branch/Şube');
		form = tabPage.addFormWithParent().yanYana(); form.addTextInput('gibAlias', 'GIB Alias'); form.addTextInput('eArsGIBAlias', 'e-Arşiv GIB Alias');
			form.addTextInput('eIrsGIBAlias', 'e-İrs. GIB Alias'); form.addTextInput('eMusGIBAlias', 'e-Müs. GIB Alias')
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e, {aliasVeNokta} = this;
		liste.push(
			new GridKolon({ belirtec: 'efatanabolum', text: 'Ana Bölüm' }),
			new GridKolon({ belirtec: 'ozelEntegratorText', text: 'Özel Entegratör', genislikCh: 16, sql: EOzelEntegrator.getClause(`${aliasVeNokta}oetip`) }),
			new GridKolon({ belirtec: 'wsuser', text: 'WS Kullanıcı', genislikCh: 16 }),
			new GridKolon({ belirtec: 'wsfirma', text: 'WS Firma', genislikCh: 10 }),
			new GridKolon({ belirtec: 'wsbranch', text: 'WS Branch', genislikCh: 10 }),
			new GridKolon({ belirtec: 'gibalias', text: 'GIB Alias' }), new GridKolon({ belirtec: 'earsgibalias', text: 'e-Arşiv GIB Alias' }),
			new GridKolon({ belirtec: 'eirsgibalias', text: 'e-İrs. GIB Alias' }), new GridKolon({ belirtec: 'emusgibalias', text: 'e-Müstahsil GIB Alias' }),
			new GridKolon({ belirtec: 'gonderimdekisitlama', text: 'Gönderimde Kısıt', genislikCh: 10 }).tipBool(),
			new GridKolon({ belirtec: 'gkisfatura', text: 'Kst: Fatura', genislikCh: 13 }).tipBool(),
			new GridKolon({ belirtec: 'gkisirsaliye', text: 'Kst: İrsaliye', genislikCh: 13 }).tipBool(),
			new GridKolon({ belirtec: 'gkismagaza', text: 'Kst: Mağaza', genislikCh: 13 }).tipBool(),
			new GridKolon({ belirtec: 'gkismusmakbuz', text: 'Kst: Müs. Makbuz', genislikCh: 13 }).tipBool()
		)
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
		e = e || {}; let {eIslTip} = e; if (eIslTip == '') { eIslTip = 'A' }
		let {eIslSinif} = e; if (!eIslSinif && eIslTip != null) { eIslSinif = EIslemOrtak.getClass({ tip: eIslTip }) }
		let result = this.getValue('anaBolum'); if (!result) { return result }
		let {altBolum} = eIslSinif || {}; if (altBolum) altBolum = altBolum.trim('\\').trim('/'); if (altBolum) { result += `\\${altBolum}` }
		return result
	}
	getValue(e) {
		const {params} = app, selector = typeof e == 'object' ? e.selector : e, param_eIslem = params.eIslem, oeParam = param_eIslem?.oeParam || {}; let result;
		if (selector == 'ozelEntegrator') { result = this[selector]; if (!result?.char?.trim()) { result = param_eIslem.ozelEntegrator} }
		else { result = this[selector] || (param_eIslem[selector]) || oeParam[selector] }
		/*if (result == null) { const param_oe = param_eIslem.oe[param_eIslem2.ozelEntegrator.char]; if (param_oe) { result = param_oe[selector] } }*/
		return result
	}
}
class MQEConfAlt extends MQAlt { static { window[this.name] = this; this._key2Class[this.name] = this } }
class MQEConfAlt_Kisit extends MQEConfAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kisitKeys() { return ['fatura', 'irsaliye', 'magaza', 'musMakbuz'] }
	static get kisitKeysSet() { let result = this._kisitKeysSet; if (result === undefined) { result = this._kisitKeysSet = asSet(this.kisitKeys) } return result }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e; $.extend(pTanim, {
			kullanilirmi: new PInstBitBool('gonderimdekisitlama'),
			fatura: new PInstBitBool('gkisfatura'), irsaliye: new PInstBitBool('gkisirsaliye'),
			magaza: new PInstBitBool('gkismagaza'), musMakbuz: new PInstBitBool('gkismusmakbuz')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; const {mfSinif, kisitKeysSet} = this, {tabPanel} = e;
		let tabPage = tabPanel.addTab({ id: 'kisit', etiket: 'Kısıt' }).setAltInst(e => e.builder.inst.kisit); let form = tabPage.addFormWithParent().yanYana();
			form.addCheckBox('kullanilirmi', 'Kullanılır').degisince(e => { const {builders} = e.builder.parentBuilder; for (const fbd of builders) { const {id} = fbd; if (kisitKeysSet[id]) { fbd.updateVisible() } } })
			form.addCheckBox('fatura', 'Fatura'); form.addCheckBox('irsaliye', 'İrsaliye');
			form.addCheckBox('magaza', 'Mağaza'); form.addCheckBox('musMakbuz', 'Müstahsil Makbuz');
		for (const fbd of form.builders) { const {id} = fbd; if (kisitKeysSet[id]) { fbd.setVisibleKosulu(e => e.builder.altInst.kullanilirmi ? true : 'jqx-hidden') } }
	}
}
