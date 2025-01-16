class GridKontrolcu extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get fis() { const {parentPart} = this; return parentPart?.fis ?? parentPart.inst }
	get grid() { return this.parentPart?.grid } get gridWidget() { return this.parentPart?.gridWidget }
	constructor(e) { super(e); e = e || {}; $.extend(this, { parentPart: e.parentPart }) }
	gridArgsDuzenle(e) { }
	get tabloKolonlari() { let result = this._tabloKolonlari; if (!result) { const _e = { tabloKolonlari: [] }; this.tabloKolonlariDuzenle(_e); result = _e.tabloKolonlari } return result }
	tabloKolonlariDuzenle(e) {
		e = e || {}; if (config.dev) {
			const {tabloKolonlari} = e; tabloKolonlari.push(new GridKolon({ belirtec: 'okunanHarSayac', text: '-har-', genislikCh: 5 }).tipNumerik().readOnly().sabitle()) }
		this.tabloKolonlariDuzenle_ilk(e); this.tabloKolonlariDuzenle_ara(e); this.tabloKolonlariDuzenle_son(e)
	}
	tabloKolonlariDuzenle_ilk(e) { } tabloKolonlariDuzenle_ara(e) { } tabloKolonlariDuzenle_son(e) { }
	fis2Grid(e) {
		const {parentPart} = this, {fis} = e; if (!fis) { return false }
		let recs = e.recs = e.recs || []; const {detaylar} = fis, {gridDetaySinif} = fis.class;
		while (recs.length < detaylar.length) { recs.push(gridDetaySinif ? new gridDetaySinif() : {}) }
		for (let i = 0; i < detaylar.length; i++) { const det = detaylar[i]; recs[i] = det }
		return true
	}
	grid2Fis(e) {
		e = e || {}; const mesajsizFlag = e.mesajsiz || e.mesajsizFlag;
		const {parentPart} = this, gridPart = parentPart?.gridPart, tabloKolonlari = parentPart.tabloKolonlari ?? gridPart?.tabloKolonlari;
		const {gridWidget} = parentPart, zorunluBelirtecler = e.zorunluBelirtecler = {}, editBelirtecler = e.editBelirtecler = {}, {belirtec2Kolon} = gridPart ?? {};
		for (const colDefOrGrup of tabloKolonlari) {
			if (colDefOrGrup.kodZorunlumu) { zorunluBelirtecler[colDefOrGrup.kodBelirtec] = true }
			for (const colDef of colDefOrGrup.getIter()){ if (colDef.isEditable) { editBelirtecler[colDef.belirtec] = true } }
		}
		const recs = [], _recs = gridWidget.getboundrows(); let index = -1, temps = {};
		for (const det of _recs) {
			index++; const bosOlmayanVarmi = Object.keys(editBelirtecler).find(belirtec => !!det[belirtec]); if (!bosOlmayanVarmi) { continue }
			if (!mesajsizFlag) {
				let satirNo, kolonText, hepsiBosmu = false;
				if (!$.isEmptyObject(zorunluBelirtecler)) { hepsiBosmu = true; for (const belirtec in zorunluBelirtecler) { if (det[belirtec]) { hepsiBosmu = false; break } } } if (hepsiBosmu) { continue }
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
			const {parentPart} = this; for (const belirtec in _kodDegerDurum) {
				if (_kodDegerDurum[belirtec]) { continue }
				const satirNo = index + 1, kolonText = parentPart.belirtec2Kolon[bosOlanIlkBelirtec].text;
				return { isError: true, errorText: `<b>${satirNo}.</b> satırdaki <b>${kolonText}</b> bilgisi hatalıdır`, returnAction: e => e.focusTo({ rowIndex: i, belirtec }) }
			}
		}*/
		return true
	}
	grid2FisMesajsiz(e) { e = e || {}; e.mesajsiz = true; delete e.mesajsizFlag; return this.grid2Fis(e) }
	gridVeriYuklendi(e) { } gridContextMenuIstendi(e) { } gridRendered(e) { }
	gridRowExpanded(e) { } gridRowCollapsed(e) { } gridGroupExpanded(e) { } gridGroupCollapsed(e) { }
	gridSatirEklendi(e) { } gridSatirGuncellendi(e) { } gridSatirSilindi(e) { } gridSatirSayisiDegisti(e) { }
	gridSatirTiklandi(e) { } gridSatirCiftTiklandi(e) { } gridHucreTiklandi(e) { } gridHucreCiftTiklandi(e) { }
	fisGiris_gridVeriYuklendi(e) { e = e || {}; const fis = e.fis = e.fis || this.fis; if (fis.fisGiris_gridVeriYuklendi) { fis.fisGiris_gridVeriYuklendi(e) } }
}
