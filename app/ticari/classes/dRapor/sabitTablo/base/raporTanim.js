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
		let buttons = [
			kaForm.addButton('yeni', '').addStyle(`$elementCSS { margin-left: 30px !important }`),
			kaForm.addButton('degistir', ''),
			kaForm.addButton('sil', '')
		];
		for (let fbd of buttons) {
			fbd.addStyle_wh(40, 50).addStyle(`$elementCSS { margin-top: 30px; margin-left: 10px }`);
			fbd.onClick(async _e => {
				let {id} = _e.input[0], selector = `${id}Istendi`;
				let {part: gridPart, kontrolcu} = e.fbd_grid;                 /* doğru burası: '_e' değil 'e' */
				let {selectedRecs: recs, selectedRec: gridRec, selectedRowIndex: rowIndex} = gridPart;
				// if (!gridRec) { return }
				let args = { ...e, ..._e, gridPart, recs, gridRec, rowIndex };
				try { await kontrolcu[selector]?.(args) }
				catch (ex) { hConfirm(getErrorText(ex)); throw ex }
			})
		}
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
		wh.inDizi(Object.keys(id2Det), 'sec.harid'); sahalar.add('sec.harid', 'sec.seq', 'sec.xdata');
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
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments);
		hv.aciklama = hv.aciklama ?? ''
	}
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
		let {hesapTipi, shStokHizmet, tip2Secimler} = this;
		let tip = hesapTipi?.hizmetmi ? 'H' : hesapTipi?.ticarimi ? shStokHizmet?.char : null;
		return tip2Secimler[tip]
	}
	get asFormul() {
		let {hesapTipi} = this;
		if (hesapTipi.altSeviyeToplamimi) {
			return (({ attr, parentRec }) =>
				roundToBedelFra(topla(rec => rec?.[attr] ?? 0, parentRec.detaylar ?? [])))
		}
		else if (hesapTipi.satirlarToplamimi) {
			return (({ det, attr, recs, ind2Rec }) => {
				let {satirListe} = det, topRecs = satirListe.map(ind => ind2Rec[ind]).filter(x => x != null);
				return roundToBedelFra(topla(rec => rec?.[attr] ?? 0, topRecs))
			})
			// return `topla(d => d?.bedel ?? 0, this.satirListe.map(i => recs[i]))`
		}
		else if (hesapTipi.ticarimi) { }
		else if (hesapTipi.hizmetmi) { }
		else if (hesapTipi.formulmu) { return this.formul }
		return null
	}
	get asRaporQuery() {
		let uni = new MQUnionAll(), stm = new MQStm({ sent: uni });
		let e = { stm, uni }; this.raporQueryDuzenle(e);
		stm = e.stm; return stm
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
			aciklama: new PInstStr('aciklama'), tersIslemmi: new PInstBitBool('bnegated'),
			seviyeNo: new PInstTekSecim('seviyeno', SBTabloSeviye), hesapTipi: new PInstTekSecim('hesaptipi', SBTabloHesapTipi),
			veriTipi: new PInstTekSecim('shveritipi', SBTabloVeriTipi), shStokHizmet: new PInstTekSecim('shstokhizmet', SBTabloStokHizmet),
			shAlmSat: new PInstTekSecim('shalmsat', AlimSatis), shIade: new PInstTekSecim('shiade', NormalIadeVeBirlikte),
			shAyrimTipi: new PInstTekSecim('shayrimtipi', SBTabloAyrimTipi),
			formul: new PInstStr('formul'), satirListeStr: new PInstStr('satirlistestr'),
			cssClassesStr: new PInstStr('cssclasses'), cssStyle: new PInstStr('cssstyle')
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); liste.push(...[
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 30 }).noSql(),
			new GridKolon({ belirtec: 'seviyeno', text: 'Seviye', genislikCh: 15 }).noSql().tipTekSecim({ tekSecimSinif: SBTabloSeviye }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'bnegated', text: 'Ters?', genislikCh: 10 }).noSql().tipBool(),
			new GridKolon({ belirtec: 'hesaptipi', text: 'Hesap Tipi', genislikCh: 30 }).noSql().tipTekSecim({ tekSecimSinif: SBTabloHesapTipi }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shveritipi', text: 'Veri Tipi', genislikCh: 30 }).noSql().tipTekSecim({ tekSecimSinif: SBTabloVeriTipi }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shstokhizmet', text: 'Stok/Hizmet', genislikCh: 15 }).noSql().tipTekSecim({ tekSecimSinif: SBTabloStokHizmet }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shalmsat', text: 'S/H Alım-Satış', genislikCh: 15 }).noSql().tipTekSecim({ tekSecimSinif: AlimSatis }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shiade', text: 'S/H İADE', genislikCh: 15 }).noSql().tipTekSecim({ tekSecimSinif: NormalIadeVeBirlikte }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shayrimtipi', text: 'S/H Ayrım', genislikCh: 15 }).noSql().tipTekSecim({ tekSecimSinif: SBTabloAyrimTipi }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'satirlistestr', text: 'Satır Liste', genislikCh: 20 }).noSql(),
			new GridKolon({ belirtec: 'formul', text: 'Özel Formül', genislikCh: 150 }).noSql(),
			new GridKolon({ belirtec: 'cssclasses', text: 'CSS Sınıfları', genislikCh: 50 }).noSql(),
			new GridKolon({ belirtec: 'cssstyle', text: 'CSS Verisi', genislikCh: 150 }).noSql()
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
	raporQueryDuzenle(e) {
		let det = e.det = this, {stm, donemBS, subeKodlari, sentDuzenle} = e;
		let {aciklama, hesapTipi, shStokHizmet, veriTipi} = this;
		let shDurum = {
			stokmu: hesapTipi.ticarimi && (shStokHizmet.birliktemi || shStokHizmet.stokmu),
			hizmetmi:  hesapTipi.hizmetmi || (hesapTipi.ticarimi && (shStokHizmet.birliktemi || shStokHizmet.hizmetmi))
		};
		let ekBilgi = veriTipi.secilen?.ekBilgi ?? {};
		let {sentUygunluk, sentDuzenle: icerikSentDuzenle} = ekBilgi;
		for (let [selector, flag] of Object.entries(shDurum)) {
			let _e = { ...e }; _e[selector] = flag;
			if (sentUygunluk == null || sentUygunluk?.call(this, _e)) { this.raporQueryDuzenle_satis(_e) }
			stm = _e.stm
		}
		let {sent: uni} = stm ?? {};
		if (!uni?.liste?.length) { return this }
		let sahaAlias = 'bedel', _e = { ...e, uni, sahaAlias };
		for (let sent of uni) {
			let {where: wh, sahalar} = sent;
			if (donemBS) { wh.basiSonu(donemBS, 'fis.tarih') }
			if (subeKodlari?.length) { wh.inDizi(subeKodlari, 'fis.bizsubekod') }
			/* sahalar.add(`${aciklama.sqlServerDegeri()} aciklama`); */
			$.extend(_e, { sent, where: wh, sahalar });
			icerikSentDuzenle?.call(this, _e); sentDuzenle?.call(this, _e);
			let {alias2Deger} = sent; if (!alias2Deger[sahaAlias]) { sahalar.add(`0 ${sahaAlias}`) }
			sent.groupByOlustur()
		}
		return this
	}
	raporQueryDuzenle_satis({ stm, uni, hizmetmi }) {
		let {shIade, shAyrimTipi} = this, harTable = hizmetmi ? 'pifhizmet' : 'pifstok';
		let sentOrtakOlustur = () => {
			let sent = new MQSent(), {where: wh, sahalar} = sent;
			sent.fromAdd('piffis fis').innerJoin('fis', `${harTable} har`, 'har.fissayac = fis.kaysayac');
			wh.fisSilindiEkle().add(`fis.piftipi = 'F'`, `fis.almsat = 'T'`, `fis.ayrimtipi <> 'IN'`);
			if (!shIade.birliktemi) { wh.degerAta(shIade.iademi ? 'I' : '', 'fis.iade') }
			if (!shAyrimTipi.birliktemi) { wh.add(`fis.ayrimtipi ${shAyrimTipi.ihracatmi ? '=' : '<>'} 'IH'`) }
			uni.add(sent); return sent
		};
		sentOrtakOlustur();
		return this
	}
	eval(e) {
		e = e ?? {}; let {recs} = e, {asFormul: code} = this;
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
		if (rec.tersIslemmi) { result.push('bg-lightred' )}
		return result.join(' ')
	}
	tabloKolonlariDuzenle_ilk(e) {
		super.tabloKolonlariDuzenle_ilk(e); let {tabloKolonlari: liste} = e;
		let cellClassName = (sender, rowIndex, belirtec, value, rec) => {
			let _e = { sender, rowIndex, belirtec, value, rec, result: [] }; this.ekCSSDuzenle(_e);
			return _e.result
		};
		let cellsRenderer = (colDef, rowIndex, belirtec, value, html, jqxCol, rec, result) => {
			let {hesapTipi, shStokHizmet} = rec ?? {};
			html = result ?? html;
			let clear = () => html = changeTagContent(html, '');
			switch (belirtec) {
				case 'veriTipi':
					if (!(hesapTipi.ticarimi || hesapTipi.hizmetmi)) { clear() } break
				case 'shStokHizmet': case 'shAlmSat':
				case 'shIade': case 'shAyrimTipi':
					if (!hesapTipi.ticarimi) { clear() } break
				case '_secimler': if (!hesapTipi.ticarimi && !shStokHizmet.birliktemi) { clear() } break
				case 'formul':
					if (!hesapTipi.formulmu) { clear() } break
			}
			return html
		};
		liste.push(...[
			/*new GridKolon({ belirtec: 'degistir', text: ' ', genislikCh: 8 }).tipButton('D').onClick(_e => this.degistirIstendi({ ...e, ..._e })),
			new GridKolon({ belirtec: 'sil', text: ' ', genislikCh: 8 }).tipButton('X').onClick(_e => this.silIstendi({ ...e, ..._e })),*/
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 30, cellClassName, cellsRenderer }),
			new GridKolon({ belirtec: 'seviyeNo', text: 'Seviye', genislikCh: 10, cellClassName, cellsRenderer }).tipTekSecim({ tekSecimSinif: SBTabloSeviye }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'tersIslemmi', text: 'Ters?', genislikCh: 10, cellClassName, cellsRenderer }).tipBool(),
			new GridKolon({ belirtec: 'hesapTipi', text: 'Hesap Tipi', genislikCh: 30, cellClassName, cellsRenderer }).tipTekSecim({ tekSecimSinif: SBTabloHesapTipi }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'veriTipi', text: 'Veri Tipi', genislikCh: 30, cellClassName, cellsRenderer }).tipTekSecim({ tekSecimSinif: SBTabloVeriTipi }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shStokHizmet', text: 'Stok/Hizmet', genislikCh: 20, cellClassName, cellsRenderer }).tipTekSecim({ tekSecimSinif: SBTabloStokHizmet }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shAlmSat', text: 'S/H Alım-Satış', genislikCh: 15, cellClassName, cellsRenderer }).tipTekSecim({ tekSecimSinif: AlimSatis }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shIade', text: 'S/H İADE', genislikCh: 15, cellClassName, cellsRenderer }).tipTekSecim({ tekSecimSinif: NormalIadeVeBirlikte }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shAyrimTipi', text: 'S/H Ayrım', genislikCh: 15, cellClassName, cellsRenderer }).tipTekSecim({ tekSecimSinif: SBTabloAyrimTipi }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'satirListeStr', text: 'Satır Liste', genislikCh: 20, cellClassName, cellsRenderer }),
			new GridKolon({ belirtec: 'formul', text: 'Özel Formül', genislikCh: 150, cellClassName, cellsRenderer }),
			new GridKolon({ belirtec: 'cssClassesStr', text: 'CSS Sınıfları', genislikCh: 50, cellClassName, cellsRenderer }),
			new GridKolon({ belirtec: 'cssStyle', text: 'CSS Verisi', genislikCh: 150, cellClassName, cellsRenderer })
			/*new GridKolon({ belirtec: '_secimler', text: ' ', genislikCh: 20, cellClassName, cellsRenderer }).tipButton('Seçimler')
				.onClick(({ gridRec }) => {
					let {secimler} = gridRec, {activeWndPart: parentPart} = app;
					let part = secimler.duzenlemeEkraniAc({ parentPart: '', tamamIslemi: e => {} });
					$.extend(part, { parentPart });
					Object.defineProperty(part, 'canDestroy', { get: () => true })
				})*/
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
			.addStyle_wh(null, 'calc(var(--full) - (var(--islemTuslari-height) + 15px))')
			.addStyle(...[`
				$elementCSS { overflow-y: auto !important }
				$elementCSS > div:last-child { margin-bottom: 50px !important }
				$elementCSS .secimler.part > .header { position: relative !important }
			`])
			.onAfterRun(({ builder: fbd }) => { let {layout} = fbd; makeScrollable(layout) });
		let fbd_altForm, updateAltForm = () => {
			fbd_veriTipi?.updateVisible()?.dataBind();
			for (let fbd of fbd_altForm) { fbd.updateVisible() }
		};
		
		let showCSSFlag = false;
		let form = fbd_content.addFormWithParent().yanYana(2);
		form.addTextInput('aciklama', 'Açıklama').addStyle_wh(400);
		form.addCheckBox('tersIslemmi', 'Ters İşlem?').addStyle(`$elementCSS { margin: -5px 0 0 30px }`);

		form = fbd_content.addFormWithParent().yanYana();
		form.addModelKullan('seviyeNo', 'Seviye')
			.dropDown().noMF().autoBind().kodsuz().bosKodAlinmaz().listedenSecilmez()
			.setSource(SBTabloSeviye.kaListe).onAfterRun(({ builder: fbd }) => fbd.input.focus());
		form.addModelKullan('hesapTipi', 'Hesap Tipi')
			.dropDown().noMF().autoBind().kodsuz().bosKodAlinmaz()
			.setSource(SBTabloHesapTipi.kaListe).degisince(() => updateAltForm());
		let fbd_veriTipi = form.addModelKullan('veriTipi', 'Veri Tipi')
			.dropDown().noMF().autoBind().kodsuz().bosKodAlinmaz()
			.setSource(() => (({ builder: fbd }) => {
				let {altInst: det} = fbd, {hesapTipi} = det;
				return SBTabloVeriTipi.kaListe.filter(({ ekBilgi }) =>
					ekBilgi?.gosterimUygunluk?.call(this, { ...e, det, hesapTipi }))
			}))
			.setVisibleKosulu(({ builder: fbd }) => {
				let {hesapTipi} = fbd.altInst;
				return hesapTipi.ticarimi || hesapTipi.hizmetmi
			});
		form.addButton('css', 'Biçimlendirme').addStyle_wh(150, 50)
			.addStyle(`$elementCSS { margin: 30px 0 0 20px }`)
			.onClick(({ builder: fbd }) => {
				let {parentBuilder} = fbd.parentBuilder; showCSSFlag = !showCSSFlag;
				parentBuilder.layout.toggleClass('expanded');
				for (let _fbd of parentBuilder) { _fbd.updateVisible() }
			});
		
		form = fbd_content.addFormWithParent().altAlta().addStyle(
			`$elementCSS { border: 1px solid #ccc }
			$elementCSS.expanded button#css.jqx-fill-state-normal { color: #eee !important; background-color: royalblue !important }`
		);
		let altForm = form.addFormWithParent().yanYana(2)
			.setVisibleKosulu(({ builder: fbd }) => showCSSFlag);
		altForm.addTextInput('cssClassesStr', 'CSS Sınıfları').setPlaceHolder(`boşluk ( ) ile ayırınız`)
			.addCSS('bold').addStyle(`$elementCSS > :not(label) { font-size: 95%; color: blue }`)
			.onAfterRun(({ builder: fbd }) => fbd.input.attr('placeholder', fbd.placeHolder));
		altForm.addTextArea('cssStyle', 'CSS Style').setRows(4).setCols(100)
			.addCSS('bold').addStyle(`$elementCSS > :not(label) { font-size: 75%; color: green }`)
			.onAfterRun(({ builder: fbd }) => fbd.input.attr('placeholder', fbd.placeHolder));
		
		fbd_altForm = fbd_content.addFormWithParent('altForm').altAlta().addStyle_fullWH(null, 'calc(var(--full) - 80px)');
		
		form = fbd_altForm.addFormWithParent('altForm_detaylarToplami').altAlta()
			.setVisibleKosulu(({ builder: fbd }) => fbd.altInst.hesapTipi.detaylarToplamimi);
		form.addForm().setLayout(() => $(`<h5 class=forestgreen style="padding: 10px">Alt Seviyeler Toplanır</h5>`)).autoAppend();
		
		form = fbd_altForm.addFormWithParent('altForm_ticariSatis').altAlta()
			.setVisibleKosulu(({ builder: fbd }) => fbd.altInst.hesapTipi.ticarimi);
		altForm = form.addFormWithParent().yanYana()
		altForm.addModelKullan('shStokHizmet', 'Stok/Hizmet')
			.dropDown().noMF().autoBind().kodsuz().bosKodAlinmaz().listedenSecilmez()
			.setSource(SBTabloStokHizmet.kaListe)
			.degisince(() => updateAltForm());
		altForm.addModelKullan('shAlmSat', 'Alım/Satış')
			.dropDown().noMF().autoBind().kodsuz().bosKodAlinmaz().listedenSecilmez()
			.setSource(AlimSatis.kaListe);
		altForm.addModelKullan('shIade', 'Normal/İADE')
			.dropDown().noMF().autoBind().kodsuz().bosKodAlinmaz().listedenSecilmez()
			.setSource(NormalIadeVeBirlikte.kaListe);
		altForm.addModelKullan('shAyrimTipi', 'Ayrım Tipi')
			.dropDown().noMF().autoBind().kodsuz().bosKodAlinmaz().listedenSecilmez()
			.setSource(SBTabloAyrimTipi.kaListe);

		let buildSecimlerForm = (form, id, etiket, height) => {
			return form.addForm(id).setLayout(() => $('<div/>')).noAutoAppend()
				.setParent(form.layout)
				.addStyle_fullWH(null, height ?? 'auto')
				.addStyle(`$elementCSS { margin: 10px 0 20px 0 }`)
				.onAfterRun(({ builder: fbd }) => {
					let {layout, parent} = fbd, {secimler} = detay;
					parent.children(`[data-builder-id = altForm_satirlarToplami]`).before(layout);
					if (secimler) {
						let {part: parentPart} = rfb, {layout: content} = fbd;
						let part = fbd.part = new SecimlerPart({ parentPart, content, secimler });
						part.run(); part.seviyeleriAcKapatIstendi({ flag: false })
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
					if (secimler) { buildSecimlerForm(fbd_altForm, 'secimler').run() }
				}
				finally { delete this[timerKey] }
			}, 10);
		};
		altForm = form.addFormWithParent('altForm_ticariSatis_stok').altAlta()
			.setVisibleKosulu(({ builder: fbd }) => secimlerInitWithKosul(fbd, ({ hesapTipi, shStokHizmet }) => hesapTipi.ticarimi && shStokHizmet.stokmu));
		// altForm.addForm().setLayout(() => $(`<div>Stok için seçimler</div>`)).autoAppend();
		// initSecimlerForm(altForm, 'ticSatis_stokSecimler', 'Stok');
		altForm = form.addFormWithParent('ticSatisSecimler_hizmet').altAlta()
			.setVisibleKosulu(({ builder: fbd }) => secimlerInitWithKosul(fbd, ({ hesapTipi, shStokHizmet }) => hesapTipi.ticarimi && shStokHizmet.hizmetmi));
		// altForm.addForm().setLayout(() => $(`<div>Hizmet için seçimler</div>`)).autoAppend();
		// initSecimlerForm(altForm, 'ticSatisSecimler_hizmet', 'Hizmet');
		
		form = fbd_altForm.addFormWithParent('altForm_hizmet').altAlta()
			.setVisibleKosulu(({ builder: fbd }) => secimlerInitWithKosul(fbd, ({ hesapTipi }) => hesapTipi.hizmetmi));
		// form.addForm().setLayout(() => $(`<div>Hizmet için seçimler</div>`)).autoAppend();
		// initSecimlerForm(form, 'secimler_hizmet', 'Hizmet');

		form = fbd_altForm.addFormWithParent('altForm_formul').altAlta()
			.setVisibleKosulu(({ builder: fbd }) => fbd.altInst.hesapTipi.formulmu);
		form.addTextArea('formul', 'Formül').setRows(4).setCols(100);

		form = fbd_altForm.addFormWithParent('altForm_satirlarToplami').altAlta()
			.setVisibleKosulu(({ builder: fbd }) => fbd.altInst.hesapTipi.satirlarToplamimi ? true : 'basic-hidden');
		altForm = form.addFormWithParent().yanYana();
		altForm.addTextInput('satirListeStr', 'Satır Liste').setPlaceHolder(`virgül (,) ile ayırınız`)
			.readOnly().addStyle_wh(250).addCSS('center')
			.onAfterRun(({ builder: fbd }) => fbd.input.attr('placeholder', fbd.placeHolder));
		altForm.addForm()
			.setLayout(() => $(`<div class="bold orangered">Satırları işaretleyiniz</div>`)).autoAppend()
			.addStyle(`$elementCSS { margin: 40px 0 0 20px }`);
		// altForm.addCheckBox('_sadeceBuSeviyemi', 'Sadece Bu Seviye');
		altForm.addGridliGosterici(newGUID()).addStyle_fullWH()
			.widgetArgsDuzenleIslemi(_e => this.gridArgsDuzenle(_e))
			.setTabloKolonlari(_e => {
				let attrSet = asSet(['seviyeNo', 'aciklama', 'hesapTipi', 'veriTipi']);
				return this.tabloKolonlari.filter(({ belirtec }) => attrSet[belirtec])
			})
			.setSource(({ sender: fbd }) => {
				let {gridWidget} = this, {altInst} = fbd, {char: mevcutSeviye} = altInst.seviyeNo;
				let recs = gridWidget.getboundrows(), buRec = e?.args?.row?.bounddata;
				return recs.filter(rec => rec != buRec /*&& rec.seviyeNo?.char == mevcutSeviye*/)
					.map(rec => rec.deepCopy?.() ?? $.extend(true, {}, rec))
			})
			.veriYukleninceIslemi(({ builder: fbd }) => {
				let {part: gridPart, altInst: inst} = fbd, {grid, gridWidget} = gridPart;
				let {satirListe, _satirIdListe: satirIdListe} = inst;
				if (!satirIdListe) { satirIdListe = inst._satirIdListe = satirListe.map(ind => gridWidget.getrowid(ind)) }
				let {_rowXHandler: handler} = fbd;
				if (handler) { grid.off('rowselect', handler); grid.off('rowunselect', handler) }
				try {
					gridWidget.clearselection();
					if (satirIdListe) { for (let uid of satirIdListe) { gridWidget.selectrow(gridWidget.getrowboundindexbyid(uid)) } }
				}
				catch (ex) { }
				handler = fbd._rowXHandler = ({ args }) => {
					let {selectedRowIndexes: rowIndexes} = gridPart;
					inst.satirListe = rowIndexes;
					inst._satirIdListe = rowIndexes.map(ind => gridWidget.getrowid(ind))
				};
				grid.on('rowselect', handler); grid.on('rowunselect', handler)
			});
		
		return rfb
	}
	tanimla(e) {
		e = e ?? {}; let {islem} = e; if (islem == 'sil') { return this.tanimKaydet(e) }
		let gridRec = e.gridRec ?? e.rec; if (islem == 'degistir' && !gridRec) { return null }
		let rfb = this.getRootFormBuilder(e).run();
		return rfb
		/*let {title} = e, wnd = e.wnd = createJQXWindow({
			title, args: {
				isModal: false, closeButtonAction: 'close',
				width: '90%', height: Math.min(600, $(window).height() - 100)
			}
		});
		wnd.on('close', evt => { rfb.destroyPart(); wnd.jqxWindow('destroy'); delete e.wnd });
		rfb.setParent(wnd.find('.jqx-window-content > .subContent'));*/
		rfb/*.asForm().run();
		return rfb*/
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
	silIstendi({ sender: gridPart, recs, gridRec: rec }) {
		let {gridWidget} = gridPart; recs ??= $.makeArray(rec);
		let uids = recs.map(rec => rec.uid).sort(reverseSortFunc);
		for (let uid of uids) { gridWidget.deleterow(uid) }
	}
	gridSatirCiftTiklandi(e) {
		let {args} = e.event, {bounddata: gridRec} = args.row;
		this.degistirIstendi({ ...e, gridRec })
	}
}
