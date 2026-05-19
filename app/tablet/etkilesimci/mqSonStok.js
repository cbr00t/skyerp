class MQTabSonStok extends MQMasterOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'SONSTOK' } static get sinifAdi() { return 'Son Stok' }
	static get table() { return 'sonstok' } static get tableAlias() { return 'son' }
	static get offlineGonderYapilirmi() { return true }
	static get ioKeys() {
		let { cache = {} } = app
		let { sonStok_ioKeys: result } = cache
		if (result == null) {
			result = cache.sonStok_ioKeys = [
				'stokKod', 'yerKod', 'ozelIsaret',
				...Array.from(HMRBilgi).map(_ => _.ioAttr)
			]
		}
		return result
	}
	static get miktarKeyYapi_tab2Orj() {
		const CacheKey = 'sonStok_miktarKeyYapi_tab2Orj'
		let { cache = {} } = app
		let { [CacheKey]: result } = cache
		if (result == null) {
			result = cache[CacheKey] = fromEntries(
				['sonMiktar', 'sonMiktar2', 'sonGelecekMiktar', 'sonGidecekMiktar']
					.map(k => [k, `orj${k}`])
			)
		}
		return result
	}

	offlineBuildSQLiteQuery({ result: r = [] }) {
		super.offlineBuildSQLiteQuery(...arguments)
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		let { ioKeys, miktarKeyYapi_tab2Orj: tab2Orj } = this
		;ioKeys.forEach(k =>
			pTanim[k] = new PInstStr(k))
		;entries(tab2Orj).forEach(([ k_tab, k_orj ]) => {
			pTanim[k_orj] = new PInstNum(k_orj)
			pTanim[k_tab] = new PInstNum(k_tab)
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
		let { ioKeys, miktarKeyYapi_tab2Orj: tab2Orj } = this
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'stokKod', text: 'Stok', genislikCh: 16 }).noSql(),
				new GridKolon({ belirtec: 'stokAdi', text: 'Stok Adı', sql: 'stk.aciklama' })
			),
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'yerKod', text: 'Yer', genislikCh: 8 }).noSql(),
				new GridKolon({ belirtec: 'yerAdi', text: 'Yer Adı', genislikCh: 20, sql: 'yer.aciklama' })
			),
			new GridKolon({ belirtec: 'ozelIsaret', text: 'İşr', genislikCh: 5 }).noSql().checkedList()
		)
		for (let _ of HMRBilgi) {
			let { ioAttr, adiAttr, etiket, adiEtiket, kami, tableAlias: mstAlias, kodSaha: mstKodSaha, adiSaha: mstAdiSaha } = _
			liste.push(...this.getKAKolonlar(
				new GridKolon({ belirtec: ioAttr, text: etiket, genislikCh: 8 }).noSql(),
				( kami && adiAttr ? new GridKolon({ belirtec: adiAttr, text: `${etiket} Adı`, genislikCh: 15, sql: `${mstAlias}.${mstAdiSaha}` }) : null ),
			))
		}
		liste.push(
			...entries(tab2Orj).flatMap(([ k_tab, k_orj ]) =>
				this.getKAKolonlar(
					new GridKolon({ belirtec: k_tab, text: k_tab, genislikCh: 10 }).tipDecimal().noSql(),
					new GridKolon({ belirtec: k_orj, text: k_orj, genislikCh: 10 }).tipDecimal().noSql()
				)
			)
		)
	}
	static async offlineSaveToLocalTable(e = {}) {
		let res = await super.offlineSaveToLocalTable(e)
		if (res === false)
			return res

		let { withClear } = e
		if (withClear)
			return true
		
		await this.topluDuzenle(e)
		return true
	}
	static async topluDuzenle(e = {}) {
		let { table, idSaha, gonderimTSSaha, tip2Sinif } = TabFis
		let uygunFisSiniflar = [
			TabSatisFaturaFis, TabAlimIadeFaturaFis,
			TabAlimFaturaFis, TabSatisIadeFaturaFis,
			TabSatisIrsaliyeFis, TabAlimIadeIrsaliyeFis,
			TabAlimIrsaliyeFis, TabSatisIadeIrsaliyeFis
		]
		let recs
		;{
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent.fromAdd(`${table} fis`)
			wh.add(
				`fis.silindi = ''`, `fis.merkez = ''`, `fis.gecici = ''`,
				`COALESCE(fis.${gonderimTSSaha}, '') = ''`
			)
			wh.inDizi(uygunFisSiniflar.map(_ => _.fisTipi), 'fis.fisTipi')
			sahalar.add('fis.*')
			recs = await sent.execSelect()
		}
		let yeni = []
		for (let rec of recs) {
			let { fisTipi: tip, [idSaha]: sayac } = rec
			let fisSinif = tip2Sinif[tip]
			let fis = fisSinif ? new fisSinif({ sayac }) : null
			if (!await fis?.yukle())
				continue
			let detaylar = fis.getYazmaIcinDetaylar() ?? []
			if (!empty(detaylar))
				yeni.push(...detaylar)
		}
		if (!empty(yeni))
			await this.update({ yeni })
	}
	static loadServerData_queryDuzenle_son(e) {
		super.loadServerData_queryDuzenle_son(e)
		let { alias = this.tableAlias, offlineRequest, offlineMode, stm, sent } = e
		let { where: wh, sahalar } = sent, { orderBy } = stm
		let { ioKeys, miktarKeyYapi_tab2Orj: tab2Orj } = this
		if (offlineRequest)
			sahalar.liste = []
		if (offlineRequest && !offlineMode) {
			// Bilgi Yükle
			wh.add(`${alias}.stokkod <> ''`, `${alias}.opno IS NULL`, `${alias}.sonmiktar <> 0`)
			;ioKeys.forEach(k =>
				sahalar.add(`${alias}.${k.toLowerCase()} ${k}`))
			for (let { rowAttr, ioAttr } of HMRBilgi)
				sahalar.add(`${alias}.${rowAttr} ${ioAttr}`)
			sahalar.add(
				...entries(tab2Orj).flatMap(([ k_tab, k_orj ]) => {
					let k_remote = k_tab.toLowerCase()
					return [
						// `SUM(${alias}.${k_remote}) ${k_tab}`,
						`SUM(${alias}.${k_remote}) ${k_orj}`
					]
				})
			)
		}
		else {
			wh.add(`${alias}.stokKod <> ''`)
			;ioKeys.forEach(k =>
				sahalar.add(`${alias}.${k}`))
			if (!offlineRequest) {
				sent
					.innerJoin(alias, 'stkmst stk', `${alias}.stokKod = stk.kod`)
					.innerJoin(alias, 'stkyer yer', `${alias}.yerKod = yer.kod`)
				for (let _ of HMRBilgi) {
					let { ioAttr, kami, table: mstTable, tableAlias: mstAlias, kodSaha: mstKodSaha } = _
					if (kami && mstTable)
						sent.innerJoin(alias, `${mstTable} ${mstAlias}`, `${alias}.${ioAttr} = ${mstAlias}.${mstKodSaha}`)
					sahalar.add(`${alias}.${ioAttr}`)
				}
			}
			sahalar.add(
				...entries(tab2Orj).flatMap(([ k_tab, k_orj ]) => {
					return [
						`SUM(${alias}.${k_tab}) ${k_tab}`,
						`SUM(${alias}.${k_orj}) ${k_orj}`
					]
				})
			)
			orderBy.liste = [`${alias}.yerKod`, `${alias}.stokKod`]
		}
		sent.groupByOlustur()
	}
	keyHostVarsDuzenle({ hv }) {
		super.keyHostVarsDuzenle(...arguments)
		let { class: { ioKeys } } = this
		;ioKeys.forEach(k =>
			hv[k] = this[k] ?? '')
	}
	keySetValues({ rec }) {
		super.keySetValues(...arguments)
		let { class: { ioKeys } } = this
		;ioKeys.forEach(k =>
			this[k] = rec[k] ?? '')
	}

	static update(e) {
		if (!app.sonStokKullanilir)
			return null
		
		let { delta } = this.calc(e) ?? {}
		if (!delta)
			return null
		
		let { table } = this
		let insHVListe = [], updListe = []
		;{
			const Prefix = 'son'
			for (let [key, item] of entries(delta)) {
				let keyHV = JSON.parse(key)  // { stokKod: 's1', yerKod: 'A', modelKod: '', ... }
				let hv = fromEntries(    // miktar -> tabMiktar | miktar2 -> tabMiktar2 | ...
					entries(item).map(([ k, v ]) => [
						`${Prefix}${k[0].toUpperCase()}${k.slice(1)}`,
						v
					])
				)
				
				insHVListe.push(keyHV)
				
				;{
					let upd = new MQIliskiliUpdate(), { where: wh, set } = upd
					upd.fromAdd(table)
					wh.birlestirDict(keyHV)
					// set.birlestirDict(hv)
					;entries(hv).forEach(([ k, v ]) => {
						if (v) {
							let op = v < 0 ? '-' : '+'
							set.add(`${k} = ${k} ${op} ${abs(v)}`)
						}
					})
					if (!empty(upd.set))
						updListe.push(upd)
				}
			}
		}
		if (empty(updListe))
			return null

		let toplu = new MQToplu([
			// pri key bazında eksikleri key bazında (miktarsız) insert et, olanları ignore et
			new MQQueryInsert({ table, hvListe: insHVListe }).insertIgnore(),
			// miktarları güncelle
			...updListe
		]).withTrn()
		this.globalleriSil()
		return toplu.execNone()
	}
	static async check(e = {}) {
		if (!app.sonStokKontrolEdilir)
			return
		
		let { delta } = await this.calc(e) ?? {}
		if (empty(delta))
			return

		let stokKodListe = keys(asSet(
			keys(delta)
				.map(k => JSON.parse(k).stokKod)
		))
		let mevcut_key2Rec = await promise(async () => {
			let { table } = this
			let sent = new MQSent(), { where: wh, sahalar } = sent
			;{
				sent.fromAdd(`${table} son`)
				wh.inDizi(stokKodListe, 'son.stokKod')
				sahalar.add('son.*')
			}
			return fromEntries(
				( await sent.execSelect(e) )
					.map(r => [ this.getKey(r), r ])
			)
		})
		
		let eksikler = []
		;entries(delta).forEach(([ k, bu ]) => {
			let { orjsonMiktar = 0, sonMiktar = 0 } = mevcut_key2Rec[k] ?? {}
			let { miktar: buMiktar = 0 } = bu
			let kalan = orjsonMiktar + sonMiktar + buMiktar
			if (kalan < 0) {
				let keyStr = values(JSON.parse(k)).filter(Boolean).join(' | ')
				eksikler.push(
					`<li>
						<span class="gray">${keyStr}: </span>
						<span class="bold firebrick">${numberToString(kalan)}</span>
					 </li>`
				)
			}
		})
		if (empty(eksikler))
			return

		let errorText = `<p>Bazı stoklar yetersizdir:</p><ul>${eksikler.join('\n')}</ul>`
		throw { isError: true, errorText }
	}
	static calc(e = {}) {
		let { yeni = e.inst, eski = e.eskiInst } = e
		function getSource(orj, negated = false) {
			if (empty(orj))
				return null

			let cls = orj?.class
			let { sonStokKullanilirmi = cls?.sonStokKullanilirmi } = orj
			if (sonStokKullanilirmi === false)
				return null
			
			let { cikisGibimi = cls?.cikisGibimi } = orj
			if (cikisGibimi)
				negated = !negated

			let { yerKod: orjYerKod = cls?.yerKod } = orj
			let x = orj
			let res = (
				isArray(x) ? x : makeArray(
					x?.getYazmaIcinDetaylar?.() ??
					x?.detaylar ?? x
				)
			)
			if (empty(res))
				return null
			
			res = res.map(r => {
				let { yerKod, miktar, miktar2 } = r
				yerKod ??= orjYerKod
				if (negated) {
					if (miktar)
						miktar = -miktar
					if (miktar2)
						miktar2 = -miktar2
				}
				return { ...r, yerKod, miktar, miktar2 }
			})
			return res
		}
		;{
			yeni = getSource(yeni)
			eski = getSource(eski, true)
		}
		if (!(yeni || eski))
			return null

		let { ioKeys, miktarKeyYapi_tab2Orj: tab2Orj } = this
		let delta = {}
		let enumerate = (source, negated) => {
			if (empty(source))
				return
			;{
				const PrefixLen = 'son'.length
				;source.forEach(r => {
					let item = delta[this.getKey(r)] ??= {}
					for (let k_tab in tab2Orj) {
						let k_io = k_tab.slice(PrefixLen)
						k_io = `${k_io[0].toLowerCase()}${k_io.slice(1)}`	 // tabMiktar -> miktar | tabMiktar2 -> miktar2 | ...
						let v = r[k_io]
						if (!v)
							continue
						if (negated)
							v = -v
						item[k_io] = (item[k_io] || 0) + v
					}
				})
			}
		}
		enumerate(yeni, false)
		enumerate(eski, true)
		
		delta = fromEntries(
			entries(delta)
				.map(([ key, item ]) => {
					item = fromEntries( entries(item).filter(([ k, v ]) => !empty(v)) )
					return [ key, item ]
				})
				.filter(([ , item ]) => !empty(item))
		)
		return empty(delta) ? null : { yeni, eski, delta }
	}
	static getKey(r) {
		let { ioKeys } = this
		let keyHV = fromEntries(
			ioKeys.map(k => [
				k,
				r[k] ?? ''
			])
		)
		;{
			// boş yerKod = 'A' kabul edilsin - merkez ile uyumluluk
			let { yerKod: v } = keyHV
			if (v !== undefined && !v)
				v = keyHV.yerKod = app.yerKod || 'A'
		}
		return toJSONStr(keyHV)
	}
}
