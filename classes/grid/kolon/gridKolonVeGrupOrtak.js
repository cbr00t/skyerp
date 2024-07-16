class GridKolonVeGrupOrtak extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this } static _anaTip2Sinif = []; static _templates = {};
	static get defaultKodZorunlumu() { return false } static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar || [], 'gridPart'] }
	get builder() { return this._builder || this.gridPart?.builder } get kodBelirtec() { return this.belirtec } get adiBelirtec() { return null }
	get belirtec() { return getFuncValue.call(this, this._belirtec, { sender: this.sender, colDef: this }) } set belirtec(value) { this._belirtec = value }
	get isReadOnly() { return !this.isEditable }
	get jqxColumns() { const e = { columns: [] }; this.jqxColumnsDuzenle(e); return e.columns } jqxColumnsDuzenle(e) { }

	constructor(e) { super(e); e = e || {}; this._builder = e.builder; this.readFrom(e) }
	static getClass(e) { let cls = GridKolon; if (e) { const {anaTip} = e; if (anaTip) { cls = this._anaTip2Sinif[anaTip] ?? cls } } return cls }
	static from(e) {
		if (!e) { return null } const cls = this.getClass(e); if (!cls) { return null }
		const result = new cls(e); return result.readFrom(e) ? result : null
	}
	readFrom(e) { if (!e) return false; return this.readFrom_ilk(e) && this.readFrom_ara(e) && this.readFrom_son(e) }
	readFrom_ilk(e) {
		if (e.userData != null) { this.userData = e.userData }
		this.kodZorunlumu = e.kodZorunlumu ?? e.kodZorunlu ?? e.zorunlumu ?? e.zorunlu ?? this.class.defaultKodZorunlumu;
		this._belirtec = e.belirtec ?? e.attr ?? e.dataField ?? e.datafield;
		return true
	}
	readFrom_ara(e) { return true } readFrom_son(e) { return true }
	parseColDef(value) { let result = value; if (result && $.isPlainObject(result)) result = GridKolonVeGrupOrtak.from(result); return result }
	belirtec2KolonDuzenle(e) { const {belirtec2Kolon} = e; belirtec2Kolon[this.belirtec] = this; }
	readOnly() { this.isEditable = false; return this } editable() { this.isEditable = true; return this } 
	kodZorunlu() { this.kodZorunlumu = true; return this } zorunlu() { this.kodZorunlu(); return this }
	kodZorunluOlmasin() { this.kodZorunlumu = false; return this } zorunluDegil() { return this.kodZorunluOlmasin() }
	setUserData(value) { this.userData = value; return this }
	static getTemplate(e) { const {key} = e; delete e.key; return getFuncValue(this._templates[key], e) }
	static test() {
		const cls = this, rfb = new RootFormBuilder().asWindow('Grid Kolon/Grup Test');
		rfb.addIslemTuslari({ id: 'islemTuslari', tip: 'vazgec', id2Handler: { vazgec: e => e.sender.close() } });
		const grid = rfb.addGridliGiris({
			id: 'grid', source: e => { const recs = []; for (let i = 1; i <= 20; i++) recs.push({ seq: i }); return recs },
			kontrolcu: new class extends GridKontrolcu {
				tabloKolonlariDuzenle(e) { super.tabloKolonlariDuzenle(e); const {tabloKolonlari} = e; tabloKolonlari.push( new cls() ) }
			}
		}).addCSS('dock-bottom').addStyle_fullWH(); rfb.run();
		return rfb
	}
}
