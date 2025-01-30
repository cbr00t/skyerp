class SablonluSiparisApp extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get yerelParamSinif() { return MQYerelParam } get autoExecMenuId() { return SablonluSiparisListeFis.kodListeTipi }
	paramsDuzenle(e) { super.paramsDuzenle(e) /*; const {params} = e; $.extend(params, { x: MQParam_X.getInstance() })*/ }
	async anaMenuOlustur(e) {
		await this.promise_ready; let {kullanim} = app.params.aktarim, eksikParamIsimleri = [];
		/*if (!kullanim.webOzetRapor) { eksikParamIsimleri.push('Web Özet Rapor') }*/
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
		const {noMenuFlag} = this, {isAdmin} = config.session ?? {}; if (noMenuFlag) { return new FRMenu() }
		let items = [MQSablon, MQKonsinyeSablon].map(cls => {
			let {kodListeTipi: mne, sinifAdi: text} = cls, block = e => cls.listeEkraniAc(e);
			return new FRMenuChoice({ mne, text, block })
		});
		return new FRMenu({ items })
	}
}
