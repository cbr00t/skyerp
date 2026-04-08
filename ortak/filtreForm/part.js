class FiltreFormPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'filtreForm' }
	static get isSubPart() { return true }

	constructor(e = {}) {
		super(e)
		let { parentPart, value, degisince = e.degisinceBlock } = e
		extend(this, { parentPart, value, degisinceEvent: [] })
		if (degisince)
			this.change(degisince)
	}
	runDevam(e = {}) {
		super.runDevam(e)
		let { layout } = this
		let input = this.input ??= layout.find('.input')
		input.val(this.value?.trim())
		input.off('focus').on('focus', evt =>
			setTimeout(() => evt.target.select(), 200))
		let changeHandler = evt => {
			let { currentTarget: target } = evt
			let value = this.value =
				( target ? target.value : input.val() )?.trim() ?? ''
			if (value != this.lastValue) {
				this.onChange({ ...e, event: evt })
				this.lastValue = value
			}
		}
		input.off('change').on('change', evt => changeHandler(evt));
		input.off('keyup').on('keyup', evt => {
			let key = evt.key?.toLowerCase()
			clearTimeout(this.timer_change)
			if (key == 'enter' || key == 'linefeed') 
				changeHandler(evt)
			else
				this.timer_change = setTimeout(() => changeHandler(evt), 5_000)
		})
	}
	static hizliBulIslemi(e = {}) {
		let { layout, tokens = e.parts ?? [] } = e
		let elms = layout.find('*')
		if (!elms.length)
			return
		let css_include = 'find-include', css_exclude = 'find-exclude'
		for (let css of [css_include, css_exclude]) {
			let elms = layout.find(`.${css}`)
			for (let i = 0; i < elms.length; i++) {
				let elm = elms.eq(i)
				for (let item of [elm, elm.parent()])
					item.removeClass(css)
			}
		}
		// elms = elms.filter(':not(:empty)')
		tokens = tokens
			.map(_ => _.toUpperCase())
			.filter(Boolean)
		let uygunlar = [], digerleri = []
		for (let i = 0; i < elms.length; i++) {
			let elm = elms.eq(i)
			let tagName = elm[0].tagName.toUpperCase()
			let uygunmu = !!tokens.length && (
				( tagName == 'INPUT' && !( elm.attr('type') == 'button' || elm.attr('type') == 'hidden' ) ) ||
				( tagName == 'TEXTAREA' || tagName == 'LABEL' || tagName == 'LI' ) ||
				( elm.hasClass('jqx-grid-cell') || elm.parents('.jqx-grid-cell').length ) ||
				( elm.hasClass('jqx-grid-group-cell') || elm.parents('.jqx-grid-group-cell').length )
			)
			
			let value
			if (uygunmu) {
				value = (elm.val() || elm.text())?.toString()?.toUpperCase() ?? ''
				uygunmu = !!value
			}
			if (uygunmu) {
				for (let token of tokens) {
					if (token && !value.includes(token)) {
						uygunmu = false
						break
					}
				}
			}
			elm.addClass(uygunmu ? css_include : css_exclude)
			if (uygunmu) {
				let tabPage_content = elm.parents('.content:not(.tabbedWindow.part)')
				let tabPanel = tabPage_content?.length
					? tabPage_content.parents('.skyTabs.part:not(#windows)')
					: null
				let tabPage_item = tabPanel?.length
					? tabPanel.find(`.tabs > .tabPage.nav-item:eq(${tabPage_content.index() - 1})`)
					: null
				if (tabPage_item?.length) {
					tabPage_item.addClass(css_include)
					tabPage_item.removeClass(css_exclude)
				}
			}
			(uygunmu ? uygunlar : digerleri).push(elm)
		}
		if (empty(uygunlar)) {
			for (let elm of digerleri)
			for (let item of [ elm, elm.parent() ])
				item.removeClass(`${css_include} ${css_exclude}`)
		}
		return { uygunlar, digerleri }
	}
	focus() {
		this.input?.focus()
		return this
	}
	onChange(e = {}) {
		let {degisinceEvent, value} = this
		if (degisinceEvent) {
			let tokens = value
				?.split(' ')
				?.map(x => x.trim())
				?.filter(Boolean)
			let _e = { ...e, sender: this, value, tokens }
			for (let handler of degisinceEvent)
				handler.call(this, _e)
		}
		return this
	}
	change(handler) {
		let { degisinceEvent } = this
		if (!degisinceEvent.includes(handler))
			degisinceEvent.push(handler)
		return this
	}
	degisince(handler) { return this.change(handler) }
	on(eventName, handler) {
		return eventName == 'change' ? this.change(handler) : this
	}
	off(eventName, handler) {
		if (eventName == 'change') {
			if (!handler)
				return change(handler)
			let { degisinceEvent } = this
			let ind = degisinceEvent.indexOf(handler) ?? -1
			if (ind > -1)
				degisinceEvent.splice(ind, 1)
		}
		return this
	}
}
