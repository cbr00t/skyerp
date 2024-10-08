class ESEApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return 'MAIN' }
	get isLoginRequired() { return true } get defaultLoginTipi() { return this.isAdmin ? Session.DefaultLoginTipi : 'eseLogin' }
	get defaultWSPath() { return `${super.superDefaultWSPath}/ese` } static get yerelParamSinif() { return MQYerelParam } get configParamSinif() { return MQYerelParamConfig_App }
	get kioskmuDogrudan() { return config.session?.loginTipi == 'eseLogin' }
	constructor(e) { e = e || {}; super(e); this.isAdmin = qs.admin ?? false }
	async runDevam(e) {
		if (this.isAdmin) { $('body').addClass('admin') }
		await super.runDevam(e); await this.anaMenuOlustur(e); this.show()
	}
	loginTipleriDuzenle(e) {
		const {loginTipleri} = e; loginTipleri.push(...[
			(this.isAdmin ? { kod: 'login', aciklama: 'Yönetici' } : null),
			{ kod: 'eseLogin', aciklama: 'Normal Giriş' }
		].filter(x => !!x))
	}
	paramsDuzenle(e) { super.paramsDuzenle(e); const {params} = e; $.extend(params, { localData: MQLocalData.getInstance(), ese: MQParam_ESE.getInstance() }) }
	getAnaMenu(e) {
		const {noMenuFlag} = this; if (noMenuFlag) { return new FRMenu() }
		const {session} = config, {isAdmin} = session, items = [];
		if (isAdmin) {
			const addMenuSubItems = (mne, text, ...classes) => {
				let subItems = classes.flat().map(cls => new FRMenuChoice({ mne: cls.kodListeTipi, text: cls.sinifAdi, block: e => cls.listeEkraniAc(e) }));
				let menuItems = []; if (subItems?.length) { menuItems = mne ? [new FRMenuCascade({ mne, text, items: subItems })] : subItems; items.push(...menuItems) }
				return menuItems
			};
			addMenuSubItems('TANIM', 'Sabit Tanımlar', [MQCariUlke, MQCariIl, MQYerlesim, MQKurum, MQOkulTipi, MQHasta, MQDoktor, MQESEUser, MQYetki, MQCari]);
			addMenuSubItems('SABLON', 'Şablonlar', [MQSablonCPT, MQSablonESE]);
			addMenuSubItems(null, null, [MQMuayene]);
			addMenuSubItems('TEST', 'Testler', [MQTestCPT, MQTestESE])
			items.push(new FRMenuChoice({ mne: MQParam_ESE.paramKod, text: MQParam_ESE.sinifAdi, block: e => app.params.ese.tanimla(e) }))
		}
		else { items.push(new FRMenuChoice({ mne: 'MAIN', text: 'TEST İşlemi', block: e => this.testBaslat(e) })) }
		return new FRMenu({ items })
	}
	testBaslat(e) {
		e = e || {}; const {session} = config, testTip = e.testTip ?? e.tip ?? session.testTip, testId = e.testId ?? e.id ?? session.testId;
		if (!testId) { return null } let testSinif = MQTest.getClass(testTip); if (!testSinif) { return null }
		try { requestFullScreen() } catch (ex) { } return testSinif.baslat({ testId })
	}
	wsTestBilgi(e) { let args = e || {}; delete args.data; return ajaxPost({ url: this.getWSUrl({ api: 'testBilgi', args }) }) }
	wsTestSonucKaydet(e) {
		let args = e || {}, {data} = args; if (typeof data == 'object') { data = toJSONStr(data) } delete args.data;
		return ajaxPost({ url: this.getWSUrl({ timeout: 13 * 1000, processData: false, ajaxContentType: wsContentType, api: 'testSonucKaydet', args, data }) })
	}
}
