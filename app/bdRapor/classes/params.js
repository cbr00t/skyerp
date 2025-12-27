class MQParam_BDRapor extends MQParam {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Rapor Parametreleri' } static get paramKod() { return 'DRAPOR' }
	static paramYapiDuzenle({ paramci }) {
		let e = arguments[0]; super.paramYapiDuzenle(e)
		paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`)
		let form = paramci.addFormWithParent()
		/*form.addCheckBox('ihracatIntacdanmi', 'İhracat İntaçtanmı')
		form.addCheckBox('konsolideCikti', 'Konsolide Çıktı')
			.degisince(({ builder: fbd }) => {
				fbd.inst._kritikDegisiklikVarmi = true
				fbd.parentBuilder.id2Builder._ekDBListe.updateVisible()
			})
		form.addModelKullan('_ekDBListe', 'Ek Veritabanları').comboBox().autoBind().noMF().kodsuz().coklu()
			.setVisibleKosulu(({ builder: fbd }) => fbd.altInst.konsolideCikti ? true : 'jqx-hidden')
			.setSource(e => app.wsDBListe().then(arr => arr.filter(x => x != 'ORTAK').map(x => new CKodVeAdi([x, x]))))*/
		paramci.onAfterRun(({ builder: fbd }) =>
			fbd.inst._kritikDegisiklikVarmi = false)
	}
	async kaydetSonrasiIslemler(e) {
		await super.kaydetSonrasiIslemler(e)
		let {_kritikDegisiklikVarmi} = this
		if (_kritikDegisiklikVarmi) {
			setTimeout(() => {
				ehConfirm(`<p>Yapılan değişikliklerin geçerli olması için programa yeniden giriş yapılmalıdır</p><p class="bold firebrick">Devam edilsin mi?</p>`, appName)
					.then(rdlg => {
						if (rdlg)
							app.logoutIstendi()
					})
				let wnd = $('.jqx-window:last')
				if (wnd?.length) {
					wnd.find('div > .jqx-window-header').addClass('bg-lightred')
					wnd.find(`div > .content > .buttons > button:eq(0)`).addClass('bg-lightgreen')
				}
			}, 100)
		}
	}
}

class MQBordroGenelParam extends MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Bordro Genel Parametreler' } static get paramKod() { return 'XGT' }
	static paramYapiDuzenle({ paramci }) {
		let e = arguments[0]; super.paramYapiDuzenle(e)
		paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`)
		{
			let form = paramci.addFormWithParent()
			form.addBool('webOzetRapor', 'Web Özet Rapor')
			form.addBool('guleryuzOzel', 'Güleryüz Özel')
		}
		/*{
			let form = paramci.addKullanim().addGrup({ etiket: 'Kullanım' }).addFormWithParent()
		}*/
	}
	paramSetValues({ rec }) { super.paramSetValues(...arguments) }
}
