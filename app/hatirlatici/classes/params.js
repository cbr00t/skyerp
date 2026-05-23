class MQParam_X extends MQParam {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'X Parametreleri' } static get paramKod() { return 'XPARAM' }
	static paramYapiDuzenle({ paramci }) {
		let e = arguments[0]; super.paramYapiDuzenle(e)
		paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`)
		let form = paramci.addFormWithParent()
		//form.addCheckBox('ihracatIntacdanmi', 'İhracat İntaçtanmı')
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
