class MQMuayene extends MQGuidOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Muayene' } static get adiSaha() { return 'fisnox' }
	static get kodListeTipi() { return 'MUAYENE' } static get table() { return 'esemuayene' } static get tableAlias() { return 'mua' }
	static get ignoreBelirtecSet() { return {...super.ignoreBelirtecSet, ...asSet(['hastaid', 'doktorid']) } }
	get tarih() { const {tarihSaat} = this; return tarihSaat?.clearTime ? new Date(tarihSaat).clearTime() : tarihSaat } set tarih(value) { this.tarihSaat = value?.clearTime ? new Date(value).clearTime() : value }
	get saat() { return timeToString(this.tarihSaat) } set saat(value) { const {tarihSaat} = this; if (value) { setTime(tarihSaat, asDate(value).getTime()) } }
	get fisNox() { return [this.seri || '', this.fisNo?.toString()].join('') }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); $.extend(e.pTanim, {
			hastaId: new PInstGuid('hastaid'), tarihSaat: new PInstDateNow('tarihsaat'), seri: new PInstStr('seri'), fisNo: new PInstNum('fisno'),
			doktorId: new PInstGuid('doktorid'), cpt: new PInstBitBool('bcptyapilacak'), ese: new PInstBitBool('beseyapilacak'),
			cptPuani: new PInstNum('cptpuani'), esePuani: new PInstNum('esepuani'), testSifre: new PInstStr('testsifre'), tani: new PInstStr('tani')
		})
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e); let {liste} = e; liste.push(
			{ id: 'testIslemleri', text: 'TEST', handler: _e => this.testIslemleriIstendi({ ...e, ..._e }) }
		)
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {tableAlias: alias} = this, {liste} = e; liste.push(
			new GridKolon({ belirtec: 'hastaid', text: 'Hasta ID', genislikCh: 40 }), new GridKolon({ belirtec: 'hastaadi', text: 'Hasta Adı', genislikCh: 30, sql: 'has.aciklama' }),
			new GridKolon({ belirtec: 'doktorid', text: 'Doktor ID', genislikCh: 40 }), new GridKolon({ belirtec: 'doktoradi', text: 'Doktor Adı', genislikCh: 30, sql: 'dok.aciklama' }),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 10, sql: `${alias}.tarihsaat` }).tipDate(),
			new GridKolon({ belirtec: 'saat', text: 'Saat', genislikCh: 9, sql: `${alias}.tarihsaat` }).tipTime(),
			new GridKolon({ belirtec: 'seri', text: 'Seri', genislikCh: 5, filterType: 'checkedlist' }), new GridKolon({ belirtec: 'fisno', text: 'No', genislikCh: 15, filterType: 'checkedlist' }).tipNumerik(),
			new GridKolon({ belirtec: 'beseyapilacak', text: 'ESE?', genislikCh: 5, filterType: 'checkedlist' }).tipBool(),
			new GridKolon({ belirtec: 'esevarmi', text: 'ESE Var?', genislikCh: 10, filterType: 'checkedlist' }).tipBool().noSql(),
			new GridKolon({ belirtec: 'eseyapildimi', text: 'ESE Yap?', genislikCh: 10, filterType: 'checkedlist' }).tipBool().noSql(),
			new GridKolon({ belirtec: 'esepuani', text: 'ESE Puanı', genislikCh: 13 }).tipDecimal(),
			new GridKolon({ belirtec: 'bcptyapilacak', text: 'CPT?', genislikCh: 5, filterType: 'checkedlist' }).tipBool(),
			new GridKolon({ belirtec: 'cptvarmi', text: 'CPT Var?', genislikCh: 10, filterType: 'checkedlist' }).tipBool().noSql(),
			new GridKolon({ belirtec: 'cptyapildimi', text: 'CPT Yap?', genislikCh: 10, filterType: 'checkedlist' }).tipBool().noSql(),
			new GridKolon({ belirtec: 'cptpuani', text: 'CPT Puanı', genislikCh: 13 }).tipDecimal(),
			new GridKolon({ belirtec: 'tani', text: 'Tanı' })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {tableAlias: alias, adiSaha} = this;
		sent.fromIliski('esehasta has', `${alias}.hastaid = has.id`)
			.leftJoin({ alias, from: 'esedoktor dok', on: `${alias}.doktorid = dok.id` })
			.leftJoin({ alias, from: 'esecpttest tcpt', on: `${alias}.id = tcpt.muayeneid` })
			.leftJoin({ alias, from: 'eseesetest tese', on: `${alias}.id = tese.muayeneid` })
		sent.sahalar.add(
			`${alias}.${adiSaha}`, `${alias}.hastaid`, 'has.aciklama hastaadi',
			`(case when tcpt.id IS NULL then 0 else 1 end) cptvarmi`, `(case when tese.id IS NULL then 0 else 1 end) esevarmi`,
			`COALESCE(tcpt.btamamlandi, 0) cptyapildimi`, `COALESCE(tese.btamamlandi, 0) eseyapildimi`
		)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(2).addStyle(e => `$elementCSS [data-builder-id = 'ese'], $elementCSS [data-builder-id = 'cpt'] { margin-left: 100px }`);
			form.addDateInput('tarih', 'Tarih'); form.addTimeInput('saat', 'Saat');
			form.addTextInput('seri', 'Seri').setMaxLength(3).addStyle_wh(70).addCSS('center'); form.addNumberInput('fisNo', 'No').setMaxLength(17).addStyle_wh(200);
			form.addCheckBox('ese', 'ESE?'); form.addNumberInput('esePuani', 'ESE Puanı').readOnly().etiketGosterim_placeholder().addStyle_wh(90);
			form.addCheckBox('cpt', 'CPT?'); form.addNumberInput('cptPuani', 'CPT Puanı').readOnly().etiketGosterim_placeholder().addStyle_wh(90);
		form = tabPage_genel.addFormWithParent().yanYana(); form.addModelKullan('hastaId', 'Hasta').comboBox().kodsuz().autoBind().setMFSinif(MQHasta); 
			form.addModelKullan('doktorId', 'Doktor').comboBox().kodsuz().autoBind().setMFSinif(MQDoktor);
		form = tabPage_genel.addFormWithParent().altAlta(); form.addTextArea('tani', 'Tanı').setMaxLength(3000).setRows(8)
	}
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); const {hv} = e; $.extend(hv, { resimsayisi: this.resimSayisi }) }
	static testIslemleriIstendi(e) {
		const gridPart = e.gridPart ?? e.parentPart ?? e.sender, title = 'Test İşlemleri';
		app.activeWndPart.openContextMenu({ gridPart, title, formDuzenleyici: _e => {
			const {form, close} = _e; form.yanYana(2);
			let handler = __e => { close(); this.testOlusturIstendi({ ...e, ..._e, ...__e, id: __e.builder.id }) };
				form.addButton('cptTestOlustur', 'CPT Kayıt').onClick(handler); form.addButton('eseTestOlustur', 'ESE Kayıt').onClick(handler);
			handler = __e => { close(); this.testEkraniAcIstendi({ ...e, ..._e, ...__e, id: __e.builder.id }) };
				form.addButton('cptTestEkraniAc', 'CPT Aç').onClick(handler); form.addButton('eseTestEkraniAc', 'ESE Aç').onClick(handler)
		} })
	}
	static async testOlusturIstendi(e) {
		const {sinifAdi} = this, gridPart = e.gridPart ?? e.parentPart ?? e.sender;
		const tip = e.id.replace('TestOlustur', ''), testSinif = MQTest.getClass(tip); if (!testSinif) { hConfirm('Uygun Test Sınıfı belirlenemedi', sinifAdi); return }
		let {selectedRecs} = gridPart; if (!selectedRecs?.length) { hConfirm('Kayıtlar seçilmelidir', sinifAdi); return }
		selectedRecs = selectedRecs.filter(rec => !!rec[`b${tip}yapilacak`]); let idListe = selectedRecs?.map(rec => rec.id);
		if (!idListe?.length) { hConfirm(`Seçilenler içinde <b>${tip.toUpperCase()}</b> için uygun test yok`, sinifAdi); return }
		const {table} = testSinif; let sent = new MQSent({ from: table, inDizi: idListe, sahalar: 'muayeneid' }), recs = await app.sqlExecSelect(sent);
		let yapilanIdSet = asSet(recs.map(rec => rec.muayeneid)), bostaIdListe = idListe.filter(id => !yapilanIdSet[id]);
		if (!bostaIdListe?.length) { hConfirm('Yapılmamış uygun test bulunamadı', sinifAdi); return }
		let rdlg = await ehConfirm(`<b class="bold forestgreen">${bostaIdListe.length}</b> adet <b class="royalblue">${tip.toUpperCase()} Test</b> kaydı açılacak, devam edilsin mi?`, sinifAdi);
		if (!rdlg) { return } let promises = []; for (const muayeneId of bostaIdListe) {
			const tarihSaat = now(), tamamlandimi = false; let onayKodu = 0; while (onayKodu < 100000) { onayKodu = asInteger(Math.random() * 1000000) }
			const testInst = new testSinif({ muayeneId, tarihSaat, tamamlandimi, onayKodu }); promises.push(testInst.yaz())
		} await Promise.all(promises); gridPart.tazele(); /*testSinif.listeEkraniAc(e);*/
		setTimeout(() => { eConfirm(`<b class="bold forestgreen">${bostaIdListe.length}</b> adet <b class="royalblue">${tip.toUpperCase()} Test</b> kaydı açıldı`, sinifAdi) }, 200)
	}
	static async testEkraniAcIstendi(e) {
		const {sinifAdi} = this, gridPart = e.gridPart ?? e.parentPart ?? e.sender;
		const tip = e.id.replace('TestEkraniAc', ''), testSinif = MQTest.getClass(tip); if (!testSinif) { hConfirm('Uygun Test Sınıfı belirlenemedi', sinifAdi); return }
		return testSinif.listeEkraniAc()
	}
}

