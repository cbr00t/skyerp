class MQDoviz extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() {return 'Doviz' } static get kodListeTipi() { return 'DOVIZ' }
	static get table() { return 'ORTAK..dvmst' } static get tableAlias() { return 'dvz' }

	static async dvKod2Kur(e) {
		e = e || {};
		let dvKod = typeof e == 'object' ? e.dvKod ?? e.kod : e
		if (!dvKod)
			return null
		let {globals} = this
		let cache = globals.dvKod2Kur = globals.dvKod2Kur || {}
		let result = cache[dvKod]
		if (result === undefined)
			result = globals.dvKod2Kur[dvKod] = await this.dvKod2KurDogrudan(e)
		return result
	}
	static async dvKod2KurDogrudan(e) {
		e = e || {};
		let dvKod = typeof e == 'object' ? e.dvKod ?? e.kod : e;
		if (!dvKod)
			return null
		let sent = new MQSent({
			top: 1,
			from: 'ORTAK..ydvkur',
			where: { degerAta: dvKod, saha: 'kod' },
			sahalar: ['kod', 'tarih', 'efekalis alim', 'efeksatis satis']
		})
		let stm = new MQStm({ sent, orderBy: ['tarih DESC'] })
		return await app.sqlExecTekil(stm) ?? null
	}
	static loadServerData_queryDuzenle({ sent, sent: { sahalar, where: wh } }) {
		super.loadServerData_queryDuzenle(...arguments)
		let {tableAlias: alias} = this
		sahalar.addWithAlias(alias, 'degerlemeyapilir')
	}
}
