class GridKolonTip extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static colEventNames = GridKolon.colEventNames; static globalEventNames = GridKolon.globalEventNames;
	static get anaTip() { return null } static get tip() { return this.anaTip } get anaTip() { return this.class.anaTip } get tip() { return this.class.tip }
	get defaultAlign() { return null } static get isEditable() { return null } get jqxColumnType() { return 'textbox' } get jqxCellsFormat() { return null }
	get jqxFilterType() { return 'input' } static get jqxFilterAnaTip() { return 'stringfilter' } get jqxFilterAnaTip() { return this.class.jqxFilterAnaTip }
	get jqxFilterCondition() { return 'CONTAINS' } get cellClassName() { return null }
	get cellsRenderer() { return null }
	get createFilterWidget() {
		return null
		/*return ((colDef,  jqxColumn, filterParent, elmFilter) => {
			if (elmFilter && elmFilter.length && elmFilter.hasClass('jqx-datetimeinput'))
				elmFilter.jqxDateTimeInput({ formatString: DateFormat })
		})*/
	}
	get createEditor() { return null }
	get initEditor() { return null }
	get getEditorValue() { return null }
	
	constructor(e) { super(e); e = e || {}; this.readFrom(e) }
	static getClass(e) { e = e || {}; const tip = typeof e == 'object' ? e.tip : e; return this._tip2Sinif[tip] || this; }
	static from(e) {
		if (!e) return null
		const cls = this.getClass(e); if (!cls) return null
		const result = new cls(e); return result.readFrom(e) ? result : null
	}
	readFrom(e) {
		if (!e) { return false }
		const isEditable = e.editable ?? e.isEditable; this.isEditable = isEditable ?? this.class.isEditable; this.maxLength = e.maxLength;
		const {colEventNames, globalEventNames} = this.class;
		for (const key of colEventNames) { const func = getFunc(e[key]); if (func) { this[key] = func } }
		for (const key of globalEventNames) { const func = getFunc(e[key]); if (func) { this[key] = func } }
		return true
	}
	static getHTML_groupsTotalRow(value) {
		if (typeof value == 'number') { value = numberToString(value) }
		const text = numberToString(asFloat(value.replace(':', '').replace('Sum', '').replace('Avg', '').replace('TOPLAM', '').replace('ORT', '')));
		return `<div class="bold royalblue right" style="border-top: 3px solid royalblue">${text}</div>`
	}
	static getHTML_totalRow(value) {
		if (typeof value == 'number') { value = numberToString(value) }
		return `<div class="bold forestgreen right" style="border-top: 3px solid forestgreen">${value}</div>`
	}
	jqxColumnDuzenle(e) {
		const {column} = e, colDef = e.colDef || {}, {genislikCh} = colDef;
		const {jqxColumnType, jqxFilterType, jqxFilterAnaTip, jqxFilterCondition, jqxCellsFormat, isEditable} = this;
		if (jqxColumnType) column.columnType = jqxColumnType
		if (jqxFilterAnaTip) column.filterComparasion = jqxFilterAnaTip
		if (jqxFilterType) column.filterType = jqxFilterType
				/*this.class.stringmi && (jqxFilterType == 'textbox' || jqxFilterType == 'input') && (genislikCh && genislikCh <= 25)
					? 'checkedlist'
					: jqxFilterType*/
		if (jqxFilterCondition) column.filterCondition = jqxFilterCondition
		if (jqxCellsFormat && !(jqxColumnType == 'template' || jqxColumnType == 'custom')) column.cellsFormat = jqxCellsFormat
		if (isEditable != null) column.editable = isEditable
	}
	get initEditor() {
		return ((colDef, rowIndex, value, editor, cellText, pressedChar) => {
			const isCustomEditor = (colDef.columnType == 'custom' || colDef.columnType == 'template'), {maxLength} = this;
			const _editor = editor.children('.editor'); editor = _editor.length ? _editor : editor;
			if (maxLength && isCustomEditor) { editor.prop('maxlength', maxLength) }
			if (_editor?.length && _editor.select) setTimeout(() => { editor.focus(); editor.select() }, 150)
		})
	}
	get validation() {
		return ((colDef, info, value) => {
			const {maxLength} = this;
			if (maxLength != null && value != null && (typeof value == 'string' || typeof value == 'number') && value.toString().length > maxLength)
				return ({ result: false, message: `Değer <b>${maxLength}</b> karakterden fazla olamaz` })
			return true
		})
	}
	setMaxLength(value) { this.maxLength = value; return this }
}
class GridKolonTip_String extends GridKolonTip {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get anaTip() { return 'string' } static get stringmi() { return true }
}
class GridKolonTip_Number extends GridKolonTip {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get anaTip() { return 'number' } static get mfbmi() { return true }
	get jqxColumnType() { return 'custom' } /* get jqxColumnType() { return 'numberinput' } */
	get defaultAlign() { return 'right' } get jqxCellsFormat() { return '' } get jqxFilterType() { return 'checkedlist' } static get jqxFilterAnaTip() { return 'numericfilter' }
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
				/* const tip = ( toplamYapi.avg ?? toplamYapi.ort ?? toplamYapi.ORT ?? toplamYapi.ortalama ?? toplamYapi.ORTALAMA ) != null ? 'avg' : 'sum';
				if (toplam && tip == 'avg') toplam = toplam */
				return GridKolonTip.getHTML_totalRow(numberToString(toplam))
			}
		})
	}
	get cellsRenderer() {
		return ((colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
			if (rec?.totalsrow) return GridKolonTip.getHTML_groupsTotalRow(value)
			rec = colDef.gridPart.gridWidget.getboundrows()[rowIndex] ?? rec; rec = rec?.originalRecord || rec;
			if (value?.constructor?.name == 'Number') value = asFloat(value)
			if (value != null) {
				/* if (typeof value != 'number') */ let newValue = asFloat(value);
				newValue = !value && this.sifirGostermeFlag ? '' : newValue.toString();
				if (value !== newValue) html = changeTagContent(html, newValue)
			}
			return html
		})
	}
	get createEditor() {
		return ((colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) => {
			const {maxLength} = this, isCustomEditor = (colDef.columnType == 'custom' || colDef.columnType == 'template');
			if (isCustomEditor && !editor.hasClass('editor')) {
				const parent = editor; parent.addClass('full-wh');
				parent.css('margin', 0); parent.css('padding', 0);
				editor = $(`<input type="number" class="editor" style="width: ${cellWidth}px; height: ${cellHeight}px"/>`); editor.appendTo(parent)
			}
			const rec = colDef.gridPart.gridWidget.getboundrows()[rowIndex], fra = this.getFra({ rec });
			if (value && fra && typeof value != 'string') value = roundToFra(value, fra)
			if (isCustomEditor) {
				editor.on('keydown', evt => {
					let handler = this.keyDownHandler;
					if (handler) { const {key} = evt; getFuncValue.call(this, handler, { sender: this, event: evt, key: key }) }
				});
				/*editor.on('keyup', evt => {
					const {key} = evt;
					if (key == '+' || key == '-') {
						editor.html(`<input type="textbox" class="editor formul" style="width: 100%; height: 100%;" value="${editor.val()}"></input>`);
						const input = editor; input.off('keyup'); input.focus(); input.select()
					}
				});*/
				editor.on('change', evt => { const target = evt.currentTarget; if (fra != null) { target.value = asFloat(target.value?.replaceAll(',', '.'), fra) } })
			}
			else {
				let input = editor.find('input');
				input.on('keydown', evt => { const {key} = evt; let handler = this.keyDownHandler; if (handler) getFuncValue.call(this, handler, { sender: this, event: evt, key }) });
				input.on('keyup', evt => {
					const {key} = evt;
					if (key == '+' || key == '-') {
						editor.html(`<input type="textbox" class="editor formul" style="width: 100%; height: 100%;" value="${editor.val()}"></input>`);
						const input = editor.find('input'); /* input.on('keyup', handler); */ input.off('keyup'); input.focus(); input.select()
					}
				})
			}
		})
	}
	get initEditor() {
		return ((colDef, rowIndex, value, editor, cellText, pressedChar) => {
			const {maxLength} = this, isCustomEditor = (colDef.columnType == 'custom' || colDef.columnType == 'template');
			const rec = colDef.gridPart.gridWidget.getboundrows()[rowIndex], fra = this.getFra({ rec });
			if (true || isCustomEditor) {
				const _editor = editor.children('.editor'); if (_editor.length) editor = _editor
				editor.prop('type', 'number'); editor.prop('value', value);
				if (maxLength != null) editor.prop('maxlength', maxLength)
				/*editor.css('text-align', 'right'); editor.css('margin-left', '10px');
				editor.attr('style', editor.attr('style') + `; width: calc(var(--full) - 10px) !important`); editor.addClass('full-height')*/
			}
			else { editor.jqxNumberInput({ digits: 17, decimalDigits: fra || 0 }) }
			setTimeout(() => { let input = editor.find('input'); if (!input?.length) { input = editor }; input.focus(); input.select() }, 150)
		})
	}
	get getEditorValue() {
		return ((colDef, rowIndex, value, editor) => {
			const isCustomEditor = (colDef.columnType == 'custom' || colDef.columnType == 'template');
			if (true || isCustomEditor) { const _editor = editor.children('.editor'); if (_editor.length) editor = _editor }
			const input = editor.hasClass('formul') ? editor : editor.find('input.formul');
			value = (input?.length) ? asFloat(eval(input.val().replaceAll(',', '.'))) : asFloat(editor.val());
			if (value?.constructor?.name == 'Number') value = asFloat(value)
			const rec = colDef.gridPart.gridWidget.getboundrows()[rowIndex], fra = this.getFra({ rec });
			if (fra != null) value = roundToFra(value, fra)
			return value
		})
	}
	getFra(e) {
		let {fra} = this; if (fra == null || typeof fra == 'number') return fra	
		e = e || {}; const {rec} = e; if (!rec) return null
		const {brmDict} = app.params?.stokBirim || {}; if (!brmDict) return null
		const brm = (typeof fra == 'string' ? rec[fra] : getFuncValue.call(this, fra, e)) ?? null;
		return brm == null ? null : (brmDict[brm]?.fra ?? null)
	}
	sifirGoster() { this.sifirGostermeFlag = false; return this }
	sifirGosterme() { this.sifirGostermeFlag = true; return this }
	onKeyDown(handler) { this.keyDownHandler = handler; return this }
}

