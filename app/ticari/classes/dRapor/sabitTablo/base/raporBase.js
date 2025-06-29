class SBRapor extends DGrupluPanelRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'SB' } static get kategoriAdi() { return 'Sabit' }
	static get chartVarmi() { return false } static get ozetVarmi() { return false }
	static get araSeviyemi() { return this == SBRapor }
}
class SBRapor_Main extends DAltRapor_TreeGrid {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get mainmi() { return true }
	get tazeleYapilirmi() { return true } get noAutoColumns() { return true }
	async tazele(e) {
		let {gridPart} = this, {grid, gridWidget} = gridPart;
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
		let {rapor, raporTanim} = this; SBTablo.listeEkraniAc({
			args: { rapor },
			converter: ({ rec }) => SBTablo.oku({ id: rec.id }),
			veriYuklenince: ({ gridPart }) => {
				let {boundRecs: recs, gridWidget} = gridPart;
				let ind = recs.findIndex(({ id }) => id == raporTanim?.id);
				if (ind > -1) { gridWidget.selectrow(ind) }
			},
			secince: async ({ rec, value }) => {
				this.raporTanim = await value;
				this.tazele(e)
			}
		});
		this._tabloTanimGosterildiFlag = true
	}
}
