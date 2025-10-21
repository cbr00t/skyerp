class GridKolonTip extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static colEventNames = GridKolon.colEventNames; static globalEventNames = GridKolon.globalEventNames;
	static get anaTip() { return null } static get tip() { return this.anaTip } get anaTip() { return this.class.anaTip } get tip() { return this.class.tip }
	get defaultAlign() { return null } static get isEditable() { return null } get jqxColumnType() { return 'textbox' } get jqxCellsFormat() { return '' }
	get jqxFilterType() { return 'input' } static get jqxFilterAnaTip() { return 'stringfilter' } get jqxFilterAnaTip() { return this.class.jqxFilterAnaTip }
	get jqxFilterCondition() { return 'CONTAINS' } get cellClassName() { return null } get cellsRenderer() { return null }
	get createFilterWidget() {
		return null
		/*return ((colDef,  jqxColumn, filterParent, elmFilter) => {
			if (elmFilter && elmFilter.length && elmFilter.hasClass('jqx-datetimeinput'))
				elmFilter.jqxDateTimeInput({ formatString: DateFormat })
		})*/
	}
	get createEditor() { return null } get initEditor() { return null } get getEditorValue() { return null }
	get initEditor() {
		return ((colDef, rowIndex, value, editor, cellText, pressedChar) => {
			let isCustomEditor = (colDef.columnType == 'custom' || colDef.columnType == 'template'), {maxLength} = this;
			let _editor = editor.children('.editor'); editor = _editor.length ? _editor : editor;
			if (maxLength && isCustomEditor) { editor.prop('maxlength', maxLength) }
			if (_editor?.length && _editor.select) setTimeout(() => { editor.focus(); editor.select() }, 50)
		})
	}
	get validation() {
		return ((colDef, info, value) => {
			let {maxLength} = this;
			if (maxLength != null && value != null && (typeof value == 'string' || typeof value == 'number') && value.toString().length > maxLength)
				return ({ result: false, message: `Değer <b>${maxLength}</b> karakterden fazla olamaz` })
			return true
		})
	}
	
	constructor(e) { super(e); e = e || {}; this.readFrom(e) }
	static getClass(e) { e = e || {}; let tip = typeof e == 'object' ? e.tip : e; return this._tip2Sinif[tip] || this; }
	static from(e) {
		if (!e) return null
		let cls = this.getClass(e); if (!cls) return null
		let result = new cls(e); return result.readFrom(e) ? result : null
	}
	readFrom(e) {
		if (!e) { return false }
		let isEditable = e.editable ?? e.isEditable; this.isEditable = isEditable ?? this.class.isEditable; this.maxLength = e.maxLength;
		let {colEventNames, globalEventNames} = this.class;
		for (let key of colEventNames) { let func = getFunc(e[key]); if (func) { this[key] = func } }
		for (let key of globalEventNames) { let func = getFunc(e[key]); if (func) { this[key] = func } }
		this.kodGosterilmesinmi = e.kodGosterilmesin ?? e.kodGosterilmesinmi ?? e.kodsuzmu ?? e.kodsuz;
		this.listedenSecilemezFlag = e.listedenSecilemez ?? e.listedenSecilemezmi ?? e.listedenSecilemezFlag;
		return true
	}
	/* return true: override grid default handler, return (true / false) = event handled */
	handleKeyboardNavigation_ortak(e) {
		let {keyState: state} = e, {gridPart, gridWidget, editable, editing, sabitmi, modifiers, keyLower: key} = state;
		let {ctrl, shift, alt} = modifiers;
		switch (key) {
			case 'enter': case 'tab': {
				let preventGridEvents = !editing;
				if (!editing) { gridPart.endCellEdit(true) }
				gridPart.selectEditableCell({ ...e, prev: !!modifiers.shift });
				return preventGridEvents
			}
			case 'insert': { if (editable && !sabitmi) { gridPart.addRow({ offset: state.selectedRowIndex }) } return true }
			case 'delete': { if (editable && !sabitmi && ctrl) { gridPart.deleteRow(); return true } }
			case 'arrowdown': {
				let {belirtec, totalRecs} = state, rowIndex = state.rowIndex + 1;
				if (editable && !sabitmi && rowIndex + 1 > totalRecs) { gridPart.addRow({ offset: 'last' }) }
				break
			}
			case 'f2': {
				let {rowIndex, belirtec} = state;
				if (!editing && rowIndex != null && belirtec) { gridWidget.begincelledit(rowIndex, belirtec) }
				return true
			}
			case 'f': {
				if (ctrl) {
					let {parentPart} = gridPart, bulPart = gridPart.bulPart ?? parentPart.bulPart, {input} = bulPart ?? {};
					input?.focus();
					return true
				}
			}
			/*case 'arrowleft': case 'arrowright': {
				let back = key == 'arrowleft', {rowIndex, colIndex, totalCols} = state;
				let belirtec; while (true) {
					colIndex = back ? colIndex - 1 : colIndex + 1;
					let jqxCol = gridWidget.getcolumnat(colIndex); belirtec = jqxCol?.datafield;
					let uygunmu = gridWidget.iscolumnvisible(belirtec);
					if (uygunmu || !(colIndex >= 0 && colIndex + 1 <= totalCols)) {
						if (!uygunmu) { belirtec = null }
						break
					}
				}
				if (belirtec) {
					gridWidget.clearselection(); gridWidget.selectcell(rowIndex, belirtec);
					if (editing) { gridPart.endCellEdit(true) }
				}
				return true
			}
			case 'arrowup': case 'arrowdown': {
				let back = key == 'arrowup', {rowIndex, belirtec, totalRecs} = state;
				rowIndex = back ? rowIndex - 1 : rowIndex + 1;
				if (rowIndex < 0) { return true }
				if (rowIndex + 1 > totalRecs) { gridPart.addRow({ offset: 'last' }) }
				gridWidget.clearselection(); gridWidget.selectcell(rowIndex, belirtec);
				return true
			}*/ 
		}
	}
	static getHTML_groupsTotalRow(value) {
		if (typeof value == 'number') { value = numberToString(value) }
		let text = numberToString(asFloat(value.replace(':', '').replace('Sum', '').replace('Avg', '').replace('TOPLAM', '').replace('ORT', '')));
		return `<div class="bold royalblue right" style="border-top: 3px solid royalblue">${text}</div>`
	}
	static getHTML_totalRow(value) {
		if (typeof value == 'number') { value = numberToString(value) }
		return `<div class="bold forestgreen right" style="border-top: 3px solid forestgreen">${value}</div>`
	}
	jqxColumnDuzenle(e) {
		let {column} = e, colDef = e.colDef || {}, {genislikCh} = colDef;
		let {jqxColumnType, jqxFilterType, jqxFilterAnaTip, jqxFilterCondition, jqxCellsFormat, isEditable} = this;
		if (jqxColumnType) { column.columnType = jqxColumnType }
		if (jqxFilterAnaTip) { column.filterComparasion = jqxFilterAnaTip }
		if (jqxFilterType) { column.filterType = jqxFilterType } /*this.class.stringmi && (jqxFilterType == 'textbox' || jqxFilterType == 'input') && (genislikCh && genislikCh <= 25) ? 'checkedlist' : jqxFilterType*/
		if (jqxFilterCondition) { column.filterCondition = jqxFilterCondition }
		if (jqxCellsFormat !== undefined && !(jqxColumnType == 'template' || jqxColumnType == 'custom')) { column.cellsFormat = jqxCellsFormat }
		if (isEditable != null) { column.editable = isEditable }
	}
	setMaxLength(value) { this.maxLength = value; return this } kodsuz() { return this.kodGosterilmesin() }
	kodGosterilmesin() { this.kodGosterilmesinmi = true; return this } kodGosterilsin() { this.kodGosterilmesinmi = false; return this }
	listedenSecilemez() { this.listedenSecilemezFlag = true; return this } listedenSecililir() { this.listedenSecilemezFlag = false; return this }
}
class GridKolonTip_String extends GridKolonTip {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get anaTip() { return 'string' } static get stringmi() { return true }
	get jqxCellsFormat() { return '' }
}
class GridKolonTip_Number extends GridKolonTip {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get anaTip() { return 'number' } static get mfbmi() { return true }
	get jqxColumnType() { return 'custom' } /* get jqxColumnType() { return 'numberinput' } */
	get defaultAlign() { return 'right' } get jqxCellsFormat() { return super.jqxCellsFormat }
	get jqxFilterType() { return 'checkedlist' } static get jqxFilterAnaTip() { return 'numericfilter' }
	/*get jqxFilterType() { return 'input' } static get jqxFilterAnaTip() { return 'stringfilter' } get jqxFilterCondition() { return 'CONTAINS' }*/

