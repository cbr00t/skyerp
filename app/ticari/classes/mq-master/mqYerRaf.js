class MQYerRaf extends MQKod {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tumKolonlarGosterilirmi() { return true }
	static get sinifAdi() { return 'Yer Raf' } static get table() { return 'yerraf' } static get tableAlias() { return 'raf' }
	static get kodSaha() { return 'rafkod' } static get kodEtiket() { return 'Raf' } static get localDataBelirtec() { return 'raf' }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); const {pTanim} = e; $.extend(pTanim, { yerKod: new PInstStr('yerkod') }) }
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent(); form.addModelKullan({ id: 'yerkod', etiket: 'Şube', mfSinif: MQStokYer }).dropDown()
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler;
		sec.secimTopluEkle({ yerKod: new SecimBasSon({ mfSinif: MQStokYer }), yerAdi: new SecimOzellik({ etiket: 'Yer Adı' }) });
		sec.whereBlockEkle(e => { const {aliasVeNokta} = this, sec = e.secimler, wh = e.where; wh.basiSonu(sec.yerKod, `${aliasVeNokta}yerkod`); wh.ozellik(sec.yerAdi, `yer.aciklama`) })
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		liste.push(...[
			new GridKolon({ belirtec: 'yerkod', text: 'Yer', genislikCh: 8 }),
			new GridKolon({ belirtec: 'yeradi', text: 'Yer Adı', genislikCh: 20, sql: 'yer.aciklama' })
		])
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {aliasVeNokta} = this, {sent} = e;
		sent.fromIliski('stkyer yer', `${aliasVeNokta}yerkod = yer.kod`)
	}
	static async getYerIcinRafRecs(e) {
		const {globals} = this; let result = globals.yerIcinRafRecs;
		if (result === undefined) { result = globals.yerIcinRafRecs = await this.getYerIcinRafRecsDogrudan(e) }
		return result
	}
	static getYerIcinRafRecsDogrudan(e) {
		e = e || {}; const yerKod = typeof e == 'object' ? e.yerKod : e;
		const query = new MQSent({ from: 'yerraf', where: { degerAta: yerKod, saha: 'yerkod' }, sahalar: ['*'] });
		return this.loadServerData({ query })
	}
}
