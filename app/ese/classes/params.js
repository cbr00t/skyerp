class MQYerelParam extends MQYerelParamTicari { static { window[this.name] = this; this._key2Class[this.name] = this } }
class MQYerelParamConfig_App extends MQYerelParamConfig {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	yukleSonrasi(e) {
		if (!app.isAdmin) {
			for (const key of ['sql', 'wsProxyServerURL']) { delete this[key] }
			const {DefaultWSHostName_SkyServer: host, DefaultSSLWSPort: port} = config.class;
			this.wsURL = `https://${host}:${port}`
		}
		super.yukleSonrasi(e)
	}
}
class MQParam_ESE extends MQParam {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'ESE Parametreleri' } static get paramKod() { return 'ESEPARAM' }
	constructor(e) { e = e || {}; super(e); $.extend(this, { sablon: e.sablon }); this.fix(e) }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e; paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`);
		let form = paramci.addFormWithParent(); form.addGrup({ etiket: 'Varsayılan Şablon' }); let formSablon = form.addFormWithParent().yanYana().addStyle_fullWH();
		for (const [tip, cls] of Object.entries(MQSablon.tip2Sinif)) {
			let {maxSayi} = cls; formSablon.addGridGiris_sabit(tip).addStyle_fullWH('49%')
				.setTabloKolonlari(_e => [
					new GridKolon({ belirtec: 'etiket', text: 'Etiket', genislikCh: 20 }),
					...cls.getGridKolonlar({ belirtec: 'sablonId', kodAttr: 'sablonId', adiAttr: 'sablonAdi', genislikCh: 35 }).map(colDef => colDef.kodsuz())
				]).setSource(_e => [..._e.builder.inst.sablon[tip]])
				.veriDegisinceIslemi(e => {
					const {action, rowIndex, belirtec, builder, newValue: value} = e, {altInst, id} = builder;
					if (action == 'cellValueChanged') { altInst.sablon[id][rowIndex][belirtec] = value }
				})
		}
	}
	paramHostVarsDuzenle(e) { super.paramHostVarsDuzenle(e); const {hv} = e; $.extend(hv, { sablon: this.sablon }) }
	paramSetValues(e) { super.paramSetValues(e); const {rec} = e; $.extend(this, { sablon: rec.sablon }); this.fix(e) }
	fix(e) {
		let {sablon} = this; if (sablon == null) { sablon = this.sablon = {} }
		for (const [tip, cls] of Object.entries(MQSablon.tip2Sinif)) {
			const {maxSayi} = cls; let arr = sablon[tip] = sablon[tip] ?? [];
			if (arr.length > maxSayi) { arr.splice(maxSayi) } else { while (arr.length < maxSayi) { arr.push({ etiket: '', sablonId: null }) } }
			if (!arr[0]?.etiket) { let etiket = tip == 'cpt' ? 'CPT' : tip == 'anket' ? 'DEHB' : null; if (etiket) { $.extend(arr[0], { etiket }) } }
		}
		return this
	}
}
