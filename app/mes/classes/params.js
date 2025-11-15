class MQYerelParam extends MQYerelParamTicari { static { window[this.name] = this; this._key2Class[this.name] = this } }
class MQYerelParamConfig_MES extends MQYerelParamConfig {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static paramAttrListeDuzenle(e) { super.paramAttrListeDuzenle(e); let {liste} = e; liste.push('hatKodListe') }
	static async rootFormBuilderDuzenle(e) {
		await super.rootFormBuilderDuzenle(e); let rfb = e.rootBuilder;
		if (config.dev) {
			let contentForm = rfb.addForm('content', e => e.builder.parentBuilder.layout.find('.content'));
			await app.promise_ready; contentForm.addModelKullan('hatKodListe', 'Hat').setMFSinif(MQHat).comboBox().autoBind().coklu().listedenSecilemez()
		}
	}
}
class MQParam_MES extends MQParam {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'MES Parametreleri' } static get paramKod() { return 'MES' }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); let {paramci} = e; paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`);
		let form = paramci.addFormWithParent(); form.addNumber('kritikSinyalSureDk', 'Kritik Sinyal Süresi (dk)'); form.addNumber('kritikDuraksamaSureDk', 'Kritik Duraksama Süresi (dk)');
	}
	paramSetValues({ rec }) {
		super.paramSetValues(...arguments)
		let kritikDurNedenKodSet = this.kritikDurNedenKodSet = asSet(rec.kritikDurNedenKodlari) || {}
	}
	async tekilOku(e) { return { jsonstr: await app.wsParams() } }
}
class MQParam_HatYonetimi extends MQParam {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Hat Yönetimi Parametreleri' } static get paramKod() { return 'HATPARAM' }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); let {paramci} = e; paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`);
		let form = paramci.addFormWithParent(); form.addCheckBox('urunAgacinaEkle', 'Ürün Ağacına Ekle').setValue(e => e.builder.altInst.urunAgacinaEkle)
		/*await app.sqlExecTekilDeger(`SELECT deger FROM genparstr1 WHERE paramkod='HATPARAM' and anahtar='SRAGC'`*/
	}
	paramSetValues(e) { super.paramSetValues(e); let {rec} = e }
	async tekilOku(e) {
		let rec = (await super.tekilOku(e)) || {}
		let sent = new MQSent({
			from: 'genparstr1 par',
			where: { degerAta: 'HATPARAM', saha: 'par.paramkod' },
			sahalar: 'par.deger'
		})
		let urunAgacinaEkle = asBool(await app.sqlExecTekilDeger(sent))
		$.extend(rec, { urunAgacinaEkle })
		return rec
	}
}