class GridKolonTip_Decimal extends GridKolonTip_Number {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'decimal' } /*get jqxColumnType() { return 'numberinput' }*/ get jqxCellsFormat() { return '' }
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
			if (rec?.totalsrow) return GridKolonTip.getHTML_groupsTotalRow(value)
			rec = colDef.gridPart.gridWidget.getboundrows()[rowIndex] ?? rec; rec = rec?.originalRecord || rec;
			if (rec) { value = rec[columnField] }; const fra = this.getFra({ rec });
			if (value != null) {
				if (typeof value != 'number') value = asFloat(value)
				value = !value && this.sifirGostermeFlag ? '' : (fra == null ? value.toLocaleString() : toStringWithFra(value, fra));
				html = changeTagContent(html, value)
			}
			return html
		})
	}
	fraFiyat() { const fra = app.params.zorunlu?.fiyatFra; this.fra = fra == null ? 6 : fra; return this }
	fraDvFiyat() { const fra = app.params.zorunlu?.dvFiyatFra; this.fra = fra == null ? 2 : fra; return this }
	fraBedel() { const fra = app.params.zorunlu?.bedelFra; this.fra = fra == null ? 2 : fra; return this }
	fraDvBedel() { const fra = app.params.zorunlu?.dvBedelFra; this.fra = fra == null ? 2 : fra; return this }
}

