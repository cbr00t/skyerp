class BarkodluSonStokApp extends MiscApp {
	static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return MQBarkodluSonStok.kodListeTipi }
	async getAnaMenu(e) {
		const {noMenuFlag, params} = this; if (noMenuFlag) { return new FRMenu() } let items = [];
		const addMenuSubItems = (mne, text, ...classes) => {
			let subItems = classes.flat().map(cls => new FRMenuChoice({ mne: cls.kodListeTipi, text: cls.sinifAdi, block: e => cls.listeEkraniAc(e) }));
			let menuItems = []; if (subItems?.length) { menuItems = mne ? [new FRMenuCascade({ mne, text, items: subItems })] : subItems; items.push(...menuItems) }
			return menuItems
		};
		addMenuSubItems(null, null, [MQBarkodluSonStok]);
		return new FRMenu({ items })
	}
}
