class Rol extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return null } static get sinifAdi() { return 'Rol' }
	static get adimsalmi() { return false } static get icerikselmi() { return false }
	constructor(e) { e = e || {}; super(e); this.setValues({ rec: e.rec ?? e }) }
	async yukle(e) {
		let {xuser} = e; if (!xuser) { const user = e.user ?? config.session.user; xuser = await app.wsXEnc(user) } if (!xuser) return
		let rec; debugger; if (rec) this.setValues({ rec }); return this
	}
	setValues(e) { /*const {rec} = e*/ }
}
class Rol_Adimsal extends Rol {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'A' } static get sinifAdi() { return 'Rol: Adımsal' } static get adimsalmi() { return true }
	setValues(e) {
		super.setValues(e);
		const {rec} = e; $.extend(this, {
			menuId: rec.menuId ?? rec.kod ?? rec.id,
			yasakmi: asBool(rec.yasakmi ?? rec.yasak)
		})
	}
}
class Rol_Iceriksel extends Rol {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'I' } static get sinifAdi() { return 'Rol: İçeriksel' } static get icerikselmi() { return true }
	setValues(e) {
		super.setValues(e);
		const {rec} = e; $.extend(this, {
			bs: rec.bs ?? rec.basiSonu ?? {},
			yasakmi: asBool(rec.disindakilermi ?? rec.disindakiler)
		})
	}
}
