class MQMuayene extends MQGuidOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Muayene' } static get adiSaha() { return 'fisnox' }
	static get kodListeTipi() { return 'MUAYENE' } static get table() { return 'esemuayene' } static get tableAlias() { return 'mua' }
	static get ignoreBelirtecSet() { return {...super.ignoreBelirtecSet, ...asSet(['hastaid', 'doktorid']) } }
	get tarih() { const {tarihSaat} = this; return tarihSaat?.clearTime ? new Date(tarihSaat).clearTime() : tarihSaat } set tarih(value) { this.tarihSaat = value?.clearTime ? new Date(value).clearTime() : value }
	get saat() { return timeToString(this.tarihSaat) } set saat(value) { const {tarihSaat} = this; if (value) { setTime(tarihSaat, asDate(value).getTime()) } }
	get fisNox() { return [this.seri || '', this.fisNo?.toString()].join('') }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e; $.extend(e.pTanim, {
			hastaId: new PInstGuid('hastaid'), tarihSaat: new PInstDateNow('tarihsaat'), seri: new PInstStr('seri'), fisNo: new PInstNum('fisno'),
			doktorId: new PInstGuid('doktorid'), testSifre: new PInstStr('testsifre'), tani: new PInstStr('tani')
		});
		const sablon = app.params.ese.sablon ?? {}; for (const [tip, items] of Object.entries(sablon)) {
			for (let i = 1; i <= items?.length || 0; i++) {
				const {etiket, sablonId} = items[i - 1] ?? {}; if (!sablonId) { continue }
				pTanim[`${tip}${i}`] = new PInstBitBool(`b${tip}${i}yapilacak`); pTanim[`${tip}${i}Puani`] = new PInstNum(`${tip}${i}puani`);
				pTanim[`${tip}${i}TestId`] = new PInstGuid(`${tip}${i}testid`)
			}
		}
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e); let {liste} = e; liste.push(
			{ id: 'testIslemleri', text: 'TEST', handler: _e => this.testIslemleriIstendi({ ...e, ..._e }) }
		)
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const {secimler: sec} = e; sec.grupTopluEkle([ { kod: 'teknik', aciklama: 'Teknik Bilgiler', kapali: true, zeminRenk: 'darkgray' } ]);
		sec.secimTopluEkle({
			tamamlandiDurumu: new SecimTekSecim({ etiket: 'Tamamlanma Durumu', tekSecim: new BuDigerVeHepsi([`<span class="forestgreen">Tamamlananlar</span>`, `<span class="darkred">TamamlanMAyanlar</span>`]) }),
			tarih: new SecimDate({ etiket: 'Tarih/Saat', basi: today().addDays(-7) }),
			hastaAdi: new SecimOzellik({ etiket: 'Hasta İsim' }), doktorIsim: new SecimOzellik({ etiket: 'Doktor İsim' }),
			hastaId: new SecimBasSon({ etiket: 'Hasta', mfSinif: MQHasta, grupKod: 'teknik' })
		}).whereBlockEkle(({ secimler: sec, where: wh }) => {
			const {tableAlias: alias, sablonTip: tip} = this, eskiTip = tip == 'anket' ? 'ese' : tip;
			wh.basiSonu({ basi: sec.tarih.basi, sonu: sec.tarih.sonu?.yarin().clone().clearTime() }, `${alias}.tarihsaat`);
			wh.ozellik(sec.hastaAdi, 'has.aciklama').ozellik(sec.doktorAdi, 'dok.aciklama').basiSonu(sec.hastaId, `${alias}.hastaid`)
			
		})
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {tableAlias: alias} = this, sablon = app.params.ese.sablon ?? {};
		const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'hastaid', text: 'Hasta ID', genislikCh: 40 }), new GridKolon({ belirtec: 'hastaadi', text: 'Hasta Adı', genislikCh: 30, sql: 'has.aciklama' }),
			new GridKolon({ belirtec: 'doktorid', text: 'Doktor ID', genislikCh: 40 }), new GridKolon({ belirtec: 'doktoradi', text: 'Doktor Adı', genislikCh: 30, sql: 'dok.aciklama' }),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 10, sql: `${alias}.tarihsaat` }).tipDate(),
			new GridKolon({ belirtec: 'saat', text: 'Saat', genislikCh: 9, sql: `${alias}.tarihsaat` }).tipTime(),
			new GridKolon({ belirtec: 'seri', text: 'Seri', genislikCh: 5, filterType: 'checkedlist' }), new GridKolon({ belirtec: 'fisno', text: 'No', genislikCh: 15, filterType: 'checkedlist' }).tipNumerik(),
		);
		for (const [tip, items] of Object.entries(sablon)) {
			for (let i = 1; i <= items?.length || 0; i++) {
				const {etiket, sablonId} = items[i - 1] ?? {}; if (!sablonId) { continue }
				liste.push(
					new GridKolon({ belirtec: `b${tip}${i}yapilacak`, text: `${etiket}?`, genislikCh: 5, filterType: 'checkedlist' }).tipBool(),
					new GridKolon({ belirtec: `${tip}${i}varmi`, text: `${etiket} Var?`, genislikCh: 10, filterType: 'checkedlist' }).tipBool().noSql(),
					new GridKolon({ belirtec: `${tip}${i}yapildimi`, text: `${etiket} Yap?`, genislikCh: 10, filterType: 'checkedlist' }).tipBool().noSql(),
					new GridKolon({ belirtec: `${tip}${i}puani`, text: `${etiket} Puanı`, genislikCh: 13 }).tipDecimal(1)
				)
			}
		}
		liste.push(new GridKolon({ belirtec: 'tani', text: 'Tanı', genislikCh: 50 }))
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {stm, sent} = e, {tableAlias: alias, adiSaha} = this, sablon = app.params.ese.sablon ?? {};
		sent.fromIliski('esehasta has', `${alias}.hastaid = has.id`).leftJoin({ alias, from: 'esedoktor dok', on: `${alias}.doktorid = dok.id` });
		sent.sahalar.add(`${alias}.${adiSaha}`, `${alias}.hastaid`, 'has.aciklama hastaadi');
		for (const [tip, items] of Object.entries(sablon)) {
			const eskiTip = tip == 'anket' ? 'ese' : tip; for (let i = 1; i <= items?.length || 0; i++) {
				const {etiket, sablonId} = items[i - 1] ?? {}; if (!sablonId) { continue }
				sent.leftJoin({ alias, from: `ese${tip}test t${tip}${i}`, on: `${alias}.${tip}${i}testid = t${tip}${i}.id` });
				sent.sahalar.add(
					`${alias}.${tip}${i}testid`, `(case when ${alias}.${tip}${i}testid IS NULL then 0 else 1 end) ${tip}${i}varmi`,
					`COALESCE(t${tip}${i}.btamamlandi, 0) ${tip}${i}yapildimi`)
			}
		}
		stm.orderBy.add(`${alias}.tarihsaat DESC`, 'has.aciklama')
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const sablon = app.params.ese.sablon ?? {}, {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(2);
			form.addDateInput('tarih', 'Tarih'); form.addTimeInput('saat', 'Saat');
			form.addTextInput('seri', 'Seri').setMaxLength(3).addStyle_wh(70).addCSS('center'); form.addNumberInput('fisNo', 'No').setMaxLength(17).addStyle_wh(200);
		/*form = tabPage_genel.addFormWithParent().yanYana(2);*/ for (const [tip, items] of Object.entries(sablon)) {
			for (let i = 1; i <= items?.length || 0; i++) {
				const {etiket, sablonId} = items[i - 1] ?? {}; if (!sablonId) { continue }
				form.addCheckBox(`${tip}${i}`, `${etiket}?`).addCSS('testTip-flag testTip').addStyle_wh(null, 'var(--full)').addStyle(e => `$elementCSS { margin-left: 30px !important; padding: 0 !important }`);
				form.addNumberInput(`${tip}${i}Puani`, 'Puan').readOnly().etiketGosterim_placeholder().addCSS('testTip-puan testTip').addStyle_wh(40, 'var(--full)')
			}
		}
		form = tabPage_genel.addFormWithParent().yanYana(); form.addModelKullan('hastaId', 'Hasta').comboBox().kodsuz().autoBind().setMFSinif(MQHasta); 
			form.addModelKullan('doktorId', 'Doktor').comboBox().kodsuz().autoBind().setMFSinif(MQDoktor);
		form = tabPage_genel.addFormWithParent().altAlta(); form.addTextArea('tani', 'Tanı').setMaxLength(3000).setRows(8)
	}
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); const {hv} = e; $.extend(hv, { resimsayisi: this.resimSayisi }) }
	static async testIslemleriIstendi(e) {
		const sablon = app.params.ese.sablon ?? {}, gridPart = e.gridPart ?? e.parentPart ?? e.sender, title = 'Test İşlemleri';
		app.activeWndPart.openContextMenu({ gridPart, title, argsDuzenle: _e => $.extend(_e.wndArgs, { width: '95%', height: 310 }), formDuzenleyici: async _e => {
			const {form, close, gridPart} = _e, recs = gridPart.selectedRecs, idListe = recs.map(rec => rec.id);
			form.yanYana().addStyle(e => `$elementCSS { padding-top: 40px }`);
			for (const [tip, items] of Object.entries(sablon)) {
				const maxSayi = items?.length || 0; if (!maxSayi) { continue }
				for (let i = 1; i <= maxSayi || 0; i++) {
					const {etiket, sablonId} = items[i - 1] ?? {}; if (!sablonId) { continue }
					const testSinif = MQTest.getClass(tip), {table: testTable} = testSinif, eskiTip = tip == 'anket' ? 'ese' : tip;
					let sent = new MQSent({ from: testTable, sahalar: 'muayeneid' }); sent.where.inDizi(idListe, 'muayeneid').degerAta(sablonId, `${eskiTip}sablonid`);
					const mevcutIdSet = asSet((await app.sqlExecSelect(sent)).map(rec => rec.muayeneid)), bostaIdListe = idListe.filter(id => !mevcutIdSet[id]);
					let altForm = form.addFormWithParent(`${tip}${i}`).altAlta(); altForm.addForm().setLayout(e =>
						$(`<h5 class="bold center royalblue" style="padding-bottom: 13px; margin-right: 10px; border-bottom: 1px solid royalblue">${etiket || ''}</h5>`));
					let handler = __e => {
						const {id} = __e.builder, parts = id.split('_'), [tip, selector] = parts, seq = asInteger(parts[2]);
						close(); this[`${selector}Istendi`]({ ...e, ..._e, ...__e, id, tip, seq, maxSayi })
					};
					altForm.addButton(`${tip}_testOlustur_${i}`, `${etiket} Kayıt`).onClick(handler).setVisibleKosulu(bostaIdListe?.length ? true : 'basic-hidden');
					altForm.addButton(`${tip}_testEkraniAc_${i}`, `${etiket} Test Liste Aç`).onClick(handler)
				}
			}
		} })
	}
	static async testOlusturIstendi(e) {
		const {sinifAdi} = this, {tip, seq, maxSayi} = e, testSinif = MQTest.getClass(tip); if (!testSinif) { hConfirm('Uygun Test Sınıfı belirlenemedi', sinifAdi); return }
		const gridPart = e.gridPart ?? e.parentPart ?? e.sender; let {selectedRecs} = gridPart; if (!selectedRecs?.length) { hConfirm('Kayıtlar seçilmelidir', sinifAdi); return }
		const {sablonId, etiket} = app.params.ese.sablon?.[tip]?.[seq - 1]; if (!sablonId) { hConfirm(`${etiket} test'i için ESE Parametrelerindeki Şablon tanımsızdır`, sinifAdi); return }
		selectedRecs = selectedRecs.filter(rec => !!rec[`b${tip}${seq}yapilacak`]); let idListe = selectedRecs?.map(rec => rec.id);
		if (!idListe?.length) { hConfirm(`Seçilenler içinde <b>${tip.toUpperCase()}</b> için uygun test yok`, sinifAdi); return }
		try {
			const {table: testTable} = testSinif, eskiTip = tip == 'anket' ? 'ese' : tip;
			let sent = new MQSent({ from: testTable, sahalar: 'muayeneid' }); sent.where.inDizi(idListe, 'muayeneid').degerAta(sablonId, `${eskiTip}sablonid`);
			const mevcutIdSet = asSet((await app.sqlExecSelect(sent)).map(rec => rec.muayeneid)), bostaIdListe = idListe.filter(id => !mevcutIdSet[id]);
			if (!bostaIdListe?.length) { hConfirm(`Seçilen muayeneye(ler)in tümüne ait ${etiket} Test'i zaten var`, sinifAdi); return }
			const mua2HastaId = {}; for (const rec of selectedRecs) { const {id, hastaid} = rec; mua2HastaId[id] = hastaid }
			let rdlg = await ehConfirm(`<b class="bold forestgreen">${bostaIdListe.length}</b> adet <b class="royalblue">${tip.toUpperCase()} Test</b> kaydı açılacak, devam edilsin mi?`, sinifAdi);
			if (!rdlg) { return } let promises = [], {table: muaTable} = this; for (const muayeneId of bostaIdListe) {
				const tarihSaat = now(), tamamlandimi = false; let onayKodu = 0; while (onayKodu < 100000) { onayKodu = asInteger(Math.random() * 1000000) }
				const hastaId = mua2HastaId[muayeneId], testInst = new testSinif({ muayeneId, hastaId, sablonId, tarihSaat, tamamlandimi, onayKodu });
				promises.push(testInst.yaz().then(() =>
					app.sqlExecNone(new MQIliskiliUpdate({
						from: muaTable, where: { degerAta: muayeneId, saha: 'id' }, set: { degerAta: testInst.id, saha: `${tip}${seq}testid` } }))))
			}
			await Promise.all(promises); gridPart.tazele(); /*testSinif.listeEkraniAc(e);*/
			setTimeout(e => {
				let {wnd} = displayMessage((
					`<p><b class="bold forestgreen">${bostaIdListe.length}</b> adet <b class="royalblue">${tip.toUpperCase()} Test</b> kaydı açıldı</p>` +
					`<div>Test ekranına gitmek için <a id="testEkraniAc" class="bold" href="#">buraya tıklayınız</a></div>`), sinifAdi);
				wnd.find('#testEkraniAc').on('click', evt => {
					$(evt.currentTarget).parents('.jqx-window').jqxWindow('close'); this.testEkraniAcIstendi({ ...e, id: `${tip}TestEkraniAc` }) })
			}, 200, e)
		}
		catch (ex) { hConfirm(getErrorText(ex), sinifAdi); throw ex }
	}
	static async testEkraniAcIstendi(e) {
		const {sinifAdi} = this, {tip, seq} = e, testSinif = MQTest.getClass(tip); if (!testSinif) { hConfirm('Uygun Test Sınıfı belirlenemedi', sinifAdi); return }
		const gridPart = e.gridPart ?? e.parentPart ?? e.sender; let {selectedRecs} = gridPart; if (!selectedRecs?.length) { hConfirm('Kayıtlar seçilmelidir', sinifAdi); return }
		selectedRecs = selectedRecs.filter(rec => !!rec[`b${tip}${seq}yapilacak`]); let idListe = selectedRecs?.map(rec => rec[`${tip}${seq}testid`]);
		return testSinif.listeEkraniAc({
			secimlerDuzenle: idListe?.length
				? ({ secimler: sec }) => {
					const birKismimi = true; $.extend(sec.instKod, { birKismimi, kodListe: idListe })
					sec.tarih.temizle()
				}
				: undefined
		})
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
