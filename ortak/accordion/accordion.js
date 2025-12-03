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

	constructor({ defaultCollapsed, coklu, coklumu, panels, events, userData } = {}) {
		super(...arguments)
		this.isDefaultCollapsed = defaultCollapsed ?? true
		this.coklumu = coklu ?? coklumu ?? false
		// this.clear()
		this.panels = panels ?? []
		// delete this.id2Panel  --  ctor sırasında zaten yoktur
		this.events = events ?? {}
		this.userData = userData
	}
	runDevam(e = {}) {
		super.runDevam(e)
		let {panels, class: { partName }} = this
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
		let {layout, panels, _lastPanelCount} = this
		if (_lastPanelCount > panels.length) {
			layout.find('.accordion.item').remove()
			panels.forEach(_ => _._rendered = false)
		}
		let {id2Elm} = this
		for (let item of panels) {
			let id = item.id ||= newGUID()
			let elm = id2Elm[id], hasElm = elm?.length
			// let fullRender = !(hasElm && item._rendered)
			let {title, collapsed, disabled} = item
			let elmHeader
			if (!hasElm) {
				let css_expanded = collapsed ? '' : ' expanded'
				let css_disabled = disabled ? ' disabled' : ''
				elm = $([
					`<div class="item accordion${css_expanded}${css_disabled}" data-id="${id}">`,
					`    <div class="header flex-row"> </div>`,
					`    <div class="content"></div>`,
					'</div>'
				].join(CrLf))
				elm.appendTo(layout)
				elmHeader = elm.children('.header')
				elmHeader.on('click', ({ currentTarget: elmHeader }) => {
					elmHeader = $(elmHeader)
					let elm = elmHeader.parents('.accordion.item')
					if (($(elm).hasClass('disabled')))
						return
					let item = this.id2Panel[elm.data('id')]
					if (item)
						this.changeState(item, !item.collapsed)
				})
			}
			else {
				elmHeader = elm.children('.header')
				elm[collapsed ? 'removeClass' : 'addClass']('expanded')
				elm[disabled ? 'addClass' : 'removeClass']('disabled')
			}
			let targetKey = collapsed ? 'collapsedContent' : 'content'
			let elmTitle = elmHeader.children('.title')
			if (elmTitle.length)
				elmTitle.html(title)
			else
				(elmTitle = $(`<div class="title">${title}</div>`)).appendTo(elmHeader)
			let elmCollapsedContent = elmHeader.children('.collapsed-content')
			if (!elmCollapsedContent.length)
				(elmCollapsedContent = $(`<div class="collapsed-content"/>`)).appendTo(elmHeader)
			elmCollapsedContent.children().remove()
			if (collapsed) {
				let targetContent = this.evalContent(item, item[targetKey]) || $('<div/>')
				targetContent?.appendTo(elmCollapsedContent)
			}
			else {
				let elmContent = elm.children('.content')
				if (!elmContent.children().length) {
					let targetContent = this.evalContent(item, item[targetKey]) || $('<div/>')
					targetContent?.appendTo(elmContent)
				}
			}
		}
		this._lastPanelCount = panels.length
	}
	add(e, _collapsed, _title, _content, _collapsedContent, _disabled, _data) {
		let item = typeof e == 'object'
			? { ...e }
			: { id: e, collapsed: _collapsed, title: _title, content: _content, collapsedContent: _collapsedContent, disabled: _disabled, data: _data }
		let {panels, id2Panel} = this
		let id = item.id ||= newGUID()
		item.collapsed ??= item.isCollapsed ?? this.isDefaultCollapsed
		delete item.isCollapsed
		panels.push(item)
		id2Panel[id] = item
		this.signalChange({ type: 'add', item })
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
	focus(e) {
		this.layout.focus()
		return this
	}
	collapse(idOrIndex) {
		this.changeState(idOrIndex, true)
		return this
	}
	expand(idOrIndex) {
		this.changeState(idOrIndex, false)
		return this
	}
	changeState(e, collapsed) {
		if (collapsed == null)
			return false
		let {panels, id2Panel} = this
		let item = e
		if (typeof item != 'object')
			item = typeof e == 'string' ? id2Panel[e] : panels[e]
		if (!item || item.collapsed == collapsed)
			return this
		item.collapsed = collapsed
		{
			let action = collapsed ? 'collapse' : 'expand'
			this.signalStateChange({ action, item })
		}
		return this
	}
	degisince(handler) { return this.change(handler) }
	change(handler) { return this.on('change', handler) }
	signalChange(e) { return this.signal('change', e) }
	stateChange(handler) { return this.on('stateChange', handler) }
	signalStateChange(e) { return this.signal('stateChange', e) }
	signalExpanded(e) { return this.signal('stateChange', { ...e, action: 'expand' }) }
	signalCollapsed(e) { return this.signal('stateChange', { ...e, action: 'collapse' }) }
	async signal(name, args) {
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
				this.render()
				break
			}
			case 'change': {
				if (this._initialized)
					this.render()
				break
			}
		}
		let {events} = this
		let handlers = events[name] ?? []
		for (let handler of handlers)
			await handler?.call?.(this, { sender: this, ...args })
		return this
	}
	on(name, handler) {
		let {events} = this
		(events[name] ??= []).push(handler)
		return this
	}
	off(name, handler) {
		let {events} = this
		let handlers = (events[name] ?? [])
		if (!handler) {
			handlers.splice(0)
			return this
		}
		let ind = handlers.indexOf(handler) ?? -1
		if (ind > -1)
			handlers.splice(ind, 1)
		return this
	}
	evalContent(item, content) {
		if (isFunction(content))
			content = content.call(this, { sender: this, item })
		if (content?.html)
			return content
		if (typeof content == 'string')
			return $(content)
		return null
	}
	getLayout() { return $('<div/>') }
	coklu() { this.coklumu = true; return this }
	tekli() { this.coklumu = false; return this }
	defaultCollapsed() { this.isDefaultCollapsed = true; return this }
	defaultExpanded() { this.isDefaultCollapsed = false; return this }
	setUserData(value) { this.userData = value; return this }
}
