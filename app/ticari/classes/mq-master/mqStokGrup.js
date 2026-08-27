class MQStokGrup extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Stok Grup' } static get table() { return 'stkgrup' }
	static get tableAlias() { return 'sgrp' } static get kodListeTipi() { return 'GRUP' }
	constructor(e) { e = e || {}; super(e) }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		extend(pTanim, { anaGrupKod: new PInstStr('anagrupkod') })
	}
	static rootFormBuilderDuzenle(e = {}) {
		super.rootFormBuilderDuzenle(e)
		this.formBuilder_addTabPanelWithGenelTab(e)
		let { tabPage_genel: page } = e
		
		let form = page.addFormWithParent()
			.yanYana()
		;{
			let mfSinif = MQStokAnaGrup, { sinifAdi: etiket } = mfSinif
			form.addSimpleComboBox('anaGrupKod', etiket)
                .setPlaceHolder(etiket)
				.setMFSinif(mfSinif)
				.addStyle_wh(300)
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(...[
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 10 }),
				new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 15, sql: 'agrp.aciklama' })
			)
		])
	}
	static loadServerData_queryDuzenle({ sent, sent: { where: wh } }) {
		super.loadServerData_queryDuzenle(...arguments)
		let { tableAlias: alias, kodSaha } = this
		sent.fromIliski('stkanagrup agrp', 'sgrp.anagrupkod = agrp.kod')
		wh.icerikKisitDuzenle_stokGrup({ saha: `${alias}.${kodSaha}` })
	}
	tekilOku_queryDuzenle(e) { super.tekilOku_queryDuzenle(e) }
}
