class BarkodKurali extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get parserAdi() { return (this.parserSinif || {}).aciklama }
	constructor(e) { e = e || {}; super(e); if (!$.isEmptyObject(e)) { $.extend(this, e) } }
	async parseSonucu(e) {
		const {parserSinif} = this; if (!parserSinif) { return null }
		const parser = new parserSinif({ kural: this, ...e}); return await parser.parse(e) ? parser : null
	}
}
