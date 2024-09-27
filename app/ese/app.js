class ESEApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return 'MAIN' } get isLoginRequired() { return true } get defaultLoginTipi() { return config.dev ? Session.DefaultLoginTipi : 'eseLogin' }
	get defaultWSPath() { return `${super.superDefaultWSPath}/ese` } static get yerelParamSinif() { return MQYerelParam } get configParamSinif() { return MQYerelParamConfig_App }
	async runDevam(e) { await super.runDevam(e); await this.anaMenuOlustur(e); this.show() }
	loginTipleriDuzenle(e) {
		const {loginTipleri} = e; loginTipleri.push(...[
			(config.dev ? { kod: 'login', aciklama: 'Yönetici' } : null),
			{ kod: 'eseLogin', aciklama: 'Normal Giriş' }
		].filter(x => !!x))
	}
	paramsDuzenle(e) { super.paramsDuzenle(e); const {params} = e; $.extend(params, { localData: MQLocalData.getInstance() }) }
	getAnaMenu(e) {
		const {noMenuFlag} = this; if (noMenuFlag) { return new FRMenu() }
		const {session} = config, {isAdmin} = session;
		const items = [new FRMenuChoice({ mne: 'MAIN', text: 'MAIN', block: e => {} })];
		if (isAdmin) {
			let classes = [MQCariUlke, MQCariIl, MQYerlesim, MQKurum, MQOkulTipi, MQHasta, MQDoktor, MQESEUser, MQYetki, MQCari];
			let subItems = classes.map(cls => new FRMenuChoice({ mne: cls.kodListeTipi, text: cls.sinifAdi, block: e => cls.listeEkraniAc(e) }));
			items.push(new FRMenuCascade({ mne: 'TANIM', text: 'Sabit Tanımlar', items: subItems }))
			classes = [MQSablonCPT, MQSablonESE]; subItems = classes.map(cls => new FRMenuChoice({ mne: cls.kodListeTipi, text: cls.sinifAdi, block: e => cls.listeEkraniAc(e) }));
			items.push(new FRMenuCascade({ mne: 'SABLON', text: 'Şablonlar', items: subItems }));
			classes = [MQMuayene]; subItems = classes.map(cls => new FRMenuChoice({ mne: cls.kodListeTipi, text: cls.sinifAdi, block: e => cls.listeEkraniAc(e) }));
			items.push(...subItems)
		}
		return new FRMenu({ items })
	}
	wsX(e) {
		e = e || {}; let args = e, {data} = args; if (typeof data == 'object') { data = toJSONStr(data) } delete args.data;
		return ajaxPost({ url: this.getWSUrl({ api: 'x', args, data }) })
	}
}
