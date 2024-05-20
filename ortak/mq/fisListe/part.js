class FisListePart extends MFListeOrtakPart {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Hat Yönetimi' }
	static get partName() { return 'fisListe' }	
	gridSatirCiftTiklandi(e) {
		e = e || {}; if (super.gridSatirCiftTiklandi(e) === false) { return false }
		const {gridWidget} = this, {args} = (e.event || {}) || {};
		let index = args.rowindex; if (index == null || index < 0) { index = gridWidget.selectedrowindex }
		if (index == null || index < 0) { return false }
		if (this.expandedIndexes[index]) { gridWidget.hiderowdetails(index) } else { gridWidget.showrowdetails(index) }
		return true
	}
}
