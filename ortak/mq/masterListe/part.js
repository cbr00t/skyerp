class MasterListePart extends MFListeOrtakPart {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Hat Yönetimi' }
	static get partName() { return 'masterListe' }
	gridArgsDuzenleDevam(e) {
		const {args} = e; const {selectionMode} = args; super.gridArgsDuzenleDevam(e);
		if (!this.panelDuzenleyici && this.tekilmi == false && args.selectionMode?.toLowerCase() != 'none' &&  args.selectionMode?.toLowerCase() != 'checkbox') { args.selectionMode = 'checkbox' }
	}
	gridSatirCiftTiklandi(e) { e = e || {}; if (super.gridSatirCiftTiklandi(e) === false) { return false } return true }
}
