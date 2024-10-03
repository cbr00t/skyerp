class MQYerelParam extends MQYerelParamTicari { static { window[this.name] = this; this._key2Class[this.name] = this } }
class MQYerelParamConfig_App extends MQYerelParamConfig { static { window[this.name] = this; this._key2Class[this.name] = this } }
class MQParam_ESE extends MQParam {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'ESE Parametreleri' } static get paramKod() { return 'ESEPARAM' }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e; paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`);
		let form = paramci.addFormWithParent().altAlta();
			form.addGrup({ etiket: 'Varsayılan Şablon' }); let altForm = form.addFormWithParent().yanYana(3).addAltObject('sablon');
				altForm.addModelKullan(MQSablonCPT.tip, 'CPT').comboBox().kodsuz().autoBind().setMFSinif(MQSablonCPT);
				altForm.addModelKullan(MQSablonESE.tip, 'ESE').comboBox().kodsuz().autoBind().setMFSinif(MQSablonESE)
		/*form = paramci.addFormWithParent()*/
	}
}