class GridKolonTip_Date extends GridKolonTip {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get anaTip() { return 'date' } /* get jqxColumnType() { return 'date' } */ get jqxColumnType() { return 'custom' } get jqxFilterType() { return 'checkedlist' }
	static get jqxFilterAnaTip() { return 'datefilter' } get jqxFilterCondition() { return 'CONTAINS' }
	/* get jqxCellsFormat() { return DateFormat } */ get jqxCellsFormat() { return '' }

	get cellsRenderer() {
		const buYil = today().getFullYear();
		return ((colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
			if (value != null) {
				if (rec?.totalsrow) return GridKolonTip.getHTML_groupsTotalRow(value)
				rec = colDef.gridPart.gridWidget.getboundrows()[rowIndex] ?? rec; rec = rec?.originalRecord || rec;
				const _value = value; value = typeof value == 'number' || value?.constructor?.name == 'Number' ? new Date(asFloat(value)) : asDate(value);
				if (value && value.getFullYear) value = (value.getFullYear() == buYil ? dateKisaString(value) : dateToString(value))
				if (value != _value) html = changeTagContent(html, value)
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
			const isCustomEditor = (colDef.columnType == 'custom' || colDef.columnType == 'template');
			let editor = parent.children('.editor');
			if (!editor.length) {
				editor = $(`<input type="textbox" class="editor full-wh" style="margin: 0; padding: 0"></input>`);
				editor.appendTo(parent);
				const part = new TarihUIPart({ layout: editor });
				editor.data('part', part);
				//part.degisince(e =>
				//	editor.val(dateToString(e.value)));
				part.run()
			}
		})
	}
	get initEditor() {
		return ((colDef, rowIndex, value, parent, cellText, pressedChar) => {
			let editor = parent.children('.editor');
			if (editor.length) {
				value = typeof value == 'number' || value?.constructor?.name == 'Number' ? new Date(asFloat(value)) : asDate(value);
				const isCustomEditor = (colDef.columnType == 'custom' || colDef.columnType == 'template');
				const rec = colDef.gridPart.gridWidget.getboundrows()[rowIndex];
				const part = editor.data('part');
				part.val(value || '');
				
				const {gridPart} = colDef;
				const gridWidget = gridPart?.gridWidget || gridPart?.gridPart?.gridWidget;
				if (!gridWidget || gridWidget.editmode != 'selectedrow')
					setTimeout(() => part.focus(), 100)
			}
		})
	}
	get getEditorValue() {
		return ((colDef, rowIndex, value, parent) => {
			let editor = parent.children('.editor');
			if (editor.length) {
				const isCustomEditor = (colDef.columnType == 'custom' || colDef.columnType == 'template');
				const part = editor.data('part');
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
				rec = colDef.gridPart.gridWidget.getboundrows()[rowIndex] ?? rec; rec = rec?.originalRecord ?? rec;
				const _value = value; value = asDate(value);
				html = isInvalidDate(value) ? null : timeToString(asDate(value), this.noSecsFlag)
			}
			return html
		})
	}
}
class GridKolonTip_TekSecim extends GridKolonTip {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get anaTip() { return 'tekSecim' }
	static get tekSecimmi() { return true }
	static get birKismimi() { return false }
	get jqxColumnType() { return 'custom' }
	get jqxFilterType() { return 'checkedlist' }
	get source() { return this._source }
	set source(value) { this._source = value }
	get kaListe() { return this.tekSecim?.kaListe }
	get defaultChar() { return this.tekSecim?.char }
	// get kaDictUyarlanmis() { return this._kaDict || this.tekSecim?.kaDict }

