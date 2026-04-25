(function() {
	let rootCls = DRapor_PratikSatis
	rootCls.Panel = class Panel extends CKodVeAdi {
		get id() { return this.kod } set id(v) { this.kod = v }
		get title() { return this.aciklama } set title(v) { this.aciklama = v }
		get length() { return len(this.id2Item) }

		constructor(e = {}) {
			super(e)
			mergeInto(e, this,
				'id', 'title', 'expanded', 'height', 'content', 'collapsedContent',
				'duzenleIlk', 'duzenleSon', 'initContentIlk', 'initContentSon',
				'sube2Recs', 'kod2SubeItem'
			)
			let { id2Item = e.items ?? e.detaylar } = e
			if (isArray(id2Item))
				id2Item = fromEntries(id2Item.map(r => [r.id, r]))
			id2Item ??= {}
			this.id2Item ??= {}
			for (let [id, item] of entries(id2Item))
				this.set(id, item)

			this.kod2SubeItem ??= {}
			this.sube2Recs ??= {}
		}

		async run() {
			let e = { ...arguments[0], panel: this }
			let { id2Item = {}, id, title = e.etiket, expanded = false } = this
			let { duzenleIlk, duzenleSon, content, collapsedContent } = this
			let { tanimPart = e.sender ?? {} } = e
			let { inst = tanimPart.inst ?? {}, acc = tanimPart.acc ?? {} } = e

			let getRFB = e.getRFB = layout => {
				return new RootFormBuilder()
					.setPart(tanimPart)
					.setLayout(layout)
					.addStyle(...[
						`$elementCSS > .formBuilder-element { margin-bottom: 530px !important; overflow-y: auto !important }
						 $elementCSS .formBuilder-element.grid-container { }`
					])
			}
			duzenleIlk?.call?.(this, e)
			acc.add({
				id, title, expanded,
				content: ({ item }) => {
					let { contentLayout: layout } = item
					let rfb = getRFB(layout)
					let func = content
					if (!isFunction(func))
						func = inst[`acc_initContent_${id}`] ?? this._initDefaultContent
					let _e = { ...e, item, layout, rfb }
					setTimeout(() => func.call(this, _e), 10)
				},
				collapsedContent: ({ sender: acc, item }) =>  {
					let { contentLayout: layout } = item
					let rfb = getRFB(layout)
					let args = { ...e, item, layout, rfb }
					let func = collapsedContent
					if (!isFunction(func))
						func = this[`acc_initCollapsedContent_${id}`] ?? this._initDefaultCollapsedContent
					return func?.call(this, args)
				}
			})
			duzenleSon?.call?.(this, e)
			return this
		}
		async tazele(e = {}) {
			for (let item of this.values())
				await item.tazele(e)
			return this
		}

		async _initDefaultContent(e) {
			let { height, initContentIlk, initContentSon } = this
			let { tanimPart = e.sender ?? {}, rfb = {} } = e
			let { acc = {} } = tanimPart

			// rfb.addStyle_fullWH()
			let form = e.form = rfb.addFormWithParent().altAlta()
				.addStyle(`$elementCSS { overflow: hidden !important }`)
			if (height === undefined || height == 'full')
				height = 'calc(var(--full) - var(--acc-header-height) - 20px)'
			form.addStyle_fullWH(null, height)
			
			await initContentIlk?.call?.(this, e)

			let altForm = form.addFormWithParent()
				.altAlta()
				.addCSS('grid-container')
			e.fbd_baslik = altForm.addBaslik()
				.setEtiket(`<b class="royalblue">TOPLAM</b>`)
			for (let item of this.values())
				await item.run({ ...e, form: altForm })

			let { dRapor: { praUzakSubeVerisi } } = app.params ?? {}
			if (praUzakSubeVerisi) {
				let noTitle = false
				for (let item of this.values()) {
					item.noTitle = noTitle
					await item.initContent_subeYapilar({ ...e, form: altForm, noTitle })
					noTitle = true
				}
			}
			
			await initContentSon?.call?.(this, e)
			rfb.run()
			return this
		}
		_initDefaultCollapsedContent(e = {}) {
			let { dbListe } = app
			let { tanimPart = {}, layout, rfb = {}, item = {}, islem } = e
			let { inst = {}, acc = tanimPart.acc, id2SubeResult = {} } = tanimPart
			let { secimler = {} } = inst
			let { id, collapsed = {} } = item ?? {}
			let { sonTS, success, error } = id2SubeResult[id] ?? {}
	
			let container = $(`<div/>`)
			//let parent = $(`<div class="flex-row"/>`)
			if ((secimler && !collapsed) || sonTS || !empty(success)) {
				let parent = $(`<div class="parent flex-row full-height" style="gap: 10px"/>`)
				if (sonTS) {
					$(
						`<div class="sonTS fs-90">` + 
							`<span class="etiket lightgray">Son: </span>` +
							`<b class="royalblue">${timeToString(sonTS)}</b>` +
							`</div>`
					).appendTo(parent)
				}
				if (!empty(success)) {
					let liste = values(success)?.map(_ => _.aciklama) ?? []
					$(`<div class="subeler success fs-90">Gelen: [ <b class="forestgreen">${liste.join(', ') ?? ''}</b> ]</div>`)
						.appendTo(parent)
				}
	
				if (secimler && !collapsed) {
					let e = { liste: [] }
					for (let [k, s] of secimler) {
						if (k != 'tarihAralik')        // 'donem' ozetBilgi gösteriminde zaten gerekirse tarihAralık bilgisi de var)
							s.ozetBilgiHTMLOlustur(e)
					}
					let ozetBilgiHTML = e.liste?.filter(x => !!x).join(' ')
					if (ozetBilgiHTML) {
						let elmSecimBilgi = $(`<div class="absolute parent secimBilgi" style="top: -5px; right: 0; margin: 0"/>`)
						$(ozetBilgiHTML).appendTo(elmSecimBilgi)
						elmSecimBilgi.appendTo(parent)
					}
				}
				
				if (!empty(parent.children()))
					parent.appendTo(container)
			}
			
			if (!empty(error)) {
				let liste = values(error)?.map(_ => _.aciklama) ?? []
				$(`<div class="subeler error fs-90"><u class="orangered"><b>HATALI</b>:</u> [ <b class="firebrick">${liste.join(', ') ?? ''}</b> ]</div>`)
					.appendTo(container)
			}
			
			return container
		}

		add(...items) {
			;items.forEach(v =>
				this.set(null, v))
			return this
		}
		get(idOrItem) {
			id = idOrItem?.id ?? idOrItem
			return this.id2Item[id]
		}
		set(id, idOrItem) {
			if (idOrItem == null)
				return this.delete(id)
			
			id ??= idOrItem.id ?? newGUID()
			idOrItem.id ??= id
			this.id2Item[id] = idOrItem
			return this
		}
		delete(idOrItem) {
			let { id2Item: d } = this
			id ??= idOrItem?.id
			if (id == null)
				return undefined
			let v = d[id]
			delete d[id]
			return v
		}
		clear() {
			this.id2Item = {}
			return this
		}
		keys() { return keys(this.id2Item) }
		values() { return values(this.id2Item) }
		entries() { return entries(this.id2Item) }
		*[Symbol.iterator]() {
			for (let entry of entries(this.id2Item))
				yield entry
		}

		setId(v) { this.id = v; return this }
		setTitle(v) { this.title = v; return this }
		setExpanded() { this.expanded = true; return this }
		setCollapsed() { this.expanded = false; return this }
		setContent(v) { this.content = v; return this }
		setCollapsedContent(v) { this.collapsedContent = v; return this }
		duzenleIlkIslemi(v) { this.duzenleIlk = v; return this }
		duzenleSonIslemi(v) { this.duzenleSon = v; return this }
		initContentIlkIslemi(v) { this.initContentIlk = v; return this }
		initContentSonIslemi(v) { this.initContentSon = v; return this }
		setHeight(v) { this.height = v; return this }
		fullHeight() { return this.setHeight('full') }
	}

	rootCls.PanelDetay = class PanelDetay extends CKodVeAdi {
		get id() { return this.kod } set id(v) { this.kod = v }
		get title() { return this.aciklama } set title(v) { this.aciklama = v }
		
		constructor(e = {}) {
			super(e)
			mergeInto(e, this,
				'id', 'title', 'userData',
				'width', 'height', 'widgetArgsDuzenle')
		}
		async run() { return this }
		async tazele(e) { return this }

		setId(v) { this.id = v; return this }
		setTitle(v) { this.title = v; return this }
		setUserData(v) { this.userData = v; return this }
		setWidth(v) { this.width = v; return this }
		setHeight(v) { this.height = v; return this }
		fullWidth() { return this.setWidth(null) }
		fullHeight() { return this.setHeight('full') }
		fullWH() { return this.fullWidth().fullHeight() }
		widgetArgsDuzenleIslemi(v) { this.widgetArgsDuzenle = v; return this }
	}

	rootCls.PanelGrid = class PanelGrid extends rootCls.PanelDetay {
		static get deepCopyAlinmayacaklar() {
			return [
				...super.deepCopyAlinmayacaklar,
				'builder', '_builder',
				'subeKod', 'kod2SubeItem', 'sube2Recs'
			]
		}
		static get timeout() { return DRapor_PratikSatis.timeout }
		get subemi() { return this.subeKod != null }

		constructor(e = {}) {
			super(e)
			mergeInto(e, this,
				'subeKod', 'sube2Recs', 'toplamBelirtec', 'cssDuzenle', 'tabloKolonlari')
			;['source', 'query'].forEach(k => {
				let v = e[k]
				v = getFunc(v)
				if (isFunction(v))
					e[k] = v
					// e[k] = v.bind(this)
			})
		}
		async run(e = {}) {
			await super.run(e)
			let { id, userData, widgetArgsDuzenle, subemi, subeKod } = this
			let { toplamBelirtec, width, height, noTitle } = this
			let { cssDuzenle, tabloKolonlari, source, query } = this
			let { tanimPart = e.sender, rfb, form } = e
			let gridId = [id, subeKod]
				.filter(Boolean)
				.join('_')

			width ||= '97%'
			
			let cellClassName = (...rest) => {
				let result = this.class.gridCSSHandler(...rest) ?? []
				cssDuzenle?.call(this, { ...e, ...rest, result })
				return result
			}
			if (!noTitle) {
				form.addForm('empty')
					.addStyle(`$elementCSS { border-top: 1px solid firebrick; margin: -5px 0 5px 0 !important; padding: 3px 50px !important }`)
					.addStyle_fullWH(null, 30)
					.addCSS('relative', 'jqx-hidden')
					.setLayout(() => $(`<div class="empty fs-100 orangered">Bu şube için veri alınamadı</div>`))
			}

			height = height == 'full' ? undefined : height ?? null
			let fbd_grid = this.builder = form.addGridliGosterici(gridId)
				.addStyle_fullWH(width, height)
				.noAnimate().setUserData(userData)
				.rowNumberOlmasin().notAdaptive()
				.setToplamYapi({ etiket: { belirtec: toplamBelirtec } })
				.widgetArgsDuzenleIslemi(_e => {
					let { args } = _e
					_e = { ...e, ..._e, args }
					extend(args, this.getGridOrtakArgs(_e))
					widgetArgsDuzenle?.call(this, _e)
				})
				.setTabloKolonlari(_e => {
					_e = { ...e, ..._e }
					let defs = getFuncValue.call(this, tabloKolonlari, _e)
						?.filter(Boolean) ?? []
					;defs.forEach(def =>
						def.cellClassName ??= cellClassName)
					return defs
				})
				.setSource(async _e => {
					let fbd = _e.builder ?? fbd_grid ?? {}
					let { parent, layout, input: grid } = fbd
					let { noTitle, sube2Recs = {} } = this
					_e = { ...e, ..._e }
					let recs
					if (subemi) {
						await tanimPart?._promise_getSubeTanimlari
						recs = sube2Recs[subeKod]

						// TEST //
						//recs = sube2Recs[subeKod] ??= [
						//	{ subeKod, kod: 0, aciklama: 'TEST', bedel: 0, oncelik: 0 }
						//]
						// **** //
						
						let uygunmu = recs != null
						layout?.[uygunmu && !noTitle ? 'removeClass' : 'addClass']('jqx-hidden')
						parent?.find('.empty')?.[uygunmu ? 'addClass' : 'removeClass']('jqx-hidden')
						// parent?.[uygunmu ? 'removeClass' : 'addClass']('jqx-hidden')
					}
					else {
						parent?.find('.empty')?.addClass('jqx-hidden')
						recs = await getFuncValue.call(this, source, _e)
						if (recs == null) {
							let stm = await getFuncValue.call(this, query, _e)
							recs = await this.getGridData({ ..._e, query: stm })
						}
						setTimeout(async () => {
							let subeGridParts = arrayFrom(
								( layout
									?.parents(':not(.grid-container):eq(0)')
									?.find('.grid-container.sube .jqx-grid')
								) ?? []
							).map(_ => $(_).data('part'))
							.filter(Boolean)
							;subeGridParts.forEach(p =>
								p.tazele(_e))
						}, 5)
					}

					return recs ?? []
				})
				.veriYukleninceIslemi(async _e => {
					let { subemi } = this
					let fbd = _e.builder ?? fbd_grid ?? {}
					let { parent, layout, input: grid, part: gridPart } = fbd
					let { gridWidget: w, boundRecs: { length } } = gridPart
					if (!gridPart._tazeleYapildimi) {
						setTimeout(() => {
							let { length } = gridPart.boundRecs
							parent.height(80 + (length * w.rowsheight) + 1)
							parent.width(parent.width() + 1)
							parent.width(parent.width() - 1)
							w.refresh()
							/*gridPart._tazeleYapildimi = true
							gridPart.tazele()*/
						}, 10)
					}
					setTimeout(() => {
						// let parentParent = parent.parent()
						let { length } = gridPart.boundRecs
						parent.height(80 + (length * w.rowsheight) + 1)
						parent.width(parent.width() + 1)
						parent.width(parent.width() - 1)
					})
				})
				.onAfterRun(({ builder: { part: gridPart } }) => {
					let { grid, gridWidget } = gridPart
					extend(this, { gridPart, grid, gridWidget })
				})
			
			return fbd_grid
		}
		async initContent_subeYapilar(e) {
			let { noTitle } = this
			let { tanimPart = e.sender ?? {}, form } = e
			let { inst = tanimPart.inst ?? {} } = e
			await tanimPart?._promise_getSubeTanimlari
			let db2Kod2Def = await inst.getSubeTanimlari?.(...arguments)
			if (empty(db2Kod2Def))
				return false

			let sube2Recs = this.sube2Recs ??= {}
			let kod2SubeItem = this.kod2SubeItem ??= {}
			for (let [db, kod2Def] of entries(db2Kod2Def))
			for (let [subeKod, def] of entries(kod2Def)) {
				if (kod2SubeItem[subeKod])
					continue
				let subeText = def.aciklama || def.kod
				let altForm = form.addFormWithParent()
					.altAlta()
					.addCSS('grid-container', 'sube')
				if (!noTitle) {
					altForm.addBaslik()
						.setEtiket(`<b class="forestgreen" style="padding-left: 13px">${subeText}</b>`)
				}
				let subeItem = kod2SubeItem[subeKod] = this.shallowCopy()
				deleteKeys(subeItem, 'builder', '_builder', 'gridPart', 'grid', 'gridWidget')
				extend(subeItem, { subeKod, sube2Recs })    // !! sube2Recs ==> ref. link
				await subeItem.run({ ...e, form: altForm })
			}
			return true
		}
		async tazele(e) {
			await super.tazele(e)
			if (!this.subemi) {
				let { sube2Recs: d = {} } = this    // ** sube2Recs, subeItemlar için aynı referansı paylaşıyor
				;keys(d).forEach(k =>
					delete d[k])
			}
			await this.gridPart?.tazele(e)
			return this
		}

		getGridOrtakArgs() {
			return {
				rowsHeight: 26, columnsMenu: false, showGroupsHeader: true,
				columnsReorder: false, selectionMode: 'multiplerowsextended',
				// autoShowLoadElement: false,
				autoShowLoadElement: !this.subemi,
				groupsRenderer: (text, group, expanded, groupInfo) => {
					let { subItems = [] } = groupInfo ?? {}
					subItems = subItems?.filter(r => !r.totalsrow)
					let topBedel = topla(r => r.hasilat ?? r.bedel, subItems)
					return (
						`<div class="grid-cell-group full-wh relative">` +
							`<div class="aciklama float-left">${group}</div>` +
							`<div class="bedel fs-100 bold royalblue float-right" style="margin-right: 23px">${bedelToString(topBedel)}</div>` +
						`</div>`
					)
				}
			}
		}
		static gridCSSHandler(sender, rowIndex, belirtec, value, rec, prefix) {
			let result = [belirtec]
			if (rec._toplam)
				result.push('_toplam')
			return result.join(' ')
		}
		async getGridData(e = {}) {
			let { buDB, dbListe } = app
			let { DefaultWSHostName_SkyServer: defHost } = config.class
			let { tanimPart = {}, builder: fbd = {}, query, params } = e
			let { id: gridId, grid, gridPart = this.gridPart ?? {}, class: { timeout } } = this
			let { inst = tanimPart.inst ?? {}, acc = tanimPart.acc ?? {} } = e
			let { tabloKolonlari = fbd.tabloKolonlari ?? gridPart.tabloKolonlari } = e
			let { layout: rootLayout } = tanimPart
			let panelId = grid?.parents('.accordion.item').data('id')
			let { id2Panel = {} } = acc
			let accItem = id2Panel[panelId] ?? {}
			let { layout: panelLayout } = accItem ?? {}
			let { sube2Recs } = this

			//if (accItem)
			//	accItem.userData ??= {}

			let id2SubeResult = tanimPart.id2SubeResult ??= {}
			let subeResult = id2SubeResult[panelId] ??= {}
			;['success', 'error'].forEach(k =>
				subeResult[k] = {})
	
			clearTimeout(tanimPart._timer_tazeleIndicatorClear)
			rootLayout?.addClass('refreshing')
			panelLayout?.removeClass('has-error')
			try {
				if (query?.sentDo) {
					let e = { ...arguments[0], stm: query }
					delete e.query
					inst.stmSonIslemler?.(e)
					query = e.query = e.stm
					params = e.params = e.params
				}
		
				await tanimPart?._promise_getSubeTanimlari
				let { praUzakSubeVerisi } = app.params?.dRapor ?? {}
				if (!praUzakSubeVerisi)
					return await query?.execSelect({ timeout, params }) ?? []
		
				let db2Kod2Def = await inst.getSubeTanimlari?.(...arguments)
				if (empty(db2Kod2Def))
					return await query?.execSelect({ timeout, params }) ?? []
		
				let { keyFields, sortFields, noSort } = fbd.userData ?? {}
				let cd = { sabit: {}, toplam: {} }
				;{
					if (tabloKolonlari) {
						;tabloKolonlari.forEach(c => {
							let { belirtec, aggregates } = c
							let agg = makeArray(aggregates)
							let selector = agg?.includes('sum') ? 'toplam' : 'sabit'
							cd[selector][belirtec] = c
						})
					}
				}
				
				tanimPart._promise_getGridData = defer()
				try {
					;{
						let { _promises_uzakVeri: promises } = tanimPart
						if (!empty(promises))
							await delay(5_000)
					}
					/*;{
						let { _promises_uzakVeri: promises } = tanimPart
						;promises?.flat?.()?.forEach(p =>
							p?.abort?.())
						lastAjaxObj?.abort?.()
						delete tanimPart._promises_uzakVeri
					}*/
			
					if (query?.sentDo) {
						for (let { where: wh } of query) {
							;wh.liste = wh.liste.filter(v =>
								!( v?.startsWith?.('sub.') || v?.saha?.endsWith?.('bizsubekod')) )
						}
					}
					
					let delayMS = 100
					let promises = []
					let _promises_uzakVeri = tanimPart._promises_uzakVeri = []
					for (let [db, kod2Def] of entries(db2Kod2Def))
					for (let [subeKod, def] of entries(kod2Def)) {
						let pr = (async () => {
							if (delayMS)
								await delay(delayMS)
							delayMS *= 2.5
							try {
								let _pr = remoteProc({
									...def,
									proc: () =>
										query.execSelect({ timeout, params })
								})
								_promises_uzakVeri.push(_pr)
								
								let { aciklama: subeAdi, port, db } = def
								let recs = await _pr
								;recs?.forEach(r => {
									if (r.subeKod !== undefined)
										extend(r, { subeKod, subeAdi })
								})
								subeResult.success[subeKod] ??= def
								
								/*if (config.dev) {
									console.group(`${port}: ${db}`)
									console.table(recs)
									console.info(query?.getQueryYapi() ?? query)
									console.groupEnd()
								}*/
								
								return { def, recs }
							}
							catch (error) {
								subeResult.error[subeKod] ??= def
								throw { def, error }
							}
						})()
						;promises.push(pr)
					}
		
					let getKey = (r, keyFields, sortFields) => {
						if (keyFields)
							keyFields = makeArray(keyFields)
						if (sortFields)
							sortFields = makeArray(sortFields)
						
						if (empty(keyFields))
							keyFields = sortFields
						if (empty(keyFields))
							keyFields = keys(cd.sabit)
						
						return keyFields
							.map(k => String(r[k]))
							.join('\t')
					}
					let all = ( await promiseAllSet(promises) )
					subeResult.sonTS = now()                           // bu panel item için son veri çekme zamanı
	
					let key2Rec = new Map()
					let errors = tanimPart._errors ??= []
					for (let { status: s, reason, value: result } of all) {
						if (s == 'rejected') {
							let { def = {}, error: err } = reason
							let { https, host, port, url, sql, db = {} } = def
							db ??= sql?.db
							url ??= `${https ? 'https' : 'http'}://${host}:${port}`
							let origin = !host || host == defHost ? String(port) : `${host}:${port}`
							let title = `${origin} | ${db}`
							let content = getErrorText(err, url)
							errors.push({ title, content, err })
							continue
						}
	
						let { recs, def } = result
						if (empty(recs))
							continue

						let { kod: subeKod } = def ?? {}
						sube2Recs[subeKod] = extend(true, [], recs)    // bu grid, bu şube için orj recs (deepCopy)
						;recs.forEach(bu => {
							let k = getKey(bu, keyFields)
							if (!key2Rec.has(k))
								key2Rec.set(k, bu)
							else {
								let diger = key2Rec.get(k)
								;keys(cd.toplam).forEach(b =>
									diger[b] = Number(diger[b]) + Number(bu[b]))
							}
						})
					}
					delete tanimPart._promises_uzakVeri
		
					let recs = arrayFrom(key2Rec.values())
					if (!noSort) {
						recs.sort((a, b) =>
							getKey(a, keyFields, sortFields).localeCompare(
								getKey(b, keyFields, sortFields))
						)
					}
	
					let e = { ...arguments[0], subeResult, recs }
					setTimeout(() => {
						acc.render?.()
						;{
							let hasErr = !empty(errors)
							let { layout } = acc.activePanel?.item ?? {}
							setTimeout(() =>
								layout?.[hasErr ? 'addClass' : 'removeClass']('has-error'),
								10)
						}
					}, 50)
					return recs
				}
				finally { tanimPart._promise_getGridData?.resolve() }
			}
			finally {
				tanimPart._timer_tazeleIndicatorClear = setTimeout(() =>
					rootLayout?.removeClass('refreshing'), 50)
			}
		}

		setToplamBelirtec(v) { this.toplamBelirtec = v; return this }
		cssDuzenleIslemi(v) { this.cssDuzenle = v; return this }
		setTabloKolonlari(v) { this.tabloKolonlari = v; return this }
		setSource(v) { this.source = v; return this }
		setQuery(v) { this.query = v; return this }
	}
})()
