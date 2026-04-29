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
				'sube2Recs', 'kod2SubeItem', 'subesizmi'
			)
			let { id2Item = e.items ?? e.detaylar } = e
			if (isArray(id2Item))
				id2Item = fromEntries(id2Item.map(r => [r.id, r]))
			id2Item ??= {}
			this.id2Item ??= {}
			for (let [id, item] of entries(id2Item))
				this.set(id, item)

			this.kod2SubeItem ??= {}
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
						`$elementCSS > .formBuilder-element:not(.full) { overflow-y: auto !important }
						 $elementCSS .formBuilder-element.grid-container {}`
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
			let { height, initContentIlk, initContentSon, subesizmi } = this
			let { tanimPart = e.sender ?? {}, rfb = {} } = e
			let { acc = {}, item, inst = {} } = tanimPart
			let { contentLayout } = item ?? {}

			// rfb.addStyle_fullWH()
			// makeScrollable(contentLayout)
			let form = e.form = rfb.addFormWithParent().altAlta()
				.addStyle(
					`$elementCSS { overflow: hidden !important }
					 $elementCSS:not(.full) > div:last-child { margin-bottom: 300px !important }
					 $elementCSS .formBuilder-element.baslik {
						 box-shadow: 0 0 3px 0 #ccc;
						 width: calc(var(--full) - 20px);
						 padding-left: 20px; cursor: pointer;
						 transition: 200ms ease
					 }
					 $elementCSS .formBuilder-element.baslik:hover { box-shadow: 0 0 3px 0 cadetblue }
					 $elementCSS .formBuilder-element.baslik:active { box-shadow: 0 0 5px 0 royalblue }
					 $elementCSS .formBuilder-element.baslik.empty > div > * { color: lightgray !important }
					 $elementCSS .formBuilder-element.grid-container { transition: 300ms ease }`
				)
				//.onAfterRun(({ builder: { layout }}) =>
					//makeScrollable(layout))
			
			if (height === undefined || height == 'full')
				height = 'calc(var(--full) - (var(--acc-header-height) + 20px))'
			
			form.addStyle_fullWH(null, height)
			form.onAfterRun(({ builder: { layout } }) => {
				setTimeout(() => {
					let elms = layout.find('.formBuilder-element.baslik')
					elms.on('click', ({ currentTarget: target }) => {
						let next = $(target).next()
						for (let i = 0; i < this.length; i++) {
							next.toggleClass('jqx-hidden collapsed')
							let tmp = next.next()
							next = tmp?.length ? tmp : next.parent().next()
						}
					})
				}, 100)
			})

			let { dRapor: { praUzakSubeVerisi } } = app.params ?? {}
			e.gridId2InitSubeSet = {}
			await initContentIlk?.call?.(this, e)

			let altForm = form.addFormWithParent().altAlta()
				.addCSS('grid-container')
				.addStyle_fullWH()
				//.addStyle_wh('auto', 'calc(var(--full) - 100px)')
			e.fbd_baslik = altForm.addBaslik()
				.addCSS('baslik')
				.setEtiket(`<b class="royalblue">TOPLAM</b>`)
			for (let item of this.values()) {
				// item.subesizmi = subesizmi
				await item.run({
					...e,
					parentForm: form, form: altForm
				})
			}

			if (praUzakSubeVerisi) {
				await tanimPart?._promise_getSubeTanimlari
				let db2Kod2Def = await inst.getSubeTanimlari?.(...arguments) ?? {}
				for (let [db, kod2Def] of entries(db2Kod2Def))
				for (let [subeKod, def] of entries(kod2Def)) {
					let noTitle = false
					for (let item of this.values()) {
						if (item.subemi)
							continue
						item.noTitle = noTitle
						item.sube2Recs ??= {}
						if (!subesizmi)
							await item.initContent_subeYapilar({
								...e,
								parentForm: form, form: altForm,
								noTitle, subeKod, def
							})
						noTitle = true
					}
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
		subesiz() { this.subesizmi = true; return this }
		subeli() { this.subesizmi = false; return this }
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
		fullWidth() { return this.setWidth('full') }
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
		static get defGridWidth() { return 430 }
		get subemi() { return this.subeKod != null }

		constructor(e = {}) {
			super(e)
			mergeInto(e, this,
				'subeKod', 'sube2Recs', 'toplamBelirtec')
			;['cssDuzenle', 'tabloKolonlari', 'source', 'query', 'recsDuzenle', 'veriYuklenince'].forEach(k => {
				let v = e[k]
				if (isString(v))
					v = getFunc(v)
				if (v != null)
					this[k] = v
					// this[k] = v.bind(this)
			})
		}
		async run(e = {}) {
			await super.run(e)
			let { id, userData, widgetArgsDuzenle, subemi, subeKod } = this
			let { toplamBelirtec, width, height, noTitle } = this
			let { cssDuzenle, tabloKolonlari, source, query, recsDuzenle, veriYuklenince } = this
			let { defGridWidth } = this.class
			let { tanimPart = e.sender, rfb, parentForm, form, panelIciTekrarmi } = e
			let gridId = [id, subeKod].filter(Boolean).join('_')

			let cellClassName = (...rest) => {
				let result = this.class.gridCSSHandler(...rest) ?? []
				cssDuzenle?.call(this, { ...e, ...rest, result })
				return result
			}

			if (height == 'full')
				parentForm.addCSS('full')
			
			// width ||= 'calc(var(--full) - 30px)'
			// height = height == 'full' ? undefined : height ?? undefined
			width = width == 'full' ? 'var(--full)' : width || min(defGridWidth, $(window).width() - 50)
			height = height == 'full' ? 'calc(var(--full) - 60px)' : height ?? null
			let parent = form.addFormWithParent()
				.addStyle_wh(width, height)
			parent.addStyle(`$elementCSS { border-top: 1px solid #ccc }`)
			if (!(noTitle || panelIciTekrarmi)) {
				parent.addForm('empty')
					.addStyle(`$elementCSS { border-top: 0px solid firebrick; margin: 5px 0 30px 0 !important; padding: 3px 50px !important }`)
					.addStyle_wh('auto', 5)
					.addCSS('jqx-hidden')
					.setLayout(() => $(`<div class="empty fs-100 orangered">Bu şube için veri alınamadı</div>`))
			}
			let fbd_grid = this.builder = parent.addGridliGosterici(gridId)
				.addStyle_fullWH()
				.addStyle(`$elementCSS { padding-left: 10px }`)
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
					defs = defs?.filter?.(Boolean) ?? defs ?? []
					;defs.forEach(def =>
						def.cellClassName ??= cellClassName)
					return defs
				})
				.setSource(async _e => {
					let fbd = _e.builder ?? fbd_grid ?? {}
					let { parent, layout, part: gridPart, input: grid } = fbd
					let { noTitle, subeKod, sube2Recs } = this
					let parentParent = parent.parent()
					_e = { ...e, ..._e, panelDetay: this }
					let recs
					if (subemi) {
						await tanimPart?._promise_getSubeTanimlari
						await tanimPart._promise_getGridData
						recs = sube2Recs[subeKod]
						//delete sube2Recs[subeKod]
						//if (recs)
						//	recs = extend(true, [], recs)

						// TEST //
						//recs = sube2Recs[subeKod] ??= [
						//	{ subeKod, kod: 0, aciklama: 'TEST', bedel: 0, oncelik: 0 }
						//]
						// **** //

						let uygunmu = recs != null
						//if (!parent.hasClass('collapsed'))
						grid?.[uygunmu ? 'removeClass' : 'addClass']('jqx-hidden')
						parent?.find('.empty')?.[uygunmu ? 'addClass' : 'removeClass']('jqx-hidden')
						parent?.prev('.baslik')?.[uygunmu ? 'removeClass' : 'addClass']('empty')
					}
					else {
						// parent?.find('.empty')?.addClass('jqx-hidden')
						recs = await getFuncValue.call(this, source, _e)
						if (recs == null) {
							let stm = await getFuncValue.call(this, query, _e)
							recs = await this.getGridData({ ..._e, query: stm })
						}
					}

					if (recs != null) {
						let result = await recsDuzenle?.call?.(this, { ..._e, tanimPart, gridPart, recs, subemi, subeKod, sube2Recs })
						if (result !== undefined)
							recs = result
					}

					return recs ?? []
				})
				.veriYukleninceIslemi(async _e => {
					let { subemi, subeKod, sube2Recs } = this
					let { sender: gridPart } = _e
					let { grid, gridWidget: w } = gridPart
					let parent = grid.parent()
					let parentParent = parent.parent()
					let { boundRecs: recs, boundRecs: { length } } = gridPart
					//if (subemi)
					//	debugger

					await veriYuklenince?.call(this, { ...e, ..._e, tanimPart, gridPart, recs, subemi, subeKod, sube2Recs })
					
					let wait = 0, waitArtis = 10
					let autoResize = () => {
						setTimeout(() => {
							let { height } = this
							let fullHeight = height == 'full'
							if (fullHeight) {
								;[parent, parentParent].forEach(elm =>
									elm.addClass('full-height'))
							}
							let { length } = gridPart.boundRecs
							grid.jqxGrid('height', fullHeight ? '100%' : max(80, 45 + (length * w.rowsheight)))
							//let width = elm.width()
							//elm.width(width - 2)
							//elm.width(width)
							w.refresh()
						}, wait)
						wait += waitArtis
					}
					let autoResizeCount = 1
					//if (!gridPart._tazeleYapildimi)
					//	autoResizeCount++
					for (let i = 0; i < autoResizeCount; i++)
						autoResize()
					gridPart._tazeleYapildimi = true
					
					if (!subemi) {
						let { kod2SubeItem } = this
						;values(kod2SubeItem ?? []).forEach(_ =>
							_.tazele())
					}
				})
				.onAfterRun(({ builder: { part: gridPart } }) => {
					let { grid, gridWidget } = gridPart
					extend(this, { gridPart, grid, gridWidget })
				})
			
			return fbd_grid
		}
		async initContent_subeYapilar(e) {
			let { id: gridId, noTitle, sube2Recs } = this
			let { tanimPart = e.sender ?? {}, form, gridId2InitSubeSet = {} } = e
			let { inst = tanimPart.inst ?? {}, def = {} } = e
			let { subeKod = def.kod } = e

			let kod2SubeItem = this.kod2SubeItem ??= {}
			let initSubeSet = gridId2InitSubeSet[''] ??= new Set()
			// let initSubeSet = gridId2InitSubeSet[gridId] ??= new Set()
			if (this.subemi || kod2SubeItem[subeKod])
				return false

			let panelIciTekrarmi = initSubeSet?.has(subeKod)
			noTitle = this.noTitle ||= panelIciTekrarmi
			let subeText = def.aciklama || def.kod
			let altForm = form.addFormWithParent()
				.altAlta()
				.addCSS('grid-container', 'sube')
				.addStyle_wh('auto', 'auto')
				.addStyle(`$elementCSS { padding-left: 20px }`)
			
			if (!(noTitle || panelIciTekrarmi)) {
				altForm.addBaslik()
					.addCSS('baslik')
					.setEtiket(`<b class="forestgreen">${subeText}</b>`)
			}
			
			let subeItem = kod2SubeItem[subeKod] = new this.class(this)
			deleteKeys(subeItem, 'builder', '_builder', 'gridPart', 'grid', 'gridWidget', 'kod2SubeItem')
			extend(subeItem, { subeKod, sube2Recs })    // !! sube2Recs ==> ref. link
			;['cssDuzenle', 'tabloKolonlari', 'source', 'query', 'recsDuzenle', 'veriYuklenince', 'userData'].forEach(k => {
				let v = this[k]
				if (v != null && !isFunction(v)) {
					v = isArray(v)
						? v.map(_ => _.deepCopy?.() ?? extend(true, {}, _))
						: v.deepCopy?.() ?? extend(true, {}, v)
				}
				subeItem[k] = v
			})
			await subeItem.run({ ...e, parentForm: form, form: altForm, panelIciTekrarmi })
			
			initSubeSet?.add(subeKod)
			return true
		}

		async tazele(e) {
			await super.tazele(e)
			if (!this.subemi) {
				/*let { sube2Recs: d = {} } = this    // ** sube2Recs, subeItemlar için aynı referansı paylaşıyor
				;keys(d).forEach(k =>
					delete d[k])*/
			}
			await this.gridPart?.tazele(e)
			return this
		}

		getGridOrtakArgs() {
			return {
				rowsHeight: 26, columnsMenu: false, showGroupsHeader: false,
				columnsReorder: false, selectionMode: 'multiplerowsextended',
				autoShowLoadElement: false,
				// autoShowLoadElement: !this.subemi,
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
				if (!praUzakSubeVerisi || this.subesizmi)
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
							await delay(2_000)
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
					
					let delayMS = 5
					let promises = []
					let _promises_uzakVeri = tanimPart._promises_uzakVeri = []
					for (let [db, kod2Def] of entries(db2Kod2Def))
					for (let [subeKod, def] of entries(kod2Def)) {
						let pr = promise(async (resolve, fail) => {
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
								if (sube2Recs)
									sube2Recs[subeKod] = [ ...recs.map(r => ({ ...r })) ]
								subeResult.success[subeKod] ??= def
								
								/*if (config.dev) {
									console.group(`${port}: ${db}`)
									console.table(recs)
									console.info(query?.getQueryYapi() ?? query)
									console.groupEnd()
								}*/
								
								resolve({ def, recs })
							}
							catch (error) {
								subeResult.error[subeKod] ??= def
								cerr(getErrorText(error))
								fail({ def, error })
							}
						})
						;promises.push(pr)
						await delay(delayMS)
						delayMS *= 2.5
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
		recsDuzenleIslemi(v) { this.recsDuzenle = v; return this }
		veriYukleninceIslemi(v) { this.veriYuklenince = v; return this }
	}
})()
