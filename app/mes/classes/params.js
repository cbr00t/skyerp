class MQYerelParam extends MQYerelParamTicari { static { window[this.name] = this; this._key2Class[this.name] = this } }
class MQYerelParamConfig_MES extends MQYerelParamConfig {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static paramAttrListeDuzenle(e) { super.paramAttrListeDuzenle(e); const {liste} = e; liste.push('hatKod') }
	static async rootFormBuilderDuzenle(e) {
		await super.rootFormBuilderDuzenle(e); const rfb = e.rootBuilder;
		if (config.dev) {
			const contentForm = rfb.addForm('content', e => e.builder.parentBuilder.layout.find('.content'));
			await app.promise_ready; contentForm.addModelKullan('hatKod', 'Hat').setMFSinif(MQHat).dropDown().listedenSecilemez()
		}
	}
}
class MQParam_MES extends MQParam {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'MES Parametreleri' } static get paramKod() { return 'MES' }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e; paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`);
		let form = paramci.addFormWithParent(); form.addNumber('kritikSinyalSureDk', 'Kritik Sinyal Süresi (dk)'); form.addNumber('kritikDuraksamaSureDk', 'Kritik Duraksama Süresi (dk)');
	}
	paramSetValues(e) {
		super.paramSetValues(e); const {rec} = e;
		const kritikDurNedenKodSet = this.kritikDurNedenKodSet = asSet(rec.kritikDurNedenKodlari) || {}
	}
	async tekilOku(e) { return { jsonstr: await app.wsParams() } }
}