/*
static topluXMenuIstendi(e) {
		e = e || {}; const {parentRec} = e, {sabitHatKod} = app, hatKod = e.hatKod = e.hatKod ?? parentRec?.hatKod;
		$.extend(e, { noCheck: true, formDuzenleyici: _e => {
			_e = $.extend({}, e, _e); const {form, close} = _e; form.yanYana(2);
			form.addButton('mola', undefined, 'Mola').onClick(e => { close(); this.topluXIstendi($.extend({}, _e, e, { id: e.builder.id })) });
			form.addButton('vardiyaDegisimi', undefined, 'Vardiya Değişimi').onClick(e => { close(); this.topluXIstendi($.extend({}, _e, e, { id: e.builder.id })) });
			if (!sabitHatKod || hatKod) {
				if (config.dev) { form.addButton('devam', undefined, 'Toplu Devam').onClick(e => { close(); this.topluXIstendi($.extend({}, _e, e, { id: e.builder.id })) }) }
				form.addButton('isBitti', undefined, 'İş Bitti').onClick(e => { close(); this.topluXIstendi($.extend({}, _e, e, { id: e.builder.id })) });
				form.addButton('gerceklemeYap', undefined, 'Gerçekleme Yap').onClick(e => { close(); this.topluXIstendi($.extend({}, _e, e, { id: e.builder.id })) });
				form.addButton('zamanEtuduBaslat', undefined, 'Zaman Etüdü Başlat').onClick(e => { close(); this.topluXIstendi($.extend({}, _e, e, { id: e.builder.id })) });
				form.addButton('zamanEtuduKapat', undefined, 'Zaman Etüdü Kapat').onClick(e => { close(); this.topluXIstendi($.extend({}, _e, e, { id: e.builder.id })) })
			}
		} }); this.openContextMenu(e)
	}
*/
