class MQTabStokAnaGrup extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'STOKANAGRUP' } static get sinifAdi() { return 'Stok Ana Grup' }
	static get table() { return 'stkanagrup' } static get tableAlias() { return 'agrp' }
}
class MQTabStokGrup extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'STOKGRUP' } static get sinifAdi() { return 'Stok Grup' }
	static get table() { return 'stkgrup' } static get tableAlias() { return 'grp' }

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
class MQTabStokMarka extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'STOKMARKA' } static get sinifAdi() { return 'Stok Marka' }
	static get table() { return 'stokmarka' } static get tableAlias() { return 'smar' }
}

class MQTabBolge extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'BOLGE' } static get sinifAdi() { return 'Bölge' }
	static get table() { return 'carbolge' } static get tableAlias() { return 'bol' }
}
class MQTabIl extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'IL' } static get sinifAdi() { return 'İl' }
	static get table() { return 'caril' } static get tableAlias() { return 'il' }
}
class MQTabCariTip extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'CTIP' } static get sinifAdi() { return 'Cari Tip' }
	static get table() { return 'cartip' } static get tableAlias() { return 'ctip' }
}
class MQTabUlke extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'ULKE' } static get sinifAdi() { return 'Ülke' }
	static get table() { return 'ulke' } static get tableAlias() { return 'ulk' }
}
class MQTabTahsilSekli extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TAHSEKLI' } static get sinifAdi() { return 'Tahsilat Şekli' }
	static get table() { return 'tahsilsekli' } static get tableAlias() { return 'tsek' }
	static get kodSaha() { return 'kodno' } static get emptyKodValue() { return 0 }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			tip: new PInstTekSecim('tahsiltipi', TahsilSekliTip),
			altTip: new PInstTekSecim('ahalttipi', TahsilSekliAltTip),
			gunKodu: new PInstStr('ahgunkodu')
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let {tableAlias: alias} = this
		liste.push(
			new GridKolon({ belirtec: 'tahsiltipitext', text: 'Tip', genislikCh: 13, sql: TahsilSekliTip.getClause(`${alias}.tahsiltipi`) }),
			new GridKolon({ belirtec: 'ahalttipitext', text: 'Alt Tip', genislikCh: 13, sql: TahsilSekliAltTip.getClause(`${alias}.ahalttipi`) }),
			new GridKolon({ belirtec: 'ahgunkodu', text: 'Gün Kodu', genislikCh: 10 })
		)
	}
	static loadServerData_queryDuzenle_son({ sent, sent: { sahalar, where: wh }, offlineRequest, offlineMode, alias = this.tableAlias }) {
		let e = arguments[0]; super.loadServerData_queryDuzenle_son(e)
		sahalar.addWithAlias(alias, 'tahsiltipi', 'ahalttipi')
		if (offlineRequest) {
			if (!offlineMode) {
				// Bilgi Yükle
				wh.add(`${alias}.elterkullan <> ''`)
			}
		}
		
	}
}

