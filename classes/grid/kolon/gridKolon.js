class GridKolon extends GridKolonVeGrupOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static colEventNames = [
		'cellClassName', 'renderer', 'rendered', 'cellsRenderer', 'createEditor', 'initEditor', 'getEditorValue', 'destroyEditor',
		'cellValueChanging', 'createFilterPanel', 'createFilterWidget', 'cellBeginEdit', 'cellEndEdit', 'validation', 'aggregatesRenderer'
	];
	static globalEventNames = ['cellValueChanged', 'cellSelect', 'cellUnselect', 'handleKeyboardNavigation', 'filter', 'sort', 'rowClick', 'rowDoubleClick', 'cellClick', 'groupsChanged', 'bindingComplete'];
	static deferredEventNames = asSet(['cellValueChanged']);

	readFrom_ara(e) {
		if (!super.readFrom_ara(e)) { return false }
		const {maxLength} = e; const genislik = e.genislik ?? e.width ?? null, tipOrDef = e.tip ?? null; /* this.belirtec = e.belirtec || e.attr || e.dataField || e.datafield; */
		this.text = e.text ?? '';
		if (genislik) { this.genislik = genislik } else if (e.genislikCh != null) { this.genislikCh = e.genislikCh }
		this.minWidth = e.minWidth ?? 0; this.maxWidth = e.maxWidth; this.sql = e.sql ?? (e.noSql ? false : null);
		this.columnType = e.columnType ?? null; this.cellsFormat = e.cellsFormat ?? null; this.aggregates = e.aggregates ?? null;
		this.filterType = e.filterType ?? null; this.filterCondition = e.filterCondition ?? null;
		this.setAttributes(e); const {colEventNames, globalEventNames} = this.class;
		for (const key of colEventNames) {
			if (key == 'cellClassName') { this[key] = e[key] }
			else { const func = getFunc(e[key]); if (func) { this[key] = func } }
		}
		for (const key of globalEventNames) { const func = getFunc(e[key]); if (func) { this[key] = func } }
		let tip = null; if (tipOrDef) {
			if (typeof tipOrDef == 'object') { tip = $.isPlainObject(tipOrDef) ? GridKolonTip.from(tipOrDef) : tipOrDef }
			else if (typeof tipOrDef == 'string') { tip = GridKolonTip.from($.extend({}, e, { tip: tipOrDef })) }
		}
		if (!tip) { tip = new GridKolonTip_String(); this.tip = tip }
		if (maxLength) { tip.maxLength = maxLength }
		const savedCellValueChanging = this.cellValueChanging; this.cellValueChanging = (colDef, rowIndex, dataField, columnType, oldValue, newValue) => {
			if (colDef && !colDef.isEditable) { return oldValue }
			let result; if (savedCellValueChanging) { result = getFuncValue.call(this, savedCellValueChanging, colDef, rowIndex, dataField, columnType, oldValue, newValue) }
			if (result === false) { result = oldValue } return result
		};
		const savedCellsRenderer = this.cellsRenderer; this.cellsRenderer = (colDef, rowIndex, belirtec, value, html, jqxCol, rec, result) => {
			if (result === undefined) { result = html }
			const type = 'cellsRenderer', {gridPart} = colDef, {inst} = gridPart || {}, mfSinif = gridPart?.mfSinif ?? inst?.class; clearTimeout(this._timer_rendered);
			if (gridPart) {
				const delayMS = gridPart.renderDelayMS ?? mfSinif?.orjBaslik_gridRenderDelayMS ?? MQCogul.defaultOrjBaslik_gridRenderDelayMS;
				let {_timestamp_gridRendered} = gridPart; /*if (!_timestamp_gridRendered || (now() - _timestamp_gridRendered) >= 10)*/
				if (gridPart?.gridRendered) {
					_timestamp_gridRendered = gridPart._timestamp_gridRendered = now();
					this._timer_rendered = setTimeout(() => gridPart.gridRendered({ type, gridPart, mfSinif, inst, colDef, rec, rowIndex, belirtec, value, html }), delayMS)
				}
			}
			if (savedCellsRenderer) { result = getFuncValue.call(this, savedCellsRenderer, colDef, rowIndex, belirtec, value, html, jqxCol, rec) } return result
		};
		const savedRenderer = this.renderer; if (savedRenderer) {
			this.renderer = (colDef, text, align, width) => {
				const {gridPart, rendererEk} = this, {gridWidget} = gridPart;
				const renderBlock = value => gridWidget._rendercolumnheader(value, align, width, gridWidget)
				let result = savedRenderer ? getFuncValue.call(this, savedRenderer, text, align, width, result, gridPart, renderBlock) : null;
				if (rendererEk) { result = getFuncValue.call(this, rendererEk, this, text, align, width, result, gridPart, renderBlock) }
				if (result == null) { result = gridWidget._rendercolumnheader(text, align, width, gridWidget) }
				return result
			}
		}
		if (!this.cellClassName) {
			this.cellClassName = (colDef, rowIndex, belirtec, value, rec) => {
				const {gridWidget} = this.gridPart || {}, result = [belirtec];
				if (gridWidget?.editable && !this.attributes.editable) { result.push('grid-readOnly') }
				const {tip, alignn} = colDef; if (tip) { const _value = tip.class.cellClassName; if (_value) { result.push(_value) } }
				if (align) { result.push(align) } return result.join(' ')
			}
		}
		let align = this.align = e.align || e.align || null; if (tip && !align) { const {defaultAlign} = tip.class; if (defaultAlign) { align = this.align = defaultAlign } }
		return true
	}
	setAttributes(e) {
		e = e || {}; const attributes = this.attributes = {
			editable: (e.editable ?? null),
			hidden: (e.hidden ?? null),
			sortable: (e.sortable ?? null),
			filterable: (e.filterable ?? null),
			groupable: (e.groupable ?? null),
			resizable: (e.resizable ?? null),
			draggable: (e.draggable ?? null),
			pinned: (e.pinned ?? false)
		};
		let _attributes = e.attributes;
		if (_attributes && typeof _attributes == 'string') { _attributes = _attributes ? _attributes.split(' ').filter(x => !!x) : null }
		if (_attributes && $.isArray(_attributes)) { _attributes = asSet(_attributes) }
		if (_attributes && typeof _attributes == 'object') {
			for (const key in _attributes) { const flag = !!_attributes[key]; if (attributes[key] !== undefined) attributes[key] = flag }
			for (const key in attributes) { let value = attributes[key]; if (value == null) value = attributes[key] = false }
		}
		else {
			for (const key in attributes) {
				let value = attributes[key];
				if (value == null) { switch (key) { case 'hidden': value = false; break; default: value = true; break } attributes[key] = value }
			}
		}
	}
	asRSahalar(e) { return [this.asRSaha(e)] }
	asRSaha(e) {
		if (!this.sqlIcinUygunmu) { return null }
		e = e || {}; const {belirtec} = this; let {sql} = this;
		if (!sql) { const {alias} = e, aliasVeNokta = alias ? alias + '.' : ''; sql = aliasVeNokta + belirtec }
		const {text, genislikCh, tip} = this;
		return new RRSahaDegisken({ attr: belirtec, baslik: text, genislikCh, tip, sql })
	}
	belirtec2KolonDuzenle(e) { super.belirtec2KolonDuzenle(e); const {duzKolonTanimlari} = e; duzKolonTanimlari.push(this) }
	jqxColumnsDuzenle(e) { super.jqxColumnsDuzenle(e); const {columns} = e; columns.push(this.jqxColumn) }
	get jqxColumn() { const e = { column: {} }; this.jqxColumnDuzenle(e); return e.column }
	jqxColumnDuzenle(e) {
		e.colDef = this; const {column} = e, {belirtec, text, genislik, aggregates, tip, minWidth, maxWidth} = this;
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
		const {attributes} = this; if (attributes) { for (const key in attributes) { const value = attributes[key]; column[key] = value } }
		const {deferredEventNames, colEventNames} = this.class;
		for (const key of colEventNames) {
			const func = this[key] ?? (tip ? (tip[key] || tip.class[key]) : null); if (!func) { continue }
			const handler = (key, tip, ...args) => {
				if (args) { for (let i = 0; i < args.length; i++) { let value = args[i]; if (value != null && value?.constructor.name == 'Number') { args[i] = value = asFloat(value) } } }
				let func, result; if (tip) {
					func = tip.class[key]; if (func) { result = getFuncValue.call(tip, func, this, ...args, result) }
					func = tip[key]; if (func) { result = getFuncValue.call(tip, func, this, ...args, result) }
				}
				func = this[key]; if (func) { result = getFuncValue.call(this, func, this, ...args, result) }
				return result
			};
			column[key] = deferredEventNames[key]
				? (...args) => setTimeout((key, tip, ...args) => handler(key, tip, ...args), 10, key, tip, ...args)
				: (...args) => handler(key, tip, ...args)
		}
	}
	get genislikCh() { const value = this.genislik; return value ? value * katSayi_px2Ch : value; }
	set genislikCh(value) { this.genislik = value ? value * katSayi_ch2Px : value; return this }
	get sqlIcinUygunmu() { return this.sql !== false }
	get sabitmi() { return !!this.attributes.pinned }
	get isEditable() { return !!this.attributes.editable }
	set isEditable(value) {  this.attributes.editable = value }
	get isHidden() { return !!this.attributes.hidden }
	set isHidden(value) { this.attributes.hidden = value }
	hidden() { this.attributes.hidden = true; return this }
	visible() { this.attributes.hidden = false; return this }
	sabitle() { this.attributes.pinned = true; return this }
	serbestBirak() { this.attributes.pinned = false; return this }
	alignLeft() { this.align = 'left'; return this }
	alignCenter() { this.align = 'center'; return this }
	alignRight() { this.align = 'right'; return this }
	noSql() { this.sql = false; return this }
	resetNoSql() { this.sql = null; return this }
	sifirGosterme() { const {tip} = this; if (tip?.sifirGosterme) tip.sifirGosterme(); return this }
	sifirGoster() { const {tip} = this; if (tip?.sifirGoster) tip.sifirGoster(); return this }
	kodsuz() { return this.kodGosterilmesin() }
	kodGosterilmesin() { const {tip} = this; if (tip?.kodGosterilmesin) tip.kodGosterilmesin(); return this }
	kodGosterilsin() { const {tip} = this; if (tip?.kodGosterilsin) tip.kodGosterilsin(); return this }
	dropDown() { const {tip} = this; if (tip?.dropDown) tip.dropDown(); return this }
	comboBox() { const {tip} = this; if (tip?.comboBox) tip.comboBox(); return this }
	onKeyDown(handler) { const {tip} = this; if (tip?.onKeyDown) tip.onKeyDown(handler); return this }
	setMaxLength(value) { const {tip} = this; if (tip?.setMaxLength) tip.setMaxLength(value); return this }
	tipString(e) {
		e = e || {}; const maxLength = typeof e == 'object' ? e.maxLength : e;
		this.tip = new GridKolonTip_String({ maxLength }); return this
	}
	tipNumerik(e) {
		e = e || {}; const tip = this.tip = new GridKolonTip_Number();
		if (e.sifirGosterme ?? e.sifirGostermeFlag) { tip.sifirGosterme() }
		this.alignRight(); return this
	}
	tipDecimal(e) {
		e = e || {}; const fra = typeof e == 'object' ? e.fra : e;
		const tip = this.tip = new GridKolonTip_Decimal({ fra });
		if (e.sifirGosterme ?? e.sifirGostermeFlag) { tip.sifirGosterme() }
		this.alignRight(); return this
	}
	tipDecimal_fiyat(e) { return this.tipDecimal({ fra: 'fiyat' }) }
	tipDecimal_dvFiyat(e) { return this.tipDecimal({ fra: 'dvFiyat' }) }
	tipDecimal_bedel(e) { return this.tipDecimal({ fra: 'bedel' }) }
	tipDecimal_dvBedel(e) { return this.tipDecimal({ fra: 'dvBedel' }) }
	tipDate(e) { this.tip = new GridKolonTip_Date(e); return this }
	tipTime(e) { this.tip = new GridKolonTip_Time(e); return this }
	tipTime_noSecs(e) {
		e = e || {}; const noSecs = typeof e == 'object' ? e.noSecsFlag ?? e.noSecs : e;
		return this.tipTime($.extend({}, e, { noSecs }))
	}
	tipCheckbox(e) { return this.tipBool(e) }
	tipBool(e) { this.tip = new GridKolonTip_Bool(e); return this }
	tipTekSecim(e) { this.tip = new GridKolonTip_TekSecim(e); return this }
	tipBirKismi(e) { this.tip = new GridKolonTip_BirKismi(e); return this }
	tipOzel(e) { if (typeof e == 'string') e = { value: e }; this.tip = new GridKolonTip_Ozel(e); return this }
	tipButton(e) { if (typeof e == 'string') e = { value: e }; this.tip = new GridKolonTip_Button(e); return this }
	tipImage(e) { if (typeof e == 'string') e = { value: e }; this.tip = new GridKolonTip_Image(e); return this }
	*getIter() { yield this }
}

(function() {
	const anaTip2Sinif = GridKolonVeGrupOrtak._anaTip2Sinif, subClasses = [GridKolon];
	for (const cls of subClasses) { const {anaTip} = cls; if (anaTip) anaTip2Sinif[anaTip] = cls }
})()
