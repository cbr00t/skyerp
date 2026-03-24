class TabFisListe extends TabFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get fisTipi() { return null } static get araSeviyemi() { return true }
	static get kodListeTipi() { return 'FISLISTE' } static get sinifAdi() { return 'Fiş' }
	static get detaySinif() { return TabFisListeDetay }

	static fisSinifFor(e) {
		let _ = isObject(e) ? e.fisTipi ?? e.fistipi : e
		_ = _?.rec ?? _
		let fisTipi = _?.fisTipi ?? _
		return this.tip2Sinif[fisTipi] ?? null
	}
	static detaySinifFor(e) { return this.fisSinifFor(e)?.detaySinif }
	static async yeniInstOlustur(e = {}) {
		let { gridPart = e.sender, islem, rec, rowIndex, args = {} } = e
		let result = await super.yeniInstOlustur(e)
		islem = e.islem
		if (result != null)
			return result
		
		let {fisTipi} = rec ?? {}
		let yenimi = islem == 'yeni'
		if (yenimi) {
			fisTipi = await new Promise(r =>
				MQTabBelgeTipi.listeEkraniAc({
					secince: ({ value: fisTipi }) => r(fisTipi),
					kapaninca: () => r(null)
				})
			) ?? false
		}
		let fisSinif = fisTipi === false ? false : this.fisSinifFor(fisTipi)
		if (!fisSinif) {
			if (fisSinif === false)
				return null
			throw { rc: 'fisTipi', errorText: 'Fiş Tipi belirlenemedi' }
		}
		let inst = new fisSinif({ ...args })
		if (rec) {
			await inst.keySetValues({ ...e, rec, sayac: undefined })
			let {plasiyerkod: plasiyerKod, must: mustKod} = rec
			if (plasiyerKod && !inst.plasiyerKod)
				inst.plasiyerKod = plasiyerKod
			if (mustKod && !inst.mustKod)
				inst.mustKod = mustKod
			if (!yenimi) {
				inst.sayac = rec.sayac
				await inst.yukle({ ...e, rec: undefined })
			}
		}
		return inst
	}
	static async loadServerDataDogrudan({ offlineRequest, offlineMode }) {
		if (!offlineRequest) {
			let cacheClasses = [MQTabStok, MQTabTahsilSekli]
			await Promise.allSettled(cacheClasses.map(_ => _.getGloKod2Rec()))
		}
		let recs = await super.loadServerDataDogrudan(...arguments)
		recs.reverse()
		return recs
	}
	static async loadServerData_detaylar({ parentRec: { fisTipi } = {}, offlineRequest, offlineMode }) {
		if (offlineRequest)
			return await super.loadServerData_detaylar(...arguments)
		let fisSinif = this.fisSinifFor(fisTipi)
		return fisSinif ? await fisSinif.loadServerData_detaylar(...arguments) : []
	}
}
