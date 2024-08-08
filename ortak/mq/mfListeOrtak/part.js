class MFListeOrtakPart extends GridliGostericiWindowPart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get orjBaslikListesi() { return this._orjBaslikListesi } set orjBaslikListesi(value) { this._orjBaslikListesi = value }
	get listeBasliklari() { return this._listeBasliklari } set listeBasliklari(value) { this._listeBasliklari = value }
	get mfSinif() { return this._mfSinif } set mfSinif(value) { this._mfSinif = value }
	get secimler() { return this._secimler } set secimler(value) { this._secimler = value }
	get secimlerDuzenleBlock() { return this._secimlerDuzenleBlock } set secimlerDuzenleBlock(value) { this._secimlerDuzenleBlock = value }
	get tanimUISinif() { return this._tanimUISinif } set tanimUISinif(value) { this._tanimUISinif = value }
	get tanimlanabilirmi() { return this._tanimlanabilirmi } set tanimlanabilirmi(value) { this._tanimlanabilirmi = value }
	get silinebilirmi() { return this._silinebilirmi } set silinebilirmi(value) { this._silinebilirmi = value }
	get panelDuzenleyici() { return this._panelDuzenleyici } set panelDuzenleyici(value) { this._panelDuzenleyici = value }
	getOrjBaslikListesi(e) {
		e = e || {}; let result = this.orjBaslikListesi; const {panelDuzenleyici} = this;
		if (result && !result.prototype && $.isFunction(result)) { result = getFuncValue.call(this, result, $.extend({}, e, { mfSinif: this.getMFSinif(), panelDuzenleyici })) }
		if (result == null) { const _e = $.extend({}, e, { liste: [] }); this.orjBaslikListesiDuzenle(e); result = _e.liste }
		if ($.isEmptyObject(result)) { result = this.getMFSinif(e)?.orjBaslikListesi }
		const ekKolonlar = panelDuzenleyici?.tabloKolonlari?.filter(colDef => colDef.ekKolonmu), colAttrSet = {}, _result = result || [];
		result = []; if (ekKolonlar?.length) {
			for (const colDef of ekKolonlar) { const {belirtec} = colDef; if (!colAttrSet[belirtec]) { colAttrSet[belirtec] = true; result.push(colDef) } }
		}
		for (const colDef of _result) { const {belirtec} = colDef; if (!colAttrSet[belirtec]) { result.push(colDef) } }
		return this._orjBaslikListesi = result
	}
	getListeBasliklari(e) {
		e = e || {}; let result = this.listeBasliklari; const {panelDuzenleyici} = this;
		if (result && !result.prototype && $.isFunction(result)) { result = getFuncValue.call(this, result, $.extend({}, e, { mfSinif: this.getMFSinif(), panelDuzenleyici })) }
		if (result == null) { const _e = $.extend({}, e, { liste: [] }); this.listeBasliklariDuzenle(e); result = _e.liste }
		if ($.isEmptyObject(result)) { result = this.getMFSinif(e)?.listeBasliklari }
		const orjBaslikListesi = this.getOrjBaslikListesi(e); if ($.isEmptyObject(result) && !$.isEmptyObject(orjBaslikListesi)) { result = orjBaslikListesi }
		const ekKolonlar = panelDuzenleyici?.tabloKolonlari, colAttrSet = {}, _result = result || [];
		result = []; if (ekKolonlar?.length) {
			for (const colDef of ekKolonlar) { const {belirtec} = colDef; if (colDef?.ekKolonmu && !colAttrSet[belirtec]) { colAttrSet[belirtec] = true; result.push(colDef) } }
		}
		for (const colDef of _result) { const {belirtec} = colDef; if (!colAttrSet[belirtec]) { result.push(colDef) } }
		return this._listeBasliklari = result || []
	}
	getMFSinif(e) { e = e || {}; let result = this.mfSinif; if (result && isClass(result)) { result = getFuncValue.call(this, result, e) } return this._mfSinif = result }
	getSecimler(e) { e = e || {}; let result = this.secimler; if (result && isInstance(result)) { result = getFuncValue.call(this, result, e) } return this._secimler = result }
	getTanimUISinif(e) {
		e = e || {}; let result = this.tanimUISinif; if (result && !result.prototype && $.isFunction(result)) result = getFuncValue.call(this, result, e)
		if (result == null) result = this._tanimUISinif = e.mfSinif?.tanimUISinif
		return result
	}
	getTanimlanabilirmi(e) {
		e = e || {}; let result = this.tanimlanabilirmi; if (result && !result.prototype && $.isFunction(result)) result = getFuncValue.call(this, result, e)
		if (result == null) result = this._tanimlanabilirmi = e.mfSinif?.tanimlanabilirmi
		return result
	}
	getSilinebilirmi(e) {
		e = e || {}; let result = this.silinebilirmi; if (result && !result.prototype && $.isFunction(result)) result = getFuncValue.call(this, result, e)
		if (result == null) result = this._silinebilirmi = e.mfSinif?.silinebilirmi
		return result
	}

	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			ozelQueryDuzenleBlock: e.ozelQueryDuzenleBlock ?? e.ozelQueryDuzenle, ozelQuerySonucuBlock: e.ozelQuerySonucuBlock ?? e.ozelQuerySonucu,
			yeniInstOlusturucu: e.yeniInstOlusturucu, tanimOncesiEkIslemler: e.tanimOncesiEkIslemler, _mfSinif: e.mfSinif, _secimler: e.secimler, _secimlerDuzenleBlock: e.secimlerDuzenleBlock ?? e.secimlerDuzenle,
			_tanimUISinif: e.tanimUISinif, _tanimlanabilirmi: e.tanimlanabilirmi, _silinebilirmi: e.silinebilirmi, args: e.args, panelDuzenleyici: e.panelDuzenleyici
		});
		const mfSinif = this._mfSinif = this.getMFSinif(e); $.extend(e, { sender: this, gridPart: this, mfSinif });
		const {eConf} = e; if (eConf != null) { this.eConf = eConf }
		let secimler = e.secimler = this.getSecimler(e); let {sinifAdi} = e;
		if (mfSinif) { if (!secimler) { secimler = mfSinif.newSecimler } if (sinifAdi == null) { sinifAdi = mfSinif.listeSinifAdi ?? mfSinif.sinifAdi } }
		if (secimler) {
			const {secimlerDuzenleBlock} = this;
			if (secimlerDuzenleBlock) {
				const _e = $.extend({}, e, { sender: this, builder: this.builder, mfSinif, sinifAdi, secimler }); getFuncValue.call(this, secimlerDuzenleBlock, _e)
				let result = _e.secimler; if (result !== undefined) { secimler = _e.secimler }
			}
		} this._secimler = secimler;
		let {panelDuzenleyici} = this; if (!panelDuzenleyici && mfSinif?.orjBaslikListesi_getPanelDuzenleyici) { panelDuzenleyici = mfSinif.orjBaslikListesi_getPanelDuzenleyici(e) }
		/* if (!panelDuzenleyici) { panelDuzenleyici = new GridPanelDuzenleyici() } */
		if (panelDuzenleyici) {
			let grupAttrListe = mfSinif?.orjBaslikListesi_panelGrupAttrListe || [], ustSeviyeAttrListe = mfSinif?.orjBaslikListesi_panelUstSeviyeAttrListe || [];
			if (!grupAttrListe?.length && ustSeviyeAttrListe?.length) { grupAttrListe = [...ustSeviyeAttrListe] }
			else if (grupAttrListe?.length && !ustSeviyeAttrListe?.length) { ustSeviyeAttrListe = [...grupAttrListe] }
			const groups = mfSinif?.orjBaslikListesi_getGroups(e); if (groups?.length) { ustSeviyeAttrListe.push(...groups) }
			$.extend(panelDuzenleyici, { gridPart: this, grupAttrListe, ustSeviyeAttrListe });
			if (!panelDuzenleyici.colCount) { panelDuzenleyici.colCount = e => this.getColCount(e) }
		}
		this.panelDuzenleyici = panelDuzenleyici;
		this.title = e.title == null ? ( ( sinifAdi ? `<span class="wnd-title sinifAdi">${sinifAdi}</span> listesi` : null ) || 'Liste Ekranı' ) : e.title;
		const {args} = this; if (!$.isEmptyObject(args)) { $.extend(this, args) }
	}
	runDevam(e) {
		e = e || {}; const mfSinif = this.getMFSinif(e), {layout} = this; $.extend(e, { layout, sender: this });
		if (mfSinif) {
			const {parentMFSinif} = mfSinif; if (parentMFSinif) { layout.addClass(parentMFSinif.dataKey ?? parentMFSinif.classKey) }
			layout.addClass(mfSinif.dataKey ?? mfSinif.classKey); if (mfSinif.listeEkrani_init) { mfSinif.listeEkrani_init(e) };
		}
		super.runDevam(e); this.initBulForm(e)
	}
	afterRun(e) {
		e = e || {}; super.afterRun(e); const mfSinif = this.getMFSinif(e); const {parent, layout} = this; let {builder} = this;
		$.extend(e, { sender: this, parent, layout });
		if (!builder && mfSinif?.getRootFormBuilder_listeEkrani) { const _e = $.extend({}, e); builder = this.builder = mfSinif.getRootFormBuilder_listeEkrani(_e) }
		if (builder && !builder._afterRun_calistimi) {
			builder.part = this; let _parent = builder.parent, _layout = builder.layout; this.builder = builder;
			if (!(parent?.length || layout?.length)) _layout = builder.layout = layout
			let _id = builder.id; if (!_id) { _id = builder.id = builder.newElementId() }
			builder.autoInitLayout(); builder.run()
		}
		$.extend(e, { layout, sender: this, gridPart: this, builder }); if (mfSinif?.listeEkrani_afterRun) { mfSinif.listeEkrani_afterRun(e) }
	}
	destroyPart(e) {
		const {layout, builder} = this, mfSinif = this.getMFSinif(); $.extend(e, { layout, sender: this, gridPart: this, builder });
		if (mfSinif?.listeEkrani_destroyPart) { mfSinif.listeEkrani_destroyPart(e) }
		const {secimlerPart} = this; if (secimlerPart) { secimlerPart.close(e); secimlerPart.destroyPart() } super.destroyPart(e)
	}
	activated(e) {
		e = e || {}; super.activated(e); if (!this._activatedFlag) { this._activatedFlag = true; return }
		const {layout, builder} = this, mfSinif = this.getMFSinif(); $.extend(e, { layout, sender: this, gridPart: this, builder });
		if (mfSinif?.listeEkrani_activated) { mfSinif.listeEkrani_activated(e) }
	}
	deactivated(e) {
		super.deactivated(e); if (!this._activatedFlag) { this._activatedFlag = true; return }
		const {layout, builder} = this, mfSinif = this.getMFSinif(); $.extend(e, { layout, sender: this, gridPart: this, builder });
		if (mfSinif?.listeEkrani_deactivated) { mfSinif.listeEkrani_deactivated(e) }
	}
	initBulForm(e) {
		const {layout} = this; let {bulForm} = this; if (!bulForm?.length) { bulForm = layout.find('#bulForm') } if (!bulForm?.length) { bulForm = layout.find('.bulForm') }
		if (bulForm?.length) {
			const mfSinif = this.getMFSinif(e);
			if (!mfSinif || mfSinif.bulFormKullanilirmi) {
				let {bulPart} = this; if (!bulPart) {
					bulPart = this.bulPart = new FiltreFormPart({ layout: bulForm, degisince: e => { const {tokens} = e; this.hizliBulIslemi({ sender: this, layout, tokens }) } });
					bulPart.run()
				}
			}
			else { bulForm.addClass('jqx-hidden') }
		}
	}
	hizliBulIslemi(e) {
		const mfSinif = this.getMFSinif(); if (mfSinif?.orjBaslikListesi_hizliBulIslemi) { if (mfSinif.orjBaslikListesi_hizliBulIslemi(e) === false) { return } }
		return super.hizliBulIslemi(e)
	}
	islemTuslariDuzenle(e) {
		super.islemTuslariDuzenle(e); const mfSinif = this.getMFSinif(), {secimler, panelDuzenleyici} = this, {liste} = e, yListe = [];
		yListe.push({ id: 'basliklariDuzenle', handler: e => this.basliklariDuzenleIstendi(e) })
		if (secimler && mfSinif?.raporKullanilirmi) { yListe.push({ id: 'rapor', handler: e => this.sabitBilgiRaporuIstendi(e) }) }
		if (!panelDuzenleyici && (!mfSinif || mfSinif?.kolonFiltreKullanilirmi)) { yListe.push({ id: 'kolonFiltre', handler: e => this.kolonFiltreIstendi(e) }) }
		if (secimler) { yListe.push({ id: 'secimler', handler: e => this.secimlerIstendi(e) }) }
		const _e = $.extend({}, e, { mfSinif, secimler, orjListe: yListe }), tanimlanabilirmi = this.getTanimlanabilirmi(_e), silinebilirmi = this.getSilinebilirmi(_e);
		if (tanimlanabilirmi) { yListe.push( { id: 'yeni', handler: e => this.yeniIstendi(e) }, { id: 'degistir', handler: e => this.degistirIstendi(e) }, { id: 'kopya', handler: e => this.kopyaIstendi(e) } ) }
		if (silinebilirmi) { yListe.push({ id: 'sil', args: { template: 'danger' }, handler: e => this.silIstendi(e) }) }
		if (!$.isEmptyObject(liste)) { yListe.push(...liste) } e.liste = yListe;
		if (panelDuzenleyici?.islemTuslariDuzenle_listeEkrani) { panelDuzenleyici.islemTuslariDuzenle_listeEkrani(_e) }
		if (mfSinif?.islemTuslariDuzenle_listeEkrani) { mfSinif.islemTuslariDuzenle_listeEkrani(e) }
	}
	gridInit(e) {
		super.gridInit(e); const {grid, gridWidget} = this; this.expandedIndexes = {}; const {panelDuzenleyici} = this, mfSinif = this.getMFSinif();
		/*const animation = 'grid-open-fast'; if (!noAnimateFlag) { grid.addClass(animation); clearTimeout(this.timer_animate); this.timer_animate = setTimeout(() => { grid.removeClass(animation); delete this.timer_animate }, 2000) }*/
		const _e = $.extend({}, e, { sender: this, mfSinif, grid, gridWidget });
		if (panelDuzenleyici?.gridInit) { panelDuzenleyici.gridInit(_e) } if (mfSinif?.orjBaslikListesi_gridInit) { mfSinif.orjBaslikListesi_gridInit(_e) }
	}
	gridArgsDuzenleDevam(e) {
		super.gridArgsDuzenleDevam(e); const {args} = e, mfSinif = this.getMFSinif(), {panelDuzenleyici} = this;
		$.extend(args, { autoShowLoadElement: true, showGroupsHeader: true, showFilterRow: false, filterMode: 'default' /* virtualMode: true */ });
		if (panelDuzenleyici?.gridArgsDuzenle) { panelDuzenleyici.gridArgsDuzenle(e) }
		if (mfSinif) {
			if (mfSinif.gridDetaylimi) {
				$.extend(args, {
					selectionMode: 'checkbox', /* virtualMode: true, */ rowDetails: true,
					rowDetailsTemplate: rowIndex => ({ rowdetails: `<div class="detay-grid-parent dock-bottom"><div class="detay-grid"/></div>`, rowdetailsheight: 350 }),
					initRowDetails: (rowIndex, _parent, grid, parentRec) => { const parent = $(_parent).find('.detay-grid'); this.initRowDetails({ rowIndex, parent, parentRec }) }
				})
			}
			if (mfSinif.orjBaslikListesi_argsDuzenle) { mfSinif.orjBaslikListesi_argsDuzenle(e) }
			const rowsHeight = this.getRowsHeight(e); if (rowsHeight) { $.extend(args, { rowsHeight }) }
		}
		else {
			const yerelParam = app.params.yerel || {}, mfSinif2KolonAyarlari = yerelParam.mfSinif2KolonAyarlari = yerelParam.mfSinif2KolonAyarlari || {};
			const ignoreAttrSet = asSet(['_rowNumber']), yerelParamBelirtec = mfSinif?.yerelParamBelirtec || this.class.classKey;
			let kolonAyarlari = {}; if (yerelParamBelirtec) kolonAyarlari = mfSinif2KolonAyarlari[yerelParamBelirtec] || {};
			const gorunumSet = asSet(kolonAyarlari.gorunumListesi || []);
			if (!$.isEmptyObject(gorunumSet)) { e.tabloKolonlari = e.tabloKolonlari.filter(colDef => { const {belirtec} = colDef; return ignoreAttrSet[belirtec] || gorunumSet[belirtec] }) }
		}
	}
	initRowDetails(e) {
		e = $.extend({}, e, { parentPart: this }); const {grid, gridWidget} = this, {parent, parentRec, rowIndex} = e, mfSinif = e.mfSinif = this.getMFSinif(e);
		if (mfSinif?.orjBaslikListesi_initRowDetails) {
			const _e = $.extend({}, e, { sender: this, mfSinif, grid, gridWidget });
			try { let result = mfSinif.orjBaslikListesi_initRowDetails(_e); if (result === false) { gridWidget.hiderowdetails(rowIndex); return } }
			catch (ex) { hConfirm(getErrorText(ex), 'Detay Grid Gösterim'); throw ex }
		}
		const detGridPart = e.detGridPart = new GridliGostericiPart({
			parentPart: this, parentBuilder: this.builder,
			layout: parent, argsDuzenle: e => {
				const {args} = e; $.extend(args, { virtualMode: false, selectionMode: 'multiplerowsextended' });
				const mfSinif = this.getMFSinif(e); if (mfSinif?.orjBaslikListesi_argsDuzenle_detaylar) { mfSinif.orjBaslikListesi_argsDuzenle_detaylar(e) }
			},
			tabloKolonlari: e => this.tabloKolonlari_detaylar,
			loadServerData: async _e => {
				const {mfSinif, secimler} = this;
				$.extend(_e, { gridPart: this, sender: this, mfSinif, secimler, parent, parentRec, gridPart: detGridPart, grid: detGridPart.grid, gridWidget: detGridPart.gridWidget, args: this.args });
				try { return await this.loadServerData_detaylar(_e) }
				catch (ex) { console.error(ex); const errorText = getErrorText(ex); hConfirm(`<div style="color: firebrick;">${errorText}</div>`, 'Grid Verisi Alınamadı') }
			},
			veriYuklenince: e => { const {mfSinif} = this; if (mfSinif.gridVeriYuklendi_detaylar) { return mfSinif.gridVeriYuklendi_detaylar(e) } }
		}).noAnimate();
		detGridPart.run();
		if (mfSinif?.orjBaslikListesi_initRowDetails_son) {
			const _e = $.extend({}, e, { sender: this, mfSinif, grid, gridWidget });
			try {
				let result = mfSinif.orjBaslikListesi_initRowDetails_son(_e);
				if (result === false) { gridWidget.hiderowdetails(rowIndex); return }
			}
			catch (ex) { hConfirm(getErrorText(ex), 'Detay Grid Gösterim'); throw ex }
		}
	}
	gridContextMenuIstendi(e) {
		const mfSinif = this.getMFSinif(); if (mfSinif?.orjBaslikListesi_gridContextMenuIstendi) { if (mfSinif.orjBaslikListesi_gridContextMenuIstendi(e) === false) { return } }
		super.gridContextMenuIstendi(e)
	}
	gridRendered(e) { super.gridRendered(e); const mfSinif = this.getMFSinif(); if (mfSinif?.orjBaslikListesi_gridRendered) { mfSinif.orjBaslikListesi_gridRendered(e) } }
	gridRowExpanded(e) {
		super.gridRowExpanded(e); const mfSinif = this.getMFSinif(); if (mfSinif?.orjBaslikListesi_rowExpanding) { if (mfSinif.orjBaslikListesi_rowExpanding(e) === false) { return } }
		const {grid, gridWidget, expandedIndexes} = this, evt = e.event || {}, args = evt.args || {}, index = gridWidget.getrowboundindex(args.rowindex);
		if (index != null && index > -1) {
			/*const animation = 'grid-open'; grid.removeClass('grid-open grid-open-fast grid-open-slow');
			setTimeout(() => {
				grid.addClass(animation); clearTimeout(this.timer_animate);
				this.timer_animate = setTimeout(() => { grid.removeClass(animation); delete this.timer_animate }, 4000)
			}, 5);*/
			try { gridWidget.beginupdate() } catch (ex) { }
			if (!$.isEmptyObject(expandedIndexes)) { for (let _index in expandedIndexes) { _index = asInteger(_index); if (index != _index) { gridWidget.hiderowdetails(_index) } } }
			expandedIndexes[index] = true; /*setTimeout(() => gridWidget.ensurerowvisible(index > 0 ? index - 1 : index), 10)*/
			try { gridWidget.endupdate(false) } catch (ex) { }
			try { gridWidget.ensurerowvisible(index) } catch (ex) { console.error(ex) }
		}
		if (mfSinif?.orjBaslikListesi_rowExpanded) { mfSinif.orjBaslikListesi_rowExpanded(e) }
	}
	gridRowCollapsed(e) {
		super.gridRowCollapsed(e); const mfSinif = this.getMFSinif(); if (mfSinif?.orjBaslikListesi_rowCollapsing) { if (mfSinif.orjBaslikListesi_rowCollapsing(e) === false) { return } }
		const {gridWidget, expandedIndexes} = this, evt = e.event || {}, args = evt.args || {}, index = gridWidget.getrowboundindex(args.rowindex);
		if (index != null && index > -1) { delete expandedIndexes[index] }
		if (mfSinif?.orjBaslikListesi_rowCollapsed) { mfSinif.orjBaslikListesi_rowCollapsed(e) }
	}
	gridGroupExpanded(e) { super.gridGroupExpanded(e); const mfSinif = this.getMFSinif(); if (mfSinif?.orjBaslikListesi_groupExpanded) { mfSinif.orjBaslikListesi_groupExpanded(e) } }
	gridGroupCollapsed(e) { super.gridGroupCollapsed(e); const mfSinif = this.getMFSinif(); if (mfSinif?.orjBaslikListesi_groupCollapsed) { mfSinif.orjBaslikListesi_groupCollapsed(e) } }
	orjBaslikListesiDuzenle(e) { } listeBasliklariDuzenle(e) { }
	get defaultTabloKolonlari() {
		const e = {}; const mfSinif = e.mfSinif = this.getMFSinif(e); let tabloKolonlari = super.defaultTabloKolonlari || [], colAttrSet = asSet(tabloKolonlari.map(colDef => colDef.belirtec));
		/* const ignoreAttrSet = asSet(['_rowNumber']); */ const listeBasliklari = this.getListeBasliklari({ mfSinif }), sayacSaha = mfSinif?.sayacSaha;
		for (const colDef of listeBasliklari) {
			const {belirtec} = colDef;
			if (!colAttrSet[belirtec] && (belirtec == sayacSaha ? !mfSinif || mfSinif.sayacSahaGosterilirmi : true)) { tabloKolonlari.push(colDef) }
		}
		const {panelDuzenleyici} = this; if (panelDuzenleyici?.tabloKolonlariDuzenle) {
			const _e = $.extend({}, e, { liste: tabloKolonlari }); panelDuzenleyici.tabloKolonlariDuzenle(_e);
			colAttrSet = {}; tabloKolonlari = []; let _tabloKolonlari = _e.liste;
			if (_tabloKolonlari) {
				for (const colDef of _tabloKolonlari) {
					if (!colDef) { continue } const {belirtec} = colDef;
					if (!colAttrSet[belirtec]) { colAttrSet[belirtec] = true; tabloKolonlari.push(colDef) }
				}
			}
		}
		return tabloKolonlari
	}
	defaultLoadServerData(e) {
		e = e || {}; const mfSinif = this.getMFSinif(e); e.args = this.args;
		if (!mfSinif) { return super.defaultLoadServerData(e) }
		const {builder, tabloKolonlari, secimler, ozelQueryDuzenleBlock, ozelQuerySonucuBlock} = this;
		const _e = $.extend({ sender: this, builder, tabloKolonlari, secimler, ozelQueryDuzenleBlock, ozelQuerySonucuBlock }, e); return mfSinif.loadServerData(_e)
	}
	loadServerData_recsDuzenle_ilk(e) {
		super.loadServerData_recsDuzenle(e); const mfSinif = e.mfSinif = this.getMFSinif(e); let {recs} = e; e.args = this.args;
		if (mfSinif?.orjBaslikListesi_recsDuzenle) { const _recs = mfSinif.orjBaslikListesi_recsDuzenle(e); recs = e.recs; if (_recs) { recs = e.recs = _recs } }
		return super.loadServerData_recsDuzenle_ilk(e)
	}
	loadServerData_recsDuzenle(e) {
		let recs = super.loadServerData_recsDuzenle(e); if (recs == null) { recs = e.recs } const mfSinif = this.getMFSinif(e);
		const {panelDuzenleyici} = this; if (panelDuzenleyici?.recsDuzenle) { const _recs = panelDuzenleyici.recsDuzenle(e); if (_recs) { recs = e.recs = _recs } }
		if (mfSinif?.orjBaslikListesi_recsDuzenleSon) { const _recs = mfSinif.orjBaslikListesi_recsDuzenleSon(e); recs = e.recs; if (_recs) { recs = e.recs = _recs } }
		return recs
	}
	get tabloKolonlari_detaylar() { const {mfSinif} = this; return mfSinif.listeBasliklari_detaylar }
	loadServerData_detaylar(e) {
		e = e || {}; const {grid, wsArgs} = e; e.args = this.args;
		if (wsArgs && grid?.length) {
			if (!grid.jqxGrid('pageable')) { const keys = ['recordstartindex', 'recordendindex', 'pagenum', 'pageindex', 'pagesize']; for (const key of keys) { delete wsArgs[key] } }
		}
		const mfSinif = this.getMFSinif();
		try { const _e = $.extend({ sender: e, tabloKolonlari: this.tabloKolonlari_detaylar, fisSinif: mfSinif }, e); return mfSinif.loadServerData_detaylar(_e) }
		catch (ex) { console.error(ex); const errorText = getErrorText(ex); hConfirm(`<div style="color: firebrick;">${errorText}</div>`, 'Detay Grid Verisi Alınamadı') }
	}
	 openContextMenu(e) {
		const evt = e.event, gridPart = e.gridPart = e.gridPart ?? e.sender ?? e.parentPart, gridWidget = e.gridWidget = gridPart.gridWidget, cells = e.cells = gridWidget.getselectedcells();
		const belirtec = e.belirtec = gridPart.selectedBelirtec, parentRec = e.parentRec = e.parentRec ?? gridPart.selectedRec;
		const recs = e.recs = (e.recs ?? gridPart.getSubRecs(e)).filter(rec => !!rec), rec = e.rec = (recs || [])[0]; /*if (!rec) { return }*/
		const title = e.title ?? 'Menü'; let wnd, wndContent = $(`<div class="full-wh"/>`);
		const close = e.close = e => { if (wnd) { wnd.jqxWindow('close'); wnd = null } }, rfb = e.rfb = new RootFormBuilder({ parentPart: gridPart, layout: wndContent }).autoInitLayout();
		let form = e.form = rfb.addFormWithParent('islemTuslari').altAlta().addStyle(...[
			e => `$elementCSS button { font-size: 120%; width: var(--full) !important; height: 50px !important; margin: 5px 0 0 5px; margin-block-end: 5px }`,
			e => `$elementCSS button.jqx-fill-state-normal { background-color: whitesmoke !important }`,
			e => `$elementCSS button.jqx-fill-state-hover { background-color: #d9e0f0 !important }`,
			e => `$elementCSS button.jqx-fill-state-pressed { color: whitesmoke !important; background-color: royalblue !important }`
		]);
		const {formDuzenleyici} = e; if (formDuzenleyici) { const result = getFuncValue.call(this, formDuzenleyici, e); if (result === false) { return false } }
		wnd = e.wnd = createJQXWindow({ content: wndContent, title, args: { isModal: false, closeButtonAction: 'close', width: Math.min(700, $(window).width() - 50), height: Math.min(350, $(window).height() - 100) } });
		wndContent = e.wndContent = wnd.find('div > .content > .subContent'); rfb.onAfterRun(e => { setTimeout(() => e.builder.id2Builder.islemTuslari.layout.find(`:eq(0) > button`).focus(), 100) })
		rfb.run(); wnd.on('close', evt => { $('body').removeClass('bg-modal'); wnd.jqxWindow('destroy'); wnd = null }); $('body').addClass('bg-modal'); return true
	}
	getColCount(e) {
		e = e || {}; const mfSinif = this.getMFSinif(e), {paramGlobals} = mfSinif; let result = paramGlobals?.colCount;
		if (!result) {
			const maxColCount = mfSinif.orjBaslikListesi_maxColCount, part = this, {recs} = e, recCount = recs?.length, width = $(window).width();
			if (width <= 680) { result = 2 }
			else if (width <= 850) { result = 3 }
			else if (width <= 1000) { result = 4 }
			else { result = mfSinif?.orjBaslikListesi_defaultColCount || mfSinif?.orjBaslikListesi_maxColCount }
			if (recCount != null) { result = Math.min(result, recs.length) }
		}
		return result
	}
	getRowsHeight(e) { const mfSinif = this.getMFSinif(e), {paramGlobals} = mfSinif; return paramGlobals.rowsHeight || mfSinif?.orjBaslikListesi_defaultRowsHeight }
	getParentRecAtIndex(rowIndex, gridPart) { const {gridWidget} = this || {}; return (rowIndex == null || rowIndex < 0 ? null : gridWidget.getrowdata(rowIndex)) ?? this.selectedRec }
	getSubRecs(e) { return this.panelDuzenleyici?.getSubRecs(e) } getSubRec(e) { return this.panelDuzenleyici?.getSubRec(e) }
	gridSatirTiklandi(e) {
		e = e || {}; const mfSinif = this.getMFSinif(); if (mfSinif?.orjBaslikListesi_satirTiklandi) { if (mfSinif.orjBaslikListesi_satirTiklandi(e) === false) { return false } }
		return super.gridSatirTiklandi(e)
	}
	gridSatirCiftTiklandi(e) {
		e = e || {}; const mfSinif = this.getMFSinif(); if (mfSinif?.orjBaslikListesi_satirCiftTiklandi) { if (mfSinif.orjBaslikListesi_satirCiftTiklandi(e) === false) { return false } }
		if (super.gridSatirCiftTiklandi(e) === false) return false
		if (!this.secince && mfSinif?.tanimlanabilirmi) { const args = e.event?.args || {}; this.degistirIstendi($.extend({}, e, { rec: args.owner.getrowdata(args.rowindex), rowIndex: args.rowindex })); return false }
		return true
	}
	gridHucreTiklandi(e) {
		e = e || {}; const mfSinif = this.getMFSinif(); if (mfSinif?.orjBaslikListesi_hucreTiklandi) { if (mfSinif.orjBaslikListesi_hucreTiklandi(e) === false) { return false } }
		return super.gridHucreTiklandi(e)
	}
	gridHucreCiftTiklandi(e) {
		e = e || {}; const mfSinif = this.getMFSinif(); if (mfSinif?.orjBaslikListesi_hucreCiftTiklandi) { if (mfSinif.orjBaslikListesi_hucreCiftTiklandi(e) === false) { return false } }
		return super.gridHucreCiftTiklandi(e)
	}
	gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e); const {mfSinif, panelDuzenleyici, grid, bulPart} = this;
		if (mfSinif) { const groups = mfSinif.orjBaslikListesi_getGroups(e); if (groups?.length) { grid.jqxGrid('groups', groups) } }
		if (panelDuzenleyici?.gridVeriYuklendi) { panelDuzenleyici.gridVeriYuklendi(e) }
		if (mfSinif) { mfSinif.gridVeriYuklendi(e) }
		if ((!mfSinif || mfSinif.bulFormKullanilirmi) && bulPart?.layout?.length) { const {noAutoFocus} = mfSinif || {}; if (!noAutoFocus) { setTimeout(() => bulPart.focus(), 50) } }
	}
	secimlerIstendi(e) {
		let {secimlerPart} = this; if (secimlerPart) { secimlerPart.show() }
		else { const {secimler} = this; if (secimler) { secimlerPart = this.secimlerPart = secimler.duzenlemeEkraniAc({ parentPart: this, tamamIslemi: e => this.tazele() }) } }
	}
	async yeniIstendi(e) {
		const mfSinif = this.getMFSinif(e); const tanimUISinif = this.getTanimUISinif($.extend({}, e, { mfSinif })); if (!tanimUISinif) { return false }
		const {tanimOncesiEkIslemler, gridWidget} = this, {args} = this, {ozelTanimIslemi} = mfSinif; let inst;
		const rowIndex = coalesce(e.rowIndex, gridWidget.getselectedrowindex()), rec = e.rec ?? gridWidget.getrowdata(rowIndex);
		const _e = { sender: this, listePart: this, islem: 'yeni', mfSinif, tanimUISinif, rec, rowIndex, args };
		if (ozelTanimIslemi) return await getFuncValue.call(this, ozelTanimIslemi, _e)
		try {
			const {yeniInstOlusturucu} = this;
			if (yeniInstOlusturucu) { inst = await getFuncValue.call(this, yeniInstOlusturucu, _e) }
			if (inst === undefined && mfSinif.yeniInstOlustur) { inst = await mfSinif.yeniInstOlustur(_e) }
			if (inst === undefined) inst = new mfSinif(_e); if (inst == null) { return false }
			return inst.tanimla({ parentPart: this, islem: _e.islem, listePart: _e.listePart, tanimOncesiEkIslemler, kaydedince: e => { this.tazele() } })
		}
		catch (ex) { hConfirm(getErrorText(ex), 'Yeni'); throw ex }
	}
	async degistirIstendi(e) {
		e = e || {}; const {tanimOncesiEkIslemler, gridWidget} = this, rowIndex = e.rowIndex ?? this.selectedRowIndex, rec = e.rec ?? gridWidget.getrowdata(rowIndex), mfSinif = this.getMFSinif(e);
		const tanimUISinif = this.getTanimUISinif($.extend({}, e, { mfSinif, rec })); if (!tanimUISinif) return false
		if (!rec) { hConfirm('Değiştirilecek satır seçilmelidir', ' '); return false }
		const {args} = this, {ozelTanimIslemi, table, tableAlias, aliasVeNokta} = mfSinif; let eskiInst, inst;
		const _e = { sender: this, listePart: this, islem: 'degistir', mfSinif, tanimUISinif, rec, rowIndex, args, table, alias: tableAlias, aliasVeNokta };
		if (ozelTanimIslemi) return await getFuncValue.call(this, ozelTanimIslemi, _e)
		try {
			const {yeniInstOlusturucu} = this; if (yeniInstOlusturucu) { eskiInst = await getFuncValue.call(this, yeniInstOlusturucu, _e) }
			if (eskiInst === undefined && mfSinif.yeniInstOlustur) { eskiInst = await mfSinif.yeniInstOlustur(_e) }
			if (eskiInst === undefined) eskiInst = new mfSinif(_e)
			if (eskiInst == null) return false; eskiInst.keySetValues({ rec });
			if (!await eskiInst.yukle($.extend({}, _e, { rec: null, _rec: rec }))) { const mesaj = 'Seçilen satır için bilgi yüklenemedi'; throw { isError: true, rc: 'instBelirle', errorText: mesaj } }
			inst = eskiInst.deepCopy();
			return inst.tanimla({ parentPart: this, islem: _e.islem, eskiInst, listePart: _e.listePart, tanimOncesiEkIslemler, kaydedince: e => { this.tazele() } })
		}
		catch (ex) { hConfirm(getErrorText(ex), 'Değiştir'); throw ex }
	}
	async kopyaIstendi(e) {
		e = e || {}; const {tanimOncesiEkIslemler, table, tableAlias, aliasVeNokta, gridWidget} = this, rowIndex = e.rowIndex ?? this.selectedRowIndex;
		const rec = e.rec ?? gridWidget.getrowdata(rowIndex), mfSinif = this.getMFSinif(e);
		const tanimUISinif = this.getTanimUISinif($.extend({}, e, { mfSinif, rec })); if (!tanimUISinif) return false
		if (!rec) { hConfirm('Kopyalanacak satır seçilmelidir', ' '); return false }
		const {args} = this, {ozelTanimIslemi} = mfSinif; let eskiInst, inst;
		const _e = { sender: this, listePart: this, islem: 'kopya', mfSinif, tanimUISinif, rec, rowIndex, args, table, alias: tableAlias, aliasVeNokta };
		if (ozelTanimIslemi) return await getFuncValue.call(this, ozelTanimIslemi, _e)
		try {
			const {yeniInstOlusturucu} = this; if (yeniInstOlusturucu) { eskiInst = await getFuncValue.call(this, yeniInstOlusturucu, _e) }
			if (eskiInst === undefined && mfSinif.yeniInstOlustur) eskiInst = await mfSinif.yeniInstOlustur(_e)
			if (eskiInst === undefined) eskiInst = new mfSinif(_e)
			if (eskiInst == null) return false; eskiInst.keySetValues({ rec });
			if (!await eskiInst.yukle($.extend({}, _e, { rec: null, _rec: rec }))) { const mesaj = 'Seçilen satır için bilgi yüklenemedi'; throw { isError: true, rc: 'instBelirle', errorText: mesaj } }
			eskiInst.kopyaIcinDuzenle(_e); inst = eskiInst.deepCopy(); return inst.tanimla({ parentPart: this, islem: _e.islem, eskiInst, listePart: _e.listePart, tanimOncesiEkIslemler, kaydedince: e => this.tazele() })
		}
		catch (ex) { hConfirm(getErrorText(ex), 'Kopyala'); throw ex }
	}
	async silIstendi(e) {
		const mfSinif = this.getMFSinif(e);
		if (mfSinif && !mfSinif.silinebilirmi) { hConfirm(`Silme işlemi yapılamaz`, ' '); return false }
		const {gridWidget} = this, rowIndexes = this.selectedRowIndexes, recs = rowIndexes.map(ind => gridWidget.getrowdata(ind)).filter(rec => !!rec);
		if ($.isEmptyObject(recs)) { hConfirm('Silinecek satırlar seçilmelidir', ' '); return false }
		let rdlg = await ehConfirm(`Seçilen ${recs.length} satır silinsin mi?`, ' '); if (!rdlg) return false
		try { showProgress(); const result = await this.silDevam($.extend({}, e, { mfSinif, recs, rowIndexes })); return result }
		catch (ex) { hConfirm(getErrorText(ex), 'Sil'); throw ex }
		finally { hideProgress(); gridWidget.clearselection(); this.tazele() }
	}
	async silDevam(e) {
		const {recs, rowIndexes, args} = e, mfSinif = e.mfSinif ?? this.getMFSinif(e), {ozelTanimIslemi} = mfSinif;
		const _e = { sender: this, listePart: this, islem: 'sil', mfSinif, recs, rowIndexes, args };
		if (ozelTanimIslemi) return await getFuncValue.call(this, ozelTanimIslemi, _e)
		const {sayacSaha} = mfSinif;
		for (const rec of recs) {
			_e.rec = rec; const {yeniInstOlusturucu} = this; let inst;
			if (yeniInstOlusturucu) { inst = await getFuncValue.call(this, yeniInstOlusturucu, _e) }
			if (inst === undefined && mfSinif.yeniInstOlustur) inst = await mfSinif.yeniInstOlustur(_e)
			if (inst === undefined) inst = new mfSinif(_e)
			if (inst == null) return false; inst.keySetValues({ rec });
			/*if (!await inst.yukle(_e)) { const mesaj = 'Seçilen satır için bilgi yüklenemedi'; throw { isError: true, rc: 'instBelirle', errorText: mesaj } }*/
			await inst.sil()
		}
	}
	basliklariDuzenleIstendi(e) {
		e = e || {}; const mfSinif = this.getMFSinif(e); const _e = $.extend({}, e, { mfSinif });
		let orjBaslikListesi = this.getOrjBaslikListesi(_e);
		if ($.isEmptyObject(orjBaslikListesi)) {
			const {ekTabloKolonlari, ozelKolonDuzenleBlock} = this, __e = { tabloKolonlari: [] }; 
			orjBaslikListesi = __e.tabloKolonlari; orjBaslikListesi.push(...this.defaultTabloKolonlari);
			if (ekTabloKolonlari) {
				const colAttrSet = asSet(orjBaslikListesi.map(colDef => colDef.belirtec));
				for (const colDef of ekTabloKolonlari) { if (!colAttrSet[colDef.belirtec]) orjBaslikListesi.push(colDef) }
			}
			if (ozelKolonDuzenleBlock) { let result = getFuncValue.call(this, ozelKolonDuzenleBlock, e); if (result != null) orjBaslikListesi = __e.tabloKolonlari = result }
		}
		const {duzTabloKolonlari} = this,  part = new GridKolonDuzenlePart({
			parentPart: this, mfSinif, orjBaslikListesi, gridTabloKolonlari: duzTabloKolonlari,
			tamamIslemi: e => {
				setTimeout(() => {
					const {layout, grid, args, builder} = this;
					if (mfSinif) { mfSinif.listeEkraniAc({ args }); setTimeout(() => this.layout.css('opacity', .8), 200); setTimeout(() => this.close(), 350) }
					else {
						layout.css('opacity', .8); const _e = $.extend({}, e, { sender: this, builder, grid, args: {} }); this.gridArgsDuzenle(_e);
						grid.jqxGrid('columns', _e.args.columns); setTimeout(layout => layout.css('opacity', 1), 100, layout)
					}
				}, 10)
			}
		}); part.run()
	}
	sabitBilgiRaporuIstendi(e) {
		e = e || {}; const mfSinif = this.getMFSinif(e), {secimler} = this;
		const {sabitBilgiRaporcuSinif} = mfSinif; if (!sabitBilgiRaporcuSinif) { return }
		const modelRapor = new sabitBilgiRaporcuSinif({ parentPart: this, mfSinif: mfSinif, secimler }); modelRapor.raporEkraniAc()
	}
	boyutlandirIstendi(e) { const {panelDuzenleyici} = this; if (panelDuzenleyici?.boyutlandirIstendi) { panelDuzenleyici?.boyutlandirIstendi(e) } }
	tekil() { this.tekilmi = true; return this } coklu() { this.tekilmi = false; return this }
}




/*
p = new MasterListePart({
	tekilmi: false,
	secimler: e => new Secimler({
		liste: {
			test1: new SecimString({ etiket: 'test 1' }),
			test2: new SecimText({ etiket: 'test 2', value: 'sabit bilgi', css: ['blue'] })
		}
	}),
	argsDuzenle: e => {
		$.extend(e.args, { showFilterRow: true })
	},
	islemTuslariDuzenle: e => {
		/-e.liste.unshift(
			{ id: 'secimler', handler: e => { e; debugger } }
		)-/
	},
	tabloKolonlari: [
		new GridKolon({ belirtec: 'a', text: 'A', genislikCh: 10 }),
		new GridKolon({ belirtec: 'b', text: 'B', genislikCh: 10 })
	],
	loadServerDataBlock: e => {
		return [
			{a:1, b:2},
			{a:4, b:5}
		]
	},
	bindingComplete: e => {
	},
	secince: e => {
	},
	acilinca: e => {
		const part = e.sender;
		const {header} = part
		/-new FormBuilder({
			part: part, layout: header, builders: []
		}).run()-/
	},
	kapaninca: e => {
	}
});
p.run()
*/
