class MQStokGrup extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Stok Grup' } static get table() { return 'stkgrup' }
	static get tableAlias() { return 'sgrp' } static get kodListeTipi() { return 'GRUP' }
	constructor(e) { e = e || {}; super(e) }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); const {pTanim} = e; $.extend(pTanim, { anaGrupKod: new PInstStr('anagrupkod') }) }
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent();
		form.addModelKullan({ id: 'anaGrupKod', etiket: 'Ana Grup', mfSinif: MQStokAnaGrup }).dropDown()
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 10 }),
			new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 15, sql: 'agrp.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); const {aliasVeNokta} = this, {sent} = e; sent.fromIliski('stkanagrup agrp', 'sgrp.anagrupkod = agrp.kod') }
	tekilOku_queryDuzenle(e) { super.tekilOku_queryDuzenle(e) }
}
