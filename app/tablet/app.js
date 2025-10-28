class TabletApp extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this } get isLoginRequired() { return true }
	static get yerelParamSinif() { return MQYerelParam } get configParamSinif() { return MQYerelParamConfig_App }
	get offlineMode() { return super.offlineMode ?? true } get dbMgrClass() { return SqlJS_DBMgr }
	get offlineAktarimSiniflar() { return [MQTabStokAnaGrup, MQTabStokGrup, MQTabStokMarka, MQTabStok] }
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
			MQTabStok, MQTabStokGrup, MQTabStokAnaGrup, MQTabStokMarka
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
		let pm = showProgress(`Veriler yükleniyor...`, null, true)
		pm.setProgressMax(classes.length).progressReset()
		for (let cls of classes) {
			try { await cls.offlineSaveToLocalTableWithClear() }
			catch (ex) {
				let errText = getErrorText(ex)
				console.error(errText, ex)
				hConfirm(errText, 'Bilgi Yükle')
			}
			finally { pm.progressStep() }
		}
		pm.progressEnd()
		eConfirm('Bilgi Yükleme tamamlandı')
		setTimeout(() => hideProgress(), 1000)
	}
	async bilgiGonderIstendi(e) {
		let {offlineAktarimSiniflar: classes} = this
		let pm = showProgress(`Veriler gönderiliyor...`, null, true)
		pm.setProgressMax(classes.length).progressReset()
		for (let cls of classes) {
			try { await cls.offlineSaveToRemoteTable() }
			catch (ex) {
				let errText = getErrorText(ex)
				console.error(errText, ex)
				hConfirm(errText, 'Bilgi Gönder')
			}
			finally { pm.progressStep() }
		}
		pm.progressEnd()
		eConfirm('Bilgi Gönderimi tamamlandı')
		setTimeout(() => hideProgress(), 1000)
	}
}
