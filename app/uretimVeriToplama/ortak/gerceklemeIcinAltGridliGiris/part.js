class GerceklemeIcinAltGridliGirisPart extends GridliGirisWindowPart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get rootPartName() { return 'gerceklemeIcinAltGridliGiris' }
	static get partName() { return this.rootPartName }
	get defaultGridIDBelirtec() { return 'id' }
	get defaultSabitFlag() { return true }

	constructor(e) {
		e = e || {};
		super(e);
		$.extend(this, {
			parentPart: e.parentPart,
			parentRec: e.parentRec,
			tamamIslemi: e.tamamIslemi,
			title: e.title || ''
		});
		const {parentRec} = this;
		this.oemSayac = e.oemSayac ?? (parentRec?.oemSayac ?? parentRec?.oemsayac)
	}
	runDevam(e) {
		e = e || {};
		super.runDevam(e);
		this.layout.addClass(this.class.rootPartName);
		this.initLayout(e);
		this.initHeaderLayout(e);
		this.initInputEvents(e)
	}
	afterRun(e) {
		super.afterRun(e);
		this.show()
	}
	activated(e) {
		super.activated(e);
		setTimeout(() => this.focus(), 10)
	}
	destroyPart(e) {
		// this.gridPart.destroyPart();
		super.destroyPart()
	}
	initLayout(e) {
		const {layout} = this;
		const btnTamam = layout.find('#tamam');
		btnTamam.jqxButton({ theme: theme, width: false, height: false });
		btnTamam.off('click');
		btnTamam.on('click', evt =>
			this.tamamIstendi($.extend({}, e, { event: evt })));
		const header = this.header = layout.find('.header');
		this.divParentRecBilgi = header.find('.parentRecBilgi')
	}
	initHeaderLayout(e) {
		const {parentRec, divParentRecBilgi} = this;
		if (parentRec && (divParentRecBilgi && divParentRecBilgi.length))
			setTimeout(() => MQOEM.oemHTMLDuzenle($.extend({}, e, { rec: parentRec, parent: divParentRecBilgi })), 50)
	}
	initInputEvents(e) {
		for (const elm of [this.layout.find('input[type=textbox][type=text][type=number]')]) {
			elm.on('focus', evt =>
				evt.currentTarget.select())
		}
	}
	islemTuslariDuzenle(e) {
		super.islemTuslariDuzenle(e);
		const {liste} = e;
		const item = liste.find(x => x.id == 'tamam');
		if (item)
			item.handler = e => this.tamamIstendi(e)
	}
	gridArgsDuzenleDevam(e) {
		super.gridArgsDuzenleDevam(e);
		$.extend(e.args, {
			autoRowHeight: true, rowsHeight: 45, columnsHeight: 25, showGroupsHeader: false, /*selectionMode: 'multiplerowsextended',*/
			groupable: true, filterable: true, showFilterRow: true, filterMode: 'excel'
			// editMode: 'click'
		})
	}
	get defaultTabloKolonlari() {
		const liste = this.defaultTabloKolonlariDogrudan;
		for (const colDef of liste) {
			/*if (colDef.filterType === undefined)
				colDef.filterType = 'checkedlist'*/
			colDef.cellClassName = colDef.cellClassNameEk ?? ((...args) => this.grid_globalCellClassNameHandler(...args));
			delete colDef.cellClassNameEk;
			if (colDef.isEditable) {
				if (colDef.cellBeginEdit === undefined)
					colDef.cellBeginEdit = (...args) => this.onCellBeginEdit(...args)
				if (colDef.cellEndEdit === undefined)
					colDef.cellEndEdit = (...args) => this.onCellEndEdit(...args)
			}
		}
		return liste
	}
	get defaultTabloKolonlariDogrudan() {
		return super.defaultTabloKolonlari
	}
	defaultLoadServerData(e) {
		return super.defaultLoadServerData(e)
	}
	loadServerData_recsDuzenle(e) {
		super.loadServerData_recsDuzenle(e)
	}
	gridRendered(e) {
		super.gridRendered(e)
	}
	onCellBeginEdit(colDef, rowIndex, belirtec, colType, value) {
		return true
	}
	onCellEndEdit(colDef, rowIndex, belirtec, cellType, oldValue, newValue) {
		// setTimeout(() => this.focus(), 200);
		return true
	}
	gridVeriDegisti(e) {
		super.gridVeriDegisti(e)
	}
	grid_globalCellClassNameHandler(colDef, rowIndex, belirtec, value, rec) {
		let result = [belirtec];
		let _result = this.grid_globalCellClassNameHandler_ek(colDef, rowIndex, belirtec, value, rec);
		if (!$.isEmptyObject(_result))
			result.push(..._result)
		return result.join(' ')
	}
	grid_globalCellClassNameHandler_ek(colDef, rowIndex, belirtec, value, rec) {
		return []
	}
	
	tamamIstendi(e) {
	}
}
