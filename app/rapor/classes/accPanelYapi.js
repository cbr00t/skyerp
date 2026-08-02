class AccPanel extends CKodVeAdi {
	get id() { return this.kod } set id(v) { this.kod = v }
	get title() { return this.aciklama } set title(v) { this.aciklama = v }
	get length() { return len(this.id2Item) }

	constructor(e = {}) {
		super(e)
		mergeInto(e, this,
			'id', 'title', 'expanded', 'height', 'content', 'collapsedContent',
			'duzenleIlk', 'duzenleSon', 'initContentIlk', 'initContentSon'
		)
		let { id2Item = e.items ?? e.detaylar } = e
		if (isArray(id2Item))
			id2Item = fromEntries(id2Item.map(r => [r.id, r]))
		
		this.kod2SubeItem ??= {}
		this.id2Item = id2Item ??= {}
		for (let [id, item] of entries(id2Item))
			this.set(id, item)
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
					 $elementCSS .formBuilder-element.grid-container { }`
				])
		}
		await duzenleIlk?.call?.(this, e)
		acc.add({
			id, title, expanded,
			content: ({ item }) => {
				let { contentLayout: layout } = item
				let rfb = getRFB(layout)
				let func = content
				if (!isFunction(func))
					func = inst[`acc_initContent_${id}`] ?? this._initDefaultContent
				let _e = { ...e, item, layout, rfb }
				delay(10).then(() =>
					func.call(this, _e))
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
		await duzenleSon?.call?.(this, e)
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
		let { acc = {}, item, inst = {} } = tanimPart
		let { contentLayout } = item ?? {}

		if (height === undefined || height == 'full')
			height = 'calc(var(--full) - (var(--acc-header-height) + 20px))'
		
		// rfb.addStyle_fullWH()
		// makeScrollable(contentLayout)
		rfb.addStyle(
			`$elementCSS, $elementCSS .formBuilder-element {
				margin: 0 !important; padding: 0 !important
			}`
		)
		
		let form = e.form = rfb.addFormWithParent().altAlta()
			.addStyle_fullWH(null, height)
			.addStyle(
				`$elementCSS { /* overflow: hidden !important */ transition: 200ms ease }
				 .accordion.part.fullScreen $elementCSS { height: var(--full) !important }
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
				 $elementCSS .formBuilder-element.grid-container { }

				 $elementCSS :has(.fullScreen) > div { box-shadow: 1px 1px 3px 1px darkblue !important }
				 $elementCSS :has(.fullScreen) > :not(.fullScreen) {
					 /*filter: blur(10px) !important;*/
					 display: none !important
				 }
				 $elementCSS .fullScreen { width: var(--full) !important; transition: 100ms ease-out }
				 `
			)
			//.onAfterRun(({ builder: { layout }}) =>
				//makeScrollable(layout))
			/*.onAfterRun(({ builder: { layout } }) => {
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
			})*/

		await initContentIlk?.call?.(this, e)
		let altForm = form.addFormWithParent()
			.yanYana()
			.addCSS('grid-container')
			.addStyle_fullWH()
			//.addStyle_wh('auto', 'calc(var(--full) - 100px)')
		/*e.fbd_baslik = altForm.addBaslik()
			.addCSS('baslik')
			.setEtiket(`<b class="royalblue">TOPLAM</b>`)*/
		for (let item of this.values())
			await item.run({ ...e, parentForm: form, form: altForm })
		
		await initContentSon?.call?.(this, e)
		rfb.run()
		
		return this
	}
	_initDefaultCollapsedContent(e = {}) {
		let { tanimPart = {}, layout, rfb = {}, item = {}, islem } = e
		let { inst = {}, secimler: sec, acc = tanimPart.acc } = tanimPart
		let { id, collapsed = {} } = item ?? {}

		let container = $(`<div/>`)
		if (sec && !collapsed) {
			let parent = $(`<div class="parent flex-row full-height" style="gap: 10px"/>`)
			;{
				let e = { liste: [] }
				for (let [k, s] of sec) {
					if (k != 'tarihAralik')        // 'donem' ozetBilgi gösteriminde zaten gerekirse tarihAralık bilgisi de var)
						s.ozetBilgiHTMLOlustur(e)
				}
				let ozetBilgiHTML = e.liste?.filter(x => !!x).join(' ')
				if (ozetBilgiHTML) {
					let elm = $(`<div class="absolute parent secimBilgi" style="top: -5px; right: 0; margin: 0"/>`)
					$(ozetBilgiHTML).appendTo(elm)
					elm.appendTo(parent)
				}
			}
			
			if (!empty(parent.children()))
				parent.appendTo(container)
		}
		
		return container
	}

	add(...items) {
		;items.forEach(v =>
			this.set(null, v))
		return this
	}
	get(idOrItem) {
		let id = idOrItem?.id ?? idOrItem
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
		let id = idOrItem?.id ?? idOrItem
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

class AccPanelDetay extends CKodVeAdi {
	get id() { return this.kod } set id(v) { this.kod = v }
	get title() { return this.aciklama } set title(v) { this.aciklama = v }
	
	constructor(e = {}) {
		super(e)
		mergeInto(e, this,
			'id', 'title', 'userData',
			'width', 'height', 'widgetArgsDuzenle'
		)
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
	halfWidth() { return this.setWidth('49.5%') }
	halfHeight() { return this.setHeight('49.5%') }
	widgetArgsDuzenleIslemi(v) { this.widgetArgsDuzenle = v; return this }
}

class AccPanelGrid extends AccPanelDetay {
	static get defGridWidth() { return 430 }
	static get timeout() { return DRapor_PratikSatis.timeout }
	static get deepCopyAlinmayacaklar() {
		return [
			...super.deepCopyAlinmayacaklar,
			'builder', '_builder'
		]
	}

	constructor(e = {}) {
		super(e)
		mergeInto(e, this, 'toplamBelirtec')
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
		let { id: gridId, userData, widgetArgsDuzenle } = this
		let { toplamBelirtec, width, height, noTitle } = this
		let { cssDuzenle, tabloKolonlari, source, query, recsDuzenle, veriYuklenince } = this
		let { defGridWidth } = this.class
		let { tanimPart = e.sender, rfb, parentForm, form, panelIciTekrarmi } = e
		e.secimler = tanimPart.secimler

		if (height == 'full')
			parentForm.addCSS('full')
		
		;{
			width = width == 'full'
				? 'var(--full)'
				: width || min(defGridWidth, $(window).width() - 50)
			height = height == 'full'
				? 'calc(var(--full) - 5px)'
				: height ?? null
		}
		
		let parent = form.addFormWithParent()
			.addStyle_wh(width, height)
			.addStyle(`$elementCSS { border-top: 1px solid #ccc }`)
			/*.onAfterRun(({ builder: { parent, layout }}) => {
				delay(100).then(() => {
					parent.jqxSplitter({
						theme,
						width: '100%', height: '100%',
						orientation: 'vertical', splitBarSize: 20
						//panels: [ { min: 90, size: fis.class.getUISplitHeight({ ...e, fis, islem }) ?? 170 }, { min: 200 } ]
					})
				})
			})*/

		let cssDuzenleyici = _e => {
			let result = this.class.gridCSSHandler({ ...e, ..._e }) ?? []
			cssDuzenle?.call(this, { ...e, ..._e, result })
			return result
		}
		let fbd_grid = this.builder = parent.addGridliGosterici(gridId)
			.addCSS('relative')
			.addStyle_fullWH()
			.addStyle(`$elementCSS { padding-left: 10px }`)
			.noAnimate()
			.setUserData(userData)
			.rowNumberOlmasin().notAdaptive()
			.setToplamYapi({
				etiket: { belirtec: toplamBelirtec }
			})
			.widgetArgsDuzenleIslemi(_e => {
				let { args } = _e
				_e = { ...e, ..._e }
				extend(args, this.getGridOrtakArgs(_e))
				widgetArgsDuzenle?.call(this, _e)
			})
			.setTabloKolonlari(_e => {
				_e = { ...e, ..._e }
				let defs = getFuncValue.call(this, tabloKolonlari, _e)
				defs = defs?.filter?.(Boolean) ?? defs ?? []

				let key2CSSHandler = {}
				;defs.forEach(cd => {
					let { belirtec: k } = cd
					let { cellClassName: h } = cd
					key2CSSHandler[k] = h
					cd.cellClassName = (cd, i, k, v, r, res) => {
						res ??= []
						;{
							let tmp = makeArray(key2CSSHandler?.[k]?.call(this, cd, i, k, v, r, res))
							if (!empty(tmp))
								res.push(...tmp)
						}
						cssDuzenleyici?.call(this, { colDef: cd, rowIndex: i, dataField: k, value: v, rec: r, result: res })
						return makeArray(res).filter(Boolean).join(' ')
					}
				})
				return defs
			})
			.setSource(async _e => {
				let fbd = _e.builder ?? fbd_grid ?? {}
				let { id, noTitle } = this
				let { parent, layout, part: gridPart, input: grid } = fbd
				// let parentParent = parent.parent()
				// parent?.find('.empty')?.addClass('jqx-hidden')
				
				_e = { ...e, ..._e, panelDetay: this }
				let data = tanimPart._promises_data ??= {}
				let pr = data[id] = promise(async () => {
					let recs = await getFuncValue.call(this, source, _e)
					if (recs == null) {
						let stm = await getFuncValue.call(this, query, _e)
						recs = await this.getGridData({ ..._e, tanimPart, gridPart, query: stm, recsDuzenle })
					}
					else {
						let result = await recsDuzenle?.call?.(this, { ..._e, tanimPart, gridPart, recs })
						if (result !== undefined)
							recs = result
					}

					return recs ?? []
				})
				try { return await pr }
				catch (ex) {
					return debounce('accPanel-source-error', () => {
						cerr(ex)
						hConfirm(getErrorText(ex), tanimPart.sinifAdi)
						return []
					}, 100)
				}
			})
			.veriYukleninceIslemi(async _e => {
				let { sender: gridPart } = _e
				let { grid, gridWidget: w } = gridPart
				let parent = grid.parent()
				let parentParent = parent.parent()
				let parentParentParent = parent.parent()
				let { boundRecs: recs } = gridPart
				await veriYuklenince?.call(this, { ...e, ..._e, tanimPart, gridPart, recs })
				delay(1).then(() => {
					let { inst } = tanimPart
					let args = { ...e, ..._e }
					return inst.veriYuklendi
						? inst.veriYuklendi(args)
						: tanimPart?.veriYuklendi(args)
				})
				
				/*let wait = 0, waitArtis = 10
				let autoResize = () => {
					setTimeout(() => {
						let { height } = this
						let fullHeight = height == 'full'
						if (fullHeight) {
							;[parent, parentParent].forEach(elm =>
								elm.addClass('full-height'))
						}
						let { length } = gridPart.boundRecs
						grid.jqxGrid('height',
							fullHeight
								? '100%'
								: max(80, 45 + (length * w.rowsheight))
						)
						w.refresh()
					}, wait)
					wait += waitArtis
				}
				;{
					let autoResizeCount = 1
					for (let i = 0; i < autoResizeCount; i++)
						autoResize()
				}*/
				
				gridPart._tazeleYapildimi = true
			})
			.onAfterRun(({ builder: { part: gridPart, layout, parentBuilder: { id2Builder } } }) => {
				let { grid, gridWidget } = gridPart
				extend(this, { gridPart, grid, gridWidget })
			})

		fbd_grid.addButton('fullScreen')
			.addStyle_wh(50, 40)
			.addCSS('absolute')
			.addStyle(
				`$elementCSS {
					right: 10px; top: -5px;
					min-width: unset !important;
					min-height: unset !important;
					margin: 0 !important; padding: 0 !important;
					z-index: 1000 !important
				}
				$elementCSS > button {
					width: var(--full) !important;
					height: var(--full) !important
				}
				$elementCSS > button:hover:not(:active) { background-color: steelblue !important }`
			)
			.onClick(({ builder: fbd }) => {
				let { parentBuilder: { parent: gridParent, layout: grid, part: gridPart } } = fbd
				gridParent.toggleClass('fullScreen')
			})
		
		return fbd_grid
	}

	async tazele(e) {
		await super.tazele(e)
		await this.gridPart?.tazele(e)
		return this
	}

	getGridOrtakArgs() {
		let { userData: { noGroupTotals } = {} } = this
		return {
			rowsHeight: 26, columnsMenu: false, showGroupsHeader: false,
			columnsReorder: false, selectionMode: 'multiplerowsextended',
			autoShowLoadElement: false,
			groupsRenderer: (text, group, expanded, groupInfo) => {
				let topBedel
				if (!noGroupTotals) {
					let { subItems = [] } = groupInfo ?? {}
					subItems = subItems
						?.filter(r => !(r.totalsrow || r._toplam))
					topBedel = topla(
						r => r.hasilat ?? r.bedel ?? r.netBedel ?? r.ciro,
						subItems)
				}
				
				return [
					`<div class="grid-cell-group full-wh relative">`,
						`<div class="aciklama float-left">${group}</div>`,
						(
							!noGroupTotals && topBedel
								? `<div class="bedel fs-190 bold royalblue absolute" style="right: 70px">${bedelToString(topBedel)}</div>`
								: null
						),
					`</div>`
				].filter(Boolean).join('\n')
			}
		}
	}
	static gridCSSHandler({ colDef: cd, rowIndex: ri, belirtec: k, value: v, rec: r, result: res }) {
		res ??= []
		res.push(k)
		if (r._toplam)
			res.push('_toplam')
		return res
	}
	async getGridData(e = {}) {
		let { DefaultWSHostName_SkyServer: defHost } = config.class
		let { tanimPart = {}, builder: fbd = {}, query, params } = e
		let { id: gridId, grid, gridPart = this.gridPart ?? {}, class: { timeout } } = this
		let { inst = tanimPart.inst ?? {}, acc = tanimPart.acc ?? {}, recsDuzenle } = e
		let { tabloKolonlari = fbd.tabloKolonlari ?? gridPart.tabloKolonlari } = e
		let { layout: rootLayout } = tanimPart
		let panelId = grid?.parents('.accordion.item').data('id')
		let { id2Panel = {} } = acc
		let accItem = id2Panel[panelId] ?? {}
		let { layout: panelLayout } = accItem ?? {}

		clearTimeout(tanimPart._timer_tazeleIndicatorClear)
		rootLayout?.addClass('refreshing')
		panelLayout?.removeClass('has-error')
		tanimPart._promise_getGridData = defer()
		try {
			if (query?.sentDo) {
				let e = { ...arguments[0], stm: query }
				delete e.query
				inst.stmSonIslemler?.(e)
				query = e.query = e.stm
				params = e.params = e.params
			}
	
			let recs = await query?.execSelect({ timeout, params }) ?? []
			recs = await recsDuzenle?.call(this, { ...e, recs }) ?? recs
			if (empty(recs))
				return recs
			
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
			
			try {
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
						.map(k => String(r[k] ?? 'NULL'))
						.join('\t')
				}

				if (!noSort) {
					recs.sort((a, b) =>
						getKey(a, keyFields, sortFields).localeCompare(
							getKey(b, keyFields, sortFields))
					)
				}

				let key2Rec = new Map()
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
				recs = Array.from(key2Rec.values())

				let e = { ...arguments[0], recs }
				delay(10).then(() =>
					acc.render?.())
				
				return recs
			}
			finally { tanimPart._promise_getGridData?.resolve() }
		}
		catch (ex) {
			let { _lastErrors: errs = [] } = tanimPart
			clearTimeout(tanimPart._timer_error)
			errs.push(`<li>${getErrorText(ex)}</li>`)
			tanimPart._timer_error = setTimeout(() =>
				hConfirm(`<ul>${errs.join('\n')}</ul>`, 'Veri Gösterim Sorunu'),
				200
			)
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
