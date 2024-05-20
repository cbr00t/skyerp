class MQDoviz extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() {return 'Doviz' }
	static get table() { return 'ORTAK..dvmst' }
	static get tableAlias() { return 'dvz' }
	static get kodListeTipi() { return 'DOVIZ' }

	static async dvKod2Kur(e) {
		e = e || {};
		const dvKod = typeof e == 'object' ? e.dvKod ?? e.kod : e;
		if (!dvKod)
			return null
		const {globals} = this;
		const cache = globals.dvKod2Kur = globals.dvKod2Kur || {};
		let result = cache[dvKod];
		if (result === undefined)
			result = globals.dvKod2Kur[dvKod] = await this.dvKod2KurDogrudan(e)
		return result
	}
	static async dvKod2KurDogrudan(e) {
		e = e || {};
		const dvKod = typeof e == 'object' ? e.dvKod ?? e.kod : e;
		if (!dvKod)
			return null
		const sent = new MQSent({
			top: 1,
			from: 'ORTAK..ydvkur',
			where: { degerAta: dvKod, saha: 'kod' },
			sahalar: ['kod', 'tarih', 'efekalis alim', 'efeksatis satis']
		});
		const stm = new MQStm({ sent: sent, orderBy: ['tarih DESC'] });
		return await app.sqlExecTekil(stm) ?? null
	}
}
