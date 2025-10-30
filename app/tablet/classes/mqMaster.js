class MQTabStokAnaGrup extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'STOKANAGRUP' } static get sinifAdi() { return 'Stok Ana Grup' }
	static get table() { return 'stkanagrup' } static get tableAlias() { return 'agrp' }
	static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false } static get tumKolonlarGosterilirmi() { return true }
}

class MQTabStokGrup extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'STOKGRUP' } static get sinifAdi() { return 'Stok Grup' }
	static get table() { return 'stkgrup' } static get tableAlias() { return 'grp' }
	static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false } static get tumKolonlarGosterilirmi() { return true }

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, { anaGrupKod: new PInstStr('anagrupkod') })
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e)
		let {rootBuilder: rfb, tabPage_genel: tabPage} = e
		let form = tabPage.addFormWithParent().yanYana(5)
		form.addModelKullan('anaGrupKod', 'Ana Grup').dropDown().setMFSinif(MQTabStokAnaGrup).autoBind
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 13 }),
			new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 20, sql: 'agrp.aciklama' })
		)
	}
	static loadServerData_queryDuzenle_son({ sent }) {
		super.loadServerData_queryDuzenle_son(...arguments)
		sent.stokGrup2AnaGrupBagla()
	}
}
class MQTabStokMarka extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'STOKMARKA' } static get sinifAdi() { return 'Stok Marka' }
	static get table() { return 'stokmarka' } static get tableAlias() { return 'smar' }
	static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false } static get tumKolonlarGosterilirmi() { return true }
}

class MQTabBolge extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'BOLGE' } static get sinifAdi() { return 'Bölge' }
	static get table() { return 'carbolge' } static get tableAlias() { return 'bol' }
	static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false } static get tumKolonlarGosterilirmi() { return true }
}
class MQTabIl extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'IL' } static get sinifAdi() { return 'İl' }
	static get table() { return 'caril' } static get tableAlias() { return 'il' }
	static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false } static get tumKolonlarGosterilirmi() { return true }
}
class MQTabUlke extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'ULKE' } static get sinifAdi() { return 'Ülke' }
	static get table() { return 'ulke' } static get tableAlias() { return 'ulk' }
	static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false } static get tumKolonlarGosterilirmi() { return true }
}
