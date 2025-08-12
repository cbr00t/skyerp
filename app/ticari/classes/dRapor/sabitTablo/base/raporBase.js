class SBRapor extends DGrupluPanelRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get aciklama() { return 'Mali Tablolar' }
	static get kategoriKod() { return 'SB' } static get kategoriAdi() { return 'Mali Tablolar' }
	static get chartVarmi() { return false } static get ozetVarmi() { return false }
	static get araSeviyemi() { return this == SBRapor }
}
class SBRapor_Main extends DAltRapor_TreeGrid {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get mainmi() { return true }
	get sahaAlias() { return 'bedel' } get tazeleYapilirmi() { return true } get noAutoColumns() { return true }
	static get raporTanimSinif() { return SBTablo } static get secimSinif() { return DonemselSecimler }
	get tabloYapi() {
		let {_tabloYapi: result} = this; if (result == null) {
			let _e = { result: new TabloYapi() }; this.tabloYapiDuzenle(_e); this.tabloYapiDuzenle_son(_e);
			this.tabloYapiDuzenle_ozel?.(_e); result = _e.result
		}
		return result
	}
	tabloYapiDuzenle({ result }) { result.addToplamBasit_bedel('BEDEL', 'Bedel', this.sahaAlias) }
	tabloYapiDuzenle_son({ result }) { }
	async tazele(e) {
		let {gridPart, raporTanim, _tabloTanimGosterildiFlag} = this, {grid, gridWidget} = gridPart;
		if (!raporTanim) {
			if (_tabloTanimGosterildiFlag) { hConfirm('<b>Rapor Tanımı</b> seçilmelidir') }
			else { this.raporTanimIstendi(e) }
			return
		}
		let _e = CObject.From(e);
		await super.tazele(_e);
		$.extend(_e, { liste: _e.tabloKolonlari ?? _e.kolonTanimlari ?? [], recs: gridWidget.getRows() });
		Object.defineProperty(_e, 'flatRecs', {
			get: function() { return this.recs.flatMap(rec => [rec, ...rec.detaylar]) }
		});
		for (let key of ['tabloKolonlari', 'kolonTanimlari']) { delete _e[key] }
		this.tabloKolonlariDuzenle(_e); this.tabloKolonlariDuzenle_ozel?.(_e);
		let colDefs = this.tabloKolonlari = _e.liste || [];
		let columns = colDefs.flatMap(colDef => colDef.jqxColumns);
		grid.jqxTreeGrid('columns', columns)
	}
	ekCSSDuzenle({ raporTanim, colDefs, colDef, rowIndex, belirtec, value, rec, result }) {
		rec ??= {}; let {cssClassesStr} = rec;
		if (cssClassesStr) { result.push(cssClassesStr) }
	}
	cellsRenderer({ raporTanim, colDefs, colDef, rowIndex, belirtec, value, html, jqxCol, rec }) {
		rec ??= {}; let {cssStyle} = rec;
		if (cssStyle) { return `<span style="${cssStyle}">${getTagContent(html)}</span>` }
	}
	tabloKolonlariDuzenle({ liste }) {
		super.tabloKolonlariDuzenle(...arguments);
		let {raporTanim, tabloYapi} = this, colDefs = liste;
		let cellClassName = (colDef, rowIndex, belirtec, value, rec) => {
			let result = ['treeRow', belirtec];
			if (rec) { result.push(rec.leaf ? 'leaf' : 'grup') }
			let toplammi = (typeof value == 'number');
			result.push(toplammi ? 'toplam' : 'icerik')
			if (toplammi) {
				let alacakmi = value < 0;
				result.push(!value ? 'zero' : alacakmi ? 'negative' : 'positive')
			}
			let {level} = rec; if (level != null) { result.push('level-' + level.toString()) }
			let _e = { raporTanim, colDefs, colDef, rowIndex, belirtec, value, rec, result };
			this.ekCSSDuzenle(_e); result = _e.result;
			return result.filter(x => !!x).join(' ')
		};
		let cellsRenderer = (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => {
			let {tip} = colDef;
			html = tip?.cellsRenderer?.(colDef, rowIndex, belirtec, value, html, jqxCol, rec) ?? html;
			let _e = { ...arguments[0], raporTanim, colDefs, colDef, rowIndex, belirtec, value, html, jqxCol, rec };
			let result = this.cellsRenderer(_e); result ??= _e.html;
			return result ?? html
		};
		liste.push(...[
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 50 }),
			...Object.values(tabloYapi.grup).map(({ colDefs }) => colDefs).flat(),
			...Object.values(tabloYapi.toplam).map(({ colDefs }) => colDefs).flat()
		]);
		for (let colDef of liste) { $.extend(colDef, { cellClassName, cellsRenderer }) }
	}
	async loadServerDataInternal(e) {
		await super.loadServerDataInternal(e);
		let rapor = this, {raporTanim, secimler, sahaAlias} = this, {detaylar} = raporTanim;
		// let {tarihBSVeyaCariDonem: donemBS} = secimler;
		let {tarihBS: donemBS} = secimler;
		let _e = { ...e, rapor, raporTanim, secimler, donemBS, detaylar };
		let id2Promise = {}, id2Detay = e.id2Detay = {};
		let formulYapilari = e.formulYapilari = {};
		for (let key of ['altSeviyeToplamimi', 'satirlarToplamimi']) { formulYapilari[key] = [] }
		for (let det of detaylar) {
			let {sayac: id, hesapTipi = {}, veriTipi} = det; id2Detay[id] = det;
			let {ekBilgi = {}} = hesapTipi, {ticarimi, hareketcimi, querymi} = ekBilgi, {donemTipi} = veriTipi;
			if (!querymi) {
				// satır toplam, formul, ... vs
				let {question: selector} = hesapTipi;
				if (selector) { formulYapilari[selector]?.push(det) }
				continue
			}
			let promise_recs = []; if (donemBS?.basi || donemTipi != 'B') {
				let uni = new MQUnionAll(), stm = new MQStm({ sent: uni });
				$.extend(_e, { stm, uni }); det.raporQueryDuzenle(_e); stm = _e.stm;
				if (!(stm?.with?.liste?.length || stm?.sent?.liste?.length)) { continue }
				stm = _e.stm = stm.asToplamStm();
				/*if (hareketcimi) {
					let {with: _with, sent: topSent} = stm, {alias2Deger: hv} = topSent;
					_with.add(topSent.asTmpTable('topbilgi'));
					let sent = stm.sent = new MQSent(), {sahalar} = sent;
					sent.fromAdd('topbilgi'); let {ba, [sahaAlias]: bedel} = hv;
					for (let key of ['ba', sahaAlias]) { delete hv[key] }
					for (let [alias, clause] of Object.entries(hv)) {
						sahalar.add(`${clause} ${alias}`) }
				}
				_e.stm = stm;*/
				promise_recs = app.sqlExecSelect(stm)
			}
			if (promise_recs != null) { id2Promise[id] = promise_recs }
		}
		let recs = [];
		for (let [id, promise] of Object.entries(id2Promise)) {
			let det = id2Detay[id]; if (!det) { continue }
			let _recs = await promise; if (!_recs?.length) { continue }
			let {aciklama} = det, bedel = topla(rec => rec[sahaAlias] || 0, _recs);
			let rec = { id, aciklama, bedel };
			recs.push(rec)
		}
		return recs
		/* return [ { aciklama: 'SONUÇ', detaylar: recs } ] */
	}
	async loadServerData_recsDuzenle_seviyelendir({ recs: sqlRecs, id2Detay }) {
		await super.loadServerData_recsDuzenle_seviyelendir(...arguments);
		let {tabloYapi} = this, attrListe = Object.values(tabloYapi.toplam).map(item => item.colDefs.map(({ belirtec }) => belirtec)).flat();
		let id2GridRec = {}; for (let [id, det] of Object.entries(id2Detay)) {
			let gridRec = id2GridRec[id] = {
				...det.asObject, detaylar: [], hesaplandimi: false,
				...Object.fromEntries(attrListe.map(attr => [attr, 0])),
				toplamReset() {
					for (let attr of attrListe) { this[attr] = 0 }
					return this
				},
				toplamaEkle(digerGridRec) {
					let {shIade, tersIslemmi: tersmi} = digerGridRec;
					if (shIade.iademi) { tersmi = !tersmi }
					for (let attr of attrListe) {
						let value = digerGridRec[attr];
						if (tersmi) { value = -value }
						this[attr] += value
					}
					return this
				},
				toplamOlustur() {
					let {detaylar} = this; if (!detaylar.length) { return this }
					this.toplamReset(); for (let det of detaylar) {
						det.toplamOlustur(); this.toplamaEkle(det) }
					return this
				}
			}
		}
		for (let rec of sqlRecs) {
			let {id} = rec, gridRec = id2GridRec[id];
			for (let attr of attrListe) { gridRec[attr] = rec[attr] ?? 0 }
			gridRec.hesaplandimi = true
		}
		let maxSevNo = 1, sev2Ust = {}, gridRecs = Object.values(id2GridRec);
		for (let gridRec of gridRecs) {
			let {seviyeNo: sevNo, sonuc, detaylar} = gridRec;
			sevNo = asInteger(sevNo?.char ?? sevNo) || 1;
			maxSevNo = Math.max(sevNo, maxSevNo);
			let ustSevNo = sevNo - 1; sev2Ust[sevNo] = gridRec;
			if (ustSevNo > 0) {
				let ustGridRec = sev2Ust[ustSevNo], {detaylar: ustDetaylar} = ustGridRec;
				// for (let attr of attrListe) { ustGridRec[attr] += gridRec[attr] }
				ustDetaylar.push(gridRec)
			}
		}
		let sevRecs = gridRecs.filter(rec => asInteger(rec?.seviyeNo?.char ?? rec?.seviyeNo) <= 1);
		for (let sev of sevRecs) {
			let {hesapTipi, satirListe, hesaplandimi} = sev; if (hesaplandimi) { continue }
			if (hesapTipi?.altSeviyeToplamimi) { sev.toplamOlustur() }
			else if (hesapTipi?.satirlarToplamimi && satirListe?.length) {
				sev.toplamReset(); for (let i of satirListe) {
					sev.toplamaEkle(gridRecs[i]) }
			}
			hesaplandimi = sev.hesaplandimi = true
		}
		return sevRecs
	}
	async loadServerData(e) {
		let sevRecs = await super.loadServerData(e); if (!sevRecs) { return sevRecs }
		let {id2Detay, formulYapilari, recs, ind2Rec} = e, {tabloYapi} = this;
		let attrListe = Object.values(tabloYapi.toplam).map(item => item.colDefs[0].belirtec);
		for (let parentRec of sevRecs)
			for (let formulDetaylar of Object.values(formulYapilari))
			for (let formul of formulDetaylar) {
				for (let attr of attrListe) {
					let value = await formul.eval({ ...e, det: formul, recs, sevRecs, parentRec, attr, ind2Rec });
					if (value != null) { parentRec[attr] = value }
				}
			}
		return sevRecs
	}
	raporTanimIstendi(e) {
		let {rapor, raporTanim} = this, {raporTanimSinif} = this.class;
		raporTanimSinif.listeEkraniAc({
			args: { rapor },
			converter: ({ rec }) => raporTanimSinif.oku({ id: rec.id }),
			veriYuklenince: ({ gridPart }) => {
				let {boundRecs: recs, gridWidget} = gridPart;
				let ind = recs.findIndex(({ id }) => id == raporTanim?.id);
				if (ind > -1) { gridWidget.selectrow(ind) }
			},
			secince: _e => this.raporTanimSecildi({ ...e, ..._e })
		});
		this._tabloTanimGosterildiFlag = true
	}
	async raporTanimSecildi(e) {
		let {rec, value} = e, rapor = e.rapor = this.rapor;
		let inst = this.raporTanim = await value;
		inst?.setDefault?.(e);
		this.tazele(e)
	}
}
