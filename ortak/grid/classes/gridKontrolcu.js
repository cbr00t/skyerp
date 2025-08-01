class GridKontrolcu extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get fis() { let {parentPart} = this; return parentPart?.fis ?? parentPart.inst }
	get grid() { return this.parentPart?.grid } get gridWidget() { return this.parentPart?.gridWidget }
	constructor(e) { super(e); e = e || {}; $.extend(this, { parentPart: e.parentPart }) }
	gridArgsDuzenle(e) { }
	get tabloKolonlari() {
		let {_tabloKolonlari: result} = this;
		if (!result) { let _e = { tabloKolonlari: [] }; this.tabloKolonlariDuzenle(_e); result = _e.tabloKolonlari }
		return result
	}
	tabloKolonlariDuzenle(e) { e = e || {}; this.tabloKolonlariDuzenle_ortak(e) }
	tabloKolonlariDuzenle_ortak(e) {
		e = e || {}; let {tabloKolonlari} = e;
		if (config.dev) { tabloKolonlari.push(new GridKolon({ belirtec: 'okunanHarSayac', text: '-har-', genislikCh: 5 }).tipNumerik().readOnly().sabitle()) }
		this.tabloKolonlariDuzenle_ilk(e); this.tabloKolonlariDuzenle_ara(e); this.tabloKolonlariDuzenle_son(e)
	}
	tabloKolonlariDuzenle_ilk(e) { } tabloKolonlariDuzenle_ara(e) { } tabloKolonlariDuzenle_son(e) { }
	fis2Grid(e) {
		let {parentPart} = this, {fis} = e; if (!fis) { return false }
		let recs = e.recs = e.recs || []; let {detaylar} = fis, {gridDetaySinif} = fis.class;
		while (recs.length < detaylar.length) { recs.push(gridDetaySinif ? new gridDetaySinif() : {}) }
		for (let i = 0; i < detaylar.length; i++) { let det = detaylar[i]; recs[i] = det }
		return true
	}
	grid2Fis(e) {
		e = e || {}; let mesajsizFlag = e.mesajsiz || e.mesajsizFlag;
		let {parentPart} = this, gridPart = parentPart?.gridPart, tabloKolonlari = parentPart.tabloKolonlari ?? gridPart?.tabloKolonlari;
		let {gridWidget} = parentPart, zorunluBelirtecler = e.zorunluBelirtecler = {}, editBelirtecler = e.editBelirtecler = {}, {belirtec2Kolon} = gridPart ?? {};
		for (let colDefOrGrup of tabloKolonlari) {
			if (colDefOrGrup.kodZorunlumu) { zorunluBelirtecler[colDefOrGrup.kodBelirtec] = true }
			for (let colDef of colDefOrGrup.getIter()) {
				if (colDef.isEditable) { editBelirtecler[colDef.belirtec] = true } }
		}
		let recs = [], _recs = gridWidget.getboundrows(), index = -1, temps = {};
		for (let det of _recs) {
			index++; let bosOlmayanVarmi = Object.keys(editBelirtecler).find(belirtec => !!det[belirtec]); if (!bosOlmayanVarmi) { continue }
			if (!mesajsizFlag) {
				let satirNo, kolonText, hepsiBosmu = false;
				if (!$.isEmptyObject(zorunluBelirtecler)) {
					hepsiBosmu = true;
					for (let belirtec in zorunluBelirtecler) { if (det[belirtec]) { hepsiBosmu = false; break } }
				}
				if (hepsiBosmu) { continue }
				let result = this.geriYuklemeIcinUygunmu({ parentPart, gridPart, belirtec2Kolon, tabloKolonlari, zorunluBelirtecler, mesajsiz: mesajsizFlag, detay: det, index, temps });
				if (typeof result == 'object') { return result } if (!result) { continue }
			}
			recs.push(det)
		}
		if ($.isEmptyObject(recs)) { return { isError: true, errorText: 'Detay Bilgi girilmelidir' } }
		e.recs = recs; return true
	}
	geriYuklemeIcinUygunmu(e) {
		/*let {zorunluBelirtecler, detay: det} = e, {_kodDegerDurum} = det;
		let bosOlanIlkBelirtec = Object.keys(zorunluBelirtecler).find(belirtec => !det[belirtec]); if (bosOlanIlkBelirtec) { return false }
		if (_kodDegerDurum) {
			let {parentPart} = this; for (let belirtec in _kodDegerDurum) {
				if (_kodDegerDurum[belirtec]) { continue }
				let satirNo = index + 1, kolonText = parentPart.belirtec2Kolon[bosOlanIlkBelirtec].text;
				return { isError: true, errorText: `<b>${satirNo}.</b> satırdaki <b>${kolonText}</b> bilgisi hatalıdır`, returnAction: e => e.focusTo({ rowIndex: i, belirtec }) }
			}
		}*/
		return true
	}
	grid2FisMesajsiz(e) { e = e || {}; e.mesajsiz = true; delete e.mesajsizFlag; return this.grid2Fis(e) }
	gridVeriYuklendi(e) { } gridContextMenuIstendi(e) { } gridRendered(e) { }
	gridRowExpanded(e) { } gridRowCollapsed(e) { } gridGroupExpanded(e) { } gridGroupCollapsed(e) { }
	gridSatirEklendi(e) { } gridSatirGuncellendi(e) { } gridSatirSayisiDegisti(e) { }
	gridSatirSilinecek(e) { } gridSatirSilindi(e) { }
	gridSatirTiklandi(e) { } gridSatirCiftTiklandi(e) { } gridHucreTiklandi(e) { } gridHucreCiftTiklandi(e) { }
	fisGiris_gridVeriYuklendi(e) { e = e || {}; let fis = e.fis = e.fis || this.fis; if (fis.fisGiris_gridVeriYuklendi) { fis.fisGiris_gridVeriYuklendi(e) } }
}
