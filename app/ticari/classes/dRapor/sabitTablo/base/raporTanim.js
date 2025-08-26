class SBTablo extends MQDetayliGUIDVeAdi {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sabitTablomu() { return true }
	static get kodListeTipi() { return 'SBTABLO' } static get sinifAdi() { return 'Mali Tablo' }
	static get table() { return 'sbtablo' } static get tableAlias() { return 'fis' }
	static get detaySinif() { return SBTabloDetay } static get gridKontrolcuSinif() { return SBTabloGridci }
	static get kolonFiltreKullanilirmi() { return false } static get raporKullanilirmi() { return false }
	static get tumKolonlarGosterilirmi() { return true } static get inExpKullanilirmi() { return true }
	static get gridHeight_bosluk() { return 90 } static get _repeatButton_delayMS() { return 100 }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
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
		super.rootFormBuilderDuzenle(e); let {kaForm} = e, {_repeatButton_delayMS} = this;
		/*this.formBuilder_addTabPanelWithGenelTab(e); let {tabPage_genel: tabPage} = e;
		let form = tabPage.addFormWithParent().yanYana();*/
		kaForm.yanYana(); kaForm.builders = kaForm.builders.filter(fbd => fbd.id != 'kod');
		kaForm.id2Builder.aciklama.addStyle_wh(400);
		kaForm.addCheckBox('devreDisimi', 'Devre Dışı?').addStyle(
			`$elementCSS { margin-left: 10px } $elementCSS > label { color: firebrick !important }
			 $elementCSS > input:checked + label { font-style: bold !important }`
		);
		let btnCSS_bgBlue =
			`$elementCSS > button.jqx-fill-state-normal { background-color: royalblue }
			 $elementCSS > button.jqx-fill-state-hover { background-color: #4169e1a1 }`;
		let buttons = [
			kaForm.addButton('yeni', '').addStyle(`$elementCSS { margin-left: 30px !important }`),
			kaForm.addButton('degistir', '').addStyle(btnCSS_bgBlue),
			kaForm.addButton('sil', ''),
			kaForm.addButton('kopya', '').addStyle(btnCSS_bgBlue),
			kaForm.addButton('yukari', ''),
			kaForm.addButton('asagi', '')
		];
		kaForm.addForm().setLayout($()).onAfterRun(({ builder: fbd }) => {
			let {layout} = fbd.parentBuilder, buttons = layout.find('#yukari, #asagi');
			if (buttons.length) { buttons.jqxRepeatButton({ theme, delay: _repeatButton_delayMS }) }
		});
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
		let id2Det = Object.fromEntries(detaylar.filter(det => det.okunanHarSayac).map(det => [det.okunanHarSayac, det]));
		let sent = new MQSent(), {where: wh, sahalar} = sent;
		sent.fromAdd('sbtablodetayjson sec');
		wh.inDizi(Object.keys(id2Det), 'sec.harid'); sahalar.add('sec.harid', 'sec.seq', 'sec.xdata');
		let orderBy = ['harid', 'seq'], stm = new MQStm({ sent, orderBy });
		let id2Data = {}; for (let {harid: harID, xdata: data} of await app.sqlExecSelect(stm)) {
			(id2Data[harID] = id2Data[harID] ?? []).push(data) }
		for (let [harID, data] of Object.entries(id2Data)) {
			if (!data?.length) { continue }
			let det = id2Det[harID]; if (!det) { continue }
			try {
				data = JSON.parse(Base64.decode($.isArray(data) ? data.join('') : data))
				let {secimler} = det; for (let [key, _secim] of Object.entries(data)) {
					let secim = secimler?.[key];
					if (secim) { $.extend(secim, _secim) }
				}
			}
			catch (ex) { console.error('SBTablo::yukleSonrasiIslemler', 'secimler json', 'bozuk veri', data, ex) }
		}
	}
	async kaydetSonrasiIslemler({ trnId }) {
		await super.kaydetSonrasiIslemler(...arguments); let yDetaylar = [...this.detaylar];
		await this.detaylariYukle(...arguments); let {detaylar} = this;    /* detayların 'okunanHarSayac' bilgilerine ihtiyaç var, yazma sonrası detaylara atanmaz */
		detaylar.forEach((det, i) =>
			yDetaylar[i].okunanHarSayac = det.okunanHarSayac);
		let harID2SecimData = {};
		for (let {okunanHarSayac: harid, secimler} of yDetaylar) {
			secimler ??= {}; let {asObject: data} = secimler;
			harID2SecimData[harid] = $.isEmptyObject(data) ? null : Base64.encode(toJSONStr(data))
		}
		let hvListe = []; for (let [harid, data] of Object.entries(harID2SecimData)) {
			if (!data) { continue }
			arrayIterChunks(data, 50).forEach((xdata, seq) =>
				hvListe.push({ harid, seq, xdata }))
		}
		let from = 'sbtablodetayjson', harIDListe = Object.keys(harID2SecimData);
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
	get id() { return this.sayac } set id(value) { this.sayac = value }
	get asObject() {
		let {pTanim} = this.class, {sayac: id, satirListe} = this, keys = Object.keys(pTanim);
		let result = { ...this, id, satirListe };
		for (let key of keys) {
			let value = this[key];
			// value = value?.kod ?? value;
			value = value?.deepCopy?.() ?? value;
			if (typeof value == 'object' && !value?.deepCopy) { value = $.extend(true, {}, value) }
			if (value !== undefined) { result[key] = value }
		}
		for (let key of ['_p', '_supers', '_temps', 'ayrimlar', 'ozelSahalar', 'okunanHarSayac', 'sayac', 'eskiSeq']) { delete result[key] }
		return result
	}
	get satirListe() { let {satirListeStr: result} = this; return result?.length ? result.split(',').filter(x => !!x).map(x => asInteger(x.trim()) - 1) : [] }
	set satirListe(value) { this.satirListeStr = value?.length ? value.filter(x => x != null).map(x => x + 1).sort().join(', ') : '' }
	get secimler() {
		let {hesapTipi} = this; if (hesapTipi?.secilen == null) { return null }
		let {shStokHizmet, tip2Secimler} = this, {ticarimi, hizmetmi, ekBilgi} = hesapTipi;
		ekBilgi ??= {}; let {hareketcimi} = ekBilgi;
		let tip = (
			ticarimi ? shStokHizmet?.kod : hizmetmi ? 'H' :
			hareketcimi ? hesapTipi.kod : null
		);
		return tip2Secimler[tip]
	}
	get secimlerStr() {
		let result = [], {secimler} = this;
		if (secimler) {
			let {grupListe} = secimler;
			for (let [tip, sec] of secimler) {
				let e = { liste: [] }; sec.ozetBilgiHTMLOlustur?.(e);
				let {liste} = e; if (!liste.length) { continue }
				let {etiket, grupKod} = sec, html = '';
				if (grupKod) { etiket = grupListe[grupKod].aciklama || etiket }
				html = liste.join('');  // .replace('float-left', '');
				if (etiket) { html = changeTagContent(html, `<span class="bold gray etiket">${etiket}:</span> <span class="veri">${getTagContent(html)}</span>`) }
				result.push(html)
			}
		}
		return result.length ? `<div class="secimBilgi flex-row">${result.join('')}</div>` : ''
	}
	get asFormul() {
		let {hesapTipi} = this;
		/*if (hesapTipi.satirlarToplamimi) {
			return (({ det, attr, recs, ind2Rec, parentRec }) => {
				let {satirListe} = det, detaylar = parentRec?.detaylar ?? [];
				let topRecs = satirListe.map(i => ind2Rec[i]).filter(x => x != null);
				if (!topRecs.length) { return null }
				return roundToBedelFra(topla(rec => rec?.[attr] ?? 0, topRecs))
			})
		}
		else*/ if (hesapTipi?.formulmu) { return this.formul }
		return null
	}
	get asRaporQuery() {
		let uni = new MQUnionAll(), stm = new MQStm({ sent: uni });
		let e = { stm, uni }; this.raporQueryDuzenle(e);
		stm = e.stm; return stm
	}
	constructor(e) {
		e = e ?? {}; super(e);
		this.secimlerOlustur(e)
	}
	static pTanimDuzenle({ pTanim }) {
		$.extend(pTanim, {
			aciklama: new PInstStr('aciklama'), tersIslemmi: new PInstBitBool('bnegated'),
			seviyeNo: new PInstTekSecim('seviyeno', SBTabloSeviye), hesapTipi: new PInstTekSecim('hesaptipi', SBTabloHesapTipi),
			veriTipi: new PInstTekSecim('shveritipi', SBTabloVeriTipi), shStokHizmet: new PInstTekSecim('shstokhizmet', SBTabloStokHizmet),
			shAlmSat: new PInstTekSecim('shalmsat', AlimSatis), shIade: new PInstTekSecim('shiade', NormalIadeVeBirlikte),
			shAyrimTipi: new PInstTekSecim('shayrimtipi', SBTabloAyrimTipi),
			formul: new PInstStr(''), satirListeStr: new PInstStr('satirlistestr'),
			cssClassesStr: new PInstStr('cssclasses'), cssStyle: new PInstStr('cssstyle')
		})
	}
	secimlerOlustur(e) {
		let tip2Secimler = this.tip2Secimler = e.tip2Secimler ?? {};
		let tip2SecimMFYapi = {
			S: { mst: DMQStok, grup: DMQStokGrup, anaGrup: DMQStokAnaGrup, istGrup: DMQStokIstGrup },
			H: { mst: DMQHizmet, grup: DMQHizmetGrup, anaGrup: DMQHizmetAnaGrup, istGrup: DMQHizmetIstGrup, muhHesap: DMQMuhHesap },
			/*[KasaHareketci.kisaKod]: { mst: DMQKasa, grup: DMQKasaGrup },
			[BankaMevduatHareketci.kisaKod]: { mst: DMQBankaHesap, grup: DMQBankaHesapGrup }*/
		};
		{
			let harSiniflar = SBTabloHesapTipi.kaListe.map( ({ ekBilgi }) => ekBilgi?.harSinif ).filter(x => x);
			let _e = { ...e, tip2Secimler, tip2SecimMFYapi };
			for (let harSinif of harSiniflar) { harSinif.maliTablo_secimlerYapiOlustur(_e) }
		}
		let tip2EkWhereDuzenleyici = {
			/*[KasaHareketci.kisaKod]: ({ raporTanim, secimler: sec, where: wh }) => { debugger },
			[BankaMevduatHareketci.kisaKod]: ({ raporTanim, secimler: sec, where: wh }) => { debugger }*/
		};
		for (let [tip, yapi] of Object.entries(tip2SecimMFYapi)) {
			if ($.isEmptyObject(yapi)) { continue }
			let secimler = tip2Secimler[tip]; if (secimler) { continue }
			let secimEkWhereDuzenle = tip2EkWhereDuzenleyici[tip];
			$.extend(secimler, secimEkWhereDuzenle);
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
		let {okunanHarSayac: id, hesapTipi} = this;
		id = id || newGUID(); $.extend(hv, { id });
		if (!(hesapTipi.ticarimi || hesapTipi.ekBilgi?.hareketcimi || hesapTipi.formulmu)) { hv.bnegated = false }
	}
	setValues({ rec }) {
		super.setValues(...arguments)
		/* $.extend(this, { satirListeStr }) */
	}
	inExp_hostVarsDuzenle(e) {
		super.inExp_hostVarsDuzenle(e); let {hv} = e;
		let {asObject: secimlerData} = this.secimler ?? {};
		if (!$.isEmptyObject(secimlerData)) { hv.secimler = secimlerData }
	}
	inExp_setValues({ rec, rec: { secimler: secimlerData } }) {
		super.inExp_setValues(...arguments); let {secimler} = this;
		if (secimler) { secimler.readFrom({ liste: secimlerData }) }
	}
	raporQueryDuzenle(e) {
		let det = e.det = this, {rapor, secimler, stm, donemBS, subeKodlari, sentDuzenle} = e;
		let {tabloYapi} = rapor, {aciklama, hesapTipi = {}, veriTipi = {}, shStokHizmet} = this;
		let {ticarimi} = hesapTipi, {hareketcimi, harSinif} = hesapTipi.ekBilgi ?? {};
		let {sahaAlias} = rapor;
		let durum = e.durum = {
			stokmu: ticarimi && (shStokHizmet.birliktemi || shStokHizmet.stokmu),
			hizmetmi: hesapTipi.hizmetmi || (ticarimi && (shStokHizmet.birliktemi || shStokHizmet.hizmetmi))
		};
		let {stokmu, hizmetmi} = durum;
		if (hareketcimi && !(stokmu || hizmetmi)) {
			/* question: stokmu, hizmetmi, ... */
			durum[hesapTipi.question] = true
		}
		let {ekBilgi = {}, donemTipi} = veriTipi;
		$.extend(e, { aciklama, hesapTipi, veriTipi, shStokHizmet, ticarimi, hareketcimi, maliTablomu: true });
		let _e = { ...e, sahaAlias };
		if ($.isPlainObject(donemBS)) { donemBS = _e.donemBS = new CBasiSonu(donemBS) }
		if (donemTipi) { _e.donemTipi = donemTipi }
		let {sentUygunluk, sentDuzenle: icerikSentDuzenle} = ekBilgi;
		if (ticarimi || hareketcimi) {
			secimler = secimler ?? rapor?.secimler;
			let {secimler: detSecimler} = this, raporTanim = this;    /* detay secimler */
			$.extend(_e, { detSecimler });
			if (detSecimler) {
				detSecimler.whereBlockListe = [];
				detSecimler.whereBlockEkle(({ secimler: sec, where: wh, ticarimi, stokmu, hizmetmi, hareketcimi, harSinif }) => {
					let args = { ..._e, raporTanim, secimler: sec, where: wh, donemTipi, harSinif };
					if (ticarimi) {
						let alias = args.alias = hizmetmi ? 'hiz' : 'stk', iGrpAlias = hizmetmi ? 'higrp' : 'sigrp';
						wh.basiSonu(sec.mstKod, `${alias}.kod`).ozellik(sec.mstAdi, `${alias}.aciklama`);
						wh.basiSonu(sec.grupKod, 'grp.kod').ozellik(sec.grupAdi, 'grp.aciklama');
						wh.basiSonu(sec.anaGrupKod, 'agrp.kod').ozellik(sec.anaGrupAdi, 'agrp.aciklama');
						wh.basiSonu(sec.istGrupKod, `${iGrpAlias}.kod`).ozellik(sec.istGrupAdi, `${iGrpAlias}.aciklama`);
						if (hizmetmi) { wh.basiSonu(sec.muhHesapKod, `${alias}.muhhesap`).ozellik(sec.muhHesapAdi, 'mhes.aciklama') }
					}
					// else if (hareketcimi && harSinif) { harSinif.maliTablo_secimlerSentDuzenle(args) }
					sec.secimEkWhereDuzenle?.(args)
				});
				{
					(secimler = secimler.deepCopy()).beginUpdate();
					$.extend(secimler.liste, { ...detSecimler.liste });
					let whereBlockListe = secimler.whereBlockListe ??= [], {whereBlockListe: detWhereBlockListe} = detSecimler;
					if (detWhereBlockListe) { whereBlockListe.push(...detWhereBlockListe) }
					secimler.endUpdate()
				}
			}
			e.secimler = secimler
		}
		for (let [selector, flag] of Object.entries(durum)) {
			if (!flag) { continue } 
			for (let _selector of Object.keys(durum)) { delete _e[_selector] }
			_e[selector] = flag;
			if (!(sentUygunluk == null || sentUygunluk?.call(this, _e))) { continue }
			if (ticarimi) { this.raporQueryDuzenle_satis(_e) }
			else if (hareketcimi) { this.raporQueryDuzenle_hareketci(_e) }
		}
		stm = e.stm = _e.stm; let {sent: uni} = stm ?? {};
		if (!uni?.liste?.length) { return this }
		_e.uni = uni; let {detSecimler, defHV, harHVListe} = _e;
		{
			let sahaAliases = Object.values(tabloYapi?.toplam).map(({ colDefs }) => colDefs.map(({ belirtec }) => belirtec)).flat();
			for (let i = 0; i < uni.liste.length; i++) {
				let sent = uni.liste[i];
				{
					let {alias2Deger} = sent, {shTipi: shTipiClause} = alias2Deger;
					if (shTipiClause) {
						let shTipiStr = shTipiClause.replaceAll(`'`, '');
						$.extend(_e, { stokmu: shTipiStr == 'S', hizmetmi: shTipiStr == 'H' })
					}
				}
				sent.sahalarReset();
				let {where: wh, sahalar} = sent, hv = { ...defHV, ...harHVListe?.[i] };
				let donemBSVarmi = donemBS?.bosDegilmi ?? false;
				if (donemBSVarmi) {
					let tarihBS = donemBS.deepCopy(); if (donemTipi) {
						tarihBS.basi = null;
						if (donemTipi == 'B') { tarihBS.sonu = donemBS.basi.clone().addDays(-1) }
					}
					wh.basiSonu(tarihBS, (hv.tarih || 'fis.tarih'))
				}
				if (subeKodlari?.length) { wh.inDizi(subeKodlari, (hv.bizsubekod || 'fis.bizsubekod')) }
				/* sahalar.add(`${aciklama.sqlServerDegeri()} aciklama`); */
				wh.add(`${hv.ozelisaret ?? 'fis.ozelisaret'} <> 'X'`);
				$.extend(_e, { sent, where: wh, sahalar, hv });
				icerikSentDuzenle?.call(this, _e); sentDuzenle?.call(this, _e);
				sent = _e.sent;
				{
					let {alias2Deger} = sent; $.extend(_e, { alias2Deger });
					for (let sahaAlias of sahaAliases) {
						if (!alias2Deger[sahaAlias]) { sahalar.add(`0 ${sahaAlias}`) }
					}
					if (detSecimler) {
						if (ticarimi) {
							let mstTableAlias = hizmetmi ? 'hiz' : 'stk', iGrpAlias = hizmetmi ? 'higrp' : 'sigrp';
							let mstBaglaSelector = hizmetmi ? 'x2HizmetBagla' : 'x2StokBagla';
							let ekBaglaPrefix = hizmetmi ? 'hizmet' : 'stok', mstKodAlias = `${ekBaglaPrefix}kod`;
							let {from} = sent, kodClause = `har.${mstKodAlias}`;
							if (!from.aliasIcinTable(mstTableAlias)) { sent[mstBaglaSelector]({ kodClause }) }
							if (!from.aliasIcinTable('grp')) { sent[`${ekBaglaPrefix}2GrupBagla`]() }
							if (!from.aliasIcinTable('agrp')) { sent[`${ekBaglaPrefix}Grup2AnaGrupBagla`]() }
							if (!from.aliasIcinTable(iGrpAlias)) { sent[`${ekBaglaPrefix}2IstGrupBagla`]() }
							if (!from.aliasIcinTable('mhes')) { sent.x2MuhHesapBagla({ alias: mstTableAlias }) }
							wh.birlestir(detSecimler.getTBWhereClause(_e))
						}
						else if (hareketcimi && harSinif) {
							let mstYapi = _e.mstYapi = harSinif.mstYapi;
							let mstClause = _e.mstClause = hv[mstYapi.hvAlias];
							harSinif.maliTablo_secimlerSentDuzenle(_e) 
							// harSinif.maliTablo_secimlerFromEkBagla(_e)
						}
					}
				}
				sent.groupByOlustur().gereksizTablolariSil()
			}
		}
		return this
	}
	raporQueryDuzenle_satis({ stm, uni, stokmu, hizmetmi }) {
		let {dRapor: { ihracatIntacdanmi } = {}} = app.params;
		let {shIade, shAyrimTipi} = this, {ihracatmi} = shAyrimTipi;
		let harTable = hizmetmi ? 'pifhizmet' : 'pifstok';
		let sent = new MQSent(), {where: wh} = sent;
		sent.fromAdd('piffis fis').innerJoin('fis', `${harTable} har`, 'har.fissayac = fis.kaysayac');
		wh.fisSilindiEkle().add(`fis.piftipi = 'F'`, `fis.almsat = 'T'`);
		if (!shIade.birliktemi) { wh.degerAta(shIade.iademi ? 'I' : '', 'fis.iade') }
		let ayrimYapi = {
			in: { },
			notIn: { [ihracatIntacdanmi ? 'IH' : 'IN']: true }
		}
		if (!shAyrimTipi.birliktemi) {
			/*
				ihracatIntacdanmi=true
						ise İhracat verisi için fis.ayrimtipi in ('IN', 'MI')     // ihracat için 'MI' ortak, 'IN' farklı
						iç piyasa için fis.ayrimtipi not in ('IN', 'MI', 'IH')    // iç piyasa için her iki koşulda da aynı
					hepsi için fis.ayrimtipi <> 'IH'
				
				ihracatIntacdanmi=false
						ise İhracat verisi için fis.ayrimtipi in ('IH', 'MI')     // ihracat için 'MI' ortak, 'IH' farklı
						iç piyasa için fis.ayrimtipi not in ('IN', 'MI', 'IH')    // iç piyasa için her iki koşulda da aynı
					hepsi için fis.ayrimtipi <> 'IN'
			*/
			if (ihracatmi) {
				let inEk = ihracatIntacdanmi ? 'IN' : 'IH';
				for (let key of [inEk, 'MI']) { ayrimYapi.in[key] = true }
			}
			else { for (let key of ['IN', 'MI', 'IH']) { ayrimYapi.notIn[key] = true } }
			ayrimYapi.notIn[ihracatIntacdanmi ? 'IH': 'IN'] = true;
			let addAyrimTipiKosul = key => {
				let set = ayrimYapi[key]; if ($.isEmptyObject(set)) { return }
				let selector = `${key}Dizi`; wh[selector](Object.keys(set), 'fis.ayrimtipi')
			};
			addAyrimTipiKosul('in'); addAyrimTipiKosul('notIn')
		}
		let {sahalar: _sahalar} = sent; sent.sahalarReset();
		let {sahalar} = sent; sahalar.add(`'${stokmu ? 'S' : hizmetmi ? 'H' : ''}' shTipi`);
		uni.add(sent);
		return this
	}
	raporQueryDuzenle_hareketci({ rapor, secimler, sahaAlias: bedelAlias, uni, donemTipi }) {
		let {hesapTipi} = this, {ekBilgi = {}} = hesapTipi;
		let {harSinif} = ekBilgi; if (!harSinif) { return this }
		let e = arguments[0], aliasListe = ['ba', bedelAlias];
		let sabitAttrListe = ['tarih', 'bizsubekod', 'ozelisaret'];
		let {hvAlias} = harSinif.mstYapi ?? {}; if (hvAlias) { sabitAttrListe.push(hvAlias) }
		let har = new harSinif().withAttrs([...sabitAttrListe, ...aliasListe]), {attrSet} = har;
		let {varsayilanHV: defHV} = har.class, harUni = har.uniOlustur({ ...e, rapor, secimler });
		let harHVListe = e.harHVListe = [];
		for (let harSent of harUni) {
			let {alias2Deger: hv} = harSent, tarihClause = (hv.tarih || 'fis.tarih');
			let sent = harSent.deepCopy(), addClause = alias => {
				let clause = hv[alias]; if (alias == bedelAlias) { clause = clause.asSumDeger() }
				let saha = `${clause} ${alias}`;
				sent.sahalar.add(saha);
				return saha
			};
			harHVListe.push(hv); sent.sahalarReset();
			for (let alias of aliasListe) { addClause(alias) }
			uni.add(sent)
		}
		$.extend(e, { har, defHV, attrSet });
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
	shallowCopy(e) {
		let inst = super.deepCopy(); if (!inst) { return inst }
		let {tip2Secimler} = this; if (tip2Secimler) {
			tip2Secimler = inst.tip2Secimler = {};
			for (let [tip, _secimler] of Object.entries(tip2Secimler)) {
				let secimler = _secimler.map(sec => sec.shallowCopy());
				tip2Secimler[tip] = secimler
			}
		}
		return inst
	}
	deepCopy(e) {
		let inst = super.deepCopy(); if (!inst) { return inst }
		if (this.tip2Secimler) {
			let tip2Secimler = inst.tip2Secimler = {};
			for (let [tip, _secimler] of Object.entries(this.tip2Secimler)) {
				let secimler = _secimler.deepCopy();
				tip2Secimler[tip] = secimler
			}
		}
		return inst
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
		if (rec.tersIslemmi) { result.push(belirtec == 'tersIslemmi' ? 'bg-lightred' : 'orangered') }
		switch (belirtec) {
			case 'secimlerStr': result.push('flex-row'); break
		}
		return result.join(' ')
	}
	tabloKolonlariDuzenle_ilk(e) {
		super.tabloKolonlariDuzenle_ilk(e); let {tabloKolonlari: liste} = e;
		let cellClassName = (sender, rowIndex, belirtec, value, rec) => {
			let _e = { sender, rowIndex, belirtec, value, rec, result: [] };
			return this.ekCSSDuzenle(_e)
		};
		let cellsRenderer = (colDef, rowIndex, belirtec, value, html, jqxCol, rec, result) => {
			let {hesapTipi, shStokHizmet} = rec ?? {};
			html = result ?? html;
			let clear = () => html = changeTagContent(html, '');
			switch (belirtec) {
				case 'veriTipi':
					if (!(hesapTipi.ticarimi || hesapTipi.ekBilgi?.hareketcimi)) { clear() } break
				// case 'tersIslemmi': html = ''; break
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
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 50, cellClassName, cellsRenderer }),
			new GridKolon({ belirtec: 'seviyeNo', text: 'Seviye', genislikCh: 10, cellClassName, cellsRenderer }).tipTekSecim({ tekSecimSinif: SBTabloSeviye }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'tersIslemmi', text: 'Ters?', genislikCh: 10, cellClassName, cellsRenderer }).tipBool(),
			new GridKolon({ belirtec: 'hesapTipi', text: 'Hesap Tipi', genislikCh: 30, cellClassName, cellsRenderer }).tipTekSecim({ tekSecimSinif: SBTabloHesapTipi }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'veriTipi', text: 'Veri Tipi', genislikCh: 30, cellClassName, cellsRenderer }).tipTekSecim({ tekSecimSinif: SBTabloVeriTipi }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shStokHizmet', text: 'Stok/Hizmet', genislikCh: 20, cellClassName, cellsRenderer }).tipTekSecim({ tekSecimSinif: SBTabloStokHizmet }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shAlmSat', text: 'S/H Alım-Satış', genislikCh: 15, cellClassName, cellsRenderer }).tipTekSecim({ tekSecimSinif: AlimSatis }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shIade', text: 'S/H İADE', genislikCh: 15, cellClassName, cellsRenderer }).tipTekSecim({ tekSecimSinif: NormalIadeVeBirlikte }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shAyrimTipi', text: 'S/H Ayrım', genislikCh: 15, cellClassName, cellsRenderer }).tipTekSecim({ tekSecimSinif: SBTabloAyrimTipi }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'satirListeStr', text: 'Satır Liste', genislikCh: 20, cellClassName, cellsRenderer }),
			new GridKolon({ belirtec: 'secimlerStr', text: 'Seçimler', genislikCh: 250, cellClassName, cellsRenderer }),
			(config.dev ? new GridKolon({ belirtec: 'formul', text: 'Özel Formül', genislikCh: 150, cellClassName, cellsRenderer }) : null),
			new GridKolon({ belirtec: 'cssClassesStr', text: 'CSS Sınıfları', genislikCh: 50, cellClassName, cellsRenderer }),
			new GridKolon({ belirtec: 'cssStyle', text: 'CSS Verisi', genislikCh: 150, cellClassName, cellsRenderer })
			/*new GridKolon({ belirtec: '_secimler', text: ' ', genislikCh: 20, cellClassName, cellsRenderer }).tipButton('Seçimler')
				.onClick(({ gridRec }) => {
					let {secimler} = gridRec, {activeWndPart: parentPart} = app;
					let part = secimler.duzenlemeEkraniAc({ parentPart: '', tamamIslemi: e => {} });
					$.extend(part, { parentPart });
					Object.defineProperty(part, 'canDestroy', { get: () => true })
				})*/
		].filter(x => !!x))
	}
	tanimla(e) {
		e = e ?? {}; let {islem} = e;
		if (islem == 'sil') { return this.tanimKaydet(e) }
		let gridRec = e.gridRec ?? e.rec;
		if (!gridRec && (islem == 'degistir' || islem == 'kopya')) { return null }
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
	async tanimKaydet({ islem, sender: gridPart, gridWidget, inst: fis, detay: det, eskiDetay: eDet }) {
		gridPart = gridPart?.gridPart ?? gridPart;
		try {
			switch (islem) {
				case 'yeni': case 'degistir': case 'kopya': {
					try {
						let result = await this.onKontrol(...arguments);
						if (typeof result == 'string') { result = { isError: true, errorText: result } }
						if (result?.isError) { throw result }
					}
					catch (ex) { throw ex }
					break
				}
			}
			switch (islem) {
				case 'yeni': case 'kopya': { gridWidget.addrow(null, det, eDet?.uid); break }
				case 'degistir': { gridWidget.updaterow(eDet?.uid, det); break }
				case 'sil': { gridWidget.deleterow(eDet?.uid); break }
			}
			fis.detaylar = gridPart.boundRecs
		}
		catch (ex) { hConfirm(getErrorText(ex), `Satır: <b class=royalblue>${islem}</b>`); throw ex }
	}
	async onKontrol({ detay: det }) {
		let {hesapTipi, veriTipi} = det;
		if (hesapTipi.secilen == null || hesapTipi.bosmu) { return `<b class=firebrick>Hesap Tipi</b> boş olamaz` }
		if ((hesapTipi.ticarimi || hesapTipi.ekBilgi?.hareketcimi) && (veriTipi.secilen == null || veriTipi.yokmu)) { return `<b class=firebrick>Veri Tipi</b> boş olamaz` }
	}
	getRootFormBuilder(e) {
		let {islem, sender: gridPart, gridRec: eskiDetay} = e, {gridWidget} = gridPart;
		let {fis} = this, {class: fisSinif} = fis;
		e.gridWidget = e.gridWidget ?? gridWidget;
		if (islem == 'yeni') { eskiDetay = null }
		let detay = islem == 'yeni' ? new fisSinif.detaySinif(eskiDetay) : eskiDetay.deepCopy();
		let removeKeys = ['uid', 'uniqueid', '_rowNumber', 'boundindex', 'visibleindex'];
		if (islem == 'kopya') { removeKeys.push('okunanHarSayac', 'seq') }
		for (let key of removeKeys) { delete detay[key] }
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
		rfb.addIslemTuslari('islemTuslari').setTip('tamamVazgec')
			.setId2Handler({
				tamam: async _e => {
					try { if (await this.tanimKaydet({ ..._e, ...e, sender: gridPart, inst: fis, fis, detay, eskiDetay }) === false) { return } }
					catch (ex) { console.error(ex); return }
					close({ ..._e, ...e })
				},
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
		let fbd_tersIslemmi, fbd_veriTipi;
		let fbd_altForm, updateAltForm = () => {
			for (let fbd of [fbd_tersIslemmi, fbd_veriTipi]) { fbd.updateVisible()?.dataBind?.() }
			for (let fbd of fbd_altForm) { fbd.updateVisible() }
		};
		
		let showCSSFlag = false;
		let form = fbd_content.addFormWithParent().yanYana(2);
		form.addTextInput('aciklama', 'Açıklama').addStyle_wh(400);
		fbd_tersIslemmi = form.addCheckBox('tersIslemmi', 'Ters İşlem?')
			.addStyle(`$elementCSS { margin: -5px 0 0 30px }`)
			.setVisibleKosulu(({ builder: fbd }) => {
				let {hesapTipi} = fbd.altInst;
				return hesapTipi.ticarimi || hesapTipi.ekBilgi?.hareketcimi || hesapTipi.formulmu ? true : 'jqx-hidden'
			});

		form = fbd_content.addFormWithParent().yanYana();
		form.addModelKullan('seviyeNo', 'Seviye')
			.dropDown().noMF().autoBind().kodsuz().bosKodAlinmaz().listedenSecilmez()
			.setSource(SBTabloSeviye.kaListe).onAfterRun(({ builder: fbd }) => fbd.input.focus());
		form.addModelKullan('hesapTipi', 'Hesap Tipi')
			.dropDown().noMF().autoBind().kodsuz().bosKodAlinmaz()
			.setSource(SBTabloHesapTipi.kaListe).degisince(() => updateAltForm());
		fbd_veriTipi = form.addModelKullan('veriTipi', 'Veri Tipi')
			.dropDown().noMF().autoBind().kodsuz().bosKodAlinmaz()
			.setSource(() => (({ builder: fbd }) => {
				let {altInst: det} = fbd, {hesapTipi} = det;
				return SBTabloVeriTipi.kaListe.filter(({ ekBilgi }) =>
					ekBilgi?.gosterimUygunluk?.call(this, { ...e, det, hesapTipi }))
			}))
			.setVisibleKosulu(({ builder: fbd }) => {
				let {hesapTipi} = fbd.altInst;
				return hesapTipi.ticarimi || hesapTipi.ekBilgi?.hareketcimi ? true : 'jqx-hidden'
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

		let harKAListe = SBTabloHesapTipi.kaListe.filter(ka => ka.ekBilgi?.hareketcimi);
		for (let {kod: key, question: selector} of harKAListe) {
			form = fbd_altForm.addFormWithParent(`altForm_${key}`).altAlta()
				.setVisibleKosulu(({ builder: fbd }) => secimlerInitWithKosul(fbd, ({ hesapTipi }) => hesapTipi[selector]))
		}

		form = fbd_altForm.addFormWithParent('altForm_formul').altAlta()
			.setVisibleKosulu(({ builder: fbd }) => !!fbd.altInst.hesapTipi.formulmu);
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
	yukariAsagi(e) {
		let {_repeatButton_delayMS: delayMS} = SBTablo, timerKey = '_timer_yukariAsagi';
		clearTimeout(this[timerKey]);
		this[timerKey] = setTimeout(e => { try { this._yukariAsagi(e) } finally { delete this[timerKey] } }, delayMS - 15, e)
	}
	_yukariAsagi({ sender, recs: selRecs, yon }) {
		let {gridPart, gridWidget, inst: fis} = sender, {detaylar: recs} = fis;
		let id2Det = {}; for (let rec of recs) { id2Det[rec.uid] = rec }
		selRecs = selRecs.map(({ uid }) => id2Det[uid]);
		selRecs.sort((a, b) => recs.indexOf(a) - recs.indexOf(b));
		switch (yon) {
	        case 'yukari':
	            for (let i = 0; i < selRecs.length; i++) {  /* Baştan sona doğru işliyoruz */
	                let rec = selRecs[i], ind = recs.indexOf(rec); if (ind < 1) { continue }  /* En üstteki kayıt yukarı çıkamaz */
	                [recs[ind], recs[ind - 1]] = [recs[ind - 1], recs[ind]]
	            }
	            break;
	        case 'asagi':
	            for (let i = selRecs.length - 1; i >= 0; i--) {  /* Baştan sona işlemek yerine, TERSTEN işliyoruz */
	                let rec = selRecs[i], ind = recs.indexOf(rec); if (ind >= recs.length - 1) { continue }  /* En alttaki kayıt aşağı inemez */
	                [recs[ind], recs[ind + 1]] = [recs[ind + 1], recs[ind]]
	            }
	            break;
	    }
	    let newRowIndexes = selRecs.map(rec => recs.indexOf(rec));  /* Swap sonrası tüm yeni indeksleri al */
		gridPart.veriYuklenince(() => {
			gridPart.veriYuklenince(null);
			gridWidget.clearselection();
			for (let ind of newRowIndexes) { gridWidget.selectrow(ind) }  /* sırası değişen yeni satırları seç */
		});
		gridPart.tazele()
	}
	yeniIstendi(e) { return this.tanimla({ ...e, islem: 'yeni' }) }
	degistirIstendi(e) { return this.tanimla({ ...e, islem: 'degistir' }) }
	silIstendi({ sender: gridPart, recs, gridRec: rec }) {
		let {gridWidget} = gridPart; recs ??= $.makeArray(rec);
		let uids = recs.map(rec => rec.uid).sort(reverseSortFunc);
		for (let uid of uids) { gridWidget.deleterow(uid) }
	}
	kopyaIstendi(e) { return this.tanimla({ ...e, islem: 'kopya' }) }
	yukariIstendi(e) { return this.yukariAsagi({ ...e, yon: 'yukari' })}
	asagiIstendi(e) { return this.yukariAsagi({ ...e, yon: 'asagi' })}
	gridSatirCiftTiklandi(e) {
		let {args} = e.event, {bounddata: gridRec} = args.row;
		this.degistirIstendi({ ...e, gridRec })
	}
}
