class TabFisListe extends TabFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get fisTipi() { return null } static get detaySinif() { return TabFisListeDetay }
	static get kodListeTipi() { return 'TABFISLISTE' } static get sinifAdi() { return 'Fiş listesi' }
	static get araSeviyemi() { return true }

	static fisSinifFor(e) {
		let _ = isObject(e) ? e.fisTipi ?? e.fistipi : e
		_ = _?.rec ?? _
		let fisTipi = _?.fisTipi ?? _
		return this.tip2Sinif[fisTipi] ?? null
	}
	static detaySinifFor(e) { return this.fisSinifFor(e)?.detaySinif }
	static async yeniInstOlustur({ sender: gridPart, islem, rec, rowIndex, args = {} }) {
		let {fisTipi} = rec ?? {}
		let yenimi = islem == 'yeni'
		if (yenimi || !fisTipi) {
			let {tip2Sinif} = this
			let p = new $.Deferred()
			let secince = ({ value: fisTipi }) => p.resolve(fisTipi)
			let kapaninca = () => p.resolve()
			MQTabBelgeTipi.listeEkraniAc({ secince, kapaninca })
			fisTipi = await p
		}
		let fisSinif = this.fisSinifFor(fisTipi)
		if (!fisSinif)
			return
		let inst = new fisSinif({ ...args })
		if (rec) {
			await inst.keySetValues({ ...arguments, rec, sayac: undefined })
			inst.mustKod = rec.must
			if (!yenimi) {
				inst.sayac = rec.sayac
				await inst.yukle()
			}
		}
		return inst
	}
	static async loadServerDataDogrudan({ offlineRequest, offlineMode }) {
		if (!offlineRequest) {
			let cacheClasses = [ MQTabStok, MQTabTahsilSekli]
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
