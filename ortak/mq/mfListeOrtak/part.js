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
	get inExpKullanilirmi() { return this._inExpKullanilirmi } set inExpKullanilirmi(value) { this._inExpKullanilirmi = value }
	get panelDuzenleyici() { return this._panelDuzenleyici } set panelDuzenleyici(value) { this._panelDuzenleyici = value }
	getOrjBaslikListesi(e) {
		e ??= {}; let result = this.orjBaslikListesi; let {panelDuzenleyici} = this;
		if (result && !result.prototype && $.isFunction(result)) { result = getFuncValue.call(this, result, $.extend({}, e, { mfSinif: this.getMFSinif(), panelDuzenleyici })) }
		if (result == null) { let _e = $.extend({}, e, { liste: [] }); this.orjBaslikListesiDuzenle(e); result = _e.liste }
		if ($.isEmptyObject(result)) { result = this.getMFSinif(e)?.orjBaslikListesi }
		let ekKolonlar = panelDuzenleyici?.tabloKolonlari?.filter(colDef => colDef.ekKolonmu), colAttrSet = {}, _result = result || [];
		result = []; if (ekKolonlar?.length) {
			for (let colDef of ekKolonlar) { let {belirtec} = colDef; if (!colAttrSet[belirtec]) { colAttrSet[belirtec] = true; result.push(colDef) } }
		}
		for (let colDef of _result) { let {belirtec} = colDef; if (!colAttrSet[belirtec]) { result.push(colDef) } }
		return this._orjBaslikListesi = result
	}
	getListeBasliklari(e) {
		e ??= {}; let result = this.listeBasliklari; let {panelDuzenleyici} = this;
		if (result && !result.prototype && $.isFunction(result)) { result = getFuncValue.call(this, result, $.extend({}, e, { mfSinif: this.getMFSinif(), panelDuzenleyici })) }
		if (result == null) { let _e = $.extend({}, e, { liste: [] }); this.listeBasliklariDuzenle(e); result = _e.liste }
		if ($.isEmptyObject(result)) { result = this.getMFSinif(e)?.listeBasliklari }
		let orjBaslikListesi = this.getOrjBaslikListesi(e); if ($.isEmptyObject(result) && !$.isEmptyObject(orjBaslikListesi)) { result = orjBaslikListesi }
		let ekKolonlar = panelDuzenleyici?.tabloKolonlari, colAttrSet = {}, _result = result || [];
		result = []; if (ekKolonlar?.length) {
			for (let colDef of ekKolonlar) { let {belirtec} = colDef; if (colDef?.ekKolonmu && !colAttrSet[belirtec]) { colAttrSet[belirtec] = true; result.push(colDef) } }
		}
		for (let colDef of _result) { let {belirtec} = colDef; if (!colAttrSet[belirtec]) { result.push(colDef) } }
		return this._listeBasliklari = result || []
	}
	getMFSinif(e) { e ??= {}; let result = this.mfSinif; if (result && isClass(result)) { result = getFuncValue.call(this, result, e) } return this._mfSinif = result }
	getSecimler(e) { e ??= {}; let result = this.secimler; if (result && isInstance(result)) { result = getFuncValue.call(this, result, e) } return this._secimler = result }
	getTanimUISinif(e) {
		e ??= {}; let result = this.tanimUISinif;
		if (result && !result.prototype && $.isFunction(result)) { result = getFuncValue.call(this, result, e) }
		if (result == null) { result = this._tanimUISinif = e.mfSinif?.tanimUISinif }
		return result
	}
	getTanimlanabilirmi(e) {
		e ??= {}; let result = this._tanimlanabilirmi;
		if (result && !result.prototype && $.isFunction(result)) { result = getFuncValue.call(this, result, e) }
		if (result == null) { result = this._tanimlanabilirmi = e.mfSinif?.tanimlanabilirmi }
		return result
	}
	getDegistirilebilirmi(e) {
		e ??= {}; let result = this.degistirilebilirmi;
		if (result && !result.prototype && $.isFunction(result)) { result = getFuncValue.call(this, result, e) }
		if (result == null) { result = this._degistirilebilirmi = e.mfSinif?.degistirilebilirmi }
		return result
	}
	getSilinebilirmi(e) {
		e ??= {}; let result = this._silinebilirmi;
		if (result && !result.prototype && $.isFunction(result)) { result = getFuncValue.call(this, result, e) }
		if (result == null) { result = this._silinebilirmi = e.mfSinif?.silinebilirmi }
		return result
	}
	getInExpKullanilirmi(e) {
		e ??= {}; let {_inExpKullanilirmi: result} = this;
		if (isFunction(result)) { result = result.call(this, e) }
		if (result == null) { result = this._inExpKullanilirmi = e.mfSinif?.inExpKullanilirmi }
		return result
	}

	constructor(e) {
		e ??= {}; super(e); $.extend(this, {
			initBlock: e.initBlock ?? e.init, ozelQueryDuzenleBlock: e.ozelQueryDuzenleBlock ?? e.ozelQueryDuzenle,
			ozelQuerySonucuBlock: e.ozelQuerySonucuBlock ?? e.ozelQuerySonucu, veriYukleninceBlock: e.veriYuklenince ?? e.veriYukleninceBlock,
			yeniInstOlusturucu: e.yeniInstOlusturucu, tanimOncesiEkIslemler: e.tanimOncesiEkIslemler, _mfSinif: e.mfSinif, _secimler: e.secimler, _secimlerDuzenleBlock: e.secimlerDuzenleBlock ?? e.secimlerDuzenle,
			_tanimUISinif: e.tanimUISinif, _tanimlanabilirmi: e.tanimlanabilirmi, _silinebilirmi: e.silinebilirmi, _inExpKullanilirmi: e.inExpKullanilirmi,
			args: e.args, panelDuzenleyici: e.panelDuzenleyici
		});
		let mfSinif = this._mfSinif = this.getMFSinif(e); $.extend(e, { sender: this, gridPart: this, mfSinif });
		let {eConf} = e; if (eConf != null) { this.eConf = eConf }
		let secimler = e.secimler = this.getSecimler(e); let {sinifAdi} = e;
		if (mfSinif) { if (!secimler) { secimler = mfSinif.newSecimler } if (sinifAdi == null) { sinifAdi = mfSinif.listeSinifAdi ?? mfSinif.sinifAdi } }
		let _e = { ...e, sender: this, builder: this.builder, mfSinif, sinifAdi, secimler };
		if (secimler) {
			let {secimlerDuzenleBlock} = this;
			if (secimlerDuzenleBlock) {
				getFuncValue.call(this, secimlerDuzenleBlock, _e);
				let {secimler: result} = _e; if (result !== undefined) { secimler = _e.secimler }
			}
		}
		this._secimler = secimler;
		let {panelDuzenleyici} = this; if (!panelDuzenleyici && mfSinif?.orjBaslikListesi_getPanelDuzenleyici) {
			panelDuzenleyici = mfSinif.orjBaslikListesi_getPanelDuzenleyici(_e) }
		/* if (!panelDuzenleyici) { panelDuzenleyici = new GridPanelDuzenleyici() } */
		if (panelDuzenleyici) {
			let grupAttrListe = mfSinif?.orjBaslikListesi_panelGrupAttrListe || [], ustSeviyeAttrListe = mfSinif?.orjBaslikListesi_panelUstSeviyeAttrListe || [];
			if (!grupAttrListe?.length && ustSeviyeAttrListe?.length) { grupAttrListe = [...ustSeviyeAttrListe] }
			else if (grupAttrListe?.length && !ustSeviyeAttrListe?.length) { ustSeviyeAttrListe = [...grupAttrListe] }
			let groups = mfSinif?.orjBaslikListesi_getGroups(e); if (groups?.length) { ustSeviyeAttrListe.push(...groups) }
			$.extend(panelDuzenleyici, { gridPart: this, grupAttrListe, ustSeviyeAttrListe });
			if (!panelDuzenleyici.colCount) { panelDuzenleyici.colCount = e => this.getColCount(e) }
		}
		this.panelDuzenleyici = panelDuzenleyici;
		this.title = e.title == null ? ( ( sinifAdi ? `<span class="wnd-title sinifAdi">${sinifAdi}</span> listesi` : null ) || 'Liste Ekranı' ) : e.title;
		let {args} = this; if (!$.isEmptyObject(args)) { $.extend(this, args) }
		this.initBlock?.call(this, _e)
	}
	runDevam(e) {
		e ??= {}; let mfSinif = this.getMFSinif(e), {layout} = this; $.extend(e, { layout, sender: this });
		if (mfSinif) {
			let {parentMFSinif} = mfSinif; if (parentMFSinif) { layout.addClass(parentMFSinif.dataKey ?? parentMFSinif.classKey ?? mfSinif.name) }
			layout.addClass(mfSinif.dataKey ?? mfSinif.classKey ?? mfSinif.name); if (mfSinif.listeEkrani_init) { mfSinif.listeEkrani_init(e) };
		}
		super.runDevam(e); this.initBulForm(e)
	}
	afterRun(e) {
		e ??= {}; super.afterRun(e); let mfSinif = this.getMFSinif(e); let {parent, layout} = this; let {builder} = this;
		$.extend(e, { sender: this, parent, layout });
		if (!builder && mfSinif?.getRootFormBuilder_listeEkrani) { let _e = $.extend({}, e); builder = this.builder = mfSinif.getRootFormBuilder_listeEkrani(_e) }
		if (builder && !builder._afterRun_calistimi) {
			builder.part = this; let _parent = builder.parent, _layout = builder.layout; this.builder = builder;
			if (!(parent?.length || layout?.length)) _layout = builder.layout = layout
			let _id = builder.id; if (!_id) { _id = builder.id = builder.newElementId() }
			builder.autoInitLayout(); builder.run()
		}
		$.extend(e, { layout, sender: this, gridPart: this, builder }); if (mfSinif?.listeEkrani_afterRun) { mfSinif.listeEkrani_afterRun(e) }
	}
	destroyPart(e) {
		let {layout, builder} = this, mfSinif = this.getMFSinif(); $.extend(e, { layout, sender: this, gridPart: this, builder });
		if (mfSinif?.listeEkrani_destroyPart) { mfSinif.listeEkrani_destroyPart(e) }
		let {secimlerPart} = this; if (secimlerPart) { secimlerPart.close(e); secimlerPart.destroyPart() }
		super.destroyPart(e); $('body').removeClass('bg-modal')
	}
	activated(e) {
		e ??= {}; super.activated(e); if (!this._activatedFlag) { this._activatedFlag = true; return }
		let {layout, builder} = this, mfSinif = this.getMFSinif(); $.extend(e, { layout, sender: this, gridPart: this, builder });
		if (mfSinif?.listeEkrani_activated) { mfSinif.listeEkrani_activated(e) }
	}
	deactivated(e) {
		super.deactivated(e); if (!this._activatedFlag) { this._activatedFlag = true; return }
		let {layout, builder} = this, mfSinif = this.getMFSinif(); $.extend(e, { layout, sender: this, gridPart: this, builder });
		if (mfSinif?.listeEkrani_deactivated) { mfSinif.listeEkrani_deactivated(e) }
	}
	initBulForm(e) {
		let {layout, bulForm} = this;
		if (!bulForm?.length) { bulForm = layout.find('#bulForm') }
		if (!bulForm?.length) { bulForm = layout.find('.bulForm') }
		if (bulForm?.length) {
			let mfSinif = this.getMFSinif(e);
			if (!mfSinif || mfSinif.bulFormKullanilirmi) {
				let {bulPart} = this; if (!bulPart) {
					bulPart = this.bulPart = new FiltreFormPart({
						layout: bulForm,
						degisince: e => { let {tokens} = e; this.hizliBulIslemi({ sender: this, layout, tokens }) }
					});
					bulPart.run()
				}
			}
			else { bulForm.addClass('jqx-hidden') }
		}
	}
	hizliBulIslemi(e) {
		let mfSinif = this.getMFSinif();
		if (mfSinif?.orjBaslikListesi_hizliBulIslemi?.(e) === false) { return }
		return super.hizliBulIslemi(e)
	}
	islemTuslariDuzenle(e) {
		let mfSinif = this.getMFSinif(), {secimler, panelDuzenleyici} = this
		panelDuzenleyici?.islemTuslariDuzenle_listeEkrani_ilk?.(_e)
		mfSinif?.islemTuslariDuzenle_listeEkrani_ilk?.(e)
		super.islemTuslariDuzenle(e); let {liste} = e; let yListe = [];
		if (!panelDuzenleyici && (!mfSinif || mfSinif?.kolonDuzenlemeYapilirmi))
			yListe.push({ id: 'basliklariDuzenle', handler: e => this.basliklariDuzenleIstendi(e) })
		if (secimler && mfSinif?.raporKullanilirmi)
			yListe.push({ id: 'rapor', handler: e => this.sabitBilgiRaporuIstendi(e) })
		if (!panelDuzenleyici && (!mfSinif || mfSinif?.kolonFiltreKullanilirmi))
			yListe.push({ id: 'kolonFiltre', handler: e => this.kolonFiltreIstendi(e) })
		if (secimler)
			yListe.push({ id: 'secimler', handler: e => this.secimlerIstendi(e) })
		if (!panelDuzenleyici && (!mfSinif || mfSinif?.gridIslemTuslariKullanilirmi)) {
			yListe.push(
				{ id: 'yazdir', handler: _e => this.gridYazdir({ ...e, ..._e }) },
				{ id: 'excel', handler: _e => this.gridExport_excel({ ...e, ..._e }) }
			)
		}
		let _e = $.extend({}, e, { mfSinif, secimler, orjListe: yListe });
		let tanimlanabilirmi = this.getTanimlanabilirmi(_e), degistirilebilirmi = this.getDegistirilebilirmi(_e)
		let silinebilirmi = this.getSilinebilirmi(_e), inExpKullanilirmi = this.getInExpKullanilirmi(_e)
		if (tanimlanabilirmi)
			yListe.push({ id: 'yeni', handler: e => this.yeniIstendi(e) })
		if (degistirilebilirmi)
			yListe.push({ id: 'degistir', handler: e => this.degistirIstendi(e) })
		if (tanimlanabilirmi)
			yListe.push({ id: 'kopya', handler: e => this.kopyaIstendi(e) })
		if (inExpKullanilirmi) {
			if (tanimlanabilirmi)
				yListe.push({ id: 'import', handler: e => this.importIstendi(e) })
			yListe.push({ id: 'export', handler: e => this.exportIstendi(e) })
		}
		if (silinebilirmi)
			yListe.push({ id: 'sil', args: { template: 'danger' }, handler: e => this.silIstendi(e) })
		if (!$.isEmptyObject(liste))
			yListe.push(...liste)
		e.liste = yListe
		panelDuzenleyici?.islemTuslariDuzenle_listeEkrani?.(_e)
		mfSinif?.islemTuslariDuzenle_listeEkrani?.(e)
		yListe = e.liste;
		let ozelIdSet = asSet(['tazele', 'vazgec']), items = yListe.filter(item => ozelIdSet[item.id])
		if (items?.length)
			yListe = [...yListe.filter(item => !ozelIdSet[item.id]), ...items]
		e.liste = yListe
	}
	gridInit(e) {
		super.gridInit(e); let {grid, gridWidget} = this; this.expandedIndexes = {}; let {panelDuzenleyici} = this, mfSinif = this.getMFSinif();
		/*let animation = 'grid-open-fast'; if (!noAnimateFlag) { grid.addClass(animation); clearTimeout(this.timer_animate); this.timer_animate = setTimeout(() => { grid.removeClass(animation); delete this.timer_animate }, 2000) }*/
		let _e = $.extend({}, e, { sender: this, mfSinif, grid, gridWidget });
		if (panelDuzenleyici?.gridInit) { panelDuzenleyici.gridInit(_e) } if (mfSinif?.orjBaslikListesi_gridInit) { mfSinif.orjBaslikListesi_gridInit(_e) }
	}
	gridArgsDuzenleDevam(e) {
		super.gridArgsDuzenleDevam(e); let {args} = e, mfSinif = this.getMFSinif(), {panelDuzenleyici} = this;
		$.extend(args, { autoShowLoadElement: true, showGroupsHeader: true, showFilterRow: false, filterMode: 'default' /* virtualMode: true */ });
		if (panelDuzenleyici?.gridArgsDuzenle) { panelDuzenleyici.gridArgsDuzenle(e) }
		if (mfSinif) {
			if (mfSinif.gridDetaylimi) {
				$.extend(args, {
					selectionMode: 'checkbox', /* virtualMode: true, */ rowDetails: true,
					rowDetailsTemplate: rowIndex => ({ rowdetails: `<div class="detay-grid-parent dock-bottom"><div class="detay-grid"/></div>`, rowdetailsheight: 350 }),
					initRowDetails: (rowIndex, _parent, grid, parentRec) => { let parent = $(_parent).find('.detay-grid'); this.initRowDetails({ rowIndex, parent, parentRec }) }
				})
			}
			if (mfSinif.orjBaslikListesi_argsDuzenle) { mfSinif.orjBaslikListesi_argsDuzenle(e) }
			let rowsHeight = this.getRowsHeight(e); if (rowsHeight) { $.extend(args, { rowsHeight }) }
		}
		else {
			let yerelParam = app.params.yerel || {}, mfSinif2KolonAyarlari = yerelParam.mfSinif2KolonAyarlari = yerelParam.mfSinif2KolonAyarlari || {};
			let ignoreAttrSet = asSet(['_rowNumber']), yerelParamBelirtec = mfSinif?.yerelParamBelirtec || this.class.classKey;
			let kolonAyarlari = {}; if (yerelParamBelirtec) kolonAyarlari = mfSinif2KolonAyarlari[yerelParamBelirtec] || {};
			let gorunumSet = asSet(kolonAyarlari.gorunumListesi || []);
			if (!$.isEmptyObject(gorunumSet)) { e.tabloKolonlari = e.tabloKolonlari.filter(colDef => { let {belirtec} = colDef; return ignoreAttrSet[belirtec] || gorunumSet[belirtec] }) }
		}
	}
	initRowDetails(e) {
		e = $.extend({}, e, { parentPart: this });
		let {grid, gridWidget} = this, {parent, parentRec, rowIndex} = e, mfSinif = e.mfSinif = this.getMFSinif(e);
		if (mfSinif?.orjBaslikListesi_initRowDetails) {
			let _e = $.extend({}, e, { sender: this, mfSinif, grid, gridWidget });
			try { let result = mfSinif.orjBaslikListesi_initRowDetails(_e); if (result === false) { gridWidget.hiderowdetails(rowIndex); return } }
			catch (ex) { hConfirm(getErrorText(ex), 'Detay Grid Gösterim'); throw ex }
		}
		let detGridPart = e.detGridPart = new GridliGostericiPart({
			parentPart: this, parentBuilder: this.builder,
			layout: parent, argsDuzenle: e => {
				let {args} = e; $.extend(args, {
					virtualMode: false, selectionMode: 'multiplerowsextended',
					showGroupsHeader: true, groupsExpandedByDefault: true
				});
				let mfSinif = this.getMFSinif(e); if (mfSinif?.orjBaslikListesi_argsDuzenle_detaylar) { mfSinif.orjBaslikListesi_argsDuzenle_detaylar(e) }
			},
			tabloKolonlari: e => this.tabloKolonlari_detaylar,
			loadServerData: async _e => {
				let {mfSinif, secimler, args} = this;
				$.extend(_e, {
					gridPart: this, sender: this, mfSinif, secimler, parent, parentRec,
					gridPart: detGridPart, grid: detGridPart.grid, gridWidget: detGridPart.gridWidget, args
				});
				try { return await this.loadServerData_detaylar(_e) }
				catch (ex) { console.error(ex); let errorText = getErrorText(ex); hConfirm(`<div style="color: firebrick;">${errorText}</div>`, 'Grid Verisi Alınamadı') }
			},
			veriYuklenince: e => { let {mfSinif} = this; if (mfSinif.gridVeriYuklendi_detaylar) { return mfSinif.gridVeriYuklendi_detaylar(e) } }
		}).noAnimate();
		detGridPart.run();
		if (mfSinif?.orjBaslikListesi_initRowDetails_son) {
			let _e = $.extend({}, e, { sender: this, mfSinif, grid, gridWidget });
			try {
				let result = mfSinif.orjBaslikListesi_initRowDetails_son(_e);
				if (result === false) { gridWidget.hiderowdetails(rowIndex); return }
			}
			catch (ex) { hConfirm(getErrorText(ex), 'Detay Grid Gösterim'); throw ex }
		}
	}
	gridContextMenuIstendi(e) {
		let mfSinif = this.getMFSinif(); if (mfSinif?.orjBaslikListesi_gridContextMenuIstendi) { if (mfSinif.orjBaslikListesi_gridContextMenuIstendi(e) === false) { return } }
		super.gridContextMenuIstendi(e)
	}
	gridRendered(e) { super.gridRendered(e); let mfSinif = this.getMFSinif(); if (mfSinif?.orjBaslikListesi_gridRendered) { mfSinif.orjBaslikListesi_gridRendered(e) } }
	gridRowExpanded(e) {
		super.gridRowExpanded(e); let mfSinif = this.getMFSinif(); if (mfSinif?.orjBaslikListesi_rowExpanding) { if (mfSinif.orjBaslikListesi_rowExpanding(e) === false) { return } }
		let {grid, gridWidget, expandedIndexes} = this, evt = e.event || {}, args = evt.args || {}, index = gridWidget.getrowboundindex(args.rowindex);
		if (index != null && index > -1) {
			/*let animation = 'grid-open'; grid.removeClass('grid-open grid-open-fast grid-open-slow');
			setTimeout(() => {
				grid.addClass(animation); clearTimeout(this.timer_animate);
				this.timer_animate = setTimeout(() => { grid.removeClass(animation); delete this.timer_animate }, 4000)
			}, 5);*/
			try { gridWidget.beginupdate() } catch (ex) { } gridWidget.clearselection(); gridWidget.selectrow(index);
			if (!$.isEmptyObject(expandedIndexes)) { for (let _index in expandedIndexes) { _index = asInteger(_index); if (index != _index) { gridWidget.hiderowdetails(_index) } } }
			expandedIndexes[index] = true; /*setTimeout(() => gridWidget.ensurerowvisible(index > 0 ? index - 1 : index), 10)*/
			try { gridWidget.endupdate(false) } catch (ex) { }
			try { gridWidget.ensurerowvisible(index) } catch (ex) { console.error(ex) }
		}
		if (mfSinif?.orjBaslikListesi_rowExpanded) { mfSinif.orjBaslikListesi_rowExpanded(e) }
	}
	gridRowCollapsed(e) {
		super.gridRowCollapsed(e); let mfSinif = this.getMFSinif(); if (mfSinif?.orjBaslikListesi_rowCollapsing) { if (mfSinif.orjBaslikListesi_rowCollapsing(e) === false) { return } }
		let {gridWidget, expandedIndexes} = this, evt = e.event || {}, args = evt.args || {}, index = gridWidget.getrowboundindex(args.rowindex);
		if (index != null && index > -1) { delete expandedIndexes[index] }
		if (mfSinif?.orjBaslikListesi_rowCollapsed) { mfSinif.orjBaslikListesi_rowCollapsed(e) }
	}
	gridGroupExpanded(e) { super.gridGroupExpanded(e); let mfSinif = this.getMFSinif(); if (mfSinif?.orjBaslikListesi_groupExpanded) { mfSinif.orjBaslikListesi_groupExpanded(e) } }
	gridGroupCollapsed(e) { super.gridGroupCollapsed(e); let mfSinif = this.getMFSinif(); if (mfSinif?.orjBaslikListesi_groupCollapsed) { mfSinif.orjBaslikListesi_groupCollapsed(e) } }
	orjBaslikListesiDuzenle(e) { } listeBasliklariDuzenle(e) { }
	get defaultTabloKolonlari() {
		let e = {}; let mfSinif = e.mfSinif = this.getMFSinif(e); let tabloKolonlari = super.defaultTabloKolonlari || [], colAttrSet = asSet(tabloKolonlari.map(colDef => colDef.belirtec));
		/* let ignoreAttrSet = asSet(['_rowNumber']); */ let listeBasliklari = this.getListeBasliklari({ mfSinif }), sayacSaha = mfSinif?.sayacSaha;
		for (let colDef of listeBasliklari) {
			let {belirtec} = colDef;
			if (!colAttrSet[belirtec] && (belirtec == sayacSaha ? !mfSinif || mfSinif.sayacSahaGosterilirmi : true)) { tabloKolonlari.push(colDef) }
		}
		let {panelDuzenleyici} = this; if (panelDuzenleyici?.tabloKolonlariDuzenle) {
			let _e = $.extend({}, e, { liste: tabloKolonlari }); panelDuzenleyici.tabloKolonlariDuzenle(_e);
			colAttrSet = {}; tabloKolonlari = []; let _tabloKolonlari = _e.liste;
			if (_tabloKolonlari) {
				for (let colDef of _tabloKolonlari) {
					if (!colDef) { continue } let {belirtec} = colDef;
					if (!colAttrSet[belirtec]) { colAttrSet[belirtec] = true; tabloKolonlari.push(colDef) }
				}
			}
		}
		return tabloKolonlari
	}
	defaultLoadServerData(e) {
		e ??= {}; let mfSinif = this.getMFSinif(e); e.args = this.args;
		if (!mfSinif) { return super.defaultLoadServerData(e) }
		let {builder, tabloKolonlari, secimler, ozelQueryDuzenleBlock, ozelQuerySonucuBlock} = this;
		let _e = { sender: this, builder, tabloKolonlari, mfSinif, secimler, ozelQueryDuzenleBlock, ozelQuerySonucuBlock, e };
		return mfSinif.loadServerData(_e)
	}
	loadServerData_recsDuzenle_ilk(e) {
		super.loadServerData_recsDuzenle(e); let mfSinif = e.mfSinif = this.getMFSinif(e); let {recs} = e; e.args = this.args;
		if (mfSinif?.orjBaslikListesi_recsDuzenle) { let _recs = mfSinif.orjBaslikListesi_recsDuzenle(e); recs = e.recs; if (_recs) { recs = e.recs = _recs } }
		return super.loadServerData_recsDuzenle_ilk(e)
	}
	loadServerData_recsDuzenle(e) {
		let recs = super.loadServerData_recsDuzenle(e); if (recs == null) { recs = e.recs } let mfSinif = this.getMFSinif(e);
		let {panelDuzenleyici} = this; if (panelDuzenleyici?.recsDuzenle) { let _recs = panelDuzenleyici.recsDuzenle(e); if (_recs) { recs = e.recs = _recs } }
		if (mfSinif?.orjBaslikListesi_recsDuzenleSon) { let _recs = mfSinif.orjBaslikListesi_recsDuzenleSon(e); recs = e.recs; if (_recs) { recs = e.recs = _recs } }
		return recs
	}
	get tabloKolonlari_detaylar() { let {mfSinif} = this; return mfSinif.listeBasliklari_detaylar }
	loadServerData_detaylar(e) {
		e ??= {}; let {grid, wsArgs} = e; e.args = this.args;
		if (wsArgs && grid?.length) {
			if (!grid.jqxGrid('pageable')) {
				let keys = ['recordstartindex', 'recordendindex', 'pagenum', 'pageindex', 'pagesize']; for (let key of keys) { delete wsArgs[key] } }
		}
		let mfSinif = this.getMFSinif();
		try { let _e = { ...e, sender: this, tabloKolonlari: this.tabloKolonlari_detaylar, fisSinif: mfSinif }; return mfSinif.loadServerData_detaylar(_e) }
		catch (ex) { console.error(ex); let errorText = getErrorText(ex); hConfirm(`<div style="color: firebrick;">${errorText}</div>`, 'Detay Grid Verisi Alınamadı') }
	}
	 static async openContextMenu(e) {
		let evt = e.event, gridPart = e.gridPart ?? e.sender ?? e.parentPart, gridWidget = gridPart?.gridWidget, cells = gridWidget?.getselectedcells();
		let belirtec = gridPart?.selectedBelirtec, parentRec = e.parentRec = e.parentRec ?? gridPart?.selectedRec;
		let recs = (e.recs ?? gridPart?.getSubRecs(e) ?? [])?.filter(rec => !!rec), rec = e.rec = (recs || [])[0]; /*if (!rec) { return null }*/
		let title = e.title ?? 'Menü'; let wnd, wndContent = $(`<div class="full-wh"/>`);
		let close = e => {
			if (!wnd?.length) { return }
			try { wnd.jqxWindow('close'); wnd = null } catch (ex) { console.error(ex); hConfirm(getErrorText(ex), title) }
		};
		let rfb = new RootFormBuilder({ parentPart: gridPart, layout: wndContent }).autoInitLayout();
		let form = rfb.addFormWithParent('islemTuslari').altAlta().addStyle(...[
			e => `$elementCSS button { font-size: 120%; width: var(--full) !important; height: 50px !important; margin: 5px 0 0 5px; margin-block-end: 5px }`,
			e => `$elementCSS button.jqx-fill-state-normal { background-color: whitesmoke !important }`,
			e => `$elementCSS button.jqx-fill-state-hover { background-color: #d9e0f0 !important }`,
			e => `$elementCSS button.jqx-fill-state-pressed { color: whitesmoke !important; background-color: royalblue !important }`
		]);
		 $.extend(e, {
			evt, sender: this, gridPart, gridWidget, cells, recs, belirtec, title, close, rfb, form,
			wndArgs: { isModal: false, closeButtonAction: 'close', width: Math.min(700, $(window).width() - 50), height: Math.min(350, $(window).height() - 100) }
		});
		let {formDuzenleyici} = e; if (formDuzenleyici) { let result = await getFuncValue.call(this, formDuzenleyici, e); if (result === false) { return false } }
		let wndArgsDuzenleyici = e.wndArgsDuzenle ?? e.wndArgsDuzenleyici ?? e.argsDuzenle; if (wndArgsDuzenleyici) { getFuncValue.call(this, wndArgsDuzenleyici, e) }
		wnd = e.wnd = createJQXWindow({ content: wndContent, title, args: e.wndArgs }); wndContent = e.wndContent = wnd.find('div > .content > .subContent');
		let mfSinif = e.mfSinif ?? gridPart?.getMFSinif?.() ?? gridPart?.mfSinif;
		let wndClassNames = [mfSinif?.name, ...this.wndClassNames, 'contextMenu'].filter(x => !!x); wnd.addClass(wndClassNames.filter(x => !!x));
		rfb.onAfterRun(e => { setTimeout(() => e.builder.id2Builder.islemTuslari.layout.find(`:eq(0) > button`).focus(), 100) })
		rfb.run(); wnd.on('close', evt => { $('body').removeClass('bg-modal'); wnd.jqxWindow('destroy'); wnd = null }); $('body').addClass('bg-modal');
		return e
	}
	async openContextMenu(e) { return this.class.openContextMenu(e) }
	getColCount(e) {
		e ??= {}; let mfSinif = this.getMFSinif(e), {paramGlobals} = mfSinif; let result = paramGlobals?.colCount;
		if (!result) {
			let maxColCount = mfSinif.orjBaslikListesi_maxColCount, part = this, {recs} = e, recCount = recs?.length, width = $(window).width();
			if (width <= 680) { result = 2 }
			else if (width <= 850) { result = 3 }
			else if (width <= 1000) { result = 4 }
			else { result = mfSinif?.orjBaslikListesi_defaultColCount || mfSinif?.orjBaslikListesi_maxColCount }
			if (recCount != null) { result = Math.min(result, recs.length) }
		}
		return result
	}
	getRowsHeight(e) {
		let mfSinif = this.getMFSinif(e), {paramGlobals} = mfSinif
		return paramGlobals?.rowsHeight || mfSinif?.orjBaslikListesi_defaultRowsHeight
	}
	getParentRecAtIndex(rowIndex, gridPart) {
		let {gridWidget} = this ?? {}
		rowIndex ??= -1
		return (rowIndex < 0 ? null : gridWidget.getrowdata(rowIndex)) ?? this.selectedRec
	}
	getSubRecs(e) { return this.panelDuzenleyici?.getSubRecs(e) } getSubRec(e) { return this.panelDuzenleyici?.getSubRec(e) }
	async tazeleIstendi(e) {
		let mfSinif = this.getMFSinif(e)
		if (await mfSinif?.gridTazeleIstendi?.(e) === false)
			return false
		return await super.tazeleIstendi(e)
	}
	gridSatirTiklandi(e) {
		e ??= {}; let mfSinif = this.getMFSinif()
		if (mfSinif?.orjBaslikListesi_satirTiklandi?.(e) === false)
			return false
		return super.gridSatirTiklandi(e)
	}
	gridSatirCiftTiklandi(e = {}) {
		let {secince} = this, mfSinif = this.getMFSinif()
		if (mfSinif?.orjBaslikListesi_satirCiftTiklandi?.(e) === false)
			return false
		if (super.gridSatirCiftTiklandi(e) === false)
			return false
		let degistirilebilirmi = this.getDegistirilebilirmi({ ...e, mfSinif })
		if (!secince && degistirilebilirmi) {
			let args = e.event?.args ?? {}
			this.degistirIstendi({ ...e, mfSinif, rec: args.owner.getrowdata(args.rowindex), rowIndex: args.rowindex })
			return false
		}
		return true
	}
	gridHucreTiklandi(e) {
		e ??= {}; let mfSinif = this.getMFSinif(); if (mfSinif?.orjBaslikListesi_hucreTiklandi) { if (mfSinif.orjBaslikListesi_hucreTiklandi(e) === false) { return false } }
		return super.gridHucreTiklandi(e)
	}
	gridHucreCiftTiklandi(e) {
		e ??= {}; let mfSinif = this.getMFSinif(); if (mfSinif?.orjBaslikListesi_hucreCiftTiklandi) { if (mfSinif.orjBaslikListesi_hucreCiftTiklandi(e) === false) { return false } }
		return super.gridHucreCiftTiklandi(e)
	}
	gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e); let {mfSinif, panelDuzenleyici, grid, bulPart} = this;
		if (mfSinif) { let groups = mfSinif.orjBaslikListesi_getGroups(e); if (groups?.length) { grid.jqxGrid('groups', groups) } }
		if (panelDuzenleyici?.gridVeriYuklendi) { panelDuzenleyici.gridVeriYuklendi(e) }
		if (mfSinif) { mfSinif.gridVeriYuklendi(e) }
		if ((!mfSinif || mfSinif.bulFormKullanilirmi) && bulPart?.layout?.length) { let {noAutoFocus} = mfSinif || {}; if (!noAutoFocus) { setTimeout(() => bulPart.focus(), 50) } }
		let {veriYukleninceBlock: veriYuklenince} = this; if (veriYuklenince) { getFuncValue.call(this, veriYuklenince, e) }
	}
	secimlerIstendi(e) {
		let {secimlerPart} = this; if (secimlerPart) { secimlerPart.show() }
		else {
			let {secimler} = this; if (secimler) {
				secimlerPart = this.secimlerPart =
					secimler.duzenlemeEkraniAc({ parentPart: this, tamamIslemi: e => this.tazele() })
			}
		}
	}
	async yeniIstendi(e) {
		let mfSinif = this.getMFSinif(e), {tanimOncesiEkIslemler, gridWidget} = this;
		let {args} = this, {ozelTanimIslemi, table, tableAlias, aliasVeNokta} = mfSinif, inst;
		let rowIndex = e?.rowIndex ?? gridWidget.getselectedrowindex(), rec = e?.rec ?? gridWidget.getrowdata(rowIndex);
		let _e = { sender: this, listePart: this, islem: 'yeni', mfSinif, rec, rowIndex, args, table };
		let tanimUISinif = _e.tanimUISinif = this.getTanimUISinif(_e);
		if (ozelTanimIslemi) {
			let result = await getFuncValue.call(this, ozelTanimIslemi, _e);
			if (result !== false) { return result }
		}
		if (!tanimUISinif) { return false }
		try {
			let {yeniInstOlusturucu} = this; if (yeniInstOlusturucu) { inst = await getFuncValue.call(this, yeniInstOlusturucu, _e) }
			if (inst === undefined && mfSinif.yeniInstOlustur) { inst = await mfSinif.yeniInstOlustur(_e) }
			if (inst === undefined) { inst = new mfSinif(_e) } if (inst == null) { return false }
			let {kaydedince: _kaydedince} = e ?? {}, kaydedince = e => { this.tazele(e); _kaydedince?.call(this, e) };
			return inst.tanimla({ parentPart: this, islem: _e.islem, listePart: _e.listePart, tanimOncesiEkIslemler, kaydedince })
		}
		catch (ex) { hConfirm(getErrorText(ex), 'Yeni'); throw ex }
	}
	async degistirIstendi(e) {
		e ??= {}; let {tanimOncesiEkIslemler, gridWidget} = this;
		let rowIndex = e.rowIndex ?? this.selectedRowIndex, rec = e.rec ?? gridWidget.getrowdata(rowIndex), mfSinif = this.getMFSinif(e);
		if (!rec) { wConfirm('Değiştirilecek satır seçilmelidir', ' '); return false }
		let {args} = this, {ozelTanimIslemi, table, tableAlias, aliasVeNokta} = mfSinif, eskiInst, inst;
		let _e = { sender: this, listePart: this, islem: 'degistir', mfSinif, rec, rowIndex, args, table, alias: tableAlias, aliasVeNokta };
		let tanimUISinif = _e.tanimUISinif = this.getTanimUISinif(_e);
		if (ozelTanimIslemi) {
			let result = await getFuncValue.call(this, ozelTanimIslemi, _e);
			if (result !== false) { return result }
		}
		if (!tanimUISinif) { return false }
		try {
			let {yeniInstOlusturucu} = this; if (yeniInstOlusturucu) { eskiInst = await getFuncValue.call(this, yeniInstOlusturucu, _e) }
			if (eskiInst === undefined) { eskiInst = await mfSinif.yeniInstOlustur?.(_e) }
			if (eskiInst === undefined) { eskiInst = new mfSinif(_e) }
			if (eskiInst == null) { return false }
			eskiInst.keySetValues({ rec });
			if (!await eskiInst.yukle({ ..._e, rec: null, _rec: rec })) {
				let mesaj = 'Seçilen satır için bilgi yüklenemedi';
				throw { isError: true, rc: 'instBelirle', errorText: mesaj }
			}
			inst = eskiInst.deepCopy();
			let {kaydedince: _kaydedince} = e ?? {}, kaydedince = e => { this.tazele(e); _kaydedince?.call(this, e) };
			return inst.tanimla({ parentPart: this, islem: _e.islem, eskiInst, listePart: _e.listePart, tanimOncesiEkIslemler, kaydedince })
		}
		catch (ex) { hConfirm(getErrorText(ex), 'Değiştir'); throw ex }
	}
	async kopyaIstendi(e) {
		e ??= {}; let {tanimOncesiEkIslemler, table, tableAlias, aliasVeNokta, gridWidget} = this;
		let rowIndex = e.rowIndex ?? this.selectedRowIndex, rec = e.rec ?? gridWidget.getrowdata(rowIndex), mfSinif = this.getMFSinif(e);
		if (!rec) { wConfirm('Kopyalanacak satır seçilmelidir', ' '); return false }
		let {args} = this, {ozelTanimIslemi} = mfSinif; let eskiInst, inst;
		let _e = { sender: this, listePart: this, islem: 'kopya', mfSinif, rec, rowIndex, args, table, alias: tableAlias, aliasVeNokta };
		let tanimUISinif = _e.tanimUISinif = this.getTanimUISinif(_e);
		if (ozelTanimIslemi) {
			let result = await getFuncValue.call(this, ozelTanimIslemi, _e);
			if (result !== false) { return result }
		}
		if (!tanimUISinif) { return false }
		try {
			let {yeniInstOlusturucu} = this; if (yeniInstOlusturucu) { eskiInst = await getFuncValue.call(this, yeniInstOlusturucu, _e) }
			if (eskiInst === undefined && mfSinif.yeniInstOlustur) eskiInst = await mfSinif.yeniInstOlustur(_e)
			if (eskiInst === undefined) { eskiInst = new mfSinif(_e) }
			if (eskiInst == null) return false; eskiInst.keySetValues({ rec });
			if (!await eskiInst.yukle($.extend({}, _e, { rec: null, _rec: rec }))) {
				let mesaj = 'Seçilen satır için bilgi yüklenemedi'
				throw { isError: true, rc: 'instBelirle', errorText: mesaj }
			}
			inst = await eskiInst.kopyaIcinDuzenle(_e) ?? eskiInst.deepCopy();
			let {kaydedince: _kaydedince} = e ?? {}, kaydedince = e => { this.tazele(e); _kaydedince?.call(this, e) };
			return inst.tanimla({ parentPart: this, islem: _e.islem, eskiInst, listePart: _e.listePart, tanimOncesiEkIslemler, kaydedince })
		}
		catch (ex) { hConfirm(getErrorText(ex), 'Kopyala'); throw ex }
	}
	async silIstendi(e) {
		let mfSinif = this.getMFSinif(e); if (mfSinif && !mfSinif.silinebilirmi) { hConfirm(`Silme işlemi yapılamaz`, ' '); return false }
		let {gridWidget} = this, rowIndexes = this.selectedRowIndexes, recs = rowIndexes.map(ind => gridWidget.getrowdata(ind)).filter(rec => !!rec);
		if ($.isEmptyObject(recs)) { wConfirm('Silinecek satırlar seçilmelidir', ' '); return false }
		let rdlg = await ehConfirm(`Seçilen ${recs.length} satır silinsin mi?`, ' '); if (!rdlg) return false
		try { showProgress(); let result = await this.silDevam($.extend({}, e, { mfSinif, recs, rowIndexes })); return result }
		catch (ex) { /*hConfirm(getErrorText(ex), 'Sil');*/ throw ex }
		finally { hideProgress(); gridWidget.clearselection(); this.tazele() }
	}
	async silDevam(e) {
		let {recs, rowIndexes} = e, {args} = this, mfSinif = e.mfSinif ?? this.getMFSinif(e), {ozelTanimIslemi} = mfSinif;
		let __e = { sender: this, listePart: this, islem: 'sil', mfSinif, rowIndexes, args }, _e = { ...__e, recs };
		if (ozelTanimIslemi) {
			let result = await getFuncValue.call(this, ozelTanimIslemi, _e);
			if (result !== false) { return result }
		}
		delete _e.rowIndexes; let {sayacSaha} = mfSinif
		let promises = []
		for (let rec of recs) {
			_e.rec = rec
			let {yeniInstOlusturucu} = this, inst
			if (yeniInstOlusturucu) { inst = await getFuncValue.call(this, yeniInstOlusturucu, _e) }
			if (inst === undefined && mfSinif.yeniInstOlustur) { inst = await mfSinif.yeniInstOlustur(_e) }
			if (inst === undefined) { inst = new mfSinif(_e) }
			if (inst == null) { return false }
			inst.keySetValues({ rec })
			/*if (!await inst.yukle(_e)) { let mesaj = 'Seçilen satır için bilgi yüklenemedi'; throw { isError: true, rc: 'instBelirle', errorText: mesaj } }*/
			promises.push(await inst.sil(__e))
		}
		if (promises.length) {
			await Promise.allSettled(promises)
			promises = []
		}
	}
	async exportIstendi(e) {
		e ??= {}; let {gridWidget, selectedRecs} = this;
		if (!selectedRecs?.length) { wConfirm('Dışa aktarılacak satırlar seçilmelidir', ' '); return false }
		let mfSinif = this.getMFSinif(e), {yeniInstOlusturucu} = this;
		let liste = await Promise.all(selectedRecs.map(async rec => {
			let inst = yeniInstOlusturucu ? await getFuncValue.call(this, yeniInstOlusturucu, e) : undefined;
			if (inst === undefined) { inst = await mfSinif.yeniInstOlustur?.(e) }
			if (inst === undefined) { inst = new mfSinif(e) }
			if (inst == null) { return null }
			inst.keySetValues({ rec });
			if (!await inst.yukle({ ...e, rec: null, _rec: rec })) {
				let mesaj = 'Seçilen satır için bilgi yüklenemedi';
				throw { isError: true, rc: 'instBelirle', errorText: mesaj }
			}
			return inst
		}));
		liste = liste.filter(x => x);
		if (!liste?.length) { wConfirm('Dışa aktarılacak uygun satır belirlenemedi', ' '); return false }
		mfSinif = liste[0].class;
		let exportRecs = await mfSinif.exportAll({ ...e, liste });
		if (!exportRecs?.length) { wConfirm('Dışa aktarılacak uygun veri belirlenemedi', ' '); return false }
		let exportName = await jqxPrompt({ title: `Dışa Aktar: (<span class="royalblue">${exportRecs.length} kayıt)`, etiket: 'İsim giriniz' });
		if (exportName == null) { return false }
		let data = toJSONStr(exportRecs);
		downloadData(data, exportName, wsContentType);
		return true
	}
	async exportIstendi(e) {
		e ??= {}; let {gridWidget, selectedRecs} = this, islemAdi = 'Dışarıya Aktar';
		if (!selectedRecs?.length) { wConfirm('Dışa aktarılacak satırlar seçilmelidir', islemAdi); return false }
		let mfSinif = this.getMFSinif(e), {yeniInstOlusturucu} = this;
		let liste = await Promise.all(selectedRecs.map(async rec => {
			let inst = yeniInstOlusturucu ? await getFuncValue.call(this, yeniInstOlusturucu, e) : undefined;
			if (inst === undefined) { inst = await mfSinif.yeniInstOlustur?.(e) }
			if (inst === undefined) { inst = new mfSinif(e) }
			if (inst == null) { return null }
			inst.keySetValues({ rec });
			if (!await inst.yukle({ ...e, rec: null, _rec: rec })) {
				let mesaj = 'Seçilen satır için bilgi yüklenemedi';
				throw { isError: true, rc: 'instBelirle', errorText: mesaj }
			}
			return inst
		}));
		liste = liste.filter(x => x);
		if (!liste?.length) { wConfirm('Dışa aktarılacak uygun satır belirlenemedi', islemAdi); return false }
		mfSinif = liste[0].class;
		let exportRecs = await mfSinif.exportAll({ ...e, liste });
		if (!exportRecs?.length) { wConfirm('Dışa aktarılacak uygun veri belirlenemedi', islemAdi); return false }
		let exportName = await jqxPrompt({ title: `${islemAdi}: (<span class="royalblue">${exportRecs.length} kayıt)`, etiket: 'İsim giriniz' });
		if (exportName == null) { return false }
		let data = toJSONStr(exportRecs);
		downloadData(data, exportName, wsContentType);
		return true
	}
	importIstendi(e) {
		e ??= {}; let {gridWidget} = this, mfSinif = this.getMFSinif(e), islemAdi = 'İçeri Al';
		if (mfSinif && !mfSinif.tanimlanabilirmi) { hConfirm('Tanımlama işlemi yapılamaz', islemAdi); return false }
		let recs; (async () => {    /* sender button disabled durumda kalmasın diye böyle yapıldı */
			try {
				let {data} = await openFile({ accept: wsContentType, type: wsDataType }) ?? {};
				recs = $.makeArray(data)  /* undefined/null gelse de sorun değil, aynı değeri döner o zaman */
			}
			catch (ex) { hConfirm(getErrorText(ex), islemAdi); return false }
			let instListe = await mfSinif.importAll({ ...e, recs });
			instListe = instListe.filter(x => x);
			if (!instListe.length) { hConfirm('İçeri alınacak uygun veri bulunamadı', islemAdi); return false }
			let results = await Promise.allSettled(instListe.map(inst => inst.kaydet()));
			let counts = { ok: 0, fail: 0 }, errors = [];
			for (let {status, value, reason} of results) {
				value ??= reason;
				let isOk = status == 'fulfilled' && !(value?.isError || value instanceof Error);
				counts[isOk ? 'ok' : 'fail']++;
				if (!isOk && value) { errors.push(value) }
			}
			if (counts.ok || counts.fail) {
				this.tazele(); let output = [];
				if (counts.ok) {
					output.push(`<li class="forestgreen"><b>${counts.ok} adet</b> kayıt yüklendi</li>`) }
				if (counts.fail) {
					output.push(`<li class="red"><b>${counts.fail} adet</b> kayıt yüklene<u>ME</u>di</li>`)
					if (errors.length) {
						output.push(`<ul style="margin-top: 5px">`);
						output.push(errors.map(err => `<li class="gray">${getErrorText(err) || err}</li>`))
						output.push(`</ul>`)
					}
				}
				let mesaj = `<ul>${output.join('')}</ul>`;
				window[counts.fail ? 'hConfirm' : 'eConfirm'](mesaj, islemAdi)
			}
		})();
		return true
	}
	basliklariDuzenleIstendi(e) {
		e ??= {}; let mfSinif = this.getMFSinif(e), _e = $.extend({}, e, { mfSinif });
		let orjBaslikListesi = this.getOrjBaslikListesi(_e);
		if ($.isEmptyObject(orjBaslikListesi)) {
			let {ekTabloKolonlari, ozelKolonDuzenleBlock} = this, __e = { tabloKolonlari: [] }; 
			orjBaslikListesi = __e.tabloKolonlari; orjBaslikListesi.push(...this.defaultTabloKolonlari);
			if (ekTabloKolonlari) {
				let colAttrSet = asSet(orjBaslikListesi.map(colDef => colDef.belirtec));
				for (let colDef of ekTabloKolonlari) { if (!colAttrSet[colDef.belirtec]) orjBaslikListesi.push(colDef) }
			}
			if (ozelKolonDuzenleBlock) { let result = getFuncValue.call(this, ozelKolonDuzenleBlock, e); if (result != null) orjBaslikListesi = __e.tabloKolonlari = result }
		}
		let {duzTabloKolonlari} = this,  part = new GridKolonDuzenlePart({
			parentPart: this, mfSinif, orjBaslikListesi, gridTabloKolonlari: duzTabloKolonlari,
			tamamIslemi: e => {
				setTimeout(() => {
					let {layout, grid, args, builder} = this;
					if (mfSinif) { mfSinif.listeEkraniAc({ args }); setTimeout(() => this.layout.css('opacity', .8), 200); setTimeout(() => this.close(), 350) }
					else {
						layout.css('opacity', .8); let _e = $.extend({}, e, { sender: this, builder, grid, args: {} }); this.gridArgsDuzenle(_e);
						grid.jqxGrid('columns', _e.args.columns); setTimeout(layout => layout.css('opacity', 1), 100, layout)
					}
				}, 10)
			}
		}); part.run()
	}
	sabitBilgiRaporuIstendi(e) {
		e ??= {}; let mfSinif = this.getMFSinif(e), {secimler} = this;
		let {sabitBilgiRaporcuSinif} = mfSinif; if (!sabitBilgiRaporcuSinif) { return }
		let modelRapor = new sabitBilgiRaporcuSinif({ parentPart: this, mfSinif: mfSinif, secimler }); modelRapor.raporEkraniAc()
	}
	boyutlandirIstendi(e) { let {panelDuzenleyici} = this; if (panelDuzenleyici?.boyutlandirIstendi) { panelDuzenleyici?.boyutlandirIstendi(e) } }
	async vazgecIstendi(e) {
		e = e ?? {}; let mfSinif = this.getMFSinif(e)
		if (await mfSinif?.listeEkrani_vazgecOncesi?.(e) === false) { return false }
		return await super.vazgecIstendi(e)
	}
	tekil() { this.tekilmi = true; return this } coklu() { this.tekilmi = false; return this }
	onInit(handler) { this.initBlock = handler; return this }
	secimlerDuzenleIslemi(handler) { this.secimlerDuzenleBlock = handler; return this }
	veriYuklenince(handler) { this.veriYukleninceBlock = handler; return this }
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
		let part = e.sender;
		let {header} = part
		/-new FormBuilder({
			part: part, layout: header, builders: []
		}).run()-/
	},
	kapaninca: e => {
	}
});
p.run()
*/
