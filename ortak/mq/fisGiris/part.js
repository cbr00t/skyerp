class FisGirisPart extends GridliGirisWindowPart {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get slowAnimationFlag() { return true }
	static get partName() { return 'fisGiris' } get formDeferMS() { return 150 } static get defaultCacheFlag() { return false } static get defaultAsyncFlag() { return false }
	get yenimi() { return this.islem == 'yeni' } get degistirmi() { return this.islem == 'degistir' }
	get kopyami() { return this.islem == 'kopya' } get silmi() { return this.islem == 'sil' } get izlemi() { return this.islem == 'izle' }
	get yeniVeyaKopyami() { return this.yenimi || this.kopyami } get degistirVeyaSilmi() { return this.degistirmi || this.silmi }
	get inst() { return this.fis } set inst(value) { return this.fis = value }
	get builder() {
		let result = this._builder;
		if (result && $.isFunction(result)) {
			const _e = { sender: this, commitFlag: false, commit() { this.commitFlag = true; return this }, temp() { this.commitFlag = false; return this } };
			result = getFuncValue.call(this, result, _e); if (_e.commitFlag) this._builder = result
		}
		return result
	}
	set builder(value) { this._builder = value }
	
	constructor(e) {
		e = e || {}; super(e);
		let fis = e.inst ?? e.fis, {mfSinif} = e; if (!fis && mfSinif) { fis = this.fis = new mfSinif() }
		$.extend(this, {
			islem: e.islem, listePart: e.listePart, eskiFis: e.eskiInst || e.eskiFis || null, fis: e.inst || e.fis,
			kaydetIslemi: e.kaydetIslemi, kaydedince: e.kaydedince, _builder: e.builder, dipEventsDisabledFlag: false, gridIslemTusYapilari: {}
		});
		if (!this.kontrolcu) { const gridKontrolcuSinif = fis.gridKontrolcuSinif || GridKontrolcu; this.kontrolcu = new gridKontrolcuSinif({ parentPart: this }) }
		fis = this.fis; let {listePart, wndArgs, islem} = this, {sinifAdi} = fis.class;
		this.title = e.title == null ? (( sinifAdi ? `<u style="font-size: 110%;">${sinifAdi}</u> Fiş Girişi` : null ) || 'Fiş Giriş Ekranı') : e.title || '';
		if (islem) { const islemText = islem[0].toUpperCase() + islem.slice(1); this.title += ` &nbsp;-&nbsp; <b class="window-title-ek">${islemText}</b>` }
	}
	runDevam(e) {
		e = e ?? {}; let islem = e.islem = this.islem;
		super.runDevam(e); const sender = this, {layout, fis, header, islemTuslari} = this;
		const splitMain = this.splitMain = layout.find('.main-split');
		const baslikFormlar = this.baslikFormlar = [header.find('.baslikForm1'), header.find('.baslikForm2'), header.find('.baslikForm3')];
		splitMain.jqxSplitter({
			theme, width: '100%', height: layout.height(), orientation: 'horizontal', splitBarSize: 20,
			panels: [ { min: 87, size: fis.class.getUISplitHeight({ ...e, fis, islem }) ?? 165 }, { min: 200 } ]
		});
		const subeForm = this.subeForm = header.find('.sube'), tsnForm = this.tsnForm = layout.find('.tsnForm');
		const divHeaderDipOrtak = this.divHeaderDipOrtak = layout.find('.headerDipOrtak'), dipForm = divHeaderDipOrtak.find('.dipForm');
		if (fis.class.dipKullanilirmi) {
			setTimeout(() => {
				dipForm.removeClass('jqx-hidden'); const fisDipPart = this.fisDipPart = new FisDipPart({ parentPart: this, layout: dipForm, islem, fis }); fisDipPart.run();
				const dipFormWidth = 335, splitHeaderDipOrtak = this.splitHeaderDipOrtak = layout.find('.headerDipOrtak');
				splitHeaderDipOrtak.jqxSplitter({
					theme, width: '100%', height: '100%', orientation: 'vertical', splitBarSize: 13,
					panels: [
						{ min: '75%', size: layout.width() - dipFormWidth, collapsible: false },
						{ min: 105, size: dipFormWidth }
					]
				})
			}, 50)
		}
		else { dipForm.addClass('jqx-hidden') }
		const splitGridVeIslemTuslari = this.splitGridVeIslemTuslari = layout.find('.gridVeIslemTuslari');
		const gridIslemTuslari = this.gridIslemTuslari = splitGridVeIslemTuslari.find('.gridIslemTuslari');
		let gridIslemTuslariWidth = asFloat(layout.css('--grid-islemTuslari-width').slice(0, -2));
		setTimeout(async () => {
			let _e = { ...e, sender, parent: $(document.createDocumentFragment()), islem, fis, layout, afterInit: [] };
			if (fis.uiDuzenle_fisGirisIslemTuslari) { await fis.uiDuzenle_fisGirisIslemTuslari(_e) }
			_e.parent.appendTo(gridIslemTuslari); gridIslemTuslari.removeClass('jqx-hidden basic-hidden');
			let buttons = gridIslemTuslari?.length ? gridIslemTuslari.find('button') : null; _e.buttons = buttons;
			if (buttons?.length) { buttons.jqxButton({ theme }) } else { layout.css('--grid-islemTuslari-width', '0px') }
			const {afterInit} = _e; if ($.isEmptyObject(afterInit)) { for (let i in afterInit) { const handler = afterInit[i]; getFuncValue.call(this, handler, _e) } }
			const {gridIslemTusYapilari} = this; for (let i = 0; i < buttons.length; i++) {
				const elm = buttons.eq(i), id = elm.prop('id');
				const clsElmInfo = class ElmInfo extends CObject {
					static { window[this.name] = this; this._key2Class[this.name] = this }
					constructor(e) { e = e || {}; super(e); for (const key in e) this[key] = e[key] }
					get id() { return this.elm.prop('id') } get text() { return this.elm.html() } get width() { return this.elm.width() } get height() { return this.elm.height() }
					get position() { return this.elm.position() } get offset() { return this.elm.offset() }
					css(key, value) { return this.elm.css(key, value) } html() { return this.elm.html() }
					click() { this.elm.click() } focus() { this.elm.focus() }
					on(eventName, handler) { this.elm.on(eventName, handler) }
					off(eventName, handler) { this.elm.off(eventName, handler) }
					once(eventName, handler) { this.elm.once(eventName, handler) }
				};
				gridIslemTusYapilari[id] = new clsElmInfo({ sender: this, parent: gridIslemTuslari, elm })
			}
			setTimeout(() => {
				splitGridVeIslemTuslari.jqxSplitter({
					theme, width: '100%', height: '100%', orientation: 'vertical', splitBarSize: 13, panels: 
					[
						{ min: gridIslemTuslariWidth, size: gridIslemTuslariWidth, collapsible: true, collapsed: false },
						{ min: layout.width() - gridIslemTuslariWidth, collapsible: false }
					]
				});
				/* splitGridVeIslemTuslari.jqxSplitter('collapse', 0) */
			}, 10)
		}, 0);
		this.noAnimate(); let _e = { ...e, sender, mfSinif: fis.class, fis, islem, layout, islemTuslari, subeForm, baslikFormlar, gridIslemTuslari };
		let promises = [fis.uiGirisOncesiIslemler(_e)];
		if (this.yeniVeyaKopyami) {
			promises.push(fis.yeniTanimOncesiIslemler(_e)); let css = 'opacity-0'; layout.addClass(css);
			Promise.all(promises).then(() =>
				this.tazele(_e)).finally(() => setTimeout(() => layout.removeClass(css), 1))
		}
	}
	afterRun(e) {
		e = e ?? {}; try {
			super.afterRun(e); if (app.activePart != this) { app._activePartStack.pop() }
			let sender = this, {fis, islem, layout, header, tsnForm, subeForm, islemTuslari, baslikFormlar, gridIslemTuslari, splitGridVeIslemTuslari} = this;
			let _e = { ...e, sender, fis, islem, layout, islemTuslari, subeForm, baslikFormlar, gridIslemTuslari };
			setTimeout(async () => {
				if (config.dev) { header.removeClass('jqx-hidden basic-hidden') }
				if (fis.uiDuzenle_fisGiris) { setTimeout(() => { fis.uiDuzenle_fisGiris(_e) }, 10) }
				await this.initFormBuilder(_e);
				let selectors = ['input[type=textarea].jqx-input-content', 'input[type=textbox]', 'input[type=text]', 'input[type=number]'];
				for (let selector of selectors) { let elm = layout.find(selector); if (elm.length) { elm.on('focus', evt => evt.target.select()) } }
				setTimeout(() => { if (header.height() < 10) splitMain.jqxSplitter('collapse', 0) }, 200)
				setTimeout(() => header.removeClass('jqx-hidden basic-hidden'), 500)
			}, 10);
			setTimeout(() => makeScrollable(header), 100);
			setTimeout(() => { this.onResize(e); if (!gridIslemTuslari.find(':not(div)').length) { splitGridVeIslemTuslari.jqxSplitter('collapse') } }, 300)
		}
		catch (ex) { hConfirm(getErrorText(ex), 'Fiş Giriş Ekranı'); throw ex }
	}
	async initFormBuilder(e) {
		let {builder} = this; const {fis} = this;
		if (!builder && fis) { let _e = { ...e, sender: this }; builder = (await fis.getRootFormBuilder(_e)) || (await fis.getFormBuilders(_e)) } if ($.isEmptyObject(builder)) { return }
		let {layout} = this, subBuilders = builder.isFormBuilder ? [builder] : builder, id2Builder = this.id2Builder = {};
		for (const builder of subBuilders) {
			if (!builder) { continue } builder.part = this; let _parent = builder.parent;
			if (builder.isRootFormBuilder) {
				this.builder = builder; let _layout = builder.layout;
				if (!(_parent?.length || _layout?.length)) { _layout = builder.layout = layout }
			}
			else if (!_parent?.length) { _parent = builder.parent = layout }
			let {id: _id} = builder; if (!_id) { _id = builder.id = builder.newElementId() }
			if (_id) { id2Builder[_id] = builder } builder.autoInitLayout(); builder.run();
			let {layout: _layout} = builder; if (_layout?.length) { _layout.addClass('jqx-hidden'); setTimeout(() => _layout.removeClass('jqx-hidden'), 1) }
		}
	}
	islemTuslariDuzenle(e) {
		super.islemTuslariDuzenle(e); const {liste} = e, yListe = [];
		for (const item of liste) {
			const {id} = item; switch (id) {
				case 'tamam':
					if (this.izlemi) { continue }
					item.handler = e => this.tamamIstendi(e);
					if (this.silmi) { item.id = 'sil' }
					break
			}
			yListe.push(item)
		}
		e.liste = yListe
	}
	gridInit(e) {
		super.gridInit(e); const {grid} = this;
		//grid.on('cellvaluechanged', evt => this.gridVeriDegisti($.extend({}, e, { event: evt, action: 'cellValueChanged' })));
		grid.on('filter', evt => this.gridYapiDegisti($.extend({}, e, { event: evt, action: 'filter' })));
		grid.on('sort', evt => this.gridYapiDegisti($.extend({}, e, { event: evt, action: 'sort' })));
		grid.on('groupschanged', evt => this.gridYapiDegisti($.extend({}, e, { event: evt, action: 'group' })));
		grid.on('pagechanged', evt => this.gridYapiDegisti($.extend({}, e, { event: evt, action: 'page' })));
	}
	gridArgsDuzenle(e) {
		super.gridArgsDuzenle(e);
		const {args} = e, {columns} = args;
		for (const col of columns) {
			const savedCellsRenderer = col.cellsRenderer;
			col.cellsRenderer = (rowIndex, columnField, value, html, jqxCol, rec) => {
				const isPlainObject = $.isPlainObject(rec); if (isPlainObject) { const {gridWidget} = this; if (gridWidget) { rec = gridWidget.getrowdata(rowIndex); value = rec[columnField] } }
				html = savedCellsRenderer ? getFuncValue.call(this, savedCellsRenderer, rowIndex, columnField, value, html, jqxCol, rec) : (isPlainObject ? changeTagContent(html, value) : html);
				return html
			}
		}
	}
	gridArgsDuzenleDevam(e) { super.gridArgsDuzenleDevam(e); $.extend(e.args, { width: '99.5%', /*editMode: 'selectedrow',*/ groupable: false, sortable: false, groupable: false }) }
	/*get defaultTabloKolonlari() { const tabloKolonlari = super.defaultTabloKolonlari || []; return tabloKolonlari }*/
	async defaultLoadServerData(e) {
		const {fis, kontrolcu, sabitFlag} = this, {gridDetaySinif} = fis.class, _e = $.extend({}, e, { fis });
		_e.recs = []; for (let i = 0; i < fis.detaylar.length + (sabitFlag ? 0 : 1); i++) { _e.recs.push(this.newRec({ sinif: gridDetaySinif })) }
		// if (!this.yenimi) {
		let _result = await kontrolcu.fis2Grid(_e);
		if (_result != true) { if (_result?.errorText) { hConfirm(`<div class="red">${_result.errorText}</div>`) } return false }
		//}
		return _e.recs
	}
	newRec(e) { e = e || {}; e.sinif = e.sinif || this.fis.class.gridDetaySinif; return super.newRec(e) }
	gridVeriDegisti(e) { super.gridVeriDegisti(e); this.gridYapiDegisti(e) }
	gridSatirGuncellendi(e) { super.gridSatirGuncellendi(e) }
	gridSatirSilindi(e) { super.gridSatirSilindi(e) }
	gridSatirSayisiDegisti(e) {
		const _e = $.extend({}, e || {}), {kontrolcu, fis} = this;
		if (kontrolcu?.grid2FisMesajsiz) { kontrolcu.grid2FisMesajsiz(_e) }
		fis.detaylar = _e.recs; super.gridSatirSayisiDegisti(e); this.gridYapiDegisti(e)
	}
	gridYapiDegisti(e) {
		/*e = e || {}; const gridWidget = e.event?.args.owner ?? this.gridWidget, timerKey = 'timer_gridRefresh'; clearTimeout(this[timerKey]);
		this[timerKey] = setTimeout(() => { try { if (!gridWidget.editcell) gridWidget.refresh() } finally { delete this[timerKey] } }, 1000) */
	}
	async gridVeriYuklendi(e) {
		e = e || {}; const {kontrolcu, fis, splitGridVeIslemTuslari} = this; await super.gridVeriYuklendi(e);
		if (kontrolcu) { await kontrolcu.fisGiris_gridVeriYuklendi({ sender: this, fis: fis, kontrolcu: kontrolcu, grid: this.grid, gridWidget: this.gridWidget }) }
		setTimeout(async () => {
			const {dipIslemci} = fis;
			if (dipIslemci) { await dipIslemci._promise_dipSatirlari; dipIslemci.detaylar = e => this.boundRecs; dipIslemci.topluHesapla($.extend({}, e, { sender: this })) }
			this.dipTazele(e); this.onResize(e)
		}, 100)
	}
	dipTazele(e) {
		const {dipEventsDisabledFlag, fisDipPart} = this; if (dipEventsDisabledFlag) { return false }
		if (fisDipPart && !fisDipPart.isDestroyed) { fisDipPart.tazele() }
		return true
	}
	async tamamIstendi(e) {
		e = e || {}; const evt = e.event || {}, {fis, fisDipPart} = this;
		if (fis.class.dipGirisYapilirmi && !(evt.ctrlKey || evt.shiftKey) && fisDipPart && !fisDipPart.isDestroyed) { return fisDipPart.open(e) }
		return await this.kaydetIstendi(e)
	}
	async kaydetIstendi(e) {
		let result; try {
			result = await this.kaydet(e); if (!result) { return false }
			let {kaydedince} = this; if (kaydedince) { result = await getFuncValue.call(this, kaydedince, { ...e, sender: this }) }
			if (result === false) { return false }
			this.kaydetCalistimi = true; this.destroyPart()
		} catch (ex) { const err = getErrorText(ex); hConfirm(err, 'Fiş Kayıt Sorunu'); throw ex }
		return true
	}
	async kaydet(e) {
		let {kontrolcu} = this, result = kontrolcu.grid2Fis(e);
		if (result != true) {
			if (result.errorText) { hConfirm(`<div class="red">${result.errorText}</div>`, ' ') }
			if (result.returnAction) {
				let {grid, gridWidget} = this;
				let _e = { sender: this, grid, gridWidget, focusTo(e) { gridWidget.clearselection(); gridWidget.selectcell(e.rowIndex, e.belirtec || e.dataField) } };
				getFuncValue.call(this, result.returnAction, _e)
			}
			return false
		}
		const {fis} = this; fis.detaylar = e.recs;
		return await this.kaydetDevam(e)
	}
	async kaydetDevam(e) {
		e = e || {}; const {fis} = this;
		let result = await this.kaydetOncesi(e); if (result == false || result?.isError) { return result }
		if (this.yeniVeyaKopyami) { result = await fis.yaz(e) }
		else if (this.degistirmi) { result = await fis.degistir(e) }
		else if (this.silmi) { result = await fis.sil(e) }
		else { return false }
		if (result == false || result?.isError) { return result }
		result = await this.kaydetSonrasi(e); if (result == false || result?.isError) { return result }
		return result
	}
	async kaydetOncesi(e) {
		e = e || {}; const {yeniVeyaKopyami, degistirVeyaSilmi, builder, islem, eskiFis} = this, gridPart = this, {gridWidget} = gridPart; let {fis} = this;
		if (gridWidget?.editcell) { gridWidget.endcelledit() }
		const _e = $.extend({}, e, { sender: this, builder, gridPart, islem, fis, eskiFis, yeniVeyaKopyami });
		if (degistirVeyaSilmi) { e.eskiFis = this.eskiFis }
		if (yeniVeyaKopyami) {
			const {numaratorPart} = this, {otoNummu, numarator} = numaratorPart || {}; $.extend(_e, { otoNummu, numaratorPart, numarator });
			if (numaratorPart?.otoNummu) {
				while (true) {
					fis.fisNo = (await numarator.kesinlestir(_e)).sonNo;
					let result = await fis.varmi(); if (!result) { break }
				}
			}
		}
		let result = await fis.uiKaydetOncesiIslemler(_e) ?? true; for (const key of ['islem', 'fis', 'eskiFis']) {
			const value = _e[key]; if (value !== undefined) { this[key] = e[key] = value } }
		let {kaydetIslemi} = this; if (kaydetIslemi) {
			_e.result = result; result = await getFuncValue.call(this, kaydetIslemi, _e) ?? true;
			for (const key of ['islem', 'fis', 'eskiFis']) { let value = _e[key]; if (value !== undefined) { this[key] = e[key] = value } }
		}
		fis = this.fis; return result
	}
	kaydetSonrasi(e) {
		e = e || {}; let {fis} = this, {numarator} = fis;
		if (numarator) {
			let locals = app.getLocals('sonDegerler'), numKod2Seri = locals.numKod2Seri = locals.numKod2Seri || {};
			numKod2Seri[numarator.kod] = fis.seri;
			app.setLocals('sonDegerler', locals); numarator.kaydet();
		}
		return true
	}
	dipEventsDisableDo(aBlock, ...args) { this.dipEventsDisabledFlag = true; try { return aBlock.call(this, ...args) } finally { this.dipEventsDisabledFlag = false } }
	islemYeni() { this.islem = 'yeni'; return this }
	islemDegistir() { this.islem = 'degistir'; return this }
	islemKopya() { this.islem = 'kopya'; return this }
	islemSil() { this.islem = 'sil'; return this }
	setKaydetIslemi(value) { this.kaydetIslemi = value; return this } setKaydedince(value) { this.kaydedince = value; return this }
}
