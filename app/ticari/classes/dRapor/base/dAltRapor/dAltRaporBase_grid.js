class DAltRapor_Grid extends DAltRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get dGridmi() { return true }
	subFormBuilderDuzenle(e) {
		super.subFormBuilderDuzenle(e); const {parentBuilder} = this;
		let fbd = this.fbd_grid = parentBuilder.addGridliGosterici('grid').rowNumberOlmasin().notAdaptive()
			.addStyle_fullWH(null, 'calc(var(--full) - 30px)').widgetArgsDuzenleIslemi(e => this.gridArgsDuzenle(e) ).onBuildEk(e => this.onGridInit(e))
			.veriYukleninceIslemi(e => this.gridVeriYuklendi(e)).setSource(e => this.loadServerData(e))
			.setTabloKolonlari(e => { let _e = { ...e, liste: [] }; this.tabloKolonlariDuzenle(_e); return _e.liste })
			.onAfterRun(e => this.onGridRun(e));
		let _e = { ...e, gridBuilder: fbd }; this.gridBuilderDuzenle(_e)
	}
	super_subFormBuilderDuzenle(e) { super.subFormBuilderDuzenle(e) }
	gridBuilderDuzenle(e) { }
	onGridInit(e) { this.gridPart = e.builder.part } onGridRun(e) { const {gridPart} = this, {grid, gridWidget} = gridPart; $.extend(this, { grid, gridWidget }) }
	gridArgsDuzenle(e) { const {args} = e; $.extend(args, { showStatusBar: true, showAggregates: true, showGroupAggregates: true, showGroupsHeader: true, groupsExpandedByDefault: false }) }
	tabloKolonlariDuzenle(e) { } loadServerData(e) { } gridVeriYuklendi(e) { }
	tazele(e) { super.tazele(e); this.gridPart?.tazele(e) }
	super_tazele(e) { super.tazele(e) }
}
class DAltRapor_GridGruplu extends DAltRapor_Grid {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get dGridliAltRapormu() { return true }
	static get raporClass() { return null } static get kod() { return 'main' } static get aciklama() { return this.raporClass.aciklama }
	get width() { return '75%' } get height() { return 'var(--full)' } static get gruplamaKAListe() { return [] }
	static get gridGrupAttrSet() { let result = this._gridGrupAttrSet; if (result == null) { result = this._gridGrupAttrSet = asSet(this.gridGrupAttrListe) } return result }
	static get gridGrupAttrListe() { return [] } static get kaPrefixes() { return [] } static get sortAttr() { return null }
	static get gruplama2IcerikCols() { return {} }
	/*subFormBuilderDuzenle(e) { super.subFormBuilderDuzenle(e); const {rfb} = e; rfb.addCSS('no-overflow') }*/
	onGridInit(e) { super.onGridInit(e); const {gridPart} = this; gridPart.gruplamalar = {} }
	gridArgsDuzenle(e) { super.gridArgsDuzenle(e); const {args} = e; $.extend(args, { /* showStatusBar: true, showGroupAggregates: true , compact: true */ }) }
	async tazele(e) { await super.tazele(e); await this.tazeleDiger(e) }
	async loadServerData(e) {
		super.loadServerData(e); const {gridPart} = this; let {gruplamalar} = gridPart;
		if ($.isEmptyObject(gruplamalar)) { return [] } /*if ($.isEmptyObject(gruplamalar)) { gruplamalar = asSet(this.class.gruplamaKAListe.map(x => x.kod)) } */
		e.gruplamalar = gruplamalar; let recs = (await this.loadServerDataInternal(e)) || [];
		const {kaPrefixes} = this.class, fixKA = (rec, prefix) => {
			if (rec == null) { return } const kod = rec[prefix + 'kod'], adi = rec[prefix + 'adi'];
			if (kod !== undefined) {
				rec[prefix] = kod ? `<b>(${kod ?? ''})</b> ${adi ?? ''}` : '';
				delete rec[prefix + 'kod']; delete rec[prefix + 'adi']
			}
		};
		gridPart._promise_kaFix = (async () => { for (const rec of recs) { for (const prefix of kaPrefixes) { fixKA(rec, prefix) } } })();
		const {sortAttr} = this.class; if (sortAttr) { recs.sort((a, b) => { a = a[sortAttr] || 0; b = b[sortAttr] || 0; return a > b ? -1 : a < b ? 1 : 0 }) }
		return recs
	}
	loadServerDataInternal(e) { return null }
	async gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e); const {fbd_grid, gridPart} = this, {grid, gridWidget} = this; let {_lastGruplamalar} = gridPart;
		let {gruplamalar} = gridPart, gruplamaVarmi = !$.isEmptyObject(gruplamalar), colDefs = this.tabloKolonlari; const {gridGrupAttrSet, gruplamaKAListe} = this.class;
		/*if ($.isEmptyObject(gruplamalar)) { gruplamalar = asSet(gruplamaKAListe.map(x => x.kod)) }*/
		fbd_grid.rootBuilder.layout.find('.islemTuslari > div button#gruplamalar')[gruplamaVarmi ? 'removeClass' : 'addClass']('anim-gruplamalar-highlight');
		if (!gruplamaVarmi) { if (!this._gruplamalarGosterildiFlag) { this.gruplamalarIstendi(e) } return }
		const belirtec2Kolon = {}; for (const colDef of colDefs) { belirtec2Kolon[colDef.belirtec] = colDef }
		const icerikColsSet = {}, tip2Belirtecler = {}; let count = 0; for (const colDef of colDefs) {
			const {belirtec} = colDef, grup = colDef.userData?.grup; if (!grup) { icerikColsSet[belirtec] = colDef }
			if (grup != null && gridGrupAttrSet[grup] && gruplamalar[grup]) { (tip2Belirtecler[grup] = tip2Belirtecler[grup] || []).push(belirtec); count++ }
		}
		for (const belirtecler of Object.values(tip2Belirtecler)) { if (belirtecler?.length > 1) { belirtecler.splice(0, -1) } }
		let anahGruplamalar = Object.keys(gruplamalar).join(delimWS), anahLastGruplamalar = _lastGruplamalar ? Object.keys(_lastGruplamalar).join(delimWS) : null;
		await gridPart._promise_kaFix; gridWidget.beginupdate(); try {
			if (anahLastGruplamalar == null || anahGruplamalar != anahLastGruplamalar) {
				let tabloKolonlari = colDefs.filter(colDef => { const {belirtec} = colDef, grup = colDef.userData?.grup; return !icerikColsSet[belirtec] && (grup == null || !!gruplamalar[grup]) });
				const attrSet = asSet(tabloKolonlari.map(colDef => colDef.belirtec));
				const {gruplama2IcerikCols} = this.class; for (const [gruplama, belirtecler] of Object.entries(gruplama2IcerikCols)) {
					const gruplamaVarmi = gruplamalar[gruplama]; if (!gruplamaVarmi) { continue }
					for (const belirtec of belirtecler) {
						if (attrSet[belirtec]) { continue } const colDef = belirtec2Kolon[belirtec]; if (colDef == null) { continue }
						attrSet[belirtec] = true; tabloKolonlari.push(colDef)
					}
				}
				try { gridPart.updateColumns({ tabloKolonlari }) } catch (ex) { console.error(ex) }
				_lastGruplamalar = this._lastGruplamalar = $.extend({}, gruplamalar)
			}
		}
		finally { gridWidget.endupdate(false) }
		const groups = []; if (Object.keys(gruplamalar).length >= 2) {
			for (const belirtecler of Object.values(tip2Belirtecler)) { if (belirtecler?.length) { const belirtec = belirtecler[1] || belirtecler[0]; groups.push(belirtec) } } }
		if (groups.length) { grid.jqxGrid('groups', groups) } /*if (groups.length) { for (const belirtec of groups) { gridWidget.hidecolumn(belirtec) } }*/
	}
	gruplamalarIstendi(e) {
		const {gridPart, gruplamalar} = this, {gruplamaKAListe} = this.class;
		let wRFB = new RootFormBuilder('gruplamalar').addCSS('part');
		wRFB.addIslemTuslari('islemTuslari').setTip('tamam').setId2Handler({ tamam: e => wnd.jqxWindow('close') })
			.addStyle(e => `$elementCSS .butonlar.part > .sol { z-index: -1; background-color: unset !important; background: transparent !important }`);
		let fbd_content = wRFB.addFormWithParent('content').yanYana()
			.addStyle(e => `$elementCSS { position: relative; top: 10px; z-index: 100 } $elementCSS > button { margin: 0 0 10px 10px }
			$elementCSS > button.jqx-fill-state-normal { background-color: whitesmoke !important } $elementCSS > button.jqx-fill-state-pressed { background-color: royalblue !important }`);
		for (const {kod, aciklama} of gruplamaKAListe) {
			let btn = fbd_content.addForm(kod).setLayout(e => {
				const {builder} = e, {id} = builder;
				return builder.input = $(`<button id="${id}">${aciklama}</button>`).jqxToggleButton({ theme, width: '45%', height: 50, toggled: gruplamalar[id] })
			});
			btn.onAfterRun(e => e.builder.input.on('click', evt => this.gruplamalar_butonTiklandi({ ...e, evt, id: evt.currentTarget.id, gridPart, gruplamalar })) )
		}
		let wnd = createJQXWindow({ title: 'Gruplamalar', args: { isModal: true, width: 500, height: 430, closeButtonAction: 'close' } });
		wnd.on('close', evt => { wnd.jqxWindow('destroy'); this.tazele(); $('body').removeClass('bg-modal') });
		wnd.prop('id', 'gruplamalar'); wnd.addClass('part'); $('body').addClass('bg-modal');
		let parent = wnd.find('div > .subContent'); wRFB.setParent(parent); wRFB.run(); this._gruplamalarGosterildiFlag = true
	}
	gruplamalar_butonTiklandi(e) {
		const {id, evt, gruplamalar} = e, target = $(evt.currentTarget), flag = target.jqxToggleButton('toggled');
		if (flag) { gruplamalar[id] = true } else { delete gruplamalar[id] }
	}
}
class DAltRapor_Grid_Ozet extends DAltRapor_Grid {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return null } static get altRaporMainClass() { return null }
	static get kod() { return 'ozet' } static get aciklama() { return 'Özet Bilgi' }
	get width() { return `calc(var(--full) - ${this.rapor.id2AltRapor.main.width})` } get height() { return '400px' }
	gridArgsDuzenle(e) { const {args} = e; $.extend(args, { showStatusBar: true, showAggregates: true, showGroupAggregates: false, showGroupsHeader: false }) }
	tazele(e) {
		super.tazele(e); const{gridPart} = this, {gridWidget} = gridPart, {main} = this.rapor.id2AltRapor, colDefs = main.ozetBilgi?.colDefs || [];
		setTimeout(() => { gridWidget.beginupdate(); gridPart.updateColumns(colDefs); gridWidget.endupdate(false) }, 100)
	}
	tabloKolonlariDuzenle(e) { super.tabloKolonlariDuzenle(e) }
	loadServerData(e) { super.loadServerData(e); const {main} = this.rapor.id2AltRapor; return main.ozetBilgi?.recs || [] }
}

