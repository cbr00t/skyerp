class SBRapor extends DGrupluPanelRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'SB' } static get kategoriAdi() { return 'Sabit' }
	static get chartVarmi() { return false } static get ozetVarmi() { return false }
	static get araSeviyemi() { return this == SBRapor }
}
class SBRapor_Main extends DAltRapor_TreeGrid {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get mainmi() { return true }
	get tazeleYapilirmi() { return true } get noAutoColumns() { return true } static get raporTanimSinif() { return SBTablo }
	async tazele(e) {
		let {gridPart, raporTanim, _tabloTanimGosterildiFlag} = this, {grid, gridWidget} = gridPart;
		if (!raporTanim) {
			if (_tabloTanimGosterildiFlag) { hConfirm('<b>Rapor Tanımı</b> seçilmelidir') }
			else { this.raporTanimIstendi(e) }
			return
		}
		let _e = CObject.From(e); await super.tazele(_e);
		$.extend(_e, {
			liste: _e.tabloKolonlari ?? _e.kolonTanimlari ?? [],
			recs: gridWidget.getRows()
		});
		Object.defineProperty(_e, 'flatRecs', {
			get: function() { return this.recs.flatMap(rec => [rec, ...rec.detaylar]) }
		});
		for (let key of ['tabloKolonlari', 'kolonTanimlari']) { delete _e[key] }
		this.tabloKolonlariDuzenle(_e); this.tabloKolonlariDuzenle_ozel?.(_e);
		let colDefs = this.tabloKolonlari = _e.liste || [];
		let columns = colDefs.flatMap(colDef => colDef.jqxColumns);
		grid.jqxTreeGrid('columns', columns)
	}
	tabloKolonlariDuzenle({ liste }) { super.tabloKolonlariDuzenle(...arguments) }
	loadServerDataInternal(e) { return super.loadServerDataInternal(e) }
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
