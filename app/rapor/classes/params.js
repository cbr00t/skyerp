class MQYerelParam extends MQYerelParamTicari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	/*static paramAttrListeDuzenle(e) { super.paramAttrListeDuzenle(e); e.liste.push('tip2SonDRaporRec') }
	constructor(e) { e = e || {}; super(e); for (let key of ['tip2SonRaporTanim']) { this[key] = this[key] || {} } }
	paramSetValues(e) { super.paramSetValues(e); for (let key of ['tip2SonRaporTanim']) { this[key] = this[key] || {} } }*/
}
class MQParam_DRapor extends MQParam {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Rapor Parametreleri' } static get paramKod() { return 'DRAPOR' }
	get ekDBListe() { return this.konsolideCikti ? this._ekDBListe : null } set ekDBListe(value) { this._ekDBListe = value }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); let {paramci} = e;
		paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`);
		let form = paramci.addFormWithParent();
		form.addCheckBox('ihracatIntacdanmi', 'İhracat İntaçtanmı')
		form.addCheckBox('konsolideCikti', 'Konsolide Çıktı').degisince(({ builder: fbd }) => fbd.parentBuilder.id2Builder._ekDBListe.updateVisible());
		form.addModelKullan('_ekDBListe', 'Ek Veritabanları').comboBox().autoBind().noMF().kodsuz().coklu()
			.setVisibleKosulu(({ builder: fbd }) => fbd.altInst.konsolideCikti ? true : 'jqx-hidden')
			.setSource(e => app.wsDBListe().then(arr => arr.filter(x => x != 'ORTAK').map(x => new CKodVeAdi([x, x]))))
	}
	paramSetValues(e) { super.paramSetValues(e); let {rec} = e /* let kritikDurNedenKodSet = this.kritikDurNedenKodSet = asSet(rec.kritikDurNedenKodlari) || {} */ }
	/*async tekilOku(e) { return { jsonstr: await app.wsParams() } }*/
}
