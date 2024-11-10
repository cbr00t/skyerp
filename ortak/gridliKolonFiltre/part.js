class GridliKolonFiltrePart extends GridliGirisWindowPart {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get partName() { return 'gridliKolonFiltre' }
	/* static get isWindowPart() { return true } */ get wndDefaultIsModal() { return true }
	get recsUyarlanmis() { return this.boundRecs.filter(rec => !!(rec.attr && (rec.operator == 'EMPTY' || rec.operator == 'NOT_EMPTY' || rec.value))) ?? [] }
	get filtreText() { return this.class.getFiltreText(this.recsUyarlanmis) }

	constructor(e) {
		e = e || {}; super(e); $.extend(this, { sender: e.sender, parentPart: e.parentPart || app.activeWndPart, duzenleyici: e.duzenleyici || {}, tamamIslemi: e.tamamIslemi });
		const {duzenleyici} = this; duzenleyici.recs = duzenleyici.recs ?? [];
		this.title = e.title == null ? 'Kolon Filtresi' : e.title || ''
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
					const rowIndex = args.rowindex, rec = gridWidget.getrowdata(rowIndex); if (rec) { rec.tip = tip }
					setTimeout(() => { gridWidget.setcellvalue(rowIndex, 'operator', tip == 'string' ? 'CONTAINS' : 'GREATER_THAN_OR_EQUAL') }, 5); /* gridWidget.refresh() */
				}
			}).tipTekSecim({ kaListe: e => getFuncValue.call(this, this.duzenleyici.attrKAListe, e) || [] }).autoBind().kodsuz().listedenSecilemez(),
			new GridKolon({ belirtec: 'operator', text: ' ', genislikCh: 18, cellClassName: 'operator' }).alignCenter()
				.tipTekSecim({ tekSecimSinif: GridliKolonFiltre_OperatorTekSecim }).autoBind().kodsuz().listedenSecilemez(),
			new GridKolon({
				belirtec: 'value', text: 'Değer', columnType: 'custom',
				cellClassName: (sender, rowIndex, dataField, value, rec) => {
					const {attr, operator} = rec || {}, attrKAListe = getFuncValue.call(this, this.duzenleyici.attrKAListe) || [];
					const ka = attrKAListe.find(ka => ka.kod == attr), {tip} = ka?.ekBilgi || {}; let result = dataField;
					result += ' left'; /* + (tip == 'number' ? 'right' : 'left');*/ if (!operator || (operator == 'EMPTY' || operator == 'NOT_EMPTY')) { result += ' grid-readOnly' }
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
		const {duzenleyici} = this, recs = $.extend(true, [], duzenleyici.recs ?? []) ?? [], attrKAListe = duzenleyici.attrKAListe ?? [];
		const ignoreAttrSet = asSet(['']), sahaSet = {}; for (const rec of recs) { sahaSet[rec.attr] = true }
		/*for (const {kod, ekBilgi} of attrKAListe) { if (!(ignoreAttrSet[kod] || sahaSet[kod])) { recs.push(this.newRec({ args: { attr: kod, ...ekBilgi } })) } }*/
		for (let i = 0; i < 15; i++) { recs.push(this.newRec()) }
		return recs
	}
	newRec(e) {
		e = e || {}; e.sinif = e.sinif ?? GridKolonFiltreRec; const rec = super.newRec(e);
		if (rec && rec.operator == null) { rec.operator = GridliKolonFiltre_OperatorTekSecim.instance.class.defaultChar }
		return rec
	}
	temizle(e) { const {duzenleyici} = this; duzenleyici.recs = []; this.tazele() }
	tamamIstendi(e) {
		const {tamamIslemi} = this; if (tamamIslemi) {
			const {recsUyarlanmis: recs} = this, sender = this, {filtreText} = this;
			if (getFuncValue.call(this, tamamIslemi, { sender, recs, filtreText }) !== false) { this.close() }
		}
	}
	onResize(e) { /* ignore super */ }
}
