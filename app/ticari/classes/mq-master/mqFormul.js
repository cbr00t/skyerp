class MQFormul extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'UFRM' }
	static get sinifAdi() { return 'Formül' } 
	static get formulmu() { return true }
	static get table() { return 'urtfrm' }
	static get tableAlias() { return 'frm' }
	static get kodSaha() { return 'formul' }
	static get kodEtiket() { return 'Formul' }

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		extend(pTanim, {
			revNox: new PInstStr('revnox')
		})
	}
	static loadServerData_queryDuzenle({ alias, sent }) {
		let { where: wh, sahalar } = sent
		super.loadServerData_queryDuzenle(...arguments)

		alias ??= this.tableAlias
		let { adiSaha } = this
		sahalar.liste = sahalar.liste.filter(r =>
			r.alias != adiSaha)

		sent.fromIliski('stkmst stk', `${alias}.formul = stk.kod`)
		wh.add(`${alias}.ozelisaret = ''`)
		sahalar.add(`${alias}.kaysayac formulsayac`, `stk.aciklama ${adiSaha}`, `${alias}.revnox`)
	}
	static standartGorunumListesiDuzenle({ liste }) {
		super.standartGorunumListesiDuzenle(...arguments)
		liste.push('revnox')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			gridKolon('revnox', 'Rev. No', 18).noSql().checkedList()
		)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e)
		let { tanimFormBuilder: tanimForm } = e
		tanimForm.addTextInput('revNox', 'Rev. Nox')
			.setPlaceholder('Rev. Nox')
			.etiketGosterim_yok()
			.addStyle_wh(200)
	}
	static kaKolonGrup_queryDuzenle({ stm, alias }) {
		super.kaKolonGrup_queryDuzenle(...arguments)
		let { adiSaha } = this
		alias ??= this.tableAlias
		for (let sent of stm) {
			let { from, sahalar } = sent
			let saha_adi = sahalar.liste.find(r => r.alias == adiSaha)
			if (saha_adi) {
				if (!from.aliasIcinTable('stk'))
					sent.fromIliski('stkmst stk', `${alias}.formul = stk.kod`)
				saha_adi.deger = 'stk.aciklama'
			}
			sahalar.add(`${alias}.kaysayac formulsayac`, `${alias}.revnox`)
		}
	}
	static ticariGrid_shKolon_stmDuzenleEk(e) {
		this.kaKolonGrup_queryDuzenle(e)
	}
	async ticariGrid_shKolon_degisinceEk({ gridRec: det, rec, newValue: v, oldValue, rowIndex: ri, dataField: k } = {}) { }
}
