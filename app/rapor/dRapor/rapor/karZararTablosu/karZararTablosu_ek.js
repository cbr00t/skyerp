(function() {
	let rootCls = DRapor_KarZararTablosu
	rootCls.Panel = class Panel extends CKodVeAdi {
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
			/*form.onAfterRun(({ builder: { layout } }) => {
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
			let { inst = {}, acc = tanimPart.acc } = tanimPart
			let { secimler = {} } = inst
			let { id, collapsed = {} } = item ?? {}
	
			let container = $(`<div/>`)
			if (secimler && !collapsed) {
				let parent = $(`<div class="parent flex-row full-height" style="gap: 10px"/>`)
				;{
					let e = { liste: [] }
					for (let [k, s] of secimler) {
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
		widgetArgsDuzenleIslemi(v) { this.widgetArgsDuzenle = v; return this }
	}

	rootCls.PanelGrid = class PanelGrid extends rootCls.PanelDetay {
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

			let cellClassName = (...rest) => {
				let result = this.class.gridCSSHandler(...rest) ?? []
				cssDuzenle?.call(this, { ...e, ...rest, result })
				return result
			}

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
			
			let fbd_grid = this.builder = parent.addGridliGosterici(gridId)
				.addStyle_fullWH()
				.addStyle(`$elementCSS { padding-left: 10px }`)
				.noAnimate().setUserData(userData)
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
					;defs.forEach(def =>
						def.cellClassName ??= cellClassName)
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
							recs = await this.getGridData({ ..._e, query: stm })
						}
	
						if (recs != null) {
							let result = await recsDuzenle?.call?.(this, { ..._e, tanimPart, gridPart, recs })
							if (result !== undefined)
								recs = result
						}
	
						return recs ?? []
					})
					return await pr
				})
				.veriYukleninceIslemi(async _e => {
					let { sender: gridPart } = _e
					let { grid, gridWidget: w } = gridPart
					let parent = grid.parent()
					let parentParent = parent.parent()
					let { boundRecs: recs } = gridPart
					await veriYuklenince?.call(this, { ...e, ..._e, tanimPart, gridPart, recs })
					
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
				.onAfterRun(({ builder: { part: gridPart } }) => {
					let { grid, gridWidget } = gridPart
					extend(this, { gridPart, grid, gridWidget })
				})
			
			return fbd_grid
		}

		async tazele(e) {
			await super.tazele(e)
			await this.gridPart?.tazele(e)
			return this
		}

		getGridOrtakArgs() {
			return {
				rowsHeight: 26, columnsMenu: false, showGroupsHeader: false,
				columnsReorder: false, selectionMode: 'multiplerowsextended',
				autoShowLoadElement: false,
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

			clearTimeout(tanimPart._timer_tazeleIndicatorClear)
			rootLayout?.addClass('refreshing')
			panelLayout?.removeClass('has-error')
			this._promise_getGridData = defer()
			try {
				if (query?.sentDo) {
					let e = { ...arguments[0], stm: query }
					delete e.query
					inst.stmSonIslemler?.(e)
					query = e.query = e.stm
					params = e.params = e.params
				}
		
				let recs = await query?.execSelect({ timeout, params }) ?? []
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
							.map(k => String(r[k]))
							.join('\t')
					}

					if (!noSort) {
						recs.sort((a, b) =>
							getKey(a, keyFields, sortFields).localeCompare(
								getKey(b, keyFields, sortFields))
						)
					}
	
					let e = { ...arguments[0], subeResult, recs }
					delay(50).then(() =>
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
})()
