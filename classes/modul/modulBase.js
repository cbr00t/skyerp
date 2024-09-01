class Modul extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get araSeviyemi() { return this == Modul }
	static get kod() { return null } static get aciklama() { return null } static get kullaniliyormu() { return true }
	static get anahtarVarmi() { return config.dev || !!(app.params?.prot?.paketSet || {})[this.kod] }
	static get kullaniliyormuVeAnahtarVarmi() { return this.kullaniliyormu && this.anahtarVarmi }
	static get kod2Sinif() {
		let result = this._kod2Sinif; if (result == null) {
			result = {}; const {subClasses} = this; for (const cls of subClasses) { const {araSeviyemi, kod} = cls; if (!araSeviyemi && kod) { result[kod] = cls } }
			this._kod2Sinif = result
		}
		return result
   }
	static getClass(e) { const kod = typeof e == 'object' ? (e.kod ?? e.tip) : e; return this.kod2Sinif[kod] }
}