	readFrom(e) {
		if (!e) return false; let {tekSecim, tekSecimSinif, kaListe} = e;
		if (typeof tekSecimSinif == 'string') { tekSecimSinif = getFunc.call(this, tekSecimSinif, e); }
		if (!tekSecim && tekSecimSinif) { tekSecim = new tekSecimSinif() }
		if (tekSecim) {
			if (typeof tekSecim == 'string') { tekSecim = getFunc.call(this, tekSecim, e) }
			if (tekSecim) { tekSecim = getFuncValue.call(this, tekSecim, e) }
			if ($.isPlainObject(tekSecim)) { tekSecim = tekSecimSinif ? new tekSecimSinif(tekSecim) : null }
		}
		if (!tekSecim) tekSecim = new TekSecim();
		if (kaListe) {
			if (typeof kaListe == 'string') { kaListe = getFunc.call(this, kaListe, e) }
			if (kaListe) { kaListe = getFuncValue.call(this, kaListe, e) }
			if (kaListe) { tekSecim.kaListe = kaListe }
		}
		const {defaultValue} = e; if (defaultValue != null) { tekSecim.defaultChar = defaultValue }
		let {value} = e; if (value != null) tekSecim.char = value;
		this.tekSecim = tekSecim; this.source = e.source || (() => this.kaListe); this.comboBoxmi = e.comboBoxmi ?? e.comboBox;
		this.kodGosterilmesinmi = e.kodGosterilmesin ?? e.kodGosterilmesinmi ?? e.kodsuzmu ?? e.kodsuz;
		this.kodAttr = e.kodAttr || 'kod'; this.adiAttr = e.adiAttr || 'aciklama'; this.recKodAttr = e.recKodAttr; this.recAdiAttr = e.recAdiAttr;
		this._cellValueChanging = e.cellValueChanging; this._cellValueChanged = e.cellValueChanged;
		return true
	}
	get cellsRenderer() {
		return ((colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
			if (rec?.totalsrow) return GridKolonTip.getHTML_groupsTotalRow(value)
			rec = colDef.gridPart.gridWidget.getboundrows()[rowIndex] ?? rec; rec = rec?.originalRecord || rec;
			if (value != null) {
				const kaDict = this.getKADict({ belirtec: columnField, rec: rec }) || {};
				let ka = value.aciklama == null ? kaDict[value] : Object.values(kaDict).find(ka => ka.aciklama == value);
				if (ka) value = ka.aciklama ?? value
				value = value == null || value.aciklama == null ? (value || '').toString() : (this.kodGosterilmesinmi ? value.aciklama ?? value : value.toString());
				html = changeTagContent(html, value)
			}
			return html
		})
	}
	get createEditor() {
		return ((colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) => {
			const {comboBoxmi, kodAttr, adiAttr} = this;
			const part = new ModelKullanPart({
				parentPart: app.activePart, layout: editor, sender: colDef,
				coklumu: this.class.birKismimi, autoBind: true, value: value,
				/*selectionRendererBlock: e => {
					if (!e.coklumu)
						return e.wItem.label || '';
				},*/
				argsDuzenle: e => {
					$.extend(e.args, {
						autoOpen: false, itemHeight: 30, width: cellWidth, height: cellHeight,
						dropDownWidth: cellWidth * 2, dropDownHeight: 200, autoDropDownHeight: false
						/*renderSelectedItem: (index, rec) => {
							rec = rec.originalItem || rec || {};
							return rec.kod || ''
						}*/
					})
				},
				veriYuklenince: e => {
					const {gridWidget} = colDef.gridPart;
					const gridRec = gridWidget.getboundrows()[rowIndex];
					const recs = e.recs ?? e.source;
					if (recs)
						this.kaDictYapiOlustur({ belirtec: colDef.belirtec, rec: gridRec, source: recs })
				}
			})[comboBoxmi ? 'comboBox' : 'dropDown']().noMF()/*.kodGosterilmesin()*/;
			if (this.kodGosterilmesinmi)
				part.kodGosterilmesin()
			editor.data('part', part);
			part.run();
			
			const {comboBox, widget} = part;
			setTimeout(() => {
				const {input} = widget || {};
				if (input && input.length) {
					input.on('keyup', evt => {
						const key = (evt.key || '').toLowerCase();
						if (key == 'enter' || key == 'linefeed') {
							widget.close();
							const {gridPart} = colDef, gridWidget = gridPart?.gridWidget || gridPart?.gridPart?.gridWidget;
							if (gridWidget && gridWidget.editmode != 'selectedrow') { if (gridWidget.editcell) setTimeout(() => gridWidget.endcelledit(), 0, false) }
						}
					})
				}
			}, 500)
		})
	}
	get initEditor() {
		return ((colDef, rowIndex, value, editor, cellText, pressedChar) => {
			const part = editor.data('part');
			const {jqxSelector} = part;
			if (part.input != editor) {
				part.input = editor;
				part.widget = editor[jqxSelector]('getInstance');
			}
			editor[jqxSelector]({ width: editor.width() });

			let gridRec = colDef.gridPart.gridWidget.getboundrows()[rowIndex];
			let source = this.getSource({ belirtec: colDef.belirtec, rec: gridRec });
			if (part) {
				part.source = source;
				part.dataBind()
			}
			
			// part.kodAtandimi = false;
			const _value = value || '';
			part.val(_value);
			part.input.val(_value);
			setTimeout(() => {
				editor[jqxSelector]('focus'); editor.select();
				const {gridPart} = colDef, gridWidget = gridPart?.gridWidget || gridPart?.gridPart?.gridWidget;
				if (!gridWidget || gridWidget.editmode != 'selectedrow') {
					/*if (!part.widget.isOpened()) part.widget.open()*/
					part.focus()
				}
			}, 100)
		})
	}
	get getEditorValue() {
		return ((colDef, rowIndex, value, editor) => {
			const part = editor.data('part');
			return part /*&& part.kodGecerlimi*/ ? part.val() : editor.val()
		})
	}
	get cellValueChanging() {
		return ((colDef, rowIndex, dataField, columnType, oldValue, newValue) => {
			const {recAdiAttr, _cellValueChanging} = this;
			const {gridWidget} = colDef.gridPart;
			const rec = (rowIndex != null && rowIndex > -1) ? gridWidget.getboundrows()[rowIndex] : null;
			if (recAdiAttr && rec != null) {
				const kod = newValue;
				const adi = kod == null ? null : this.getKodIcinAdi({ kod: kod, rec: rec });
				if (adi != null)
					rec[recAdiAttr] = adi
			}
			if (_cellValueChanging)
				getFuncValue.call(this, _cellValueChanging, colDef, rowIndex, dataField, columnType, oldValue, newValue)
		})
	}
	get cellValueChanged() {
		return ((colDef, rowIndex, dataField, columnType, oldValue, newValue) => {
			const {_cellValueChanged} = this;
			if (_cellValueChanged)
				getFuncValue.call(this, _cellValueChanged, e)
		})
	}
	getKodIcinAdi(e) {
		const {kod, belirtec, rec} = e;
		return kod == null ? null : (this.getKADict({ belirtec: belirtec, rec: rec }) || {})[kod]?.aciklama
	}

