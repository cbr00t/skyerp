class MQTabNum extends MQGuidVeAdiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TABNUM' } static get sinifAdi() { return 'Numaratör' }
	static get table() { return 'tnumara' } static get tableAlias() { return 'num' }
	static get silinebilirmi() { return true }
	static get primaryKeys() { return [this.idSaha] }
	// static get tumKolonlarGosterilirmi() { return true }

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		extend(pTanim, {
			sayac: new PInstNum('sayac'),
			tip: new PInstStr('tip'),
			belirtec: new PInstStr('belirtec'),
			seri: new PInstStr('seri'),
			noYil: new PInstNum('noyil'),
			sonNo: new PInstNum('sonno')
		})
	}
	offlineBuildSQLiteQuery({ result: r = [] }) {
		super.offlineBuildSQLiteQuery(...arguments)
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let colDefs_seriSonNo = [
			new GridKolon({ belirtec: 'seri', text: 'Seri', genislikCh: 8 }),
			new GridKolon({ belirtec: 'sonno', text: 'Son No', genislikCh: 8 }).tipNumerik()
		]
		if (isMiniDevice())
			colDefs_seriSonNo.reverse()
		liste.push(...[
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'tip', text: 'Tip', genislikCh: 8 }),
				new GridKolon({ belirtec: 'belirtec', text: 'Belirteç', genislikCh: 8 })
			),
			...this.getKAKolonlar(...colDefs_seriSonNo)
		])
	}
	static async loadServerDataDogrudan({ offlineRequest, offlineMode } = {}) {
		let recs = await super.loadServerDataDogrudan(...arguments)
		if (offlineRequest && !offlineMode) {
			// Bilgi Yükle
			if (recs) {
				;recs.forEach(rec =>
					rec.id ??= newGUID())
			}
		}
		return recs
	}
	static loadServerData_queryDuzenle({ offlineRequest, offlineMode, sent: { sahalar, where: wh } } = {}) {
		super.loadServerData_queryDuzenle(...arguments)
		sahalar.addWithAlias(this.tableAlias, 'sayac')
		if (offlineRequest && !offlineMode) {
			// Bilgi Yükle
			
		}
	}
	alternateKeyHostVarsDuzenle({ hv }) {
		super.alternateKeyHostVarsDuzenle(...arguments)
		let { tip, belirtec } = this
		tip ??= ''; belirtec ??= ''
		extend(hv, { tip, belirtec })
	}

	async tekilOku(e = {}) {
		let { offlineRequest, isOfflineMode } = e
		isOfflineMode ??= this.class.isOfflineMode
		let _e = e
		if (!offlineRequest && isOfflineMode)
			_e = { ...e, keyHV: this.alternateKeyHostVars(e) }
		return await super.tekilOku(_e)
	}
	async kesinlestir(e = {}) {
		let { id, class: { table, isOfflineMode: _isOfflineMode } } = this
		let {isOfflineMode = _isOfflineMode} = e
		if (!isOfflineMode)
			return this
		
		let keyHV = this.alternateKeyHostVars(e)
		if (empty(keyHV))
			keyHV = this.keyHostVars(e)
		let toplu = new MQToplu([
			new MQIliskiliUpdate({
				from: table,
				where: { birlestirDict: keyHV },
				set: `sonno = sonno + 1`
			}),
			new MQSent({
				from: table, sahalar: ['sonno'],
				where: { birlestirDict: keyHV }
			})
		]).withTrn()
		this.sonNo = asInteger(await this.sqlExecTekilDeger(toplu))
		return this
	}
}
