class MiscApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } get isLoginRequired() { return true }
	static get yerelParamSinif() { return MQYerelParam } get configParamSinif() { return MQYerelParamConfig_App }
	constructor(e) { e = e || {}; super(e) } async runDevam(e) { await super.runDevam(e); await this.anaMenuOlustur(e) }
	paramsDuzenle(e) { super.paramsDuzenle(e); $.extend(e.params, { localData: MQLocalData.getInstance(), misc: MQParam_Misc.getInstance() }) }
	async getAnaMenu(e) {
		const {noMenuFlag, params} = this; if (noMenuFlag) { return new FRMenu() } let items = [];
		const addMenuSubItems = (mne, text, ...classes) => {
			let subItems = classes.flat().map(cls =>
				new FRMenuChoice({
					mne: cls.kodListeTipi || cls.partName, text: cls.sinifAdi,
					block: e => cls.listeEkraniAc ? cls.listeEkraniAc(e) : new cls(e).run()
				})
			);
			let menuItems = []; if (subItems?.length) { menuItems = mne ? [new FRMenuCascade({ mne, text, items: subItems })] : subItems; items.push(...menuItems) }
			return menuItems
		};
		addMenuSubItems('HESNA', 'Hesna', [...MQHesnaStok.subClasses]);
		addMenuSubItems('UTILS', 'Utils', [MQFirewall]);
		// addMenuSubItems('AI', 'AI Training', [AITraining01Part]);
		return new FRMenu({ items })
	}
	wsX(e) { let args = e || {}; delete args.data; return ajaxPost({ url: this.getWSUrl({ api: 'testBilgi', args }) }) }
	wsY(e) {
		let args = e || {}, {data} = args; if (typeof data == 'object') { data = toJSONStr(data) } delete args.data;
		return ajaxPost({ timeout: 13 * 1000, processData: false, ajaxContentType: wsContentType, url: this.getWSUrl({ api: 'testSonucKaydet', args }), data })
	}
}
