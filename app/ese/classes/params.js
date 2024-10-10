class MQYerelParam extends MQYerelParamTicari { static { window[this.name] = this; this._key2Class[this.name] = this } }
class MQYerelParamConfig_App extends MQYerelParamConfig {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	yukleSonrasi(e) {
		if (!app.isAdmin) {
			for (const key of ['sql', 'wsProxyServerURL']) { delete this[key] }
			const {DefaultWSHostName_SkyServer: host, DefaultSSLWSPort: port} = config.class;
			this.wsURL = `https://{host}:${port}`
		}
		super.yukleSonrasi(e);
	}
}
class MQParam_ESE extends MQParam {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'ESE Parametreleri' } static get paramKod() { return 'ESEPARAM' }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e; paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`);
		let form = paramci.addFormWithParent().altAlta();
			form.addGrup({ etiket: 'Varsayılan Şablon' }); let altForm = form.addFormWithParent().yanYana(3).addAltObject('sablon');
				altForm.addModelKullan(MQSablonCPT.tip, 'CPT').comboBox().kodsuz().autoBind().setMFSinif(MQSablonCPT);
				altForm.addModelKullan(MQSablonAnket.tip, 'Anket').comboBox().kodsuz().autoBind().setMFSinif(MQSablonAnket)
		/*form = paramci.addFormWithParent()*/
	}
}