	readFrom(e) {
		if (!e) return false; super.readFrom(e);
		this.sifirGostermeFlag = e.sifirGoster ?? e.sifirGosterFlag;
		this.keyDownHandler = e.keyDownHandler ?? e.keyDown ?? e.onKeyDown;
		return true
	}
	get aggregatesRenderer() {
		return ((colDef, toplamYapi, jqxCol, elm, _) => {
			/*let toplam = ( toplamYapi?.sum ?? toplamYapi.toplam ?? toplamYapi.TOPLAM ) ??
							( toplamYapi?.avg ?? toplamYapi.ort ?? toplamYapi.ORT ?? toplamYapi.ortalama ?? toplamYapi.ORTALAMA );*/
			let toplam = toplamYapi ? Object.values(toplamYapi)[0] : null;
			if (toplam != null) {
				/* let tip = ( toplamYapi.avg ?? toplamYapi.ort ?? toplamYapi.ORT ?? toplamYapi.ortalama ?? toplamYapi.ORTALAMA ) != null ? 'avg' : 'sum';
				if (toplam && tip == 'avg') toplam = toplam */
				return GridKolonTip.getHTML_totalRow(numberToString(toplam))
			}
		})
	}
	get cellsRenderer() {
		return ((colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
			if (rec?.totalsrow) { return GridKolonTip.getHTML_groupsTotalRow(value) }
			rec = colDef.gridPart.gridWidget.getboundrows()[rowIndex] ?? rec; rec = rec?.originalRecord || rec;
			if (value?.constructor?.name == 'Number') { value = asFloat(value) }
			if (value != null) {
				let newValue = asFloat(value); newValue = !value && this.sifirGostermeFlag ? '' : newValue.toString();
				if (value !== newValue) { html = changeTagContent(html, newValue) }
			}
			return html
		})
	}
	get createEditor() {
		return ((colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) => {
			let {maxLength} = this, isCustomEditor = (colDef.columnType == 'custom' || colDef.columnType == 'template');
			if (isCustomEditor && !editor.hasClass('editor')) {
				let parent = editor; parent.addClass('full-wh');
				parent.css('margin', 0); parent.css('padding', 0);
				editor = $(`<input type="number" class="editor" style="width: ${cellWidth}px; height: ${cellHeight}px"/>`);
				editor.appendTo(parent)
			}
			let rec = colDef.gridPart.gridWidget.getboundrows()[rowIndex], fra = this.getFra({ rec });
			if (value && fra && typeof value != 'string') value = roundToFra(value, fra)
			if (isCustomEditor) {
				editor.on('keydown', evt => {
					let handler = this.keyDownHandler;
					if (handler) { let {key} = evt; getFuncValue.call(this, handler, { sender: this, event: evt, key }) }
				});
				/*editor.on('keyup', evt => {
					let {key} = evt;
					if (key == '+' || key == '-') {
						editor.html(`<input type="textbox" class="editor formul" style="width: 100%; height: 100%;" value="${editor.val()}"></input>`);
						let input = editor; input.off('keyup'); input.focus(); input.select()
					}
				});*/
				editor.on('change', evt => { let target = evt.currentTarget; if (fra != null) { target.value = asFloat(target.value?.replaceAll(',', '.'), fra) } })
			}
			else {
				let input = editor.find('input');
				input.on('keydown', evt => { let {key} = evt; let handler = this.keyDownHandler; if (handler) getFuncValue.call(this, handler, { sender: this, event: evt, key }) });
				input.on('keyup', evt => {
					let {key} = evt;
					if (key == '+' || key == '-') {
						editor.html(`<input type="textbox" class="editor formul full-wh" value="${editor.val()}"></input>`);
						let input = editor.find('input'); /* input.on('keyup', handler); */ input.off('keyup'); input.focus(); input.select()
					}
				})
			}
		})
	}
	get initEditor() {
		return ((colDef, rowIndex, value, editor, cellText, pressedChar) => {
			let {maxLength} = this, isCustomEditor = (colDef.columnType == 'custom' || colDef.columnType == 'template');
			let rec = colDef.gridPart.gridWidget.getboundrows()[rowIndex], fra = this.getFra({ rec });
			if (true || isCustomEditor) {
				let _editor = editor.children('.editor'); if (_editor.length) { editor = _editor }
				editor.prop('type', 'number'); editor.prop('value', value || null);
				if (maxLength != null) { editor.prop('maxlength', maxLength) }
				/*editor.css('text-align', 'right'); editor.css('margin-left', '10px');
				editor.attr('style', editor.attr('style') + `; width: calc(var(--full) - 10px) !important`); editor.addClass('full-height')*/
			}
			else { editor.jqxNumberInput({ digits: 17, decimalDigits: fra || 0 }) }
			setTimeout(() => { let input = editor.find('input'); if (!input?.length) { input = editor }; input.focus(); input.select() }, 0)
		})
	}
	get getEditorValue() {
		return ((colDef, rowIndex, value, editor) => {
			let isCustomEditor = (colDef.columnType == 'custom' || colDef.columnType == 'template');
			if (true || isCustomEditor) { let _editor = editor.children('.editor'); if (_editor.length) editor = _editor }
			let input = editor.hasClass('formul') ? editor : editor.find('input.formul');
			value = input?.length ? asFloat(eval((input.val() ?? 0).replaceAll(',', '.'))) : asFloat(editor.val());
			if (value?.constructor?.name == 'Number') { value = asFloat(value) }
			let rec = colDef.gridPart.gridWidget.getboundrows()[rowIndex], fra = this.getFra({ rec });
			if (fra != null) { value = roundToFra(value, fra) }
			return value
		})
	}
	getFra(e) {
		let {fra} = this; if (fra == null || typeof fra == 'number') return fra	
		e = e || {}; let {rec} = e; if (!rec) return null
		let {brmDict} = app.params?.stokBirim || {}; if (!brmDict) return null
		let brm = (typeof fra == 'string' ? rec[fra] : getFuncValue.call(this, fra, e)) ?? null;
		return brm == null ? null : (brmDict[brm]?.fra ?? null)
	}
	sifirGoster() { this.sifirGostermeFlag = false; return this }
	sifirGosterme() { this.sifirGostermeFlag = true; return this }
	onKeyDown(handler) { this.keyDownHandler = handler; return this }
}

