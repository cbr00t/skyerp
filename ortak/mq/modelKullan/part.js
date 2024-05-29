class ModelKullanPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isSubPart() { return true } static get partName() { return 'modelKullan' }	 get jqxSelector() { return this.isDropDown ? 'jqxDropDownList' : 'jqxComboBox' }
	get mfSinif() {
		const value = this._mfSinif;
		return (value && !value.prototype && ($.isFunction(value) || value.run)) ? getFuncValue.call(this, this._mfSinif, { sender: this.sender, builder: this.builder, colDef: this }) : value
	}
	set mfSinif(value) { this._mfSinif = value }
	get coklumu() { const {widget} = this; return widget ? widget.checkboxes : this._coklumu }
	get secilen() { return this.selectedItem }
	get kodGecerlimi() { return !$.isEmptyObject(this.secilen) }
	get source() { return this.loadServerDataBlock }
	set source(value) { this.loadServerDataBlock = value }
	get value() { return this.kod }
	set value(value) { const oldValue = this.value; if (value != oldValue) { this.kod = value; this.input.val(value); this.onChange({ type: 'value', args: { value } }) } }
	get disabled() { return this.input ? this.input[this.jqxSelector]('disabled') : this._disabled }
	set disabled(value) { if (this.input?.length) { this.input[this.jqxSelector]('disabled', value) } else { this._disabled = value } }
	val(value, noTrigger) {
		if (value === undefined) { return this.value }
		if (noTrigger) { this.kod = value; this.input.val(value) }
		else { this.value = value }
		return this
	}
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, {
			builder: e.builder, sender: e.sender, _mfSinif: e.mfSinif, kodSaha: e.kodSaha, adiSaha: e.adiSaha, _coklumu: asBool(e.coklumu ?? e.coklu),
			width: e.width, height: e.height, placeHolder: e.placeHolder, noAutoWidthFlag: e.noAutoWidthFlag ?? e.noAutoWidth ?? true,
			listedenSecilemezFlag: e.listedenSecilemezFlag ?? e.listedenSecilemez ?? false, noAutoGetSelectedItemFlag: e.noAutoGetSelectedItemFlag ?? e.noAutoGetSelectedItem ?? false,
			kod: e.kod ?? e.value, maxRow: e.maxRow || e.maxrow || (app.params.ortak || {}).autoComplete_maxRow || null,
			dataAdapterBlock: e.dataAdapterBlock || e.dataAdapter, wsArgsDuzenleBlock: e.wsArgsDuzenleBlock || e.wsArgsDuzenle, listeArgsDuzenleBlock: e.listeArgsDuzenleBlock || e.listeArgsDuzenle,
			loadServerDataBlock: e.loadServerDataBlock || e.loadServerData || e.source, loadServerDataEkDuzenleBlock: e.loadServerDataEkDuzenleBlock || e.loadServerDataEkDuzenle || e.ekDuzenleyici,
			ozelQueryDuzenleBlock: e.ozelQueryDuzenleBlock || e.ozelQueryDuzenle, isDropDown: e.dropDown ?? e.isDropDown ?? false,
			bosKodAlinirmi: e.bosKodAlinirmi ?? e.bosKodAlinir ?? true, bosKodEklenirmi: e.bosKodEklenirmi ?? e.bosKodEklenir ?? false, kodGosterilsinmi: e.kodGosterilsinmi ?? e.kodGosterilsin ?? true,
			argsDuzenleBlock: e.argsDuzenleBlock || e.argsDuzenle, autoBind: e.autoBind ?? false, disabled: e.disabled ?? false,
			rendererEkBlock: e.rendererEkBlock || e.rendererEk, selectionRendererBlock: e.selectionRendererBlock || e.selectionRenderer,
			veriYukleninceBlock: e.veriYukleninceBlock || e.veriYuklenince || e.bindingCompleteBlock || e.bindingComplete, degisinceEvent: []
		});
		const degisinceBlock = e.degisince || e.degisinceBlock; if (degisinceBlock) { this.change(degisinceBlock) }
	}
	runDevam(e) {
		super.runDevam(e); const {parentPart, mfSinif, layout, isDropDown, noAutoWidthFlag} = this;
		const kodSaha = (mfSinif ? (mfSinif.idSaha ?? mfSinif.kodSaha) : null) || this.kodSaha || CKodVeAdi.kodSaha, adiSaha = (mfSinif ? mfSinif.adiSaha : null) || this.adiSaha || CKodVeAdi.adiSaha;
		let {placeHolder} = this; if (placeHolder == null && mfSinif) { placeHolder = mfSinif.sinifAdi }
		const parent = layout.parent(), da = this.getDataAdapter({ maxRow: this.maxRow });
		let args = {
			theme: theme, autoOpen: false, width: this.width || (!noAutoWidthFlag && parent?.length ? parent.width() : null) || '99.7%',
			height: this.height || '100%', searchMode: 'containsignorecase', autoDropDownHeight: false, dropDownHeight: 215, itemHeight: 35,
			valueMember: kodSaha, displayMember: adiSaha, disabled: this.disabled, placeHolder: placeHolder || '', checkboxes: !!this.coklumu,
			renderer: (index, aciklama, kod) => {
				const {layout, widget, kodGosterilsinmi} = this, layoutName = layout.prop('id'), parentPart = this.parentPart || this.sender;
				let parentPartName = ((parentPart || {}).class || {}).partName;
				if (!parentPartName) { const parentLayout = layout.parents('.part'); if (parentLayout?.length) { parentPartName = parentLayout.prop('class') } }
				const {partName} = this.class, _e = { parentPart, sender: this, builder: this.builder, widget, index, kod, aciklama };
				_e.result = (
					`<div class="${parentPartName ? parentPartName + ' ' : ''}${layoutName} ${partName} list-item flex-row">` +
						(kodGosterilsinmi ? `<div class="kod">${kod || ''}</div>` : '') +
						`<div class="aciklama${kodGosterilsinmi ? '' : ' full-width'}">${aciklama}</div>` +
					`</div>`
				);
				const {rendererEkBlock} = this; if (rendererEkBlock) { const result = getFuncValue.call(this, rendererEkBlock, _e); if (result != null) { _e.result = result } }
				return _e.result
			}
		};
		if (isDropDown) {
			$.extend(args, {
				filterable: true, filterHeight: 28, filterPlaceHolder: 'Seçiniz:',
				selectionRenderer: (html, index, label, value) => {
					const {widget} = this; if (!widget) { return html }
					const {builder, coklumu, kodGosterilsinmi, selectionRendererBlock} = this, _e = { parentPart, sender: this, builder, widget, coklumu, kodGosterilsinmi, html, index, label, value };
					if (coklumu) {
						const wItems = _e.wItems = widget.getCheckedItems() || [];
						if (selectionRendererBlock) { _e.recs = wItems.map(wItem => wItem.originalItem) }
						const isLong = _e.isLong = wItems.length > 3;
						_e.result = wItems.map(wItem => (isLong ? wItem.value : wItem.label) ?? '').join(', ')
					}
					else {
						const wItem = _e.wItem = widget.getSelectedItem() || {};
						if (selectionRendererBlock) { _e.rec = wItem.originalItem }
						const kod = wItem.value ?? '', aciklama = wItem.label ?? '';
						_e.result = kodGosterilsinmi ? (kod == null ? '' : `<b>${kod}</b>-${aciklama}`) : aciklama
					}
					
					if (selectionRendererBlock) {
						const result = getFuncValue.call(this, selectionRendererBlock, _e);
						if (result != null)
							_e.result = result;
					}
					return _e.result
				}
			});
		}
		else {
			$.extend(args, {
				autoComplete: true, remoteAutoComplete: true, remoteAutoCompleteDelay: 100, minLength: 0,
				search: searchText => {
					if (searchText) { searchText = searchText.replaceAll('*', '%').replaceAll('?', '_') }
					da._source.data.value = searchText; da.dataBind(); this.focusSelectYapildiFlag = false
				},
				/*renderer: (index, aciklama, kod) => { const {widget} = this; let rec = (widget.getItems() || [])[index]; rec = (rec || {}).originalItem; return aciklama }*/
				renderSelectedItem: (index, rec) => {
					const {widget, kodGosterilsinmi} = this, kodSaha = widget.valueMember, adiSaha = widget.displayMember;
					rec = rec.originalItem || rec || {}; const kod = rec[kodSaha] ?? '', aciklama = rec[adiSaha] ?? '';
					return kodGosterilsinmi ? `${kod}` + (aciklama ? `-${aciklama}` : '') : (aciklama || '')
				}
			});
		}
		const _e = { parentPart, sender: this, builder: this.builder, isDropDown, da, args };
		const {argsDuzenleBlock, jqxSelector} = this; if (argsDuzenleBlock) { getFuncValue.call(this, argsDuzenleBlock, _e) }
		args = _e.args;
		const input = this.input = layout[jqxSelector](args), widget = this.widget = input[jqxSelector]('getInstance'), _input = widget.input;
		const {coklumu, value} = this; if (value != null) { input.val(value); input.attr('data-value', value ?? null) }
		input.on('bindingComplete', evt => {
			clearTimeout(this.timer_bindingComplete);
			this.timer_bindingComplete = setTimeout(() => { try { this.veriYuklendi({ event: evt }) } finally { delete this.timer_bindingComplete } }, 200)
		});
		input.on('contextmenu', evt => this.listedenSecIstendi({ event: evt }));
		input.on('keyup', evt => {
			const key = evt.key?.toLowerCase() ?? '';
			if (key == 'f4') {
				if (widget.isOpened()) { widget.close() }
				const {parentPart} = this, {gridPart} = parentPart || {}, gridWidget = parentPart?.gridWidget ?? gridPart?.gridWidget;
				if (gridWidget) {
					let selectedCell = gridWidget.selectedcell;
					if (!selectedCell) {
						const _rowIndex = gridWidget.selectedrowindex;
						if (_rowIndex != null && _rowIndex > -1) selectedCell = { rowindex: _rowIndex, row: _rowIndex };
					}
					const dataField = selectedCell?.datafield, colDef = (parentPart?.belirtec2Kolon || gridPart?.belirtec2Kolon || {})[dataField];
					if (colDef?.listedenSec) {
						const rowIndex = selectedCell.rowindex;
						return colDef.listedenSec({ args: { datafield: dataField, rowindex: rowIndex, value: gridWidget.getcellvalue(rowIndex, dataField) } });
					}
				}
				this.listedenSecIstendi({ event: evt })
			}
			else if (key == 'enter' || key == 'linefeed') { setTimeout(() => widget.input.trigger('change'), 10) }
		});
		/*input.on('dblclick', evt => this.listedenSecIstendi({ event: evt }))*/
		input.on('change', evt => this.onChange({ event: evt }));
		input.on('checkChange', evt => this.onChange({ type: 'mouse', event: evt }));
		/*$(widget.input).on('focus', evt => {
			if (!widget.isOpened()) { clearTimeout(this.openTimer); this.openTimer = setTimeout(() => { try { widget.open() } finally { delete this.openTimer } }, 10) }
		});*/
		input.on('open', evt => {
			if (this.disableEventsFlag) { return }
			/*if (this.focusSelectYapildiFlag) { return }*/
			if (isDropDown) { if ($.isEmptyObject(widget.getItems())) { this.dataBind() } }
			else {
				setTimeout(() => { if (!widget.isOpened()) { this.disableEventsFlag = true; setTimeout(() => delete this.disableEventsFlag, 50); widget.open() } }, 10);
				setTimeout(() => {
					if (widget.searchString == null) { widget.searchString = '' }
					if (this.focusSelectYapildiFlag && _input?.length) { _input.select() }
					setTimeout(() => { this.focusSelectYapildiFlag = true }, 20)
				}, 10)
			}
		});
		input.on('close', evt => {
			/*setTimeout(() => this.focusSelectYapildiFlag = false, 20);*/
			if (this._triggerChangeEventFlag) { delete this._triggerChangeEventFlag; this.onChange({ type: 'queuedEvent', event: evt }) }
		});
		input.on('focus', evt => { if (!isDropDown && widget.searchString == null) { widget.searchString = '' } input.select() });
		input[jqxSelector]({ source: da })
	}
	destroyPart(e) {
		super.destroyPart(e); const {input, isDropDown} = this;
		if (input?.length) { input[this.jqxSelector]('destroy'); input.remove() }
		this.input = this.widget = null
	}
	dataBind() {
		if (!this.isDestroyed) {
			const {widget} = this;
			const source = widget?.source || this.source;
			if (source) {
				if (source.dataBind)
					source.dataBind()
				else {
					(async () => {
						const {parentPart, builder} = this, gridPart = parentPart?.gridPart || parentPart, {gridWidget} = gridPart || {};
						const inst = parentPart?.inst ?? parentPart?.fis, editCell = gridWidget?.editcell;
						const newSource = await getFuncValue.call(this, source, {
							sender: this, builder, parentPart, gridPart, gridWidget, inst, fis: inst, editCell, editor: editCell?.editor,
							rowIndex: editCell?.row ?? gridWidget?.selectedrowindex, dataField: editCell?.datafield,
							get gridRec() {
								let result = this._gridRec;
								if (result === undefined) { const {gridWidget, rowIndex} = this; result = this._gridRec = gridWidget?.getrowdata(rowIndex) }
								return result
							}
						});
						//if ((widget && widget.source != source) || (newSource && newSource != source))
						this.input[this.jqxSelector]({ source: newSource })
					})()
				}
			}
		}
	}
	focus(e) { this.widget.input.focus(); return this }
	select(e) { this.widget.input.select(); return this }
	async onChange(e) {
		e = e  || {}; const evt = e.event, {force} = e, {args} = e.args ?? (evt || {}), type = (args?.type ?? e.type ?? evt?.type ?? '').toLowerCase();
		if (!(force || type == 'mouse') && (this.inEvent || this.disableEventsFlag)) { if (evt) evt.preventDefault(); return }
		if (!type || (type == 'none' || type == 'keyboard')) { return }
		if (!(force || this.kodAtandimi) && !!this.mfSinif) { return }
		const timeStamp = evt?.timeStamp; if (timeStamp != null) { const {_lastChangeEventTime} = this; this._lastChangeEventTime = timeStamp; if (_lastChangeEventTime && (timeStamp - _lastChangeEventTime) < 50) { return } }
		const {input, widget, coklumu, isDropDown} = this;
		if (!force && (type == 'mouse' || type == 'keyboard')) { if (coklumu && widget.isOpened()) { this._triggerChangeEventFlag = true; return } }
		console.debug(this, { type });
		delete this._triggerChangeEventFlag; this.inEvent = true;
		try {
			const {parentPart, mfSinif, degisinceEvent} = this, source = widget.source || {};
			const kodSaha = this.kodSaha || (mfSinif ? ($.isArray(mfSinif.idSaha) ? mfSinif.idSaha[0] : mfSinif.idSaha) ?? mfSinif.kodSaha : MQKA.kodSaha);
			const adiSaha = this.adiSaha || (mfSinif ? mfSinif.adiSaha : MQKA.adiSaha);
			const kodaEsasSaha = this.kodGosterilsinmi ? kodSaha : adiSaha, lastSelectedItem = this.selectedItem, lastValue = this.value;
			let value = e.value ?? evt?.target?.value,_kod = this.kod, kod, item, wItem, records, rec;
			if (isDropDown) {
				if (!coklumu && args) { wItem = args.item }
				if (wItem == null) { wItem = coklumu ? widget.getCheckedItems() : widget.getSelectedItem() }
				if (wItem == null) { _kod = value }
				if (wItem == null && kod != null) {
					if (coklumu) {
						wItem = []; const kodSet = $.isArray(_kod) ? asSet(_kod) : _kod;
						for (const _wItem of widget.getItems()) { if (kodSet[_wItem.value]) { wItem.push(_wItem) } }
					}
					else { wItem = widget.getItem(_kod) }
				}
				if (wItem != null) {
					if (coklumu) { item = wItem.map(x => x.originalItem ?? x); kod = wItem.map(x => x.value ?? x) }
					else { item = wItem.originalItem ?? wItem; kod = wItem.value }
				}
				this.selectedWidgetItem = wItem; this.selectedItem = item;
				this.kod = kod; this.lastValue = e.value ?? kod
			}
			else {
				const args = e.args || (evt || {}).args || {};
				item = args.item;
				if (item == null) {
					_kod = value; item = _kod == null || this.noAutoGetSelectedItemFlag ? null : widget.getSelectedItem();
					if (item == null) {
						if (!records) { records = (widget.getItems ? widget.getItems() : null) || (source.records || ($.isArray(source) ? source : null)) }
						if (!rec && records?.length) { rec = records.find(rec => (rec.originalItem || rec)[kodaEsasSaha] == _kod) }
						if (rec) { rec = rec.originalItem || rec }
						if (!rec && _kod != null) {
							const promise = new $.Deferred(); const da = this.getDataAdapter({ autoBind: false, maxRow: 10 });
							if (da) {
								da._source.data.value = _kod; da._options.loadComplete = _recs => promise.resolve({ da, recs: _recs }); da.dataBind();
								records = (await promise)?.recs; records = records?.records ?? records;
								if (records) rec = records.find(rec => (rec.originalItem || rec)[kodaEsasSaha] == _kod)
							}
						}
						if (!rec && records?.length && !(_kod == null || (typeof _kod == 'string' && !_kod.trim()))) {
							rec = records[0]; rec = rec.originalItem ?? rec ?? {};
							kod = value = rec[kodSaha] ?? rec.key
						}
						item = rec?.originalItem ?? rec
					}
				}
				if (item) { item = item.originalItem ?? item }
				if (kod == null) { kod = item ? item[kodSaha] : (value == null ? null : e.value); if (kod == null) { kod = evt?.target?.value } }
				this.selectedItem = item;
				if (item) {
					this.kod = kod; const inputVal = widget.input.val();
					if (!inputVal || inputVal == kod) { if (widget.renderSelectedItem) { widget.input.val(widget.renderSelectedItem(-1, item)) } }
					
					// const text = widget.renderSelectedItem ? widget.renderSelectedItem(null, item) : kod;
					// evt.target.value = text;
				}
				else {
					if (!records) { records = widget.getItems ? widget.getItems() : (source.records || ($.isArray(source) ? source : null)) }
					if (kod && records) {
						if (!rec) { rec = records.find(rec => (rec.originalItem ?? rec)[kodaEsasSaha] == kod) }
						item = this.selectedItem = (rec || {}).originalItem || rec;
						this.disableEventsFlag = true; setTimeout(() => this.disableEventsFlag = false, 10);
						if (item) {
							kod = this.kod = item ? item[kodSaha] : (value == null ? ((evt || {}).target).value : e.value);
							const text = widget.renderSelectedItem ? widget.renderSelectedItem(null, rec) : value;
							evt.target.value = text
						}
						else { this.kod = kod }
					}
				}
				this.lastValue = kod
			}
			input.attr('data-value', coalesce(this.kod, null));
			// if ((item && lastSelectedItem != item || (value != null & value != lastValue)) && !$.isEmptyObject(degisinceEvent)) {
			if (!$.isEmptyObject(degisinceEvent) && kod !== undefined) {
				for (const handler of degisinceEvent) {
					if (widget.isOpened() && type != 'checkchange') { widget.close() }
					getFuncValue.call(this, handler, { parentPart: parentPart, sender: this, builder: this.builder, event: evt, coklumu, item, lastItem: lastSelectedItem, kod, value: kod })
				}
			}
		}
		finally { setTimeout(() => this.inEvent = false, 30) }
	}
	veriYuklendi(e) {
		setTimeout(() => {
			const {input} = this; if (this.isDestroyed || !input?.length) { return }
			const {parentPart, widget, veriYukleninceBlock} = this;
			if (!this.veriYuklendiFlag) {
				this.veriYuklendiFlag = true; /*if (widget.isOpened()) widget.close();*/
				const {value} = this; if (value != null && !this.kodAtandimi) { input.val(value); input.attr('data-value', value ?? null) }
				this.kodAtandimi = true
			}
			if (veriYukleninceBlock) {
				const _e = $.extend({}, e, { parentPart, sender: this, builder: this.builder, get wItems() { return widget.getItems() }, get source() { return widget.source }, get recs() { return widget.source?.records } });
				getFuncValue.call(this, veriYukleninceBlock, _e)
			}
		}, 100)
	}
	listedenSecIstendi(e) {
		e = e || {}; const _e = e; const evt = e.event;
		if (evt) { evt.preventDefault(); evt.stopPropagation() }
		if (this.listedenSecilemezFlag || this.widget.disabled) { return }
		const {mfSinif, input, widget, kodGosterilsinmi} = this;
		const kodSaha = mfSinif ? ($.isArray(mfSinif.idSaha) ? mfSinif.idSaha[0] : mfSinif.idSaha) ?? mfSinif.kodSaha : this.kodSaha || MQKA.kodSaha;
		const adiSaha = mfSinif ? mfSinif.adiSaha : this.adiSaha || MQKA.adiSaha;
		clearTimeout(this.openTimer); setTimeout(() => { if (widget.isOpened()) widget.close() }, 20);
		const {coklumu} = this, part = new MasterListePart({
			sender: this, parentPart: this.parentPart, builder: this.builder, mfSinif, tekilmi: !coklumu,
			wndArgsDuzenle: e => { const {wndArgs} = e /* wndArgs.isModal = true */ },
			argsDuzenle: e => {
				const {args} = e, {listeArgsDuzenleBlock} = this; if (!coklumu) { args.selectionMode = 'singlerow' }
				if (listeArgsDuzenleBlock) { getFuncValue.call(this, listeArgsDuzenleBlock, e) }
			},
			tabloKolonlari: kodGosterilsinmi ? (mfSinif ? null : MQKA.orjBaslikListesi) : ((mfSinif ?? MQKA).orjBaslikListesi.filter(x => x.belirtec != (mfSinif || MQKA).kodSaha)),
			ozelQueryDuzenle: this.ozelQueryDuzenleBlock, loadServerDataBlock: mfSinif ? null : this.loadServerDataBlock,
			bindingComplete: e => {
				const {sender, gridWidget} = e, {coklumu} = this;
				let kodSet = this.kod || {}; if (kodSet != null && typeof kodSet != 'object') { kodSet = [kodSet] }
				if ($.isArray(kodSet)) { kodSet = asSet(kodSet) }
				gridWidget.beginupdate(); gridWidget.clearselection();
				if (kodSet) {
					const recs = e.source?.records ?? []; let foundIndex, positionedFlag = false;
					for (let i = 0; i < recs.length; i++) {
						let rec = recs[i]; rec = rec.originalItem ?? rec.originalRecord ?? rec; const _kod = rec[kodSaha], _adi = rec[adiSaha];
						if (kodSet[_kod] ?? kodSet[_adi]) { if (foundIndex == null) { foundIndex = i } gridWidget.selectrow(i); if (!coklumu) { break } }
					}
					if (!positionedFlag && foundIndex != null) { gridWidget.ensurerowvisible(foundIndex); positionedFlag = true }
				}
				gridWidget.endupdate(true)
			},
			converter: e => ((e.recs || [])[0] ?? e.rec ?? {})[kodSaha],
			secince: e => {
				this.inEvent = false; const {isDropDown, coklumu, widget} = this; let value;
				if (isDropDown) {
					if (coklumu) {
						const valuesSet = asSet(e.values ?? [e.value]);
						for (const item of widget.getItems() || []) { const _value = item?.value ?? item; item.checked = !!valuesSet[_value] }
						widget.refresh(); this.onChange({ force: true, type: 'trigger' })
					}
					else { value = coalesce(e.value, null); this.val(value); this.onChange({ force: true, type: 'trigger', args: { item: e.rec, value } }) }
				}
				else {
					const rec = (e.recs || [])[0] ?? e.rec; value = (e.values || [])[0] ?? e.value;
					const text = widget.renderSelectedItem ? widget.renderSelectedItem(null, rec) : value;
					setTimeout(() => { input.val(text); this.onChange({ force: true, type: 'trigger', args: { item: rec, value } }) }, 1)
				}
				setTimeout(() => {
					const {parentPart} = this; const gridWidget = parentPart?.gridPart?.gridWidget;
					if (gridWidget) {
						if (!gridWidget.editcell) {
							const sel = gridWidget.getselection(), rowIndex = (sel.cells || [])[0]?.rowindex ?? (sel.rows || [])[0];
							const belirtec = (sel.cells || [])[0]?.datafield ?? this.sender?.belirtec;
							if (value != null && belirtec && (rowIndex ?? -1) > -1) setTimeout(() => gridWidget.setcellvalue(rowIndex, belirtec, value), 10)
						}
						setTimeout(() => gridWidget.focus(), 10)
					}
				}, 1)
			},
			kapaninca: e => { const {parentPart} = this, {gridWidget} = parentPart?.gridPart || {}; if (gridWidget) setTimeout(() => gridWidget.focus(), 10) }
		});
		setTimeout(() => part.run(), 10)
	}
	getDataAdapter(e) {
		const {mfSinif} = this;
		let {dataAdapterBlock, loadServerDataBlock, loadServerDataEkDuzenleBlock} = this; if (!(dataAdapterBlock || loadServerDataBlock || mfSinif)) return null
		e = e || {}; if (mfSinif) e.mfSinif = mfSinif
		let da; if (dataAdapterBlock) da = getFuncValue.call(this, dataAdapterBlock, $.extend({}, e));
		if (!da) {
			da = new $.jqx.dataAdapter({ dataType: wsDataType, url: 'empty.json', data: e }, {
				cache: false, autoBind: coalesce(e.autoBind, this.autoBind),
				loadServerData: async (wsArgs, source, callback) => {
					let lastError;
					for (let i = 0; i < 3; i++) {
						try {
							// const _e = $.extend({}, e, { wsArgs: wsArgs, source: source, callback: callback });
							const {parentPart, mfSinif} = this, {args} = parentPart || {};
							const kodSaha = mfSinif ? ($.isArray(mfSinif.idSaha) ? mfSinif.idSaha[0] : mfSinif.idSaha) ?? mfSinif.kodSaha : MQKA.kodSaha;
							const adiSaha = mfSinif ? mfSinif.adiSaha : MQKA.adiSaha; let temps = {};
							const {wsArgsDuzenleBlock, ozelQueryDuzenleBlock} = this;
							if (wsArgsDuzenleBlock) { const _e = $.extend({}, e, { wsArgs, source, temps }); await wsArgsDuzenleBlock.call(this, wsArgsDuzenleBlock, _e); wsArgs = _e.wsArgs; temps = _e.temps; }
							if (ozelQueryDuzenleBlock) wsArgs.ozelQueryDuzenleBlock = ozelQueryDuzenleBlock; wsArgs.temps = temps;
							let {tabloKolonlari} = wsArgs; if (!tabloKolonlari) {
								tabloKolonlari = this._wsArgs_tabloKolonlari;
								if (!tabloKolonlari) { tabloKolonlari = [ new GridKolon({ belirtec: kodSaha }), new GridKolon({ belirtec: adiSaha }) ] }
								if (mfSinif && !mfSinif.adiKullanilirmi) { tabloKolonlari = tabloKolonlari.filter(colDef => colDef.belirtec != adiSaha) }
								wsArgs.tabloKolonlari = this._wsArgs_tabloKolonlari = tabloKolonlari
							}
							const _e = $.extend({ parentPart, sender: this, builder: this.builder, secimler: this.secimler, callback, args }, wsArgs);
							let result = loadServerDataBlock ? await getFuncValue.call(this, loadServerDataBlock, _e) : (mfSinif ? (await mfSinif.loadServerData(_e)) : null); if (!result) return
							if ($.isArray(result)) result = { totalrecords: result.length, records: result };
							if (typeof result != 'object') return
							let recs = result.records; if (!recs) return
							const {bosKodAlinirmi, bosKodEklenirmi} = this;
							if (!bosKodAlinirmi) { const index = recs.findIndex(rec => !rec[kodSaha]); if (index != false && index > -1) recs.splice(index, 1) }
							else if (bosKodEklenirmi) {
								let rec = recs.find(rec => !rec[kodSaha]);
								if (!rec) { rec = {}; rec[kodSaha] = ''; rec[adiSaha] = ''; recs.unshift(rec) }
							}
							if (loadServerDataEkDuzenleBlock) {
								_e.recs = recs; let _result = await getFuncValue.call(this, loadServerDataEkDuzenleBlock, _e);
								if ($.isArray(_result)) {
									recs = _e.recs = _result; result.records = recs;
									if (result.totalrecords != null) result.totalrecords = e.totalrecords ?? recs.length
								}
							}
							if (!result.totalrecords) result.totalrecords = recs.length
							lastError = null; callback(result);
							// await new $.Deferred(p => setTimeout(async () => { await this.veriYuklendi(e); p.resolve() }, i * 10))
							await this.veriYuklendi(e); break
						}
						catch (ex) { lastError = ex; await new $.Deferred(p => setTimeout(() => p.resolve(), i * 100)) }
					}
					if (lastError) {
						const ex = lastError;
						if (!(ex.message && ex.message.includes(`undefined (reading '1')`))) { console.error(ex); displayMessage(getErrorText(ex), 'ComboBox Verisi Alınamadı') }
					}
				}
			})
		}
		return da
	}
	onResize(e) {
		super.onResize(e); if (this.isDestroyed) { return } const {noAutoWidthFlag, layout, input} = this;
		if (!noAutoWidthFlag) { const parent = layout.parent(); if (parent?.length && parent.width()) input[this.jqxSelector]({ width: parent.width() - 5 }) }
	}
	tekli() { this.coklumu = false; return this }
	coklu() { this.coklumu = true; return this }
	comboBox() { this.isDropDown = false; return this }
	dropDown() { this.isDropDown = true; return this }
	noMF() { this.mfSinif = null; return this }
	resetMF() { this.mfSinif = undefined; return this }
	listedenSecilemez() { this.listedenSecilemezFlag = true; return this }
	listedenSecilir() { this.listedenSecilemezFlag = false; return this }
	autoWidth() { this.noAutoWidthFlag = false; return this }
	noAutoWidth() { this.noAutoWidthFlag = true; return this }
	noAutoGetSelectedItem() { this.noAutoGetSelectedItemFlag = true; return this }
	autoGetSelectedItem() { this.noAutoGetSelectedItemFlag = false; return this }
	kodGosterilsin() { this.kodGosterilsinmi = true; return this }
	kodGosterilmesin() { this.kodGosterilsinmi = false; return this }
	kodlu() { this.kodGosterilsin(); return this }
	kodsuz() { this.kodGosterilmesin(); return this }
	bosKodAlinir() { this.bosKodAlinirmi = true; return this }
	bosKodAlinmaz() { this.bosKodAlinirmi = false; return this }
	bosKodEklenir() { this.bosKodEklenirmi = true; return this }
	bosKodEklenmez() { this.bosKodEklenirmi = false; return this }
	tekil() { this.coklumu = false; return this }
	coklu() { this.coklumu = true; return this }
	enable() { this.disabled = false; return this }
	disable() { this.disabled = true; return this }
	change(handler) { const {degisinceEvent} = this; if (!degisinceEvent.find(x => x == handler)) { degisinceEvent.push(handler) } }
	degisince(handler) { return this.change(handler) }
	on(eventName, handler) { return eventName == 'change' ? this.change(handler) : this }
	off(eventName, handler) {
		if (eventName == 'change') {
			if (handler) {
				const {degisinceEvent} = this, ind = degisinceEvent.findIndex(x => x == handler);
				if (ind != null && ind > -1) { degisinceEvent.splice(ind, 1) }
			}
			else { return change(handler) }
		}
		return this
	}
}
