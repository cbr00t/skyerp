class SkyRaporApp extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get yerelParamSinif() { return MQYerelParam } get autoExecMenuId() { return 'SATISLAR' }
	paramsDuzenle(e) { super.paramsDuzenle(e) /*; const {params} = e; $.extend(params, { rapor: MQParam_Rapor.getInstance() })*/ }
	async anaMenuOlustur(e) {
		await this.promise_ready; let kullanim = app.params.aktarim, eksikParamIsimleri = [];
		if (!kullanim.webOzetRapor) { eksikParamIsimleri.push('Web Özet Rapor') }
		if (eksikParamIsimleri.length) {
			this.noMenuFlag = true; const paramIsimleriGosterim = eksikParamIsimleri.map(x => `<span class="bold firebrick">${x}</span>`).join(' VE ');
			const wnd = createJQXWindow({
				content: (
					`<div>${paramIsimleriGosterim} parametreleri</div>
					<div>Vio Ticari Program &gt; <span class="bold royalblue">Ticari Aktarım Parametreleri</span> kısmından açılmalıdır.</div><p/>
					<div class="gray">Eğer bu parametreler işaretli ise <b class="royalblue">Güncel Ticari Sürümün</b> yüklü olduğundan emin olunuz ve <u>ilgili parametre adımına girip</u> <b>Kaydet</b> butonuna tıklayınız</div>`
				),
				title: `<span class="bold">!! UYARI !!</span><span class="gray"> - ${appName}</span>`,
				args: { isModal: true, width: Math.min(830, $(window).width() / 1.5), height: 330, showCloseButton: true, showCollapseButton: false, closeButtonAction: 'destroy' }
				// buttons: { TAMAM: e => e.close() }
			});
			wnd.css('font-size', '130%'); wnd.find('div > .jqx-window-header').addClass('bg-darkred') /* wnd.find('div > .buttons > button:eq(0)').jqxButton('template', 'danger') */
		}
		await super.anaMenuOlustur(e)
	}
	getAnaMenu(e) {
		const {noMenuFlag} = this; if (noMenuFlag) { return new FRMenu() }
		const {kod2Sinif} = DRapor, items_raporlar = [];
		for (const [mne, sinif] of Object.entries(kod2Sinif)) {
			if (sinif.dAltRapormu) { continue }
			items_raporlar.push(new FRMenuChoice({ mne, text: sinif.aciklama, block: e => sinif.goster() }))
		}
		/*const menu_test = (config.dev ? new FRMenuCascade({ mne: 'TEST', text: 'TEST', items: items_raporlar }) : null);*/
		return new FRMenu({ items: items_raporlar.filter(x => !!x) })
	}
}
