class MQX extends MQCogul {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'X' }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false } static get secimSinif() { return null }
	static islemTuslariDuzenle_listeEkrani_ilk(e) {
		super.islemTuslariDuzenle_listeEkrani_ilk(e); const {liste} = e, gridPart = e.gridPart ?? e.parentPart ?? e.sender;
		/*liste.push(
			{ id: 'kaydet', handler: _e => this.kaydetIstendi({ ...e, ..._e, gridPart }) },
			{ id: 'temizle', handler: _e => this.temizleIstendi({ ...e, ..._e, gridPart }) }
		)*/
	}
	/*static listeEkrani_init(e) { super.listeEkrani_init(e); const gridPart = e.gridPart ?? e.parentPart ?? e.sender; if (!$.isEmptyObject(gridPart.tcKimlikNoSet)) { gridPart.tazeleIstendi(e) } }
	static orjBaslikListesi_gridInit(e) { super.orjBaslikListesi_gridInit(e); const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {grid} = gridPart; grid.jqxGrid('selectionmode', 'multiplecellsextended') }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); const {args} = e; $.extend(args, { editable: true, editMode: 'selectedcell' }) }
	static async gridTazeleIstendi(e) { await super.gridTazeleIstendi(e); await this.sorguYap(e); return false }*/
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const {result, rec} = e; result.push(rec.isError ? 'error' : 'success')
		/*if (rec.emeklimi) { result.push('emekli') }*/
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e /*; liste.push(new GridKolon({ belirtec: 'ekBilgi', text: 'Ek Bilgi', filterType: 'checkedlist' }).readOnly())*/
	}
	static async loadServerDataDogrudan(e) { const {gridPart} = e, {localData} = app.params; return [] }
	static gridVeriYuklendi(e) { const {gridPart} = e, {gridWidget} = gridPart /* gridWidget.clearselection() */ }
}
