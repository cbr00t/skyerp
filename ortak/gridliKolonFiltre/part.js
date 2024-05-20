class GridliKolonFiltrePart extends GridliGirisWindowPart {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get partName() { return 'gridliKolonFiltre' }
	/* static get isWindowPart() { return true } */ get wndDefaultIsModal() { return true }
	get recsUyarlanmis() { return this.recs.filter(rec => !!(rec.attr && (rec.operator == 'EMPTY' || rec.operator == 'NOT_EMPTY' || rec.value))) }
	get filtreText() { return this.class.getFiltreText(this.recsUyarlanmis) }

	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, { sender: e.sender, parentPart: e.parentPart || app.activeWndPart, duzenleyici: e.duzenleyici || {}, tamamIslemi: e.tamamIslemi });
		const {duzenleyici} = this, filtreBilgi = this.filtreBilgi = duzenleyici._filtreBilgi = duzenleyici._filtreBilgi || {};
		filtreBilgi.recs = filtreBilgi.recs || [];
		this.title = e.title == null ? 'Kolon Filtresi' : e.title || '';
	}
	static getFiltreText(e) {
		if ($.isArray(e) || typeof e != 'object') e = { recs: e }; const {recs} = e;
		const operator_kaDict = GridliKolonFiltre_OperatorTekSecim.instance.kaDict; let result = [];
		for (const rec of recs) {
			let {attr, operator, value} = rec;
			operator = operator_kaDict[operator]?.aciklama ?? operator?.kod ?? operator; value = value || '';
			if (value?.kod != null) value = value.aciklama || value.kod; value = value?.toString();
			result.push(
				`<div class="gridliKolonFiltre filtre-item">` +
					`<span class="attr">${attr}</span><span class="operator">${operator}</span><span class="value">${value}</span>` +
				`</div>`
			)
		}
		return result.length ? result.join(' ') : ''
	}
	initWndArgsDuzenle(e) { super.initWndArgsDuzenle(e); const {wndArgs} = this; $.extend(wndArgs, { position: 'center', width: 630, height: 350 }) }
	islemTuslariDuzenle(e) {
		super.islemTuslariDuzenle(e); const {liste} = e;
		liste.unshift({ id: 'temizle', handler: e => this.temizle(e) });
		for (const item of liste) { const {id} = item; switch (id) { case 'tamam': item.handler = e => this.tamamIstendi(e); break } }
	}
	gridArgsDuzenle(e) { super.gridArgsDuzenle(e); $.extend(e.args, { rowsHeight: 40, selectionMode: 'singlerow', editMode: 'click' }) }
	get defaultTabloKolonlari() {
		return $.merge(super.defaultTabloKolonlari || [], [
			new GridKolon({
				belirtec: 'attr', text: 'Saha', genislikCh: 23, cellClassName: 'attr',
				cellValueChanged: e => {
					const {args} = e, gridWidget = args.owner, attr = args.newvalue;
					const attrKAListe = getFuncValue.call(this, this.duzenleyici.attrKAListe) || []; const ka = attrKAListe.find(ka => ka.kod == attr), {tip} = ka?.ekBilgi || {};
					const rowIndex = args.rowindex, rec = gridWidget.getrowdata(rowIndex); if (rec) rec.tip = tip
					setTimeout(() => { gridWidget.setcellvalue(rowIndex, 'operator', tip == 'string' ? 'CONTAINS' : 'GREATER_THAN_OR_EQUAL') }, 5); /* gridWidget.refresh() */
				}
			}).tipTekSecim({ kaListe: e => getFuncValue.call(this, this.duzenleyici.attrKAListe, e) || [] }).kodsuz(),
			new GridKolon({ belirtec: 'operator', text: ' ', genislikCh: 18, cellClassName: 'operator' }).alignCenter()
				.tipTekSecim({ tekSecimSinif: GridliKolonFiltre_OperatorTekSecim }).kodsuz(),
			new GridKolon({
				belirtec: 'value', text: 'Değer', columnType: 'custom',
				cellClassName: (sender, rowIndex, dataField, value, rec) => {
					const {attr, operator} = rec || {}, attrKAListe = getFuncValue.call(this, this.duzenleyici.attrKAListe) || [];
					const ka = attrKAListe.find(ka => ka.kod == attr), {tip} = ka?.ekBilgi || {}; let result = dataField;
					result += ' left'; /* + (tip == 'number' ? 'right' : 'left');*/
					if (!operator || (operator == 'EMPTY' || operator == 'NOT_EMPTY')) result += ' grid-readOnly'
					return result
				},
				cellsRenderer: (colDef, rowIndex, dataField, value, html, jqxCol, rec) => {
					if (typeof value == 'object' && value.kod != null) html = changeTagContent(html, value.aciklama || value.kod);
					return html
				},
				cellBeginEdit: (colDef, rowIndex, belirtec, colType, value) => {
					const {gridWidget} = colDef.gridPart, rec = gridWidget.getrowdata(rowIndex) || {}, {operator} = rec
					return operator && !(operator == 'EMPTY' || operator == 'NOT_EMPTY')
				},
				/*createEditor: (colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) => {
					const {gridWidget} = colDef.gridPart, attr = gridWidget.getcellvalue(rowIndex, 'attr');
					const attrKAListe = getFuncValue.call(this, this.duzenleyici.attrKAListe) || [], ka = attrKAListe.find(ka => ka.kod == attr); const {tip} = ka?.ekBilgi || {}
				},*/
				initEditor: (colDef, rowIndex, value, parent, cellText, pressedChar) => {
					const {gridWidget} = colDef.gridPart, attr = gridWidget.getcellvalue(rowIndex, 'attr');
					const attrKAListe = getFuncValue.call(this, this.duzenleyici.attrKAListe) || [], ka = attrKAListe.find(ka => ka.kod == attr);
					const {tip} = ka?.ekBilgi || {}; parent.attr('data-tip', tip);
					parent.children().remove(); const tagName = tip == 'tekSecim' ? 'div' : 'input';
					$(`<${tagName} class="editor" style="width: 100%; height: 100%;"/>`).appendTo(parent)
					const editor = parent.children('.editor'); /* editor.attr('data-tip', tip); */ editor.on('focus', evt => evt.target.select())
					switch (tip) {
						case 'number': editor.attr('type', 'number'); editor.css('text-align', 'left' /* 'right' */); if (value) editor.val(asFloat(value)); break
						case 'date': editor.attr('type', 'date'); editor.css('text-align', 'left'); if (value) editor.val(asReverseDateString(asDate(value))); break
						case 'tekSecim':
							editor.css('text-align', 'left'); editor.jqxDropDownList({
								theme, width: '100%', height: '100%', displayMember: 'aciklama', valueMember: 'kod', autoDropDownHeight: false, dropDownHeight: 330, itemHeight: 35,
								filterable: true, filterHeight: 40, filterPlaceHolder: 'Seçiniz:', searchMode: 'containsignorecase',
								source: getFuncValue.call(this, ka?.ekBilgi?.kaListe || [])
								/* source: new $.jqx.dataAdapter({ type: 'array', localdata: getFuncValue.call(this, ka?.ekBilgi?.kaListe || []) }, { autoBind: true }) */
							});
							if (value) editor.val(typeof value == 'object' ? value.kod : value);
							break
						default: editor.attr('type', 'textbox'); editor.css('text-align', 'left'); editor.data('part', null); break
					}
					editor.val(value); setTimeout(() => editor.focus(), 10)
				},
				getEditorValue: (colDef, rowIndex, value, editor) => {
					const tip = editor.attr('data-tip'); editor = editor.children('.editor'); value = editor.val();
					if (tip == 'number') return asFloat(value);
					else if (value && tip == 'date') return asDateAndToString(value);
					else if (tip == 'tekSecim') {
						setTimeout(() => { const {gridWidget} = colDef.gridPart; gridWidget.addrow(); gridWidget.deleterow('last'); }, 10);
						value = editor.jqxDropDownList('getSelectedItem')?.originalItem; if (value) delete value.editor
					}
					return value
				}
			})
		])
	}
	defaultLoadServerData(e) {
		const {filtreBilgi} = this, recs = $.extend(true, [], filtreBilgi.recs || []) || [], attrKAListe = getFuncValue.call(this, this.duzenleyici.attrKAListe) || [];
		const ignoreAttrSet = asSet(['']), sahaSet = {}; for (const rec of recs) { sahaSet[rec.attr] = true }
		for (const {kod, ekBilgi} of attrKAListe) { if (!(ignoreAttrSet[kod] || sahaSet[kod])) recs.push(this.newRec({ args: $.extend({ attr: kod }, ekBilgi) })) }
		for (let i = 0; i < 5; i++) { recs.push(this.newRec()); return recs }
	}
	newRec(e) {
		e = e || {}; e.sinif = e.sinif ?? GridKolonFiltreRec; const rec = super.newRec(e);
		if (rec && rec.operator == null) { rec.operator = GridliKolonFiltre_OperatorTekSecim.instance.class.defaultChar }
		return rec
	}
	temizle(e) { const {filtreBilgi} = this; filtreBilgi.recs = []; this.tazele() /*const {gridWidget} = this; gridWidget.clear(); gridWidget.addrow(null, this.newRec(), 'last')*/ }
	tamamIstendi(e) {
		const {tamamIslemi} = this; if (tamamIslemi) {
			const recs = this.recsUyarlanmis, sender = this, {filtreText} = this;
			if (getFuncValue.call(this, tamamIslemi, { sender, recs, filtreText }) !== false) { this.close() }
		}
	}
	onResize(e) { /* ignore super */ }
}
class GridliKolonFiltre_OperatorTekSecim extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'CONTAINS' }
	kaListeDuzenle(e) {
		/* [ "EMPTY", "NOT_EMPTY", "CONTAINS", "CONTAINS_CASE_SENSITIVE", "DOES_NOT_CONTAIN", "DOES_NOT_CONTAIN_CASE_SENSITIVE", "STARTS_WITH", "STARTS_WITH_CASE_SENSITIVE",
			 "ENDS_WITH", "ENDS_WITH_CASE_SENSITIVE", "EQUAL", "EQUAL_CASE_SENSITIVE", "NULL", "NOT_NULL" ] */
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['CONTAINS', 'gibi']),
			new CKodVeAdi(['DOES_NOT_CONTAIN', 'gibi OLMAYAN']),
			new CKodVeAdi(['EQUAL', '=']),
			new CKodVeAdi(['NOT_EQUAL', '<>']),
			new CKodVeAdi(['STARTS_WITH', '... ile başlayan']),
			new CKodVeAdi(['ENDS_WITH', '... ile biten']),
			new CKodVeAdi(['LESS_THAN_OR_EQUAL', '&lt;=']),
			new CKodVeAdi(['LESS_THAN', '&lt;']),
			new CKodVeAdi(['GREATER_THAN_OR_EQUAL', '&gt;=']),
			new CKodVeAdi(['GREATER_THAN', '&gt;']),
			new CKodVeAdi(['EMPTY', 'BOŞ DEĞER olan']),
			new CKodVeAdi(['NOT_EMPTY', 'BOŞ DEĞER OLMAYAN'])
		)
	}
	static getGridFilter(e) {
		let operator = e.operator ?? e.condition; if (operator && operator.kod) operator = operator.kod; if (!operator) return null;
		const {type, value} = e, attr = e.attr ?? e.sql ?? e.field;
		return { type: type || GridKolonTip_String.jqxFilterAnaTip, field: attr, condition: operator, value }
	}
	getGridFilter(e) { const {char} = this; return this.class.getGridFilter($.extend({}, e, { operator: char })) }
	static uygunmu(e) {
		const filterObj = this.getGridFilter(e); if (filterObj == null) return true
		const attr = filterObj.field, {type, value} = filterObj, operator = filterObj.condition, {target} = e;
		const isStringFilter = type == 'stringfilter', getLowercased = _value => isStringFilter ? (_value || '').toLowerCase() : _value;
		let result = true;
		switch (operator) {
			case 'EQUAL': result = (target == value); break
			case 'NOT_EQUAL': result = (target != value); break
			case 'CONTAINS': case 'CONTAINS_CASE_SENSITIVE': result = ( target.includes(value) || (getLowercased(target).includes(getLowercased(value))) ); break
			case 'NOT_CONTAINS': case 'NOT_CONTAINS_CASE_SENSITIVE':
				case 'DOES_NOT_CONTAIN': case 'DOES_NOT_CONTAIN_CASE_SENSITIVE': result = !( target.includes(value) || (getLowercased(target).includes(getLowercased(value))) ); break
			case 'STARTS_WITH': case 'STARTS_WITH_CASE_SENSITIVE': result = ( target.startsWith(value) || getLowercased(target).startsWith(getLowercased(value)) ); break
			case 'ENDS_WITH': case 'ENDS_WITH_CASE_SENSITIVE': result = ( target.endsWith(value) || getLowercased(target).endsWith(getLowercased(value)) ); break
			case 'LESS_THAN_OR_EQUAL': result = (target <= value); break
			case 'LESS_THAN': result = (target < value); break
			case 'GREATER_THAN_OR_EQUAL': result = (target >= value); break
			case 'GREATER_THAN': result = (target > value); break
			case 'EMPTY': result = !target; break
			case 'NOT_EMPTY': result = !!target; break
		}
		return result
	}
	uygunmu(e) { const {char} = this; return this.class.uygunmu($.extend({}, e, { operator: char })) }
}
class GridKolonFiltreRec extends CKodAdiVeEkBilgi {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get attr() { return this.kod } set attr(value) { this.kod = value }
	get operator() { return this.ekBilgi } set operator(value) { this.ekBilgi = value }
	get value() { return this.aciklama } set value(value) { this.aciklama = value }
	get operatorCh() { let result = this.operator; if (result) result = result.kod || result; return result }
	set operatorCh(value) { if (value) value = value.kod; this.operator = value }
	get operatorTekSecim() {
		let result = this.operator; if (typeof result != 'object') result = new GridliKolonFiltre_OperatorTekSecim({ char: result });
		return result
	}
	get operatorText() {
		let result = this.operator; if (result) result = result.kod ?? result;
		return result ? GridliKolonFiltre_OperatorTekSecim.instance.kaDict[result]?.aciklama : null
	}
	get jqxFilterAnaTip() { return this.class.tip2JqxFilterAnaTip(this.tip) }
	
