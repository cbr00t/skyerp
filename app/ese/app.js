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
				new FRMenuChoice({ mne: MQParam_ESE.paramKod, text: MQParam_ESE.sinifAdi, block: e => ese.tanimla(e) }),
				new FRMenuChoice({ mne: 'TEST_YUKLE', text: 'Dosyadan Test Yükle', block: e => this.dosyadanTestYukleIstendi(e) }),
				new FRMenuChoice({ mne: 'DEHB_ANALIZ', text: 'DEHB Durum Analizi Yap', block: e => this.testlerIcinOzelDEHBmiBelirleIstendi(e) })
			)
		}
		else {
			const {testId} = config.session, sablonId2Adi = ese.sablonId2Adi ?? {};
			let {tableAlias: alias, idSaha} = MQTest, rec, tipVeSablonId2Yapildi = {};
			try { rec = (await MQTest.loadServerData({ ozelQueryDuzenle: ({ sent }) => sent.where.degerAta(testId, `${alias}.${idSaha}`) }))?.[0] } catch (ex) { console.error(getErrorText(ex)) }
			if (rec) {
				for (let {tip, belirtec, sablonId} of ese.getIter()) {
					let tipVeBelirtec = `${tip}${belirtec}`, key = `b${tipVeBelirtec}yapildi`, flag = rec[key];
					let tipVeSablonId = `${tip}-${sablonId}`; tipVeSablonId2Yapildi[tipVeSablonId] = asBool(flag)
				}
			}
			for (const cls of MQTest.subClasses) {
				const {sablonTip, sablonSinif} = cls; let _items = sablon[sablonTip] ?? [];
				for (let i = 0; i < _items.length; i++) {
					let {belirtec, sablonId, etiket: text} = _items[i]; if (!sablonId) { continue }
					let {tip} = cls, tipVeSablonId = `${tip}-${sablonId}`, sablonAdi = sablonId2Adi[sablonId];
					if (sablonAdi) { text += `<div class="royalblue" style="font-weight: normal; font-size: 90%; padding-top: 10px">${sablonAdi}</div>` }
					let disabled = false, cssColor = 'green'; if (tipVeSablonId2Yapildi[tipVeSablonId]) { disabled = true; cssColor = 'firebrick' }
					text = `<div class="full-wh" style="border: 2px solid ${cssColor}; box-shadow: 0 0 5px 0px ${cssColor}"><div style="margin-top: 10%">${text}</div></div>`
					let mne = `${tip.toUpperCase()}-${i + 1}`; items.push(new FRMenuChoice({ mne, text, disabled, block: e => this.testBaslat({ tip, belirtec, testId, sablonId }) }))
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
	dehbmi(e) {
	    const d = {
	        de: { skor: e.deskor ?? 0, belirti: e.debelirtisayi ?? 0 },
	        hi: { skor: e.hiskor ?? 0, belirti: e.hibelirtisayi ?? 0 },
	        dogru: e.dogrusayi ?? 0, yanlis: e.yanlissayi ?? 0, dogruSecimMS: e.dogrusecimsurems ?? 0, yas: e.aktifyas ?? 0
	    };
	    // Threshold values for the decision
	    const t = {
	        deMin: 8,    // Minimum DE symptoms
	        hiMin: 5,    // Minimum HI symptoms
	    };
	    // Calculate if DEHB criteria are met
	    const dehbmi = (d.de.skor >= t.deMin || d.hi.skor >= t.hiMin);
	    return dehbmi
	}
	dehbmi_x1(e) {
	    const t = {
			deSkor: 11.92,        // Ortalama üzerinden ayarlanan eşik
	        hiSkor: 8.30,
	        deBelirti: 4.45,
	        hiBelirti: 2.83,
	        dogru: 37.0,          // Düşük tolerans ayarı
	        yanlis: 2.42,
	        dogruSecimMS: 533.14  // Performans sınırı
		};
		const d = {
			de: { skor: e.deSkor ?? e.deskor ?? 0, belirti: e.deBelirti ?? e.deBelirtiSayi ?? e.debelirtisayi ?? 0 },
	        hi: { skor: e.hiSkor ?? e.hiskor ?? 0, belirti: e.hiBelirti ?? e.hiBelirtiSayi ?? e.hibelirtisayi ?? 0 },
	        dogru: e.dogru ?? e.dogruSayi ?? e.dogrusayi ?? 0, yanlis: e.yanlis ?? e.yanlisSayi ?? e.yanlissayi ?? 0,
	        dogruSecimMS: e.dogruSecimMS ?? e.dogruSecimSureMS ?? e.dogrusecimsurems ?? e.ortdogrusecimsurems ?? 0,
	        yas: e.yas ?? e.aktifYas ?? e.aktifyas, cinsiyet: e.cinsiyet?.toUpperCase()
		}, kadinmi = d.cinsiyet == 'K', erkekmi = d.cinsiyet == 'E';
		let dehbmi = (
			d.de.skor >= t.deSkor || d.de.belirti >= t.deBelirti ||
	        d.hi.skor >= t.hiSkor || d.hi.belirti >= t.hiBelirti ||
	        d.dogru < t.dogru || d.yanlis > t.yanlis || d.dogruSecimMS > t.dogruSecimMS
	    );
		return dehbmi
	}
	dehbmi_x2(e) {
	    const d = {
	        de: { 
	            skor: e.deskor ?? 0, 
	            belirti: e.debelirtisayi ?? 0 
	        },
	        hi: { 
	            skor: e.hiskor ?? 0, 
	            belirti: e.hibelirtisayi ?? 0 
	        },
	        dogru: e.dogrusayi ?? 0, 
	        yanlis: e.yanlissayi ?? 0,
	        dogruSecimMS: e.dogrusecimsurems ?? 0,
	        yas: e.aktifyas ?? 0,
	    };
	    // Threshold values refined to handle inconsistencies
	    const t = {
	        deMin: 6,     // Minimum DE symptoms
	        hiMin: 6,     // Minimum HI symptoms
	        scoreMin: 15, // Minimum combined score for DE and HI
	        maxDogruSecimMS: 700, // Slightly relaxed timing threshold
	        maxYanlisSayisi: 8 // Adjusted allowable incorrect answers
	    };
	    // Refined criteria to account for edge cases
	    const meetsCoreCriteria = (
	        (d.de.belirti >= t.deMin || d.hi.belirti >= t.hiMin) &&
	        (d.de.skor + d.hi.skor >= t.scoreMin)
	    );
	    const meetsPerformanceCriteria = (
	        (d.dogruSecimMS <= t.maxDogruSecimMS || d.dogruSecimMS === 0) &&
	        (d.yanlis <= t.maxYanlisSayisi)
	    );
	    // Specific adjustment for borderline cases identified in inconsistencies
	    const borderlineAdjustments = (
	        (d.de.skor >= 5 && d.hi.skor >= 5 && d.yas <= 10) ||
	        (d.dogruSecimMS > 500 && d.yanlis > 5 && d.de.skor + d.hi.skor >= 14)
	    );
	    const dehbmi = meetsCoreCriteria || meetsPerformanceCriteria || borderlineAdjustments;
	    return dehbmi
	}
	dehbmi_x3(e) {
		const d = {
	        de: { skor: e.deskor ?? 0, belirti: e.debelirtisayi ?? 0 },
	        hi: { skor: e.hiskor ?? 0, belirti: e.hibelirtisayi ?? 0 },
	        yanlis: e.yanlissayi ?? 0,
	        dogruSecimMS: e.dogrusecimsurems ?? 0,
	        yas: e.aktifyas ?? 0,
	        secilmeyenDogru: e.secilmeyendogrusayi ?? 0
	    };
	    // Weighted formula based on feature importance
	    const score = 
	        (d.de.skor * 0.3) +
	        (d.hi.skor * 0.15) +
	        (d.dogruSecimMS * 0.14) +
	        (d.de.belirti * 0.13) +
	        (d.yanlis * 0.09) -
	        (d.yas * 0.05);

	    // Threshold for DEHB prediction
	    const threshold = 7.5;
	    return score >= threshold
	}
	dehbmi_x4(e) {
	    const d = {
	        de: { 
	            skor: e.deskor ?? 0, 
	            belirti: e.debelirtisayi ?? 0 
	        },
	        hi: { 
	            skor: e.hiskor ?? 0, 
	            belirti: e.hibelirtisayi ?? 0 
	        },
	        dogru: e.dogrusayi ?? 0, 
	        yanlis: e.yanlissayi ?? 0,
	        dogruSecimMS: e.dogrusecimsurems ?? 0,
	        yas: e.aktifyas ?? 0,
	    };
	    // Thresholds and conditions updated based on broader analysis
	    const thresholds = {
	        deMin: 6,   // Minimum DE symptoms for more general tolerance
	        hiMin: 6,   // Minimum HI symptoms for more general tolerance
	        scoreMin: 10, // Lowered combined score threshold for DE and HI
	        maxDogruSecimMS: 700, // Slightly relaxed timing threshold
	        maxYanlisSayisi: 10 // Increased allowance for incorrect answers
	    };
	    // Adjusted criteria with layered conditions
	    const meetsCoreCriteria = (
	        (d.de.belirti >= thresholds.deMin || d.hi.belirti >= thresholds.hiMin) &&
	        (d.de.skor + d.hi.skor >= thresholds.scoreMin)
	    );
	    const meetsPerformanceCriteria = (
	        (d.dogruSecimMS <= thresholds.maxDogruSecimMS || d.dogruSecimMS === 0) &&
	        (d.yanlis <= thresholds.maxYanlisSayisi)
	    );
	    const edgeCaseAdjustments = (
	        d.yas < 10 && (d.de.skor > 8 || d.hi.skor > 8)
	    );
	    const dehbmi = meetsCoreCriteria || meetsPerformanceCriteria || edgeCaseAdjustments;
	    return dehbmi
	}
	dehbmi_x5(e) {
	    // data: { deskor, hiskor, yanlissayi, debelirtisayi, hibelirtisayi, dogrusecimsurems, yanlissecimsurems, secilmeyendogrusayi }
	    const b0 = -4.3;
	    const b1 = 0.12; // deskor katsayısı
	    const b2 = 0.09; // hiskor katsayısı
	    const b3 = 0.05; // yanlissayi katsayısı
	    const b4 = 0.07; // debelirtisayi katsayısı
	    const b5 = 0.08; // hibelirtisayi katsayısı
	    const b6 = -0.001; // dogrusecimsurems katsayısı
	    const b7 = 0.002; // yanlissecimsurems katsayısı
	    const b8 = -0.03; // secilmeyendogrusayi katsayısı
	    // Lineer skor:
	    const linearScore = b0
	        + b1 * e.deskor
	        + b2 * e.hiskor
	        + b3 * e.yanlissayi
	        + b4 * e.debelirtisayi
	        + b5 * e.hibelirtisayi
	        + b6 * e.dogrusecimsurems
	        + b7 * e.yanlissecimsurems
	        + b8 * e.secilmeyendogrusayi;
	
	    // Olasılık (lojistik fonksiyon):
	    const probability = 1 / (1 + Math.exp(-linearScore));
	    // Eşik değer:
	    return probability > 0.5 // true (DEHB var), false (DEHB yok)
	}
	async testlerIcinOzelDEHBmiBelirleIstendi(e) {
		e = e ?? {}; let recs = e.recs ?? await MQTest.loadServerData(); if (!recs?.length) { hConfirm('DEHB Durum belirlenecek Test bulunamadı', appName); return false }
		let rdlg = await ehConfirm(`<b class="royalblue">${recs.length} adet</b> Test için <b class="royalblue">DEHB Durum Analizi</b> yapılacak ve Testler güncellenecek, devam edilsin mi?`, appName);
		if (!rdlg) { return false } return await this.testlerIcinOzelDEHBmiBelirle(e)
	}
	async testlerIcinOzelDEHBmiBelirle(e) {
		e = e ?? {}; let recs = e.recs ?? await MQTest.loadServerData(), dehb2IdListe = {}; if (!recs?.length) { return null }
		const selector = e.selector ?? 'dehbmi'; for (const rec of recs) {
			const {id} = rec, dehbmi = this[selector](rec); if (dehbmi == null) { continue }
			(dehb2IdListe[dehbmi] = dehb2IdListe[dehbmi] ?? []).push(id)
		}
		let totalCount = 0, from = 'esetest', query = new MQToplu();
		for (const [dehbmi, idListe] of Object.entries(dehb2IdListe)) {
			totalCount += idListe.length;
			query.add(new MQIliskiliUpdate({ from, where: { inDizi: idListe, saha: 'id' }, set: { degerAta: bool2Int(dehbmi), saha: 'bdehbmiozel' } }))
		}
		if (query?.liste.length) { await app.sqlExecNone(query) }
		query = new MQSent({
			from, sahalar: 'COUNT(*) sayi',
			where: ['muayeneid IS NULL', 'hastaid IS NULL', 'bdehbvarmi <> bdehbmiozel', 'bcptyapildi <> 0', 'banketdeyapildi <> 0', 'bankethiyapildi <> 0']
		}); recs = await app.sqlExecSelect(query); let tutarsizSayi = 0; for (const {sayi} of recs) { tutarsizSayi += sayi }
		let dogrulukOrani = roundToFra2((1 - (tutarsizSayi / totalCount)) * 100), dogrulukCSS = dogrulukOrani > 96 ? 'green' : 'orangered';
		if (!e.silent) { eConfirm(`<b>${totalCount} adet Test için <b class="royalblue">DEHB(<i>Özel</i>)</b> durumu güncellendi<p/>Doğruluk: <b class="${dogrulukCSS}">%${dogrulukOrani}</b>`, appName) }
		return { totalCount, tutarsizSayi, dogrulukOrani }
	}
	async dosyadanTestYukleIstendi(e) {
		const title = 'Test Yükleme İşlemi', {data} = await openFile({ type: 'text', accept: ['text/plain', 'text/tab-separated-values'] }) ?? {}; if (!data) { return null }
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
