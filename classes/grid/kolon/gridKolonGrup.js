class GridKolonGrup extends GridKolonVeGrupOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get isEditable() { return (this.tabloKolonlari[0] || {}).isEditable }

	readFrom_son(e) {
		if (!super.readFrom_son(e)) return false
		const stmDuzenleyiciler = this.stmDuzenleyiciler = []; let _stmDuzenleyiciler = e.stmDuzenle;
		if (_stmDuzenleyiciler) { if ($.isArray(_stmDuzenleyiciler)) stmDuzenleyiciler.push(..._stmDuzenleyiciler); else stmDuzenleyiciler.push(_stmDuzenleyiciler) }
		const tabloKolonlari = this.tabloKolonlari = [
			...this.defaultTabloKolonlari,
			...(this.parseColDef(e.tabloKolonlari) || [])
		]; return true
	}
	get defaultTabloKolonlari() {
		let result = this._defaultTabloKolonlari;
		if (result == null) { const e = { tabloKolonlari: [] }; this.defaultTabloKolonlariDuzenle(e); result = this._defaultTabloKolonlari = e.tabloKolonlari }
		return result
	}
	defaultTabloKolonlariDuzenle(e) { }
	belirtec2KolonDuzenle(e) {
		super.belirtec2KolonDuzenle(e); const {tabloKolonlari} = this;
		if (!$.isEmptyObject(tabloKolonlari)) { for (const colDef of tabloKolonlari) colDef.belirtec2KolonDuzenle(e) }
		return this
	}
	asRSahalar(e) { const {tabloKolonlari} = this; return tabloKolonlari.map(colDef => colDef.asRSaha(e)) }
	asRSaha(e) { return null }
	jqxColumnsDuzenle(e) {
		super.jqxColumnsDuzenle(e); const {columns} = e, {gridPart, tabloKolonlari} = this;
		for (const colDef of tabloKolonlari) { colDef.gridPart = gridPart; columns.push(...(colDef.jqxColumns || [])) } return this
	}
	stmDuzenleyiciEkle(block) { this.stmDuzenleyiciler.push(block); return this }
	*getIter() { for (const colDef of this.tabloKolonlari) yield colDef }
}

(function() {
	const anaTip2Sinif = GridKolonVeGrupOrtak.prototype.constructor._anaTip2Sinif, subClasses = [GridKolonGrup];
	for (const cls of subClasses) { const {anaTip} = cls; if (anaTip) anaTip2Sinif[anaTip] = cls }
})();
