class PortalApp extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get configParamSinif() { return MQYerelParamConfig_App } get yerelParamSinif() { return MQYerelParam }
	get defaultWSPath() { return 'ws/vioPortal' } get defaultLoginTipi() { return 'bayiLogin' } get autoExecMenuId() { return null }
	constructor(e) { super(e); this.defaultSurum = '416' }
	loginTipleriDuzenle({ loginTipleri }) {
		/* super yok */
		loginTipleri.push(...[
			{ kod: 'login', aciklama: 'Yönetici' },
			{ kod: 'bayiLogin', aciklama: 'Bayi' },
			{ kod: 'musteriLogin', aciklama: 'Müşteri' }
		])
	}
	paramsDuzenle(e) { super.paramsDuzenle(e) /*; const {params} = e; $.extend(params, { x: MQParam_X.getInstance() })*/ }
	async paramsDuzenleSonrasi(e) {
		await super.paramsDuzenleSonrasi(e); let {params} = this, {ticariGenel} = params;
		if (!ticariGenel.kullanim.eFatura) { ticariGenel.kullanim.eFatura = true; ticariGenel.kaydet() }
	}
	async afterRun(e) {
		let {loginTipi, user: kod} = config.session;
		let login = MQLogin.current = MQLogin.newFor({ loginTipi, kod });
		await login?.yukle(); await super.afterRun(e)
	}
	async anaMenuOlustur(e) {
		await this.promise_ready; let eksikParamIsimleri = [];
		/*if (!kullanim.webOzetRapor) { eksikParamIsimleri.push('Web Özet Rapor') }*/
		if (eksikParamIsimleri.length) {
			this.noMenuFlag = true; const paramIsimleriGosterim = eksikParamIsimleri.map(x => `<span class="bold firebrick">${x}</span>`).join(' VE ');
			const wnd = createJQXWindow({
				content: (
					`<div>${paramIsimleriGosterim} parametreleri</div>
					<div>Vio Ticari Program &gt; <span class="bold royalblue">Ticari ?? Parametreleri</span> kısmından açılmalıdır.</div><p/>
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
		let{noMenuFlag} = this; if (noMenuFlag) { return new FRMenu() }
		let {current: login} = MQLogin, {adminmi, bayimi} = login;
		let items = [
			(adminmi || bayimi ? new FRMenuCascade({
				mne: 'TAN', text: 'Tanımlar', items: (
					[MQLogin_Admin, MQLogin_Bayi].filter(cls => cls.uygunmu).map(cls => {
						let {kodListeTipi: mne, sinifAdi: text} = cls, block = e => cls.listeEkraniAc(e)
						return new FRMenuChoice({ mne, text, block })
					})
				)
			}) : null),
			...[MQLogin_Musteri, MQAktivasyon, ...MQKontor.subClasses]
				.filter(cls => cls.uygunmu != false)
				.map(cls => {
					let {kodListeTipi: mne, sinifAdi: text} = cls, block = e => cls.listeEkraniAc(e);
					return new FRMenuChoice({ mne, text, block })
				}),
			(config.dev && adminmi ? new FRMenuChoice({ mne: 'TURMOB_IMPORT', text: 'Turmob Kayıtlarını İçeri Al', block: e => MQKontor_Turmob.importRecordsIstendi(e) }) : null)
		].filter(x => !!x)
		return new FRMenu({ items })
	}
}
