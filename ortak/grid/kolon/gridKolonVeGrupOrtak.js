class GridKolonVeGrupOrtak extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this } static _anaTip2Sinif = []; static _templates = {};
	static get defaultKodZorunlumu() { return false } static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar || [], 'gridPart'] }
	get builder() { return this._builder || this.gridPart?.builder } get kodBelirtec() { return this.belirtec } get adiBelirtec() { return null }
	get belirtec() { return getFuncValue.call(this, this._belirtec, { sender: this.sender, colDef: this }) } set belirtec(value) { this._belirtec = value }
	get isReadOnly() { return !this.isEditable }
	get jqxColumns() { let e = { columns: [] }; this.jqxColumnsDuzenle(e); return e.columns } jqxColumnsDuzenle(e) { }

	constructor(e = {}, text, genislikCh, sql, userData) {
		if (typeof e != 'object')
			e = { belirtec: e, text, genislikCh, sql, userData }
		super(e)
		this._builder = e.builder
		this.readFrom(e)
	}
	static getClass({ anaTip } = {}) {
		return anaTip ? this._anaTip2Sinif[anaTip] ?? cls : GridKolon
	}
	static from(e) {
		if (!e)
			return null
		let cls = this.getClass(e)
		if (!cls)
			return null
		let result = new cls(e)
		return result.readFrom(e) ? result : null
	}
	readFrom(e = {}, text, genislikCh, sql, userData) {
		if (typeof e != 'object')
			e = { belirtec: e, text, genislikCh, sql, userData }
		return this.readFrom_ilk(e) && this.readFrom_ara(e) && this.readFrom_son(e)
	}
	readFrom_ilk(e) {
		if (e.userData != null) { this.userData = e.userData }
		if (e.kisitDuzenleyici != null) { this.kisitDuzenleyici = e.kisitDuzenleyici }
		this.kodZorunlumu = e.kodZorunlumu ?? e.kodZorunlu ?? e.zorunlumu ?? e.zorunlu ?? this.class.defaultKodZorunlumu;
		this._belirtec = e.belirtec ?? e.attr ?? e.dataField ?? e.datafield;
		return true
	}
	readFrom_ara(e) { return true }
	readFrom_son(e) { return true }
	parseColDef(value) { let result = value; if (result && $.isPlainObject(result)) result = GridKolonVeGrupOrtak.from(result); return result }
	belirtec2KolonDuzenle(e) { let {belirtec2Kolon} = e; belirtec2Kolon[this.belirtec] = this; }
	handleKeyboardNavigation_ortak(e) { }
	readOnly() { this.isEditable = false; return this } editable() { this.isEditable = true; return this } 
	kodZorunlu() { this.kodZorunlumu = true; return this } zorunlu() { this.kodZorunlu(); return this }
	kodZorunluOlmasin() { this.kodZorunlumu = false; return this } zorunluDegil() { return this.kodZorunluOlmasin() } kodZorunluDegil() { return this.kodZorunluOlmasin() }
	setBelirtec(value) { this.belirtec = value; return this }
	setText(value) { this.text = value; return this }
	setGenislikCh(value) { this.genislikCh = value; return this }
	setWidth(value) { this.width = value; return this }
	setMinWidth(value) { this.minWidth = value; return this }
	setMaxWidth(value) { this.maxWidth = value; return this }
	setSQL(value) { this.sql = value; return this } setSql(value) { return this.setSQL(value) }
	setUserData(value) { this.userData = value; return this }
	setKisitDuzenleyici(value) { this.kisitDuzenleyici = value; return this }
	setTip(value) { this.tip = value; return this }
	setCellClassName(value) { this.cellClassName = value; return this }
	setCellsRenderer(value) { this.cellsRenderer = value; return this }
	static getTemplate(e) { let {key} = e; delete e.key; return getFuncValue(this._templates[key], e) }
	static test() {
		let cls = this, rfb = new RootFormBuilder().asWindow('Grid Kolon/Grup Test');
		rfb.addIslemTuslari({ id: 'islemTuslari', tip: 'vazgec', id2Handler: { vazgec: e => e.sender.close() } });
		let grid = rfb.addGridliGiris({
			id: 'grid', source: e => { let recs = []; for (let i = 1; i <= 20; i++) recs.push({ seq: i }); return recs },
			kontrolcu: new class extends GridKontrolcu {
				tabloKolonlariDuzenle(e) { super.tabloKolonlariDuzenle(e); let {tabloKolonlari} = e; tabloKolonlari.push( new cls() ) }
			}
		}).addCSS('dock-bottom').addStyle_fullWH(); rfb.run();
		return rfb
	}
}
