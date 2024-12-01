class ESEApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return 'MAIN' } get kioskmuDogrudan() { return config.session?.loginTipi == 'eseLogin' }
	get isLoginRequired() { return true } get defaultLoginTipi() { return this.isAdmin ? Session.DefaultLoginTipi : 'eseLogin' }
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
	paramsDuzenle(e) { super.paramsDuzenle(e); $.extend(e.params, { localData: MQLocalData.getInstance(), ese: MQParam_ESE.getInstance() }) }
	async getAnaMenu(e) {
		const {noMenuFlag} = this; if (noMenuFlag) { return new FRMenu() }
		const {isAdmin, params} = this, {ese} = params, sablon = ese?.sablon ?? {};
		let items = []; if (isAdmin) {
			const addMenuSubItems = (mne, text, ...classes) => {
				let subItems = classes.flat().map(cls => new FRMenuChoice({ mne: cls.kodListeTipi, text: cls.sinifAdi, block: e => cls.listeEkraniAc(e) }));
				let menuItems = []; if (subItems?.length) { menuItems = mne ? [new FRMenuCascade({ mne, text, items: subItems })] : subItems; items.push(...menuItems) }
				return menuItems
			};
			addMenuSubItems('TANIM', 'Sabit Tanımlar', [MQCariUlke, MQCariIl, MQYerlesim, MQKurum, MQOkulTipi, MQYasGrup, MQESEUser, MQYetki, MQCari]);
			addMenuSubItems(null, null, [MQHasta, MQDoktor]);
			addMenuSubItems('SABLON', 'Şablonlar', [MQSablonCPT, MQSablonAnket]);
			addMenuSubItems(null, null, [MQMuayene]);
			for (const cls of [MQTest]) {
				let {sablonTip, sablonSinif, kodListeTipi: mne, sinifAdi: text} = cls;
				let sablonId = sablon[sablonTip]?.[0]?.sablonId, sablonAdi = sablonId ? await sablonSinif.getGloKod2Adi(sablonId) : null;
				if (sablonAdi) { text += `<div class="royalblue" style="font-weight: normal; font-size: 90%; padding-top: 10px">${sablonAdi}</div>` }
				items.push(new FRMenuChoice({ mne, text, block: e => cls.listeEkraniAc(e) }))
			}
			/*if (parentItem)*/ {
				let raporItems = []; for (const cls of [MQTest]) {
					const {raporSinif} = cls; if (!raporSinif) { continue } const {kodListeTipi: mne} = cls, {sinifAdi: text} = cls;
					raporItems.push(new FRMenuChoice({ mne, text, block: e => raporSinif.goster(e) }))
				}
				if (raporItems?.length) { /*parentItem.*/ items.push(new FRMenuCascade({ mne: 'RAPOR', text: 'Raporlar', items: raporItems })) }
			}
			items.push(
				new FRMenuChoice({ mne: MQParam_ESE.paramKod, text: MQParam_ESE.sinifAdi, block: e => app.params.ese.tanimla(e) }),
				new FRMenuChoice({ mne: 'TEST_YUKLE', text: 'Dosyadan Test Yükle', block: e => this.dosyadanTestYukleIstendi(e) })
			)
		}
		else {
			const {testId} = config.session, sablonId2Adi = ese.sablonId2Adi ?? {};
			for (const cls of MQTest.subClasses) {
				const {sablonTip, sablonSinif} = cls; let _items = sablon[sablonTip] ?? [];
				for (let i = 0; i < _items.length; i++) {
					let {belirtec, sablonId, etiket: text} = _items[i]; if (!sablonId) { continue }
					let {tip} = cls, sablonAdi = sablonId2Adi[sablonId];
					if (sablonAdi) { text += `<div class="royalblue" style="font-weight: normal; font-size: 90%; padding-top: 10px">${sablonAdi}</div>` }
					let mne = `${tip.toUpperCase()}-${i + 1}`; items.push(new FRMenuChoice({ mne, text, block: e => this.testBaslat({ tip, belirtec, testId, sablonId }) }))
				}
			}
		}
		return new FRMenu({ items })
	}
	testBaslat(e) {
		e = e || {}; const {session} = config, testTip = e.testTip ?? e.tip, testId = e.testId ?? e.id ?? session.testId, {belirtec, sablonId} = e;
		if (!(testId && sablonId)) { return null } let testSinif = MQTest.getClass(testTip); if (!testSinif) { return null }
		try { requestFullScreen() } catch (ex) { } return testSinif.baslat({ testId, belirtec, sablonId })
	}
	async dosyadanTestYukleIstendi(e) {
		const title = 'Test Yükleme İşlemi', {data} = await openFile({ type: 'text', accept: ['text/plain'] }) ?? {}; if (!data) { return null }
		let {index: rdlg} = await displayMessage('Seçilen dosyadaki TEST Kayıtları yüklensin mi?', title, [`<span class="red">SİLEREK</span>`, 'Silmeden', 'VAZGEÇ'])?.result ?? {}
		if ((rdlg ?? 2) == 2) { return null } let clear = rdlg == 0;
		try {
			let {testIds} = await this.dosyadanTestYukle({ ...e, data, clear, title }) ?? {};
			if (testIds?.length) { eConfirm(`<b>${testIds?.length} adet <span class="royalblue">CPT Test</span></b> kaydı oluşturuldu`, title) }
			else { hConfirm(`Yüklenecek test bilgileri belirlenemedi`, title) }
			return testIds
		}
		catch (ex) { hConfirm(getErrorText(ex), title); throw ex }
	}
	async dosyadanTestYukle(e) {
		let {clear, data} = e; if (!data) { return null } let delim = '\t', lines = data.split('\n'), i = 0;
		let line = lines[i++], cols = line.trimEnd().split(delim).map(x => x.trim().toLowerCase());
		/*line = lines[i++]; let tokens = line.trimEnd().split(delim); for (let j = 0; j < tokens.length; j++) { let value = tokens[j].trim(); if (value) { cols[j] += ' ' + value } }*/
		let testSinif = MQTestCPT, {tip} = testSinif, sablonId = new testSinif().sablonId;
		let /*recs = [],*/ testIds = [], hvListe = []; showProgress(`${lines.length} adet test kaydı yükleniyor...`, appName, true);
		window.progressManager?.setProgressMax(lines.length * 1.5);
		let tarihsaat = now(), bcptyapildi = 1, banketdeyapildi = 1, bankethiyapildi = 1;
		for (i = 2; i < lines.length; i++) {
			let rec = {}; line = lines[i].trimEnd(); if (!line) { continue }
			let tokens = line.split(delim); for (let j = 0; j < tokens.length; j++) { let col = cols[j]; rec[col] = asFloat(tokens[j].trim().replace(',', '.')) }
			/*recs.push(rec)*/ let id = newGUID(), aktifyas = asInteger(rec.yas), cinsiyet = rec.cinsiyet == 1 ? 'E' : rec.cinsiyet == 2 ? 'K' : '';
			if (!cinsiyet) { window.progressManager?.progressStep(); continue }
			let dogrusayi = asInteger(rec.cptcorrectresponses), yanlissayi = asInteger(rec.cptcommissionerrors), secilmeyendogrusayi = asInteger(rec.cptommissionerrors);
			let dogrusecimsurems = asFloat(rec.cptchoicerxntimecorrect);
			testIds.push(id); let hv = { id, tarihsaat, bcptyapildi, banketdeyapildi, bankethiyapildi, aktifyas, cinsiyet, dogrusayi, yanlissayi, secilmeyendogrusayi, dogrusecimsurems };
			hv[`${tip}sablonid`] = sablonId; hvListe.push(hv); window.progressManager?.progressStep()
		}
		/*console.table(recs)*/
		if (!hvListe?.length) { return null } let {table} = testSinif;
		let query = new MQToplu(); if (clear) { query.add(new MQIliskiliDelete({ from: table }), new MQIliskiliUpdate({ from: MQMuayene.table, set: [`cpt1testid = NULL`] })) }
		query.add(new MQInsert({ from: table, hvListe }));
		if (query?.bosDegilmi) { await app.sqlExecNone(query) }
		window.progressManager?.progressEnd(); setTimeout(() => hideProgress(), 1000)
		return { testIds, query }
	}
	wsParams(e) { let args = e || {}; delete args.data; return ajaxPost({ url: this.getWSUrl({ api: 'params', args }) }) }
	wsTestBilgi(e) { let args = e || {}; delete args.data; return ajaxPost({ url: this.getWSUrl({ api: 'testBilgi', args }) }) }
	wsTestSonucKaydet(e) {
		let args = e || {}, {data} = args; if (typeof data == 'object') { data = toJSONStr(data) } delete args.data;
		return ajaxPost({ timeout: 13 * 1000, processData: false, ajaxContentType: wsContentType, url: this.getWSUrl({ api: 'testSonucKaydet', args }), data })
	}
}