class GridKolonTip_Decimal extends GridKolonTip_Number {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'decimal' } /*get jqxColumnType() { return 'numberinput' }*/ get jqxCellsFormat() { return super.jqxCellsFormat }
	// get jqxCellsFormat() { return 'n' }

	readFrom(e) {
		if (!super.readFrom(e)) return false
		let fra = e.fra == null ? null : e.fra;
		if (typeof fra == 'string' && (fra.includes(`=>`) || (fra.includes(`function(`))) ) { try { fra = getFunc.call(this, fra, e) ?? fra } catch (ex) { } }
		switch (fra) {
			case 'fiyat': this.fraFiyat(); break
			case 'dvFiyat': this.fraDvFiyat(); break
			case 'bedel': this.fraBedel(); break
			case 'dvBedel': this.fraDvBedel(); break
			default: this.fra = fra; break
		}
		return true
	}
	get cellsRenderer() {
		return ((colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
			if (rec?.totalsrow) { return GridKolonTip.getHTML_groupsTotalRow(value) }
			let {gridPart} = colDef, gridWidget = gridPart?.gridWidget ?? gridPart?.gridPart?.gridWidget;
			rec = (gridWidget?.getboundrows ? gridWidget.getboundrows()[rowIndex] : null) ?? rec; rec = rec?.originalRecord ?? rec;
			if (rec) { value = rec[columnField] }; let fra = this.getFra({ rec });
			if (value != null) {
				if (typeof value != 'number') value = asFloat(value)
				value = !value && this.sifirGostermeFlag ? '' : (fra == null ? value.toLocaleString() : toStringWithFra(value, fra));
				html = typeof html == 'object' ? value : changeTagContent(html, value)
			}
			return html
		})
	}
	fraFiyat() { let fra = app.params.zorunlu?.fiyatFra; this.fra = fra == null ? 6 : fra; return this }
	fraDvFiyat() { let fra = app.params.zorunlu?.dvFiyatFra; this.fra = fra == null ? 2 : fra; return this }
	fraBedel() { let fra = app.params.zorunlu?.bedelFra; this.fra = fra == null ? 2 : fra; return this }
	fraDvBedel() { let fra = app.params.zorunlu?.dvBedelFra; this.fra = fra == null ? 2 : fra; return this }
}

