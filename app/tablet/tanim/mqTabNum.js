class MQTabNum extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TABNUM' } static get sinifAdi() { return 'Numaratör' }
	static get table() { return 'tnumara' } static get tableAlias() { return 'num' }
	static get idSaha() { return 'id' }
	static get primaryKeys() { return [this.idSaha] }
	static get silinebilirmi() { return true }
	static get offlineGonderYapilirmi() { return false }
	static get bosKodAlinirmi() { return true }    // !! wh clause (kod <> '') eklemesin !!

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
			if (!recs)
				return recs

			let { depomu, sicakSogukVeyaSutAlimmi, plasiyerKod, params: { tablet } } = app
			let numYapilar = tablet.numYapilar = {}
			let numTipDonusum = {
				PSSSIP: 'TS',
				CRTAH: 'TAH',
				MUSHZ: 'SUT'
			}
			;{
				let eIrsTipSet = asSet(['TI', 'AII'])
				;recs.forEach(rec => {
					rec.id ??= newGUID()
					let { anaTip, tip, belgetipi: eIslTip, isarettipi: isaret } = rec
					if (eIslTip == 'E' && eIrsTipSet[tip])
						eIslTip = 'IR'
					if (isaret && isaret != '*')
						isaret = ''
					tip = rec.tip = numTipDonusum[tip] ?? tip
					if (!rec.kod) {
						// normalde param'dan numaratör anahtarı belirlenir (TFI||! gibi)
						rec.kod = TabFis.getNumKod(tip, eIslTip, isaret)
						/*rec.kod = [tip, eIslTip, isaret]
							.join(delimWS)
							.trimEnd(delimWS)*/
					}
					deleteKeys(rec, 'tip', 'belirtec')
				})
			}
			;{
				if (sicakSogukVeyaSutAlimmi && plasiyerKod) {
					let sent = new MQSent(), { where: wh, sahalar } = sent
					sent.fromAdd('plasfisseri')
					wh.degerAta(plasiyerKod, 'plasiyerkod')
					sahalar.add('numtipi tip', 'numid id')

					let { _offlineMode } = app
					app.online()
					try {
						for (let { tip, id } of await sent.execSelect())
							numYapilar[tip] = id
					}
					finally { app._offlineMode = _offlineMode }
				}
				else if (depomu) {
					// ...
				}
			}
		}
		return recs
	}
	static loadServerData_queryDuzenle_son({ offlineRequest, offlineMode, stm, sent } = {}) {
		super.loadServerData_queryDuzenle_son(...arguments)
		let { tableAlias: alias } = this
		let { sahalar, where: wh } = sent, { orderBy } = stm
		if (offlineRequest && !offlineMode) {
			// Bilgi Yükle
			let { subeKod } = app
			;{
				wh.liste = []; sahalar.liste = []
				wh
					.inDizi(keys(TabFis.tip2Sinif), `${alias}.tip`)
					.inDizi(['', 'N', '*'], `${alias}.isarettipi`)
				;{
					let or = new MQOrClause()
					or.add(`${alias}.bsubeicinozel = 0`)
					if (subeKod != null)
						or.degerAta(subeKod, `${alias}.bizsubekod`)
				}
				sahalar.add(`'T' anaTip`)
				sahalar.addWithAlias(alias,
					'id', 'bsubeicinozel', 'bizsubekod',
					'tip', 'belgetipi', 'isarettipi',
					'seri', 'noyil', 'sonno'
				)
			}
			;{
				let numSabitKodlar = ['PSSSIP', 'CRTAH', 'SAYIM', 'MUSHZ']
				let uni = stm.sent = stm.sent.asUnionAll()
				let sent = new MQSent(), { where: wh, sahalar } = sent
				sent.fromAdd('numarator num')
				wh.inDizi(numSabitKodlar, 'num.kod')
				sahalar.add(
					`'' anaTip`,
					'num.id', '0 bsubeicinozel', 'num.bizsubekod',
					'num.kod tip', `'' belgetipi`, `'' isarettipi`,
					'num.seri', '0 noyil', 'num.sonno'
				)
				uni.add(sent)
			}
			orderBy.liste = [
				'anaTip DESC', 'bsubeicinozel', 'bizsubekod DESC',
				'tip DESC', 'belgetipi DESC', 'isarettipi DESC',
				'seri DESC', 'noyil ', 'sonno'
			]
		}
	}
	alternateKeyHostVarsDuzenle({ hv }) {
		super.alternateKeyHostVarsDuzenle(...arguments)
		let { id } = this
		if (id)
			hv.id = id
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
