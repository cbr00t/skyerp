class MQSubeParam extends MQKodOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tableAlias() { return 'par' }
	static get offlineGonderYapilirmi() { return false }
	static get bosKodAlinirmi() { return true }    // !! wh clause (kod <> '') eklemesin !!

	offlineBuildSQLiteQuery({ result: r = [] }) {
		super.offlineBuildSQLiteQuery(...arguments)
	}
	static loadServerData_queryDuzenle_son({ offlineRequest, offlineMode, stm, sent } = {}) {
		super.loadServerData_queryDuzenle_son(...arguments)
		let { tableAlias: alias } = this
		let { where: wh, sahalar } = sent, { orderBy } = stm
		if (offlineRequest && !offlineMode) {
			// Bilgi Yükle
			let kodSaha = 'bizsubekod'
			;{
				let item = sahalar.find(_ => _.alias == 'kod')
				if (item)
					item.deger = kodSaha
				else
					sahalar.add(`${alias}.${kodSaha} kod`)
			}
			if (orderBy)
				orderBy.liste = [kodSaha]
		}
		else {
			sent.sahalarVeGroupByVeHavingReset()
			sahalar = sent.sahalar
			sahalar.add(`${alias}.*`)
		}
	}
	static loadServerData_queryDuzenle_offline({ sent }) { }
}

class MQTabSubeParam extends MQSubeParam {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TABSUB' }
	static get sinifAdi() { return 'Tablet Şube Param' }
	static get table() { return 'elterparam' }
	
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		extend(pTanim, {
			yerKod: new PInstStr('yerKod')
		})
	}
	static loadServerData_queryDuzenle_son({ offlineRequest, offlineMode, stm, sent } = {}) {
		super.loadServerData_queryDuzenle_son(...arguments)
		let { tableAlias: alias } = this
		let { where: wh, sahalar } = sent, { orderBy } = stm
		if (offlineRequest && !offlineMode) {
			// Bilgi Yükle
			sahalar.addWithAlias(alias, 'ticariyerkod yerKod')
		}
	}
}
