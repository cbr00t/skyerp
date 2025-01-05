class ModelKullanPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get isSubPart() { return true }
	static get partName() { return 'modelKullan' } get jqxSelector() { return this.isDropDown ? 'jqxDropDownList' : 'jqxComboBox' }
	get mfSinif() {
		const value = this._mfSinif;
		return (value && !value.prototype && ($.isFunction(value) || value.run)) ? getFuncValue.call(this, this._mfSinif, { sender: this.sender, builder: this.builder, colDef: this }) : value
	}
	set mfSinif(value) { this._mfSinif = value }
	get coklumu() { const {widget, isDropDown, _coklumu} = this; return widget ? widget[isDropDown ? 'checkboxes' : 'multiSelect'] : _coklumu }
	set coklumu(value) {
		this._coklumu = value; const {input, isDropDown} = this; if (input?.length) { return }
		if (input?.length) { input[jqxSelector](isDropDown ? 'checkboxes' : 'multiSelect', value) }
	}
	get secilen() { return this.selectedItem } get kodGecerlimi() { return !$.isEmptyObject(this.secilen) }
	get source() { return this.loadServerDataBlock } set source(value) { this.loadServerDataBlock = value }
	get value() { return this.kod }
	set value(value) { const oldValue = this.value; if (value != null && value != oldValue) { this.kod = value; this.input.val(value); this.onChange({ type: 'value', args: { value } }) } }
	get disabled() { return this.input ? this.input[this.jqxSelector]('disabled') : this._disabled }
	set disabled(value) { if (this.input?.length) { this.input[this.jqxSelector]('disabled', value) } else { this._disabled = value } }
	val(value, noTrigger) {
		if (value === undefined) { return this.value }
		if (noTrigger) { this.kod = value; this.input.val(value) } else { this.value = value }
		return this
	}
	constructor(e) {
		if (config.beta) { return new ModelKullan2Part(e) }
		e = e || {}; super(e); $.extend(this, {
			builder: e.builder, sender: e.sender, _mfSinif: e.mfSinif, kodSaha: e.kodSaha, adiSaha: e.adiSaha, _coklumu: asBool(e.coklumu ?? e.coklu),
			width: e.width, height: e.height, placeHolder: e.placeHolder, noAutoWidthFlag: e.noAutoWidthFlag ?? e.noAutoWidth ?? true,
			listedenSecilemezFlag: e.listedenSecilemezFlag ?? e.listedenSecilemez ?? false, noAutoGetSelectedItemFlag: e.noAutoGetSelectedItemFlag ?? e.noAutoGetSelectedItem ?? false,
			kod: e.kod ?? e.value, maxRow: e.maxRow || e.maxrow || (app.params.ortak || {}).autoComplete_maxRow || null,
			dataAdapterBlock: e.dataAdapterBlock || e.dataAdapter, wsArgsDuzenleBlock: e.wsArgsDuzenleBlock || e.wsArgsDuzenle, listeArgsDuzenleBlock: e.listeArgsDuzenleBlock || e.listeArgsDuzenle,
			initArgsDuzenleBlock: e.initArgsDuzenleBlock ?? e.initArgsDuzenle, loadServerDataBlock: e.loadServerDataBlock || e.loadServerData || e.source, loadServerDataEkDuzenleBlock: e.loadServerDataEkDuzenleBlock || e.loadServerDataEkDuzenle || e.ekDuzenleyici,
			ozelQueryDuzenleBlock: e.ozelQueryDuzenleBlock || e.ozelQueryDuzenle, isDropDown: e.dropDown ?? e.isDropDown ?? false,
			bosKodAlinirmi: e.bosKodAlinirmi ?? e.bosKodAlinir ?? true, bosKodEklenirmi: e.bosKodEklenirmi ?? e.bosKodEklenir ?? false, kodGosterilsinmi: e.kodGosterilsinmi ?? e.kodGosterilsin ?? true,
			argsDuzenleBlock: e.argsDuzenleBlock || e.argsDuzenle, autoBind: e.autoBind ?? false, disabled: e.disabled ?? false,
			rendererEkBlock: e.rendererEkBlock || e.rendererEk, selectionRendererBlock: e.selectionRendererBlock || e.selectionRenderer,
			veriYukleninceBlock: e.veriYukleninceBlock || e.veriYuklenince || e.bindingCompleteBlock || e.bindingComplete, degisinceEvent: []
		});
		const degisinceBlock = e.degisince || e.degisinceBlock; if (degisinceBlock) { this.change(degisinceBlock) }
	}
	runDevam(e) {
		super.runDevam(e); const {parentPart, mfSinif, layout, isDropDown, coklumu, noAutoWidthFlag} = this;
		const kodSaha = (mfSinif ? (mfSinif.idSaha ?? mfSinif.kodSaha) : null) || this.kodSaha || CKodVeAdi.kodSaha, adiSaha = (mfSinif ? mfSinif.adiSaha : null) || this.adiSaha || CKodVeAdi.adiSaha;
		let {placeHolder} = this; if (placeHolder == null && coklumu) { placeHolder = '-Hepsi-' } if (placeHolder == null && mfSinif) { placeHolder = mfSinif.sinifAdi }
		const parent = layout.parent(), da = this.getDataAdapter({ maxRow: this.maxRow });
		let args = {
			theme, autoOpen: false, width: this.width || (!noAutoWidthFlag && parent?.length ? parent.width() : null) || '99.7%',
			height: this.height || '100%', searchMode: 'containsignorecase', autoDropDownHeight: false, dropDownHeight: 215, itemHeight: 35,
			valueMember: kodSaha, displayMember: adiSaha, disabled: this.disabled, placeHolder: placeHolder || '',
			renderer: (index, aciklama, kod) => {
				const {layout, widget, kodGosterilsinmi} = this, layoutName = layout.prop('id'), parentPart = this.parentPart || this.sender;
				let parentPartName = ((parentPart || {}).class || {}).partName;
				if (!parentPartName) { const parentLayout = layout.parents('.part'); if (parentLayout?.length) { parentPartName = parentLayout.prop('class') } }
				const {partName} = this.class, _e = { parentPart, sender: this, builder: this.builder, widget, index, kod, aciklama };
				_e.result = (
					`<div class="${parentPartName ? parentPartName + ' ' : ''}${layoutName} ${partName} list-item flex-row">
						${kodGosterilsinmi ? `<div class="kod">${kod || ''}</div>` : ''}
						<div class="aciklama${kodGosterilsinmi ? '' : ' full-width'}">${aciklama}</div>
					</div>`
				);
				const {rendererEkBlock} = this; if (rendererEkBlock) { const result = getFuncValue.call(this, rendererEkBlock, _e); if (result != null) { _e.result = result } }
				return _e.result
			}
		};
		if (isDropDown) {
			$.extend(args, {
				filterable: true, filterHeight: 28, filterPlaceHolder: 'Seçiniz:', checkboxes: !!coklumu,
				selectionRenderer: (html, index, label, value) => {
					const {widget} = this; if (!widget) { return html }
					const {builder, coklumu, kodGosterilsinmi, selectionRendererBlock} = this, _e = { parentPart, sender: this, builder, widget, coklumu, kodGosterilsinmi, html, index, label, value };
					if (coklumu) {
						const wItems = _e.wItems = widget.getCheckedItems() || []; if (selectionRendererBlock) { _e.recs = wItems.map(wItem => wItem.originalItem) }
						const isLong = _e.isLong = wItems.length > 3; _e.result = wItems.map(wItem => (isLong ? wItem.value : wItem.label) ?? '').join(', ')
					}
					else {
						const wItem = _e.wItem = widget.getSelectedItem() || {}; if (selectionRendererBlock) { _e.rec = wItem.originalItem }
						const kod = wItem.value ?? '', aciklama = wItem.label ?? ''; _e.result = kodGosterilsinmi ? (kod == null ? '' : `<b>${kod}</b>-${aciklama}`) : aciklama
					}
					if (selectionRendererBlock) { const result = getFuncValue.call(this, selectionRendererBlock, _e); if (result != null) { _e.result = result } }
					return _e.result
				}
			})
		}
		else {
			$.extend(args, {
				autoComplete: true, remoteAutoComplete: true, remoteAutoCompleteDelay: 100, minLength: 0, multiSelect: !!coklumu,
				search: searchText => {
					if (searchText) { searchText = searchText.replaceAll('*', '%').replaceAll('?', '_') }
					da._source.data.value = widget.input.val(); da.dataBind(); this.focusSelectYapildiFlag = false
				},
				/*renderer: (index, aciklama, kod) => { const {widget} = this; let rec = (widget.getItems() || [])[index]; rec = (rec || {}).originalItem; return aciklama }*/
				renderSelectedItem: (index, rec) => {
					const {widget, kodGosterilsinmi} = this, kodSaha = widget.valueMember, adiSaha = widget.displayMember;
					rec = rec.originalItem || rec || {}; const kod = rec[kodSaha] ?? '', aciklama = rec[adiSaha] ?? '';
					return kodGosterilsinmi ? `${kod}${aciklama ? `-${aciklama}` : ''}` : (aciklama || '')
				}
			})
		}
		const _e = { parentPart, sender: this, builder: this.builder, isDropDown, da, args }, {argsDuzenleBlock, jqxSelector} = this;
		if (argsDuzenleBlock) { getFuncValue.call(this, argsDuzenleBlock, _e) } args = _e.args;
		const input = this.input = layout[jqxSelector](args), widget = this.widget = input[jqxSelector]('getInstance'), _input = widget.input;
		const {value} = this; if (value != null) { input.val(value); input.attr('data-value', value ?? null) }
		setTimeout(() => { if (!isDropDown && coklumu) {  const ddContent = widget.dropdownlistContent; if (ddContent?.length) { ddContent.css('max-height', '98px'); makeScrollable(ddContent) } } }, 200)
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
						const rowindex = gridWidget.selectedrowindex;
						if (rowindex != null && rowindex > -1) selectedCell = { rowindex, row: rowIndex };
					}
					const datafield = selectedCell?.datafield, colDef = (parentPart?.belirtec2Kolon || gridPart?.belirtec2Kolon || {})[datafield];
					if (colDef?.listedenSec) { const rowIndex = selectedCell.rowindex, value = gridWidget.getcellvalue(rowindex, datafield); return colDef.listedenSec({ args: { datafield, rowindex, value } }) }
				}
				this.listedenSecIstendi({ event: evt })
			}
			else if (key == 'enter' || key == 'linefeed') {
				if (!isDropDown && coklumu) {
					const {listBox} = widget; listBox.beginUpdate(); try {
						listBox.clear(); widget.addItem(widget.input.val());
						setTimeout(() => widget.selectItem(widget.getItems().slice(-1)[0]), 1)
					} finally { listBox.endUpdate() }
				}
				setTimeout(() => { const {input} = widget; input.trigger('change'); input.focus() }, 10)
			}
		});
		/* input.on('dblclick', evt => this.listedenSecIstendi({ event: evt })) */
		input.on('change', evt => this.onChange({ event: evt }));
		input.on('checkChange', evt => this.onChange({ type: 'mouse', event: evt }));
		/* $(widget.input).on('focus', evt => { if (!widget.isOpened()) { clearTimeout(this.openTimer); this.openTimer = setTimeout(() => { try { widget.open() } finally { delete this.openTimer } }, 10) } }) */
		input.on('open', evt => {
			if (this.disableEventsFlag) { return } /*widget.listBoxContainer.one('mousedown', evt => { evt.stopPropagation() });*/
			if (isDropDown) {
				if ($.isEmptyObject(widget.getItems())) { this.dataBind() } }
			else {
				setTimeout(() => {
					if (widget.isOpened()) { return } this.disableEventsFlag = true;
					setTimeout(() => delete this.disableEventsFlag, 50);
					if (this.focusSelectYapildiFlag && !widget.isOpened()) { widget.open() }
				}, 10);
				setTimeout(() => {
					if (widget.searchString == null) { widget.searchString = '' }
					if (this.focusSelectYapildiFlag && _input?.length) { _input.select() }
					setTimeout(() => { this.focusSelectYapildiFlag = true }, 20)
				}, 10)
			}
			makeScrollable($(widget.listBox.content))
		});
		input.on('close', evt => { /*setTimeout(() => this.focusSelectYapildiFlag = false, 20);*/
			if (this._triggerChangeEventFlag) { delete this._triggerChangeEventFlag; this.onChange({ type: 'queuedEvent', event: evt }) }
		});
		widget.input.on('focus', evt => {
			if (!isDropDown && widget.searchString == null) { widget.searchString = '' }
			setTimeout(() => widget.input.select(), 50)
		});
		if (isDropDown || this.autoBind) { input[jqxSelector]({ source: da }) } else { widget.source = da }
		if (!this.listedenSecilemezFlag) {
			let btn = $(`<button id="listedenSec">...</button>`).jqxButton({ theme, width: 38, height: 32 });
			btn.on('click', event => this.listedenSecIstendi({ ...e, event })); btn.appendTo(layout)
		}
	}
	destroyPart(e) {
		super.destroyPart(e); const {input, isDropDown} = this;
		if (input?.length) { input[this.jqxSelector]('destroy'); input.remove() }
		this.input = this.widget = null
	}
	dataBind() {
		const {widget} = this, source = widget?.source || this.source; if (this.isDestroyed || source == null) { return }
		if (source.dataBind) { source.dataBind() }
		else {
			(async () => {
				const {parentPart, builder} = this, gridPart = parentPart?.gridPart || parentPart, {gridWidget} = gridPart || {};
				const inst = parentPart?.inst ?? parentPart?.fis, editCell = gridWidget?.editcell;
				const newSource = await getFuncValue.call(this, source, {
					sender: this, builder, parentPart, gridPart, gridWidget, inst, fis: inst, editCell, editor: editCell?.editor,
					rowIndex: editCell?.row ?? gridWidget?.selectedrowindex, dataField: editCell?.datafield,
					get gridRec() {
						let result = this._gridRec; if (result === undefined) { const {gridWidget, rowIndex} = this; result = this._gridRec = gridWidget?.getrowdata(rowIndex) }
						return result
					}
				});
				this.input[this.jqxSelector]({ source: newSource })
			})()
		}
	}
	focus(e) { this.widget.input.focus(); return this }
	select(e) { this.widget.input.select(); return this }
	clear(e) {
		const {layout, widget, isDropDown, coklumu} = this;
		if (coklumu) { widget[isDropDown ? 'uncheckAll' : 'clearSelection']() }
		this.value = null; return this
	}
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
			let value = e.value ?? args?.value ?? evt?.target?.value, _kod = this.kod, kod, item, wItem, records, rec;
			if (isDropDown) {
				if (!coklumu && args) { wItem = args.item }
				if (wItem == null) { wItem = coklumu ? widget.getCheckedItems() : widget.getSelectedItem() } if (wItem == null) { _kod = value }
				if (wItem == null && kod != null) {
					if (coklumu) { wItem = []; const kodSet = $.isArray(_kod) ? asSet(_kod) : _kod; for (const _wItem of widget.getItems()) { if (kodSet[_wItem.value]) { wItem.push(_wItem) } } }
					else { wItem = widget.getItem(_kod) }
				}
				if (wItem != null) {
					if (coklumu) { item = wItem.map(x => x.originalItem ?? x); kod = wItem.map(x => x.value ?? x) }
					else { item = wItem.originalItem ?? wItem; kod = wItem.value }
				}
				$.extend(this, { kod, lastValue: e.value ?? kod })
			}
			else {
				const args = e.args || evt?.args || {}; wItem = coklumu ? widget.getSelectedItems() : args.item;
				if (wItem == null) { _kod = value; wItem = _kod == null || this.noAutoGetSelectedItemFlag ? null : (coklumu ? widget.getSelectedItems() : widget.getSelectedItem()) }
				if (wItem == null) {
					if (!records) { records = (widget.getItems ? widget.getItems() : null) ?? (source.records || ($.isArray(source) ? source : null)) }
					if (rec == null && records?.length) { rec = records.find(rec => (rec.originalItem || rec)[kodaEsasSaha] == _kod) }
					if (rec) { rec = rec.originalItem ?? rec }
					if (rec == null && _kod != null) {
						const promise = new $.Deferred(); const da = this.getDataAdapter({ autoBind: false, maxRow: 10 });
						if (da) {
							da._source.data.value = _kod; da._options.loadComplete = _recs => promise.resolve({ da, recs: _recs }); da.dataBind();
							records = (await promise)?.recs; records = records?.records ?? records;
							if (records) { rec = records.find(rec => (rec.originalItem || rec)[kodaEsasSaha] == _kod) }
						}
					}
					if (!rec && records?.length && !(_kod == null || (typeof _kod == 'string' && !_kod.trim()))) { rec = records[0]; rec = rec.originalItem ?? rec ?? {}; kod = value = rec[kodSaha] ?? rec.key }
					item = rec?.originalItem ?? rec
				}
				if (item == null) { item = wItem }
				if (kod == null && item != null) {
					if (coklumu) { item = wItem.map(x => x.originalItem ?? x); kod = wItem.map(x => x.value ?? x[kodSaha] ?? x) }
					else { item = wItem?.originalItem ?? wItem; if (wItem != null) { kod = wItem?.value ?? (wItem == null ? null : wItem[kodSaha]) ?? item ?? kod ?? null } }
				}
				if (kod == null) { kod = (item ? item[kodSaha] : wItem?.value) ?? (value == null ? null : e.value); if (kod == null) { kod = evt?.target?.value } }
				if (kod == null && wItem) { kod = coklumu ? wItem.map(x => x.value) : wItem.value }
				this.selectedItem = item;
				if (item) {
					/* if (!$.isArray(item) || item.length) { this.kod = kod } */
					const inputVal = widget.input.val(); if (!inputVal || inputVal == kod) { if (widget.renderSelectedItem) { widget.input.val(widget.renderSelectedItem(-1, item)) } }
				}
				else {
					if (!records) { records = widget.getItems ? widget.getItems() : (source.records || ($.isArray(source) ? source : null)) }
					if (kod && records) {
						if (!rec) { rec = records.find(rec => (rec?.originalItem ?? rec)[kodaEsasSaha] == kod) }
						item = this.selectedItem = rec?.originalItem ?? rec;
						this.disableEventsFlag = true; setTimeout(() => this.disableEventsFlag = false, 10);
						if (item) {
							kod = this.kod = item ? item[kodSaha] : (value == null ? widget.input.val() : e.value);
							const text = widget.renderSelectedItem ? widget.renderSelectedItem(null, rec) : value; widget.input.val(text)
						}
						else if (!(kod == null && type == 'value')) { this.kod = kod }
					}
				}
				if (!(kod == null && type == 'value')) { this.lastValue = kod }
			}
			if (!(kod == null && type == 'value')) {
				input.attr('data-value', kod ?? null);
				if (!$.isEmptyObject(degisinceEvent) && kod !== undefined) {
					for (const handler of degisinceEvent) {
						if (widget.isOpened() && type != 'checkchange') { widget.close() }
						getFuncValue.call(this, handler, { parentPart, sender: this, builder: this.builder, event: evt, coklumu, item, lastItem: lastSelectedItem, kod, value: kod })
					}
				}
			}
		}
		finally { setTimeout(() => this.inEvent = false, 30) }
	}
	veriYuklendi(e) {
		setTimeout(() => {
			const {input, parentPart, widget, veriYukleninceBlock, coklumu, isDropDown} = this; if (this.isDestroyed || !input?.length) { return }
			if (!this.veriYuklendiFlag) {
				this.veriYuklendiFlag = true; /*if (widget.isOpened()) widget.close();*/
				let {value} = this; if (value != null && !this.kodAtandimi) { input.val(value); input.attr('data-value', value ?? null) }
				if (value) {
					value = $.makeArray(value); if (value?.length) {
						let valueSet = asSet(value), wItems = widget.getItems(); widget[isDropDown ? 'uncheckAll' : 'clearSelection']();
						this.disableEventsFlag = true; for (let i = 0; i < wItems.length; i++) { if (valueSet[wItems[i].value]) { widget.selectIndex(i) } } this.disableEventsFlag = false
					}
				}
				this.kodAtandimi = true
			}
			if (veriYukleninceBlock) {
				const _e = $.extend({}, e, {
					parentPart, sender: this, builder: this.builder, get wItems() { return widget.getItems() },
					get source() { return widget.source }, get recs() { return widget.source?.records }
				}); getFuncValue.call(this, veriYukleninceBlock, _e)
			}
		}, 100)
	}
	listedenSecIstendi(e) {
		e = e || {}; const evt = e.event; if (evt) { evt.preventDefault(); evt.stopPropagation() } if (this.listedenSecilemezFlag || this.widget.disabled) { return }
		const {parentPart, builder, mfSinif, input, widget, kodGosterilsinmi} = this, sender = this, _e = { ...e, sender, builder, parentPart, mfSinif };
		const kodSaha = mfSinif ? ($.isArray(mfSinif.idSaha) ? mfSinif.idSaha[0] : mfSinif.idSaha) ?? mfSinif.kodSaha : this.kodSaha || MQKA.kodSaha;
		const adiSaha = mfSinif ? mfSinif.adiSaha : this.adiSaha || MQKA.adiSaha;
		clearTimeout(this.openTimer); setTimeout(() => { if (widget.isOpened()) widget.close() }, 20);
		const {coklumu, initArgsDuzenleBlock} = this; let initArgs = {
			..._e, sender: this, args: {
				sender, parentPart, builder, mfSinif, tekilmi: !coklumu, wndArgsDuzenle: e => { const {wndArgs} = e /* wndArgs.isModal = true */ },
				argsDuzenle: _e => {
					_e = { ...e, ..._e }; const {args} = _e, {listeArgsDuzenleBlock} = this; /*if (!coklumu) { args.selectionMode = 'singlerow' } */
					if (listeArgsDuzenleBlock) { getFuncValue.call(this, listeArgsDuzenleBlock, _e) }
				},
				tabloKolonlari: kodGosterilsinmi ? (mfSinif ? null : MQKA.orjBaslikListesi) : ((mfSinif ?? MQKA).orjBaslikListesi.filter(x => x.belirtec != (mfSinif || MQKA).kodSaha)),
				ozelQueryDuzenle: this.ozelQueryDuzenleBlock, loadServerDataBlock: mfSinif ? null : this.loadServerDataBlock,
				bindingComplete: _e => {
					_e = { ...e, ..._e }; const {sender, gridWidget} = _e, {coklumu} = this;
					let kodSet = this.kod || {}; if (kodSet != null && typeof kodSet != 'object') { kodSet = [kodSet] } if ($.isArray(kodSet)) { kodSet = asSet(kodSet) }
					gridWidget.beginupdate(); gridWidget.clearselection();
					if (kodSet) {
						const recs = _e.source?.records ?? []; let foundIndex, positionedFlag = false;
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
					this.inEvent = false; const {isDropDown, coklumu, layout, widget} = this, {listBox} = widget; let value; $('body').removeClass('bg-modal');
					const wndContents = $('.wnd-content'); if (wndContents?.length) { for (const key of ['animate-wnd-content', 'animate-wnd-content-slow']) {wndContents.removeClass(key) } }
					if (isDropDown) {
						setTimeout(() => showProgress(), 20);
						setTimeout(() => {
							if (coklumu) {
								const valuesSet = asSet(e.values ?? [e.value]);
								for (const item of widget.getItems() || []) { const _value = item?.value ?? item; item.checked = !!valuesSet[_value] }
								this.onChange({ force: true, type: 'trigger' })
							}
							else { value = e.value ?? null; this.val(value); this.onChange({ force: true, type: 'trigger', args: { item: e.rec, value } }) }
							hideProgress()
						}, 120)
					}
					else {
						const recs = e.recs || [], rec = recs[0] ?? e.rec, _recs = $.isArray(recs) ? recs : $.makeArray(rec);
						const values = e.values ?? [], value = values[0] ?? e.value, _values = $.isArray(values) ? values : $.makeArray(values);
						setTimeout(() => showProgress(), 20);
						setTimeout(() => {
							try {
								if (coklumu) {
									listBox.clear(); for (const rec of _recs) { widget.addItem(rec); widget.selectItem(widget.getItems().slice(-1)[0]) }
									input.val(''); this.onChange({ force: true, type: 'trigger' }).then(() => {
										let handler = evt => {
											layout.off('bindingComplete', handler);
											setTimeout(() => { if (widget.isOpened()) { widget.close() } input.focus() }, 1)
										};
										layout.on('bindingComplete', handler); widget.dataBind() })
								}
								else {
									const text = widget.renderSelectedItem ? widget.renderSelectedItem(null, rec) : value;
									this.val(value); this.onChange({ force: true, type: 'trigger', args: { item: e.rec, value } });
									setTimeout(() => widget.input.val(text), 100)
								}
							}
							finally { hideProgress() }
						}, 120)
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
						else { setTimeout(() => widget.input.focus(), 10) }
					}, 1)
				},
				kapaninca: e => {
					const {parentPart} = this, {gridWidget} = parentPart?.gridPart || {};
					let otherWindows = $('.jqx-window'); if (otherWindows.length) { otherWindows.jqxWindow('expand'); $('body').removeClass('bg-modal') }
					if (gridWidget) { setTimeout(() => gridWidget.focus(), 10) }
				}
			}
		};
		if (initArgsDuzenleBlock) { getFuncValue.call(this, initArgsDuzenleBlock, initArgs) }
		let part = new MasterListePart(initArgs.args); setTimeout(() => part.run(), 10)
		let otherWindows = $('.jqx-window'); if (otherWindows.length) { otherWindows.jqxWindow('collapse') }
	}
	getDataAdapter(e) {
		e = e || {}; const {mfSinif} = this; let {dataAdapterBlock, loadServerDataBlock, loadServerDataEkDuzenleBlock} = this;
		if (!(dataAdapterBlock || loadServerDataBlock || mfSinif)) { return null } if (mfSinif) { e.mfSinif = mfSinif }
		let da; if (dataAdapterBlock) { da = getFuncValue.call(this, dataAdapterBlock, $.extend({}, e)) }
		if (!da) {
			da = new $.jqx.dataAdapter({ dataType: wsDataType, url: 'empty.json', data: e }, {
				cache: false, autoBind: e.autoBind ?? this.autoBind,
				loadServerData: async (wsArgs, source, callback) => {
					let lastError; const sender = this, {parentPart, builder, secimler, mfSinif} = this, args = parentPart?.args;		/* const _e = $.extend({}, e, { wsArgs: wsArgs, source: source, callback: callback }); */ 
					const kodSaha = mfSinif ? ($.isArray(mfSinif.idSaha) ? mfSinif.idSaha[0] : mfSinif.idSaha) ?? mfSinif.kodSaha : MQKA.kodSaha;
					const adiSaha = mfSinif ? mfSinif.adiSaha : MQKA.adiSaha, kodKullanilirmi = mfSinif?.kodKullanilirmi, adiKullanilirmi = mfSinif?.adiKullanilirmi;
					let temps = {}; const {wsArgsDuzenleBlock, ozelQueryDuzenleBlock} = this;
					for (let i = 0; i < 3; i++) {
						try {
							if (wsArgsDuzenleBlock) { const _e = { ...e, wsArgs, source, temps }; await wsArgsDuzenleBlock.call(this, wsArgsDuzenleBlock, _e); wsArgs = _e.wsArgs; temps = _e.temps }
							if (ozelQueryDuzenleBlock) { wsArgs.ozelQueryDuzenleBlock = ozelQueryDuzenleBlock; wsArgs.temps = temps }
							let {tabloKolonlari} = wsArgs; if (!tabloKolonlari) {
								tabloKolonlari = this._wsArgs_tabloKolonlari; if (!tabloKolonlari) {
									tabloKolonlari = []; if (kodKullanilirmi) { tabloKolonlari.push(new GridKolon({ belirtec: kodSaha })) }
									if (adiKullanilirmi) { tabloKolonlari.push(new GridKolon({ belirtec: adiSaha })) }
								}
								wsArgs.tabloKolonlari = this._wsArgs_tabloKolonlari = tabloKolonlari
							}
							const _e = $.extend({ parentPart, sender, builder, secimler, callback, args }, wsArgs);
							let result = loadServerDataBlock ? await getFuncValue.call(this, loadServerDataBlock, _e) : (mfSinif ? (await mfSinif.loadServerData(_e)) : null); if (!result) { return }
							if ($.isArray(result)) result = { totalrecords: result.length, records: result }; if (typeof result != 'object') { return }
							let recs = result.records; if (!recs) { return }
							const {bosKodAlinirmi, bosKodEklenirmi} = this;
							if (!bosKodAlinirmi) { const index = recs.findIndex(rec => !rec[kodSaha]); if (index != false && index > -1) { recs.splice(index, 1) } }
							else if (bosKodEklenirmi) { let rec = recs.find(rec => !rec[kodSaha]); if (!rec) { rec = {}; rec[kodSaha] = ''; rec[adiSaha] = ''; recs.unshift(rec) } }
							if (loadServerDataEkDuzenleBlock) {
								_e.recs = recs; let _result = await getFuncValue.call(this, loadServerDataEkDuzenleBlock, _e);
								if ($.isArray(_result)) {
									recs = _e.recs = _result; result.records = recs;
									if (result.totalrecords != null) { result.totalrecords = e.totalrecords ?? recs.length }
								}
							}
							if (!result.totalrecords) { result.totalrecords = recs.length }
							lastError = null; callback(result);
							/* await new $.Deferred(p => setTimeout(async () => { await this.veriYuklendi(e); p.resolve() }, i * 10)) */
							await this.veriYuklendi(e); break
						}
						catch (ex) { lastError = ex; await new $.Deferred(p => setTimeout(() => p.resolve(), i * 100)) }
					}
					if (lastError) { const ex = lastError; if (!(ex?.message?.includes(`undefined (reading '1')`))) { console.error(ex); displayMessage(getErrorText(ex), 'ComboBox Verisi Alınamadı') } }
				}
			})
		}
		return da
	}
	onResize(e) {
		super.onResize(e); if (this.isDestroyed) { return } const {noAutoWidthFlag, layout, input} = this;
		if (!noAutoWidthFlag) {
			const parent = layout.parent();
			if (parent?.length && parent.width()) { input[this.jqxSelector]({ width: parent.width() - 5 }) }
		}
	}
	comboBox() { this.isDropDown = false; return this } dropDown() { this.isDropDown = true; return this }
	noMF() { this.mfSinif = null; return this } resetMF() { this.mfSinif = undefined; return this }
	listedenSecilemez() { this.listedenSecilemezFlag = true; return this } listedenSecilir() { this.listedenSecilemezFlag = false; return this }
	autoWidth() { this.noAutoWidthFlag = false; return this } noAutoWidth() { this.noAutoWidthFlag = true; return this }
	noAutoGetSelectedItem() { this.noAutoGetSelectedItemFlag = true; return this } autoGetSelectedItem() { this.noAutoGetSelectedItemFlag = false; return this }
	kodGosterilsin() { this.kodGosterilsinmi = true; return this } kodGosterilmesin() { this.kodGosterilsinmi = false; return this }
	tekli() { this.coklumu = false; return this } coklu() { this.coklumu = true; return this }
	kodlu() { this.kodGosterilsin(); return this } kodsuz() { this.kodGosterilmesin(); return this }
	bosKodAlinir() { this.bosKodAlinirmi = true; return this } bosKodAlinmaz() { this.bosKodAlinirmi = false; return this }
	bosKodEklenir() { this.bosKodEklenirmi = true; return this } bosKodEklenmez() { this.bosKodEklenirmi = false; return this }
	enable() { this.disabled = false; return this } disable() { this.disabled = true; return this }
	change(handler) { const {degisinceEvent} = this; if (!degisinceEvent.find(x => x == handler)) { degisinceEvent.push(handler) } } degisince(handler) { return this.change(handler) }
	veriYuklenince(handler) { this.veriYukleninceBlock = handler; return this } veriYukleninceIslemi(handler) { return this.veriYuklenince(e) }
	ozelQueryDuzenleHandler(value) { this.ozelQueryDuzenleBlock = value; return this }
	loadServerDataHandler(value) { this.loadServerDataBlock = value; return this }
	initArgsDuzenleHandler(value) { this.initArgsDuzenleBlock = value; return this }
	listeArgsDuzenleHandler(value) { this.initArgsDuzenleBlock = value; return this }
	on(eventName, handler) { return eventName == 'change' ? this.change(handler) : this }
	off(eventName, handler) {
		if (eventName == 'change') {
			if (handler) { const {degisinceEvent} = this, ind = degisinceEvent.findIndex(x => x == handler); if (ind != null && ind > -1) { degisinceEvent.splice(ind, 1) } }
			else { return change(handler) }
		}
		return this
	}
}
