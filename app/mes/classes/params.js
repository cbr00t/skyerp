class MQYerelParam extends MQYerelParamTicari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}

class MQYerelParamConfig_MES extends MQYerelParamConfig {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static paramAttrListeDuzenle({ liste }) {
		super.paramAttrListeDuzenle(...arguments)
		liste.push('hatKodListe')
	}
	static async rootFormBuilderDuzenle({ rootBuilder: rfb }) {
		await super.rootFormBuilderDuzenle(...arguments)
		if (config.dev) {
			let contentForm = rfb.addForm('content')
				.setLayout(({ builder: { parentBuilder: { layout } } }) => layout.find('.content'))
			await app.promise_ready
			contentForm.addModelKullan('hatKodListe', 'Hat')
				.setMFSinif(MQHat).comboBox().autoBind()
				.coklu().listedenSecilemez()
		}
	}
}

class MQParam_MES extends MQParam {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'MES Parametreleri' }
	static get paramKod() { return 'MAKVERI' }
	static paramYapiDuzenle({ paramci }) {
		super.paramYapiDuzenle(e)
		paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`)
		{
			let form = paramci.addFormWithParent().yanYana()
				.addStyle(`$elementCSS > div { max-width: 350px !important }`)
			form.addNumber('kritikSinyalSureDk', 'Kritik Sinyal Süresi (dk)')
			form.addNumber('kritikDuraksamaSureDk', 'Kritik Duraksama Süresi (dk)')
		}
		{
			let form = paramci.addFormWithParent().yanYana()
				.addStyle(`$elementCSS > div { max-width: 400px !important }`)
			form.addCheckBox('urunAgacinaEkle', 'Ürün Ağacına Ekle')
			form.addCheckBox('cokluIsParalel', 'Çoklu İş Paralel Çalışır')
		}
	}
	paramSetValues({ rec }) {
		super.paramSetValues(...arguments)
		let kritikDurNedenKodSet = this.kritikDurNedenKodSet = asSet(rec.kritikDurNedenKodlari) || {}
	}
	static logKaydet(e) {
		// do nothing
		return true
	}
}
