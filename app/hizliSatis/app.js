class HizliSatisApp extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this } get isLoginRequired() { return true }
	static get yerelParamSinif() { return MQYerelParam } get configParamSinif() { return MQYerelParamConfig_App }
	get autoExecMenuId() { return MQHizliSatis.kodListeTipi }
	async runDevam(e) {
		await super.runDevam(e)
		// await this.anaMenuOlustur(e)
	}
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
		addMenuSubItems(null, null, [MQHizliSatis])
		return new FRMenu({ items })
	}
}
