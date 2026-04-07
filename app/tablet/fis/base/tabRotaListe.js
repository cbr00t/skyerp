class TabRotaListe extends MQMasterOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get uygunmu() { return config.dev || app.rotaKullanilirmi }
	static get araSeviyemi() { return true } static get notCacheable() { return true }
	static get kodListeTipi() { return 'ROTA' } static get sinifAdi() { return 'Rota' }
	static get table() { return 'rota' } static get tableAlias() { return 'rot' }
	// static get gridIslemTuslariKullanilirmi() { return false }
	static get kolonFiltreKullanilirmi() { return false }
	static get raporKullanilirmi() { return false }
	static get tumKolonlarGosterilirmi() { return true }
	static get noAutoFocus() { return true }

	static fisSinifFor(e) { return TabFisListe.fisSinifFor(e) }
	static detaySinifFor(e) { return TabFisListe.detaySinifFor(e) }
	static yeniInstOlustur(e) { return TabFisListe.yeniInstOlustur(e) }

	static listeEkrani_afterRun({ sender: gridPart }) {
		super.listeEkrani_afterRun(...arguments)
		let { grid } = gridPart
		gridPart.noAnimate()
		gridPart.gridGroupsChangedBlock = _e =>
			this.gridGroupsChanged({ ...e, ..._e })
	}
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e)
		MQMasterOrtak.orjBaslikListesi_argsDuzenle(e)
		let { args } = e
		extend(args, { groupsExpandedByDefault: false, enableToolTips: false })
	}
	static orjBaslikListesi_groupsDuzenle({ gridPart = e.sender, liste } = {}) {
		super.orjBaslikListesi_groupsDuzenle(...arguments)
		let { _lastGroups } = gridPart
		_lastGroups ??= ['aciklama']
		liste.push(..._lastGroups)
	}
	static ekCSSDuzenle({ dataField: belirtec, rec, result }) {
		super.ekCSSDuzenle(...arguments)
		if (belirtec == 'aciklama' || belirtec == 'durumText')
			result.push('fs-70', 'lh-13')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: '_html', text: 'Belge' }).noSql(),
			new GridKolon({ belirtec: 'islemVarmi', text: 'İşl?', genislikCh: 4 }).noSql().tipBool(),
			new GridKolon({ belirtec: 'aciklama', text: 'Rota', genislikCh: 13 }).noSql(),
			new GridKolon({ belirtec: 'durumText', text: 'Drm', genislikCh: 6 }).noSql(),
			new GridKolon({ belirtec: 'sortText' }).noSql().hidden()
		)
	}
	static async loadServerDataDogrudan(e = {}) {
		let { gridPart = e.sender, wsArgs, offlineRequest, offlineMode } = e
		let { selectedUid: _lastUid, gridWidget: w } = gridPart
		extend(gridPart, { _lastUid })

		let ignoreKeys = asSet(['durumText', 'sortText'])
		if (ignoreKeys[wsArgs?.sortdatafield])
			wsArgs.sortdatafield = null
		
		if (!offlineRequest) {
			let { cariSinif = MQTabCari } = this
			let cacheClasses = [cariSinif]
			if (await app.sqlHasTable(MQTabRota.table))
				cacheClasses.push(MQTabRota)
			await Promise.allSettled(cacheClasses.map(_ => _.getGloKod2Rec()))
		}
		
		let { plasiyerKod: buPlasiyerKod } = app
		let mustKod2HarBilgi = {}
		;{
			let { fisTipi: sutFisTipi } = TabSutAlimFis
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent.fromAdd(TabFis.table)
			wh.add(`must <> ''`, `silindi = ''`)
			sahalar.add(
				'must mustKod', 'dvkod dvKod', 'SUM(sonuc) bedel', 'COUNT(*) sayi',
				`(CASE WHEN fisTipi = ${sutFisTipi.sqlDegeri()} THEN SUM(topMiktar) ELSE 0 END) sutMiktar`
			)
			sent.groupByOlustur()
			mustKod2HarBilgi = fromEntries(
				(await sent.execSelect()).map(r => [r.mustKod, r]))
		}
		let { groups } = w
		let groupSet = asSet(groups)
		let _recs = await super.loadServerDataDogrudan(...arguments)
		let mustKod2Rec = { ilk: {}, son: {}, hepsi: {} }
		for (let rec of _recs) {
			let { mustKod } = rec
			if (mustKod2Rec[mustKod])
				continue
			let harBilgi = mustKod2HarBilgi[mustKod] ?? {}
			if (harBilgi)
				extend(rec, harBilgi)
			let { tip, sayi } = rec
			let islemVarmi = sayi > 0
			extend(rec, {
				islemVarmi,
				durumText: ( islemVarmi ? `<b class=orangered>İşlem Gören</b>` : `<b class=forestgreen>Bek.</b>` ),
			})
			rec.sortText = [
				( groupSet.durumText ? islemVarmi : null ),
				( groupSet.aciklama ? tip : null )
			].filter(Boolean).join(delimWS)
			rec._html = this.getHTML({ ...e, rec })
			// let selector = islemVarmi ? 'son' : 'ilk'
			// mustKod2Rec[selector][mustKod] = rec
			mustKod2Rec.hepsi[mustKod] = rec             // öncelik sırasız
		}
		let recs = values(mustKod2Rec.hepsi)
		recs.sort((a, b) =>
			a.sortText.localeCompare(b.sortText))
		return recs
	}
	static loadServerData_queryDuzenle({ offlineRequest, offlineMode, stm }) {
		let e = arguments[0]
		super.loadServerData_queryDuzenle(e)
		let { tableAlias: alias } = this
		let { plasiyerKod } = app
		let { gunKisaAdi: gunKod } = today()
		for (let sent of stm) {
			let { from, where: wh, sahalar, alias2Deger } = sent
			sent
				.distinctYap()
				.leftJoin(alias, 'tabfis fis', `${alias}.mustKod = fis.must`)
				.innerJoin(alias, 'carmst car', [`${alias}.mustKod = car.kod`, `car.calismadurumu <> ''`, `car.satilamazfl = ''`])
				.innerJoin('car', 'caril il', 'car.ilkod = il.kod')
			;{
				let or = new MQOrClause()
				or.inDizi(['', 'HER', gunKod], `${alias}.gunKod`)
				wh.add(or)
			}
			;{
				let or = new MQOrClause()
				or.degerAta('', `${alias}.plasiyerKod`)
				if (plasiyerKod)
					or.degerAta(plasiyerKod, `${alias}.plasiyerKod`)
				wh.add(or)
			}
			sahalar
				.addWithAlias(alias,
					'tip', 'plasiyerKod', 'gunKod', 'ekKod', 'aciklama', 'seq', 'mustKod')
				.addWithAlias('car',
					'aciklama mustUnvan', 'kontipkod konTipkod', `konsolidemusterikod ticMustKod`,
					'efaturakullanirmi eFatmi', 'oscolor', 'yore', 'ilkod ilKod'
				)
				.add(
					'il.aciklama ilAdi',
					`(CASE WHEN ${alias}.gunKod IN ('', 'HER') THEN 2 ELSE 1 END) oncelik`,
					`(CASE WHEN ${alias}.plasiyerKod IN ('', ${plasiyerKod.sqlDegeri()}) AND ${alias}.gunKod NOT IN ('', 'HER') THEN 1 else 0 END) rotaIcimi`
				)
		}
		
		let {orderBy} = stm
		orderBy.liste = orderBy.liste
			.filter(_ => !_.startsWith('_'))
			.map(v => v.toUpperCase().endsWith('DESC') ? v : `${v} DESC`)
		if (empty(orderBy.liste))
			orderBy.add('tip', 'plasiyerKod', 'ekKod', 'oncelik', 'seq')
	}
	static gridGroupsChanged(e) {
		let { gridPart = e.sender, event: { args = {} } } = e
		let type = args.type?.toLowerCase()
		if (type == 'insert' || type == 'remove') {
			clearTimeout(this._timer_groupsChanged_tazele)
			this._timer_groupsChanged_tazele = setTimeout(() => gridPart.tazele(e), 1)
		}
	}
	static async gridVeriYuklendi(e = {}) {
		super.gridVeriYuklendi(e)
		let { sender: gridPart } = e
		let { boundRecs: recs, selectedRec: rec, selectedUid, gridWidget: w } = gridPart
		// let { /*sortcolumn: sortKey,*/ groups } = w
		// gridPart._lastGroups = groups
		//if (!sortKey)
		//	w.sortby('sortText', true)
		/*;{
			let key = 'sortText'
			if (groups.includes(key))
				w.sortby(key, true)
		}*/

		setTimeout(() => {
			let { groups } = w
			try { w[groups.includes('durumText') ? 'showcolumn' : 'hidecolumn']('islemVarmi') }
			catch (ex) { }
			// gridPart.seviyeKapat()
			w.focus()
			if (!empty(recs)) {
				selectedUid ??= gridPart._lastUid ?? 0
				if (selectedUid != null) {
					w.clearselection()
					let ind = w.getrowboundindexbyid(selectedUid)
					w.selectrow(ind)
					gridPart.expandGroup(selectedUid)
					w.ensurerowvisible(ind)
				}
			}
			this.ustBilgiDuzenle(e)
		}, 10)
	}

	static rootFormBuilderDuzenle_listeEkrani({ sender: gridPart, rootBuilder: rfb }) {
		let e = arguments[0]
		super.rootFormBuilderDuzenle_listeEkrani(e)
		let { layout, header, islemTuslari } = gridPart
		rfb.addStyle(`$elementCSS .header > .islemTuslari > div #izle { margin-right: 20px }`)
		;{
			let parent = rfb.addForm('header', header)
			let ustBilgiForm = parent.addForm('ustBilgi')
				.addStyle_fullWH(null, 20)
				.addCSS('jqx-hidden')
				.addStyle(...[
					`$elementCSS { font-size: 130%; padding: 15px 5px !important; overflow-y: auto !important }
					 $elementCSS > .item { gap: 10px }
					 $elementCSS > .item > div { gap: 10px; line-height: 10px }`
				])
				.setLayout(({ builder: { id } }) =>
					$(`<div class="${id}"></div>`))
				.onAfterRun(({ builder: { rootPart: part, layout } }) => {
					part.ustBilgiForm = layout
					//this.ustBilgiDuzenle({ ...e, target })
				})
		}
	}
	static async ustBilgiDuzenle(e = {}) {
		let { gridPart = e.sender } = e
		let { target = gridPart.ustBilgiForm } = e
		let html = await this.getUstBilgiHTML({ ...e, gridPart })
		if (html?.html) {
			if (html.children().length) {
				target.removeClass('jqx-hidden basic-hidden')
				target.children().remove()
				html.appendTo(target)
			}
		}
		else if (html) {
			target.removeClass('jqx-hidden basic-hidden')
			target.html(html)
		}
	}
	static async getUstBilgiHTML(e = {}) {
		let { gridPart = e.sender } = e
		let { mustKod } = gridPart
		let { params: { yerel, tablet }, sutAlimmi } = app
		let { posta } = yerel

		let result = []
		;{
			let { aciklama } = new TabPosta(posta)
			if (aciklama) {
				result.push(
					`<div class="posta item flex-row">`,
						`<div class="etiket lightgray">Posta:</div> `,
						`<div class="bold royalblue">${aciklama}</div>`,
					`</div>`
				)
			}
		}
		result = result.filter(Boolean).join(CrLf)
		return result
	}
	
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e)
		let { parentPart: gridPart, part, liste } = e
		let solItems = [ ]
		let sagItems = [
			{
				id: 'yeni', handler: async _e => {
					_e = { ...e, ..._e }
					try { await this.yeniIstendi(_e) }
					catch (ex) { cerr(ex); throw ex }
				}
			},
			{
				id: 'izle', handler: async _e => {
					_e = { ...e, ..._e }
					try { await this.fisListesiIstendi(_e) }
					catch (ex) { cerr(ex); throw ex }
				}
			},
			{ id: 'menu', text: '...', handler: async _e => {
				_e = { ...e, ..._e }
				try {
					let args = await this.getDefaultContextMenuArgs(_e)
					if (args) {
						let { selectedRecs: recs } = gridPart
						extend(_e, { recs, ...args })
						gridPart.openContextMenu(_e)
					}
				}
				catch (ex) { cerr(ex); throw ex }
			}}
		]
		let set = part.ekSagButonIdSet ??= {}
		if (solItems.length)
			liste.push(...solItems)
		if (sagItems.length) {
			liste.unshift(...sagItems)
			extend(set, asSet(sagItems.map(_ => _.id)))
		}
	}

	static orjBaslikListesi_satirCiftTiklandi(e = {}) {
		super.orjBaslikListesi_satirCiftTiklandi(e)
		let { args } = e.event ?? {}
		let { row: rec } = args ?? {}
		rec = rec?.bounddata ?? rec
		this.yeniIstendi({ ...e, rec })
	}
	static async yeniIstendi(e = {}) {
		let { gridPart = e.parentPart ?? e.sender } = e
		let { rec = gridPart?.selectedRec } = e
		let { mustKod, rotaID, posta } = rec ?? {}
		if (!mustKod)
			return

		let { fisTipi } = TabSutAlimFis
		let args = { mustKod, rotaID, posta }
		let _e = { ...e, sender: gridPart, islem: 'yeni', fisTipi, args }
		let inst = await TabFisListe.yeniInstOlustur(_e)
		let { part } = await inst.tanimla()
		if (gridPart && part)
			part.kapaninca(() => gridPart.tazele())
	}
	static fisListesiIstendi(e = {}) {
		let { gridPart = e.parentPart ?? e.sender } = e
		let { rec = gridPart?.selectedRec } = e
		let { mustKod, rotaID, posta } = rec ?? {}
		if (!mustKod)
			return

		let args = { mustKod, rotaID, posta }
		let { part } = TabFisListe.listeEkraniAc({ args })
		if (gridPart && part)
			part.kapaninca(() => gridPart.tazele())
	}
	
	static getDefaultContextMenuItems(e) {
		return [
			...(super.getDefaultContextMenuItems(e) ?? [])
			// { id: 'musteriDurumu',  text: 'Müşteri Durumu', handler: _e => this.musteriDurumuIstendi({ ...e, ..._e }) }
		]
	}
	static getHTML({ rec = {} }) {
		let { eIslemKullanilirmi: eIslem } = app
		let { mustKod, mustUnvan, eFatmi, sutMiktar, bedel, dvKod, sayi } = rec
		let sutBrm = TabSutAlimFis.detaySinif.defaultBrm || 'LT'
		dvKod ||= 'TL'
		eIslem ??= true
		let eIslText = (
			!eIslem ? '' :
			eFatmi ? 'e-Fat' : 'e-Arş'
		)
		let eIslCSS = (
			!eIslem ? '' :
			eFatmi ? ' firebrick' : ' forestgreen'
		)

		return [
			`<div class="aligned full-width relative">`,
				`<template class="sort-data">${mustKod}|${mustUnvan}|${eIslText}</template>`,
				`<div class="sol float-left">`,
					`<span class="mustUnvan asil orangered">${mustUnvan || ''}</span>`,
					`<span class="ek-bilgi bold">${mustKod ? `(${mustKod})` : ''}</span>`,
				`</div>`,
				`<div class="sag float-right">`,
					( eIslText ? `<span class="eIslText ek-bilgi bold${eIslCSS}">${eIslText}</span>` : null ),
					( bedel ? (
						`<div class="item right">` +
							`<span class="etiket lightgray">Tic:</span> `  +
							`<span class="bedel asil bold royalblue">${bedelToString(bedel)}</span> ` +
							`<span class="ek-bilgi">${dvKod}</span>` +
						`</div>`
					) : null ),
					( sutMiktar ? (
						`<div class="item right">` +
							`<span class="etiket lightgray">SÜT:</span> `  +
							`<span class="bedel asil bold forestgreen">${numberToString(sutMiktar)}</span> ` +
							( sutBrm ? `<span class="ek-bilgi">${sutBrm}</span>` : '' ) +
						`</div>`
					) : null ),
					( sayi ? (
						`<div class="item right">` +
							`<span class="sayi asil bold forestgreen">${numberToString(sayi)}</span> ` +
							`<span class="ek-bilgi green">fiş</span>` +
						`</div>`
					): null ),
				`</div>`,
			`</div>`
		].filter(Boolean).join(CrLf)
	}
}
