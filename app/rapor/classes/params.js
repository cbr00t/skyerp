class MQYerelParam extends MQYerelParamTicari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	/*static paramAttrListeDuzenle(e) { super.paramAttrListeDuzenle(e); e.liste.push('tip2SonDRaporRec') }
	constructor(e) { e = e || {}; super(e); for (let key of ['tip2SonRaporTanim']) { this[key] = this[key] || {} } }
	paramSetValues(e) { super.paramSetValues(e); for (let key of ['tip2SonRaporTanim']) { this[key] = this[key] || {} } }*/
}
class MQParam_DRapor extends MQParam {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Rapor Parametreleri' } static get paramKod() { return 'DRAPOR' }
	get ekDBListe() { return this.konsolideCikti ? this._ekDBListe : null }
	set ekDBListe(value) { this._ekDBListe = value }
	static paramYapiDuzenle({ paramci }) {
		let e = arguments[0]; super.paramYapiDuzenle(e)
		paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`)
		{
			let form = paramci.addFormWithParent()
			form.addBool('ihracatIntacdanmi', 'İhracat İntaçtanmı')
			form.addBool('konsolideCikti', 'Konsolide Çıktı')
				.degisince(({ builder: { inst, parentBuilder} }) => {
					inst._kritikDegisiklikVarmi = true
					parentBuilder.id2Builder._ekDBListe.updateVisible()
				})
			form.addModelKullan('_ekDBListe', 'Ek Veritabanları').comboBox().autoBind().noMF().kodsuz().coklu()
				.setVisibleKosulu(({ builder: fbd }) => fbd.altInst.konsolideCikti ? true : 'jqx-hidden')
				.setSource(e => app.wsDBListe().then(arr => arr.filter(x => x != 'ORTAK').map(x => new CKodVeAdi([x, x]))))
		}
		{
			let form = paramci.addFormWithParent()
			form.addBool('panelRaporlama', 'Panel Raporlama')
			form.addBool('maliTablo', 'Mali Tablo')
			form.addBool('trfAlimSipBirlesik', 'Transfer Sip. + Alım Sip.')
			form.addBool('hizmetVeMuhKarsilastirma', 'Hizmet ve Muh. Karşılaştırması')
			form.addBool('hizmetVeMuhKarsilastirma_ozelIsaret', 'Hizmet ve Muh. Karşılaştırması: Özel İşaret')
		}
		paramci.onAfterRun(({ builder: { inst } }) =>
			inst._kritikDegisiklikVarmi = false)
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
