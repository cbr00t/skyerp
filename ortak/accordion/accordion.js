class AccordionPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isSubPart() { return true } static get partName() { return 'accordion' }
	get id2Elm() {
		let {layout, panels} = this
		let elms = Array.from(layout.find('.accordion.item'))
		let result = {}
		for (let elm of elms) {
			if (!elm.html)
				elm = $(elm)
			let id = elm.data('id')
			if (id)
				result[id] = elm
		}
		return result
	}
	get id2Panel() {
		let {_id2Panel: result} = this
		if (!result) {
			let {panels} = this
			panels ??= []
			panels.forEach(_ => _.id ||= newGUID())
			result = this._id2Panel = fromEntries(panels.map(_ => [_.id, _]))
		}
		return result
	}
	get activePanels() {
		let {layout, id2Panel} = this
		let activeList = Array.from(layout.find('.accordion.item.expanded'))
		let result = []
		for (let elm of activeList) {
			if (!elm.html)
				elm = $(elm)
			let id = elm?.data('id')
			if (!id)
				continue
			let item = id2Panel[id]
			result.push({ id, item, elm, collapsed: false })
		}
		return result
	}
	get activePanel() { return this.activePanels?.at(-1) }
	get hasActivePanel() { return !!this.activePanel }

	constructor({ defaultCollapsed, coklu, coklumu, panels, events, userData } = {}) {
		super(...arguments)
		defaultCollapsed ??= true
		coklu ??= coklumu ?? false
		events ??= {}
		this.panels = []
		if (panels)
			this.addAll(...panels)
		$.extend(this, { isDefaultCollapsed: defaultCollapsed, coklumu: coklu, panels, events, userData })
	}
	runDevam(e = {}) {
		super.runDevam(e)
		let {layout, panels, class: { partName }} = this
		layout.addClass(`${partName} part`)
		layout.off('focus').on('focus', evt =>
			$(window).trigger('resize'))
		let _e = { ...e, panels }
		this.argsDuzenleBlock?.call(this, _e)
		panels = this.panels = _e.panels
		this.render(e)
		this._initialized = true
	}
	destroyPart(e) {
		this.clear()
		this._initialized = false
		return super.destroyPart(e)
	}
	render(e) {
		let {layout} = this
		if (!layout?.length)
			return this
		clearTimeout(this._timer_render)
		this._timer_render = setTimeout(e => this._render(e), 1, e)
		return this
	}
	async _render(e) {
		let {layout, panels, _lastPanelCount} = this
		if (!layout?.length)
			return this
		if (_lastPanelCount > panels.length) {
			layout.find('.accordion.item').remove()
			panels.forEach(_ => _._rendered = false)
		}
		let {id2Elm, defaultCollapsed} = this
		for (let item of panels) {
			let id = item.id ||= newGUID()
			let container = id2Elm[id], hasElm = container?.length
			// let fullRender = !(hasElm && item._rendered)
			let {title, collapsed, expanded, disabled} = item
			title ??= ''
			collapsed ??= (expanded == null ? null : !expanded) ?? defaultCollapsed
			let elmHeader
			if (!hasElm) {
				let css_expanded = collapsed ? '' : ' expanded'
				let css_disabled = disabled ? ' disabled' : ''
				container = $([
					`<div class="item accordion${css_expanded}${css_disabled}" data-id="${id}">`,
					`    <div class="header flex-row"> </div>`,
					`    <div class="content"></div>`,
					'</div>'
				].join(CrLf))
				container.appendTo(layout)
				elmHeader = container.children('.header')
				elmHeader.on('click', ({ currentTarget: elmHeader }) => {
					elmHeader = $(elmHeader)
					let elm = elmHeader.parents('.accordion.item')
					if (($(elm).hasClass('disabled')))
						return this
					let item = this.id2Panel[elm.data('id')]
					if (item)
						this.changeState(item, !item.collapsed)
				})
			}
			else {
				elmHeader = container.children('.header')
				container[collapsed ? 'removeClass' : 'addClass']('expanded')
				container[disabled ? 'addClass' : 'removeClass']('disabled')
			}
			elmHeader.height(title ? null : 10)
			let elmTitle = elmHeader.children('.title')
			if (elmTitle.length)
				elmTitle.html(title)
			else
				(elmTitle = $(`<div class="title">${title}</div>`)).appendTo(elmHeader)
			let elmCollapsedContent = elmHeader.children('.collapsed-content')
			if (!elmCollapsedContent.length)
				(elmCollapsedContent = $(`<div class="collapsed-content"/>`)).appendTo(elmHeader)
			elmCollapsedContent.children().remove()
			let collapsedKey = 'collapsedContent'
			let targetKey = collapsed ? collapsedKey : 'content'
			// if (collapsed) {
			{
				// let targetContent = await this.evalContent(item, item[targetKey], elmCollapsedContent) || $('<div/>')
				let targetContent = await this.evalContent(item, item[collapsedKey], elmCollapsedContent) || $('<div/>')
				if (targetContent && !targetContent.parent()?.length)
					targetContent.appendTo(elmCollapsedContent)
			}
			if (!collapsed) {
				let elmContent = container.children('.content')
				if (!elmContent.children().length) {
					let targetContent = await this.evalContent(item, item[targetKey], elmContent) || $('<div/>')
					if (targetContent && targetContent.parent()?.[0] != elmContent[0]) {
						if (targetContent.parent()?.length)
							targetContent.detach()
						targetContent.appendTo(elmContent)
					}
					/*let itemsCSS = {}
					for (let key of ['overflow', 'overflow-x', 'overflow-y'])
						itemsCSS[key] = container.css(key)
					container.resizable({
						// handles: 'all', containment: 'parent', ghost: true, helper: 'ui-resizable-helper',
						// classes: { '.ui-resizable': 'highlight' },
						handles: 'n, s', grid: [8, 8], 
						// minWidth: Math.min($(window).width() - 100, 300),
						minHeight: 70,
						start: (evt, info) => {
							let {element: item} = info
							if (!item.parents('.accordion.item').hasClass('expanded')) {
								container.resizable('option', 'disabled', true)
								setTimeout(() => container.resizable('option', 'disabled', false))
								return false
							}
							item.addClass('_resizing')
							for (let key in itemsCSS)
								container.css(key, 'hidden')
						},
						stop: (evt, info) => {
							let {element: item, size: { width, height }} = info
							container.removeClass('_resizing')
							for (let [k, v] of entries(itemsCSS))
								container.css(k, v)
							clearTimeout(this._timer_triggerResize)
							this._timer_triggerResize = setTimeout(() => {
								try { $(window).trigger('resize') }
								finally { this._timer_triggerResize }
							}, 10)
						}
					})*/
				}
				setTimeout(() => {
					let safeZone = 20
					let {length: N} = layout.children('.accordion.item')
					let H = layout.height()
					let headerH = parseInt(layout.css('--acc-header-height'))                   // getComputedStyle(layout[0]).getPropertyValue('--acc-header-height')
					let itemPadY = parseInt(layout.css('--item-pad-y'))                         // getComputedStyle(layout[0]).getPropertyValue('--item-pad-y')
					let border = 3                                                              // css’den sabit
					let collapsedItemHeight = headerH + (itemPadY * 2) + (border * 2)
					let contentHeight = parseInt(H - collapsedItemHeight * N - safeZone)
					elmContent.height(contentHeight)
					makeScrollable(elmContent)
					elmContent.scrollTop(0)
					/*elmContent.css(
						'height',
						`calc(${layout.height()}px - (var(--acc-header-height) * ${layout.children().length - 1}))`
						// `calc(${elmContent.offset().top}px + (var(--acc-header-height) * ${layout.children().length - container.index() + 1}))`
					)*/
				}, 100)
				clearTimeout(this._timer_triggerResize)
				this._timer_triggerResize = setTimeout(() => {
					try { $(window).trigger('resize') }
					finally { this._timer_triggerResize }
				}, 10)
				/*elmContent.trigger('resize')
				if (elmContent?.length)
					elmContent.find('.dock-bottom').removeClass('dock-bottom')*/
			}
			/*if (collapsed != defaultCollapsed) {
				let action = collapsed ? 'collapse' : 'expand'
				setTimeout(() => this.signalStateChange({ action, item }, true), 1)
			}*/
		}
		clearTimeout(this._timer_triggerResize)
		this._timer_triggerResize = setTimeout(() => {
			try { $(window).trigger('resize') }
			finally { this._timer_triggerResize }
		}, 10)
		this._lastPanelCount = panels.length
		return this
	}
	add(e, _title, _collapsed, _content, _collapsedContent, _disabled, _data) {
		let item = typeof e == 'object' ? e : {
			id: e, title: _title, collapsed: _collapsed,
			content: _content, collapsedContent: _collapsedContent,
			disabled: _disabled, data: _data
		}
		if (item.expanded != null && item.collapsed == null){
			item.collapsed = !item.expanded
			delete item.expanded
		}
		let {layout, panels, id2Panel} = this
		let id = item.id ||= newGUID()
		item._layout = layout
		item.collapsed ??= item.isCollapsed ?? this.isDefaultCollapsed
		delete item.isCollapsed
		Object.defineProperty(
			item, 'layout', {
				configurable: true,
				get() { return this._layout.children(`.accordion.item[data-id = "${this.id}"]`) }
			}
		)
		Object.defineProperty(
			item, 'headerLayout', {
				configurable: true,
				get() { return this.layout.children('.header') }
			}
		)
		Object.defineProperty(
			item, 'contentLayout', {
				configurable: true,
				get() { return this.layout.children('.content') }
			}
		)
		panels.push(item)
		id2Panel[id] = item
		this.signalChange({ type: 'add', item })
		return this
	}
	addAll(...items) {
		for (let item of items) {
			if (item == null)
				continue
			if (isArray(item)) {
				this.addAll(...item)
				continue
			}
			this.add(item)
		}
		return this
	}
	remove(e) { return this.delete(e) }
	delete(e) {
		let idOrIndex = typeof e == 'object' ? e.id ?? e.index : e
		if (!idOrIndex)
			return null
		let {panels, id2Panel} = this
		let ind = (typeof idOrIndex == 'string' ? panels.findIndex(_ => _.id == idOrIndex) : idOrIndex) ?? -1
		let item = panels[ind]
		if (!item)
			return null
		panels.splice(ind, 1)
		delete id2Panel[item.id]
		this.signalChange({ type: 'delete', item })
		return item
	}
	clear() {
		let {panels} = this
		if (panels) {
			for (let item of panels)
				this.signalChange({ type: 'delete', batch: true, item })
			this.signalChange({ type: 'batchDelete', batch: true, panels })
		}
		this.panels = []
		delete this._id2Panel
		return this
	}
	get(e) {
		let idOrIndex = typeof e == 'object' ? e.id ?? e.index : e
		if (!idOrIndex)
			return null
		let {id2Panel} = this
		let item = typeof idOrIndex == 'string' ? id2Panel[idOrIndex] : panels[idOrIndex]
		return item
	}
	set(e, newItem) {
		let idOrIndex = typeof e == 'object' ? e.id ?? e.index : e
		if (!idOrIndex)
			return null
		let {panels, id2Panel} = this
		panels.find(_ => _.id == idOrIndex)
		let item = typeof idOrIndex == 'string' ? id2Panel[idOrIndex] : panels[idOrIndex]
		if (!item)
			return this.add(item)
		let ind = (typeof idOrIndex == 'string' ? panels.findIndex(_ => _.id == idOrIndex) : idOrIndex) ?? -1
		panels[i] = newItem
		id2Panel[item.id] = newItem
		this.signalChange({ type: 'set', oldItem: item, item: newItem })
		return this
	}
	getCollapsedContent(e) {
		let idOrIndex = typeof e == 'object' ? e.id ?? e.index : e
		if (!idOrIndex)
			return undefined
		let {id2Panel} = this
		let item = typeof idOrIndex == 'string' ? id2Panel[idOrIndex] : panels[idOrIndex]
		return item?.collapsedContent
	}
	setCollapsedContent(e, value) {
		let idOrIndex = typeof e == 'object' ? e.id ?? e.index : e
		if (!idOrIndex)
			return this
		let {id2Panel} = this
		let item = typeof idOrIndex == 'string' ? id2Panel[idOrIndex] : panels[idOrIndex]
		if (item)
			item.collapsedContent = value
		return this
	}
	clearCollapsedContent(e) {
		return this.setCollapsedContent(e, null)
	}
	focus(e) {
		this.layout.focus()
		return this
	}
	collapse(idOrIndex) {
		if (idOrIndex == null)
			idOrIndex = this.activePanel?.id
		this.changeState(idOrIndex, true)
		return this
	}
	expand(idOrIndex) {
		this.changeState(idOrIndex, false)
		return this
	}
	changeState(e, collapsed, internal) {
		if (collapsed == null)
			return false
		let {layout, panels, id2Panel} = this
		let item = e
		if (typeof item != 'object')
			item = typeof e == 'string' ? id2Panel[e] : panels[e]
		if (!item || item.collapsed == collapsed)
			return this
		item.collapsed = collapsed
		{
			let action = collapsed ? 'collapse' : 'expand'
			let {id} = item
			let elm = layout.children(`.accordion.item[data-id = "${id}"]`)
			let index = elm.index()
			setTimeout(() => this.signalStateChange({ action, item, id, index, elm }, internal), 50)
		}
		return this
	}
	beginUpdate() { this._updating = true; return this }
	endUpdate() {
		if (this._updating) {
			this._updating = false
			this.render()
		}
		return this
	}
	async deferRedraw(proc, ...args) {
		if (!proc)
			return undefined
		if (this._updating)
			return proc.call(this, ...args)
		this.beginUpdate()
		try { return await proc.call(this, ...args) }
		finally { this.endUpdate() }
		return this
	}
	signalStateChange(e, internal) { return this.signal('stateChange', e, internal) }
	signalExpanded(e) { return this.signal('stateChange', { ...e, action: 'expand' }) }
	signalCollapsed(e) { return this.signal('stateChange', { ...e, action: 'collapse' }) }
	async signal(name, args, internal) {
		if (!internal) {
			switch (name) {
				case 'stateChange': {
					let {panels} = this, {item} = args ?? {}
					if (item && !this.coklumu) {
						// çoklu değilse, diğer paneller collapsed duruma geçmesi için render() öncesi işaretlenir
						for (let _ of panels) {
							if (_ != item)
								_.collapsed = true
						}
					}
					if (this._initialized && !this._updating)
						this.render()
					break
				}
				case 'change': {
					if (this._initialized && !this._updating)
						this.render()
					break
				}
			}
		}
		let {events} = this
		let handlers = events[name] ?? []
		for (let handler of handlers)
			handler?.call?.(this, { sender: this, ...args })
		if (name == 'stateChange') {
			let {action} = args ?? {}
			if (action)
				this.signal(action, args, internal)
		}
		return this
	}
	on(name, handler) {
		let handlers = this.events[name] ??= []
		handlers.push(handler)
		return this
	}
	off(name, handler) {
		let handlers = (this.events[name] ?? [])
		if (!handler) {
			handlers.splice(0)
			return this
		}
		let ind = handlers.indexOf(handler) ?? -1
		if (ind > -1)
			handlers.splice(ind, 1)
		return this
	}
	async evalContent(item, content, layout) {
		let sender = this, {builder, layout: parent} = this
		if (isFunction(content))
			content = await content.call(this, { sender, builder, item, parent, layout })
		if (content?.html)
			return content
		if (typeof content == 'string')
			return $(content)
		return null
	}
	coklu() { this.coklumu = true; return this }
	tekli() { this.coklumu = false; return this }
	defaultCollapsed() { this.isDefaultCollapsed = true; return this }
	defaultExpanded() { this.isDefaultCollapsed = false; return this }
	setPanels(...panels) {
		this.clear()
		this.addAll(...panels)
		return this
	}
	setUserData(value) { this.userData = value; return this }
	degisince(handler) { return this.change(handler) }
	onChange(handler) { return this.on('change', handler) }
	signalChange(e) { return this.signal('change', e) }
	onStateChange(handler) { return this.on('stateChange', handler) }
	onExpand(handler) { return this.on('expand', handler) }
	onCollapse(handler) { return this.on('collapse', handler) }
	getLayout() { return $('<div/>') }
}


