class TabFisListeDetay extends TabDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }

	htmlOlustur(e) {
		this._text = ''
		return this
	}
}
