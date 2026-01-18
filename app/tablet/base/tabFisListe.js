class TabFisListe extends TabFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get fisTipi() { return null } static get detaySinif() { return TabFisListeDetay }
	static get kodListeTipi() { return 'FISLISTE' } static get sinifAdi() { return 'Fiş' }
	static get araSeviyemi() { return true }

	static fisSinifFor(e) {
		let _ = isObject(e) ? e.fisTipi ?? e.fistipi : e
		_ = _?.rec ?? _
		let fisTipi = _?.fisTipi ?? _
		return this.tip2Sinif[fisTipi] ?? null
	}
	static detaySinifFor(e) { return this.fisSinifFor(e)?.detaySinif }
	static async yeniInstOlustur({ sender: gridPart, islem, rec, rowIndex, args = {} }) {
		let result = await super.yeniInstOlustur(...arguments)
		if (result != null)
			return result
		let {fisTipi} = rec ?? {}
		let yenimi = islem == 'yeni'
		if (yenimi) {
			fisTipi = false
			let {tip2Sinif} = this
			let p = new $.Deferred()
			let secince = ({ value: fisTipi }) => p.resolve(fisTipi)
			let kapaninca = () => p.resolve()
			MQTabBelgeTipi.listeEkraniAc({ secince, kapaninca })
			fisTipi = await p ?? false
		}
		let fisSinif = fisTipi === false ? false : this.fisSinifFor(fisTipi)
		if (!fisSinif) {
			if (fisSinif === false)
				return null
			throw { rc: 'fisTipi', errorText: 'Fiş Tipi belirlenemedi' }
		}
			// return null
		let inst = new fisSinif({ ...args })
		if (rec) {
			await inst.keySetValues({ ...arguments, rec, sayac: undefined })
			let {plasiyerkod: plasiyerKod, must: mustKod} = rec
			if (plasiyerKod && !inst.plasiyerKod)
				inst.plasiyerKod = plasiyerKod
			if (mustKod && !inst.mustKod)
				inst.mustKod = mustKod
			if (!yenimi) {
				inst.sayac = rec.sayac
				await inst.yukle()
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
		if (!fisSinif)
			return []
		return await fisSinif.loadServerData_detaylar(...arguments)
	}
}
