class SkyRaporApp extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get yerelParamSinif() { return MQYerelParam } get autoExecMenuId() { return null /* 'TICARI-STSATIS' */ }
	static get kategoriKod2Adi() {
		let {_kategoriKod2Adi: result} = this
		if (result == null) {
			result = {
				TICARI: '',
				'TICARI-STOK': 'Ticari<br/><b class="royalblue">Stok</b>',
				'TICARI-HIZMET': 'Ticari<br/><b class="orangered">Hizmet</b>)',
				FINANSAL: 'Finansal', FINANLZ: 'Finansal Analiz'
			};
			let {kod2Sinif} = DRapor, e = { liste: result }
			for (let [mne, cls] of entries(kod2Sinif)) {
				if (cls.dAltRapormu || !cls.uygunmu) { continue }
				let {kategoriKod: kod} = cls; if (!kod) { continue }
				let {kategoriAdi: adi} = cls;
				if (adi == null) { result[kod] = result[kod] ?? (adi ?? kod) } else { result[kod] = adi }
			}
			result = e.liste; this._kategoriKod2Adi = result
		}
		return result
	}
	async runDevam(e) {
		await super.runDevam(e)
		await this.ilkIslemler(e)
		await window.DRapor_Hareketci?.autoGenerateSubClasses(e)
	}
	async afterRun(e) {
		if (!(qs.tamEkranYok || qs.noFullScreen))
			requestFullScreen()
		await super.afterRun(e)
	}
	paramsDuzenle({ params }) {
		super.paramsDuzenle(...arguments)
		$.extend(params, { dRapor: MQParam_DRapor.getInstance() })
	}
	async ilkIslemler(e) {
		if (empty(await app.sqlGetColumns('wpaneldetay', 'raporadi'))) {
			try { await app.sqlExecNone(`alter table wpaneldetay add raporadi varchar(50) not null default ''`) }
			catch (ex) { console.error(getErrorText(ex)) }
		}
		try {
			let maxLen = 25, table = 'wgruprapor', field = 'raportip';
			let len = Object.values(await app.sqlGetColumns(table, field))[0]?.length;
			if (len != null && len < maxLen) {
				try { await app.sqlExecNone(`alter table ${table} alter column ${field} varchar(${maxLen}) not null`) }
				catch (ex2) {
					console.error(getErrorText(ex2))
					try { await app.sqlExecNone(`alter table ${table} alter column ${field} char(${maxLen}) not null`) }
					catch (ex3) { console.error(getErrorText(ex3)) }
				}
			}
		}
		catch (ex) { console.error(getErrorText(ex)) }
		return await super.ilkIslemler(e)
	}
	async anaMenuOlustur(e) {
		try {
			let {moduller, params: { aktarim: { kullanim: aktarim = {} } = {} }} = app
			this.sqlTables = await app.sqlGetTables()
			let eksikParamIsimleri = [], eksikModulIsimleri = []
			if (!aktarim.webOzetRapor)
				eksikParamIsimleri.push('Web Özet Rapor')
			if (moduller && !(moduller[Modul_WebRapor.kod] || moduller[Modul_WebOzetRapor.kod]))
				eksikModulIsimleri.push(Modul_WebOzetRapor.aciklama)
			if (eksikParamIsimleri.length) {
				this.noMenuFlag = true
				let gosterim = eksikParamIsimleri.map(x => `<span class="bold firebrick">${x}</span>`).join(' VE ')
				let wnd = createJQXWindow({
					content: (
						`<div>${gosterim} parametreleri</div>
						<div>Vio Ticari Program &gt; <span class="bold royalblue">Ticari Aktarım Parametreleri</span> kısmından açılmalıdır.</div><p/>
						<div class="gray">Eğer bu parametreler işaretli ise <b class="royalblue">Güncel Ticari Sürümün</b> yüklü olduğundan emin olunuz ve <u>ilgili parametre adımına girip</u> <b>Kaydet</b> butonuna tıklayınız</div>`
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
		let {noMenuFlag} = this; if (noMenuFlag) { return new FRMenu() }
		let {isAdmin} = config.session ?? {}, {kod2Sinif} = DRapor, kategoriKod2MenuItems = {}
		kod2Sinif = { ...DPanel.kod2Sinif, ...kod2Sinif }
		for (let [mne, sinif] of entries(kod2Sinif)) {
			if (sinif.dAltRapormu || !sinif.uygunmu)
				continue
			let {vioAdim} = sinif, kategoriKod = sinif.kategoriKod ?? ''
			let subItems = (kategoriKod2MenuItems[kategoriKod] = kategoriKod2MenuItems[kategoriKod] || [])
			subItems.push(new FRMenuChoice({
				mne, vioAdim, text: sinif.aciklama, block: async e => {
					let {menuItemElement: item, event: evt} = e ?? {}, {ctrlKey: ctrl, shiftKey: shift} = evt ?? {}
					let newWindow = (ctrl || shift) || !($('body').hasClass('no-wnd') || asBool(qs.sameWindow))
					let menuId = newWindow ? item?.mneText : null
					if (menuId) {
						this.openNewWindow({ menuId, qs: { sameWindow: true } })
						return
					}
					let result = (await sinif.goster(e)) || {}, part = result.part ?? result
					if (qs.inNewWindow && part?.kapaninca)
						part.kapaninca(e => window.close())
				}
			}))
		}
		let items = [], items_raporlar = [], {kategoriKod2Adi} = this.class, kategoriKod2Cascade = {}
		for (let [kategoriKod, _items] of Object.entries(kategoriKod2MenuItems)) {
			let kategoriAdi = kategoriKod2Adi[kategoriKod] ?? kategoriKod, target = items_raporlar
			if (kategoriAdi) {
				let parentItem = kategoriKod2Cascade[kategoriKod] ??= new FRMenuCascade({ mne: kategoriKod, text: kategoriAdi })
				target.push(parentItem)
				target = parentItem.items
			}
			target.push(..._items)
		}
		items.push(...items_raporlar.filter(x => !!x))
		if (isAdmin)
			items.push(new FRMenuChoice({ mne: 'DRAPOR_PARAM', text: 'Rapor Parametreleri', block: e => this.params.dRapor.tanimla(e) }))
		/*let menu_test = (dev ? new FRMenuCascade({ mne: 'TEST', text: 'TEST', items: items_raporlar }) : null);
		if (config.dev) {
			items.push(
				...[SBTablo].map(cls =>
					new FRMenuChoice({ mne: cls.kodListeTipi, text: cls.sinifAdi, block: e => cls.listeEkraniAc(e) }))
			)
		}*/
		return new FRMenu({ items })
	}
}
