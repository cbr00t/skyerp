class SBRapor extends DGrupluPanelRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'SB' } static get kategoriAdi() { return 'Sabit' }
	static get chartVarmi() { return false } static get ozetVarmi() { return false }
	static get araSeviyemi() { return this == SBRapor }
}
class SBRapor_Main extends DAltRapor_TreeGrid {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get mainmi() { return true }
	get tazeleYapilirmi() { return true } get noAutoColumns() { return true }
	static get raporTanimSinif() { return SBTablo } static get secimSinif() { return DonemselSecimler }
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
	ekCSSDuzenle({ raporTanim, colDefs, colDef, rowIndex, belirtec, value, rec, result }) { }
	tabloKolonlariDuzenle({ liste }) {
		super.tabloKolonlariDuzenle(...arguments); let {raporTanim} = this, colDefs = liste;
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
		}
		liste.push(...[
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 50, cellClassName }),
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 20, cellClassName }).tipDecimal_bedel()
		])
	}
	async loadServerDataInternal(e) {
		await super.loadServerDataInternal(e);
		let rapor = this, {raporTanim, secimler} = this, {detaylar} = raporTanim;
		let {tarihBSVeyaCariDonem: donemBS} = secimler;
		let _e = { ...e, rapor, raporTanim, secimler, donemBS, detaylar };
		let id2Promise = {}, id2Detay = e.id2Detay = {};
		let formulYapilari = e.formulYapilari = {};
		for (let key of ['altSeviyeToplamimi', 'satirlarToplamimi']) { formulYapilari[key] = [] }
		for (let det of detaylar) {
			let {sayac: id, hesapTipi} = det; id2Detay[id] = det;
			let ekBilgi = hesapTipi.secilen?.ekBilgi ?? {}, {querymi} = ekBilgi;
			if (querymi) {
				let uni = new MQUnionAll(), stm = new MQStm({ sent: uni });
				$.extend(_e, { stm, uni }); det.raporQueryDuzenle(_e); stm = _e.stm;
				if (!(stm?.with?.liste?.length || stm?.sent?.liste?.length)) { continue }
				stm = _e.stm = stm.asToplamStm();
				id2Promise[id] = app.sqlExecSelect(stm)
			}
			else {
				let selector = hesapTipi.secilen?.question;
				if (selector) { formulYapilari[selector]?.push(det) }
			}
		}
		let recs = [], ind2Rec = e.ind2Rec = {}, i = 0;
		for (let [id, promise] of Object.entries(id2Promise)) {
			let det = id2Detay[id]; if (!det) { continue }
			let _recs = await promise; if (!_recs?.length) { continue }
			let {aciklama} = det, bedel = topla(rec => rec.bedel, _recs);
			let rec = { id, aciklama, bedel };
			recs.push(rec); ind2Rec[i++] = rec
		}
		return recs
		/* return [ { aciklama: 'SONUÇ', detaylar: recs } ] */
	}
	async loadServerData_recsDuzenle_seviyelendir({ recs, id2Detay }) {
		await super.loadServerData_recsDuzenle_seviyelendir(...arguments);
		let sevRecs = Object.values(id2Detay).map(det => ({ id: det.sayac, aciklama: det.aciklama, detaylar: [] }));
		return sevRecs
	}
	async loadServerData(e) {
		let sevRecs = await super.loadServerData(e); if (!sevRecs) { return sevRecs }
		let {id2Detay, formulYapilari, recs, ind2Rec} = e, attrListe = ['bedel'];
		for (let parentRec of sevRecs)
			for (let formulDetaylar of Object.values(formulYapilari))
			for (let det of formulDetaylar) {
				for (let attr of attrListe) {
					let value = await det.eval({ ...e, det, recs, sevRecs, parentRec, attr, ind2Rec });
					parentRec[attr] = value
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
