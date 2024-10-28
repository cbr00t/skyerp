class MQX extends MQGuidVeAdiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'X' }
	static get kodListeTipi() { return 'X' } static get table() { return 'crmx' } static get tableAlias() { return 'x' }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e) /* $.extend(e.pTanim, { basi: new PInstNum('yasbasx'), sonu: new PInstNum('y') }) */ }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'x', text: 'X', genislikCh: 8 }).tipNumerik(), new GridKolon({ belirtec: 'y', text: 'Y', genislikCh: 8 }).tipNumerik())
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent(); form.addNumberInput('x', 'X').addStyle_wh(100); form.addNumberInput('y', 'Y').addStyle_wh(100)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {tableAlias: alias} = this;
		sent.sahalar.add(`${alias}.x`, `${alias}.y`)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(2); form.addTextInput('x', 'X').setMaxLength(36);
		form.addModelKullan('y', 'Y').comboBox().kodsuz().autoBind().setMFSinif(MQY);
	}
}
