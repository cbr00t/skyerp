class TabletApp extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this } get isLoginRequired() { return true }
	static get yerelParamSinif() { return MQYerelParam } get configParamSinif() { return MQYerelParamConfig_App }
	get offlineMode() { return super.offlineMode ?? true } get dbMgrClass() { return SqlJS_DBMgr }
	get offlineAktarimSiniflar() {
		return [
			MQTabStokAnaGrup, MQTabStokGrup, MQTabStokMarka,
			MQTabBolge, MQTabIl, MQTabUlke,
			MQTabStok, MQTabCari
		]
	}
	// get autoExecMenuId() { return MQTest.kodListeTipi }
	paramsDuzenle({ params }) {
		super.paramsDuzenle(...arguments)
		$.extend(params, { localData: MQLocalData.getInstance() })
	}
	async getAnaMenu(e) {
		let {noMenuFlag, params} = this
		if (noMenuFlag) { return new FRMenu() }
		let items = []
		let addMenuSubItems = (mne, text, ...classes) => {
			let subItems = classes.flat().map(cls =>
				new FRMenuChoice({
					mne: cls.kodListeTipi || cls.partName, text: cls.sinifAdi,
					block: e =>
						cls.tanimmi ? cls.tanimla(e) :
						cls.listeEkraniAc ? cls.listeEkraniAc(e) :
						new cls(e).run()
				})
			)
			let menuItems = []
			if (subItems?.length) {
				menuItems = mne
					? [new FRMenuCascade({ mne, text, items: subItems })]
					: subItems
				items.push(...menuItems)
			}
			return menuItems
		};
		items.push(new FRMenuChoice({ mne: 'BILGIYUKLE', text: 'Bilgi Yükle', block: e => this.bilgiYukleIstendi(e) }))
		addMenuSubItems('TANIM', 'Tanımlar', [
			MQTabStok, MQTabCari,
			MQTabStokGrup, MQTabStokAnaGrup, MQTabStokMarka
		])
		items.push(new FRMenuChoice({ mne: 'BILGIGONDER', text: 'Bilgi Gönder', block: e => this.bilgiGonderIstendi(e) }))
		// addMenuSubItems(null, null, [MQTest])
		return new FRMenu({ items })
	}
	dbMgr_tablolariOlustur_queryDuzenle({ name, queries }) {
		super.dbMgr_tablolariOlustur_queryDuzenle(...arguments)
	}
	dbMgr_tablolariOlustur_urlDuzenle({ name, urls }) {
		super.dbMgr_tablolariOlustur_urlDuzenle(...arguments)
		urls.push(`queries/${name}.sql?${appVersion}`)
	}
	dbMgr_tabloEksikleriTamamla({ name }) {
		super.dbMgr_tabloEksikleriTamamla(...arguments)
	}
	async bilgiYukleIstendi(e) {
		let {offlineAktarimSiniflar: classes} = this
		if (!classes?.length)
			return
		let withClear = true
		{
			let args = { noClear: false }
			let {wnd, result} = displayMessage('Merkezden veriler yüklensin mi?', appName, 'eh')
			let parent = wnd.find('.jqx-window-content > .subContent')
			let rfb = new RootFormBuilder().setLayout(parent).setInst(args)
			rfb.addCheckBox('noClear', 'Veriler SilinMEsin').addStyle(`
				$elementCSS { margin: 30px 0 0 30px !important }
				$elementCSS > input:not(:checked) + label { font-weight: bold; color: firebrick !important }
			`)
			wnd.jqxWindow('height', wnd.jqxWindow('height') + 30)
			rfb.run()
			let {index: rdlg} = await result ?? {}
			if (rdlg !== 0)
				return
			withClear = !args.noClear
		}
		let pm = showProgress('Veriler yükleniyor...', null, true)
		pm.setProgressMax(classes.length).progressReset()
		{
			let clearClasses = withClear ? classes : classes.filter(cls => !cls.detaylimi)
			if (clearClasses?.length) {
				let offlineMode = true, internal = true
				await MQCogul.sqlExecNone({ offlineMode, query: 'BEGIN TRANSACTION' })
				await Promise.all( clearClasses.map(cls => cls.offlineDropTable({ ...e, offlineMode, internal })) )
				await app.dbMgr_tablolariOlustur({ ...e, offlineMode, internal })
				await MQCogul.sqlExecNone({ offlineMode, query: 'COMMIT' })
			}
		}
		for (let cls of classes) {
			try {
				let clear = withClear || !cls.detaylimi
				await cls.offlineSaveToLocalTable()
			}
			catch (ex) {
				let errText = getErrorText(ex)
				console.error(errText, ex)
				hConfirm(errText, 'Veri Yükle')
			}
			finally { pm.progressStep() }
		}
		pm.progressEnd()
		eConfirm('Veri Yükleme tamamlandı')
		setTimeout(() => hideProgress(), 1000)
	}
	async bilgiGonderIstendi(e) {
		let {offlineAktarimSiniflar: classes} = this
		if (!classes?.length)
			return
		if (!await ehConfirm('Tabletteki veriler merkeze gönderilsin mi?', appName))
			return
		let pm = showProgress('Veriler gönderiliyor...', null, true)
		pm.setProgressMax(classes.length).progressReset()
		for (let cls of classes) {
			try { await cls.offlineSaveToRemoteTable() }
			catch (ex) {
				let errText = getErrorText(ex)
				console.error(errText, ex)
				hConfirm(errText, 'Veri Gönder')
			}
			finally { pm.progressStep() }
		}
		pm.progressEnd()
		eConfirm('Veri Gönderimi tamamlandı')
		setTimeout(() => hideProgress(), 1000)
	}
}
