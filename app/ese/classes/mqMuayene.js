class MQMuayene extends MQGuidOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Muayene' } static get adiSaha() { return 'fisnox' }
	static get kodListeTipi() { return 'MUAYENE' } static get table() { return 'esemuayene' } static get tableAlias() { return 'mua' }
	static get ignoreBelirtecSet() { return {...super.ignoreBelirtecSet, ...asSet(['hastaid', 'doktorid']) } }
	get fisNox() { return [this.seri || '', this.fisNo?.toString()].join('') }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e; $.extend(pTanim, {
			hastaId: new PInstGuid('hastaid'), ts: new PInstDateTimeNow('tarihsaat'), seri: new PInstStr('seri'), fisNo: new PInstNum('fisno'),
			doktorId: new PInstGuid('doktorid'), testSifre: new PInstStr('testsifre'), tani: new PInstStr('tani')
		})
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e); let {liste} = e;
		liste.push({ id: 'testIslemleri', text: 'TEST', handler: _e => this.testIslemleriIstendi({ ...e, ..._e }) } )
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const {secimler: sec} = e; sec.grupTopluEkle([ { kod: 'teknik', aciklama: 'Teknik Bilgiler', kapali: true, zeminRenk: 'darkgray' } ]);
		sec.secimTopluEkle({
			tamamlandiDurumu: new SecimTekSecim({ etiket: 'Tamamlanma Durumu', tekSecim: new BuDigerVeHepsi([`<span class="forestgreen">Tamamlananlar</span>`, `<span class="darkred">TamamlanMAyanlar</span>`]) }),
			tarih: new SecimDate({ etiket: 'Tarih/Saat', basi: today().addDays(-7) }), hastaAdi: new SecimOzellik({ etiket: 'Hasta İsim' }), doktorIsim: new SecimOzellik({ etiket: 'Doktor İsim' }),
			hastaId: new SecimBasSon({ etiket: 'Hasta', mfSinif: MQHasta, grupKod: 'teknik' })
		}).whereBlockEkle(({ secimler: sec, where: wh }) => {
			const {tableAlias: alias, sablonTip: tip} = this
			wh.basiSonu({ basi: sec.tarih.basi, sonu: sec.tarih.sonu?.yarin().clone().clearTime() }, `${alias}.tarihsaat`);
			wh.ozellik(sec.hastaAdi, 'has.aciklama').ozellik(sec.doktorAdi, 'dok.aciklama').basiSonu(sec.hastaId, `${alias}.hastaid`)
		})
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {tableAlias: alias} = this;
		const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'hastaid', text: 'Hasta ID', genislikCh: 40 }), new GridKolon({ belirtec: 'hastaadi', text: 'Hasta Adı', genislikCh: 30, sql: 'has.aciklama' }),
			new GridKolon({ belirtec: 'doktorid', text: 'Doktor ID', genislikCh: 40 }), new GridKolon({ belirtec: 'doktoradi', text: 'Doktor Adı', genislikCh: 30, sql: 'dok.aciklama' }),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 10, sql: `${alias}.tarihsaat` }).tipDate(),
			new GridKolon({ belirtec: 'dogumtarihi', text: 'Doğum Tarihi', genislikCh: 13, sql: 'has.dogumtarihi' }).tipDate(),
			new GridKolon({ belirtec: 'cinsiyettext', text: 'Cinsiyet', genislikCh: 8, sql: Cinsiyet.getClause('has.cinsiyet') }),
			new GridKolon({ belirtec: 'saat', text: 'Saat', genislikCh: 9, sql: `${alias}.tarihsaat` }).tipTime(),
			new GridKolon({ belirtec: 'seri', text: 'Seri', genislikCh: 5, filterType: 'checkedlist' }), new GridKolon({ belirtec: 'fisno', text: 'No', genislikCh: 15, filterType: 'checkedlist' }).tipNumerik(),
			new GridKolon({ belirtec: 'tani', text: 'Tanı', genislikCh: 50 })
		);
		for (const {prefix, kisaEtiket, sablonId} of app.params.ese.getIter()) {
			liste.push(new GridKolon({ belirtec: `b${prefix}yapildi`, text: `${kisaEtiket}?`, genislikCh: 10, filterType: 'checkedlist', sql: `tst.b${prefix}yapildi` }).tipBool()) }
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {stm, sent} = e, {tableAlias: alias, adiSaha} = this;
		sent.leftJoin({ alias, from: 'esehasta has', on: `${alias}.hastaid = has.id` })
			.leftJoin({ alias, from: 'esedoktor dok', on: `${alias}.doktorid = dok.id` })
			.leftJoin({ alias, from: 'esetest tst', on: `${alias}.id = tst.muayeneid` });
		sent.sahalar.add(`${alias}.${adiSaha}`, `${alias}.hastaid`, 'has.aciklama hastaadi', 'has.cinsiyet', 'tst.id testid');
		stm.orderBy.add(`${alias}.tarihsaat DESC`, 'has.aciklama')
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(2);
			form.addDateInput('tarih', 'Tarih'); form.addTimeInput('saat', 'Saat');
			form.addTextInput('seri', 'Seri').setMaxLength(3).addStyle_wh(70).addCSS('center'); form.addNumberInput('fisNo', 'No').setMaxLength(17).addStyle_wh(200);
		form = tabPage_genel.addFormWithParent().yanYana(); form.addModelKullan('hastaId', 'Hasta').comboBox().kodsuz().autoBind().setMFSinif(MQHasta); 
			form.addModelKullan('doktorId', 'Doktor').comboBox().kodsuz().autoBind().setMFSinif(MQDoktor);
		form = tabPage_genel.addFormWithParent().altAlta(); form.addTextArea('tani', 'Tanı').setMaxLength(3000).setRows(8)
	}
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); const {hv} = e; $.extend(hv, { resimsayisi: this.resimSayisi }) }
	kopyaIcinDuzenle(e) { super.kopyaIcinDuzenle(e); $.extend(this, { ts: now() }) }
	async yeniSonrasiIslemler(e) {
		await super.yeniSonrasiIslemler(e); let {id} = this, {tableAlias: alias} = this.class;
		let silent = true, gridPart = app.activeWndPart?.parentPart, recs = [ { id }], _e = { ...e, silent, gridPart, recs };
		setTimeout(async () => {
			_e.recs = await this.class.loadServerData({ ozelQueryDuzenle: ({ sent }) => sent.where.degerAta(id, `${alias}.id`) });
			await this.class.testOlusturIstendi(_e); let {testIdListe} = _e, testId = testIdListe?.[0];
			let {recs} = _e; recs.forEach(rec => rec.testid = testId);
			let veriYuklenince = 
			await this.class.testEkraniAcIstendi({
				..._e, veriYuklenince: __e => {
					let {gridPart} = __e; delete gridPart.veriYukleninceBlock;
					MQTest.testIslemleriIstendi({ ..._e, ...__e, forcedRecs: gridPart.boundRecs })
				}
			})
		}, 50)
	}
	async silmeOncesiIslemler(e) {
		await super.silmeOncesiIslemler(e); let {id} = this; if (id) {
			let {table: from} = MQTest, where = { degerAta: id, saha: 'muayeneid' }
			let upd = new MQIliskiliUpdate({ from, where, set: `muayeneid = NULL` }); await app.sqlExecNone(upd)
		}
	}
	static async testIslemleriIstendi(e) {
		e = e ?? {}; let title = 'Test İşlemleri', {recs} = e;
		let gridPart = e.gridPart ?? e.parentPart ?? e.sender ?? {};
		app.activeWndPart.openContextMenu({
			gridPart, title,
			argsDuzenle: _e => $.extend(_e.wndArgs, { width: 500, height: 150 }),
			formDuzenleyici: async _e => {
				delete _e.recs; const {form, close, gridPart} = _e, recs = e.recs ?? gridPart.selectedRecs;
				let idListe = recs.map(rec => rec.id); form.yanYana().addStyle(e => `$elementCSS { padding-top: 20px }`);
				let sent = new MQSent({ from: 'esetest', sahalar: 'muayeneid', where: { inDizi: idListe, saha: 'muayeneid' } });
				const mevcutIdSet = asSet((await app.sqlExecSelect(sent)).map(rec => rec.muayeneid)), bostaIdListe = idListe.filter(id => !mevcutIdSet[id]);
				let altForm = form.addFormWithParent('test').yanYana(2); /*altForm.addForm().setLayout(e =>
					$(`<h5 class="bold center royalblue" style="padding-bottom: 13px; margin-right: 10px; border-bottom: 1px solid royalblue">${etiket || ''}</h5>`));*/
				let handler = __e => {
					const {id} = __e.builder, parts = id.split('_'), [selector] = parts;
					close(); this[`${selector}Istendi`]({ ...e, ..._e, ...__e, id })
				};
				altForm.addButton('testOlustur', 'Test Kayıt').onClick(handler).setVisibleKosulu(bostaIdListe?.length ? true : 'basic-hidden');
				altForm.addButton('testEkraniAc', 'Test Liste Aç').onClick(handler)
			}
		})
	}
	static async testOlusturIstendi(e) {
		let {sinifAdi} = this, {silent} = e, gridPart = e.gridPart ?? e.parentPart ?? e.sender, recs = e.recs ?? gridPart?.selectedRecs;
		let idListe = recs?.map(rec => rec.id); if (!idListe?.length) { hConfirm('Kayıtlar seçilmelidir', sinifAdi); return }
		try {
			let sent = new MQSent({ from: 'esetest', sahalar: 'muayeneid', where: { inDizi: idListe, saha: 'muayeneid' } });
			let mevcutIdSet = asSet((await app.sqlExecSelect(sent)).map(rec => rec.muayeneid)), bostaIdListe = idListe.filter(id => !mevcutIdSet[id]);
			if (!bostaIdListe?.length) { if (!silent) { hConfirm(`Seçilen muayeneye(ler)in tümüne ait ${etiket} Test'i zaten var`, sinifAdi) } return }
			let mua2HastaRec = {}; for (const rec of recs) {
				let {id, hastaid: hastaId, cinsiyet} = rec, dogumTarihi = asDate(rec.dogumtarihi); if (isInvalidDate(dogumTarihi)) { dogumTarihi = null }
				mua2HastaRec[id] = { id: hastaId, cinsiyet, dogumTarihi }
			}
			let rdlg = silent ? true : await ehConfirm(`<b class="bold forestgreen">${bostaIdListe.length}</b> adet <b class="royalblue">Test</b> kaydı açılacak, devam edilsin mi?`, sinifAdi);
			if (!rdlg) { return } let testIdListe = e.testIdListe = [];
			for (let muayeneId of bostaIdListe) {
				let ts = now(), tamamlandimi = false, onayKodu = 0; while (onayKodu < 100000) { onayKodu = asInteger(Math.random() * 1000000) }
				let {id: hastaId, cinsiyet, dogumTarihi} = mua2HastaRec[muayeneId]; let aktifYas = dogumTarihi ? new Date(now() - dogumTarihi).yil - new Date(0).yil : 0;
				let id = newGUID(), testInst = new MQTest({ id, muayeneId, hastaId, ts, tamamlandimi, cinsiyet, onayKodu, aktifYas });
				await testInst.yaz(); testIdListe.push(testInst.id)
				/*promises.push(testInst.yaz().then(() =>
					app.sqlExecNone(new MQIliskiliUpdate({
						from: 'esemuayene', where: { degerAta: muayeneId, saha: 'id' }, set: { degerAta: testInst.id, saha: 'testid' } }))))*/
			}
			if (silent) {
				gridPart?.tazeleDefer() }
			else {
				gridPart?.tazele(); /*testSinif.listeEkraniAc(e);*/
				setTimeout(e => {
					let {wnd} = displayMessage((
						`<p><b class="bold forestgreen">${bostaIdListe.length}</b> adet <b class="royalblue">Test</b> kaydı açıldı</p>` +
						`<div>Test ekranına gitmek için <a id="testEkraniAc" class="bold" href="#">buraya tıklayınız</a></div>`), sinifAdi);
					wnd.find('#testEkraniAc').on('click', evt => {
						$(evt.currentTarget).parents('.jqx-window').jqxWindow('close'); this.testEkraniAcIstendi({ ...e, id: 'testEkraniAc' }) })
				}, 200, e)
			}
		}
		catch (ex) { hConfirm(getErrorText(ex), sinifAdi); throw ex }
	}
	static async testEkraniAcIstendi(e) {
		let {sinifAdi} = this, {silent, acilinca, veriYuklenince} = e;
		let gridPart = e.gridPart ?? e.parentPart ?? e.sender, recs = e.recs ?? gridPart?.selectedRecs;
		let idListe = recs?.map(rec => rec.id); if (!idListe?.length) { if (!silent) { hConfirm('Kayıtlar seçilmelidir', sinifAdi) } return }
		return MQTest.listeEkraniAc({
			acilinca, veriYuklenince,
			secimlerDuzenle: idListe?.length
				? ({ secimler: sec }) => { const birKismimi = true; $.extend(sec.muayeneId, { birKismimi, kodListe: idListe }); sec.tarih.temizle() }
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
