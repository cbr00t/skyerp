class OnayciApp extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get autoExecMenuId() { return 'ONAYCI' }
	paramsDuzenle({ params }) {
		super.paramsDuzenle(...arguments)
		// $.extend(params, {  })
	}
	async anaMenuOlustur(e) {
		try {
			let {yetkiVarmi, dbName} = config.session ?? {}
			if (!yetkiVarmi) {
				this.noMenuFlag = true
				let wnd = createJQXWindow({
					content: `<div><b class=firebrick>${dbName}</b> veritabanına <b class=orangered>Ticari Sistem</b> için Erişim Yetkiniz YOK</div>`,
					title: `<span class="bold">!! UYARI !!</span><span class="gray"> - ${appName}</span>`,
					args: { isModal: true, width: Math.min(830, $(window).width() / 1.5), height: 330, showCloseButton: true, showCollapseButton: false, closeButtonAction: 'destroy' }
					// buttons: { TAMAM: e => e.close() }
				})
				wnd.css('font-size', '130%')
				wnd.find('div > .jqx-window-header').addClass('bg-darkred')
			}
			let {moduller, params, params: { bGenel }} = app
			this.sqlTables = await app.sqlGetTables()
			let eksikParamIsimleri = [], eksikModulIsimleri = []
			/*if (!bGenel?.webOzetRapor)
				eksikParamIsimleri.push('Web Özet Rapor')
			if (moduller && !(moduller[Modul_WebRapor.kod] || moduller[Modul_WebOzetRapor.kod]))
				eksikModulIsimleri.push(Modul_WebOzetRapor.aciklama)*/
			if (eksikParamIsimleri.length) {
				this.noMenuFlag = true
				let gosterim = eksikParamIsimleri.map(x => `<span class="bold firebrick">${x}</span>`).join(' VE ')
				let wnd = createJQXWindow({
					content: (
						`<div>${gosterim} parametreleri</div>
						<div>Vio Ticari Programı &gt; <span class="bold royalblue">Ticari Genel Parametreler</span> kısmından açılmalıdır.</div><p/>
						<div class="gray">Eğer bu parametreler işaretli ise <b class="royalblue">Güncel VioTicari Sürümün</b> yüklü olduğundan emin olunuz ve <u>ilgili parametre adımına girip</u> <b>Kaydet</b> butonuna tıklayınız</div>`
					),
					title: `<span class="bold">!! UYARI !!</span><span class="gray"> - ${appName}</span>`,
					args: { isModal: true, width: Math.min(830, $(window).width() / 1.5), height: 330, showCloseButton: true, showCollapseButton: false, closeButtonAction: 'destroy' }
					// buttons: { TAMAM: e => e.close() }
				})
				wnd.css('font-size', '130%'); wnd.find('div > .jqx-window-header').addClass('bg-darkred') /* wnd.find('div > .buttons > button:eq(0)').jqxButton('template', 'danger') */
			}
			if (eksikModulIsimleri.length) {
				this.noMenuFlag = true
				let gosterim = eksikModulIsimleri.map(x => `<span class="bold firebrick">${x}</span>`).join(' VE ');
				let wnd = createJQXWindow({
					content: (
						`<div><b class=royalblue>${gosterim}</b> modülü için lisanslama yapılmalıdır</div>` +
						`<div>Eğer zaten lisansınız varsa, VIO Ticari Program'a girip, <b>Dosya > Program > Anahtarın Girilmesi</b> menü adımına tıklayınız ve <b>Tamam</b> butonuna basınız</div>`
					),
					title: `<span class="bold">!! UYARI !!</span><span class="gray"> - ${appName}</span>`,
					args: { isModal: true, width: Math.min(830, $(window).width() / 1.5), height: 330, showCloseButton: true, showCollapseButton: false, closeButtonAction: 'destroy' }
					// buttons: { TAMAM: e => e.close() }
				})
				wnd.css('font-size', '130%'); wnd.find('div > .jqx-window-header').addClass('bg-darkred') /* wnd.find('div > .buttons > button:eq(0)').jqxButton('template', 'danger') */
			}
		}
		finally { await super.anaMenuOlustur(e) }
	}
	getAnaMenu(e) {
		let {noMenuFlag, mainRaporBase} = this
		if (noMenuFlag)
			return new FRMenu()
		let {dev} = config, {isAdmin} = config.session ?? {}
		let classes = [MQOnayci]
		let items = []
		for (let cls of classes) {
			let {vioAdim, kodListeTipi: mne, sinifAdi: text} = cls
			items.push(new FRMenuChoice({
				mne, vioAdim, text,
				block: e => cls.listeEkraniAc(e)
			}))
		}
		if (dev && isAdmin) {
			items.push(
				new FRMenuCascade({
					mne: 'PARAM', text: 'Parametreler',
					items: [
						new FRMenuChoice({
							mne: 'EISLPARAM', text: 'e-İşlem Parametreleri',
							block: e => this.params.eIslem.tanimla(e)
						}),
						new FRMenuChoice({
							mne: 'WEBPARAM', text: 'Web Parametreleri',
							block: e => this.params.web.tanimla(e)
						}),
						new FRMenuChoice({
							mne: 'ORTAKPARAM', text: 'Ortak Parametreler',
							block: e => this.params.ortak.tanimla(e)
						})
					]
				})
			)
		}
		return new FRMenu({ items })
	}
}