	getSource(e) {
		e = e || {}
		const {rec, belirtec} = e;
		let result = this.source;
		if (rec) {
			const {_sourceYapi} = rec;
			let _source = _sourceYapi == null ? _sourceYapi : _sourceYapi[belirtec];
			if (_source !== undefined)
				result = _source
		}
		return result
	}
	setSource(e) {
		e = e || {}
		const {rec, belirtec, source} = e;
		let sourceSetFlag = false;
		if (rec) {
			let _sourceYapi = rec._sourceYapi = rec._sourceYapi || {};
			const {_kaDictYapi} = rec;
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
		const {rec} = e;
		if (rec) {
			let _sourceYapi = rec._sourceYapi = rec._sourceYapi || {};
			const {_kaDictYapi} = rec;
			if (_kaDictYapi)
				belirtec ? delete _kaDictYapi[belirtec] : delete rec._kaDictYapi
		}
		return this
	}
	getKADict(e) {
		e = e || {};
		const {rec, belirtec} = e;
		const {_kaDictYapi} =  rec || {};
		let _kaDict = _kaDictYapi ? _kaDictYapi[belirtec] : null;
		return _kaDict || this.tekSecim?.kaDict
	}
	kaDictYapiOlustur(e) {
		const {belirtec, rec, source} = e;
		if (!(belirtec && rec))
			return
		let kaDictYapi = rec._kaDictYapi = rec._kaDictYapi || {};
		if (!source) {
			delete kaDictYapi[belirtec];
			return
		}
		let kaDict = kaDictYapi[belirtec] = {};
		const {kodAttr, adiAttr} = this;
		let _source = $.isArray(source) ? source : source ? Object.values(source) : _source;
		if (_source) {
			for (const ka of _source) {
				let kod = ka[kodAttr];
				let adi = kod == null ? null :ka[adiAttr];
				if (kod != null)
					kaDict[kod] = new CKodVeAdi({ kod: kod, aciklama: adi })
			}
		}
		return this
	}

	kodsuz() { return this.kodGosterilmesin() }
	kodGosterilmesin() { this.kodGosterilmesinmi = true; return this }
	kodGosterilsin() { this.kodGosterilmesinmi = false; return this }
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
		if (!super.readFrom(e)) return false; let {value} = e;
		try { if (value && typeof value == 'string') { const _value = getFunc.call(this, value, e); if (_value != null) value = _value } } catch (ex) { }
		this.value = value; return true
	}
}
class GridKolonTip_Button extends GridKolonTip_Ozel {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'button' } static get butonmu() { return true } static get buttonmu() { return this.butonmu } get jqxColumnType() { return 'button' }
	readFrom(e) {
		if (!super.readFrom(e)) return false
		this.click(null); let handler = e.click || e.onClick || e.buttonClick || e.onButtonClick; this.click(handler);
		return true
	}
	get cellsRenderer() {
		return ((colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
			if (rec?.totalsrow) return GridKolonTip.getHTML_groupsTotalRow(value)
			rec = colDef.gridPart.gridWidget.getboundrows()[rowIndex] ?? rec; rec = rec?.originalRecord || rec;
			let _value = this.value; if (_value && ($.isFunction(_value) || _value.run)) { const _e = { colDef, rowIndex, columnField, value, html, jqxCol, rec }; _value = getFuncValue.call(this, _value, _e) }
			return _value ?? value
		})
	}
	get cellClick() {
		return (e => {
			const {clickEvent} = this;
			if (!$.isEmptyObject(clickEvent)) {
				const {args} = e; let rec = args.row; rec = rec.bounddata || rec;
				const _e = $.extend({}, e, { tip: this, gridWidget: args.owner, rec, uid: rec.uid });
				for (const handler of clickEvent) getFuncValue.call(this, handler, _e)
			}
		})
	}
	click(handler) {
		if (handler !== undefined) {
			if (handler == null) this.clickEvent = []
			else {
				let {clickEvent} = this; if (clickEvent == null) this.clickEvent = clickEvent = []
				if (typeof handler == 'string') { const _value = getFunc.call(this, value, e); if (_value != null) handler = _value; }
				if (handler) clickEvent.push(handler)
			}
		}
		return this
	}
}
class GridKolonTip_Image extends GridKolonTip_Ozel {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'image' } static get resimmi() { return true } static get imagemi() { return this.resimmi } get jqxColumnType() { return 'image' }
	get cellsRenderer() {
		return ((colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
			if (rec?.totalsrow) return GridKolonTip.getHTML_groupsTotalRow(value)
			rec = colDef.gridPart.gridWidget.getboundrows()[rowIndex] ?? rec; rec = rec?.originalRecord || rec;
			if (_value && ($.isFunction(_value) || _value.run)) { const _e = { colDef, rowIndex, columnField, value, html, jqxCol, rec }; _value = getFuncValue.call(this, _value, _e); }
			if (_value) {
				html = (
					`<div style="` +
						`background-repeat: no-repeat; background-position: center; ` +
						`background-size: auto; ` +
						`background-image: ${_value}`
					`"></div>`
				)
			}
			return html
		})
	}
}

