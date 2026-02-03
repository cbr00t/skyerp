class MQTabDokumForm extends MQMasterOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TABMATFORM' } static get sinifAdi() { return 'Tablet Matbuu Form' }
	static get offlineDirect() { return true } static get offlineGonderYapilirmi() { return false }
	static get noLocalTable() { return true }
	
	offlineBuildSQLiteQuery({ result: r = [] }) {
		super.offlineBuildSQLiteQuery(...arguments)
	}
	static async loadServerDataDogrudan({ offlineRequest, offlineMode }) {
		if (!offlineRequest || offlineMode)
			return null
		
		let sent = new MQSent(), {sahalar} = sent
		sent
			.fromAdd('tmatskydetay har')
			.fromIliski('tmatbuu fis', 'fis.sayac = har.sayac')
		sahalar
			.addWithAlias('fis', 'tip')
			.addWithAlias('har', 'sayac', 'seq', 'jsontext')
		let orderBy = ['sayac', 'seq']
		let query = new MQStm({ sent, orderBy })
		let recs = await this.sqlExecSelect({ offlineRequest, offlineMode, query })
		let {tableAlias: alias} = this
		if (offlineRequest && !offlineMode) {
			let {tablet} = app.params
			let dokumFormlar = tablet.dokumFormlar = {}
			let sevListe = seviyelendir({ source: recs, attrListe: ['tip'] })
			for (let { orjBilgi: { tip }, detaylar } of sevListe) {
				try {
					let data = detaylar.map(_ => _.jsontext).join('')
					data = data ? Base64.decode(data) : null
					data = data ? JSON.parse(data) : null
					if (data)
						dokumFormlar[tip] = data
				}
				catch (ex) { cerr(ex) }
			}
			await tablet.kaydet()
		}
		return null
	}
}
