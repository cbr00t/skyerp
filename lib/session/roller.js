class Rol extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return null } static get sinifAdi() { return 'Rol' }
	static get araSeviyemi() { return false } static get adimsalmi() { return false } static get icerikselmi() { return false }
	constructor(e) { e = e || {}; super(e); this.setValues({ rec: e.rec ?? e }) }
	static get tip2Sinif() {
		let result = this._tip2Sinif; if (result == null) {
			result = {}; const {subClasses} = this; for (const cls of subClasses) { const {araSeviyemi, tip} = cls; if (!araSeviyemi && tip) { result[tip] = cls } }
			this._tip2Sinif = result
		}
		return result
   }
	static getClass(e) { const tip = typeof e == 'object' ? e.tip : e; return this.tipSinif[tip] }
	newFor(e) {
		if (typeof e != object) { e = { tip: e } }
		const cls = this.getClass(e); return cls ? new cls(e) : null
	}
	async yukle(e) {
		let encUser = e.encUser ?? e.xuser; if (!encUser) { const user = e.user ?? config.session.user; encUser = await app.xenc(user) } if (!encUser) { return }
		let rec; debugger; if (rec) { this.setValues({ rec }) } return this
	}
	setValues(e) { }
}
class Rol_Adimsal extends Rol {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'A' }
	static get sinifAdi() { return `${super.sinifAdi}: Adımsal` } static get adimsalmi() { return true }
	setValues(e) {
		super.setValues(e); const {rec} = e;
		$.extend(this, { menuId: rec.menuId ?? rec.kod ?? rec.id, yasakmi: asBool(rec.yasakmi ?? rec.yasak) })
	}
}
class Rol_Iceriksel extends Rol {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'I' }
	static get sinifAdi() { return `${super.sinifAdi}: İçeriksel` } static get icerikselmi() { return true }
	setValues(e) {
		super.setValues(e); const {rec} = e;
		$.extend(this, { bs: rec.bs ?? rec.basiSonu ?? {}, yasakmi: asBool(rec.disindakilermi ?? rec.disindakiler) })
	}
}