class GridKolonTip_Date extends GridKolonTip {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get anaTip() { return 'date' } /* get jqxColumnType() { return 'date' } */ get jqxColumnType() { return 'custom' }
	get jqxFilterType() { return 'checkedlist' } static get jqxFilterAnaTip() { return 'datefilter' } get jqxFilterCondition() { return 'CONTAINS' }
	/* get jqxCellsFormat() { return DateFormat } */ get jqxCellsFormat() { return super.jqxCellsFormat }

	get cellsRenderer() {
		let buYil = today().getFullYear();
		return ((colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
			if (value != null) {
				if (rec?.totalsrow) { return GridKolonTip.getHTML_groupsTotalRow(value) }
				let {gridWidget} = colDef?.gridPart;
				rec = (gridWidget?.getboundrows ? gridWidget.getboundrows()[rowIndex] : null) ?? rec; rec = rec?.originalRecord ?? rec;
				let _value = value; value = typeof value == 'number' || value?.constructor?.name == 'Number' ? new Date(asFloat(value)) : asDate(value);
				if (value?.getFullYear) { value = (value.getFullYear() == buYil && value.getMonth() == today().getMonth() ? dateKisaString(value) : dateToString(value)) }
				if (value != _value) { html = changeTagContent(html, value) }
			}
			return html
		})
	}
	/*get getEditorValue() {
		return ((colDef, rowIndex, value, editor) => {
			value = editor.val();
			if (value && typeof value == 'string')
				value = asDate(tarihDegerDuzenlenmis(value))
			return value
		})
	}*/
	get createEditor() {
		return ((colDef, rowIndex, value, parent, cellText, cellWidth, cellHeight) => {
			let isCustomEditor = (colDef.columnType == 'custom' || colDef.columnType == 'template');
			let editor = parent.children('.editor');
			if (!editor.length) {
				editor = $(`<input type="textbox" class="editor full-wh" style="margin: 0; padding: 0"></input>`); editor.appendTo(parent);
				let part = new TarihUIPart({ layout: editor }); editor.data('part', part); part.run()
			}
		})
	}
	get initEditor() {
		return ((colDef, rowIndex, value, parent, cellText, pressedChar) => {
			let editor = parent.children('.editor');
			if (editor.length) {
				value = typeof value == 'number' || value?.constructor?.name == 'Number' ? new Date(asFloat(value)) : asDate(value);
				let {gridPart} = colDef, gridWidget = gridPart?.gridWidget ?? gridPart?.gridPart?.gridWidget, isCustomEditor = (colDef.columnType == 'custom' || colDef.columnType == 'template');
				let rec = (gridWidget?.getboundrows ? gridWidget.getboundrows()[rowIndex] : null) ?? rec;
				let part = editor.data('part'); part.val(value || ''); if (gridWidget.editmode != 'selectedrow') { setTimeout(() => part.focus(), 0) }
			}
		})
	}
	get getEditorValue() {
		return ((colDef, rowIndex, value, parent) => {
			let editor = parent.children('.editor');
			if (editor.length) {
				let isCustomEditor = (colDef.columnType == 'custom' || colDef.columnType == 'template'), part = editor.data('part');
				return asDate(part.val())
			}
		})
	}
}
class GridKolonTip_Time extends GridKolonTip_String {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get anaTip() { return 'time' } /* get jqxColumnType() { return 'time' } */