class GridKolonTip_Bool extends GridKolonTip_Ozel {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'bool' }
	get jqxColumnType() { return 'checkbox' } get jqxFilterType() { return 'checkedlist' }
	get createEditor_ozel() {
		return ((colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) => {
			const isCustomEditor = (colDef.columnType == 'custom' || colDef.columnType == 'template');
			if (isCustomEditor && !editor.hasClass('editor')) {
				const parent = editor;
				parent.addClass('full-wh');
				editor = $(`<input type="checkbox" class="editor" style="width: ${cellWidth}px; height: ${cellHeight - 5}px"/>`);
				editor.appendTo(parent)
			}
		})
	}
	get initEditor_ozel() {
		return ((colDef, rowIndex, value, editor, cellText, pressedChar) => {
			if (!(typeof value == 'boolean' || typeof value == 'number'))
				value = this.value
			value = !asBool(value);
			const isCustomEditor = (colDef.columnType == 'custom' || colDef.columnType == 'template');
			if (isCustomEditor) {
				const _editor = editor.children('.editor');
				if (_editor.length)
					editor = _editor
				editor.attr('type', 'checkbox');
				editor.prop('checked', asBool(value));
				/*editor.css('text-align', 'center');
				editor.css('margin', '5px 0 0 5px');
				editor.addClass('full-wh');*/
				setTimeout(() => editor.focus(), 50)
			}
		})
	}
	get getEditorValue() {
		return ((colDef, rowIndex, value, editor) => {
			const isCustomEditor = (colDef.columnType == 'custom' || colDef.columnType == 'template');
			if (isCustomEditor) {
				const _editor = editor.children('.editor');
				if (_editor.length)
					editor = _editor
				return editor.is(':checked')
			}
			return value
		})
	}
	get cellsRenderer() {
		return ((colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
			if (rec?.totalsrow) return GridKolonTip.getHTML_groupsTotalRow(value)
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
			const {gridWidget} = colDef.gridPart;
			if (!(gridWidget.editable && colDef.isEditable)) return false
			if ((colDef.columnType == 'checkbox' || colDef.columnType == 'custom' || colDef.columnType == 'template')) {
				gridWidget.setcellvalue(rowIndex, belirtec, !value);
				setTimeout(() => gridWidget.endcelledit(rowIndex, belirtec, false), 0);
				return false
			}
		})
	}
}


(function() {
	const subClasses = [
		GridKolonTip_String, GridKolonTip_Number, GridKolonTip_Decimal, GridKolonTip_Date, GridKolonTip_Time,
		GridKolonTip_TekSecim, GridKolonTip_BirKismi, GridKolonTip_Ozel, GridKolonTip_Button, GridKolonTip_Image, GridKolonTip_Bool
	];
	const tip2Sinif = GridKolonTip.prototype.constructor._tip2Sinif = {};
	for (const cls of subClasses) { const {tip} = cls; if (tip) tip2Sinif[tip] = cls }
})()

