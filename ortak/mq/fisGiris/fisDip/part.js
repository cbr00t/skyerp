class FisDipPart extends GridliGirisPart {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get partName() { return 'fisDip' }
	static get isSubPart() { return false } static get isWindowPart() { return false }
	static get gelismisFlag() { return false } get defaultGridIDBelirtec() { return 'belirtec' }
	constructor(e) { e = e || {}; super(e); $.extend(this, { islem: e.islem, fis: e.inst || e.fis, dipIslemci: e.dipIslemci }) }
	runDevam(e) {
		e = e || {}; super.superRunDevam(e); const {layout, fis} = this; layout.addClass(this.class.partName);
		if (fis?.class?.dipKullanilirmi) {
			if (!this.dipIslemci && fis.dipIslemci) { this.dipIslemci = fis.dipIslemci }
			this.grid = layout.find('.grid'); this.gridInit(e)
		}
	}
	afterRun(e) {
		e = e || {}; super.afterRun(e);
		if (app.activePart == this) { app._activePartStack.pop() }
	}
	open(e) {
		let {wndPart} = this; if (wndPart?.isDestroyed) { wndPart = null; this.wndPart } if (wndPart) { return wndPart }
		const {parentPart, layout, islem, fis} = this;
		wndPart = this.wndPart = new FisDipWindowPart({
			parentPart, islem, fis,
			layout: $(`<div><div class="header"><div class="islemTuslari"></div></div>${layout.html()}</div>`)
		}); wndPart.run();
		const {wnd} = wndPart; wnd.on('close', evt => { delete this.wndPart; setTimeout(() => this.onResize(e), 10) });
		setTimeout(() => this.onResize(e), 10); return wndPart
	}
	close(e) {
		let {wndPart} = this; if (!wndPart || wndPart.isDestroyed) { return null }
		wndPart.close(e); return wndPart
	}
	gridArgsDuzenleDevam(e) { super.gridArgsDuzenleDevam(e); $.extend(e.args, { width: '100%', height: '100%', autoRowHeight: false, columnsHeight: 18, rowsHeight: 26 }) }
	get defaultTabloKolonlari() {
		let liste = [
			new GridKolon({ belirtec: 'etiket', text: ' ', minWidth: 150, maxWidth: 300, cellClassName: (sender, rowIndex, belirtec, value, rec) => `${belirtec} readOnly` }).readOnly() ];
		if (this.class.gelismisFlag) {
			liste.push(
				new GridKolon({
					belirtec: '_oran', text: '%', minWidth: 50, maxWidth: 100,
					cellClassName: (sender, rowIndex, belirtec, value, rec) => {
						let result = belirtec; result += rec._oranEditable ? ' editable' : ' readOnly';
						const {_ekCSS} = rec; if (_ekCSS) { result += ` ${_ekCSS}` }
						return result
					},
					cellBeginEdit: (colDef, rowIndex, belirtec, colType, value, result) => !!this.gridWidget.getrowdata(rowIndex)?._oranEditable,
					cellValueChanged: e => { this.gridHucreDegeriDegisti(e) }
				}).tipDecimal_bedel().sifirGosterme()
			);
		}
		liste.push(
			new GridKolon({
				belirtec: 'tlBedel', text: 'TL Bedel', minWidth: 80, maxWidth: 160,
				cellClassName: (sender, rowIndex, belirtec, value, rec) => {
					let result = `${belirtec} bedel`; result += rec._bedelEditable ? ' editable' : ' readOnly';
					const {_ekCSS} = rec; if (_ekCSS) { result += ` ${_ekCSS}` }
					return result
				},
				cellBeginEdit: (colDef, rowIndex, belirtec, colType, value, result) => !!this.gridWidget.getrowdata(rowIndex)._bedelEditable,
				cellValueChanged: e => { this.gridHucreDegeriDegisti(e) }
			}).tipDecimal_bedel().sifirGosterme()
		);
		return liste
	}
	async defaultLoadServerData(e) { return this.dipIslemci?.getDipGridSatirlari({ gelismis: this.class.gelismisFlag }) ?? [] }
	gridHucreDegeriDegisti(e) { this.dipIslemci?.satirlariHesapla(e); this.tazele() }
	gridContextMenuIstendi(e) {
		setTimeout(() => {
			const {parentPart, islem, fis} = this;
			const wndPart = this.wndPart = new FisDipWindowPart({
				parentPart, islem, fis, layout: $(`<div><div class="header"><div class="islemTuslari"></div></div>${this.layout.html()}</div>`)
			}); wndPart.run();
			const {wnd} = wndPart; wnd.on('close', evt => { delete this.wndPart; setTimeout(() => this.onResize(e), 10) });
			setTimeout(() => this.onResize(e), 10)
		}, 100)
	}
}