	readFrom(e) {
		if (!super.readFrom(e)) { return false }
		this.noSecsFlag = e.noSecsFlag ?? e.noSecs;
		return true
	}
	get cellsRenderer() {
		return ((colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
			if (value != null) {
				if (rec?.totalsrow) { return GridKolonTip.getHTML_groupsTotalRow(value) }
				let {gridWidget} = colDef?.gridPart || {}; rec = (gridWidget?.getboundrows ? gridWidget.getboundrows()[rowIndex] : null) ?? rec; rec = rec?.originalRecord ?? rec;
				let _value = value; value = asDate(value); html = isInvalidDate(value) ? null : timeToString(asDate(value), this.noSecsFlag)
			}
			return html
		})
	}
}
class GridKolonTip_TekSecim extends GridKolonTip {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'tekSecim' }
	static get tekSecimmi() { return true } static get birKismimi() { return false }
	get jqxColumnType() { return 'custom' } get jqxFilterType() { return 'checkedlist' }
	get source() { return this._source } set source(value) { this._source = value }
	get kaListe() { return this.tekSecim?.kaListe } get defaultChar() { return this.tekSecim?.char }
	readFrom(e) {
		if (!e) { return false }
		let {tekSecim, tekSecimSinif, kaListe} = e;
		if (typeof tekSecimSinif == 'string') { tekSecimSinif = getFunc.call(this, tekSecimSinif, e) }
		if (!tekSecim && tekSecimSinif) { tekSecim = new tekSecimSinif() }
		if (tekSecim) {
			if (typeof tekSecim == 'string') { tekSecim = getFunc.call(this, tekSecim, e) }
			if (tekSecim) { tekSecim = getFuncValue.call(this, tekSecim, e) }
			if ($.isPlainObject(tekSecim)) { tekSecim = tekSecimSinif ? new tekSecimSinif(tekSecim) : null }
		}
		if (!tekSecim) { tekSecim = new TekSecim() }
		if (kaListe) {
			if (typeof kaListe == 'string') { kaListe = getFunc.call(this, kaListe, e) }
			if (kaListe) { kaListe = getFuncValue.call(this, kaListe, e) }
			if (kaListe) { tekSecim.kaListe = kaListe }
		}
		let {defaultValue} = e; if (defaultValue != null) { tekSecim.defaultChar = defaultValue }
		let {value} = e; if (value != null) tekSecim.char = value;
		this.tekSecim = tekSecim; this.source = e.source || (() => this.kaListe); this.comboBoxmi = e.comboBoxmi ?? e.comboBox;
		this.kodAttr = e.kodAttr || 'kod'; this.adiAttr = e.adiAttr || 'aciklama'; this.recKodAttr = e.recKodAttr; this.recAdiAttr = e.recAdiAttr;
		this._cellValueChanging = e.cellValueChanging; this._cellValueChanged = e.cellValueChanged;
		return true
	}
	get cellsRenderer() {
		return ((colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
			if (rec?.totalsrow) { return GridKolonTip.getHTML_groupsTotalRow(value) }
			let {gridPart} = colDef, gridWidget = gridPart?.gridWidget ?? gridPart?.gridPart?.gridWidget;
			rec = (gridWidget?.getboundrows ? gridWidget.getboundrows()[rowIndex] : null) ?? rec; rec = rec?.originalRecord ?? rec;
			if (value != null) {
				let kaDict = this.getKADict({ belirtec: columnField, rec: rec }) || {};
				let ka = value.aciklama == null ? kaDict[value] : Object.values(kaDict).find(ka => ka.aciklama == value);
				if (ka) { value = ka.aciklama ?? value }
				value = value == null || value.aciklama == null ? (value || '').toString() : (this.kodGosterilmesinmi ? value.aciklama ?? value : value.toString());
				html = changeTagContent(html, value)
			}
			return html
		})
	}
	get createEditor() {
		return ((colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) => {
			let {comboBoxmi, kodAttr, adiAttr} = this;
			let part = new ModelKullanPart({
				parentPart: app.activePart, layout: editor, sender: colDef, coklumu: this.class.birKismimi, autoBind: true, value,
				/*selectionRendererBlock: e => { if (!e.coklumu) { return e.wItem.label || '' } },*/ argsDuzenle: e => {
					$.extend(e.args, {
						autoOpen: false, itemHeight: 28, width: cellWidth, height: cellHeight, dropDownWidth: cellWidth * 2,
						dropDownHeight: 400, autoDropDownHeight: false
						/*renderSelectedItem: (index, rec) => { rec = rec.originalItem || rec || {}; return rec.kod || '' }*/
					})
				},
				veriYuklenince: e => {
					let {gridPart} = colDef, gridWidget = gridPart?.gridWidget ?? gridPart?.gridPart?.gridWidget, gridRec = (gridWidget?.getboundrows ? gridWidget.getboundrows()[rowIndex] : null), recs = e.recs ?? e.source;
					if (recs) { let {belirtec} = colDef, source = recs; this.kaDictYapiOlustur({ belirtec, rec: gridRec, source }) }
				}
			})[comboBoxmi ? 'comboBox' : 'dropDown']().noMF()/*.kodGosterilmesin()*/;
			if (this.kodGosterilmesinmi) { part.kodGosterilmesin() }
			if (this.listedenSecilemezFlag) { part.listedenSecilemez() }
			editor.data('part', part); part.run();
			let {comboBox, widget} = part; setTimeout(() => {
				let {input} = widget || {};
				if (input?.length) {
					input.on('keyup', evt => {
						let key = (evt.key || '').toLowerCase();
						if (key == 'enter' || key == 'linefeed') {
							widget.close();
							let {gridPart} = colDef, gridWidget = gridPart?.gridWidget || gridPart?.gridPart?.gridWidget;
							if (gridWidget && gridWidget.editmode != 'selectedrow') { if (gridWidget.editcell) { setTimeout(() => gridWidget.endcelledit(false), 0) } }
						}
					})
				}
			}, 500)
		})
	}
	get initEditor() {
		return ((colDef, rowIndex, value, editor, cellText, pressedChar) => {
			let part = editor.data('part'), {jqxSelector} = part;
			if (part.input != editor) { part.input = editor; part.widget = editor[jqxSelector]('getInstance') }
			editor[jqxSelector]({ width: editor.width() });
			let {gridPart} = colDef, gridWidget = gridPart?.gridWidget ?? gridPart?.gridPart?.gridWidget;
			let gridRec = (gridWidget?.getboundrows ? gridWidget.getboundrows()[rowIndex] : null), source = this.getSource({ belirtec: colDef.belirtec, rec: gridRec });
			if (part) { part.source = source; part.dataBind() }
			let _value = value || ''; part.val(_value); part.input.val(_value);
			setTimeout(() => {
				editor[jqxSelector]('focus'); editor.select();
				let {gridPart} = colDef, gridWidget = gridPart?.gridWidget ?? gridPart?.gridPart?.gridWidget;
				if (!gridWidget || gridWidget.editmode != 'selectedrow') { part.focus() }
			}, 100)
		})
	}
	get getEditorValue() {
		return ((colDef, rowIndex, value, editor) => {
			let part = editor.data('part');
			return part /*&& part.kodGecerlimi*/ ? part.val() : editor.val()
		})
	}
	get cellValueChanging() {
		return ((colDef, rowIndex, dataField, columnType, oldValue, newValue) => {
			let {recAdiAttr, _cellValueChanging} = this;
			let {gridWidget} = colDef.gridPart;
			let rec = (rowIndex != null && rowIndex > -1) ? gridWidget.getboundrows()[rowIndex] : null;
			if (recAdiAttr && rec != null) {
				let kod = newValue;
				let adi = kod == null ? null : this.getKodIcinAdi({ kod: kod, rec: rec });
				if (adi != null)
					rec[recAdiAttr] = adi
			}
			if (_cellValueChanging)
				getFuncValue.call(this, _cellValueChanging, colDef, rowIndex, dataField, columnType, oldValue, newValue)
		})
	}
	get cellValueChanged() {
		return ((colDef, rowIndex, dataField, columnType, oldValue, newValue) => {
			let {_cellValueChanged} = this;
			if (_cellValueChanged)
				getFuncValue.call(this, _cellValueChanged, e)
		})
	}
	getKodIcinAdi(e) {
		let {kod, belirtec, rec} = e;
		return kod == null ? null : (this.getKADict({ belirtec: belirtec, rec: rec }) || {})[kod]?.aciklama
	}
	getSource(e) {
		e = e || {}
		let {rec, belirtec} = e;
		let result = this.source;
		if (rec) {
			let {_sourceYapi} = rec;
			let _source = _sourceYapi == null ? _sourceYapi : _sourceYapi[belirtec];
			if (_source !== undefined)
				result = _source
		}
		return result
	}
	setSource(e) {
		e = e || {}
		let {rec, belirtec, source} = e;
		let sourceSetFlag = false;
		if (rec) {
			let _sourceYapi = rec._sourceYapi = rec._sourceYapi || {};
			let {_kaDictYapi} = rec;
			if (_sourceYapi && belirtec) {
				_sourceYapi[belirtec] = source;
				sourceSetFlag = true
			}
			if (_kaDictYapi)
				belirtec ? delete _kaDictYapi[belirtec] : delete rec._kaDictYapi
		}
		if (!sourceSetFlag)
			this.source = source
		if (source) {
			// if ($.isFunction(source))
			// 	source = getFuncValue.call(this, source, e)
			if ($.isArray(source))
				this.kaDictYapiOlustur($.extend({}, e, { source: source }))
		}
		return this
	}
	resetSourceCache(e) {
		e = e || {};
		let sourceSetFlag = false;
		let {rec} = e;
		if (rec) {
			let _sourceYapi = rec._sourceYapi = rec._sourceYapi || {};
			let {_kaDictYapi} = rec;
			if (_kaDictYapi)
				belirtec ? delete _kaDictYapi[belirtec] : delete rec._kaDictYapi
		}
		return this
	}
	getKADict(e) {
		e = e || {};
		let {rec, belirtec} = e;
		let {_kaDictYapi} =  rec || {};
		let _kaDict = _kaDictYapi ? _kaDictYapi[belirtec] : null;
		return _kaDict || this.tekSecim?.kaDict
	}
	kaDictYapiOlustur(e) {
		let {belirtec, rec, source} = e;
		if (!(belirtec && rec))
			return
		let kaDictYapi = rec._kaDictYapi = rec._kaDictYapi || {};
		if (!source) {
			delete kaDictYapi[belirtec];
			return
		}
		let kaDict = kaDictYapi[belirtec] = {};
		let {kodAttr, adiAttr} = this;
		let _source = $.isArray(source) ? source : source ? Object.values(source) : _source;
		if (_source) {
			for (let ka of _source) {
				let kod = ka[kodAttr];
				let adi = kod == null ? null :ka[adiAttr];
				if (kod != null)
					kaDict[kod] = new CKodVeAdi({ kod: kod, aciklama: adi })
			}
		}
		return this
	}
	dropDown() { this.comboBoxmi = false; return this }
	comboBox() { this.comboBoxmi = true; return this }
}
class GridKolonTip_BirKismi extends GridKolonTip_TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get anaTip() { return 'tekSecim' } static get tip() { return 'birKismi' } static get birKismimi() { return true }
}
class GridKolonTip_Ozel extends GridKolonTip {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get anaTip() { return 'ozel' } static get ozelmi() { return true } static get isEditable() { return false }
	get cellClassName() { return 'ozel' } get defaultAlign() { return 'center' }
	readFrom(e) {
		if (!super.readFrom(e)) { return false } let {value} = e;
		try { if (value && typeof value == 'string') { let _value = getFunc.call(this, value, e); if (_value != null) { value = _value } } } catch (ex) { }
		this.value = value; return true
	}
	setValue(value) { this.value = value; return this }
}
class GridKolonTip_Button extends GridKolonTip_Ozel {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'button' } static get butonmu() { return true } static get buttonmu() { return this.butonmu } get jqxColumnType() { return 'button' }
	readFrom(e) {
		if (!super.readFrom(e)) { return false }
		this.click(null); let handler = e.click || e.onClick || e.buttonClick || e.onButtonClick; this.click(handler);
		return true
	}
	get cellsRenderer() {
		return ((colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
			if (rec?.totalsrow) { return GridKolonTip.getHTML_groupsTotalRow(value) }
			rec = colDef.gridPart.gridWidget.getboundrows()[rowIndex] ?? rec; rec = rec?.originalRecord || rec;
			let _value = this.value; if (_value && (isFunction(_value) || _value.run)) {
				let _e = { colDef, rowIndex, columnField, value, html, jqxCol, rec }; _value = getFuncValue.call(this, _value, _e) }
			return _value ?? value
		})
	}
	get cellClick() {
		return (e => {
			let {clickEvent} = this; if (!$.isEmptyObject(clickEvent)) {
				let {args} = e; let rec = args.row; rec = rec.bounddata || rec;
				let _e = { ...e, tip: this, gridWidget: args.owner, rec, uid: rec.uid }; for (let handler of clickEvent) { getFuncValue.call(this, handler, _e) }
			}
		})
	}
	onClick(handler) {
		if (handler === undefined) { return this }
		if (handler == null) { this.clickEvent = [] }
		else {
			let {clickEvent} = this; if (clickEvent == null) { this.clickEvent = clickEvent = [] }
			if (typeof handler == 'string') { let _value = getFunc.call(this, value, e); if (_value != null) { handler = _value } }
			if (handler) { clickEvent.push(handler) }
		}
		return this
	}
	click(handler) { return this.onClick(handler) }
}
class GridKolonTip_Image extends GridKolonTip_Button {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'image' } static get resimmi() { return true } static get imagemi() { return this.resimmi }
	static get butonmu() { return false } get jqxColumnType() { return 'image' }
	get cellsRenderer() {
		return ((colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
			if (rec?.totalsrow)
				return GridKolonTip.getHTML_groupsTotalRow(value)
			let {gridPart} = colDef ?? {}
			rec = gridPart.boundRecs?.[rowIndex] ?? rec
			rec = rec?.originalRecord ?? rec
			let {value: _value} = this
			if (_value && (isFunction(_value) || _value.run)) {
				let _e = { colDef, rowIndex, columnField, value, html, jqxCol, rec }
				_value = getFuncValue.call(this, _value, _e)
			}
			_value ??= value
			if (_value)
				html = `<div class="full-wh" style="
							background-repeat: no-repeat !important;
							background-position: center !important;
							background-size: contain !important;
							background-image: url(${_value})
				"></div>`
			return html
		})
	}
}
class GridKolonTip_Bool extends GridKolonTip_Ozel {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'bool' }
	get jqxColumnType() { return 'checkbox' } get jqxFilterType() { return 'checkedlist' }
	get createEditor_ozel() {
		return ((colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) => {
			let isCustomEditor = (colDef.columnType == 'custom' || colDef.columnType == 'template');
			if (isCustomEditor && !editor.hasClass('editor')) {
				let parent = editor; parent.addClass('full-wh');
				editor = $(`<input type="checkbox" class="editor" style="width: ${cellWidth}px; height: ${cellHeight - 5}px"/>`);
				editor.appendTo(parent)
			}
		})
	}
	get initEditor_ozel() {
		return ((colDef, rowIndex, value, editor, cellText, pressedChar) => {
			if (!(typeof value == 'boolean' || typeof value == 'number')) { value = this.value }
			value = !asBool(value);
			let isCustomEditor = (colDef.columnType == 'custom' || colDef.columnType == 'template');
			if (isCustomEditor) {
				let _editor = editor.children('.editor'); if (_editor.length) { editor = _editor }
				editor.attr('type', 'checkbox');
				editor.prop('checked', asBool(value)); /*editor.css('text-align', 'center'); editor.css('margin', '5px 0 0 5px'); editor.addClass('full-wh');*/
				setTimeout(() => editor.focus(), 50)
			}
		})
	}
	get getEditorValue() {
		return ((colDef, rowIndex, value, editor) => {
			let isCustomEditor = (colDef.columnType == 'custom' || colDef.columnType == 'template'); if (isCustomEditor) {
				let _editor = editor.children('.editor'); if (_editor.length) { editor = _editor }
												return editor.is(':checked')
			}
			return value
		})
	}
	get cellsRenderer() {
		return ((colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
			if (rec?.totalsrow) { return GridKolonTip.getHTML_groupsTotalRow(value) }
			rec = colDef?.gridPart?.gridWidget?.getboundrows()[rowIndex] ?? rec; rec = rec?.originalRecord ?? rec;
			if (!(typeof value == 'boolean' || typeof value == 'number')) value = this.value ?? asBool(value)
			if (!colDef.gridPart?.gridWidget?.editable || (!colDef.columnType || colDef.columnType == 'checkbox' || colDef.columnType == 'custom' || colDef.columnType == 'template')) {
				html = (
					`<div class="full-wh" style="` +
						`background-repeat: no-repeat; background-position: center;` +
						`background-size: 24px;` +
						`background-image: url(${webRoot}/images/tamam_blue.png);` +
						(value ? '' : `visibility: hidden;`) +
					`"></div>`
				)
			}
			return html
		})
	}
	get cellBeginEdit() {
		return ((colDef, rowIndex, belirtec, colType, value) => {
			let {gridWidget} = colDef.gridPart;
			if (!(gridWidget.editable && colDef.isEditable)) { return false }
			if ((colDef.columnType == 'checkbox' || colDef.columnType == 'custom' || colDef.columnType == 'template')) {
				gridWidget.setcellvalue(rowIndex, belirtec, !value);
				setTimeout(() => {
					gridWidget.beginupdate();
					gridWidget.endcelledit(rowIndex, belirtec, false);
					gridWidget.endupdate()
				}, 100);
				return false
			}
		})
	}
}


(function() {
	let subClasses = [
		GridKolonTip_String, GridKolonTip_Number, GridKolonTip_Decimal, GridKolonTip_Date, GridKolonTip_Time,
		GridKolonTip_TekSecim, GridKolonTip_BirKismi, GridKolonTip_Ozel, GridKolonTip_Button, GridKolonTip_Image, GridKolonTip_Bool
	];
	let tip2Sinif = GridKolonTip.prototype.constructor._tip2Sinif = {};
	for (let cls of subClasses) { let {tip} = cls; if (tip) tip2Sinif[tip] = cls }
})()

