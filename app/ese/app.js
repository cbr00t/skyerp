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
			/*let raporItems = [];*/ for (const cls of [MQTest]) {
				const {raporSinif} = cls; if (!raporSinif) { continue } let mne = 'RAPOR', {sinifAdi: text} = cls; if (!text) { continue }
				text += ' Raporu'; items.push(new FRMenuChoice({ mne, text, block: e => raporSinif.goster(e) }))
			} /*if (raporItems?.length) { items.push(new FRMenuCascade({ mne: 'RAPOR', text: 'Raporlar', items: raporItems })) }*/
			items.push(
				new FRMenuChoice({ mne: MQParam_ESE.paramKod, text: MQParam_ESE.sinifAdi, block: e => this.params.ese.tanimla(e) }),
				new FRMenuChoice({ mne: 'TEST_YUKLE', text: 'Dosyadan Test Yükle', block: e => this.dosyadanTestYukleIstendi(e) })
			);
			if (config.dev) { items.push(new FRMenuChoice({ mne: 'DEHB_ANALIZ', text: 'DEHB Durum Analizi Yap', block: e => this.testlerIcinOzelDEHBmiBelirleIstendi(e) })) }
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
	/*dehbmi(e) {
	    const w = { dogru: 0.3, yanlis: -0.27, secilmeyenDogru: -0.3, dogruSecimMS: -0.21, yas: 0.1, cinsiyet: -0.14 };
		const deSkor = e.deSkor ?? e.deskor ?? 0, deBelirti = e.deBelirti ?? e.deBelirtiSayi ?? e.debelirtisayi;
		const hiSkor = e.hiSkor ?? e.hiskor ?? 0, hiBelirti = e.hiBelirti ?? e.hiBelirtiSayi ?? e.hibelirtisayi;
		const dogru = e.dogruSayi ?? e.dogrusayi ?? 0, yanlis = e.yanlisSayi ?? e.yanlissayi ?? 0;
		const secilmeyenDogru = e.secilmeyenDogruSayi ?? e.secilmeyendogrusayi ?? 0, dogruSecimMS = e.dogruSecimSureMS ?? e.dogrusecimsurems ?? e.ortdogrusecimsurems;
		const yas = ;
	    const dehbSkor = (
			(w.dogru * dogru) + (w.yanlis * yanlis) + (w.secilmeyenDogru * secilmeyenDogru) +
			(w.dogruSecimMS * dogruSecimMS) + (w.yas * yas) + (w.cinsiyet * cinsiyetNum)
	    );
		return dehbSkor <= 0
	}*/
	dehbmi(e) {
	    const t = { deSkor: 9, hiSkor: 9, deBelirti: 5, hiBelirti: 5, belirtiToplami: 8, skorSinir: 27, skorAralikMax: 25, dogru: 35, yanlis: 5, secilmeyenDogru: 6, dogruSecimMS: 130 };
		const d = {
			de: e.de ?? { skor: e.deSkor ?? e.deskor ?? 0, belirti: e.deBelirti ?? e.deBelirtiSayi ?? e.debelirtisayi ?? 0 },
			hi: e.hi ?? { skor: e.hiSkor ?? e.hiskor ?? 0, belirti: e.hiBelirti ?? e.hiBelirtiSayi ?? e.hibelirtisayi ?? 0 },
			dogru: e.dogru ?? e.dogruSayi ?? e.dogrusayi ?? 0, yanlis: e.yanlis ?? e.yanlisSayi ?? e.yanlissayi ?? 0,
			secilmeyenDogru: e.secilmeyenDogru ?? e.secilmeyenDogruSayi ?? e.secilmeyendogrusayi ?? 0,
			dogruSecimMS: e.dogruSecimMS ?? e.dogruSecimSureMS ?? e.dogrusecimsurems ?? e.ortdogrusecimsurems ?? 0,
			yas: e.yas ?? e.aktifYas ?? e.aktifyas, cinsiyet: e.cinsiyet?.toUpperCase()
		}, kadinmi = d.cinsiyet == 'K', erkekmi = d.cinsiyet == 'E';
		let dehbmi = (
			d.de.skor * (erkekmi ? 4 : 1) >= t.deSkor || d.de.belirti >= t.deBelirti || d.hi.skor  >= t.hiSkor || d.hi.belirti >= t.hiBelirti ||
			d.dogru < t.dogru || d.yanlis > t.yanlis || d.secilmeyenDogru > t.secilmeyenDogru || d.dogruSecimMS > t.dogruSecimMS ||
			(d.de.belirti + d.hi.belirti) >= t.belirtiToplami
	    );
		/*if (dehbmi && Math.max(d.de.skor, d.hi.skor) >= t.skorSinir && Math.abs(d.de.skor - d.hi.skor) > t.skorAralikMax) { dehbmi = false }*/
		return dehbmi
	}
	async testlerIcinOzelDEHBmiBelirleIstendi(e) {
		e = e ?? {}; let recs = e.recs ?? await MQTest.loadServerData(); if (!recs?.length) { hConfirm('DEHB Durum belirlenecek Test bulunamadı', appName); return false }
		let rdlg = await ehConfirm(`<b class="royalblue">${recs.length} adet</b> Test için <b class="royalblue">DEHB Durum Analizi</b> yapılacak ve Testler güncellenecek, devam edilsin mi?`, appName);
		if (!rdlg) { return false } return await this.testlerIcinOzelDEHBmiBelirle(e)
	}
	async testlerIcinOzelDEHBmiBelirle(e) {
		e = e ?? {}; let recs = e.recs ?? await MQTest.loadServerData(), dehb2IdListe = {}; if (!recs?.length) { return false }
		for (const rec of recs) {
			const {id} = rec, dehbmi = this.dehbmi(rec); if (dehbmi == null) { continue }
			(dehb2IdListe[dehbmi] = dehb2IdListe[dehbmi] ?? []).push(id)
		}
		let query = new MQToplu(), totalCount = 0, from = 'esetest';
		for (const [dehbmi, idListe] of Object.entries(dehb2IdListe)) {
			totalCount += idListe.length; query.add(
				new MQIliskiliUpdate({ from, where: { inDizi: idListe, saha: 'id' }, set: { degerAta: bool2Int(dehbmi), saha: 'bdehbmiozel' } }),
				new MQSent({
					from, sahalar: 'COUNT(*) sayi',
					where: ['muayeneid IS NULL', 'hastaid IS NULL', 'bdehbvarmi <> bdehbmiozel', 'bcptyapildi <> 0', 'banketdeyapildi <> 0', 'bankethiyapildi <> 0']
				})
			)
		}
		recs = await app.sqlExecSelect(query); let gecerliSayi = 0; for (const {sayi} of recs) { gecerliSayi += sayi }
		let dogrulukOrani = roundToFra2((1 - (gecerliSayi / totalCount)) * 100), dogrulukCSS = dogrulukOrani > 96 ? 'green' : 'orangered';
		eConfirm(`<b>${totalCount} adet Test için <b class="royalblue">DEHB(<i>Özel</i>)</b> durumu güncellendi<p/>Doğruluk: <b class="${dogrulukCSS}">%${dogrulukOrani}</b>`, appName);
		return true
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
		const PTurgayPrefix = 'p.turgay.'; let tarihsaat = now(), bcptyapildi = 1, banketdeyapildi = 1, bankethiyapildi = 1;
		for (i = 2; i < lines.length; i++) {
			let rec = {}; line = lines[i].trimEnd(); if (!line) { continue }
			let tokens = line.split(delim); for (let j = 0; j < tokens.length; j++) { let col = cols[j]; rec[col] = asFloat(tokens[j].trim().replace(',', '.')) }
			/*recs.push(rec)*/ let id = newGUID(), aktifyas = asInteger(rec.yas), cinsiyet = rec.cinsiyet == 1 ? 'E' : rec.cinsiyet == 2 ? 'K' : '';
			if (!cinsiyet) { window.progressManager?.progressStep(); continue }
			let dogrusayi = asInteger(rec.cptcorrectresponses), yanlissayi = asInteger(rec.cptcommissionerrors), bdehbvarmi = asInteger(rec.dehb) == 1;
			let secilmeyendogrusayi = asInteger(rec.cptommissionerrors), dogrusecimsurems = asFloat(rec.cptchoicerxntimecorrect);
			let debelirtisayi = asInteger(rec[`${PTurgayPrefix}hi.bs`]), deskor = asInteger(rec[`${PTurgayPrefix}de.skor`]);
			let hibelirtisayi = asInteger(rec[`${PTurgayPrefix}hi.bs`]), hiskor = asInteger(rec[`${PTurgayPrefix}hi.skor`]);
			testIds.push(id); let hv = {
				id, tarihsaat, bcptyapildi, banketdeyapildi, bankethiyapildi, aktifyas, cinsiyet, bdehbvarmi,
				dogrusayi, yanlissayi, secilmeyendogrusayi, dogrusecimsurems, debelirtisayi, deskor, hibelirtisayi, hiskor
			};
			hvListe.push(hv); window.progressManager?.progressStep()
		}
		/*console.table(recs)*/
		if (!hvListe?.length) { return null } let {table} = testSinif;
		let query = new MQToplu(); if (clear) { query.add(new MQIliskiliDelete({ from: table })) } query.add(new MQInsert({ from: table, hvListe }));
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
