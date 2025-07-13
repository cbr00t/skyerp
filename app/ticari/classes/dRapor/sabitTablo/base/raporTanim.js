class SBTablo extends MQDetayliGUIDVeAdi {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sabitTablomu() { return true }
	static get kodListeTipi() { return 'SBTABLO' } static get sinifAdi() { return 'Sabit Tablo' }
	static get table() { return 'sbtablo' } static get tableAlias() { return 'fis' }
	static get detaySinif() { return SBTabloDetay } static get gridKontrolcuSinif() { return SBTabloGridci }
	static get kolonFiltreKullanilirmi() { return false } static get raporKullanilirmi() { return false }
	static get tumKolonlarGosterilirmi() { return true } static get gridHeight_bosluk() { return 90 }
	static pTanimDuzenle({ pTanim }) {
		$.extend(pTanim, { devreDisimi: new PInstBitBool('bdevredisi') })
	}
	static secimlerDuzenle({ secimler: sec }) {
		let {tableAlias: alias} = this;
		sec.grupTopluEkle([ { kod: 'genel', etiket: 'Genel', kapali: false } ]);
		sec
			.secimTopluEkle({
				aktifSecim: new SecimTekSecim({ etiket: 'Aktiflik', tekSecim: new AktifVeDevreDisi().bu() })
			})
		sec.whereBlockEkle(({ secimler: sec, where: wh }) => {
			let {tekSecim: aktifSecim} = sec.aktifSecim;
			wh.birlestir(aktifSecim.getTersBoolBitClause(`${alias}.bdevredisi`))
		})
	}
	static ekCSSDuzenle({ rec, result }) {
		super.ekCSSDuzenle(...arguments);
		if (asBool(rec.bdevredisi)) { result.push('bg-lightgray', 'iptal', 'firebrick') }
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments);
		liste.push(new GridKolon({ belirtec: 'bdevredisi', text: 'Devre Dışı?', genislikCh: 13 }).tipBool())
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); let {kaForm} = e;
		/*this.formBuilder_addTabPanelWithGenelTab(e); let {tabPage_genel: tabPage} = e;
		let form = tabPage.addFormWithParent().yanYana();*/
		kaForm.yanYana(); kaForm.builders = kaForm.builders.filter(fbd => fbd.id != 'kod');
		kaForm.id2Builder.aciklama.addStyle_wh(400);
		kaForm.addCheckBox('devreDisimi', 'Devre Dışı?').addStyle(
			`$elementCSS { margin-left: 10px } $elementCSS > label { color: firebrick !important }
			 $elementCSS > input:checked + label { font-style: bold !important }`
		);
		kaForm.addButton('yeni', '').addStyle_wh(40, 50)
			.addStyle(`$elementCSS { margin: 20px 0 0 50px }`)
			.onClick(_e => e.fbd_grid.part.kontrolcu.yeniIstendi({ ...e, ..._e }))
	}
	static rootFormBuilderDuzenle_grid(e) {
		super.rootFormBuilderDuzenle_grid(e); let {fbd_grid} = e;
		fbd_grid.readOnly()
	}
	async yukleSonrasiIslemler() {
		await super.yukleSonrasiIslemler(...arguments); let {detaylar} = this;
		let id2Det = Object.fromEntries(detaylar.map(det => [det.okunanHarSayac, det]));
		let sent = new MQSent(), {where: wh, sahalar} = sent;
		sent.fromAdd('sbtablodetayjson sec');
		wh.inDizi(Object.keys(id2Det), 'sec.harid'); sahalar.add('sec.harid', 'sec.xdata');
		let orderBy = ['harid', 'seq'], stm = new MQStm({ sent, orderBy });
		let id2Data = {}; for (let {harid: harID, xdata: data} of await app.sqlExecSelect(stm)) {
			(id2Data[harID] = id2Data[harID] ?? []).push(data) }
		for (let [harID, data] of Object.entries(id2Data)) {
			if (!data?.length) { continue }
			let det = id2Det[harID]; if (!det) { continue }
			data = JSON.parse(Base64.decode($.isArray(data) ? data.join('') : data));
			let {secimler} = det; for (let [key, _secim] of Object.entries(data)) {
				let secim = secimler?.[key];
				if (secim) { $.extend(secim, _secim) }
			}
		}
	}
	async kaydetSonrasiIslemler({ trnId }) {
		await super.kaydetSonrasiIslemler(...arguments); let yDetaylar = [...this.detaylar];
		await this.detaylariYukle(...arguments);    /* detayların 'okunanHarSayac' bilgilerine ihtiyaç var, yazma sonrası detaylara atanmaz */
		this.detaylar.forEach((det, i) =>
			yDetaylar[i].okunanHarSayac = det.okunanHarSayac);
		let harIDSet = {}, hvListe = [];
		for (let {okunanHarSayac: harid, secimler} of yDetaylar) {
			let data = secimler?.asObject; if ($.isEmptyObject(data)) { continue }
			data = Base64.encode(toJSONStr(data));
			harIDSet[harid] = true;
			arrayIterChunks(data, 50).forEach((xdata, seq) =>
				hvListe.push({ harid, seq, xdata }))
		}
		let from = 'sbtablodetayjson', harIDListe = Object.keys(harIDSet);
		let query = new MQToplu([
			new MQIliskiliDelete({ from, where: { inDizi: harIDListe, saha: 'harid' } }),
			new MQInsert({ from, hvListe })
		]);
		await app.sqlExecNone({ trnId, query })
	}
	hostVarsDuzenle({ hv }) { super.hostVarsDuzenle(...arguments) }
	setValues({ rec }) { super.setValues(...arguments) }
	static getRaporKod(e) {
		e = e ?? {}; let kod = typeof e == 'object' ? 
			(e.raporKod ?? e.raporkod ?? e.raporTip ?? e.raportip ?? e.kod ?? e.tip ??
			e.rapor?.kod ?? e.class?.raporClass?.kod ?? e.rapor?.class?.kod ?? e.class?.kod) : e;
		return kod || null
	}
	static async getDefault(e) {
		let {yerel} = app.params, tip2SonDRaporRec = yerel.tip2SonDRaporRec || {}, {rapor} = e, raporKod = this.getRaporKod(rapor);
		let id = raporKod ? tip2SonDRaporRec[raporKod] : null, inst = new this({ rapor, id });
		if (id) { await inst.yukle(e) }
		return inst
	}
	setDefault(e) {
		let {yerel} = app.params, tip2SonDRaporRec = yerel.tip2SonDRaporRec = yerel.tip2SonDRaporRec || {};
		let raporKod = this.class.getRaporKod(e.rapor), id = raporKod ? this.id : null;
		if (id) { tip2SonDRaporRec[raporKod] = id; yerel.kaydetDefer(e) }
		return this
	}
}
class SBTabloDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'sbtablodetay' }
	static get fisSayacSaha() { return 'fisid' } static get sayacSaha() { return 'id' }
	get satirListe() { let {satirListeStr: result} = this; return result?.length ? result.split(',').filter(x => !!x).map(x => asInteger(x.trim()) - 1) : [] }
	set satirListe(value) { this.satirListeStr = value?.length ? value.filter(x => x != null).map(x => x + 1).sort().join(', ') : '' }
	get secimler() {
		let {hesapTipi, shVeriTipi, tip2Secimler} = this;
		let tip = hesapTipi?.hizmetmi ? 'H' : shVeriTipi?.char;
		return tip2Secimler[tip]
	}
	get asFormul() {
		let {hesapTipi} = this;
		if (hesapTipi.detaylarToplamimi) { return `topla(d => d?.bedel ?? 0, recs)` }
		else if (hesapTipi.satirlarToplamimi) { return `topla(d => d?.bedel ?? 0, this.satirListe.map(i => recs[i]))` }
		else if (hesapTipi.ticariSatismi) { }
		else if (hesapTipi.hizmetmi) { }
		return null
	}
	constructor(e) {
		e = e ?? {}; super(e); let tip2Secimler = this.tip2Secimler = e.tip2Secimler ?? {};
		let tip2SecimMFYapi = {
			S: { sh: DMQStok, grup: DMQStokGrup, anaGrup: DMQStokAnaGrup, istGrup: DMQStokIstGrup },
			H: { sh: DMQHizmet, grup: DMQHizmetGrup, anaGrup: DMQHizmetAnaGrup, istGrup: DMQHizmetIstGrup }
		};
		for (let [tip, yapi] of Object.entries(tip2SecimMFYapi)) {
			let secimler = tip2Secimler[tip]; if (secimler) { continue }
			if ($.isEmptyObject(yapi)) { continue }
			(secimler = tip2Secimler[tip] = new Secimler()).beginUpdate();
			for (let [key, mfSinif] of Object.entries(yapi)) {
				let {kodListeTipi: grupKod, sinifAdi: grupAdi} = mfSinif;
				secimler.grupEkle(grupKod, grupAdi);
				{ let fullKey = `${key}Kod`; secimler.secimEkle(fullKey, new SecimString({ etiket: 'Kod', mfSinif, grupKod })) }
				{ let fullKey = `${key}Adi`; secimler.secimEkle(fullKey, new SecimOzellik({ etiket: 'Adı', grupKod })) }
			}
			secimler.endUpdate()
		}
	}
	static pTanimDuzenle({ pTanim }) {
		$.extend(pTanim, {
			seviyeNo: new PInstTekSecim('seviyeno', SBTabloSeviye), hesapTipi: new PInstTekSecim('hesaptipi', SBTabloHesapTipi),
			satirListeStr: new PInstStr('satirlistestr'), shVeriTipi: new PInstTekSecim('shveritipi', SBTabloVeriTipi),
			shAlmSat: new PInstTekSecim('shalmsat', AlimSatis), shIade: new PInstTekSecim('shiade', NormalIadeVeBirlikte),
			shAyrimTipi: new PInstTekSecim('shayrimtipi', SBTabloAyrimTipi), cssClassesStr: new PInstStr('cssclasses'), cssStyle: new PInstStr('cssstyle'),
			formul: new PInstStr()
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); liste.push(...[
			new GridKolon({ belirtec: 'seviyeno', text:  'Seviye', genislikCh: 15 }).noSql().tipTekSecim({ tekSecimSinif: SBTabloSeviye }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'hesaptipi', text:  'Hesap Tipi', genislikCh: 30 }).noSql().tipTekSecim({ tekSecimSinif: HesapTipi }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shveritipi', text:  'Veri Tipi', genislikCh: 30 }).noSql().tipTekSecim({ tekSecimSinif: SBTabloVeriTipi }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'satirlistestr', text:  'Satır Liste', genislikCh: 20 }).noSql(),
			new GridKolon({ belirtec: 'shalmsat', text:  'S/H Alım-Satış', genislikCh: 15 }).noSql().tipTekSecim({ tekSecimSinif: AlimSatis }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shiade', text:  'S/H İADE', genislikCh: 15 }).noSql().tipTekSecim({ tekSecimSinif: NormalIadeVeBirlikte }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shayrimtipi', text:  'S/H Ayrım', genislikCh: 15 }).noSql().tipTekSecim({ tekSecimSinif: SBTabloAyrimTipi }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'cssclasses', text:  'CSS Sınıfları', genislikCh: 50 }).noSql(),
			new GridKolon({ belirtec: 'cssstyle', text:  'CSS Verisi', genislikCh: 150 }).noSql()
		])
	}
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments);
		let {okunanHarSayac: id} = this;
		id = id || newGUID(); $.extend(hv, { id })
	}
	setValues({ rec }) {
		super.setValues(...arguments)
		/* $.extend(this, { satirListeStr }) */
	}
	eval(e) {
		e = e ?? {}; let {recs} = e;
		let {asFormul: code} = this;
		let s = [undefined, ...recs], satirlar = s;
		if (code && typeof code == 'string') {
			if (!code.includes('return ')) { code = `return ${code}` }
			if (!(code[0] == '(' || code.startsWith('(function('))) { code = `(e => { ${code} })` }
		}
		let block = code; if (typeof block == 'string') { block = eval(code) }
		return block?.call(this, e)
	}
}
class SBTabloGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	gridArgsDuzenle({ args }) {
		super.gridArgsDuzenle(...arguments);
		$.extend(args, { selectionMode: 'checkbox', groupable: false, sortable: false, filterable: false })
	}
	ekCSSDuzenle({ belirtec, rec, result }) {
		if (rec.seviyeNo.seviye1mi) { result.push('bold fs-130') }
		else if (rec.seviyeNo.seviye2mi) { result.push('bold fs-110 i-pl-10') }
		else { result.push('i-pl-20') }
		return result.join(' ')
	}
	tabloKolonlariDuzenle_ilk(e) {
		super.tabloKolonlariDuzenle_ilk(e); let {tabloKolonlari: liste} = e;
		let cellClassName = (sender, rowIndex, belirtec, value, rec) => {
			let _e = { sender, rowIndex, belirtec, value, rec, result: [] }; this.ekCSSDuzenle(_e);
			return _e.result
		};
		liste.push(...[
			new GridKolon({ belirtec: 'degistir', text: ' ', genislikCh: 8 }).tipButton('D').onClick(_e => this.degistirIstendi({ ...e, ..._e })),
			new GridKolon({ belirtec: 'sil', text: ' ', genislikCh: 8 }).tipButton('X').onClick(_e => this.silIstendi({ ...e, ..._e })),
			new GridKolon({ belirtec: 'seviyeNo', text: 'Seviye', genislikCh: 10, cellClassName }).tipTekSecim({ tekSecimSinif: SBTabloSeviye }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'hesapTipi', text: 'Hesap Tipi', genislikCh: 30, cellClassName }).tipTekSecim({ tekSecimSinif: SBTabloHesapTipi }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shVeriTipi', text: 'Veri Tipi', genislikCh: 30, cellClassName }).tipTekSecim({ tekSecimSinif: SBTabloVeriTipi }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'satirListeStr', text: 'Satır Liste', genislikCh: 20, cellClassName }),
			new GridKolon({ belirtec: 'shAlmSat', text: 'S/H Alım-Satış', genislikCh: 15, cellClassName }).tipTekSecim({ tekSecimSinif: AlimSatis }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shIade', text: 'S/H İADE', genislikCh: 15, cellClassName }).tipTekSecim({ tekSecimSinif: NormalIadeVeBirlikte }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shAyrimTipi', text: 'S/H Ayrım', genislikCh: 15, cellClassName }).tipTekSecim({ tekSecimSinif: SBTabloAyrimTipi }).kodsuz().listedenSecilemez(),
			/*new GridKolon({ belirtec: '_secimler', text:  ' ', genislikCh: 20 }).tipButton('Seçimler')
				.onClick(({ gridRec }) => {
					let {secimler} = gridRec, {activeWndPart: parentPart} = app;
					let part = secimler.duzenlemeEkraniAc({ parentPart: '', tamamIslemi: e => {} });
					$.extend(part, { parentPart });
					Object.defineProperty(part, 'canDestroy', { get: () => true })
				}),*/
			new GridKolon({ belirtec: 'cssClassesStr', text:  'CSS Sınıfları', genislikCh: 50 }),
			new GridKolon({ belirtec: 'cssStyle', text:  'CSS Verisi', genislikCh: 150 })
		])
	}
	getRootFormBuilder(e) {
		let {islem, sender: gridPart, gridRec: eskiDetay} = e, {gridWidget} = gridPart;
		let {fis} = this, {class: fisSinif} = fis;
		e.gridWidget = e.gridWidget ?? gridWidget;
		let detay = islem == 'yeni' || islem == 'kopya' ? new fisSinif.detaySinif() : eskiDetay.deepCopy();
		for (let key of ['uid', 'uniqueid', '_rowNumber', 'boundindex', 'visibleindex']) { delete detay[key] };
		let islemAdi = `${islem[0].toUpperCase()}${islem.slice(1)}`, title = e.title = islemAdi;
		let rfb = new RootFormBuilder().asWindow(title).setInst(detay).setParentPart(gridPart).addStyle_fullWH();
		rfb.onAfterRun(({ builder: rfb }) => {
			let {part} = rfb;
			part.kapaninca(() => {
				// if (!rfb._closeTriggered) { gridPart.tazele() }
				gridWidget.beginupdate(); gridWidget.endupdate();
				rfb._closeTriggered = true
			})
		});
		let close = e.close = _e => {
			let {wnd} = e, {tazele} = _e ?? {}; rfb._closeTriggered = true;
			// if (tazele) { gridPart.tazele() }
			if (wnd?.length) { wnd.jqxWindow('close') } else { rfb.part?.close() }
		};
		rfb.addIslemTuslari('islemTuslari').setTip('tamamVazgec').setId2Handler({
			tamam: async _e => { if (await this.tanimKaydet({ ..._e, ...e, detay, eskiDetay }) !== false) { close({ ..._e, ...e }) } },
			vazgec: _e => close({ ..._e, ...e, tazele: true })
		}).addStyle_fullWH(null, 'var(--islemTuslari-height)');
		let fbd_content = rfb.addFormWithParent('content').altAlta()
			.addStyle_fullWH(null, 'calc(var(--full) - (var(--islemTuslari-height) + 15px))')
			.addStyle(`
				$elementCSS { overflow-y: auto !important }
				$elementCSS > div:last-child { margin-bottom: 50px !important }
				$elementCSS .secimler.part > .header  { position: relative !important }
			`)
			.onAfterRun(({ builder: fbd }) => makeScrollable(fbd.layout));
		let fbd_altForm, updateAltForm = () => {
			for (let fbd of fbd_altForm) { fbd.updateVisible() }
		};
		
		let form = fbd_content.addFormWithParent().yanYana(3);
		form.addModelKullan('seviyeNo', 'Seviye')
			.dropDown().noMF().autoBind().kodsuz().bosKodAlinmaz().listedenSecilmez()
			.setSource(SBTabloSeviye.kaListe).onAfterRun(({ builder: fbd }) => fbd.input.focus());
		form.addModelKullan('hesapTipi', 'Hesap Tipi')
			.dropDown().noMF().autoBind().kodsuz().bosKodAlinmaz().listedenSecilmez()
			.setSource(SBTabloHesapTipi.kaListe).degisince(() => updateAltForm());
		form = fbd_content.addFormWithParent().yanYana(2);
		form.addTextInput('cssClassesStr', 'CSS Sınıfları').setPlaceHolder(`boşluk ( ) ile ayırınız`)
			.addCSS('bold').addStyle(`$elementCSS > :not(label) { font-size: 95%; color: blue }`)
			.onAfterRun(({ builder: fbd }) => fbd.input.attr('placeholder', fbd.placeHolder));
		form.addTextArea('cssStyle', 'CSS Style').setRows(4).setCols(100)
			.addCSS('bold').addStyle(`$elementCSS > :not(label) { font-size: 75%; color: green }`)
			.onAfterRun(({ builder: fbd }) => fbd.input.attr('placeholder', fbd.placeHolder));
		
		fbd_altForm = fbd_content.addFormWithParent('altForm').altAlta().addStyle_fullWH(null, 'calc(var(--full) - 80px)');
		
		form = fbd_altForm.addFormWithParent('altForm_detaylarToplami').altAlta()
			.setVisibleKosulu(({ builder: fbd }) => fbd.altInst.hesapTipi.detaylarToplamimi);
		form.addForm().setLayout(() => $(`<div>Alt Seviyeler Toplanır</div>`)).autoAppend();
		
		form = fbd_altForm.addFormWithParent('altForm_satirlarToplami').altAlta()
			.setVisibleKosulu(({ builder: fbd }) => fbd.altInst.hesapTipi.satirlarToplamimi);
		let altForm = form.addFormWithParent().yanYana();
		altForm.addTextInput('satirListeStr', 'Satır Liste').setPlaceHolder(`virgül (,) ile ayırınız`)
			.readOnly().addStyle_wh(250).addCSS('center')
			.onAfterRun(({ builder: fbd }) => fbd.input.attr('placeholder', fbd.placeHolder));
		altForm.addForm()
			.setLayout(() => $(`<div class="bold orangered">Satırları işaretleyiniz</div>`)).autoAppend()
			.addStyle(`$elementCSS { margin-top: 30px }`);
		form.addGridliGosterici(newGUID()).addStyle_fullWH()
			.widgetArgsDuzenleIslemi(_e => this.gridArgsDuzenle(_e))
			.setTabloKolonlari(_e => {
				let attrSet = asSet(['seviyeNo', 'hesaptipi', 'shVeriTipi', 'shAlmSat', 'shIade', 'shAyrimTipi']);
				return this.tabloKolonlari.filter(({ belirtec }) => attrSet[belirtec])
			})
			.setSource(_e => {
				let {gridWidget} = this, recs = gridWidget.getboundrows(), buRec = e?.args?.row?.bounddata;
				return recs.filter(rec => rec != buRec).map(rec => rec.deepCopy?.() ?? $.extend(true, {}, rec))
			})
			.veriYukleninceIslemi(({ builder: fbd }) => {
				let {part: gridPart, altInst: inst} = fbd, {grid, gridWidget} = gridPart, {satirListe} = inst;
				let {_rowXHandler: handler} = fbd;
				if (handler) { grid.off('rowselect', handler); grid.off('rowunselect', handler) }
				try {
					gridWidget.clearselection();
					if (satirListe) {
						for (let index of satirListe) {
							gridWidget.selectrow(index) }
					}
				}
				catch (ex) { }
				handler = fbd._rowXHandler = ({ args }) => {
					let {selectedRowIndexes: rowIndexes} = gridPart;
					inst.satirListe = rowIndexes
				};
				grid.on('rowselect', handler); grid.on('rowunselect', handler)
			});
		
		form = fbd_altForm.addFormWithParent('altForm_ticariSatis').altAlta()
			.setVisibleKosulu(({ builder: fbd }) => fbd.altInst.hesapTipi.ticariSatismi);
		altForm = form.addFormWithParent().yanYana(2)
		altForm.addModelKullan('shVeriTipi', 'Veri Tipi')
			.dropDown().noMF().autoBind().kodsuz().bosKodAlinmaz().listedenSecilmez()
			.setSource(SBTabloVeriTipi.kaListe)
			.degisince(() => updateAltForm());
		altForm.addModelKullan('shAlmSat', 'Alım/Satış Durumu')
			.dropDown().noMF().autoBind().kodsuz().bosKodAlinmaz().listedenSecilmez()
			.setSource(AlimSatis.kaListe);
		altForm.addModelKullan('shIade', 'Normal/İADE Durumu')
			.dropDown().noMF().autoBind().kodsuz().bosKodAlinmaz().listedenSecilmez()
			.setSource(NormalIadeVeBirlikte.kaListe);
		altForm.addModelKullan('shAyrimTipi', 'Ayrım Tipi')
			.dropDown().noMF().autoBind().kodsuz().bosKodAlinmaz().listedenSecilmez()
			.setSource(SBTabloAyrimTipi.kaListe);

		let secimlerGosterimKosulu = (fbd, ekKosul) => {
			let {altInst} = fbd, {hesapTipi, shVeriTipi} = altInst;
			if (ekKosul.call(this, { fbd, altInst, hesapTipi, shVeriTipi }) === false) { return false }
			if (hesapTipi.hizmetmi) { return true }
			if (hesapTipi.ticariSatismi) { return shVeriTipi.stokmu || shVeriTipi.hizmetmi }
			return false
		};
		let initSecimlerForm = (form, id, etiket, height) => {
			return form.addForm(id).setLayout(() => $('<div/>'))
				.setParent(form.layout)
				.addStyle_fullWH(null, height ?? 'auto')
				.addStyle(`$elementCSS { margin: 10px 0 20px 0 }`)
				.onAfterRun(({ builder: fbd }) => {
					let {secimler} = detay; if (secimler) {
						let {part: parentPart} = rfb, {layout: content} = fbd;
						let part = fbd.part = new SecimlerPart({ parentPart, content, secimler });
						part.run()
					}
				})
		};
		let secimlerInitWithKosul = (fbd, ekKosul) => {
			let timerKey = '_timer_secimlerInitWithKosul'; clearTimeout(this[timerKey]);
			this[timerKey] = setTimeout(() => {
				try {
					let {altInst} = rfb, {secimler} = altInst;
					let {builders, id2Builder} = fbd_altForm, {secimler: fbd_secimler} = id2Builder;
					if (fbd_secimler) {
						let {part, layout} = fbd_secimler;
						part?.destroyPart(); layout?.remove();
						let ind = builders.indexOf(fbd_secimler); if (ind > -1) { builders.splice(ind, 1) }
					}
					delete fbd_altForm._id2Builder;
					if (secimler) { initSecimlerForm(fbd_altForm, 'secimler').run() }
				}
				finally { delete this[timerKey] }
			}, 10);
		};
		altForm = form.addFormWithParent('altForm_ticariSatis_stok').altAlta()
			.setVisibleKosulu(({ builder: fbd }) => secimlerInitWithKosul(fbd, ({ shVeriTipi }) => shVeriTipi.stokmu));
		// altForm.addForm().setLayout(() => $(`<div>Stok için seçimler</div>`)).autoAppend();
		// initSecimlerForm(altForm, 'ticSatis_stokSecimler', 'Stok');
		altForm = form.addFormWithParent('ticSatisSecimler_hizmet').altAlta()
			.setVisibleKosulu(({ builder: fbd }) => secimlerInitWithKosul(fbd, ({ shVeriTipi }) => shVeriTipi.hizmetmi));
		// altForm.addForm().setLayout(() => $(`<div>Hizmet için seçimler</div>`)).autoAppend();
		// initSecimlerForm(altForm, 'ticSatisSecimler_hizmet', 'Hizmet');
		
		form = fbd_altForm.addFormWithParent('altForm_hizmet').altAlta()
			.setVisibleKosulu(({ builder: fbd }) => secimlerInitWithKosul(fbd, ({ hesapTipi }) => hesapTipi.hizmetmi));
		// form.addForm().setLayout(() => $(`<div>Hizmet için seçimler</div>`)).autoAppend();
		// initSecimlerForm(form, 'secimler_hizmet', 'Hizmet');

		form = fbd_altForm.addFormWithParent('altForm_formul').altAlta()
			.setVisibleKosulu(({ builder: fbd }) => secimlerInitWithKosul(fbd, ({ hesapTipi }) => hesapTipi.formulmu));
		form.addTextArea('formul', 'Formül').setRows(8).addStyle_fullWH(null, 300)
		
		return rfb
	}
	tanimla(e) {
		e = e ?? {}; let rfb = this.getRootFormBuilder(e);
		/*let {title} = e, wnd = e.wnd = createJQXWindow({
			title, args: {
				isModal: false, closeButtonAction: 'close',
				width: '90%', height: Math.min(600, $(window).height() - 100)
			}
		});
		wnd.on('close', evt => { rfb.destroyPart(); wnd.jqxWindow('destroy'); delete e.wnd });
		rfb.setParent(wnd.find('.jqx-window-content > .subContent'));*/
		rfb/*.asForm()*/.run();
		return rfb
	}
	tanimKaydet({ islem, gridWidget, detay: det, eskiDetay: eDet }) {
		switch (islem) {
			case 'yeni': case 'kopya': { gridWidget.addrow(null, det); break }
			case 'degistir': { gridWidget.updaterow(eDet?.uid, det); break }
			case 'sil': { gridWidget.deleterow(eDet?.uid); break }
		}
	}
	yeniIstendi(e) { return this.tanimla({ ...e, islem: 'yeni' }) }
	degistirIstendi(e) { return this.tanimla({ ...e, islem: 'degistir' }) }
	silIstendi({ sender: gridPart, gridRec: rec }) { gridPart.gridWidget.deleterow(rec.uid) }
}
