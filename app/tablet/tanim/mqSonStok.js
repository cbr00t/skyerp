class MQTabSonStok extends MQMasterOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'SONSTOK' } static get sinifAdi() { return 'Son Stok' }
	static get table() { return 'sonstok' } static get tableAlias() { return 'son' }
	static get keyIOAttrListe() {
		let { cache, cache: { sonStok_keyIOAttrListe: result } = {} } = app
		if (result == null) {
			result = cache.sonStok_keyIOAttrListe = [
				'stokKod', 'yerKod', 'ozelIsaret',
				...Array.from(HMRBilgi).map(_ => _.ioAttr)
			]
		}
		return result
	}

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		let { keyIOAttrListe: ioKeys } = this
		;ioKeys.forEach(k =>
			pTanim[k] = new PInstStr(k))
		;['sonMiktar', 'sonMiktar2', 'sonGelecekMiktar', 'sonGidecekMiktar'].forEach(k => {
			pTanim[`orj${k}`] = new PInstNum(`orj${k}`)
			pTanim[k] = new PInstNum(k)
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
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
		)
		for (let _ of HMRBilgi) {
			let { ioAttr, adiAttr, etiket, adiEtiket, kami, tableAlias: mstAlias, kodSaha: mstKodSaha, adiSaha: mstAdiSaha } = _
			liste.push(...this.getKAKolonlar(
				new GridKolon({ belirtec: ioAttr, text: etiket, genislikCh: 8 }).noSql(),
				( kami && adiAttr ? new GridKolon({ belirtec: adiAttr, text: `${etiket} Adı`, genislikCh: 15, sql: `${mstAlias}.${mstAdiSaha}` }) : null ),
			))
		}
		liste.push(
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'sonMiktar', text: 'Miktar', genislikCh: 15 }).tipDecimal().noSql(),
				new GridKolon({ belirtec: 'orjSonMiktar', text: 'Orj. Miktar', genislikCh: 15 }).tipDecimal().noSql()
			)
		)
	}
	static async loadServerData({ offlineRequest, offlineMode } = {}) {
		let recs = await super.loadServerData(...arguments)
		if (empty(recs) || (offlineRequest && offlineMode))
			return recs
		;{
			let key2Orj = {
				sonMiktar: 'orjSonMiktar', sonMiktar2: 'orjSonMiktar2',
				sonGelecekMiktar: 'orjSonGelecekMiktar', sonGidecekMiktar: 'orjSonGidecekMiktar'
			}
			;recs.forEach(rec => {
				entries(key2Orj).forEach(([k, ok]) =>
					rec[ok] ??= rec[k])
			})
		}
		return recs
	}
	static loadServerData_queryDuzenle_son(e) {
		super.loadServerData_queryDuzenle_son(e)
		let { alias = this.tableAlias, offlineRequest, offlineMode, stm, sent } = e
		let { where: wh, sahalar } = sent, { orderBy } = stm
		let { keyIOAttrListe: ioKeys } = this
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
				`SUM(${alias}.sonmiktar) sonMiktar`, `SUM(${alias}.sonmiktar2) sonMiktar2`,
				`SUM(${alias}.songelecekmiktar) sonGelecekMiktar`, `SUM(${alias}.songidecekmiktar) sonGidecekMiktar`
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
				`SUM(${alias}.sonMiktar) sonMiktar`,
				`SUM(${alias}.sonMiktar2) sonMiktar2`,
				`SUM(${alias}.sonGelecekMiktar) sonGelecekMiktar`,
				`SUM(${alias}.sonGidecekMiktar) sonGidecekMiktar`
			)
			orderBy.liste = [`${alias}.yerKod`, `${alias}.stokKod`, `${alias}.sonMiktar DESC`]
		}
		sent.groupByOlustur()
	}
	keyHostVarsDuzenle({ hv }) {
		super.keyHostVarsDuzenle(...arguments)
		let { class: { keyIOAttrListe: ioKeys } } = this
		;ioKeys.forEach(k =>
			hv[k] = this[k] ?? '')
	}
	keySetValues({ rec }) {
		super.keySetValues(...arguments)
		let { class: { keyIOAttrListe: ioKeys } } = this
		;ioKeys.forEach(k =>
			this[k] = rec[k] ?? '')
	}
}
