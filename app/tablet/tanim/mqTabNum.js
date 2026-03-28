class MQTabNum extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TABNUM' } static get sinifAdi() { return 'Numaratör' }
	static get table() { return 'tnumara' } static get tableAlias() { return 'num' }
	static get primaryKeys() { return [this.idSaha] }
	static get silinebilirmi() { return true }
	static get offlineGonderYapilirmi() { return false }

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		extend(pTanim, {
			/*sayac: new PInstNum('sayac'),
			tip: new PInstStr('tip'),
			belirtec: new PInstStr('belirtec'),*/
			id: new PInstStr('id'),
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
			...this.getKAKolonlar(...colDefs_seriSonNo),
			new GridKolon({ belirtec: 'id', text: 'ID', genislikCh: 40 })
		])
	}
	static async loadServerDataDogrudan({ offlineRequest, offlineMode } = {}) {
		let recs = await super.loadServerDataDogrudan(...arguments)
		if (offlineRequest && !offlineMode) {
			// Bilgi Yükle
			if (recs) {
				let eIrsTipSet = asSet(['TI', 'AI', 'TFI', 'AFI'])
				;recs.forEach(rec => {
					rec.id ??= newGUID()
					let { tip, belirtec, belgetipi: eIslTip, isarettipi: isaret } = rec
					if (eIslTip == 'E' && eIrsTipSet[tip])
						eIslTip = 'IR'
					if (isaret && isaret != '*')
						isaret = ''
					if (!rec.kod) {
						// normalde param'dan numaratör anahtarı belirlenir (TFI||! gibi)
						rec.kod = [tip, eIslTip, isaret]
							.join(delimWS)
							.trimEnd(delimWS)
					}
					deleteKeys(rec, 'tip', 'belirtec')
				})
			}
		}
		return recs
	}
	static loadServerData_queryDuzenle({ offlineRequest, offlineMode, sent: { sahalar, where: wh } } = {}) {
		super.loadServerData_queryDuzenle(...arguments)
		let { tableAlias: alias } = this
		if (offlineRequest && !offlineMode) {
			// Bilgi Yükle
			let { subeKod } = app
			wh.liste = []; sahalar.liste = []
			{
				let or = new MQOrClause()
				or.add(`${alias}.bsubeicinozel = 0`)
				if (subeKod != null)
					or.degerAta(subeKod, `${alias}.bizsubekod`)
				wh.add(or)
			}
			wh
				.inDizi(keys(TabFis.tip2Sinif), `${alias}.tip`)
				.inDizi(['', 'N', '*'], `${alias}.isarettipi`)
			sahalar.addWithAlias(alias, '*')
		}
	}
	alternateKeyHostVarsDuzenle({ hv }) {
		super.alternateKeyHostVarsDuzenle(...arguments)
		/*let { tip, belirtec } = this
		tip ??= ''; belirtec ??= ''
		extend(hv, { tip, belirtec })*/
	}

	async tekilOku(e = {}) {
		let { offlineRequest, isOfflineMode } = e
		isOfflineMode ??= this.class.isOfflineMode
		let _e = e
		if (!offlineRequest && isOfflineMode) {
			let keyHV = this.alternateKeyHostVars(e)
			if (empty(keyHV))
				keyHV = this.keyHostVars(e)
			_e = { ...e, keyHV }
		}
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
