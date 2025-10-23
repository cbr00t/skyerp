class SBTablo extends MQDetayliGUIDVeAdi {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sabitTablomu() { return true }
	static get kodListeTipi() { return 'SBTABLO' } static get sinifAdi() { return 'Mali Tablo' }
	static get table() { return 'sbtablo' } static get tableAlias() { return 'fis' }
	static get detaySinif() { return SBTabloDetay } static get gridKontrolcuSinif() { return SBTabloGridci }
	static get kolonFiltreKullanilirmi() { return false } static get raporKullanilirmi() { return false }
	static get tumKolonlarGosterilirmi() { return true } static get inExpKullanilirmi() { return true }
	static get gridHeight_bosluk() { return 90 } static get _repeatButton_delayMS() { return 100 }
	get yatayAnalizVarmi() { return !!this.yatayAnaliz?.char }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, {
			devreDisimi: new PInstBitBool('bdevredisi'),
			yatayAnaliz: new PInstTekSecim('yatayanaliz', SBTabloYatayAnaliz)
		})
	}
	static secimlerDuzenle({ secimler: sec }) {
		let {tableAlias: alias} = this;
		sec.grupTopluEkle([ { kod: 'genel', etiket: 'Genel', kapali: false } ]);
		sec
			.secimTopluEkle({
				aktifSecim: new SecimTekSecim({ etiket: 'Aktiflik', tekSecim: new AktifVeDevreDisi().bu() }),
				yatayAnaliz: new SecimBirKismi({ etiket: 'Yatay Analiz', tekSecimSinif: SBTabloYatayAnaliz })
			})
		sec.whereBlockEkle(({ secimler: sec, where: wh }) => {
			{ let {tekSecim: aktifSecim} = sec.aktifSecim;
			  wh.birlestir(aktifSecim.getTersBoolBitClause(`${alias}.bdevredisi`)) }
			wh.birKismi(sec.yatayAnaliz, `${alias}.yatayanaliz`)
		})
	}
	static ekCSSDuzenle({ rec, result }) {
		super.ekCSSDuzenle(...arguments);
		if (asBool(rec.bdevredisi)) { result.push('bg-lightgray', 'iptal', 'firebrick') }
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); let {tableAlias: alias} = this;
		liste.push(
			new GridKolon({ belirtec: 'yatayanaliztext', text: 'Yatay Analiz', genislikCh: 13, sql: SBTabloYatayAnaliz.getClause(`${alias}.yatayanaliz`) }),
			new GridKolon({ belirtec: 'bdevredisi', text: 'Devre Dışı?', genislikCh: 13 }).tipBool()
		)
	}
	static loadServerData_queryDuzenle({ sent, sent: { sahalar } }) {
		super.loadServerData_queryDuzenle(...arguments);
		let {tableAlias: alias} = this; sahalar.add(`${alias}.yatayanaliz`)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); let {kaForm} = e, {_repeatButton_delayMS} = this;
		/*this.formBuilder_addTabPanelWithGenelTab(e); let {tabPage_genel: tabPage} = e;
		let form = tabPage.addFormWithParent().yanYana();*/
		kaForm.yanYana(); kaForm.builders = kaForm.builders.filter(fbd => fbd.id != 'kod');
		kaForm.id2Builder.aciklama.addStyle_wh(400);
		kaForm.addModelKullan('yatayAnaliz', 'Yatay Analiz').dropDown().noMF()
			.kodsuz().bosKodAlinir().bosKodEklenir()
			.setSource(SBTabloYatayAnaliz.kaListe)
			.addStyle_wh(250);
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
				let {part: gridPart, kontrolcu} = e.fbd_grid                                                /* !! burası doğru: '_e' değil 'e' olacak */
				let {selectedRecs: recs, selectedRec: gridRec, selectedRowIndex: rowIndex} = gridPart;
				// if (!gridRec) { return }
				let args = { ...e, ..._e, gridPart, recs, gridRec, rowIndex };
				try { await kontrolcu[selector]?.(args) }
				catch (ex) { hConfirm(getErrorText(ex)); throw ex }
			})
		}
	}
	static rootFormBuilderDuzenle_grid(e) {
		super.rootFormBuilderDuzenle_grid(e); let {fbd_grid} = e
		fbd_grid.readOnly()
	}
	async yukleSonrasiIslemler() {
		await super.yukleSonrasiIslemler(...arguments); let {detaylar} = this
		let id2Det = Object.fromEntries(detaylar.filter(det => det.okunanHarSayac).map(det => [det.okunanHarSayac, det]))
		let sent = new MQSent(), {where: wh, sahalar} = sent
		sent.fromAdd('sbtablodetayjson sec')
		wh.inDizi(Object.keys(id2Det), 'sec.harid'); sahalar.add('sec.harid', 'sec.seq', 'sec.xdata')
		let orderBy = ['harid', 'seq'], stm = new MQStm({ sent, orderBy });
		let id2Data = {}; for (let {harid: harID, xdata: data} of await app.sqlExecSelect(stm)) {
			(id2Data[harID] = id2Data[harID] ?? []).push(data) }
		for (let [harID, data] of Object.entries(id2Data)) {
			if (!data?.length) { continue }
			let det = id2Det[harID]; if (!det) { continue }
			try {
				data = JSON.parse(Base64.decode($.isArray(data) ? data.join('') : data))
				let {secimler} = det
				for (let [key, _secim] of Object.entries(data)) {
					let secim = secimler?.[key]
					if (secim) { $.extend(secim, _secim) }
				}
			}
			catch (ex) { console.error('SBTablo::yukleSonrasiIslemler', 'secimler json', 'bozuk veri', data, ex) }
		}
	}
	async kaydetSonrasiIslemler({ trnId }) {
		await super.kaydetSonrasiIslemler(...arguments); let yDetaylar = [...this.detaylar]
		await this.detaylariYukle(...arguments); let {detaylar} = this
		// detayların 'okunanHarSayac' bilgilerine ihtiyaç var, yazma sonrası detaylara atanmaz
		detaylar.forEach((det, i) =>
			yDetaylar[i].okunanHarSayac = det.okunanHarSayac)
		let harID2SecimData = {};
		for (let {okunanHarSayac: harid, secimler} of yDetaylar) {
			secimler ??= {}; let {asObject: data} = secimler;
			harID2SecimData[harid] = empty(data) ? null : Base64.encode(toJSONStr(data))
		}
		let hvListe = []; for (let [harid, data] of Object.entries(harID2SecimData)) {
			if (!data) { continue }
			arrayIterChunks(data, 50).forEach((xdata, seq) =>
				hvListe.push({ harid, seq, xdata }))
		}
		let from = 'sbtablodetayjson', harIDListe = Object.keys(harID2SecimData)
		let query = new MQToplu([
			new MQIliskiliDelete({ from, where: { inDizi: harIDListe, saha: 'harid' } }),
			new MQInsert({ from, hvListe })
		]);
		await app.sqlExecNone({ trnId, query })
	}
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments)
		hv.aciklama = hv.aciklama ?? ''
	}
	setValues({ rec }) { super.setValues(...arguments) }
	static getRaporKod(e) {
		e = e ?? {}; let kod = typeof e == 'object' ? 
			(e.raporKod ?? e.raporkod ?? e.raporTip ?? e.raportip ?? e.kod ?? e.tip ??
			e.rapor?.kod ?? e.class?.raporClass?.kod ?? e.rapor?.class?.kod ?? e.class?.kod) : e
		return kod || null
	}
	static async getDefault(e) {
		let {yerel} = app.params, tip2SonDRaporRec = yerel.tip2SonDRaporRec || {}, {rapor} = e, raporKod = this.getRaporKod(rapor)
		let id = raporKod ? tip2SonDRaporRec[raporKod] : null, inst = new this({ rapor, id })
		if (id) { await inst.yukle(e) }
		return inst
	}
	setDefault(e) {
		let {yerel} = app.params, tip2SonDRaporRec = yerel.tip2SonDRaporRec = yerel.tip2SonDRaporRec || {}
		let raporKod = this.class.getRaporKod(e.rapor), id = raporKod ? this.id : null
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
		let {pTanim} = this.class, {sayac: id, satirListe} = this;
		let result = { ...this, id, satirListe };
		let keys = Object.keys(pTanim); for (let key of keys) {
			let value = this[key]
			// value = value?.kod ?? value
			value = value?.deepCopy?.() ?? value
			if (typeof value == 'object' && !value?.deepCopy) { value = $.extend(true, {}, value) }
			if (value !== undefined) { result[key] = value }
		}
		let removeKeys = ['_p', '_supers', '_temps', 'ayrimlar', 'ozelSahalar', 'okunanHarSayac', 'sayac', 'eskiSeq'];
		for (let key of removeKeys) { delete result[key] }
		return result
	}
	get satirListe() {
		let {satirListeStr: result} = this;
		return result?.length ? result.split(',').filter(x => !!x).map(x => asInteger(x.trim()) - 1) : []
	}
	set satirListe(value) {
		this.satirListeStr = value?.length ?
			value.filter(x => x != null).map(x => x + 1).sort().join(', ') : ''
	}
	get secimler() {
		let {hesapTipi, shStokHizmet, tip2Secimler} = this
		if (hesapTipi?.secilen == null) { return null }
		let {hizmetmi, ekBilgi: { querymi, hareketcimi, harSinif } = {}} = hesapTipi
		let tip = (
			querymi
				? hareketcimi && !harSinif?.ticarimi ? hesapTipi.kod
				: shStokHizmet?.kod : hizmetmi ? 'H'
			: null
		);
		return tip2Secimler[tip]
	}
	get secimlerStr() {
		let result = [], {secimler} = this
		if (secimler) {
			let {grupListe} = secimler
			for (let [tip, sec] of secimler) {
				let e = { liste: [] }; sec.ozetBilgiHTMLOlustur?.(e)
				let {liste} = e; if (!liste.length) { continue }
				let {etiket, grupKod} = sec, html = ''
				if (grupKod) { etiket = grupListe[grupKod].aciklama || etiket }
				html = liste.join('');  // .replace('float-left', '');
				if (etiket) {
					html = changeTagContent(html,
						`<span class="bold gray etiket">${etiket}:</span> <span class="veri">${getTagContent(html)}</span>`)
				}
				result.push(html)
			}
		}
		return result.length ? `<div class="secimBilgi flex-row">${result.join('')}</div>` : ''
	}
	get asFormul() {
		let {hesapTipi} = this
		/*if (hesapTipi.satirlarToplamimi) {
			return (({ det, attr, recs, ind2Rec, parentRec }) => {
				let {satirListe} = det, detaylar = parentRec?.detaylar ?? [];
				let topRecs = satirListe.map(i => ind2Rec[i]).filter(x => x != null);
				if (!topRecs.length) { return null }
				return roundToBedelFra(topla(rec => rec?.[attr] ?? 0, topRecs))
			})
		}
		else*/
		if (hesapTipi?.formulmu) { return this.formul }
		return null
	}
	get asRaporQuery() {
		let uni = new MQUnionAll(), stm = new MQStm({ sent: uni })
		let e = { stm, uni }; this.raporQueryDuzenle(e)
		return e.stm
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
			/* shAlmSat: new PInstTekSecim('shalmsat', AlimSatis),*/ shIade: new PInstTekSecim('shiade', NormalIadeVeBirlikte),
			shAyrimTipi: new PInstTekSecim('shayrimtipi', SBTabloAyrimTipi),
			formul: new PInstStr(''), satirListeStr: new PInstStr('satirlistestr'),
			cssClassesStr: new PInstStr('cssclasses'), cssStyle: new PInstStr('cssstyle')
		})
	}
	secimlerOlustur(e) {
		let tip2Secimler = this.tip2Secimler = e.tip2Secimler ?? {}
		let tip2SecimMFYapi = {
			/*S: { mst: DMQStok, grup: DMQStokGrup, anaGrup: DMQStokAnaGrup, istGrup: DMQStokIstGrup, tip: DMQStokTip },
			H: { mst: DMQHizmet, grup: DMQHizmetGrup, anaGrup: DMQHizmetAnaGrup, istGrup: DMQHizmetIstGrup, muhHesap: DMQMuhHesap },
			[KasaHareketci.kisaKod]: { mst: DMQKasa, grup: DMQKasaGrup },
			[BankaMevduatHareketci.kisaKod]: { mst: DMQBankaHesap, grup: DMQBankaHesapGrup }*/
		}
		$.extend(e, { tip2Secimler, tip2SecimMFYapi })
		let harSiniflar = SBTabloHesapTipi.kaListe.map( ({ ekBilgi }) => ekBilgi?.harSinif ).filter(x => x)
		{
			for (let harSinif of harSiniflar)
				harSinif.maliTablo_secimlerYapiOlustur(e)
			tip2Secimler = e.tip2Secimler
			tip2SecimMFYapi = e.tip2SecimMFYapi
		}
		let tip2EkWhereDuzenleyici = {
			/*[KasaHareketci.kisaKod]: ({ raporTanim, secimler: sec, where: wh }) => { debugger },
			[BankaMevduatHareketci.kisaKod]: ({ raporTanim, secimler: sec, where: wh }) => { debugger }*/
		};
		for (let [tip, yapi] of Object.entries(tip2SecimMFYapi)) {
			if (empty(yapi))
				continue
			let secimler = tip2Secimler[tip]
			if (secimler)
				continue
			secimler = tip2Secimler[tip] = e.secimler = new Secimler()
			$.extend(secimler, { secimEkWhereDuzenle: tip2EkWhereDuzenleyici[tip] })
			secimler.beginUpdate()
			SBRapor_Main.maliTablo_basSecimlerDuzenle({ ...e, secimler })
			for (let [key, mfSinif] of Object.entries(yapi)) {
				let {kodListeTipi: grupKod, sinifAdi: grupAdi, adiKullanilirmi} = mfSinif
				secimler.grupEkle(grupKod, grupAdi);
				secimler.secimEkle(`${key}Kod`, new SecimString({ etiket: 'Kod', mfSinif, grupKod }))
				if (adiKullanilirmi)
					secimler.secimEkle(`${key}Adi`, new SecimOzellik({ etiket: 'Adı', grupKod }))
			}
			secimler.endUpdate()
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(...[
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 30 }).noSql(),
			new GridKolon({ belirtec: 'seviyeno', text: 'Seviye', genislikCh: 15 }).noSql().tipTekSecim({ tekSecimSinif: SBTabloSeviye }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'bnegated', text: 'Ters?', genislikCh: 10 }).noSql().tipBool(),
			new GridKolon({ belirtec: 'hesaptipi', text: 'Hesap Tipi', genislikCh: 30 }).noSql().tipTekSecim({ tekSecimSinif: SBTabloHesapTipi }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shveritipi', text: 'Veri Tipi', genislikCh: 30 }).noSql().tipTekSecim({ tekSecimSinif: SBTabloVeriTipi }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shstokhizmet', text: 'Stok/Hizmet', genislikCh: 15 }).noSql().tipTekSecim({ tekSecimSinif: SBTabloStokHizmet }).kodsuz().listedenSecilemez(),
			/*new GridKolon({ belirtec: 'shalmsat', text: 'S/H Alım-Satış', genislikCh: 15 }).noSql().tipTekSecim({ tekSecimSinif: AlimSatis }).kodsuz().listedenSecilemez(),*/
			new GridKolon({ belirtec: 'shiade', text: 'S/H İADE', genislikCh: 15 }).noSql().tipTekSecim({ tekSecimSinif: NormalIadeVeBirlikte }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shayrimtipi', text: 'S/H Ayrım', genislikCh: 15 }).noSql().tipTekSecim({ tekSecimSinif: SBTabloAyrimTipi }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'satirlistestr', text: 'Satır Liste', genislikCh: 20 }).noSql(),
			new GridKolon({ belirtec: 'formul', text: 'Özel Formül', genislikCh: 150 }).noSql(),
			new GridKolon({ belirtec: 'cssclasses', text: 'CSS Sınıfları', genislikCh: 50 }).noSql(),
			new GridKolon({ belirtec: 'cssstyle', text: 'CSS Verisi', genislikCh: 150 }).noSql()
		])
	}
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments); let {okunanHarSayac: id} = this
		id ||= newGUID(); $.extend(hv, { id })
		let {hesapTipi: { formulmu, ekBilgi: { querymi } = {} } = {}} = this
		if (!(querymi || formulmu)) { hv.bnegated = false }
	}
	setValues({ rec }) {
		super.setValues(...arguments)
		/* $.extend(this, { satirListeStr }) */
	}
	inExp_hostVarsDuzenle(e) {
		super.inExp_hostVarsDuzenle(e); let {hv} = e
		let {asObject: secimlerData} = this.secimler ?? {}
		if (!empty(secimlerData)) { hv.secimler = secimlerData }
	}
	inExp_setValues({ rec, rec: { secimler: secimlerData } }) {
		super.inExp_setValues(...arguments); let {secimler} = this
		if (secimler) { secimler.readFrom({ liste: secimlerData }) }
	}
	raporQueryDuzenle(e) {
		let det = e.det = this, {aciklama, hesapTipi = {}, veriTipi = {}, shStokHizmet, secimler: detSecimler} = this
		let {ekBilgi: { querymi, hareketcimi, harSinif, harSinif: { ticarimi } } = {}} = hesapTipi
		if (!querymi)
			return
		
		let {detayli, raporTanim, subeKodlari, sentDuzenle: genelSentDuzenle, yatayAnalizVarmi, yatayAnaliz} = e
		let {rapor, rapor: { tabloYapi, sahaAlias: bedelAlias } = {}, secimler = rapor?.secimler, donemBS = rapor.tarihBS} = e
		if ($.isPlainObject(donemBS))
			donemBS = new CBasiSonu(donemBS)
		let durum = e.durum = {
			stokmu: querymi && (!hareketcimi || ticarimi) && (shStokHizmet.birliktemi || shStokHizmet.stokmu),
			hizmetmi: hesapTipi.hizmetmi || (querymi && (!hareketcimi || ticarimi) && (shStokHizmet.birliktemi || shStokHizmet.hizmetmi))
		}
		let {stokmu, hizmetmi, birliktemi} = durum
		if (hareketcimi && !ticarimi) {
			/* question: stokmu, hizmetmi, ... */
			durum[hesapTipi.question] = true
		}
		else if (ticarimi && shStokHizmet.birliktemi)
			durum.stokmu = durum.hizmetmi = true
		let {ekBilgi = {}, donemTipi} = veriTipi
		let {sentUygunluk, sentDuzenle: icerikSentDuzenle} = ekBilgi
		let sumSahalar = asSet([bedelAlias, 'fmalhammadde', 'fmalmuh', 'malhammadde', 'malmuh'])
		$.extend(e, {
			rapor, raporTanim, aciklama, hesapTipi, veriTipi, shStokHizmet, hareketcimi, maliTablomu: true,
			bedelAlias, donemTipi, donemBS, secimler, detSecimler, sumSahalar
		})
		if (detSecimler) {
			detSecimler.whereBlockListe = []
			detSecimler.whereBlockEkle(({ secimler: sec, where: wh, stokmu, hizmetmi, querymi, hareketcimi, harSinif }) =>
				sec.secimEkWhereDuzenle?.({ ...e, secimler: sec, where: wh, harSinif }))
			; {
				(secimler = secimler.deepCopy()).beginUpdate()
				$.extend(secimler.liste, { ...detSecimler.liste })
				let whereBlockListe = secimler.whereBlockListe ??= []
				let {whereBlockListe: detWhereBlockListe} = detSecimler
				if (detWhereBlockListe)
					whereBlockListe.push(...detWhereBlockListe)
				secimler.endUpdate()
			}
		}
		for (let [selector, flag] of Object.entries(durum)) {
			if (!flag)
				continue
			for (let _selector of Object.keys(durum))
				delete e[_selector]
			e[selector] = flag
			if (!(sentUygunluk == null || sentUygunluk?.call(this, e)))
				continue
			if (hareketcimi)
				this.raporQueryDuzenle_hareketci(e)
		}
		let {stm, uni} = e
		if (!uni?.liste?.length)
			return this
		let {defHV, harHVListe} = e    // raporQueryDuzenle_hareketci() tarafından oluşturulması bekleniyor
		{
			let sahaAliases = Object.values(tabloYapi?.toplam).map(({ colDefs = [] }) =>
				colDefs.map(_ => _.belirtec)).flat()
			for (let i = 0; i < uni.liste.length; i++) {
				let sent = uni.liste[i], hv = { ...defHV, ...harHVListe?.[i] }, basitHV
				{
					let {alias2Deger} = sent, {shTipi: shTipiClause} = alias2Deger
					if (shTipiClause) {
						let shTipiStr = shTipiClause.replaceAll(`'`, '')
						$.extend(e, { stokmu: shTipiStr == 'S', hizmetmi: shTipiStr == 'H' })
					}
					basitHV = alias2Deger
					$.extend(hv, { ...basitHV })
				}
				let {where: wh, sahalar} = sent
				let donemBSVarmi = e.donemBSVarmi = donemBS?.bosDegilmi ?? false
				if (donemBSVarmi) {
					let tarihBS = e.tarihBS = donemBS.deepCopy(); if (donemTipi) {
						tarihBS.basi = null
						if (donemTipi == 'B')
							tarihBS.sonu = donemBS.basi.clone().addDays(-1)
					}
					wh.basiSonu(tarihBS, (hv.tarih || 'fis.tarih'))
				}
				if (subeKodlari?.length)
					wh.inDizi(subeKodlari, (hv.bizsubekod || 'fis.bizsubekod'))
				wh.add(`${hv.ozelisaret ?? 'fis.ozelisaret'} <> 'X'`)
				sent.sahalarReset()
				$.extend(e, { sent, where: wh, sahalar, hv })
				if (detayli) {
					let {sahalar} = sent
					for (let [alias, deger] of Object.entries(basitHV)) {
						if (!sumSahalar[alias])
							sahalar.add(`${deger} ${alias}`)
					}
				}
				icerikSentDuzenle?.call(this, e)
				sent = e.sent; wh = sent.where
				{
					let alias2Deger = e.alias2Deger = sent.alias2Deger
					$.extend(hv, { ...alias2Deger })
					for (let sahaAlias of sahaAliases)
						// detaylı ise orj hv değerini override yap, toplam ise sadece yoksa ekle
						if (!alias2Deger[sahaAlias])
							sahalar.add(`0 ${sahaAlias}`)
				}
				if (detSecimler) {
					if (hareketcimi && harSinif) {
						let mstYapi = e.mstYapi = harSinif.mstYapi
						let mstClause = e.mstClause = hv[mstYapi.hvAlias]
						harSinif.maliTablo_secimlerSentDuzenle(e)
					}
				}
				if (yatayAnalizVarmi && !yatayAnaliz.dbmi) {
					let {ekBilgi = {}} = yatayAnaliz, {zorunluKodAttr: kodAttr} = ekBilgi
					/*let kodClause = hv[kodAttr]
					e.yatayAlias = hareketcimi && kodClause ? MQAliasliYapi.getDegerAlias(kodClause) : null*/
					e.kodClause = hv[kodAttr]
					ekBilgi.sentDuzenle?.(e)
				}
				genelSentDuzenle?.call(this, e)
				sent.groupByOlustur().gereksizTablolariSil()
			}
		}
		return this
	}
	raporQueryDuzenle_hareketci(e) {
		// detayli için attr ve sum düzenlemesi
		let det = this, {raporTanim, rapor, secimler, bedelAlias, sumSahalar} = e
		let {donemTipi, detayli, yatayAnalizVarmi, yatayAnaliz, stokmu, hizmetmi} = e
		let {hesapTipi = {}, veriTipi = {}, shStokHizmet, ozelAttrListe, ekAttrListe = []} = e
		let {ekBilgi: { harSinif, harEkDuzenle } = {}} = hesapTipi
		if (!harSinif)
			return this
		let {mstYapi: { hvAlias } = {}} = harSinif
		let sabitAttrListe = [], aliasListe = []
		if (ozelAttrListe)
			aliasListe.push(...ozelAttrListe)
		else {
			sabitAttrListe.push(
				'tarih', 'seri', 'fisno', 'fisnox', 'islkod',
				'bizsubekod', 'ozelisaret', 'shTipi',
				'fmalhammadde', 'fmalmuh', 'malhammadde', 'malmuh'
			)
			aliasListe.push('ba', bedelAlias, ...ekAttrListe)
		}
		if (hvAlias)
			sabitAttrListe.push(hvAlias)
		if (yatayAnalizVarmi && !yatayAnaliz.dbmi) {
			let {ekBilgi: { zorunluKodAttrListe } = {}} = yatayAnaliz
			if (zorunluKodAttrListe?.length)
				sabitAttrListe.push(...zorunluKodAttrListe)
		}
		let harHVListe = e.harHVListe = []
		let har = new harSinif().withAttrs([...sabitAttrListe, ...aliasListe])
		e.maliTablo = har.maliTablo = {
			raporTanim, det, rapor, secimler, bedelAlias,
			yatayAnalizVarmi, yatayAnaliz
		}
		let {ekBilgi: { harEkDuzenle: harEkDuzenle2 } = {}} = veriTipi
		if (harEkDuzenle)
			har.addEkDuzenleyici(args => harEkDuzenle.call(this, ...args))
		if (harEkDuzenle2)
			har.addEkDuzenleyici(args => harEkDuzenle2.call(this, ...args))
		let {attrSet} = har, {varsayilanHV: defHV} = har.class
		e.stm ??= new MQStm({ sent: new MQUnionAll() })
		let {stm} = e, uni = e.uni = stm.sent
		let harUni = har.uniOlustur({ ...e, rapor, secimler })
		for (let harSent of harUni) {
			let {alias2Deger: hv} = harSent
			let sent = harSent.deepCopy()
			let addClause = (...aliases) => {
				for (let alias of aliases) {
					if ($.isArray(alias)) {
						addClause(...alias)
						continue
					}
					let clause = hv[alias]
					if (!clause)
						continue
					if (!detayli && sumSahalar[alias])
						clause = clause.asSumDeger()
					let saha = `${clause} ${alias}`
					sent.sahalar.add(saha)
				}
			}
			harHVListe.push(hv)
			// if (!detayli) {
			sent.sahalarReset()
			addClause(...aliasListe)
			//}
			if (sent.sahalar.liste.length)
				uni.add(sent)
		}
		$.extend(e, { har, defHV, attrSet })
		return this
	}
	async hareketKartiGoster({ rapor, raporTanim }) {
		e = { ...arguments[0] }
		let {sahaAlias: bedelAlias, yatayDegerler, yatayDegerSet, secimler, secimler: { tarihBS: donemBS }} = rapor
		let {yatayAnalizVarmi, yatayAnaliz, yatayAnaliz: { aciklama: yatayEtiket, ekBilgi: { zorunluKodAttrListe: yatayAttrListe } = {} } = {}} = raporTanim
		let yatayDBmi = e.yatayDBmi = yatayAnalizVarmi && yatayAnaliz.dbmi
		let {hesapTipi: { ekBilgi: { hareketcimi, harSinif } = {} }} = this
		let {veriTipi: { ekBilgi: { bakiyemi, borcmu, alacakmi } = {} }} = this
		if (!(rapor && hareketcimi && harSinif))
			return
		let {dRapor: { konsolideCikti: konsolide, ekDBListe} = {}} = app.params
		let {mstYapi} = harSinif, {hvAlias: mstAlias} = mstYapi ?? {}
		let donemBSVarmi = !!donemBS?.basi
		konsolide &&= ekDBListe?.length > 0
		let filtreYatayDegerSet
		if (yatayAnalizVarmi && !empty(yatayDegerler)) {
			let cls = DMQKA, {kodSaha, adiSaha} = cls
			let colDefs = cls.orjBaslikListesi.filter(_ => _.belirtec != kodSaha)
			{
				let _ = colDefs.find(_ => _.belirtec == adiSaha)
				$.extend(_, { text: yatayEtiket, genislikCh: null })
			}
			let recs = yatayDegerler.map(_ => new CKodVeAdi([_, _]))
			let promise = new $.Deferred()
			let rfb = new RootFormBuilder().addCSS('yataySecim masterListe part')
			let headerHeight = 70, gridPart
			rfb.addIslemTuslari('islemTuslari')
				.addCSS('absolute')
				.addStyle_fullWH(null, headerHeight)
				.addStyle(
					`$elementCSS .butonlar.part { background: transparent !important; pointer-events: none }
					 $elementCSS .butonlar.part > .sag { pointer-events: auto }`
				)
				.setTip('tamamVazgec')
				/*.setEkSagButonlar('yazdir', 'html', 'excel')
				.setButonlarIlk([
					{ id: 'sec', handler: () => {
						let {selectedRecs: recs} = gridPart, values = recs?.map(_ => _.kod) ?? []
						promise?.resolve({ sender: gridPart, recs, values })
						wnd.jqxWindow('close')
					} }
				])*/
				.setId2Handler({
					// tazele: ({ builder: { rootPart } }) => gridPart?.tazele(),
					tamam: () => {
						let {selectedRecs: recs} = gridPart, values = recs?.map(_ => _.kod) ?? []
						promise?.resolve({ sender: gridPart, recs, values })
						wnd.jqxWindow('close')
					},
					vazgec: () => wnd.jqxWindow('close')
				})
				/*.addStyle(
					`$elementCSS .butonlar.part { position: relative; top: 10px; z-index: 100 }
					 $elementCSS .butonlar.part  button { margin: 0 0 0 10px }
					 $elementCSS .butonlar.part .sol { z-index: -1; background-color: unset !important; background: transparent !important }
					 $elementCSS .butonlar.part #excel { margin-right: 30px }
					 $elementCSS .butonlar.part button.jqx-fill-state-normal { background-color: whitesmoke !important }
					 $elementCSS .butonlar.part button.jqx-fill-state-pressed { background-color: royalblue !important }`
				)*/
			let fbd_content = rfb.addFormWithParent('content').altAlta()
				.addStyle_fullWH()
				.addStyle(`$elementCSS { margin-top: 5px }`)
				// .addStyle_fullWH(null, `calc(var(--full) - ${headerHeight}px + 5px)`)
			fbd_content.addGridliGosterici('grid').addStyle_fullWH()
				.rowNumberOlmasin().notAdaptive()
				.setTabloKolonlari(colDefs).setSource(recs)
				.widgetArgsDuzenleIslemi(({ args }) => $.extend(args, { columnsResize: false, showFilterRow: true, selectionMode: 'checkbox', columnsHeight: 18 }))
				/*.veriYukleninceIslemi(() => {
					let {recs, gridWidget: w} = gridPart
					for (let i = 0; i < recs.length; i++)
						w.selectrow(i)
				})*/
				.onAfterRun(({ builder: { part } }) => gridPart = part)
			let wnd = createJQXWindow({
				isModal: true, autoOpen: false,
				content: rfb.layout, title: 'Yatay Seçim',
				args: {
					isModal: true, closeButtonAction: 'close',
					width: Math.min($(window).width() - 100, 600),
					height: Math.min($(window).height() - 30, 600),
				}
			})
			wnd.on('close', evt => {
				rfb?.destroyPart()
				wnd?.jqxWindow('destroy')
				promise?.resolve(null)
			})
			wnd.jqxWindow('open')
			rfb.setLayout(wnd.find('.jqx-window-content .subContent'))
			rfb.run()
			let {values} = await promise ?? {}
			if (!values)
				return
			filtreYatayDegerSet = values?.length ? asSet(values) : null
		}
		let ekAttrListe = [
			'tarih', 'fisnox', 'anaislemadi', 'islkod', 'islemadi',
			mstAlias, 'mstadi', 'refkod', 'refadi', 'takipno'
		].filter(x => !!x)
		let {sqlNull, sqlEmpty} = Hareketci_UniBilgi.ortakArgs
		let sentDuzenle = ({ alias2Deger: hv, sent, sent: { from, where: wh, sahalar, alias2Deger } }) => {
			if (mstAlias) {
				let kodClause = hv[mstAlias]
				if (kodClause) {
					sahalar.add(`${kodClause} mstkod`)
					mstYapi.duzenle({ kodClause, sent })
				}
			}
			if (filtreYatayDegerSet && !yatayDBmi) {
				// yatayDegerler; yatayAttrListe
				wh.inDizi(Object.keys(filtreYatayDegerSet), alias2Deger.yatay)
			}
			{
				let {takipno: clause} = alias2Deger
				if (MQSQLOrtak.sqlBosDegermi(clause)) {
					for (let alias of ['takipadi', 'takipgrupkod', 'takipgrupadi'])
						sahalar.add(`${sqlEmpty} ${alias}`)
				}
				else {
					if (!from.aliasIcinTable('tak'))
						sent.fromIliski('takipmst tak', `${clause} = tak.kod`)
					if (!from.aliasIcinTable('tgrp'))
						sent.fromIliski('takipgrup tgrp', 'tak.grupkod = tgrp.kod')
					sahalar.add('tak.aciklama takipadi', 'tak.grupkod takipgrupkod', 'tgrp.aciklama takipgrupadi')
				}
			}
		}
		$.extend(e, { konsolide, detayli: true, detay: this, ekAttrListe, sentDuzenle })
		let cls = class extends MQCogul {
			static get kodListeTipi() { return harSinif.kod } static get sinifAdi() { return `${harSinif.aciklama} Hareket Kartı` }
			static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get secimSinif() { return null }
			static get raporKullanilirmi() { return false } static get tumKolonlarGosterilirmi() { return true }
			static orjBaslikListesi_gridInit({ sender: gridPart }) {
				super.orjBaslikListesi_gridInit(...arguments)
			}
			static orjBaslikListesi_argsDuzenle({ args }) {
				super.orjBaslikListesi_argsDuzenle(...arguments)
				$.extend(args, {
					showGroupsHeader: true, showStatusBar: true,
					showAggregates: true, showGroupAggregates: true, groupsExpandedByDefault: true
				})
			}
			static ekCSSDuzenle({ rec, dataField: belirtec, value, result }) {
				super.ekCSSDuzenle(...arguments);
				if (asBool(rec.bdevredisi)) { result.push('bg-lightgray', 'iptal', 'firebrick') }
				if (value && typeof value == 'number') {
					let negative = value < 0
					// if (rec.ba == 'A') { negative = !negative }
					result.push('bold', negative ? 'firebrick' : 'forestgreen')
				}
				else if (belirtec == 'ba') {
					result.push('bold', 'center', value == 'A' ? 'bg-lightred' : 'bg-lightgreen')
				}
			}
			static orjBaslikListesiDuzenle({ liste }) {
				super.orjBaslikListesiDuzenle(...arguments)
				liste.push(...[
					new GridKolon({ belirtec: 'bizsubekod', text: 'Şube', filterType: 'checkedlist' }),
					new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 12 }).tipTarih(),
					new GridKolon({ belirtec: 'fisnox', text: 'Belge No', genislikCh: 19 }).alignRight(),
					(yatayAnalizVarmi ? new GridKolon({ belirtec: 'yatay', text: yatayEtiket || 'Çapraz', genislikCh: 13, filterType: 'checkedlist' }) : null),
					new GridKolon({ belirtec: bedelAlias, text: 'Bedel', genislikCh: 17, aggregates: ['sum'] }).tipDecimal_bedel(),
					new GridKolon({ belirtec: 'ba', text: 'B/A', genislikCh: 5, filterType: 'checkedlist' }),
					new GridKolon({ belirtec: 'mstkod', text: 'Kod', genislikCh: 15 }),
					new GridKolon({ belirtec: 'mstadi', text: 'Açıklama' }),
					new GridKolon({ belirtec: 'refkod', text: 'Ref. Kod', genislikCh: 15 }),
					new GridKolon({ belirtec: 'refadi', text: 'Ref. Adı' }),
					// ...yatayAttrListe?.map(belirtec =>  new GridKolon({ belirtec, text: belirtec, genislikCh: 25 }) ) ?? [],
					new GridKolon({ belirtec: 'islemadi', text: 'İşlem Adı', filterType: 'checkedlist' }),
					new GridKolon({ belirtec: 'anaislemadi', text: 'Ana İşlem', filterType: 'checkedlist' }),
					new GridKolon({ belirtec: 'takipgrupkod', text: 'Takip Grup', filterType: 'checkedlist' }),
					new GridKolon({ belirtec: 'takipgrupadi', text: 'T.Grup Adı', filterType: 'checkedlist' }),
					new GridKolon({ belirtec: 'takipno', text: 'Takip No', filterType: 'checkedlist' }),
					new GridKolon({ belirtec: 'takipadi', text: 'Takip Adı', filterType: 'checkedlist' })
				].filter(x => !!x))
			}
			static async loadServerDataDogrudan({ sender: { grid }}) {
				let {gridPart} = rapor, {filtreTokens: saved_filtreTokens} = gridPart
				gridPart.filtreTokens = null
				let _e = { ...arguments[0], ...e }
				try { return await rapor.loadServerData(_e) }
				catch (ex) { console.error(ex); hConfirm(getErrorText(ex)); return [] }
				finally { gridPart.filtreTokens = saved_filtreTokens }
			}
			static orjBaslikListesi_recsDuzenle({ recs }) {
				super.orjBaslikListesi_recsDuzenle(...arguments)
				// donemBSVarmi; donemBS; bakiyemi; borcmu; alacakmi
				let newRecs = []
				for (let rec of recs) {
					let {bedel, ba, yatay} = rec
					if (!bedel)
						continue
					if (yatayDBmi && filtreYatayDegerSet && !filtreYatayDegerSet[yatay])
						continue
					//if (ba == 'A')
					//	bedel = rec.bedel = -bedel
					newRecs.push(rec)
				}
				return newRecs
			}
			static gridVeriYuklendi({ sender: { grid } }) {
				super.gridVeriYuklendi(...arguments)
				let {lastGroups: groups} = this
				if (!groups && yatayAnalizVarmi)
					groups = ['yatay']
				grid.jqxGrid('groups', groups ?? [])
				this.lastGroups = groups
			}
		}
		let result = cls.listeEkraniAc()
		return { harSinif, rapor, detay: this, ...result }
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
		if (rec.tersIslemmi)
			result.push(belirtec == 'tersIslemmi' ? 'bg-lightred' : 'orangered')
		switch (belirtec) {
			case 'secimlerStr': result.push('flex-row'); break
		}
		return result.join(' ')
	}
	tabloKolonlariDuzenle_ilk(e) {
		super.tabloKolonlariDuzenle_ilk(e); let {tabloKolonlari: liste} = e
		let cellClassName = (sender, rowIndex, belirtec, value, rec) => {
			let _e = { sender, rowIndex, belirtec, value, rec, result: [] };
			return this.ekCSSDuzenle(_e)
		};
		let cellsRenderer = (colDef, rowIndex, belirtec, value, html, jqxCol, rec, result) => {
			html = result ?? html; rec ??= {};
			let {shStokHizmet: { birliktemi: shBirliktemi } = {}} = rec;
			let {hesapTipi: { ekBilgi: { querymi, hareketcimi, formulmu } = {} } = {}} = rec;
			let clear = () => html = changeTagContent(html, '');
			switch (belirtec) {
				case 'veriTipi':
					if (!querymi) { clear() }
					break
				// case 'tersIslemmi': html = ''; break
				case 'shStokHizmet': /*case 'shAlmSat':*/
				case 'shIade': case 'shAyrimTipi':
					if (!(querymi && hareketcimi)) { clear() }
					break
				case '_secimler':
					if (!querymi || (!hareketcimi && shBirliktemi)) { clear() }
					break
				case 'formul':
					if (!formulmu) { clear() } break
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
			/*new GridKolon({ belirtec: 'shAlmSat', text: 'S/H Alım-Satış', genislikCh: 15, cellClassName, cellsRenderer }).tipTekSecim({ tekSecimSinif: AlimSatis }).kodsuz().listedenSecilemez(),*/
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
		let { hesapTipi, hesapTipi: { ekBilgi: { querymi } = {} }, veriTipi } = det;
		if (hesapTipi.secilen == null || hesapTipi.bosmu) { return `<b class=firebrick>Hesap Tipi</b> boş olamaz` }
		if (querymi && (veriTipi.secilen == null || veriTipi.yokmu)) { return `<b class=firebrick>Veri Tipi</b> boş olamaz` }
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
				let {hesapTipi: { altSeviyeToplamimi, satirlarToplamimi, formulmu, ekBilgi: { querymi } = {} } = {}} = fbd.altInst
				return querymi || formulmu ? true : 'jqx-hidden'
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
				let {altInst: det} = fbd, {hesapTipi, veriTipi} = det;
				return SBTabloVeriTipi.kaListe.filter(({ ekBilgi }) =>
					ekBilgi?.gosterimUygunluk?.call(this, { ...e, det, hesapTipi, veriTipi }))
			}))
			.setVisibleKosulu(({ builder: fbd }) => {
				let {hesapTipi: { ekBilgi: { querymi } = {} } = {}} = fbd.altInst;
				return querymi ? true : 'jqx-hidden'
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
			.setVisibleKosulu(({ builder: fbd }) => fbd.altInst.hesapTipi.altSeviyeToplamimi ? true : 'jqx-hidden');
		form.addForm().setLayout(() => $(`<h5 class=forestgreen style="padding: 10px">Alt Seviyeler Toplanır</h5>`)).autoAppend();
		
		form = fbd_altForm.addFormWithParent('altForm_ticariSatis').altAlta()
			.setVisibleKosulu(({ builder: { altInst: { hesapTipi: { ekBilgi: { querymi, hareketcimi, harSinif } = {} } } } }) =>
				querymi && (!hareketcimi || harSinif?.ticarimi) ? true : 'jqx-hidden');
		altForm = form.addFormWithParent().yanYana()
		altForm.addModelKullan('shStokHizmet', 'Stok/Hizmet')
			.dropDown().noMF().autoBind().kodsuz().bosKodAlinmaz().listedenSecilmez()
			.setSource(SBTabloStokHizmet.kaListe)
			.degisince(() => updateAltForm());
		/*altForm.addModelKullan('shAlmSat', 'Alım/Satış')
			.dropDown().noMF().autoBind().kodsuz().bosKodAlinmaz().listedenSecilmez()
			.setSource(AlimSatis.kaListe);*/
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
			.setVisibleKosulu(({ builder: fbd }) =>
				secimlerInitWithKosul(fbd, ({ hesapTipi: { ekBilgi: { querymi, hareketcimi } = {} }, shStokHizmet }) =>
					querymi && !hareketcimi && shStokHizmet.stokmu));
		// altForm.addForm().setLayout(() => $(`<div>Stok için seçimler</div>`)).autoAppend();
		// initSecimlerForm(altForm, 'ticSatis_stokSecimler', 'Stok');
		altForm = form.addFormWithParent('ticSatisSecimler_hizmet').altAlta()
			.setVisibleKosulu(({ builder: fbd }) =>
				secimlerInitWithKosul(fbd, ({ hesapTipi: { ekBilgi: { querymi } = {} }, shStokHizmet }) => querymi));
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