	constructor(e) {
		e = e || {}; super(e);
		if (!$.isArray(e)) { $.extend(this, { attr: e.attr, operator: e.operator, value: e.value, tip: e.tip }) }
		if (!this.operator) this.operator = GridliKolonFiltre_OperatorTekSecim.instance.class.defaultChar
	}
	static tip2JqxFilterAnaTip(e) {
		let _tip2JqxFilterAnaTip = this._tip2JqxFilterAnaTip;
		if (!_tip2JqxFilterAnaTip) {
			_tip2JqxFilterAnaTip = this._tip2JqxFilterAnaTip = {
				string: GridKolonTip_String.jqxFilterAnaTip, number: GridKolonTip_Number.jqxFilterAnaTip,
				date: GridKolonTip_Date.jqxFilterAnaTip, bool: 'booleanfilter'
			}
		}
		const tip = (typeof e == 'object') ? e.tip : e; return _tip2JqxFilterAnaTip[tip] || GridKolonTip_String.jqxFilterAnaTip
	}
	getGridFilter(e) {
		e = e || {};
		const {operatorCh} = this; const attr = e.attr ?? e.sql ?? e.field ?? this.attr; if (!(attr && operatorCh)) return null
		const value = e.value ?? this.value, filterType = this.jqxFilterAnaTip;
		return GridliKolonFiltre_OperatorTekSecim.getGridFilter($.extend({}, e, { type: filterType, attr, operator: operatorCh, value }))
	}
	uygunmu(e) {
		const {rec} = e, {attr, operatorCh, value, tip} = this, rec_value = rec[attr];
		if (rec_value === undefined) return true
		const filterType = this.class.tip2JqxFilterAnaTip(tip);
		return GridliKolonFiltre_OperatorTekSecim.uygunmu($.extend({}, e, { type: filterType, attr, operator: operatorCh, value, target: rec_value }))
	}
}

