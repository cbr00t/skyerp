class MQMuayene extends MQGuidOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Muayene' } static get adiSaha() { return 'fisnox' }
	static get kodListeTipi() { return 'MUAYENE' } static get table() { return 'esemuayene' } static get tableAlias() { return 'mua' }
	static get ignoreBelirtecSet() { return {...super.ignoreBelirtecSet, ...asSet(['hastaid', 'doktorid']) } }
	get fisNox() { return [this.seri || '', this.fisNo?.toString()].join('') }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); let {pTanim} = e; $.extend(pTanim, {
			hastaId: new PInstGuid('hastaid'), ts: new PInstDateTimeNow('tarihsaat'), seri: new PInstStr('seri'), fisNo: new PInstNum('fisno'),
			doktorId: new PInstGuid('doktorid'), testSifre: new PInstStr('testsifre'), tani: new PInstStr('tani')
		})
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e); let {liste} = e
		liste.push(
			{ id: 'testListeAc', text: 'TEST EKRANI', handler: _e => this.testEkraniAcIstendi({ ...e, ..._e }) },
			{ id: 'testYap', text: 'TEST YAP', handler: _e => this.testYapIstendi({ ...e, ..._e }) } 
		)
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); let {secimler: sec} = e; sec.grupTopluEkle([ { kod: 'teknik', aciklama: 'Teknik Bilgiler', kapali: true, zeminRenk: 'darkgray' } ]);
		sec.secimTopluEkle({
			tamamlandiDurumu: new SecimTekSecim({ etiket: 'Tamamlanma Durumu', tekSecim: new BuDigerVeHepsi([`<span class="forestgreen">Tamamlananlar</span>`, `<span class="darkred">TamamlanMAyanlar</span>`]) }),
			tarih: new SecimDate({ etiket: 'Tarih/Saat', basi: today().addDays(-7) }), hastaAdi: new SecimOzellik({ etiket: 'Hasta İsim' }), doktorIsim: new SecimOzellik({ etiket: 'Doktor İsim' }),
			hastaId: new SecimBasSon({ etiket: 'Hasta', mfSinif: MQHasta, grupKod: 'teknik' })
		}).whereBlockEkle(({ secimler: sec, where: wh }) => {
			let {tableAlias: alias, sablonTip: tip} = this
			wh.basiSonu({ basi: sec.tarih.basi, sonu: sec.tarih.sonu?.yarin().clone().clearTime() }, `${alias}.tarihsaat`);
			wh.ozellik(sec.hastaAdi, 'has.aciklama').ozellik(sec.doktorAdi, 'dok.aciklama').basiSonu(sec.hastaId, `${alias}.hastaid`)
		})
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); let {tableAlias: alias} = this;
		let {liste} = e; liste.push(
			new GridKolon({ belirtec: 'hastaid', text: 'Hasta ID', genislikCh: 40 }), new GridKolon({ belirtec: 'hastaadi', text: 'Hasta Adı', genislikCh: 30, sql: 'has.aciklama' }),
			new GridKolon({ belirtec: 'doktorid', text: 'Doktor ID', genislikCh: 40 }), new GridKolon({ belirtec: 'doktoradi', text: 'Doktor Adı', genislikCh: 30, sql: 'dok.aciklama' }),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 10, sql: `${alias}.tarihsaat` }).tipDate(),
			new GridKolon({ belirtec: 'dogumtarihi', text: 'Doğum Tarihi', genislikCh: 13, sql: 'has.dogumtarihi' }).tipDate(),
			new GridKolon({ belirtec: 'cinsiyettext', text: 'Cinsiyet', genislikCh: 8, sql: Cinsiyet.getClause('has.cinsiyet') }),
			new GridKolon({ belirtec: 'saat', text: 'Saat', genislikCh: 9, sql: `${alias}.tarihsaat` }).tipTime(),
			new GridKolon({ belirtec: 'seri', text: 'Seri', genislikCh: 5, filterType: 'checkedlist' }), new GridKolon({ belirtec: 'fisno', text: 'No', genislikCh: 15, filterType: 'checkedlist' }).tipNumerik(),
			new GridKolon({ belirtec: 'tani', text: 'Tanı', genislikCh: 50 })
		);
		for (let {prefix, kisaEtiket, sablonId} of app.params.ese.getIter()) {
			liste.push(new GridKolon({ belirtec: `b${prefix}yapildi`, text: `${kisaEtiket}?`, genislikCh: 10, filterType: 'checkedlist', sql: `tst.b${prefix}yapildi` }).tipBool()) }
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {stm, sent} = e, {tableAlias: alias, adiSaha} = this;
		sent.leftJoin({ alias, from: 'esehasta has', on: `${alias}.hastaid = has.id` })
			.leftJoin({ alias, from: 'esedoktor dok', on: `${alias}.doktorid = dok.id` })
			.leftJoin({ alias, from: 'esetest tst', on: `${alias}.id = tst.muayeneid` });
		sent.sahalar.add(`${alias}.${adiSaha}`, `${alias}.hastaid`, 'has.aciklama hastaadi', 'has.cinsiyet', 'tst.id testid');
		stm.orderBy.add(`${alias}.tarihsaat DESC`, 'has.aciklama')
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e)
		this.formBuilder_addTabPanelWithGenelTab(e); let{tabPage_genel} = e
		let form = tabPage_genel.addFormWithParent().yanYana(2);
			form.addDateInput('tarih', 'Tarih'); form.addTimeInput('saat', 'Saat');
			form.addTextInput('seri', 'Seri').setMaxLength(3).addStyle_wh(70).addCSS('center'); form.addNumberInput('fisNo', 'No').setMaxLength(17).addStyle_wh(200);
		form = tabPage_genel.addFormWithParent().yanYana(); form.addModelKullan('hastaId', 'Hasta').comboBox().kodsuz().autoBind().setMFSinif(MQHasta); 
			form.addModelKullan('doktorId', 'Doktor').comboBox().kodsuz().autoBind().setMFSinif(MQDoktor);
		form = tabPage_genel.addFormWithParent().altAlta(); form.addTextArea('tani', 'Tanı').setMaxLength(3000).setRows(8)
	}
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); let {hv} = e; $.extend(hv, { resimsayisi: this.resimSayisi }) }
	kopyaIcinDuzenle(e) { super.kopyaIcinDuzenle(e); $.extend(this, { ts: now() }) }
	async yeniSonrasiIslemler(e) {
		await super.yeniSonrasiIslemler(e); let {id} = this, {tableAlias: alias} = this.class;
		let silent = true, gridPart = app.activeWndPart?.parentPart, recs = [ { id }], _e = { ...e, silent, gridPart, recs };
		setTimeout(async () => {
			_e.recs = await this.class.loadServerData({
				ozelQueryDuzenle: ({ sent }) => sent.where.degerAta(id, `${alias}.id`)
			})
			await this.class.testOlusturIstendi(_e); let {testIdListe} = _e, testId = testIdListe?.[0]
			_e.recs.forEach(rec => rec.testid = testId)
			await this.class.testEkraniAcIstendi({
				..._e, veriYuklenince: __e => {
					let {gridPart} = __e; delete gridPart.veriYukleninceBlock;
					MQTest.testYapIstendi({ ..._e, ...__e, forcedRecs: gridPart.boundRecs })
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
	/*static async testEkraniAcIstendi(e = {}) {
		let title = e.title = 'Test İşlemleri', gridPart = e.gridPart = e.gridPart ?? e.parentPart ?? e.sender ?? {}
		let recs = e.recs ?? gridPart.selectedRecs, idListe = recs.map(rec => rec.id)
		let sent = new MQSent({ from: 'esetest', sahalar: 'muayeneid', where: { inDizi: idListe, saha: 'muayeneid' } })
		let mevcutIdSet = asSet((await app.sqlExecSelect(sent)).map(rec => rec.muayeneid))
		let bostaIdListe = idListe.filter(id => !mevcutIdSet[id])
		let veriYuklenince = e.veriYuklenince ??= (_e => {
			let {gridPart, gridPart: { boundRecs: recs, gridWidget: w }} = _e
			delete gridPart.veriYukleninceBlock
			if (recs?.length)
				w.selectrow(0)
			gridPart.degistirIstendi()
		})
		if (!bostaIdListe.length)
			return await this.testEkraniAcIstendi({ ...e, veriYuklenince })
		return null
	}*/
	static async testEkraniAcIstendi(e) {
		let {sinifAdi} = this, {silent, acilinca} = e
		let gridPart = e.gridPart ?? e.parentPart ?? e.sender, recs = e.recs ?? gridPart?.selectedRecs
		let idListe = recs?.map(rec => rec.id)
		if (!idListe?.length) {
			if (!silent)
				wConfirm('Kayıtlar seçilmelidir', sinifAdi)
			return
		}
		let veriYuklenince = e.veriYuklenince ??= (_e => {
			let {gridPart, gridPart: { boundRecs: recs, gridWidget: w }} = _e
			delete gridPart.veriYukleninceBlock
			if (recs?.length)
				w.selectrow(0)
			// gridPart.degistirIstendi()
		})
		let secimlerDuzenle = idListe?.length
			? ({ secimler: sec }) => {
				$.extend(sec.muayeneId, { birKismimi: true, kodListe: idListe })
				sec.tarih.temizle()
			}
			: undefined
		return MQTest.listeEkraniAc({ acilinca, veriYuklenince, secimlerDuzenle })
	}
	static async testYapIstendi(e = {}) {
		let title = 'Test İşlemleri', gridPart = e.gridPart ?? e.parentPart ?? e.sender ?? {};
		let recs = e.recs ?? gridPart.selectedRecs, idListe = recs.map(rec => rec.id);
		let sent = new MQSent({ from: 'esetest', sahalar: 'muayeneid', where: { inDizi: idListe, saha: 'muayeneid' } });
		let mevcutIdSet = asSet((await app.sqlExecSelect(sent)).map(rec => rec.muayeneid));
		let bostaIdListe = idListe.filter(id => !mevcutIdSet[id]);
		if (!bostaIdListe.length) {
			return await this.testEkraniAcIstendi({
				...e, veriYuklenince: _e => {
					let {gridPart} = _e; delete gridPart.veriYukleninceBlock;
					MQTest.testIslemleriIstendi({ ...e, ..._e, forcedRecs: gridPart.boundRecs })
				}
			})
		}
		app.activeWndPart.openContextMenu({
			gridPart, title,
			argsDuzenle: _e => $.extend(_e.wndArgs, { width: 500, height: 150 }),
			formDuzenleyici: async _e => {
				delete _e.recs; let {form, close, gridPart} = _e;
				form.yanYana().addStyle(e => `$elementCSS { padding-top: 20px }`);
				let altForm = form.addFormWithParent('test').yanYana(2); /*altForm.addForm().setLayout(e =>
					$(`<h5 class="bold center royalblue" style="padding-bottom: 13px; margin-right: 10px; border-bottom: 1px solid royalblue">${etiket || ''}</h5>`));*/
				let handler = __e => {
					let {id} = __e.builder, parts = id.split('_'), [selector] = parts;
					close(); this[`${selector}Istendi`]({ ...e, ..._e, ...__e, id })
				};
				altForm.addButton('testOlustur', 'Test Kayıt').onClick(handler).setVisibleKosulu(bostaIdListe?.length ? true : 'basic-hidden');
				altForm.addButton('testEkraniAc', 'Test Liste Aç').onClick(handler)
			}
		})
	}
	static async testOlusturIstendi(e) {
		let {sinifAdi} = this, {silent} = e, gridPart = e.gridPart ?? e.parentPart ?? e.sender, recs = e.recs ?? gridPart?.selectedRecs;
		let idListe = recs?.map(rec => rec.id); if (!idListe?.length) { wConfirm('Kayıtlar seçilmelidir', sinifAdi); return }
		try {
			let sent = new MQSent({ from: 'esetest', sahalar: 'muayeneid', where: { inDizi: idListe, saha: 'muayeneid' } });
			let mevcutIdSet = asSet((await app.sqlExecSelect(sent)).map(rec => rec.muayeneid)), bostaIdListe = idListe.filter(id => !mevcutIdSet[id]);
			if (!bostaIdListe?.length) { if (!silent) { wConfirm(`Seçilen muayeneye(ler)in tümüne ait ${etiket} Test'i zaten var`, sinifAdi) } return }
			let mua2HastaRec = {}; for (let rec of recs) {
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
}

/*
static topluXMenuIstendi(e) {
		e = e || {}; let {parentRec} = e, {sabitHatKod} = app, hatKod = e.hatKod = e.hatKod ?? parentRec?.hatKod;
		$.extend(e, { noCheck: true, formDuzenleyici: _e => {
			_e = $.extend({}, e, _e); let {form, close} = _e; form.yanYana(2);
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
