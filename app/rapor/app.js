class SkyRaporApp extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get yerelParamSinif() { return MQYerelParam } get autoExecMenuId() { return null /* 'TICARI-STSATIS' */ }
	static get kategoriKod2Adi() {
		let result = this._kategoriKod2Adi; if (result == null) {
			result = {
				TICARI: '', 'TICARI-STOK': 'Ticari (<b class="royalblue">Stok</b>)', 'TICARI-HIZMET': 'Ticari (<b class="orangered">Hizmet</b>)',
				FINANS: 'Finans', MES: 'MES'
		};
			this._kategoriKod2Adi = result
		}
		return result
	}
	paramsDuzenle(e) { super.paramsDuzenle(e) /*; const {params} = e; $.extend(params, { rapor: MQParam_Rapor.getInstance() })*/ }
	async anaMenuOlustur(e) {
		await this.promise_ready; let {kullanim} = app.params.aktarim, eksikParamIsimleri = [];
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
		const {kod2Sinif} = DRapor, kategoriKod2MenuItems = {};
		for (const [mne, sinif] of Object.entries(kod2Sinif)) {
			if (sinif.dAltRapormu) { continue } const {vioAdim} = sinif, kategoriKod = sinif.kategoriKod ?? '';
			(kategoriKod2MenuItems[kategoriKod] = kategoriKod2MenuItems[kategoriKod] || [])
				.push(new FRMenuChoice({
					mne, vioAdim, text: sinif.aciklama,
					block: async e => {
						const item = e?.menuItemElement, menuId = (qs.sameWindow == null ? !!$('body').hasClass('no-wnd') : asBool(qs.sameWindow)) ? null : item?.mneText;
						if (menuId) { this.openNewWindow({ menuId, qs: { sameWindow: true } }); return }
						let result = (await sinif.goster(e)) || {}, part = result.part ?? result;
						if (qs.inNewWindow && part?.kapaninca) { part.kapaninca(e => window.close()) }
					}
				}))
		}
		const items_raporlar = [], {kategoriKod2Adi} = this.class;
		for (const [kategoriKod, items] of Object.entries(kategoriKod2MenuItems)) {
			const kategoriAdi = kategoriKod2Adi[kategoriKod] ?? kategoriKod; let target = items_raporlar;
			if (kategoriAdi) { const parentItem = new FRMenuCascade({ mne: kategoriKod, text: kategoriAdi }); items_raporlar.push(parentItem); target = parentItem.items }
			target.push(...items)
		}
		/*const menu_test = (config.dev ? new FRMenuCascade({ mne: 'TEST', text: 'TEST', items: items_raporlar }) : null);*/
		return new FRMenu({ items: items_raporlar.filter(x => !!x) })
	}
}
