class MQTabRota extends MQGuidVeAdiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'ROTA' } static get sinifAdi() { return 'Satış Rotası' }
	static get table() { return 'rota' } static get tableAlias() { return 'rot' }
	static get offlineDirect() { return true }
	static get offlineGonderYapilirmi() { return false }

	static async uygunRotaMusterileri(e) {
		let { plasiyerKod } = app
		let { gunKisaAdi } = today()

		let sent = new MQSent()
		let { where: wh, sahalar } = sent
		sent.fromAdd(this.table)
		if (plasiyerKod)
			wh.degerAta(plasiyerKod, 'plasiyerKod')
		;{
			let or = new MQOrClause()
			or.inDizi(['', 'HER', gunKod], 'gunKod')
			wh.add(or)
		}
		wh.add(`mustKod <> ''`)
		sahalar.add('seq', 'mustKod')

		let orderBy = ['tip', 'plasiyerKod', 'gunKod', 'ekKod', 'seq']
		let stm = new MQStm({ sent, orderBy })

		let recs = await this.sqlExecSelect(stm)
		return asSet(recs.map(_ => _.mustKod))
	}
	
	offlineBuildSQLiteQuery({ result: r = [] }) {
		super.offlineBuildSQLiteQuery(...arguments)
		r[r.length - 1] = ');'
		r.push(
			'CREATE INDEX IF NOT EXISTS idx_rota_plasGun ON rota (tip, plasiyerKod, gunKod, ekKod);',
			'CREATE UNIQUE INDEX IF NOT EXISTS idx_rota_plasGunSeq ON rota (tip, plasiyerKod, gunKod, ekKod, seq)'
		)
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		extend(pTanim, {
			plasiyerKod: new PInstStr('plasiyerKod'),
			tip: new PInstStr('tip'),
			gunKod: new PInstStr('gunKod'),
			ekKod: new PInstStr('ekKod'),
			seq: new PInstNum('seq'),
			mustKod: new PInstNum('mustKod')
		})
	}
	static orjBaslikListesi_argsDuzenle({ args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments)
		extend(args, { showGroupsHeader: true, groupsExpandedByDefault: true })
	}
	static ekCSSDuzenle({ rec, dataField: belirtec, value, result }) {
		super.ekCSSDuzenle(...arguments)
		if (asBool(rec?.gunKod == 'HER'))
			result.push('bg-lightgreen', 'herGun')
		else
			result.push('tekil')
	}
	static orjBaslikListesi_groupsDuzenle({ liste }) {
		super.orjBaslikListesi_groupsDuzenle(liste)
		liste.push('plasiyerKod', 'aciklama')
	}
	static gridVeriYuklendi({ sender: gridPart, sender: { gridWidget } }) {
		super.gridVeriYuklendi(...arguments)
		gridWidget.hidecolumn('plasiyerKod', 'aciklama')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		liste.push(
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'mustKod', text: 'Müşteri', genislikCh: 16 }).noSql(),
				new GridKolon({ belirtec: 'mustUnvan', text: 'Ünvan', sql: 'car.aciklama' }),
			),
			new GridKolon({ belirtec: 'plasiyerKod', text: 'Plasiyer', genislikCh: 13 }).noSql(),
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'gunKod', text: 'Gün', genislikCh: 8 }).noSql(),
				new GridKolon({ belirtec: 'seq', text: 'S#', genislikCh: 8 }).tipNumerik().noSql()
			)
		)
		super.orjBaslikListesiDuzenle(...arguments)
	}
	static loadServerData_queryDuzenle_son(e) {
		super.loadServerData_queryDuzenle_son(e)
		let { subeKod, plasiyerKod } = app
		let { idSaha, adiSaha } = this
		let { alias = this.tableAlias, offlineRequest, offlineMode, stm, sent } = e
		let { where: wh, sahalar } = sent, { orderBy } = stm
		sent.distinctYap()
		sahalar.addWithAlias(alias, adiSaha)
		if (offlineRequest && !offlineMode) {
			// Bilgi Yükle
			sent.innerJoin(alias, 'rotadetay har', [`${alias}.kaysayac = har.fissayac`, `har.devredisi = ''`, `har.must <> ''`])
			wh.add(`${alias}.silindi = ''`)
			wh.inDizi(['T', 'M'], `${alias}.tipkod`)
			if (subeKod != null)
				wh.degerAta(subeKod, `${alias}.bizsubekod`)
			if (plasiyerKod) {
				let or = new MQOrClause()
				;{
					let and = new MQAndClause()
					and.degerAta('T', `${alias}.tipkod`)
					and.like(`${plasiyerKod}-*`, `${alias}.kod`, true)
					or.add(and)
				}
				;{
					let and = new MQAndClause()
					and.degerAta('M', `${alias}.tipkod`)
					and.degerAta(plasiyerKod, `${alias}.musplasiyerkod`)
					// and.inDizi(['', plasiyerKod], `${alias}.musplasiyerkod`)
					or.add(and)
				}
				wh.add(or)
			}
			sahalar.addWithAlias(alias, 'kaysayac id', 'tipkod tipKod', 'kod', 'musplasiyerkod plasiyerKod')
			sahalar.addWithAlias('har', 'seq', 'must mustKod')
		}
		else {
			// Yerel
			sent.innerJoin(alias, 'carmst car', `${alias}.mustKod = car.kod`)
			sahalar.addWithAlias(alias, idSaha, 'plasiyerKod', 'gunKod', 'seq', 'mustKod')
			orderBy.liste = ['tip', 'plasiyerKod', 'gunKod', 'ekKod', 'seq']
		}
	}
	static async loadServerDataDogrudan({ offlineBuildSQLiteQuery, offlineRequest, offlineMode } = {}) {
		let e = arguments[0]
		let recs = await super.loadServerDataDogrudan(e)
		if (!offlineRequest)
			return recs
		
		recs = recs?.filter(({ plasiyerKod, gunKod, kod }) =>
			!plasiyerKod || kod)
		if (empty(recs))
			return recs
		
		for (let rec of recs) {
			let { tipKod, plasiyerKod, gunKod, kod } = rec
			tipKod ||= 'T'
			rec.id ||= newGUID()
			gunKod ||= rec.gunKod = 'HER'
			switch (tipKod) {
				case 'T': {
					let tokens = kod.split('-')
					rec.plasiyerKod = tokens[0].trimEnd()
					rec.gunKod = tokens[1]?.trimEnd() || gunKod
					break
				}
				case 'M': {
					// 'musplasiyerkod plasiyerKod' alias ile zaten gelmiş olmalı
					rec.ekKod = kod
					break
				}
			}
		}
		return recs
	}
	alternateKeyHostVarsDuzenle({ hv }) {
		super.alternateKeyHostVarsDuzenle(...arguments)
		;['plasiyerKod', 'gunKod', 'mustKod'].forEach(k =>
			hv[k] = this[k] ?? '')
	}
}
