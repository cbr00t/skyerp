class GridKolon extends GridKolonVeGrupOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static colEventNames = [
		'cellClassName', 'renderer', 'rendered', 'cellsRenderer', 'createEditor', 'initEditor', 'getEditorValue', 'destroyEditor',
		'cellValueChanging', 'createFilterPanel', 'createFilterWidget', 'cellBeginEdit', 'cellEndEdit', 'validation', 'aggregatesRenderer',
		'satirEklendi', 'satirDGuncellendi', 'satirSilinecek', 'satirSilindi', 'rowCountDegisti', 'satirTiklandi', 'satirCiftTiklandi'
	];
	static globalEventNames = [
		'cellValueChanged', 'cellSelect', 'cellUnselect', 'handleKeyboardNavigation', 'filter', 'sort',
		'rowClick', 'rowDoubleClick', 'cellClick', 'groupsChanged', 'bindingComplete'
	];
	static deferredEventNames = asSet(['cellValueChanged']);

	readFrom_ara(e) {
		if (!super.readFrom_ara(e)) { return false }
		let {maxLength} = e, genislik = e.genislik ?? e.width ?? null, tipOrDef = e.tip ?? null;
		/* this.belirtec = e.belirtec || e.attr || e.dataField || e.datafield; */
		this.text = e.text ?? '';
		if (genislik) { this.genislik = genislik } else if (e.genislikCh != null) { this.genislikCh = e.genislikCh }
		this.minWidth = e.minWidth ?? 0; this.maxWidth = e.maxWidth; this.sql = e.sql ?? (e.noSql ? false : null);
		this.columnType = e.columnType ?? null; this.cellsFormat = e.cellsFormat ?? null; this.aggregates = e.aggregates ?? null;
		this.filterType = e.filterType ?? null; this.filterCondition = e.filterCondition ?? null;
		this.setAttributes(e); let {colEventNames, globalEventNames} = this.class;
		for (let key of colEventNames) {
			if (key == 'cellClassName') { this[key] = e[key] }
			else { let func = getFunc(e[key]); if (func) { this[key] = func } }
		}
		for (let key of globalEventNames) { let func = getFunc(e[key]); if (func) { this[key] = func } }
		let tip = null; if (tipOrDef) {
			if (typeof tipOrDef == 'object') { tip = $.isPlainObject(tipOrDef) ? GridKolonTip.from(tipOrDef) : tipOrDef }
			else if (typeof tipOrDef == 'string') { tip = GridKolonTip.from($.extend({}, e, { tip: tipOrDef })) }
		}
		if (!tip) { tip = this.tip = new GridKolonTip_String() }
		if (maxLength) { tip.maxLength = maxLength }
		let savedCellValueChanging = this.cellValueChanging; this.cellValueChanging = (colDef, rowIndex, dataField, columnType, oldValue, newValue) => {
			if (colDef && !colDef.isEditable) { return oldValue }
			let result; if (savedCellValueChanging) { result = getFuncValue.call(this, savedCellValueChanging, colDef, rowIndex, dataField, columnType, oldValue, newValue) }
			if (result === false) { result = oldValue } return result
		};
		let savedRenderer = this.renderer; if (savedRenderer) {
			this.renderer = (colDef, text, align, width) => {
				let {gridPart, rendererEk} = this, {gridWidget} = gridPart;
				let renderBlock = value => gridWidget._rendercolumnheader(value, align, width, gridWidget)
				let result = savedRenderer ? getFuncValue.call(this, savedRenderer, text, align, width, result, gridPart, renderBlock) : null;
				if (rendererEk) { result = getFuncValue.call(this, rendererEk, this, text, align, width, result, gridPart, renderBlock) }
				if (result == null) { result = gridWidget._rendercolumnheader(text, align, width, gridWidget) }
				return result
			}
		}
		let savedCellsRenderer = this.cellsRenderer; this.cellsRenderer = (colDef, rowIndex, belirtec, value, html, jqxCol, rec, result) => {
			if (typeof html == 'object' && 'expanded' in html && 'level' in html) {    /* treeGrid callback */
				result = jqxCol; jqxCol = null;
				html = `<div class="full-wh">${result}`
			}
			if (result === undefined) { result = html }
			let type = 'cellsRenderer', {gridPart} = colDef, {inst} = gridPart || {};
			let mfSinif = gridPart?.mfSinif ?? inst?.class; clearTimeout(this._timer_rendered);
			if (gridPart) {
				let delayMS = gridPart.renderDelayMS ?? mfSinif?.orjBaslik_gridRenderDelayMS ?? MQCogul.defaultOrjBaslik_gridRenderDelayMS;
				let {_timestamp_gridRendered} = gridPart; /*if (!_timestamp_gridRendered || (now() - _timestamp_gridRendered) >= 10)*/
				if (gridPart?.gridRendered) {
					_timestamp_gridRendered = gridPart._timestamp_gridRendered = now();
					this._timer_rendered = setTimeout(() => gridPart.gridRendered({ type, gridPart, mfSinif, inst, colDef, rec, rowIndex, belirtec, value, html }), delayMS)
				}
			}
			html = typeof result == 'string' ? result : html;
			if (savedCellsRenderer) { result = getFuncValue.call(this, savedCellsRenderer, colDef, rowIndex, belirtec, value, html, jqxCol, rec, result) }
			return result
		};
		if (!this.cellClassName) {
			this.cellClassName = (colDef, rowIndex, belirtec, value, rec) => {
				if (colDef === undefined) {
					colDef = rowIndex; rowIndex = belirtec;
					belirtec = value; value = rec
				}
				let {gridWidget} = this.gridPart || {}, result = [belirtec];
				if (gridWidget?.editable && !this.attributes.editable) { result.push('grid-readOnly') }
				let {tip, align} = colDef;
				if (tip) { let _value = tip.class.cellClassName; if (_value) { result.push(_value) } }
				if (align) { result.push(align) }
				let {level, expanded, leaf} = rec ?? {};
				if (level != null) { result.push(`level-${level}`) }
				if (expanded != null) { result.push(expanded ? 'expanded' : 'collapsed') }
				if (leaf) { result.push('leaf') }
				return result.join(' ')
			}
		}
		let align = this.align = e.align || e.align || null;
		if (tip && !align) { let {defaultAlign} = tip.class; if (defaultAlign) { align = this.align = defaultAlign } }
		return true
	}
	handleKeyboardNavigation_ortak(e) {
		let result = super.handleKeyboardNavigation_ortak(e); if (result != null) { return result }
		return this.tip?.handleKeyboardNavigation_ortak(e)
	}
	setAttributes(e) {
		e = e || {}; let attributes = this.attributes = {
			editable: (e.editable ?? null),
			hidden: (e.hidden ?? null),
			sortable: (e.sortable ?? null),
			filterable: (e.filterable ?? null),
			groupable: (e.groupable ?? null),
			resizable: (e.resizable ?? null),
			draggable: (e.draggable ?? null),
			pinned: (e.pinned ?? false),
			exportable: (e.exportable ?? null)
		};
		let _attributes = e.attributes; if (_attributes && typeof _attributes == 'string') { _attributes = _attributes ? _attributes.split(' ').filter(x => !!x) : null }
		if (_attributes && $.isArray(_attributes)) { _attributes = asSet(_attributes) }
		if (_attributes && typeof _attributes == 'object') {
			for (let key in _attributes) { let flag = !!_attributes[key]; if (attributes[key] !== undefined) attributes[key] = flag }
			for (let key in attributes) { let value = attributes[key]; if (value == null) value = attributes[key] = false }
		}
		else {
			for (let key in attributes) {
				let value = attributes[key];
				if (value == null) { switch (key) { case 'hidden': value = false; break; default: value = true; break } attributes[key] = value }
			}
		}
	}
	asRSahalar(e) { return [this.asRSaha(e)] }
	asRSaha(e) {
		if (!this.sqlIcinUygunmu) { return null }
		e = e || {}; let {belirtec} = this; let {sql} = this;
		if (!sql) { let {alias} = e, aliasVeNokta = alias ? alias + '.' : ''; sql = aliasVeNokta + belirtec }
		let {text, genislikCh, tip} = this;
		return new RRSahaDegisken({ attr: belirtec, baslik: text, genislikCh, tip, sql })
	}
	belirtec2KolonDuzenle(e) { super.belirtec2KolonDuzenle(e); let {duzKolonTanimlari} = e; duzKolonTanimlari.push(this) }
	jqxColumnsDuzenle(e) { super.jqxColumnsDuzenle(e); let {columns} = e; columns.push(this.jqxColumn) }
	get jqxColumn() { let e = { column: {} }; this.jqxColumnDuzenle(e); return e.column }
	jqxColumnDuzenle(e) {
		e.colDef = this; let {column} = e, {belirtec, text, genislik, aggregates, tip, minWidth, maxWidth} = this;
		if (tip) { tip.jqxColumnDuzenle(e) }
		let {align, columnType, cellsFormat, filterType, filterCondition} = this;
		if (tip) {
			let value;
			if (!align && (value = tip.defaultAlign)) { align = this.align = value }
			if (!columnType && (value = tip.jqxColumnType)) { columnType = this.columnType = value }
			if (!cellsFormat && (value = tip.jqxCellsFormat)) { cellsFormat = this.cellsFormat = value }
		}
		if (belirtec) { column.dataField = belirtec }
		if (text) { column.text = text }
		if (genislik) { column.width = genislik }
		column.align = 'center';
		if (align && align != 'left') { column.cellsAlign = align }
		if (columnType) { column.columnType = columnType }
		if (cellsFormat) { column.cellsFormat = cellsFormat }
		if (aggregates) { column.aggregates = aggregates }
		if (minWidth != null) { column.minWidth = minWidth }
		if (maxWidth != null) { column.maxWidth = maxWidth }
		if (filterType != null) { column.filterType = filterType }
		if (filterCondition != null) { column.filterCondition = filterCondition }
		let {attributes} = this; if (attributes) { for (let key in attributes) { let value = attributes[key]; column[key] = value } }
		let {deferredEventNames, colEventNames} = this.class;
		for (let key of colEventNames) {
			let func = this[key] ?? (tip ? (tip[key] || tip.class[key]) : null); if (!func) { continue }
			let handler = (key, tip, ...args) => {
				if (key == 'cellsRenderer' && typeof args?.[3] == 'object') {
					let belirtec = args[1], value = args[2], rec = args[3];
					args[0] = this; args[3] = `<span>${value?.toString() || ''}</span>`
					args[4] = null; args[5] = rec
				}
				if (args) {
					for (let i = 0; i < args.length; i++) {
						let value = args[i];
						if (value != null && value?.constructor.name == 'Number') { args[i] = value = asFloat(value) }
					}
				}
				let func, result; if (tip) {
					func = tip.class[key]; if (func) { result = getFuncValue.call(tip, func, this, ...args, result) }
					func = tip[key]; if (func) { result = getFuncValue.call(tip, func, this, ...args, result) }
				}
				func = this[key]; if (func) { result = getFuncValue.call(this, func, this, ...args, result) }
				return result
			};
			column[key] = deferredEventNames[key]
				? (...args) => setTimeout((key, tip, ...args) => handler(key, tip, ...args), 5, key, tip, ...args)
				: (...args) => handler(key, tip, ...args)
		}
	}
	get genislikCh() { let value = this.genislik; return value ? value * katSayi_px2Ch : value; }
	set genislikCh(value) { this.genislik = value ? value * katSayi_ch2Px : value; return this }
	get sqlIcinUygunmu() { return this.sql !== false }
	get sabitmi() { return !!this.attributes.pinned }
	get isEditable() { return !!this.attributes.editable }
	set isEditable(value) {  this.attributes.editable = value }
	get isHidden() { return !!this.attributes.hidden }
	set isHidden(value) { this.attributes.hidden = value }
	hidden() { this.attributes.hidden = true; return this } visible() { this.attributes.hidden = false; return this }
	sabitle() { this.attributes.pinned = true; return this } serbestBirak() { this.attributes.pinned = false; return this }
	alignLeft() { this.align = 'left'; return this } alignCenter() { this.align = 'center'; return this } alignRight() { this.align = 'right'; return this }
	noSql() { this.sql = false; return this } resetNoSql() { this.sql = null; return this }
	sifirGosterme() { let {tip} = this; if (tip?.sifirGosterme) tip.sifirGosterme(); return this } sifirGoster() { let {tip} = this; if (tip?.sifirGoster) tip.sifirGoster(); return this }
	kodsuz() { return this.kodGosterilmesin() } kodGosterilmesin() { let {tip} = this; if (tip?.kodGosterilmesin) { tip.kodGosterilmesin() } return this }
	kodGosterilsin() { let {tip} = this; if (tip?.kodGosterilsin) { tip.kodGosterilsin() } return this }
	listedenSecilmez(e) { return this.listedenSecilemez(); } listedenSecilemez(e) { this.tip?.listedenSecilemez?.(); return this }
	listedenSecilir(e) { this.tip?.listedenSecilir?.(); return this }
	dropDown() { let {tip} = this; if (tip?.dropDown) { tip.dropDown() } return this } comboBox() { let {tip} = this; if (tip?.comboBox) { tip.comboBox() } return this }
	autoBind() { let {tip} = this; if (tip?.autoBind) { tip.autoBind() } return this } noAutoBind() { let {tip} = this; if (tip?.noAutoBind) { tip.noAutoBind() } return this }
	onKeyDown(handler) { let {tip} = this; if (tip?.onKeyDown) tip.onKeyDown(handler); return this }
	setMaxLength(value) { let {tip} = this; if (tip?.setMaxLength) { tip.setMaxLength(value) } return this }
	setValue(value) { this.tip?.setValue?.(value); return this }
	click(handler) { this.tip?.click?.(handler); return this } onClick(handler) { this.tip?.onClick?.(handler); return this }
	tipString(e) {
		e = e || {}; let maxLength = typeof e == 'object' ? e.maxLength : e;
		this.tip = new GridKolonTip_String({ maxLength }); return this
	}
	tipNumerik(e) {
		e = e || {}; let tip = this.tip = new GridKolonTip_Number();
		if (e.sifirGosterme ?? e.sifirGostermeFlag) { tip.sifirGosterme() }
		this.alignRight(); return this
	}
	tipNumber(e) { return this.tipNumerik(e) }
	tipDecimal(e) {
		e = e || {}; let fra = typeof e == 'object' ? e.fra : e;
		let tip = this.tip = new GridKolonTip_Decimal({ fra });
		if (e.sifirGosterme ?? e.sifirGostermeFlag) { tip.sifirGosterme() }
		this.alignRight(); return this
	}
	tipDecimal_fiyat(e) { return this.tipDecimal({ fra: 'fiyat' }) }
	tipDecimal_dvFiyat(e) { return this.tipDecimal({ fra: 'dvFiyat' }) }
	tipDecimal_bedel(e) { return this.tipDecimal({ fra: 'bedel' }) }
	tipDecimal_dvBedel(e) { return this.tipDecimal({ fra: 'dvBedel' }) }
	tipDate(e) { this.tip = new GridKolonTip_Date(e); return this } tipTarih(e) { return this.tipDate(e) }
	tipTime(e) { this.tip = new GridKolonTip_Time(e); return this } tipSaat(e) { return this.tipTime(e) } tipZaman(e) { return this.tipTime(e) }
	tipTime_noSecs(e) {
		e = e || {}; let noSecs = typeof e == 'object' ? e.noSecsFlag ?? e.noSecs : e;
		return this.tipTime($.extend({}, e, { noSecs }))
	}
	tipCheckbox(e) { return this.tipBool(e) }
	tipBool(e) { this.tip = new GridKolonTip_Bool(e); return this }
	tipTekSecim(e) { this.tip = new GridKolonTip_TekSecim(e); return this }
	tipBirKismi(e) { this.tip = new GridKolonTip_BirKismi(e); return this }
	tipOzel(e) { if (typeof e == 'string') e = { value: e }; this.tip = new GridKolonTip_Ozel(e); return this }
	tipButton(e) { if (typeof e == 'string') e = { value: e }; this.tip = new GridKolonTip_Button(e); return this }
	tipResim(e) { if (typeof e == 'string') e = { value: e }; this.tip = new GridKolonTip_Image(e); return this }
	tipImage(e) { return this.tipImage(e) }
	dipSum(e) { this.aggregates = ['sum']; return this } dipAvg(e) { this.aggregates = ['avg']; return this }
	dipSumVeAvg(e) { this.aggregates = ['sum', 'avg']; return this } setDip(value) { this.aggregates = value; return this }
	*getIter() { yield this }
	setBelirtec(value) { this.belirtec = value; return this }
	setText(value) { this.text = value; return this }
	setWidth(value) { this.width = value; return this }
	setMinWidth(value) { this.minWidth = value; return this }
	setMaxWidth(value) { this.maxWidth = value; return this }
	setGenislikCh(value) { this.genislikCh = value; return this }
	setTip(value) { this.tip = value; return this }
	setCellClassName(value) { this.cellClassName = value; return this }
	setCellsRenderer(handler) { this.cellsRenderer = handler; return this }
}

(function() {
	let anaTip2Sinif = GridKolonVeGrupOrtak._anaTip2Sinif, subClasses = [GridKolon];
	for (let cls of subClasses) { let {anaTip} = cls; if (anaTip) anaTip2Sinif[anaTip] = cls }
})()
