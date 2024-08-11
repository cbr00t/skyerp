class MQYerelParam extends MQYerelParamTicari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	/*static paramAttrListeDuzenle(e) { super.paramAttrListeDuzenle(e); e.liste.push('tip2SonDRaporRec') }
	constructor(e) { e = e || {}; super(e); for (const key of ['tip2SonRaporTanim']) { this[key] = this[key] || {} } }
	paramSetValues(e) { super.paramSetValues(e); for (const key of ['tip2SonRaporTanim']) { this[key] = this[key] || {} } }*/
}
class MQParam_Rapor extends MQParam {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Rapor Parametreleri' } static get paramKod() { return 'RAPOR' }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e; paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`)
		/*let form = paramci.addFormWithParent(); form.addNumber('kritikSinyalSureDk', 'Kritik Sinyal Süresi (dk)'); form.addNumber('kritikDuraksamaSureDk', 'Kritik Duraksama Süresi (dk)');*/
	}
	paramSetValues(e) { super.paramSetValues(e); const {rec} = e /* const kritikDurNedenKodSet = this.kritikDurNedenKodSet = asSet(rec.kritikDurNedenKodlari) || {} */ }
	/*async tekilOku(e) { return { jsonstr: await app.wsParams() } }*/
}