/*
// tablet fiş giriş test

let formGirismi = true
let inst = new MQTicariGenelFis()
let rootPart, acc, gridPart, barkodPart, barkod2Part

{
	let rfb = new RootFormBuilder().asWindow('test')
		.addStyle(`$elementCSS { overflow-y: auto !important }`)
		.setInst(inst)
		.onAfterRun(({ builder: { part } }) => {
			part.inst = inst
			rootPart = part
		})
	let fbd_islemTuslari = rfb.addIslemTuslari(islemTuslari)
		.addStyle_fullWH(150, 50).addCSS('absolute')
		// .addStyle(`$elementCSS { right: 10px }`)
		.addStyle(
			`$elementCSS, $elementCSS > div, $elementCSS > div > div { background: unset !important; background-color: transparent !important }
			 $elementCSS { position: fixed !important; top: 1px; right: 60px }
			 $elementCSS button { width: 45px !important; height: 40px !important }
			 $elementCSS button#vazgec { margin-left: 20px }
			 body > .app-titlebar { display: none !important }`
		)
		.setTip('tamamVazgec')
		.setId2Handler({
			tamam: e => eConfirm('tamam istendi'),
			vazgec: e => rfb.part.close()
		})
	rfb.addAccordion()
		.addStyle_fullWH(null, `calc(var(--full) - 100px)`)
		// .addStyle(`$elementCSS { margin-top: -50px }`)
		.onAfterRun(({ builder: { part } }) =>
			acc = part)
	rfb.run()
}

acc.deferRedraw(async () => {
	acc.add('dip', 'Dip')
	acc.add({
		id: 'detay', title: 'Bilgi Girişi', expanded: true,
		collapsedContent: (e => {
			if (!gridPart)
				return
			let {gridWidget: w} = gridPart
			let count = w?.getdatainformation()?.rowscount
			return count ? `<div class="bold orangered fs-70">${numberToString(count) ?? ''} satır</div>` : null
		}),
		content: ({ item, layout }) => {
			let rfb = new RootFormBuilder()
				.setLayout(layout).setPart(rootPart).setInst(inst)
				.addStyle_wh(`calc(var(--full) - 10px)`)
			rfb.addSimpleComboBox('_barkod', '', 'Barkod giriniz')
				.etiketGosterim_yok()
				.addStyle_fullWH(null, 50)
				.addStyle(`$elementCSS > input { max-width: 800px !important }`)
				// .setSource(({ term, tokens }) => tokens)
				.setMFSinif(MQTabStok)
				.degisince(e => {
					console.info(e)
					let {type, events} = e
					if (type == 'batch') {
						let {gridWidget: w} = gridPart ?? {}
						if (w) {
							for (let {item: { kod, aciklama }} of events) {
								let text = (aciklama || kod)?.trimEnd?.()
								if (text)
									w.addrow(null, { text }, 'first')
							}
							acc.render()
						}
					}
				})
				.onAfterRun(({ builder: { part } }) =>
					barkodPart = part)
			rfb.addGridliGiris('_grid')
				.addCSS('dock-bottom')
				.addStyle_fullWH(null, `calc(var(--full) - 60px)`)
				.addStyle(`$elementCSS > div { width: var(--full) !important; height: var(--full) !important }`)
				.rowNumberOlmasin().notAdaptive().noEmptyRow()
				.setTabloKolonlari([
					new GridKolon({
						belirtec: 'text', text: ' ', filterType: 'checkedlist',
						draggable: false, groupable: false
					})
				])
				.setSource(e => [])
				.onAfterRun(({ builder: { part } }) =>
					gridPart = part)
			rfb.run()
		}
	})
	acc.add({
		id: 'baslik', title: 'Başlık',
		collapsedContent: (async ({ builder: { inst } }) => {
			let {mustKod} = inst, mustUnvan = mustKod ? await MQTabCari.getGloKod2Adi(mustKod) : null
			return mustKod ? `<div class="bold orangered fs-70">${mustUnvan || mustKod}</div>` : null
		}),
		content: ({ item, layout }) => {
			let rfb = new RootFormBuilder()
				.setLayout(layout).setPart(rootPart).setInst(inst)
			rfb.addModelKullan('mustKod', 'Müşteri')
				.comboBox().kodsuz()
				.setMFSinif(MQTabCari)
				.degisince(e => console.info('cari değişti', rfb, e))
				.onAfterRun(({ builder: { part, rootPart } }) =>
					rootPart.ddCari = part)
			rfb.run()
		}
	})
	acc.add({
		id: 'duzenle', title: 'Satır Düzenle',
		content: ({ item, layout }) => {
			let rfb = new RootFormBuilder()
				.setLayout(layout).setPart(rootPart).setInst(inst)
				.addStyle_wh(`calc(var(--full) - 10px)`)
			rfb.addSimpleComboBox('_barkod', '', 'Barkod giriniz')
				.etiketGosterim_yok()
				.addStyle_fullWH(null, 50)
				.addStyle(`$elementCSS > input { max-width: 800px !important }`)
				// .setSource(({ term, tokens }) => tokens)
				.setMFSinif(MQTabStok)
				.degisince(e =>
					barkodPart.signalChange(e))
				.onAfterRun(({ builder: { part } }) =>
					barkod2Part = part)
			rfb.run()
		}
	})
	acc.onStateChange(({ action, id, ...rest }) => {
		if (action == 'expand') {
			setTimeout(() => {
				let target
				switch (id) {
					case 'detay': target = barkodPart; break
					case 'duzenle': target = barkod2Part; break
				}
				target?.focus()
			}, 1)
		}
		console.info(action, { action, id, ...rest })
	})
})

{
	acc.expand(1)
	setTimeout(() => {
		let target = formGirismi ? barkod2Part : barkodPart
		if (formGirismi)
			acc.collapse('detay').expand('duzenle')
		target?.focus()
	}, 0)
}


// let part = new SimpleComboBoxPart({ content })
// part.setSource(({ sender, layout, value, term, tokens }) => tokens)
// part.run()
// let {layout: input} = part
// input.width(400); input.height(60)

*/
