class TabFisListeOrtak extends TabFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get uygunmu() { return true } static get notCacheable() { return true }
	static get araSeviyemi() { return true } static get fisTipi() { return null }
	static get detaySinif() { return TabFisListeDetayOrtak }

	static fisSinifFor(e) {
		let _ = isObject(e) ? e.fisTipi ?? e.fistipi : e
		_ = _?.rec ?? _
		let fisTipi = _?.fisTipi ?? _
		return this.tip2Sinif[fisTipi] ?? null
	}
	static detaySinifFor(e) { return this.fisSinifFor(e)?.detaySinif }
	static async yeniInstOlustur(e = {}) {
		let { gridPart = e.sender ?? {}, islem, rec = {}, rowIndex, args = {} } = e
		let { fisTipi: orjFisTipi, mustKod = gridPart.mustKod } = e
		let result = await super.yeniInstOlustur(e)
		islem = e.islem
		if (result != null)
			return result
		
		let yenimi = islem == 'yeni'
		let fisTipi = orjFisTipi ?? rec.fisTipi
		if (yenimi && !orjFisTipi) {
			fisTipi = await new Promise(async r => {
				let recs = await MQTabBelgeTipi.loadServerData(e)
				if (recs?.length > 1) {
					await MQTabBelgeTipi.listeEkraniAc({
						secince: ({ value: fisTipi }) => r(fisTipi),
						kapaninca: () => r(null)
					})
				}
				else
					r(recs[0]?.kod)
			}) ?? false
		}
		let fisSinif = fisTipi === false ? false : this.fisSinifFor(fisTipi)
		if (!fisSinif) {
			if (fisSinif === false)
				return null
			throw { rc: 'fisTipi', errorText: 'Fiş Tipi belirlenemedi' }
		}
		let inst = new fisSinif({ ...args })
		if (rec) {
			let _e = { ...e }; delete _e.sayac
			await inst.keySetValues(_e); delete _e.rec
			let { plasiyerkod: plasiyerKod } = rec
			mustKod ||= rec.must
			if (plasiyerKod && !inst.plasiyerKod)
				inst.plasiyerKod = plasiyerKod
			if (mustKod && !inst.mustKod)
				inst.mustKod = mustKod
			if (!yenimi) {
				inst.sayac = rec.sayac
				await inst.yukle(_e)
			}
		}
		return inst
	}
	static async loadServerDataDogrudan({ offlineRequest, offlineMode } = {}) {
		if (!offlineRequest) {
			let cacheClasses = [MQTabStok, MQTabTahsilSekli]
			await Promise.allSettled(cacheClasses.map(_ => _.getGloKod2Rec()))
		}
		let recs = await super.loadServerDataDogrudan(...arguments)
		// recs.reverse()
		return recs
	}
	static async loadServerData_detaylar({ parentRec: { fisTipi } = {}, offlineRequest, offlineMode } = {}) {
		if (offlineRequest)
			return await super.loadServerData_detaylar(...arguments)
		let fisSinif = this.fisSinifFor(fisTipi)
		return fisSinif ? await fisSinif.loadServerData_detaylar(...arguments) : []
	}
}

class TabFisListeDetayOrtak extends TabDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}

