class SBTablo extends MQDetayliGUIDVeAdi {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sabitTablomu() { return true }
	static get kodListeTipi() { return 'SBTABLO' } static get sinifAdi() { return 'Sabit Tablo' }
	static get table() { return 'sbtablo' } static get tableAlias() { return 'fis' }
	static get detaySinif() { return SBTabloDetay } static get gridKontrolcuSinif() { return SBTabloGridci }
	static get kolonFiltreKullanilirmi() { return false } static get raporKullanilirmi() { return false }
	static get tumKolonlarGosterilirmi() { return true } static get gridHeight_bosluk() { return 90 }
	get satirListeStr() { let {satirliste: result} = this; return result?.length ? result.filter(x => !!x).join(',') : '' }
	set satirListeStr(value) { this.satirListe = result ? result.split(',').map(x => asInteger(x.trim())).filter(x => !!x) : [] }
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
		kaForm.yanYana();
		kaForm.builders = kaForm.builders.filter(fbd => fbd.id != 'kod');
		kaForm.id2Builder.aciklama.addStyle_wh('calc(var(--full) - 300px)');
		kaForm.addCheckBox('devreDisimi', 'Devre Dışı?').addStyle(
			`$elementCSS { margin-left: 10px } $elementCSS > label { color: firebrick !important } $elementCSS > input:checked + label { font-style: bold !important }`
		)
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
				let secim = secimler[key];
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
}
class SBTabloDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'sbtablodetay' }
	static get fisSayacSaha() { return 'fisid' } static get sayacSaha() { return 'id' }
	constructor(e) {
		e = e ?? {}; super(e); let {secimler} = this;
		secimler.beginUpdate().secimTopluEkle({
			test: new SecimOzellik({ etiket: 'TEST' })
		}).endUpdate()
	}
	static pTanimDuzenle({ pTanim }) {
		$.extend(pTanim, {
			seviyeNo: new PInstTekSecim('seviyeno', SBTabloSeviye), hesapTipi: new PInstTekSecim('hesaptipi', SBTabloHesapTipi),
			satirListe: new PInst({ init: () => [] }), shVeriTipi: new PInstTekSecim('shveritipi', SBTabloVeriTipi),
			shAlmSat: new PInstTekSecim('shalmsat', AlimSatis), shIade: new PInstTekSecim('shiade', NormalIadeVeBirlikte),
			shAyrimTipi: new PInstTekSecim('shayrimtipi', SBTabloAyrimTipi),
			cssClassesStr: new PInstStr('cssclasses'), cssStyle: new PInstStr('cssstyle'),
			secimler: new PInstClass(Secimler)
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); liste.push(...[
			new GridKolon({ belirtec: 'seviyeno', text:  'Seviye', genislikCh: 15 }).noSql().tipTekSecim({ tekSecimSinif: SBTabloSeviye }).kodsuz().listedenSecilemez(),
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
		let {okunanHarSayac: id, satirListeStr: satirlistestr} = this;
		id = id || newGUID();
		$.extend(hv, { id, satirlistestr: satirlistestr || '' })
	}
	setValues({ rec }) {
		super.setValues(...arguments);
		let {satirlistestr: satirListeStr} = rec
		$.extend(this, { satirListeStr })
	}
}
class SBTabloGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_ilk({ tabloKolonlari: liste }) {
		super.tabloKolonlariDuzenle_ilk(...arguments); liste.push(...[
			new GridKolon({ belirtec: 'seviyeNo', text:  'Seviye', genislikCh: 15 }).tipTekSecim({ tekSecimSinif: SBTabloSeviye }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shVeriTipi', text:  'Veri Tipi', genislikCh: 30 }).tipTekSecim({ tekSecimSinif: SBTabloVeriTipi }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'satirListeStr', text:  'Satır Liste', genislikCh: 20 }),
			new GridKolon({ belirtec: 'shAlmSat', text:  'S/H Alım-Satış', genislikCh: 15 }).tipTekSecim({ tekSecimSinif: AlimSatis }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shIade', text:  'S/H İADE', genislikCh: 15 }).tipTekSecim({ tekSecimSinif: NormalIadeVeBirlikte }).kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'shAyrimTipi', text:  'S/H Ayrım', genislikCh: 15 }).tipTekSecim({ tekSecimSinif: SBTabloAyrimTipi }).kodsuz().listedenSecilemez(),
		])
	}
	tabloKolonlariDuzenle_son({ tabloKolonlari: liste }) {
		super.tabloKolonlariDuzenle_son(...arguments);
		liste.push(...[
			new GridKolon({ belirtec: '_secimler', text:  ' ', genislikCh: 20 }).tipButton('Seçimler')
				.onClick(({ gridRec }) => {
					let {secimler} = gridRec, {activeWndPart: parentPart} = app;
					let part = secimler.duzenlemeEkraniAc({ parentPart: '', tamamIslemi: e => {} });
					$.extend(part, { parentPart });
					Object.defineProperty(part, 'canDestroy', { get: () => true })
				}),
			new GridKolon({ belirtec: 'cssClassesStr', text:  'CSS Sınıfları', genislikCh: 50 }),
			new GridKolon({ belirtec: 'cssStyle', text:  'CSS Verisi', genislikCh: 150 })
		])
	}
}
