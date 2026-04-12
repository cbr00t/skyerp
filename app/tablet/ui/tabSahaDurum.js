class TabSahaDurum extends MQMasterOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'SAHADUR' } static get sinifAdi() { return 'Saha Durum' }
	static get uygunmu() { return config.dev && !!app.params?.tablet?.depoMusteriDurumu }
	static get dogrudanTanimmi() { return true } static get noAutoFocus() { return true }
	static get tanimUISinif() { return ModelTanimPart }

	static rootFormBuilderDuzenle(e = {}) {
		let { sender: tanimPart, rootBuilder: rfb, tanimFormBuilder: tanimForm } = e
		debugger
	}
}
