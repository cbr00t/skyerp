class PratikSatisApp extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return PratikSatisFis.kodListeTipi }
	get configParamSinif() { return MQYerelParamConfig_App } get yerelParamSinif() { return MQYerelParam }
	paramsDuzenle({ params }) { super.paramsDuzenle(...arguments) /*; $.extend(params, { x: MQParam_X.getInstance() })*/ }
	async anaMenuOlustur(e) {
		await this.promise_ready; let {kullanim} = app.params.aktarim ?? {}, eksikParamIsimleri = [];
		if (!kullanim.pratikSatis) { eksikParamIsimleri.push('Pratik Satış') }
		if (eksikParamIsimleri.length) {
			this.noMenuFlag = true;
			let paramIsimleriGosterim = eksikParamIsimleri.map(x => `<span class="bold firebrick">${x}</span>`).join(' VE ');
			let wnd = createJQXWindow({
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
		let{noMenuFlag} = this, {isAdmin} = config.session ?? {};
		if (noMenuFlag) { return new FRMenu() }
		let getItem = (cls, tanimmi, islem) => {
            let _e = { ...e }; if (tanimmi) { _e.islem = islem || 'yeni' };
			let {kodListeTipi: mne, sinifAdi: text} = cls;
			let block = async e => {
				let {part} = await cls.listeEkraniAc(e);
				if (tanimmi && part) {
					let _e = { ...e }, kaydedince =  ({ parentPart: fisGirisPart }) =>  setTimeout(() => fisGirisPart.parentPart.yeniIstendi(_e), 50);
					$.extend(_e, { kaydedince }); part.yeniIstendi(_e)
				}
			};
			return new FRMenuChoice({ mne, text, block })
		};
		let items = [
            getItem(PratikSatisFis, true),
            new FRMenuCascade({ mne: 'TANIM', text: 'Tanımlar', items: [ getItem(MQKasiyer, false) ] })
        ];
		if (config.session.isAdmin) {
			items.push(new FRMenuCascade({
				mne: 'PARAM', text: 'Parametreler', items: ['ticariGenel'].map(selector => {
					let param = app.params[selector]; if (!param) { return null }
					let {paramKod: mne, sinifAdi: text} = param.class;
					return new FRMenuChoice({ mne, text, block: e => param.tanimla(e) })
				}).filter(x => !!x)
			}))
		}
		return new FRMenu({ items })
	}
}
