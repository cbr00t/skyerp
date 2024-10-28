class ESEApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return 'MAIN' } get kioskmuDogrudan() { return config.session?.loginTipi == 'eseLogin' }
	get isLoginRequired() { return true } get defaultLoginTipi() { return this.isAdmin ? Session.DefaultLoginTipi : 'eseLogin' } static get dbMgrClass() { return SqlJS_DBMgr }
	get defaultWSPath() { return `${super.superDefaultWSPath}/ese` } static get yerelParamSinif() { return MQYerelParam } get configParamSinif() { return MQYerelParamConfig_App }
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
	async getAnaMenu(e) {
		const {noMenuFlag, isAdmin, params} = this; if (noMenuFlag) { return new FRMenu() } let items = [];
		if (isAdmin) {
			const addMenuSubItems = (mne, text, ...classes) => {
				let subItems = classes.flat().map(cls => new FRMenuChoice({ mne: cls.kodListeTipi, text: cls.sinifAdi, block: e => cls.listeEkraniAc(e) }));
				let menuItems = []; if (subItems?.length) { menuItems = mne ? [new FRMenuCascade({ mne, text, items: subItems })] : subItems; items.push(...menuItems) }
				return menuItems
			};
			addMenuSubItems('TANIM', 'Sabit Tanımlar', [MQCariUlke, MQCariIl, MQYerlesim, MQKurum, MQOkulTipi, MQYasGrup, MQESEUser, MQYetki, MQCari]);
			addMenuSubItems(null, null, [MQHasta, MQDoktor]);
			addMenuSubItems('SABLON', 'Şablonlar', [MQSablonCPT, MQSablonAnket]);
			addMenuSubItems(null, null, [MQMuayene]);
			let parentItem = new FRMenuCascade({ mne: 'TEST', text: 'Testler' }); for (const cls of MQTest.subClasses) {
				const {sablonTip, sablonSinif, kodListeTipi: mne} = cls;
				let {sinifAdi: text} = cls, sablonId = params.ese.sablon?.[sablonTip]?.[0]?.sablonId, sablonAdi = sablonId ? await sablonSinif.getGloKod2Adi(sablonId) : null;
				if (sablonAdi) { text += `<div class="royalblue" style="font-weight: normal; font-size: 90%; padding-top: 10px">${sablonAdi}</div>` }
				parentItem.items.push(new FRMenuChoice({ mne, text, block: e => cls.listeEkraniAc(e) }))
			} items.push(parentItem);
			/*if (parentItem)*/ {
				let raporItems = []; for (const cls of MQTest.subClasses) {
					const {raporSinif} = cls; if (!raporSinif) { continue } const {kodListeTipi: mne} = cls, {sinifAdi: text} = cls;
					raporItems.push(new FRMenuChoice({ mne, text, block: e => raporSinif.goster(e) }));
				}
				if (raporItems?.length) { /*parentItem.*/ items.push(new FRMenuCascade({ mne: 'RAPOR', text: 'Raporlar', items: raporItems })) }
			}
			items.push(new FRMenuChoice({ mne: MQParam_ESE.paramKod, text: MQParam_ESE.sinifAdi, block: e => app.params.ese.tanimla(e) }))
		}
		else { items.push(new FRMenuChoice({ mne: 'MAIN', text: 'TEST İşlemi', block: e => this.testBaslat(e) })) }
		return new FRMenu({ items })
	}
	dbMgr_tablolariOlustur_getQueryURLs(e) {
		let db2Urls = super.dbMgr_tablolariOlustur_getQueryURLs(e) ?? {};
		(db2Urls.main = db2Urls.main ?? []).push(`queries/main.sql`);
		return db2Urls
	}
	testBaslat(e) {
		e = e || {}; const {session} = config, testTip = e.testTip ?? e.tip ?? session.testTip, testId = e.testId ?? e.id ?? session.testId;
		if (!testId) { return null } let testSinif = MQTest.getClass(testTip); if (!testSinif) { return null }
		try { requestFullScreen() } catch (ex) { } return testSinif.baslat({ testId })
	}
	wsTestBilgi(e) { let args = e || {}; delete args.data; return ajaxPost({ url: this.getWSUrl({ api: 'testBilgi', args }) }) }
	wsTestSonucKaydet(e) {
		let args = e || {}, {data} = args; if (typeof data == 'object') { data = toJSONStr(data) } delete args.data;
		return ajaxPost({ timeout: 13 * 1000, processData: false, ajaxContentType: wsContentType, url: this.getWSUrl({ api: 'testSonucKaydet', args }), data })
	}
}
